import {
  Sparkles,
  TrendingUp,
  BrainCircuit,
  ShoppingBag,
  Users,
  AlertTriangle,
  ArrowRight,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SalesChart } from "@/components/dashboard/sales-chart";
import {
  MOCK_SALES_FORECAST,
  MOCK_DEMAND_ITEMS,
  MOCK_AI_OVERVIEW,
} from "@/lib/mock-data/textile-data";
import { formatINR } from "@/lib/utils";
import { aiService } from "@/lib/services/ai-service";

export default async function AIInsightsPage() {
  let salesData = { overview: MOCK_AI_OVERVIEW, forecast: MOCK_SALES_FORECAST };
  let isLive = false;

  try {
    const aiSales = await aiService.getSalesPrediction();
    if (aiSales) {
      salesData = aiSales;
      isLive = true;
    }
  } catch (error) {
    console.error("Failed to connect to AI service", error);
  }

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
              Flask Service v1.0 connected ({isLive ? "Live Data" : "Mock Fallback"})
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl mt-1">
            AI Predictions & Intelligence Hub
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Automated Decision Support System powered by Scikit-Learn, K-Means & Apriori algorithms
          </p>
        </div>

        <Button className="text-xs h-10 gap-1.5 font-semibold bg-purple-600 hover:bg-purple-700 text-white">
          <Zap className="h-4 w-4" />
          <span>Re-run AI Model Training</span>
        </Button>
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
                <CardDescription className="text-xs">
                  Linear Regression / Random Forest Regressor
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-1">
            <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Tomorrow</span>
                <span className="text-sm font-bold text-slate-900">{formatINR(68500)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Next Week</span>
                <span className="text-sm font-bold text-slate-900">{formatINR(460000)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Next Month</span>
                <span className="text-sm font-bold text-indigo-600">{formatINR(salesData.overview.predictedNextMonthSalesINR)}</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Confidence score: <span className="font-bold text-emerald-600">92.4%</span> accuracy on cross-validation testing.
            </p>
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
                <CardDescription className="text-xs">
                  TimeSeries Stockout Prevention Algorithm
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 pt-1">
            {MOCK_DEMAND_ITEMS.slice(0, 2).map((item) => (
              <div
                key={item.productId}
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900">{item.productName}</div>
                  <div className="text-[11px] text-slate-500">
                    Predicted 30d demand: <span className="font-bold">{item.predictedDemandNext30Days} units</span>
                  </div>
                </div>
                <Badge variant="warning" className="text-[10px]">
                  {item.recommendedAction}
                </Badge>
              </div>
            ))}
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
                <CardTitle className="text-base font-bold">3. Customer RFM Segmentation</CardTitle>
                <CardDescription className="text-xs">
                  K-Means Clustering (Recency, Frequency, Monetary)
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-1">
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 bg-purple-50 rounded-lg text-center border border-purple-100">
                <div className="text-lg font-bold text-purple-700">18%</div>
                <div className="text-[11px] font-semibold text-purple-900 mt-0.5">VIP Wholesalers</div>
              </div>
              <div className="p-3 bg-indigo-50 rounded-lg text-center border border-indigo-100">
                <div className="text-lg font-bold text-indigo-700">62%</div>
                <div className="text-[11px] font-semibold text-indigo-900 mt-0.5">Regular Retailers</div>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg text-center border border-amber-100">
                <div className="text-lg font-bold text-amber-700">20%</div>
                <div className="text-[11px] font-semibold text-amber-900 mt-0.5">At-Risk Clients</div>
              </div>
            </div>
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
                  Apriori Association Rule Mining (&quot;Frequently Bought Together&quot;)
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 pt-1">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs space-y-1">
              <div className="font-bold text-slate-900">
                Banarasi Silk Saree + Zardozi Dupatta Bundle
              </div>
              <p className="text-[11px] text-slate-500">
                84% of wholesale buyers purchasing Banarasi Sarees also order matching Brocade Blouse pieces within 14 days.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Forecast Visualizer */}
      <SalesChart data={salesData.forecast} />
    </div>
  );
}
