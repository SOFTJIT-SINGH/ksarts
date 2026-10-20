import Link from "next/link";
import { Sparkles, ArrowRight, TrendingUp, Users, ShoppingBag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/utils";

export interface AITeaserData {
  /** true when the Flask ML service answered */
  aiLive: boolean;
  predictedNextMonthSalesINR: number | null;
  forecastMethod: string; // "linear-trend" | "average" | "no-data" | "offline"
  monthsOfData: number;
  topCategory: string | null;
  topCategoryShare: number | null;
  growthPercentage: number | null;
  growthLabel: string | null;
  restockCount: number;
  deadStockCount: number;
  deadStockWindowDays: number;
}

function predictedLabel(d: AITeaserData): { value: string; hint: string } {
  if (!d.aiLive) return { value: "AI offline", hint: "Start Flask in Settings" };
  if (d.predictedNextMonthSalesINR === null) return { value: "No data yet", hint: "Create invoices first" };
  const hint =
    d.forecastMethod === "linear-trend"
      ? `Trend of ${d.monthsOfData} months`
      : `Average of ${d.monthsOfData} month${d.monthsOfData === 1 ? "" : "s"}`;
  return { value: formatINR(d.predictedNextMonthSalesINR), hint };
}

export function AITeaser({ data }: { data: AITeaserData }) {
  const predicted = predictedLabel(data);

  return (
    <Card className="col-span-full border-indigo-200 bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white shadow-md">
      <CardContent className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* AI Banner Left Description (built from real database figures) */}
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge variant="purple" className="bg-indigo-500/20 text-indigo-200 border-indigo-400/30">
                <Sparkles className="h-3 w-3 mr-1 text-indigo-300" />
                {data.aiLive ? "AI Intelligence Active" : "AI Service Offline"}
              </Badge>
              <span className="text-xs text-indigo-300 font-medium">Computed from your live data</span>
            </div>

            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              {data.topCategory ? `${data.topCategory} is your top seller` : "Create invoices to unlock insights"}
            </h2>
            <p className="text-sm text-indigo-100/80 leading-relaxed">
              {data.topCategory ? (
                <>
                  It brings in{" "}
                  <span className="font-semibold text-emerald-400">{data.topCategoryShare ?? 0}%</span> of your item revenue.
                  {data.growthPercentage !== null && data.growthLabel && (
                    <>
                      {" "}
                      Monthly revenue is{" "}
                      <span className={`font-semibold ${data.growthPercentage >= 0 ? "text-emerald-400" : "text-rose-300"}`}>
                        {data.growthPercentage >= 0 ? "+" : ""}
                        {data.growthPercentage}%
                      </span>{" "}
                      ({data.growthLabel}).
                    </>
                  )}{" "}
                  {data.deadStockCount > 0 &&
                    `${data.deadStockCount} product${data.deadStockCount === 1 ? "" : "s"} had no sales in the last ${data.deadStockWindowDays} days.`}
                </>
              ) : (
                "Once you bill customers, this banner shows your best-selling category, monthly growth and slow-moving stock."
              )}
            </p>
          </div>

          {/* AI Stat Mini Grid */}
          <div className="grid grid-cols-2 gap-4 shrink-0 bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-xs">
            <div className="flex flex-col">
              <span className="text-[11px] text-indigo-200 font-medium">Predicted Next Month</span>
              <span className="text-lg font-bold text-white mt-0.5">{predicted.value}</span>
              <span className="text-[10px] text-indigo-300">{predicted.hint}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] text-indigo-200 font-medium">Restock Actions</span>
              <span className="text-lg font-bold text-amber-300 mt-0.5">{data.restockCount} Products</span>
              <span className="text-[10px] text-indigo-300">At or below reorder level</span>
            </div>
          </div>
        </div>

        {/* CTA Button Link */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-indigo-800/60 pt-4">
          <div className="flex items-center gap-4 text-xs text-indigo-200">
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
              Sales Forecasting
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-indigo-300" />
              Customer K-Means
            </span>
            <span className="flex items-center gap-1">
              <ShoppingBag className="h-3.5 w-3.5 text-amber-300" />
              Apriori Bundles
            </span>
          </div>

          <Link href="/ai-insights">
            <Button className="bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-xs h-10 px-5">
              <span>Open AI Predictions Hub</span>
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
