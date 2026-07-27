import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ProductModal } from "@/components/products/product-modal";
import { getProductsAction } from "@/lib/actions/product-actions";
import { MOCK_PRODUCTS } from "@/lib/mock-data/textile-data";
import { formatINR } from "@/lib/utils";

export default async function ProductsPage() {
  const res = await getProductsAction();
  const products = res.success && res.data && res.data.length > 0 ? res.data : MOCK_PRODUCTS;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Textile Catalog & Fabrics
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Manage sarees, fabrics, dress materials, GSM, weaves, and stock pricing
          </p>
        </div>

        <ProductModal />
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by SKU, fabric type (Silk, Cotton, Georgette)..."
            className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="text-xs h-10 gap-1.5 font-semibold text-slate-600">
            <Filter className="h-4 w-4" />
            <span>Filter Category</span>
          </Button>
        </div>
      </div>

      {/* Products Data Table */}
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
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900">{product.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{product.sku}</div>
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
                    <td className="px-4 py-3.5 text-right text-slate-500">
                      {formatINR(product.mrp)}
                    </td>
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
