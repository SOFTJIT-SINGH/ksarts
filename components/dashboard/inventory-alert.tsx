import Link from "next/link";
import { AlertTriangle, ArrowRight, PackageX, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Product } from "@/lib/types";

interface InventoryAlertProps {
  products: Product[];
}

export function InventoryAlert({ products }: InventoryAlertProps) {
  const lowStockItems = products.filter(
    (p) => p.status === "Low Stock" || p.status === "Out of Stock"
  );

  return (
    <Card className="col-span-full lg:col-span-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base font-bold">Stock Restock Alerts</CardTitle>
              <CardDescription className="text-xs">
                Items below critical reorder threshold
              </CardDescription>
            </div>
          </div>
          <Badge variant="warning" className="text-[11px]">
            {lowStockItems.length} Warnings
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-2">
        {lowStockItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <PackageX className="h-8 w-8 text-slate-300 mb-2" />
            <p className="text-xs text-slate-500">All fabric stocks are healthy</p>
          </div>
        ) : (
          lowStockItems.map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/60 p-3 transition-colors hover:bg-slate-100/60"
            >
              <div className="flex flex-col min-w-0 pr-2">
                <span className="text-xs font-semibold text-slate-900 truncate">
                  {product.name}
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] text-slate-500 truncate">{product.category}</span>
                  <span className="text-[10px] text-slate-400">•</span>
                  <span className="text-[11px] font-bold text-amber-700">
                    {product.stockQuantity} {product.unitOfMeasure} left
                  </span>
                </div>
              </div>

              <Badge
                variant={product.status === "Out of Stock" ? "destructive" : "warning"}
                className="shrink-0 text-[10px]"
              >
                {product.status}
              </Badge>
            </div>
          ))
        )}

        <div className="pt-2">
          <Link href="/inventory" className="w-full">
            <Button variant="outline" className="w-full text-xs h-9 justify-between font-semibold">
              <span>View Full Inventory Manager</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
