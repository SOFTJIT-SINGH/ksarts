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

/**
 * Creates a new customer account in Supabase PostgreSQL.
 */
export async function createCustomerAction(customerData: Partial<Customer>): Promise<{ success: boolean; error?: string }> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return { success: false, error: "NEXT_PUBLIC_SUPABASE_URL is not configured." };
    }

    const { error } = await supabase.from("customers").insert([
      {
        name: customerData.name,
        businessName: customerData.businessName,
        phone: customerData.phone,
        email: customerData.email,
        city: customerData.city,
        segment: customerData.segment || "Regular Retailer",
        creditLimitINR: customerData.creditLimitINR || 100000,
        totalPurchasesINR: 0,
        totalOrdersCount: 0,
        outstandingBalanceINR: 0,
      }
    ]);

    if (error) throw error;

    revalidatePath("/customers");
    revalidatePath("/");

    return { success: true };
  } catch (error: any) {
    console.error("Error creating customer:", error);
    return { success: false, error: error.message || "Failed to create customer" };
  }
}

/**
 * Updates an existing customer account in Supabase PostgreSQL.
 */
export async function updateCustomerAction(id: string, customerData: Partial<Customer>): Promise<{ success: boolean; error?: string }> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return { success: false, error: "NEXT_PUBLIC_SUPABASE_URL is not configured." };
    }

    const { error } = await supabase
      .from("customers")
      .update({
        name: customerData.name,
        businessName: customerData.businessName,
        phone: customerData.phone,
        email: customerData.email,
        city: customerData.city,
        segment: customerData.segment,
        creditLimitINR: customerData.creditLimitINR,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/customers");
    revalidatePath("/");

    return { success: true };
  } catch (error: any) {
    console.error("Error updating customer:", error);
    return { success: false, error: error.message || "Failed to update customer" };
  }
}
