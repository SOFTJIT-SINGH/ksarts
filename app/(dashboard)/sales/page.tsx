import { Plus, Search, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MOCK_SALES } from "@/lib/mock-data/textile-data";
import { formatINR } from "@/lib/utils";

export default function SalesPage() {
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

        <Button className="text-xs h-10 gap-1.5 font-semibold bg-indigo-600 hover:bg-indigo-700">
          <Plus className="h-4 w-4" />
          <span>Create Sales Invoice</span>
        </Button>
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
                {MOCK_SALES.map((sale) => (
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
                      <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 text-slate-600">
                        <Download className="h-3.5 w-3.5" />
                        <span>PDF</span>
                      </Button>
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
