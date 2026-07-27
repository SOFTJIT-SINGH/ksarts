"use client";

import { useState } from "react";
import { Plus, Loader2, X, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCategory, Product } from "@/lib/types";
import { createProductAction } from "@/lib/actions/product-actions";

interface ProductModalProps {
  onSuccess?: () => void;
}

export function ProductModal({ onSuccess }: ProductModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    sku: "TXT-501",
    name: "",
    category: "Silk Sarees" as ProductCategory,
    fabricType: "Katan Silk",
    weaveType: "Jacquard Weave",
    gsm: 120,
    color: "Red",
    unitPrice: 5000,
    mrp: 8500,
    stockQuantity: 50,
    unitOfMeasure: "Pieces" as Product["unitOfMeasure"],
    reorderLevel: 15,
    supplierName: "Surat Heritage Weavers",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await createProductAction(formData);
      if (res.success) {
        setIsOpen(false);
        if (onSuccess) onSuccess();
      } else {
        setError(res.error || "Failed to create product");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="text-xs h-10 gap-1.5 font-semibold bg-indigo-600 hover:bg-indigo-700 text-white"
      >
        <Plus className="h-4 w-4" />
        <span>Add Fabric SKU</span>
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-900">Add New Textile Fabric SKU</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-xs font-medium">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">SKU Code</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full h-9 rounded-md border border-slate-200 px-3 text-xs focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as ProductCategory })
                    }
                    className="w-full h-9 rounded-md border border-slate-200 px-2 text-xs focus:border-indigo-500 focus:outline-hidden"
                  >
                    <option value="Silk Sarees">Silk Sarees</option>
                    <option value="Cotton Fabrics">Cotton Fabrics</option>
                    <option value="Dress Material">Dress Material</option>
                    <option value="Suiting & Shirting">Suiting & Shirting</option>
                    <option value="Linen Collection">Linen Collection</option>
                    <option value="Designer Lehengas">Designer Lehengas</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kanchipuram Brocade Silk Saree"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full h-9 rounded-md border border-slate-200 px-3 text-xs focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Fabric Type</label>
                  <input
                    type="text"
                    value={formData.fabricType}
                    onChange={(e) => setFormData({ ...formData, fabricType: e.target.value })}
                    className="w-full h-9 rounded-md border border-slate-200 px-3 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Weave Type</label>
                  <input
                    type="text"
                    value={formData.weaveType}
                    onChange={(e) => setFormData({ ...formData, weaveType: e.target.value })}
                    className="w-full h-9 rounded-md border border-slate-200 px-3 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">GSM</label>
                  <input
                    type="number"
                    value={formData.gsm}
                    onChange={(e) => setFormData({ ...formData, gsm: Number(e.target.value) })}
                    className="w-full h-9 rounded-md border border-slate-200 px-3 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Wholesale Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
                    className="w-full h-9 rounded-md border border-slate-200 px-3 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Retail MRP (₹)</label>
                  <input
                    type="number"
                    required
                    value={formData.mrp}
                    onChange={(e) => setFormData({ ...formData, mrp: Number(e.target.value) })}
                    className="w-full h-9 rounded-md border border-slate-200 px-3 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Stock Qty</label>
                  <input
                    type="number"
                    required
                    value={formData.stockQuantity}
                    onChange={(e) =>
                      setFormData({ ...formData, stockQuantity: Number(e.target.value) })
                    }
                    className="w-full h-9 rounded-md border border-slate-200 px-3 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  className="text-xs h-9"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="text-xs h-9 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Fabric SKU"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
