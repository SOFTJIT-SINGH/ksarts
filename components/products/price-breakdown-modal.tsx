"use client";

import { useState } from "react";
import { IndianRupee, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPriceBreakdown } from "@/lib/pricing";
import { formatINR } from "@/lib/utils";
import type { Product } from "@/lib/types";

function Row({ label, value, strong, tone }: { label: string; value: string; strong?: boolean; tone?: "good" | "muted" }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-xs">
      <span className={tone === "muted" ? "text-slate-400" : "text-slate-600"}>{label}</span>
      <span
        className={`${strong ? "font-bold text-slate-900" : "font-semibold text-slate-700"} ${
          tone === "good" ? "text-emerald-700" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}

export function PriceBreakdownModal({ product }: { product: Product }) {
  const [isOpen, setIsOpen] = useState(false);
  const b = getPriceBreakdown(product);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 gap-1"
        onClick={() => setIsOpen(true)}
      >
        <IndianRupee className="h-3.5 w-3.5" />
        Price
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs text-left">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl border border-slate-200">
            <div className="flex items-start justify-between border-b border-slate-100 p-5">
              <div className="min-w-0">
                <h3 className="text-base font-bold text-slate-900">Price Breakdown</h3>
                <p className="text-xs text-slate-500 truncate">{product.name}</p>
                <p className="text-[11px] text-slate-400 font-mono">{product.sku}</p>
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

            <div className="p-5 space-y-4">
              <section>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Per {product.unitOfMeasure === "Meters" ? "metre" : product.unitOfMeasure === "Rolls" ? "roll" : "piece"} (wholesale billing)
                </h4>
                <div className="divide-y divide-slate-100">
                  <Row label="Wholesale price (ex-GST)" value={formatINR(b.wholesalePrice)} strong />
                  <Row label={`GST @ ${b.gstRatePercent}%`} value={`+ ${formatINR(b.gstAmount)}`} />
                  <Row label={`  CGST ${b.gstRatePercent / 2}% (intra-state)`} value={formatINR(b.cgst)} tone="muted" />
                  <Row label={`  SGST ${b.gstRatePercent / 2}% (intra-state)`} value={formatINR(b.sgst)} tone="muted" />
                  <Row label="Wholesale price incl. GST" value={formatINR(b.wholesaleInclGst)} strong />
                </div>
              </section>

              <section>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Retail margin
                </h4>
                <div className="divide-y divide-slate-100">
                  <Row label="Retail MRP" value={formatINR(b.mrp)} strong />
                  <Row
                    label="Margin per unit (MRP − wholesale)"
                    value={formatINR(b.marginPerUnit)}
                    tone={b.marginPerUnit >= 0 ? "good" : undefined}
                  />
                  <Row label="Margin on wholesale price" value={`${b.marginPercent.toFixed(1)}%`} />
                </div>
              </section>

              <section>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Stock on hand ({b.stockQuantity} {product.unitOfMeasure})
                </h4>
                <div className="divide-y divide-slate-100">
                  <Row label="Stock value at wholesale" value={formatINR(b.stockValueWholesale)} strong />
                  <Row label="Stock value at MRP" value={formatINR(b.stockValueMrp)} />
                  <Row label="Potential profit if sold at MRP" value={formatINR(b.potentialProfit)} tone="good" />
                </div>
              </section>

              <p className="text-[10px] leading-relaxed text-slate-400">
                GST slab used by the invoice builder: 5% when the unit price is below ₹1,000, else 12%.
                Inter-state sales charge the full amount as IGST.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
