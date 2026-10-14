"use server";

import { revalidatePath } from "next/cache";
import { friendlyDbError } from "@/lib/errors";
import { supabase } from "@/lib/supabase/client";
import { createClient } from "@/lib/supabase/server";
import { SaleTransaction } from "@/lib/types";
import { computeStockStatus } from "@/lib/pricing";

// created_at is stored in UTC; the shop works in IST (UTC+5:30). Returns "YYYY-MM-DD HH:mm".
function formatIST(iso?: string | null): string {
  const d = iso ? new Date(iso) : new Date();
  const ist = new Date(d.getTime() + 5.5 * 60 * 60 * 1000);
  return ist.toISOString().replace("T", " ").substring(0, 16);
}

/**
 * Fetches all sale invoices from Supabase PostgreSQL.
 */
export async function getSalesAction(): Promise<{ success: boolean; data?: SaleTransaction[]; error?: string }> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.warn("NEXT_PUBLIC_SUPABASE_URL environment variable is not defined. Using mock data mode.");
      return { success: true, data: [] };
    }

    // Fetch sales and join with sale_items using Supabase's nested select
    const { data: rawSales, error } = await supabase
      .from("sales")
      .select(`
        *,
        items:sale_items(*)
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;

    if (!rawSales || rawSales.length === 0) {
      return { success: true, data: [] };
    }

    const sales: SaleTransaction[] = rawSales.map((doc: any) => ({
      id: doc.id,
      invoiceNumber: doc.invoiceNumber,
      customerId: doc.customerId,
      customerName: doc.customerName,
      items: doc.items?.map((i: any) => ({
        productId: i.productId,
        productName: i.productName,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        totalPrice: i.totalPrice,
      })) || [],
      subtotalINR: doc.subtotalINR,
      taxINR: doc.taxINR,
      cgstINR: doc.cgstINR,
      sgstINR: doc.sgstINR,
      igstINR: doc.igstINR,
      discountINR: doc.discountINR,
      totalINR: doc.totalINR,
      paymentMode: doc.paymentMode,
      paymentStatus: doc.paymentStatus,
      salesPerson: doc.salesPerson,
      createdAt: formatIST(doc.created_at),
    }));

    return { success: true, data: sales };
  } catch (error: any) {
    console.error("Error fetching sales from Supabase:", error);
    return { success: false, error: friendlyDbError(error, "Failed to fetch sales") };
  }
}

/**
 * Creates a new sale invoice in Supabase.
 * - Inserts into 'sales'
 * - Inserts into 'sale_items'
 * - Decrements 'stockQuantity' in 'products'
 * - Updates 'totalPurchasesINR' in 'customers'
 */
export async function createSaleAction(saleData: any): Promise<{ success: boolean; error?: string }> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return { success: false, error: "NEXT_PUBLIC_SUPABASE_URL is not configured." };
    }

    // Derive salesPerson from authenticated session (server-side, not trusted from client)
    let salesPerson = saleData.salesPerson || "Khushi Soni";
    try {
      const serverClient = await createClient();
      const { data: { user } } = await serverClient.auth.getUser();
      if (user?.user_metadata?.full_name) {
        salesPerson = user.user_metadata.full_name;
      }
    } catch {
      // fallback to whatever was passed
    }

    // --- Validate before touching the database ---
    if (!saleData.customerId) return { success: false, error: "Please select a customer." };
    if (!Array.isArray(saleData.items) || saleData.items.length === 0) {
      return { success: false, error: "Add at least one item to the invoice." };
    }
    const requested = new Map<string, number>();
    for (const item of saleData.items) {
      const qty = Number(item.quantity);
      if (!item.productId || !Number.isInteger(qty) || qty <= 0) {
        return { success: false, error: "Every item needs a product and a whole-number quantity above 0." };
      }
      requested.set(item.productId, (requested.get(item.productId) || 0) + qty);
    }
    for (const [productId, qty] of requested) {
      const { data: p } = await supabase
        .from("products")
        .select("name, stockQuantity, unitOfMeasure")
        .eq("id", productId)
        .single();
      if (!p) return { success: false, error: "A selected product no longer exists." };
      if (qty > Number(p.stockQuantity)) {
        return {
          success: false,
          error: `Only ${p.stockQuantity} ${p.unitOfMeasure} of "${p.name}" in stock (requested ${qty}).`,
        };
      }
    }

    // 1. Insert into Sales (date + random suffix keeps invoice numbers unique)
    const now = new Date();
    const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
    const invoiceNumber = `INV-${datePart}-${Math.floor(1000 + Math.random() * 9000)}`;
    const { data: insertedSale, error: saleError } = await supabase
      .from("sales")
      .insert([
        {
          invoiceNumber,
          customerId: saleData.customerId,
          customerName: saleData.customerName,
          subtotalINR: saleData.subtotalINR,
          taxINR: saleData.taxINR,
          cgstINR: saleData.cgstINR || 0,
          sgstINR: saleData.sgstINR || 0,
          igstINR: saleData.igstINR || 0,
          discountINR: saleData.discountINR,
          totalINR: saleData.totalINR,
          paymentMode: saleData.paymentMode,
          paymentStatus: saleData.paymentStatus,
          salesPerson,
        }
      ])
      .select()
      .single();

    if (saleError) throw saleError;
    const saleId = insertedSale.id;

    // 2. Insert Sale Items
    const itemsToInsert = saleData.items.map((item: any) => ({
      saleId,
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
    }));

    const { error: itemsError } = await supabase.from("sale_items").insert(itemsToInsert);
    if (itemsError) {
      // Do not leave an orphan invoice behind
      await supabase.from("sales").delete().eq("id", saleId);
      throw itemsError;
    }

    // 3. Decrement Inventory & Update Product Status
    for (const item of saleData.items) {
      const { data: currentProduct } = await supabase
        .from("products")
        .select("stockQuantity, reorderLevel")
        .eq("id", item.productId)
        .single();
        
      if (currentProduct) {
        const newStock = Math.max(0, Number(currentProduct.stockQuantity) - item.quantity);
        const newStatus = computeStockStatus(newStock, Number(currentProduct.reorderLevel));

        await supabase
          .from("products")
          .update({ stockQuantity: newStock, status: newStatus })
          .eq("id", item.productId);
      }
    }

    // 4. Update Customer totals
    if (saleData.customerId) {
      const { data: currentCustomer } = await supabase
        .from("customers")
        .select("totalPurchasesINR, totalOrdersCount, outstandingBalanceINR")
        .eq("id", saleData.customerId)
        .single();

      if (currentCustomer) {
        let newOutstanding = Number(currentCustomer.outstandingBalanceINR) || 0;
        if (saleData.paymentStatus === "Pending") {
          newOutstanding += saleData.totalINR;
        } else if (saleData.paymentStatus === "Partially Paid") {
          const received = Math.min(Math.max(Number(saleData.amountReceived) || 0, 0), saleData.totalINR);
          newOutstanding += saleData.totalINR - received;
        }

        await supabase
          .from("customers")
          .update({
            totalPurchasesINR: Number(currentCustomer.totalPurchasesINR) + saleData.totalINR,
            totalOrdersCount: Number(currentCustomer.totalOrdersCount) + 1,
            outstandingBalanceINR: newOutstanding,
            lastPurchaseDate: new Date().toISOString(),
          })
          .eq("id", saleData.customerId);
      }
    }

    revalidatePath("/sales");
    revalidatePath("/inventory");
    revalidatePath("/products");
    revalidatePath("/customers");
    revalidatePath("/");

    return { success: true };
  } catch (error: any) {
    console.error("Error creating sale:", error);
    return { success: false, error: friendlyDbError(error, "Failed to create sale invoice") };
  }
}
