import { Plus, Search, Users, ShieldAlert, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MOCK_CUSTOMERS } from "@/lib/mock-data/textile-data";
import { formatINR } from "@/lib/utils";

export default function CustomersPage() {
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

        <Button className="text-xs h-10 gap-1.5 font-semibold bg-indigo-600 hover:bg-indigo-700">
          <Plus className="h-4 w-4" />
          <span>Register New Customer</span>
        </Button>
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
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {MOCK_CUSTOMERS.map((customer) => (
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
