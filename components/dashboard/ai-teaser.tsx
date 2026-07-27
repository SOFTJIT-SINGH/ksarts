import Link from "next/link";
import { Sparkles, ArrowRight, TrendingUp, Users, ShoppingBag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AIPredictionOverview } from "@/lib/types";
import { formatINR } from "@/lib/utils";

interface AITeaserProps {
  overview: AIPredictionOverview;
}

export function AITeaser({ overview }: AITeaserProps) {
  return (
    <Card className="col-span-full border-indigo-200 bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white shadow-md">
      <CardContent className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* AI Banner Left Description */}
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge variant="purple" className="bg-indigo-500/20 text-indigo-200 border-indigo-400/30">
                <Sparkles className="h-3 w-3 mr-1 text-indigo-300" />
                AI Intelligence Active
              </Badge>
              <span className="text-xs text-indigo-300 font-medium">Textile Demand DSS Model v1</span>
            </div>

            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              Festive Season Demand Forecast Available
            </h2>
            <p className="text-sm text-indigo-100/80 leading-relaxed">
              Our ML model projects a <span className="font-semibold text-emerald-400">+{overview.growthPercentage}% surge</span> in{" "}
              <span className="font-semibold text-white">{overview.highDemandCategory}</span> demand over the next 30 days. Restock early to maximize profit margins.
            </p>
          </div>

          {/* AI Stat Mini Grid */}
          <div className="grid grid-cols-2 gap-4 shrink-0 bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-xs">
            <div className="flex flex-col">
              <span className="text-[11px] text-indigo-200 font-medium">Predicted Sales</span>
              <span className="text-lg font-bold text-white mt-0.5">
                {formatINR(overview.predictedNextMonthSalesINR)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] text-indigo-200 font-medium">Restock Actions</span>
              <span className="text-lg font-bold text-amber-300 mt-0.5">
                {overview.recommendedRestockCount} Products
              </span>
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
