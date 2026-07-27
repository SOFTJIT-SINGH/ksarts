import {
  AIPredictionOverview,
  SalesForecastPoint,
  DemandForecastItem,
} from "@/lib/types";
import {
  MOCK_AI_OVERVIEW,
  MOCK_SALES_FORECAST,
  MOCK_DEMAND_ITEMS,
} from "@/lib/mock-data/textile-data";

const FLASK_AI_SERVICE_URL =
  process.env.FLASK_AI_SERVICE_URL || "http://127.0.0.1:5000/api/v1/predict";

/**
 * Server-side AI Service wrapper to query Python Flask Machine Learning Microservice.
 * Falls back gracefully to intelligent mock estimates if Flask server is offline.
 */
export async function getSalesForecastFromAI(): Promise<{
  overview: AIPredictionOverview;
  forecast: SalesForecastPoint[];
  demand: DemandForecastItem[];
}> {
  try {
    const response = await fetch(`${FLASK_AI_SERVICE_URL}/sales`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`Flask service responded with status: ${response.status}`);
    }

    const data = await response.json();

    return {
      overview: data.overview || MOCK_AI_OVERVIEW,
      forecast: data.forecast || MOCK_SALES_FORECAST,
      demand: data.demand || MOCK_DEMAND_ITEMS,
    };
  } catch (error) {
    console.warn("Flask AI Service unreachable, using fallback predictions:", error);
    return {
      overview: MOCK_AI_OVERVIEW,
      forecast: MOCK_SALES_FORECAST,
      demand: MOCK_DEMAND_ITEMS,
    };
  }
}
