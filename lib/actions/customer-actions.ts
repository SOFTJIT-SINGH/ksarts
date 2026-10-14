"use server";

import { revalidatePath } from "next/cache";
import { friendlyDbError } from "@/lib/errors";
import { supabase } from "@/lib/supabase/client";
import { Customer } from "@/lib/types";
import { getCurrentUserAction } from "@/lib/actions/auth-actions";

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
    return { success: false, error: friendlyDbError(error, "Failed to fetch customers") };
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

    const current = await getCurrentUserAction();
    if (!current.success || current.user?.role !== "admin") {
      return { success: false, error: "Only the Admin can manage customers." };
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
    return { success: false, error: friendlyDbError(error, "Failed to create customer") };
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

    const current = await getCurrentUserAction();
    if (!current.success || current.user?.role !== "admin") {
      return { success: false, error: "Only the Admin can manage customers." };
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
    return { success: false, error: friendlyDbError(error, "Failed to update customer") };
  }
}

/**
 * Records a payment received from a customer against their outstanding balance.
 *
 * Payments are applied to the oldest unpaid invoices first (FIFO). The amount
 * already paid across a customer's unpaid invoices is derived as
 * (sum of unpaid invoice totals) - (new outstanding balance), so no extra
 * table/column is needed: invoices flip to "Paid" / "Partially Paid" automatically.
 */
export async function recordCustomerPaymentAction(
  customerId: string,
  amount: number
): Promise<{ success: boolean; error?: string; remaining?: number; settledInvoices?: number }> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return { success: false, error: "NEXT_PUBLIC_SUPABASE_URL is not configured." };
    }

    const current = await getCurrentUserAction();
    if (!current.success || current.user?.role !== "admin") {
      return { success: false, error: "Only the Admin can record customer payments." };
    }

    const pay = Math.round(Number(amount) * 100) / 100;
    if (!Number.isFinite(pay) || pay <= 0) {
      return { success: false, error: "Enter a payment amount greater than 0." };
    }

    const { data: customer, error: cErr } = await supabase
      .from("customers")
      .select("outstandingBalanceINR")
      .eq("id", customerId)
      .single();
    if (cErr || !customer) {
      return { success: false, error: "Customer not found in the database." };
    }

    const outstanding = Number(customer.outstandingBalanceINR) || 0;
    if (outstanding <= 0) {
      return { success: false, error: "This customer has no outstanding balance." };
    }
    if (pay > outstanding + 0.005) {
      return { success: false, error: `Payment exceeds the outstanding balance (₹${outstanding.toLocaleString("en-IN")}).` };
    }

    const newOutstanding = Math.max(0, Math.round((outstanding - pay) * 100) / 100);

    const { error: updErr } = await supabase
      .from("customers")
      .update({ outstandingBalanceINR: newOutstanding, updated_at: new Date().toISOString() })
      .eq("id", customerId);
    if (updErr) throw updErr;

    // Allocate to oldest unpaid invoices
    const { data: unpaid } = await supabase
      .from("sales")
      .select("id, totalINR, paymentStatus")
      .eq("customerId", customerId)
      .neq("paymentStatus", "Paid")
      .order("created_at", { ascending: true });

    let settled = 0;
    if (unpaid && unpaid.length > 0) {
      const pendingTotal = unpaid.reduce((sum, s) => sum + Number(s.totalINR), 0);
      let credit = newOutstanding === 0 ? pendingTotal : Math.max(0, pendingTotal - newOutstanding);

      for (const inv of unpaid) {
        const total = Number(inv.totalINR);
        let nextStatus: string | null = null;
        if (credit >= total - 0.005) {
          nextStatus = "Paid";
          credit -= total;
          settled += 1;
        } else if (credit > 0) {
          nextStatus = "Partially Paid";
          credit = 0;
        }
        if (nextStatus && nextStatus !== inv.paymentStatus) {
          await supabase
            .from("sales")
            .update({ paymentStatus: nextStatus, updated_at: new Date().toISOString() })
            .eq("id", inv.id);
        }
      }
    }

    revalidatePath("/customers");
    revalidatePath("/sales");
    revalidatePath("/");

    return { success: true, remaining: newOutstanding, settledInvoices: settled };
  } catch (error: any) {
    console.error("Error recording payment:", error);
    return { success: false, error: friendlyDbError(error, "Failed to record payment") };
  }
}
