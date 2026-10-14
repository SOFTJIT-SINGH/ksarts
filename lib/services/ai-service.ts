import {
  AIPredictionOverview,
  SalesForecastPoint,
  DemandForecastItem,
  BundleRecommendation,
} from "@/lib/types";
import {
  MOCK_AI_OVERVIEW,
  MOCK_SALES_FORECAST,
  MOCK_DEMAND_ITEMS,
  MOCK_BUNDLE_RECOMMENDATIONS,
} from "@/lib/mock-data/textile-data";

const FLASK_AI_SERVICE_URL =
  process.env.FLASK_AI_SERVICE_URL || "http://127.0.0.1:5000/api/v1/predict";

/**
 * Server-side AI Service wrapper to query Python Flask Machine Learning Microservice.
 * Falls back gracefully to intelligent mock estimates if Flask server is offline.
 */
const FETCH_OPTS = {
  method: "GET",
  headers: { "Content-Type": "application/json" },
  cache: "no-store",
} as const;

export async function getSalesForecastFromAI(): Promise<{
  overview: AIPredictionOverview;
  forecast: SalesForecastPoint[];
  isLive: boolean;
}> {
  try {
    const response = await fetch(`${FLASK_AI_SERVICE_URL}/sales`, {
      ...FETCH_OPTS,
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      throw new Error(`Flask service responded with status: ${response.status}`);
    }

    const data = await response.json();

    return {
      overview: data.overview || MOCK_AI_OVERVIEW,
      forecast: data.forecast || MOCK_SALES_FORECAST,
      isLive: Boolean(data.overview),
    };
  } catch (error) {
    console.warn("Flask AI Service unreachable, using fallback predictions:", error);
    return {
      overview: MOCK_AI_OVERVIEW,
      forecast: MOCK_SALES_FORECAST,
      isLive: false,
    };
  }
}

/**
 * Fetches Apriori product bundle recommendations from Flask ML.
 */
export async function getBundleRecommendationsFromAI(): Promise<BundleRecommendation[]> {
  try {
    const response = await fetch(`${FLASK_AI_SERVICE_URL}/bundles`, {
      ...FETCH_OPTS,
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      throw new Error(`Flask service responded with status: ${response.status}`);
    }

    const data = await response.json();
    return data.bundles && data.bundles.length > 0 ? data.bundles : MOCK_BUNDLE_RECOMMENDATIONS;
  } catch (error) {
    console.warn("Flask AI Service unreachable for bundles, using mock bundles:", error);
    return MOCK_BUNDLE_RECOMMENDATIONS;
  }
}

/**
 * Fetches Random Forest demand forecasts (stock, price, month) from Flask ML.
 */
export async function getDemandForecastFromAI(): Promise<DemandForecastItem[]> {
  try {
    const response = await fetch(`${FLASK_AI_SERVICE_URL}/demand`, {
      ...FETCH_OPTS,
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      throw new Error(`Flask service responded with status: ${response.status}`);
    }

    const data = await response.json();
    return data.demand && data.demand.length > 0 ? data.demand : MOCK_DEMAND_ITEMS;
  } catch (error) {
    console.warn("Flask AI Service unreachable for demand, using mock demand:", error);
    return MOCK_DEMAND_ITEMS;
  }
}
