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
