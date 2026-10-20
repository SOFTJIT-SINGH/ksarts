import Link from "next/link";
import { Sparkles, TrendingUp, BrainCircuit, ShoppingBag, Users, PowerOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { RetrainButton } from "@/components/dashboard/retrain-button";
import { formatINR } from "@/lib/utils";
import {
  getSalesForecastFromAI,
  getBundleRecommendationsFromAI,
  getDemandForecastFromAI,
} from "@/lib/services/ai-service";
import { getBusinessInsightsAction } from "@/lib/actions/insights-actions";
import { getCustomersAction } from "@/lib/actions/customer-actions";
import { requireAdmin } from "@/lib/auth/guards";
import type { SalesForecastPoint } from "@/lib/types";

function OfflineNote({ what }: { what: string }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
      <PowerOff className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
      <span>
        The Flask ML service is offline, so {what} can&apos;t be calculated. Start it from{" "}
        <Link href="/settings" className="font-semibold text-indigo-600 underline">
          Settings → Flask ML Service
        </Link>
        .
      </span>
    </div>
  );
}

export default async function AIInsightsPage() {
  await requireAdmin();

  const [sales, bundles, demand, insights, customersRes] = await Promise.all([
    getSalesForecastFromAI(),
    getBundleRecommendationsFromAI(),
    getDemandForecastFromAI(),
    getBusinessInsightsAction(),
    getCustomersAction(),
  ]);

  const isLive = sales.isLive;

  // Segment mix straight from the customers table
  const customers = customersRes.data ?? [];
  const pct = (n: number) => (customers.length ? Math.round((n / customers.length) * 100) : 0);
  const vipPct = pct(customers.filter((c) => c.segment === "VIP Wholesaler").length);
  const atRiskPct = pct(customers.filter((c) => c.segment === "At-Risk").length);
  const regularPct = customers.length ? Math.max(0, 100 - vipPct - atRiskPct) : 0;

  const chartData: SalesForecastPoint[] =
    isLive && sales.forecast.length > 0
      ? sales.forecast
      : insights.monthly.map((m) => ({ month: m.label, actualSalesINR: m.revenueINR, predictedSalesINR: null }));

  const nextMonth = sales.predictedNextMonthSalesINR;
  const methodText =
    sales.method === "linear-trend"
      ? `Linear trend fitted on ${sales.monthsOfData} months of your real revenue.`
      : sales.method === "average"
      ? `Average of ${sales.monthsOfData} month${sales.monthsOfData === 1 ? "" : "s"} of real revenue (a trend needs 3+ months).`
      : "";

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="purple" className="text-xs">
              <Sparkles className="h-3 w-3 mr-1 text-purple-600" />
              Machine Learning DSS Core
            </Badge>
            <span className="text-xs text-slate-500 font-medium">
              {isLive ? "Flask ML service connected: live predictions from your database" : "Flask ML service offline"}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl mt-1">
            AI Predictions & Intelligence Hub
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Decision support computed from your real sales, stock and customers
          </p>
        </div>

        <RetrainButton />
      </div>

      {/* Grid of 4 Core AI Modules */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Module 1: Sales Prediction */}
        <Card className="border-indigo-100 hover:border-indigo-300">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold">1. Revenue & Sales Prediction</CardTitle>
                <CardDescription className="text-xs">Linear trend on monthly revenue (scikit-learn)</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-1">
            {!isLive ? (
              <OfflineNote what="the sales forecast" />
            ) : nextMonth === null ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                No invoices yet. Create sales and the forecast will appear here.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Per Day</span>
                    <span className="text-sm font-bold text-slate-900">{formatINR(Math.round(nextMonth / 30))}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Per Week</span>
                    <span className="text-sm font-bold text-slate-900">{formatINR(Math.round((nextMonth / 30) * 7))}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Next Month</span>
                    <span className="text-sm font-bold text-indigo-600">{formatINR(nextMonth)}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {methodText} Daily and weekly values spread the monthly forecast evenly.
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Module 2: Demand Forecast */}
        <Card className="border-emerald-100 hover:border-emerald-300">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <BrainCircuit className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold">2. Fabric Demand Forecasting</CardTitle>
                <CardDescription className="text-xs">Random Forest on live stock, price and month</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 pt-1">
            {!demand.isLive ? (
              <OfflineNote what="demand" />
            ) : demand.items.length === 0 ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                Add products to see demand forecasts.
              </div>
            ) : (
              demand.items.slice(0, 4).map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center justify-between gap-2 p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-xs"
                >
                  <div className="min-w-0">
                    <div className="truncate font-bold text-slate-900">{item.productName}</div>
                    <div className="text-[11px] text-slate-500">
                      In stock: <span className="font-bold">{item.stockQuantity}</span> · Predicted 30d demand:{" "}
                      <span className="font-bold">{item.predictedDemandNext30Days}</span>
                    </div>
                  </div>
                  <Badge
                    variant={
                      item.recommendedAction === "Restock Immediately"
                        ? "destructive"
                        : item.recommendedAction === "Monitor Inventory"
                        ? "warning"
                        : "success"
                    }
                    className="shrink-0 text-[10px]"
                  >
                    {item.recommendedAction}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Module 3: Customer Segmentation */}
        <Card className="border-purple-100 hover:border-purple-300">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold">3. Customer Segmentation</CardTitle>
                <CardDescription className="text-xs">K-Means on spend, orders and credit limit</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-1">
            {customers.length === 0 ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                Add customers to see the segment mix.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-3 bg-purple-50 rounded-lg text-center border border-purple-200">
                    <div className="text-lg font-bold text-purple-700">{vipPct}%</div>
                    <div className="text-[11px] font-semibold text-purple-900 mt-0.5">VIP Wholesalers</div>
                  </div>
                  <div className="p-3 bg-indigo-50 rounded-lg text-center border border-indigo-200">
                    <div className="text-lg font-bold text-indigo-700">{regularPct}%</div>
                    <div className="text-[11px] font-semibold text-indigo-900 mt-0.5">Regular / Occasional</div>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-lg text-center border border-amber-200">
                    <div className="text-lg font-bold text-amber-700">{atRiskPct}%</div>
                    <div className="text-[11px] font-semibold text-amber-900 mt-0.5">At-Risk Clients</div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500">Based on the {customers.length} customers in your database.</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Module 4: Recommendation Engine */}
        <Card className="border-amber-100 hover:border-amber-300">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold">4. Product Bundle Recommendation</CardTitle>
                <CardDescription className="text-xs">
                  Apriori mining of your invoice line items (&quot;Frequently Bought Together&quot;)
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 pt-1">
            {!bundles.isLive ? (
              <OfflineNote what="bundle rules" />
            ) : bundles.bundles.length > 0 ? (
              bundles.bundles.map((bundle) => (
                <div key={bundle.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                  <div className="flex justify-between items-start gap-2">
                    <div className="font-bold text-slate-900 leading-tight">{bundle.items.join(" + ")}</div>
                    <Badge variant="outline" className="shrink-0 text-[9px] bg-amber-50 text-amber-700 border-amber-200">
                      {Math.round(bundle.confidence * 100)}% Conf.
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500">{bundle.description}</p>
                </div>
              ))
            ) : (
              <div className="text-center p-3 text-xs text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
                {bundles.reason || "No strong product pairs found yet. More invoices with several items are needed."}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Forecast Visualizer */}
      <SalesChart data={chartData} />
    </div>
  );
}
