import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ISaleDocument extends Document {
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  items: ISaleItem[];
  subtotalINR: number;
  taxINR: number;
  discountINR: number;
  totalINR: number;
  paymentMode: "Cash" | "UPI" | "Bank Transfer" | "Credit Line";
  paymentStatus: "Paid" | "Pending" | "Partially Paid";
  salesPerson: string;
  createdAt: Date;
  updatedAt: Date;
}

const SaleItemSchema = new Schema<ISaleItem>({
  productId: { type: String, required: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
});

const SaleSchema = new Schema<ISaleDocument>(
  {
    invoiceNumber: { type: String, required: true, unique: true, index: true },
    customerId: { type: String, required: true },
    customerName: { type: String, required: true },
    items: [SaleItemSchema],
    subtotalINR: { type: Number, required: true },
    taxINR: { type: Number, required: true },
    discountINR: { type: Number, default: 0 },
    totalINR: { type: Number, required: true },
    paymentMode: {
      type: String,
      required: true,
      enum: ["Cash", "UPI", "Bank Transfer", "Credit Line"],
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ["Paid", "Pending", "Partially Paid"],
      default: "Paid",
    },
    salesPerson: { type: String, required: true },
  },
  { timestamps: true }
);

const SaleModel: Model<ISaleDocument> =
  mongoose.models.Sale || mongoose.model<ISaleDocument>("Sale", SaleSchema);

export default SaleModel;
