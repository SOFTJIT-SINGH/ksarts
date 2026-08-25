"use client";

import { useCallback, useEffect, useState } from "react";
import { Activity, Database, FlaskConical, RefreshCw, ShieldCheck, Loader2, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getSystemHealthAction, type SystemHealthReport, type MlModelStatus } from "@/lib/actions/system-actions";

// LEARNING NOTE: Client component for live status
//   what:     Renders the health report from the server action and lets the user re-run it
//   why:      The probe itself must run server-side (env vars, cookies), but re-checking
//             needs client interaction → Server Action + local state, no API route needed
//   without:  Status would be static like the old "Ready / Standby" badge that never changed
//   remember: Server Actions are the bridge: call them from click handlers, get fresh server data

const MODEL_LABELS: { key: keyof MlModelStatus; label: string }[] = [
  { key: "sales_prediction", label: "Sales" },
  { key: "customer_segmentation", label: "Segmentation" },
  { key: "demand_forecasting", label: "Demand" },
];

function StatusBadge({ connected }: { connected: boolean }) {
  return connected ? (
    <Badge variant="success" className="gap-1">
      <CheckCircle2 className="h-3 w-3" /> Connected
    </Badge>
  ) : (
    <Badge variant="destructive" className="gap-1">
      <XCircle className="h-3 w-3" /> Offline
    </Badge>
  );
}

function StatusSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4 animate-pulse">
          <div className="h-4 w-28 rounded bg-slate-200" />
          <div className="h-3 w-20 rounded bg-slate-200" />
          <div className="h-8 w-24 rounded bg-slate-200" />
        </div>
      ))}
    </div>
  );
}

export function SystemStatusCard() {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<SystemHealthReport | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getSystemHealthAction();
      setReport(result);
    } catch (err: any) {
      setReport({
        success: false,
        error: err.message || "Failed to check system status.",
        checkedAt: new Date().toISOString(),
        supabase: { connected: false, products: 0, customers: 0, sales: 0 },
        ml: { connected: false, url: "" },
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    // LEARNING NOTE: async IIFE inside useEffect
    //   what:     Runs the health probe once on mount, guarded by a cancelled flag
    //   why:      setState must happen AFTER an await so it can't conflict with an
    //             unmounted component (React 19 lint rule) — and the flag skips
    //             setState if the user navigated away mid-request
    //   without:  Stale state updates after unmount, or a linter error blocking the build
    (async () => {
      try {
        const result = await getSystemHealthAction();
        if (!cancelled) {
          setReport(result);
          setLoading(false);
        }
      } catch (err: any) {
        if (!cancelled) {
          setReport({
            success: false,
            error: err.message || "Failed to check system status.",
            checkedAt: new Date().toISOString(),
            supabase: { connected: false, products: 0, customers: 0, sales: 0 },
            ml: { connected: false, url: "" },
          });
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const mlModels = report?.ml.models;

  return (
    <Card className="border-slate-200 shadow-xs">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-600" />
            Live System Status
          </CardTitle>
          <CardDescription className="text-xs">
            Real-time health of the Supabase database and Flask ML microservice
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          {report && (
            <span className="text-[11px] text-slate-400">
              Last checked {new Date(report.checkedAt).toLocaleTimeString()}
            </span>
          )}
          <Button
            onClick={refresh}
            disabled={loading}
            variant="outline"
            className="h-10 gap-1.5 text-xs font-semibold"
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            Refresh
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {loading && !report ? (
          <StatusSkeleton />
        ) : !report?.success ? (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 text-xs">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            <span>
              {report?.error ||
                "Both backends are unreachable. Start the Flask service and check Supabase credentials."}
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Supabase Database tile */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <Database className="h-4 w-4 text-indigo-600" />
                  Supabase Database
                </div>
                <StatusBadge connected={report.supabase.connected} />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {report.supabase.error ? "Connection failed" : "PostgreSQL · Row counts"}
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-lg font-bold text-slate-900">{report.supabase.products}</div>
                  <div className="text-[10px] font-semibold text-slate-400 uppercase">Products</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-900">{report.supabase.customers}</div>
                  <div className="text-[10px] font-semibold text-slate-400 uppercase">Customers</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-900">{report.supabase.sales}</div>
                  <div className="text-[10px] font-semibold text-slate-400 uppercase">Sales</div>
                </div>
              </div>
            </div>

            {/* Flask ML Service tile */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <FlaskConical className="h-4 w-4 text-purple-600" />
                  Flask ML Service
                </div>
                <StatusBadge connected={report.ml.connected} />
              </div>
              <p className="text-[11px] text-slate-500 mt-1 truncate" title={report.ml.url}>
                {report.ml.connected ? report.ml.service : report.ml.error || "Service unreachable"}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {mlModels &&
                  MODEL_LABELS.map(({ key, label }) => (
                    <span
                      key={key}
                      className={
                        mlModels[key]
                          ? "inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold text-emerald-700"
                          : "inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-500"
                      }
                    >
                      {label}
                      {mlModels[key] ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}
                    </span>
                  ))}
                {!mlModels && <span className="text-[11px] text-slate-400">Models not loaded (run train_models.py)</span>}
              </div>
            </div>

            {/* Supabase Auth tile */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Supabase Auth
                </div>
                <StatusBadge connected={report.supabase.connected} />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Email + Password · Role-based access</p>
              <div className="mt-3 text-[11px] text-slate-600 leading-relaxed">
                Admin &amp; Employee roles are enforced server-side on every Server Action.
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}