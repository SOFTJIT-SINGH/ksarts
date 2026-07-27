"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/db/mongodb";
import CustomerModel from "@/lib/models/Customer";
import { Customer } from "@/lib/types";

/**
 * Fetches all customer accounts from MongoDB Atlas.
 */
export async function getCustomersAction(): Promise<{ success: boolean; data?: Customer[]; error?: string }> {
  try {
    await connectToDatabase();
    const rawCustomers = await CustomerModel.find({}).sort({ totalPurchasesINR: -1 }).lean();

    if (!rawCustomers || rawCustomers.length === 0) {
      return { success: true, data: [] };
    }

    const customers: Customer[] = rawCustomers.map((doc: any) => ({
      id: doc._id.toString(),
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
      lastPurchaseDate: doc.lastPurchaseDate?.toISOString().split("T")[0] || new Date().toISOString().split("T")[0],
    }));

    return { success: true, data: customers };
  } catch (error: any) {
    console.error("Error fetching customers from MongoDB:", error);
    return { success: false, error: error.message || "Failed to fetch customers" };
  }
}
