import { Boxes, AlertTriangle, RefreshCw, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MOCK_PRODUCTS } from "@/lib/mock-data/textile-data";

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Inventory & Stock Manager
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Monitor real-time meters and pieces available, reorder thresholds, and dead stock risk
          </p>
        </div>

        <Button className="text-xs h-10 gap-1.5 font-semibold bg-indigo-600 hover:bg-indigo-700">
          <RefreshCw className="h-4 w-4" />
          <span>Trigger Reorder Order</span>
        </Button>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Product Name & SKU</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3 text-center">Current Stock</th>
                  <th className="px-4 py-3 text-center">Reorder Threshold</th>
                  <th className="px-4 py-3">Supplier Name</th>
                  <th className="px-4 py-3 text-center">Stock Condition</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {MOCK_PRODUCTS.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900">{product.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{product.sku}</div>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-700">{product.category}</td>
                    <td className="px-4 py-3.5 text-center font-bold text-slate-900">
                      {product.stockQuantity} {product.unitOfMeasure}
                    </td>
                    <td className="px-4 py-3.5 text-center text-slate-500">
                      {product.reorderLevel} {product.unitOfMeasure}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">{product.supplierName}</td>
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
                    <td className="px-4 py-3.5 text-right">
                      <Button variant="outline" size="sm" className="h-8 text-xs font-semibold">
                        Restock +
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
