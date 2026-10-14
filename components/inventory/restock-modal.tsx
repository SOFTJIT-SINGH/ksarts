"use client";

import { useState } from "react";
import { Plus, Minus, Loader2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateProductStockAction } from "@/lib/actions/product-actions";
import { computeStockStatus } from "@/lib/pricing";
import { formatINR } from "@/lib/utils";
import type { Product } from "@/lib/types";

export function RestockModal({ product }: { product: Product }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(10);
  const [error, setError] = useState<string | null>(null);

  const newStock = product.stockQuantity + (quantity > 0 ? quantity : 0);
  const newStatus = computeStockStatus(newStock, product.reorderLevel);
  const currentValue = product.stockQuantity * product.unitPrice;
  const newValue = newStock * product.unitPrice;

  const close = () => {
    setIsOpen(false);
    setError(null);
    setQuantity(10);
  };

  const handleRestock = async () => {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      setError("Enter a whole number greater than 0.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await updateProductStockAction(product.id, quantity);
      if (res.success) {
        close();
      } else {
        setError(res.error || "Failed to update stock");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="h-8 text-xs font-semibold"
        onClick={() => setIsOpen(true)}
      >
        Restock +
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 text-left">
      <div className="w-full max-w-sm rounded-xl bg-white shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
              <Package className="h-5 w-5 text-indigo-600" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-slate-900">Restock Product</h2>
              <p className="text-xs text-slate-500 truncate">{product.name}</p>
              <p className="text-[11px] text-slate-400 font-mono">{product.sku}</p>
            </div>
          </div>

          {/* Current position */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="text-[10px] font-semibold uppercase text-slate-400">Current Stock</div>
              <div className="text-base font-bold text-slate-900">
                {product.stockQuantity} <span className="text-xs font-medium text-slate-500">{product.unitOfMeasure}</span>
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="text-[10px] font-semibold uppercase text-slate-400">Current Value</div>
              <div className="text-base font-bold text-slate-900">{formatINR(currentValue)}</div>
              <div className="text-[10px] text-slate-400">@ {formatINR(product.unitPrice)} wholesale</div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-2">
                Quantity to Add ({product.unitOfMeasure})
              </label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 min-h-9 shrink-0"
                  onClick={() => setQuantity(Math.max(1, quantity - 10))}
                  disabled={loading}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={quantity || ""}
                  onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 0)}
                  className="h-9 w-full rounded-md border border-slate-200 px-3 text-center text-sm font-semibold"
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 min-h-9 shrink-0"
                  onClick={() => setQuantity(quantity + 10)}
                  disabled={loading}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* After restock preview */}
            <div className="rounded-lg border border-indigo-100 bg-indigo-50/60 p-3 text-xs space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>{product.stockQuantity} + {quantity > 0 ? quantity : 0}</span>
                <span className="font-bold text-slate-900">
                  = {newStock} {product.unitOfMeasure}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>New stock value</span>
                <span className="font-bold text-slate-900">{formatINR(newValue)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Status after restock</span>
                <span className="font-bold text-slate-900">{newStatus}</span>
              </div>
            </div>

            {error && <p className="text-xs font-semibold text-rose-500">{error}</p>}
          </div>
        </div>

        <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end gap-2">
          <Button variant="ghost" className="text-xs h-9 min-h-9" onClick={close} disabled={loading}>
            Cancel
          </Button>
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-9 min-h-9"
            onClick={handleRestock}
            disabled={loading || quantity <= 0}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                Updating...
              </>
            ) : (
              "Confirm Restock"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
