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
import {
  MOCK_PRODUCTS,
  MOCK_SALES,
  MOCK_AI_OVERVIEW,
  MOCK_SALES_FORECAST,
} from "@/lib/mock-data/textile-data";
import { formatINR } from "@/lib/utils";

import { SaleModal } from "@/components/sales/sale-modal";
import { getProductsAction } from "@/lib/actions/product-actions";
import { getSalesAction } from "@/lib/actions/sale-actions";

export default async function DashboardPage() {
  // Fetch live data
  const [productsRes, salesRes] = await Promise.all([
    getProductsAction(),
    getSalesAction()
  ]);

  const products = productsRes.success && productsRes.data && productsRes.data.length > 0 ? productsRes.data : MOCK_PRODUCTS;
  const sales = salesRes.success && salesRes.data && salesRes.data.length > 0 ? salesRes.data : MOCK_SALES;

  const totalRevenue = sales.reduce((acc, sale) => acc + sale.totalINR, 0);

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
          <Button variant="outline" className="text-xs h-10 gap-1.5 font-semibold">
            <FileText className="h-4 w-4 text-slate-500" />
            <span>Export Report</span>
          </Button>
          <SaleModal />
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="July Sales Revenue"
          value={formatINR(totalRevenue)}
          change={12.5}
          changeLabel="vs June (₹1.52M)"
          icon={IndianRupee}
          iconBgColor="bg-indigo-50"
          iconColor="text-indigo-600"
        />
        <KPICard
          title="Total Orders Delivered"
          value={sales.length.toString()}
          change={8.4}
          changeLabel="vs last month"
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
          value={`${products.filter(p => p.status !== "In Stock").length} Items`}
          change={-25}
          changeLabel="improved stockout rate"
          icon={AlertCircle}
          iconBgColor="bg-amber-50"
          iconColor="text-amber-600"
        />
      </div>

      {/* AI Intelligence Teaser Banner */}
      <AITeaser overview={MOCK_AI_OVERVIEW} />

      {/* Main Analytics Grid (Sales Area Chart + Inventory Alert List) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <SalesChart data={MOCK_SALES_FORECAST} />
        <InventoryAlert products={products} />
      </div>

      {/* Recent Sales Transactions Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold">Recent Wholesale Sales Invoices</CardTitle>
            <CardDescription>
              Latest billing transactions across Surat, Jaipur, and Delhi clients
            </CardDescription>
          </div>
          <Button variant="ghost" className="text-xs font-semibold text-indigo-600 gap-1">
            <span>View All Invoices</span>
            <ArrowUpRight className="h-4 w-4" />
          </Button>
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
