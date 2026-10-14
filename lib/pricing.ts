import type { Product } from "@/lib/types";

/**
 * Indian textile GST slab used across the app (invoice builder + price breakdown):
 * 5% when the per-unit price is below ₹1000, otherwise 12%.
 */
export function getGstRate(unitPrice: number): number {
  return unitPrice < 1000 ? 0.05 : 0.12;
}

export interface PriceBreakdown {
  gstRatePercent: number;
  wholesalePrice: number;
  gstAmount: number;
  cgst: number;
  sgst: number;
  wholesaleInclGst: number;
  mrp: number;
  marginPerUnit: number;
  marginPercent: number;
  stockQuantity: number;
  stockValueWholesale: number;
  stockValueMrp: number;
  potentialProfit: number;
}

export function getPriceBreakdown(product: Pick<Product, "unitPrice" | "mrp" | "stockQuantity">): PriceBreakdown {
  const rate = getGstRate(product.unitPrice);
  const gstAmount = product.unitPrice * rate;
  const marginPerUnit = product.mrp - product.unitPrice;
  return {
    gstRatePercent: rate * 100,
    wholesalePrice: product.unitPrice,
    gstAmount,
    cgst: gstAmount / 2,
    sgst: gstAmount / 2,
    wholesaleInclGst: product.unitPrice + gstAmount,
    mrp: product.mrp,
    marginPerUnit,
    marginPercent: product.unitPrice > 0 ? (marginPerUnit / product.unitPrice) * 100 : 0,
    stockQuantity: product.stockQuantity,
    stockValueWholesale: product.unitPrice * product.stockQuantity,
    stockValueMrp: product.mrp * product.stockQuantity,
    potentialProfit: marginPerUnit * product.stockQuantity,
  };
}

export function computeStockStatus(quantity: number, reorderLevel: number): Product["status"] {
  if (quantity <= 0) return "Out of Stock";
  if (quantity <= reorderLevel) return "Low Stock";
  return "In Stock";
}
