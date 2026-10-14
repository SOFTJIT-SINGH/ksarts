"use server";

import { revalidatePath } from "next/cache";
import { friendlyDbError } from "@/lib/errors";
import { supabase } from "@/lib/supabase/client";
import { Product } from "@/lib/types";
import { computeStockStatus } from "@/lib/pricing";

/**
 * Fetches all products from Supabase PostgreSQL.
 * Falls back to mock data if NEXT_PUBLIC_SUPABASE_URL is not set.
 */
export async function getProductsAction(): Promise<{ success: boolean; data?: Product[]; error?: string }> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.warn("NEXT_PUBLIC_SUPABASE_URL is not defined. Using mock data mode.");
      return { success: true, data: [] };
    }

    const { data: rawProducts, error } = await supabase
      .from("products")
      .select("*")
      // Seeded rows share one created_at, so a second sort key keeps row order
      // stable between refreshes (otherwise a restocked row "jumps" to another product).
      .order("created_at", { ascending: false })
      .order("sku", { ascending: true });

    if (error) throw error;

    if (!rawProducts || rawProducts.length === 0) {
      return { success: true, data: [] };
    }

    const products: Product[] = rawProducts.map((doc: any) => ({
      id: doc.id,
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
      // derive from live numbers so a stale/mis-seeded status column can never contradict the stock
      status: computeStockStatus(Number(doc.stockQuantity), Number(doc.reorderLevel)),
      imageUrl: doc.image_url,
      createdAt: doc.created_at?.split("T")[0] || new Date().toISOString().split("T")[0],
    }));

    return { success: true, data: products };
  } catch (error: any) {
    console.error("Error fetching products from Supabase:", error);
    return { success: false, error: friendlyDbError(error, "Failed to fetch products") };
  }
}

/**
 * Creates a new Product in Supabase PostgreSQL, including optional image upload to Supabase Storage.
 */
export async function createProductAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return { success: false, error: "NEXT_PUBLIC_SUPABASE_URL is not configured." };
    }

    // Extract basic fields
    const sku = formData.get("sku") as string;
    const name = formData.get("name") as string;
    const category = formData.get("category") as Product["category"];
    const fabricType = formData.get("fabricType") as string;
    const weaveType = formData.get("weaveType") as string;
    const gsm = Number(formData.get("gsm")) || 0;
    const color = formData.get("color") as string;
    const unitPrice = Number(formData.get("unitPrice")) || 0;
    const mrp = Number(formData.get("mrp")) || 0;
    const stockQuantity = Number(formData.get("stockQuantity")) || 0;
    const unitOfMeasure = formData.get("unitOfMeasure") as Product["unitOfMeasure"] || "Pieces";
    const reorderLevel = Number(formData.get("reorderLevel")) || 0;
    const supplierName = formData.get("supplierName") as string;
    
    // Handle image upload if present
    const imageFile = formData.get("image") as File | null;
    let imageUrl: string | null = null;

    if (imageFile && imageFile.size > 0) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${sku}-${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("fabric-images")
        .upload(fileName, imageFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        // We won't throw here, just proceed without image if bucket doesn't exist
      } else if (uploadData) {
        const { data: publicUrlData } = supabase.storage
          .from("fabric-images")
          .getPublicUrl(fileName);
        imageUrl = publicUrlData.publicUrl;
      }
    }

    if (!sku || !name) {
      return { success: false, error: "SKU and product name are required." };
    }
    if (unitPrice <= 0 || mrp <= 0) {
      return { success: false, error: "Wholesale price and MRP must be greater than 0." };
    }
    if (mrp < unitPrice) {
      return { success: false, error: "Retail MRP cannot be lower than the wholesale price." };
    }
    if (stockQuantity < 0) {
      return { success: false, error: "Stock quantity cannot be negative." };
    }

    const status = computeStockStatus(stockQuantity, reorderLevel);

    const { error } = await supabase.from("products").insert([
      {
        sku,
        name,
        category,
        fabricType,
        weaveType,
        gsm,
        color,
        unitPrice,
        mrp,
        stockQuantity,
        unitOfMeasure,
        reorderLevel,
        supplierName,
        status,
        image_url: imageUrl, // Assumes column in DB is 'image_url' (or we can just skip if we haven't altered schema, wait, let's use image_url and alter schema if needed)
      }
    ]);

    if (error) {
      if (error.code === "23505") {
        return { success: false, error: `SKU "${sku}" already exists. Use a unique SKU code.` };
      }
      throw error;
    }

    revalidatePath("/products");
    revalidatePath("/inventory");
    revalidatePath("/");

    return { success: true };
  } catch (error: any) {
    console.error("Error creating product:", error);
    return { success: false, error: friendlyDbError(error, "Failed to create product") };
  }
}

/**
 * Updates a product's stock quantity (Restock)
 */
export async function updateProductStockAction(
  id: string,
  additionalQuantity: number
): Promise<{ success: boolean; error?: string; newQuantity?: number }> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return { success: false, error: "NEXT_PUBLIC_SUPABASE_URL is not configured." };
    }

    const added = Number(additionalQuantity);
    if (!Number.isInteger(added) || added <= 0) {
      return { success: false, error: "Restock quantity must be a whole number greater than 0." };
    }

    // Read the CURRENT stock from the database (never trust the number shown in the UI)
    const { data: currentProduct, error: fetchError } = await supabase
      .from("products")
      .select("stockQuantity, reorderLevel")
      .eq("id", id)
      .single();

    if (fetchError || !currentProduct) {
      return {
        success: false,
        error: "Product not found in the database. Seed the database from Settings first (demo rows cannot be restocked).",
      };
    }

    // Number() guards against NUMERIC/string values coming back from PostgREST ("45" + 2 = "452")
    const newQuantity = Number(currentProduct.stockQuantity) + added;

    const { error } = await supabase
      .from("products")
      .update({
        stockQuantity: newQuantity,
        status: computeStockStatus(newQuantity, Number(currentProduct.reorderLevel)),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/inventory");
    revalidatePath("/products");
    revalidatePath("/");

    return { success: true, newQuantity };
  } catch (error: any) {
    console.error("Error updating stock:", error);
    return { success: false, error: friendlyDbError(error, "Failed to update stock") };
  }
}
