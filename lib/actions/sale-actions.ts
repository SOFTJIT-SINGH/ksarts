"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/db/mongodb";
import SaleModel from "@/lib/models/Sale";
import { SaleTransaction } from "@/lib/types";

/**
 * Fetches all sale invoices from MongoDB Atlas.
 */
export async function getSalesAction(): Promise<{ success: boolean; data?: SaleTransaction[]; error?: string }> {
  try {
    if (!process.env.MONGODB_URI) {
      console.warn("MONGODB_URI environment variable is not defined. Using mock data mode.");
      return { success: true, data: [] };
    }

    await connectToDatabase();
    const rawSales = await SaleModel.find({}).sort({ createdAt: -1 }).lean();

    if (!rawSales || rawSales.length === 0) {
      return { success: true, data: [] };
    }

    const sales: SaleTransaction[] = rawSales.map((doc: any) => ({
      id: doc._id.toString(),
      invoiceNumber: doc.invoiceNumber,
      customerId: doc.customerId,
      customerName: doc.customerName,
      items: doc.items.map((i: any) => ({
        productId: i.productId,
        productName: i.productName,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        totalPrice: i.totalPrice,
      })),
      subtotalINR: doc.subtotalINR,
      taxINR: doc.taxINR,
      discountINR: doc.discountINR,
      totalINR: doc.totalINR,
      paymentMode: doc.paymentMode,
      paymentStatus: doc.paymentStatus,
      salesPerson: doc.salesPerson,
      createdAt: doc.createdAt?.toISOString().replace("T", " ").substring(0, 16) || new Date().toISOString(),
    }));

    return { success: true, data: sales };
  } catch (error: any) {
    console.error("Error fetching sales from MongoDB:", error);
    return { success: false, error: error.message || "Failed to fetch sales" };
  }
}
