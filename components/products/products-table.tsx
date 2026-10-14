"use client";

import { useMemo, useState } from "react";
import { Search, Filter, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { RestockModal } from "@/components/inventory/restock-modal";
import { PriceBreakdownModal } from "@/components/products/price-breakdown-modal";
import { formatINR } from "@/lib/utils";
import type { Product } from "@/lib/types";

const STATUSES: Product["status"][] = ["In Stock", "Low Stock", "Out of Stock", "Overstocked"];

interface ProductsTableProps {
  products: Product[];
  initialQuery?: string;
}

export function ProductsTable({ products, initialQuery = "" }: ProductsTableProps) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category))).sort(),
    [products]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (status !== "all" && p.status !== status) return false;
      if (!q) return true;
      return [p.name, p.sku, p.fabricType, p.weaveType, p.color, p.category, p.supplierName]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [products, query, category, status]);

  const hasFilters = query !== "" || category !== "all" || status !== "all";

  return (
    <>
      <div className="flex flex-col gap-3 md:flex-row md:items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, SKU, fabric, colour, supplier..."
            className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400 hidden md:block" />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Filter by category"
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 focus:border-indigo-500 focus:outline-hidden"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            aria-label="Filter by stock status"
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 focus:border-indigo-500 focus:outline-hidden"
          >
            <option value="all">All Stock Status</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {hasFilters && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setCategory("all");
                setStatus("all");
              }}
              className="inline-flex h-10 items-center gap-1 rounded-lg px-3 text-xs font-semibold text-slate-500 hover:bg-slate-100 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" /> Clear
            </button>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-500">
        Showing <span className="font-bold text-slate-700">{filtered.length}</span> of {products.length} products
      </p>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">SKU & Product Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Fabric & Weave</th>
                  <th className="px-4 py-3">GSM</th>
                  <th className="px-4 py-3 text-right">Wholesale Price</th>
                  <th className="px-4 py-3 text-right">Retail MRP</th>
                  <th className="px-4 py-3 text-center">Stock Available</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-10 text-center text-sm text-slate-400">
                      No products match your search or filters.
                    </td>
                  </tr>
                )}
                {filtered.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 rounded-md bg-slate-100 overflow-hidden border border-slate-200 flex items-center justify-center">
                          {product.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-[10px] font-semibold text-slate-400">NO IMG</span>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{product.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{product.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant="secondary" className="text-[10px]">
                        {product.category}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="text-slate-800">{product.fabricType}</div>
                      <div className="text-[11px] text-slate-400">{product.weaveType}</div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-700">{product.gsm ? `${product.gsm} gsm` : "N/A"}</td>
                    <td className="px-4 py-3.5 text-right font-bold text-indigo-700">
                      {formatINR(product.unitPrice)}
                    </td>
                    <td className="px-4 py-3.5 text-right text-slate-500">{formatINR(product.mrp)}</td>
                    <td className="px-4 py-3.5 text-center font-bold text-slate-900">
                      {product.stockQuantity} {product.unitOfMeasure}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <Badge
                        variant={
                          product.status === "In Stock"
                            ? "success"
                            : product.status === "Low Stock"
                            ? "warning"
                            : "destructive"
                        }
                        className="text-[11px]"
                      >
                        {product.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <PriceBreakdownModal product={product} />
                        <RestockModal product={product} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
