"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase/client";
import { SaleTransaction } from "@/lib/types";

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
      discountINR: doc.discountINR,
      totalINR: doc.totalINR,
      paymentMode: doc.paymentMode,
      paymentStatus: doc.paymentStatus,
      salesPerson: doc.salesPerson,
      createdAt: doc.created_at?.replace("T", " ").substring(0, 16) || new Date().toISOString(),
    }));

    return { success: true, data: sales };
  } catch (error: any) {
    console.error("Error fetching sales from Supabase:", error);
    return { success: false, error: error.message || "Failed to fetch sales" };
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

    // 1. Insert into Sales
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
    const { data: insertedSale, error: saleError } = await supabase
      .from("sales")
      .insert([
        {
          invoiceNumber,
          customerId: saleData.customerId,
          customerName: saleData.customerName,
          subtotalINR: saleData.subtotalINR,
          taxINR: saleData.taxINR,
          discountINR: saleData.discountINR,
          totalINR: saleData.totalINR,
          paymentMode: saleData.paymentMode,
          paymentStatus: saleData.paymentStatus,
          salesPerson: saleData.salesPerson,
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
    if (itemsError) throw itemsError;

    // 3. Decrement Inventory & Update Product Status
    for (const item of saleData.items) {
      const { data: currentProduct } = await supabase
        .from("products")
        .select("stockQuantity, reorderLevel")
        .eq("id", item.productId)
        .single();
        
      if (currentProduct) {
        const newStock = Math.max(0, currentProduct.stockQuantity - item.quantity);
        let newStatus = "In Stock";
        if (newStock === 0) newStatus = "Out of Stock";
        else if (newStock <= currentProduct.reorderLevel) newStatus = "Low Stock";

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
        let newOutstanding = currentCustomer.outstandingBalanceINR;
        if (saleData.paymentStatus !== "Paid") {
          newOutstanding += saleData.totalINR;
        }

        await supabase
          .from("customers")
          .update({
            totalPurchasesINR: currentCustomer.totalPurchasesINR + saleData.totalINR,
            totalOrdersCount: currentCustomer.totalOrdersCount + 1,
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
    return { success: false, error: error.message || "Failed to create sale invoice" };
  }
}
