import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MOCK_SALES } from "@/lib/mock-data/textile-data";
import { formatINR } from "@/lib/utils";
import { SaleModal } from "@/components/sales/sale-modal";
import { getSalesAction } from "@/lib/actions/sale-actions";
import { InvoicePdfButton } from "@/components/sales/invoice-pdf-button";
import { getBusinessProfileAction } from "@/lib/actions/business-actions";

export default async function SalesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const [res, { profile: business }] = await Promise.all([getSalesAction(), getBusinessProfileAction()]);
  const allSales = res.success && res.data && res.data.length > 0 ? res.data : MOCK_SALES;
  const needle = (q ?? "").trim().toLowerCase();
  const sales = needle
    ? allSales.filter((s) =>
        [s.invoiceNumber, s.customerName, s.salesPerson, s.paymentMode, s.paymentStatus]
          .join(" ")
          .toLowerCase()
          .includes(needle)
      )
    : allSales;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Sales & Billing Invoices
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Track daily billing transactions, payment modes, GST taxes, and print invoices
          </p>
        </div>

        <SaleModal />
      </div>

      {/* Search */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <form method="get" className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search invoice #, customer, payment status..."
            className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          />
        </form>
        <span className="text-xs text-slate-500">{sales.length} of {allSales.length} invoices</span>
      </div>

      {/* Invoices List */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Invoice #</th>
                  <th className="px-4 py-3">Customer / Firm</th>
                  <th className="px-4 py-3">Date & Time</th>
                  <th className="px-4 py-3">Sales Executive</th>
                  <th className="px-4 py-3">Payment Mode</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Invoice Total</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-slate-900">{sale.invoiceNumber}</td>
                    <td className="px-4 py-3.5 font-semibold text-slate-800">{sale.customerName}</td>
                    <td className="px-4 py-3.5 text-slate-500">{sale.createdAt}</td>
                    <td className="px-4 py-3.5 text-slate-600">{sale.salesPerson}</td>
                    <td className="px-4 py-3.5 font-medium text-slate-700">{sale.paymentMode}</td>
                    <td className="px-4 py-3.5">
                      <Badge
                        variant={sale.paymentStatus === "Paid" ? "success" : "warning"}
                        className="text-[11px]"
                      >
                        {sale.paymentStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-indigo-700">
                      {formatINR(sale.totalINR)}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <InvoicePdfButton sale={sale} business={business} />
                    </td>
                  </tr>
                ))}
                {sales.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-sm text-slate-400">
                      No invoices match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
