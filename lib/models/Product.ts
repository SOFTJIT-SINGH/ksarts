import mongoose, { Schema, Document, Model } from "mongoose";
import { ProductCategory } from "@/lib/types";

export interface IProductDocument extends Document {
  sku: string;
  name: string;
  category: ProductCategory;
  fabricType: string;
  weaveType: string;
  gsm?: number;
  color: string;
  unitPrice: number;
  mrp: number;
  stockQuantity: number;
  unitOfMeasure: "Meters" | "Pieces" | "Rolls";
  reorderLevel: number;
  supplierName: string;
  status: "In Stock" | "Low Stock" | "Out of Stock" | "Overstocked";
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProductDocument>(
  {
    sku: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: [
        "Silk Sarees",
        "Cotton Fabrics",
        "Dress Material",
        "Suiting & Shirting",
        "Linen Collection",
        "Designer Lehengas",
      ],
    },
    fabricType: { type: String, required: true },
    weaveType: { type: String, required: true },
    gsm: { type: Number },
    color: { type: String, required: true },
    unitPrice: { type: Number, required: true },
    mrp: { type: Number, required: true },
    stockQuantity: { type: Number, required: true, default: 0 },
    unitOfMeasure: {
      type: String,
      required: true,
      enum: ["Meters", "Pieces", "Rolls"],
      default: "Pieces",
    },
    reorderLevel: { type: Number, required: true, default: 10 },
    supplierName: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: ["In Stock", "Low Stock", "Out of Stock", "Overstocked"],
      default: "In Stock",
    },
  },
  { timestamps: true }
);

const ProductModel: Model<IProductDocument> =
  mongoose.models.Product || mongoose.model<IProductDocument>("Product", ProductSchema);

export default ProductModel;
