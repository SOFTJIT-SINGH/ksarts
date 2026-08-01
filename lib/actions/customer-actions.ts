"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase/client";
import { Customer } from "@/lib/types";

/**
 * Fetches all customer accounts from Supabase PostgreSQL.
 */
export async function getCustomersAction(): Promise<{ success: boolean; data?: Customer[]; error?: string }> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.warn("NEXT_PUBLIC_SUPABASE_URL environment variable is not defined. Using mock data mode.");
      return { success: true, data: [] };
    }

    const { data: rawCustomers, error } = await supabase
      .from("customers")
      .select("*")
      .order("totalPurchasesINR", { ascending: false });

    if (error) throw error;

    if (!rawCustomers || rawCustomers.length === 0) {
      return { success: true, data: [] };
    }

    const customers: Customer[] = rawCustomers.map((doc: any) => ({
      id: doc.id,
      name: doc.name,
      businessName: doc.businessName,
      phone: doc.phone,
      email: doc.email,
      city: doc.city,
      segment: doc.segment,
      totalPurchasesINR: doc.totalPurchasesINR,
      totalOrdersCount: doc.totalOrdersCount,
      creditLimitINR: doc.creditLimitINR,
      outstandingBalanceINR: doc.outstandingBalanceINR,
      lastPurchaseDate: doc.lastPurchaseDate?.split("T")[0] || new Date().toISOString().split("T")[0],
    }));

    return { success: true, data: customers };
  } catch (error: any) {
    console.error("Error fetching customers from Supabase:", error);
    return { success: false, error: error.message || "Failed to fetch customers" };
  }
}
