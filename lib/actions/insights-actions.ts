"use server";

import { supabase } from "@/lib/supabase/client";
import { friendlyDbError } from "@/lib/errors";

// Everything on the dashboard / AI page that used to be hard-coded is computed here from the
// real tables (products, sales, sale_items, customers).

export interface MonthlyRevenue {
  key: string; // "YYYY-MM" (IST)
  label: string; // "Oct 26"
  revenueINR: number;
  invoices: number;
}

export interface BusinessInsights {
  success: boolean;
  error?: string;
  monthly: MonthlyRevenue[];
  /** % change of the latest month vs the previous month, null when there is no previous month */
  growthPercentage: number | null;
  /** Month-on-month label such as "Oct 26 vs Sep 26" */
  growthLabel: string | null;
  topCategory: string | null;
  topCategoryShare: number | null; // 0-100
  restockCount: number;
  deadStockCount: number;
  deadStockWindowDays: number;
  totalRevenueINR: number;
  totalInvoices: number;
}

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const DEAD_STOCK_DAYS = 60;

function istMonthKey(iso: string): string {
  return new Date(new Date(iso).getTime() + IST_OFFSET_MS).toISOString().substring(0, 7);
}

function monthLabel(key: string): string {
  return new Date(`${key}-01T00:00:00Z`).toLocaleString("en-IN", {
    month: "short",
    year: "2-digit",
    timeZone: "UTC",
  });
}

const EMPTY: BusinessInsights = {
  success: true,
  monthly: [],
  growthPercentage: null,
  growthLabel: null,
  topCategory: null,
  topCategoryShare: null,
  restockCount: 0,
  deadStockCount: 0,
  deadStockWindowDays: DEAD_STOCK_DAYS,
  totalRevenueINR: 0,
  totalInvoices: 0,
};

export async function getBusinessInsightsAction(): Promise<BusinessInsights> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return EMPTY;

    const [salesRes, itemsRes, productsRes] = await Promise.all([
      supabase.from("sales").select("id, totalINR, created_at"),
      supabase.from("sale_items").select("saleId, productId, totalPrice"),
      supabase.from("products").select("id, category, stockQuantity, reorderLevel"),
    ]);

    const firstError = salesRes.error || itemsRes.error || productsRes.error;
    if (firstError) throw firstError;

    const sales = salesRes.data ?? [];
    const items = itemsRes.data ?? [];
    const products = productsRes.data ?? [];

    // ---- monthly revenue ----
    const byMonth = new Map<string, { revenue: number; invoices: number }>();
    const saleDate = new Map<string, string>();
    for (const s of sales) {
      saleDate.set(s.id, s.created_at);
      const key = istMonthKey(s.created_at);
      const cur = byMonth.get(key) ?? { revenue: 0, invoices: 0 };
      cur.revenue += Number(s.totalINR) || 0;
      cur.invoices += 1;
      byMonth.set(key, cur);
    }
    const monthly: MonthlyRevenue[] = Array.from(byMonth.keys())
      .sort()
      .map((key) => ({
        key,
        label: monthLabel(key),
        revenueINR: byMonth.get(key)!.revenue,
        invoices: byMonth.get(key)!.invoices,
      }));

    const latest = monthly[monthly.length - 1];
    const prev = monthly[monthly.length - 2];
    const growthPercentage =
      latest && prev && prev.revenueINR > 0
        ? Number((((latest.revenueINR - prev.revenueINR) / prev.revenueINR) * 100).toFixed(1))
        : null;

    // ---- top selling category (by revenue from sale_items) ----
    const categoryOf = new Map(products.map((p) => [p.id, p.category as string]));
    const revenueByCategory = new Map<string, number>();
    let itemTotal = 0;
    for (const it of items) {
      const cat = categoryOf.get(it.productId);
      if (!cat) continue;
      const amount = Number(it.totalPrice) || 0;
      revenueByCategory.set(cat, (revenueByCategory.get(cat) || 0) + amount);
      itemTotal += amount;
    }
    let topCategory: string | null = null;
    let topCategoryShare: number | null = null;
    for (const [cat, amount] of revenueByCategory) {
      if (topCategory === null || amount > (revenueByCategory.get(topCategory) ?? 0)) {
        topCategory = cat;
        topCategoryShare = itemTotal > 0 ? Math.round((amount / itemTotal) * 100) : null;
      }
    }

    // ---- restock + dead stock ----
    const restockCount = products.filter((p) => Number(p.stockQuantity) <= Number(p.reorderLevel)).length;

    const cutoff = Date.now() - DEAD_STOCK_DAYS * 24 * 60 * 60 * 1000;
    const recentlySold = new Set<string>();
    for (const it of items) {
      const d = saleDate.get(it.saleId);
      if (d && new Date(d).getTime() >= cutoff && it.productId) recentlySold.add(it.productId);
    }
    const deadStockCount = products.filter(
      (p) => Number(p.stockQuantity) > 0 && !recentlySold.has(p.id)
    ).length;

    return {
      success: true,
      monthly,
      growthPercentage,
      growthLabel: latest && prev ? `${latest.label} vs ${prev.label}` : null,
      topCategory,
      topCategoryShare,
      restockCount,
      deadStockCount,
      deadStockWindowDays: DEAD_STOCK_DAYS,
      totalRevenueINR: monthly.reduce((s, m) => s + m.revenueINR, 0),
      totalInvoices: sales.length,
    };
  } catch (error: any) {
    console.error("Error computing business insights:", error);
    return { ...EMPTY, success: false, error: friendlyDbError(error, "Failed to load business insights") };
  }
}
