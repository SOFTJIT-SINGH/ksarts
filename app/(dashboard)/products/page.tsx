import { ProductModal } from "@/components/products/product-modal";
import { ProductsTable } from "@/components/products/products-table";
import { getProductsAction } from "@/lib/actions/product-actions";
import { MOCK_PRODUCTS } from "@/lib/mock-data/textile-data";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
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

      {/* key remounts the table when the navbar search changes ?q= */}
      <ProductsTable key={q ?? ""} products={products} initialQuery={q ?? ""} />
    </div>
  );
}
