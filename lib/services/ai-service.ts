import { SalesForecastPoint, DemandForecastItem, BundleRecommendation } from "@/lib/types";

const FLASK_AI_SERVICE_URL =
  process.env.FLASK_AI_SERVICE_URL || "http://127.0.0.1:5000/api/v1/predict";

const FETCH_OPTS = {
  method: "GET",
  headers: { "Content-Type": "application/json" },
  cache: "no-store",
} as const;

// LEARNING NOTE: No mock data here any more
//   what:   When Flask is offline these functions return `isLive: false` with EMPTY results
//   why:    The UI must never show invented numbers as if they came from the database/ML service
//   remember: The pages show an "AI service offline - start Flask" empty state instead

async function callFlask(path: string) {
  const response = await fetch(`${FLASK_AI_SERVICE_URL}${path}`, {
    ...FETCH_OPTS,
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) {
    throw new Error(`Flask service responded with status: ${response.status}`);
  }
  return response.json();
}

export interface SalesForecastResult {
  isLive: boolean;
  predictedNextMonthSalesINR: number | null;
  /** "linear-trend" (3+ months), "average" (1-2 months) or "no-data" */
  method: string;
  monthsOfData: number;
  forecast: SalesForecastPoint[];
}

/** Next-month revenue forecast learned from the real monthly sales in Supabase (done inside Flask). */
export async function getSalesForecastFromAI(): Promise<SalesForecastResult> {
  try {
    const data = await callFlask("/sales");
    return {
      isLive: true,
      predictedNextMonthSalesINR: data.predictedNextMonthSalesINR ?? null,
      method: data.method ?? "no-data",
      monthsOfData: data.monthsOfData ?? 0,
      forecast: Array.isArray(data.forecast) ? data.forecast : [],
    };
  } catch (error) {
    console.warn("Flask AI Service unreachable for sales forecast:", error);
    return { isLive: false, predictedNextMonthSalesINR: null, method: "offline", monthsOfData: 0, forecast: [] };
  }
}

/** Apriori "frequently bought together" rules mined from real invoice line items. */
export async function getBundleRecommendationsFromAI(): Promise<{
  isLive: boolean;
  bundles: BundleRecommendation[];
  reason?: string;
}> {
  try {
    const data = await callFlask("/bundles");
    return { isLive: true, bundles: data.bundles ?? [], reason: data.reason };
  } catch (error) {
    console.warn("Flask AI Service unreachable for bundles:", error);
    return { isLive: false, bundles: [] };
  }
}

/** Per-product 30-day demand estimates computed from live stock and prices. */
export async function getDemandForecastFromAI(): Promise<{
  isLive: boolean;
  items: DemandForecastItem[];
}> {
  try {
    const data = await callFlask("/demand");
    return { isLive: true, items: data.demand ?? [] };
  } catch (error) {
    console.warn("Flask AI Service unreachable for demand:", error);
    return { isLive: false, items: [] };
  }
}
