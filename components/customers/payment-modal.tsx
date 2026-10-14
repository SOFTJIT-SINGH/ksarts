"use client";

import { useState } from "react";
import { Wallet, X, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { recordCustomerPaymentAction } from "@/lib/actions/customer-actions";
import { formatINR } from "@/lib/utils";
import type { Customer } from "@/lib/types";

export function PaymentModal({ customer }: { customer: Customer }) {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const outstanding = customer.outstandingBalanceINR;
  const pay = Number(amount) || 0;
  const remaining = Math.max(0, outstanding - pay);
  const creditUsed = customer.creditLimitINR > 0 ? (outstanding / customer.creditLimitINR) * 100 : 0;

  const open = () => {
    setAmount("");
    setError(null);
    setDone(null);
    setIsOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (pay <= 0) {
      setError("Enter an amount greater than 0.");
      return;
    }
    if (pay > outstanding) {
      setError(`Amount cannot exceed the outstanding balance (${formatINR(outstanding)}).`);
      return;
    }
    setLoading(true);
    try {
      const res = await recordCustomerPaymentAction(customer.id, pay);
      if (res.success) {
        setDone(
          `Recorded ${formatINR(pay)}. ${
            res.settledInvoices ? `${res.settledInvoices} invoice(s) marked Paid. ` : ""
          }Remaining balance: ${formatINR(res.remaining ?? 0)}.`
        );
      } else {
        setError(res.error || "Failed to record payment");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="h-8 text-xs font-semibold gap-1 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
        onClick={open}
        disabled={outstanding <= 0}
        title={outstanding <= 0 ? "No outstanding balance" : "Record a payment"}
      >
        <Wallet className="h-3.5 w-3.5" />
        {outstanding <= 0 ? "Settled" : "Receive"}
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs text-left">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl border border-slate-200">
            <div className="flex items-start justify-between border-b border-slate-100 p-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">Receive Payment</h3>
                <p className="text-xs text-slate-500">{customer.businessName} · {customer.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {done ? (
              <div className="p-5 space-y-4">
                <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{done}</span>
                </div>
                <div className="flex justify-end">
                  <Button className="h-9 min-h-9 text-xs" onClick={() => setIsOpen(false)}>
                    Done
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={submit} className="p-5 space-y-4">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                    <div className="text-[10px] font-semibold uppercase text-slate-400">Outstanding</div>
                    <div className="text-sm font-bold text-amber-700">{formatINR(outstanding)}</div>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                    <div className="text-[10px] font-semibold uppercase text-slate-400">Credit Limit</div>
                    <div className="text-sm font-bold text-slate-800">{formatINR(customer.creditLimitINR)}</div>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                    <div className="text-[10px] font-semibold uppercase text-slate-400">Credit Used</div>
                    <div className={`text-sm font-bold ${creditUsed > 100 ? "text-rose-600" : "text-slate-800"}`}>
                      {creditUsed.toFixed(0)}%
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700" htmlFor={`pay-${customer.id}`}>
                    Amount received (₹)
                  </label>
                  <input
                    id={`pay-${customer.id}`}
                    type="number"
                    min={1}
                    max={outstanding}
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 25000"
                    className="w-full h-10 rounded-md border border-slate-200 px-3 text-sm focus:border-indigo-500 focus:outline-hidden"
                    autoFocus
                  />
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {[25, 50, 100].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setAmount(String(Math.round(outstanding * pct) / 100))}
                        className="rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 cursor-pointer"
                      >
                        {pct === 100 ? "Settle in full" : `${pct}%`}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-indigo-100 bg-indigo-50/60 p-3 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Balance after this payment</span>
                    <span className="font-bold text-slate-900">{formatINR(remaining)}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Payments clear the oldest unpaid invoices first.
                  </p>
                </div>

                {error && <p className="text-xs font-semibold text-rose-500">{error}</p>}

                <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                  <Button type="button" variant="ghost" className="h-9 min-h-9 text-xs" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || pay <= 0}
                    className="h-9 min-h-9 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold min-w-32"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Record Payment"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
