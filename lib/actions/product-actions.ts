"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/db/mongodb";
import ProductModel from "@/lib/models/Product";
import { Product } from "@/lib/types";

/**
 * Fetches all products from MongoDB Atlas.
 * Falls back to mock data if MongoDB is unreachable or empty.
 */
export async function getProductsAction(): Promise<{ success: boolean; data?: Product[]; error?: string }> {
  try {
    await connectToDatabase();
    const rawProducts = await ProductModel.find({}).sort({ createdAt: -1 }).lean();

    if (!rawProducts || rawProducts.length === 0) {
      return { success: true, data: [] };
    }

    const products: Product[] = rawProducts.map((doc: any) => ({
      id: doc._id.toString(),
      sku: doc.sku,
      name: doc.name,
      category: doc.category,
      fabricType: doc.fabricType,
      weaveType: doc.weaveType,
      gsm: doc.gsm,
      color: doc.color,
      unitPrice: doc.unitPrice,
      mrp: doc.mrp,
      stockQuantity: doc.stockQuantity,
      unitOfMeasure: doc.unitOfMeasure,
      reorderLevel: doc.reorderLevel,
      supplierName: doc.supplierName,
      status: doc.status,
      createdAt: doc.createdAt?.toISOString().split("T")[0] || new Date().toISOString().split("T")[0],
    }));

    return { success: true, data: products };
  } catch (error: any) {
    console.error("Error fetching products from MongoDB:", error);
    return { success: false, error: error.message || "Failed to fetch products" };
  }
}

/**
 * Creates a new Product in MongoDB Atlas.
 */
export async function createProductAction(productData: Partial<Product>): Promise<{ success: boolean; error?: string }> {
  try {
    await connectToDatabase();

    let status: Product["status"] = "In Stock";
    if (productData.stockQuantity === 0) {
      status = "Out of Stock";
    } else if (productData.stockQuantity && productData.reorderLevel && productData.stockQuantity <= productData.reorderLevel) {
      status = "Low Stock";
    }

    await ProductModel.create({
      sku: productData.sku,
      name: productData.name,
      category: productData.category,
      fabricType: productData.fabricType,
      weaveType: productData.weaveType,
      gsm: productData.gsm,
      color: productData.color,
      unitPrice: productData.unitPrice,
      mrp: productData.mrp,
      stockQuantity: productData.stockQuantity,
      unitOfMeasure: productData.unitOfMeasure,
      reorderLevel: productData.reorderLevel,
      supplierName: productData.supplierName,
      status,
    });

    revalidatePath("/products");
    revalidatePath("/inventory");
    revalidatePath("/");

    return { success: true };
  } catch (error: any) {
    console.error("Error creating product:", error);
    return { success: false, error: error.message || "Failed to create product" };
  }
}
