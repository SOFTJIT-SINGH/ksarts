"use server";

import { supabase } from "@/lib/supabase/client";
import { getCurrentUserAction } from "@/lib/actions/auth-actions";

export interface NotificationItem {
  id: string;
  kind: "stock" | "payment";
  severity: "critical" | "warning";
  title: string;
  detail: string;
  href: string;
}

export interface SearchResult {
  id: string;
  type: "Product" | "Customer" | "Invoice";
  title: string;
  subtitle: string;
  href: string;
}

/**
 * Live alerts for the navbar bell: out-of-stock / low-stock products and
 * pending customer payments (admins only see the customer receivables).
 */
export async function getNotificationsAction(): Promise<{ success: boolean; items: NotificationItem[] }> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return { success: true, items: [] };
    const current = await getCurrentUserAction();
    if (!current.success || !current.user) return { success: false, items: [] };

    const items: NotificationItem[] = [];

    const { data: products } = await supabase
      .from("products")
      .select("id, name, sku, stockQuantity, reorderLevel, unitOfMeasure")
      .order("stockQuantity", { ascending: true });

    // Judge from the live numbers (the stored status column can be stale)
    const atRisk = (products ?? [])
      .filter((p) => Number(p.stockQuantity) <= Number(p.reorderLevel))
      .slice(0, 15);

    for (const p of atRisk) {
      const out = Number(p.stockQuantity) <= 0;
      items.push({
        id: `stock-${p.id}`,
        kind: "stock",
        severity: out ? "critical" : "warning",
        title: out ? `${p.name} is out of stock` : `${p.name} is running low`,
        detail: out
          ? `${p.sku} · restock to continue selling`
          : `${p.sku} · ${p.stockQuantity} ${p.unitOfMeasure} left (reorder at ${p.reorderLevel})`,
        href: "/inventory",
      });
    }

    if (current.user.role === "admin") {
      const { data: customers } = await supabase
        .from("customers")
        .select("id, businessName, outstandingBalanceINR, creditLimitINR")
        .gt("outstandingBalanceINR", 0)
        .order("outstandingBalanceINR", { ascending: false })
        .limit(10);

      for (const c of customers ?? []) {
        const outstanding = Number(c.outstandingBalanceINR);
        const over = outstanding > Number(c.creditLimitINR);
        items.push({
          id: `pay-${c.id}`,
          kind: "payment",
          severity: over ? "critical" : "warning",
          title: over ? `${c.businessName} exceeded credit limit` : `${c.businessName} has a pending balance`,
          detail: `₹${outstanding.toLocaleString("en-IN")} outstanding`,
          href: `/customers?q=${encodeURIComponent(c.businessName)}`,
        });
      }
    }

    items.sort((a, b) => (a.severity === b.severity ? 0 : a.severity === "critical" ? -1 : 1));
    return { success: true, items };
  } catch (error) {
    console.error("Notifications error:", error);
    return { success: false, items: [] };
  }
}

// Strip characters that have meaning inside a PostgREST .or() filter string.
function sanitize(q: string) {
  return q.replace(/[,()%*\\]/g, " ").trim();
}

/** Global navbar search across products, customers (admin) and invoices. */
export async function globalSearchAction(rawQuery: string): Promise<{ success: boolean; results: SearchResult[] }> {
  try {
    const q = sanitize(rawQuery ?? "");
    if (q.length < 2 || !process.env.NEXT_PUBLIC_SUPABASE_URL) return { success: true, results: [] };
    const current = await getCurrentUserAction();
    if (!current.success || !current.user) return { success: false, results: [] };

    const like = `%${q}%`;
    const results: SearchResult[] = [];

    const [products, sales, customers] = await Promise.all([
      supabase
        .from("products")
        .select("id, name, sku, fabricType, category")
        .or(`name.ilike.${like},sku.ilike.${like},fabricType.ilike.${like},color.ilike.${like}`)
        .limit(5),
      supabase
        .from("sales")
        .select("id, invoiceNumber, customerName, totalINR")
        .or(`invoiceNumber.ilike.${like},customerName.ilike.${like}`)
        .limit(4),
      current.user.role === "admin"
        ? supabase
            .from("customers")
            .select("id, name, businessName, city")
            .or(`name.ilike.${like},businessName.ilike.${like},city.ilike.${like},phone.ilike.${like}`)
            .limit(4)
        : Promise.resolve({ data: [] as any[] }),
    ]);

    for (const p of products.data ?? []) {
      results.push({
        id: `p-${p.id}`,
        type: "Product",
        title: p.name,
        subtitle: `${p.sku} · ${p.fabricType} · ${p.category}`,
        href: `/products?q=${encodeURIComponent(p.sku)}`,
      });
    }
    for (const c of (customers.data ?? []) as any[]) {
      results.push({
        id: `c-${c.id}`,
        type: "Customer",
        title: c.businessName,
        subtitle: `${c.name} · ${c.city}`,
        href: `/customers?q=${encodeURIComponent(c.businessName)}`,
      });
    }
    for (const s of sales.data ?? []) {
      results.push({
        id: `s-${s.id}`,
        type: "Invoice",
        title: s.invoiceNumber,
        subtitle: `${s.customerName} · ₹${Number(s.totalINR).toLocaleString("en-IN")}`,
        href: `/sales?q=${encodeURIComponent(s.invoiceNumber)}`,
      });
    }

    return { success: true, results };
  } catch (error) {
    console.error("Global search error:", error);
    return { success: false, results: [] };
  }
}
