"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/db/mongodb";
import ProductModel from "@/lib/models/Product";
import CustomerModel from "@/lib/models/Customer";
import SaleModel from "@/lib/models/Sale";
import {
  MOCK_PRODUCTS,
  MOCK_CUSTOMERS,
  MOCK_SALES,
} from "@/lib/mock-data/textile-data";

/**
 * 1-Click Database Seeder
 * Populates MongoDB Atlas with realistic Indian Textile domain mock dataset.
 */
export async function seedDatabaseAction(): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    await connectToDatabase();

    // 1. Clear existing collections
    await ProductModel.deleteMany({});
    await CustomerModel.deleteMany({});
    await SaleModel.deleteMany({});

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
    const insertedProducts = await ProductModel.insertMany(productsToInsert);

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
      lastPurchaseDate: new Date(c.lastPurchaseDate),
    }));
    const insertedCustomers = await CustomerModel.insertMany(customersToInsert);

    // 4. Insert Sales Invoices
    const salesToInsert = MOCK_SALES.map((s, index) => ({
      invoiceNumber: s.invoiceNumber,
      customerId: insertedCustomers[index % insertedCustomers.length]._id.toString(),
      customerName: s.customerName,
      items: s.items.map((i) => ({
        productId: insertedProducts[0]._id.toString(),
        productName: i.productName,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        totalPrice: i.totalPrice,
      })),
      subtotalINR: s.subtotalINR,
      taxINR: s.taxINR,
      discountINR: s.discountINR,
      totalINR: s.totalINR,
      paymentMode: s.paymentMode,
      paymentStatus: s.paymentStatus,
      salesPerson: s.salesPerson,
    }));
    await SaleModel.insertMany(salesToInsert);

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
      message: `Successfully seeded MongoDB Atlas with ${insertedProducts.length} Products, ${insertedCustomers.length} Customers, and ${salesToInsert.length} Sales Invoices!`,
    };
  } catch (error: any) {
    console.error("Database seeding failed:", error);
    return {
      success: false,
      error: error.message || "Failed to seed MongoDB Atlas database",
    };
  }
}
