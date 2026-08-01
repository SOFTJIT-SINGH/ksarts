"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase/client";
import {
  MOCK_PRODUCTS,
  MOCK_CUSTOMERS,
  MOCK_SALES,
} from "@/lib/mock-data/textile-data";

/**
 * 1-Click Database Seeder
 * Populates Supabase Postgres with realistic Indian Textile domain mock dataset.
 */
export async function seedDatabaseAction(): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return { success: false, error: "NEXT_PUBLIC_SUPABASE_URL is not configured." };
    }

    // 1. Clear existing collections (due to FK cascades, deleting from products/customers/sales deletes everything)
    await supabase.from("sale_items").delete().neq("id", "00000000-0000-0000-0000-000000000000"); // trick to delete all
    await supabase.from("sales").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("customers").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("products").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    // 2. Insert Products
    const productsToInsert = MOCK_PRODUCTS.map((p) => ({
      sku: p.sku,
      name: p.name,
      category: p.category,
      fabricType: p.fabricType,
      weaveType: p.weaveType,
      gsm: p.gsm,
      color: p.color,
      unitPrice: p.unitPrice,
      mrp: p.mrp,
      stockQuantity: p.stockQuantity,
      unitOfMeasure: p.unitOfMeasure,
      reorderLevel: p.reorderLevel,
      supplierName: p.supplierName,
      status: p.status,
    }));
    const { data: insertedProducts, error: pError } = await supabase
      .from("products")
      .insert(productsToInsert)
      .select();

    if (pError || !insertedProducts) throw pError || new Error("Failed to insert products");

    // 3. Insert Customers
    const customersToInsert = MOCK_CUSTOMERS.map((c) => ({
      name: c.name,
      businessName: c.businessName,
      phone: c.phone,
      email: c.email,
      city: c.city,
      segment: c.segment,
      totalPurchasesINR: c.totalPurchasesINR,
      totalOrdersCount: c.totalOrdersCount,
      creditLimitINR: c.creditLimitINR,
      outstandingBalanceINR: c.outstandingBalanceINR,
      lastPurchaseDate: new Date(c.lastPurchaseDate).toISOString(),
    }));
    const { data: insertedCustomers, error: cError } = await supabase
      .from("customers")
      .insert(customersToInsert)
      .select();

    if (cError || !insertedCustomers) throw cError || new Error("Failed to insert customers");

    // 4. Insert Sales Invoices
    const salesToInsert = MOCK_SALES.map((s, index) => ({
      invoiceNumber: s.invoiceNumber,
      customerId: insertedCustomers[index % insertedCustomers.length].id,
      customerName: s.customerName,
      subtotalINR: s.subtotalINR,
      taxINR: s.taxINR,
      discountINR: s.discountINR,
      totalINR: s.totalINR,
      paymentMode: s.paymentMode,
      paymentStatus: s.paymentStatus,
      salesPerson: s.salesPerson,
    }));
    
    const { data: insertedSales, error: sError } = await supabase
      .from("sales")
      .insert(salesToInsert)
      .select();

    if (sError || !insertedSales) throw sError || new Error("Failed to insert sales");

    // 5. Insert Sale Items
    const saleItemsToInsert = [];
    for (let i = 0; i < MOCK_SALES.length; i++) {
      const mockSale = MOCK_SALES[i];
      const saleId = insertedSales[i].id;
      
      for (const item of mockSale.items) {
        saleItemsToInsert.push({
          saleId: saleId,
          productId: insertedProducts[0].id, // fallback to first product
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
        });
      }
    }

    const { error: siError } = await supabase.from("sale_items").insert(saleItemsToInsert);
    if (siError) throw siError;

    // Revalidate view paths
    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/customers");
    revalidatePath("/sales");
    revalidatePath("/inventory");
    revalidatePath("/ai-insights");
    revalidatePath("/settings");

    return {
      success: true,
      message: `Successfully seeded Supabase Postgres with ${insertedProducts.length} Products, ${insertedCustomers.length} Customers, and ${insertedSales.length} Sales Invoices!`,
    };
  } catch (error: any) {
    console.error("Database seeding failed:", error);
    return {
      success: false,
      error: error.message || "Failed to seed Supabase database",
    };
  }
}
