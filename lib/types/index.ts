export type UserRole = "admin" | "employee";

export type ProductCategory =
  | "Silk Sarees"
  | "Cotton Fabrics"
  | "Dress Material"
  | "Suiting & Shirting"
  | "Linen Collection"
  | "Designer Lehengas";

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
  discountINR: number;
  totalINR: number;
  paymentMode: "Cash" | "UPI" | "Bank Transfer" | "Credit Line";
  paymentStatus: "Paid" | "Pending" | "Partially Paid";
  salesPerson: string;
  createdAt: string;
}

export interface AIPredictionOverview {
  predictedNextMonthSalesINR: number;
  growthPercentage: number;
  highDemandCategory: ProductCategory;
  predictedDeadStockItemsCount: number;
  recommendedRestockCount: number;
}

export interface SalesForecastPoint {
  month: string;
  actualSalesINR: number;
  predictedSalesINR: number;
}

export interface DemandForecastItem {
  productId: string;
  productName: string;
  category: ProductCategory;
  currentStock: number;
  predictedDemandNext30Days: number;
  recommendedAction: "Restock Immediately" | "Maintain Stock" | "Discount / Clearance";
  confidenceScore: number; // percentage e.g. 92%
}
