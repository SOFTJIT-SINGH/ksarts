"use server";

import { createClient } from "@/lib/supabase/server";

// LEARNING NOTE: Health probe server action
//   what:     One server action that pings both backends — Supabase (row counts) and Flask (model status)
//   why:      Server Actions are the only place that can read server-only env vars + Supabase cookies,
//             so the client card just calls this one function and renders the result
//   without:  The Flask URL and DB connectivity could never be verified from a client component
//   remember: Keep health probes server-side — never put FLASK_AI_SERVICE_URL in the client bundle

export interface MlModelStatus {
  sales_prediction: boolean;
  customer_segmentation: boolean;
  demand_forecasting: boolean;
}

export interface SystemHealthReport {
  success: boolean;
  error?: string;
  checkedAt: string;
  supabase: {
    connected: boolean;
    error?: string;
    products: number;
    customers: number;
    sales: number;
  };
  ml: {
    connected: boolean;
    url: string;
    service?: string;
    status?: string;
    models?: MlModelStatus;
    supabaseConnected?: boolean;
    error?: string;
  };
}

const FLASK_AI_SERVICE_URL =
  process.env.FLASK_AI_SERVICE_URL || "http://127.0.0.1:5000/api/v1/predict";

// Health lives at /api/health while predictions live under /api/v1/predict,
// so derive the base host by stripping the API prefix.
function getFlaskBaseUrl(): string {
  return FLASK_AI_SERVICE_URL.replace(/\/api\/v1.*$/, "") || FLASK_AI_SERVICE_URL;
}

async function countRows(
  supabase: Awaited<ReturnType<typeof createClient>>,
  table: "products" | "customers" | "sales"
): Promise<number> {
  // LEARNING NOTE: { count: "exact", head: true }
  //   what:   Asks Postgres for ONLY the row count, no rows transferred
  //   why:    head:true skips fetching bodies; exact computes the true total
  //   without: We'd download every row just to show a number
  //   remember: Use head:true anytime you only need a count
  const { count, error } = await supabase
    .from(table)
    .select("id", { count: "exact", head: true });
  if (error) throw error;
  return count ?? 0;
}

export async function getSystemHealthAction(): Promise<SystemHealthReport> {
  const checkedAt = new Date().toISOString();

  // ---------- 1. Supabase probe ----------
  const supabaseState: SystemHealthReport["supabase"] = {
    connected: false,
    products: 0,
    customers: 0,
    sales: 0,
  };

  try {
    const supabase = await createClient();
    const [products, customers, sales] = await Promise.all([
      countRows(supabase, "products"),
      countRows(supabase, "customers"),
      countRows(supabase, "sales"),
    ]);
    // LEARNING NOTE: Promise.all parallelizes the 3 count queries
    //   without: sequential awaits = 3 network round-trips instead of 1
    supabaseState.connected = true;
    supabaseState.products = products;
    supabaseState.customers = customers;
    supabaseState.sales = sales;
  } catch (err: any) {
    supabaseState.error = err.message || "Supabase unreachable";
  }

  // ---------- 2. Flask ML probe ----------
  const mlState: SystemHealthReport["ml"] = {
    connected: false,
    url: FLASK_AI_SERVICE_URL,
  };

  try {
    // LEARNING NOTE: AbortSignal.timeout(4000)
    //   what:   Walks away from the fetch after 4 seconds instead of hanging forever
    //   why:    A dead Flask process that never replies would otherwise block the action indefinitely
    //   without: every Settings visit could spin forever on a zombie server
    const response = await fetch(`${getFlaskBaseUrl()}/api/health`, {
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
    });

    if (!response.ok) {
      throw new Error(`Flask responded with status ${response.status}`);
    }

    const data = await response.json();
    mlState.connected = true;
    mlState.service = data.service;
    mlState.status = data.status;
    mlState.models = data.models_loaded;
    mlState.supabaseConnected = Boolean(data.supabase_connected);
  } catch (err: any) {
    mlState.error = err.message || "Flask ML service unreachable";
  }

  // success=false only when both backends are down — the UI then shows a full-page alert.
  const bothOffline = !supabaseState.connected && !mlState.connected;
  return {
    success: !bothOffline,
    error: bothOffline ? "Both Supabase and the Flask ML service are unreachable." : undefined,
    checkedAt,
    supabase: supabaseState,
    ml: mlState,
  };
}