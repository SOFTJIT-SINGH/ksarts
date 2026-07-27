import mongoose, { Schema, Document, Model } from "mongoose";
import { CustomerSegment } from "@/lib/types";

export interface ICustomerDocument extends Document {
  name: string;
  businessName: string;
  phone: string;
  email: string;
  city: string;
  segment: CustomerSegment;
  totalPurchasesINR: number;
  totalOrdersCount: number;
  creditLimitINR: number;
  outstandingBalanceINR: number;
  lastPurchaseDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomerDocument>(
  {
    name: { type: String, required: true },
    businessName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    city: { type: String, required: true },
    segment: {
      type: String,
      required: true,
      enum: ["VIP Wholesaler", "Regular Retailer", "Occasional Buyer", "At-Risk"],
      default: "Regular Retailer",
    },
    totalPurchasesINR: { type: Number, default: 0 },
    totalOrdersCount: { type: Number, default: 0 },
    creditLimitINR: { type: Number, default: 100000 },
    outstandingBalanceINR: { type: Number, default: 0 },
    lastPurchaseDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const CustomerModel: Model<ICustomerDocument> =
  mongoose.models.Customer || mongoose.model<ICustomerDocument>("Customer", CustomerSchema);

export default CustomerModel;
