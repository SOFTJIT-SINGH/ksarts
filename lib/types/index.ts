export type UserRole = "admin" | "employee";

export type ProductCategory =
  | "Silk Sarees"
  | "Cotton Fabrics"
  | "Dress Material"
  | "Suiting & Shirting"
  | "Linen Collection"
  | "Designer Lehengas"
  | "Dupattas & Stoles";

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: ProductCategory;
  fabricType: string;
  weaveType: string;
  gsm?: number;
  color: string;
  unitPrice: number; // Wholesale price in INR ₹
  mrp: number; // Retail price in INR ₹
  stockQuantity: number; // meters or pieces
  unitOfMeasure: "Meters" | "Pieces" | "Rolls";
  reorderLevel: number;
  supplierName: string;
  imageUrl?: string | null;
  status: "In Stock" | "Low Stock" | "Out of Stock" | "Overstocked";
  createdAt: string;
}

export type CustomerSegment = "VIP Wholesaler" | "Regular Retailer" | "Occasional Buyer" | "At-Risk";

export interface Customer {
  id: string;
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
  lastPurchaseDate: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface SaleTransaction {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  items: SaleItem[];
  subtotalINR: number;
  taxINR: number;
  cgstINR?: number;
  sgstINR?: number;
  igstINR?: number;
  discountINR: number;
  totalINR: number;
  paymentMode: "Cash" | "UPI" | "Bank Transfer" | "Credit Line";
  paymentStatus: "Paid" | "Pending" | "Partially Paid";
  salesPerson: string;
  createdAt: string;
}

export interface SalesForecastPoint {
  month: string;
  actualSalesINR: number | null; // null for the future forecast month
  predictedSalesINR: number | null; // null when there is not enough history for a trend
}

export interface DemandForecastItem {
  productId: string;
  productName: string;
  stockQuantity: number;
  predictedDemandNext30Days: number;
  recommendedAction: "Restock Immediately" | "Monitor Inventory" | "Maintain Stock" | "Discount / Clearance";
}

export interface BundleRecommendation {
  id: string;
  items: string[];
  description: string;
  confidence: number;
  lift: number;
}
