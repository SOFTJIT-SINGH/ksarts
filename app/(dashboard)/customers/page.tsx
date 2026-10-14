import { Search, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MOCK_CUSTOMERS } from "@/lib/mock-data/textile-data";
import { formatINR } from "@/lib/utils";
import { CustomerModal } from "@/components/customers/customer-modal";
import { getCustomersAction } from "@/lib/actions/customer-actions";
import { PaymentModal } from "@/components/customers/payment-modal";
import { requireAdmin } from "@/lib/auth/guards";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireAdmin();
  const { q } = await searchParams;
  const res = await getCustomersAction();
  const allCustomers = res.success && res.data && res.data.length > 0 ? res.data : MOCK_CUSTOMERS;
  const needle = (q ?? "").trim().toLowerCase();
  const customers = needle
    ? allCustomers.filter((c) =>
        [c.name, c.businessName, c.city, c.phone, c.email, c.segment].join(" ").toLowerCase().includes(needle)
      )
    : allCustomers;
  const totalOutstanding = allCustomers.reduce((sum, c) => sum + c.outstandingBalanceINR, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Customer Accounts & Wholesalers
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Manage buyer profiles, credit limits, RFM segmentation tags, and order history
          </p>
        </div>

        <CustomerModal />
      </div>

      {/* Search + receivables summary */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <form method="get" className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search customer, business, city, phone..."
            className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          />
        </form>
        <div className="text-xs text-slate-500">
          Total receivable:{" "}
          <span className="font-bold text-amber-700">{formatINR(totalOutstanding)}</span>
          {needle && <span className="ml-2">· {customers.length} match(es)</span>}
        </div>
      </div>

      {/* Customers Data Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Customer & Business</th>
                  <th className="px-4 py-3">City / Location</th>
                  <th className="px-4 py-3">AI Segment Tag</th>
                  <th className="px-4 py-3 text-center">Total Orders</th>
                  <th className="px-4 py-3 text-right">Lifetime Sales</th>
                  <th className="px-4 py-3 text-right">Credit Limit</th>
                  <th className="px-4 py-3 text-right">Outstanding Balance</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900">{customer.name}</div>
                      <div className="text-[11px] text-slate-400">{customer.businessName}</div>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-700">{customer.city}</td>
                    <td className="px-4 py-3.5">
                      <Badge
                        variant={
                          customer.segment === "VIP Wholesaler"
                            ? "purple"
                            : customer.segment === "Regular Retailer"
                            ? "default"
                            : customer.segment === "At-Risk"
                            ? "destructive"
                            : "secondary"
                        }
                        className="text-[11px]"
                      >
                        {customer.segment}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-center font-bold text-slate-900">
                      {customer.totalOrdersCount}
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-indigo-700">
                      {formatINR(customer.totalPurchasesINR)}
                    </td>
                    <td className="px-4 py-3.5 text-right text-slate-600">
                      {formatINR(customer.creditLimitINR)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-amber-700">
                      {formatINR(customer.outstandingBalanceINR)}
                      {customer.outstandingBalanceINR > customer.creditLimitINR && (
                        <div className="text-[10px] font-semibold text-rose-600">Over credit limit</div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                      <PaymentModal customer={customer} />
                      <CustomerModal 
                        customer={customer} 
                        trigger={
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        }
                      />
                      </div>
                    </td>
                  </tr>
                ))}
                {customers.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-sm text-slate-400">
                      No customers match your search.
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
