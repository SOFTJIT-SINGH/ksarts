"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SalesForecastPoint } from "@/lib/types";
import { formatCompactNumber, formatINR } from "@/lib/utils";

interface SalesChartProps {
  data: SalesForecastPoint[];
}

export function SalesChart({ data }: SalesChartProps) {
  return (
    <Card className="col-span-full lg:col-span-8">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-lg font-bold">Revenue & AI Sales Forecast</CardTitle>
          <CardDescription>
            Historical monthly revenue vs. AI-predicted sales trajectory (INR ₹)
          </CardDescription>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span className="h-2.5 w-2.5 rounded-full bg-indigo-600" />
            Actual Sales
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium ml-3">
            <span className="h-2.5 w-2.5 rounded-full bg-purple-400" />
            AI Forecast
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="actualSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="predictedSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#A855F7" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#A855F7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748B", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748B", fontSize: 12 }}
                tickFormatter={(val) => `₹${formatCompactNumber(val)}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FFFFFF",
                  borderColor: "#E2E8F0",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
                formatter={(value: any) => [formatINR(Number(value || 0)), ""]}
              />
              <Area
                type="monotone"
                dataKey="actualSalesINR"
                name="Actual Revenue"
                stroke="#4F46E5"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#actualSales)"
              />
              <Area
                type="monotone"
                dataKey="predictedSalesINR"
                name="AI Prediction"
                stroke="#A855F7"
                strokeWidth={2}
                strokeDasharray="4 4"
                fillOpacity={1}
                fill="url(#predictedSales)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
