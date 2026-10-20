import Link from "next/link";
import {
  IndianRupee,
  ShoppingBag,
  PackageCheck,
  AlertCircle,
  FileText,
  Plus,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { KPICard } from "@/components/dashboard/kpi-card";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { InventoryAlert } from "@/components/dashboard/inventory-alert";
import { AITeaser } from "@/components/dashboard/ai-teaser";
import { formatINR } from "@/lib/utils";
import { getSalesForecastFromAI } from "@/lib/services/ai-service";
import { getBusinessInsightsAction } from "@/lib/actions/insights-actions";
import { EmptyState, ErrorBanner } from "@/components/ui/data-states";
import type { SalesForecastPoint } from "@/lib/types";

import { SaleModal } from "@/components/sales/sale-modal";
import { getProductsAction } from "@/lib/actions/product-actions";
import { getSalesAction } from "@/lib/actions/sale-actions";

export default async function DashboardPage() {
  // Everything below comes from the database (and the Flask ML service for the forecast)
  const [productsRes, salesRes, ai, insights] = await Promise.all([
    getProductsAction(),
    getSalesAction(),
    getSalesForecastFromAI(),
    getBusinessInsightsAction(),
  ]);

  const products = productsRes.data ?? [];
  const sales = salesRes.data ?? [];
  const loadError = !productsRes.success ? productsRes.error : !salesRes.success ? salesRes.error : null;

  const totalRevenue = sales.reduce((acc, sale) => acc + sale.totalINR, 0);
  const revenueChange = insights.growthPercentage ?? undefined;

  // Chart: the Flask forecast (actuals + fitted trend + next month) when available,
  // otherwise the real monthly revenue straight from the database.
  const chartData: SalesForecastPoint[] =
    ai.isLive && ai.forecast.length > 0
      ? ai.forecast
      : insights.monthly.map((m) => ({ month: m.label, actualSalesINR: m.revenueINR, predictedSalesINR: null }));

  const alertCount = products.filter((p) => p.status !== "In Stock").length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Textile Business Dashboard
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Real-time wholesale sales, inventory status, and AI sales predictions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/reports">
            <Button variant="outline" className="text-xs h-10 gap-1.5 font-semibold">
              <FileText className="h-4 w-4 text-slate-500" />
              <span>Export Report</span>
            </Button>
          </Link>
          <SaleModal />
        </div>
      </div>

      {loadError && <ErrorBanner message={loadError} />}

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Sales Revenue"
          value={formatINR(totalRevenue)}
          change={revenueChange}
          changeLabel={insights.growthLabel ?? undefined}
          icon={IndianRupee}
          iconBgColor="bg-indigo-50"
          iconColor="text-indigo-600"
        />
        <KPICard
          title="Total Invoices"
          value={sales.length.toString()}
          icon={ShoppingBag}
          iconBgColor="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <KPICard
          title="Catalog Textile SKUs"
          value={products.length.toString()}
          icon={PackageCheck}
          iconBgColor="bg-purple-50"
          iconColor="text-purple-600"
        />
        <KPICard
          title="Stock Alerts"
          value={`${alertCount} Items`}
          icon={AlertCircle}
          iconBgColor="bg-amber-50"
          iconColor="text-amber-600"
        />
      </div>

      {/* AI Intelligence Teaser Banner */}
      <AITeaser
        data={{
          aiLive: ai.isLive,
          predictedNextMonthSalesINR: ai.predictedNextMonthSalesINR,
          forecastMethod: ai.method,
          monthsOfData: ai.monthsOfData,
          topCategory: insights.topCategory,
          topCategoryShare: insights.topCategoryShare,
          growthPercentage: insights.growthPercentage,
          growthLabel: insights.growthLabel,
          restockCount: insights.restockCount,
          deadStockCount: insights.deadStockCount,
          deadStockWindowDays: insights.deadStockWindowDays,
        }}
      />

      {/* Main Analytics Grid (Sales Area Chart + Inventory Alert List) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <SalesChart data={chartData} />
        <InventoryAlert products={products} />
      </div>

      {/* Recent Sales Transactions Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold">Recent Wholesale Sales Invoices</CardTitle>
            <CardDescription>
              Latest billing transactions across your wholesale and retail clients
            </CardDescription>
          </div>
          <Link href="/sales">
            <Button variant="ghost" className="text-xs font-semibold text-indigo-600 gap-1">
              <span>View All Invoices</span>
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Invoice No.</th>
                  <th className="px-4 py-3">Customer / Business</th>
                  <th className="px-4 py-3">Salesperson</th>
                  <th className="px-4 py-3">Payment Method</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Total Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {sales.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-400">
                      No invoices yet. Create your first sale to see it here.
                    </td>
                  </tr>
                )}
                {sales.slice(0, 5).map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-slate-900">{sale.invoiceNumber}</td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-800">{sale.customerName}</div>
                      <div className="text-[11px] text-slate-400">{sale.createdAt}</div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">{sale.salesPerson}</td>
                    <td className="px-4 py-3.5">{sale.paymentMode}</td>
                    <td className="px-4 py-3.5">
                      <Badge
                        variant={sale.paymentStatus === "Paid" ? "success" : "warning"}
                        className="text-[11px]"
                      >
                        {sale.paymentStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-slate-900">
                      {formatINR(sale.totalINR)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
