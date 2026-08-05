"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Loader2, X, FileText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Customer, Product } from "@/lib/types";
import { createSaleAction } from "@/lib/actions/sale-actions";
import { getCustomersAction } from "@/lib/actions/customer-actions";
import { getProductsAction } from "@/lib/actions/product-actions";

interface SaleModalProps {
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function SaleModal({ onSuccess, trigger }: SaleModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [paymentMode, setPaymentMode] = useState("Bank Transfer");
  const [paymentStatus, setPaymentStatus] = useState("Paid");
  const [discountPercent, setDiscountPercent] = useState(0);

  const [items, setItems] = useState<
    { productId: string; quantity: number; unitPrice: number; productName: string }[]
  >([{ productId: "", quantity: 1, unitPrice: 0, productName: "" }]);

  useEffect(() => {
    if (isOpen) {
      const loadData = async () => {
        setFetching(true);
        try {
          const [custRes, prodRes] = await Promise.all([
            getCustomersAction(),
            getProductsAction(),
          ]);
          if (custRes.success && custRes.data) setCustomers(custRes.data);
          if (prodRes.success && prodRes.data) setProducts(prodRes.data.filter(p => p.stockQuantity > 0));
        } catch (err) {
          console.error(err);
        } finally {
          setFetching(false);
        }
      };
      loadData();
    }
  }, [isOpen]);

  const handleProductSelect = (index: number, productId: string) => {
    const product = products.find((p) => p.id === productId);
    const newItems = [...items];
    if (product) {
      newItems[index] = {
        ...newItems[index],
        productId,
        productName: product.name,
        unitPrice: product.unitPrice,
      };
    } else {
      newItems[index] = { ...newItems[index], productId: "", productName: "", unitPrice: 0 };
    }
    setItems(newItems);
  };

  const handleQuantityChange = (index: number, qty: number) => {
    const newItems = [...items];
    newItems[index].quantity = qty;
    setItems(newItems);
  };

  const addLineItem = () => {
    setItems([...items, { productId: "", quantity: 1, unitPrice: 0, productName: "" }]);
  };

  const removeLineItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  // Calculations
  const { subtotal, tax, discount, total } = useMemo(() => {
    let sub = 0;
    let taxAmt = 0;

    items.forEach((item) => {
      const lineTotal = item.quantity * item.unitPrice;
      sub += lineTotal;
      // Indian Textile GST Rule: 5% if < 1000, 12% if >= 1000
      const gstRate = item.unitPrice < 1000 ? 0.05 : 0.12;
      taxAmt += lineTotal * gstRate;
    });

    const discAmt = sub * (discountPercent / 100);
    const finalTotal = sub + taxAmt - discAmt;

    return { subtotal: sub, tax: taxAmt, discount: discAmt, total: finalTotal };
  }, [items, discountPercent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      setError("Please select a customer.");
      return;
    }
    if (items.some((i) => !i.productId || i.quantity <= 0)) {
      setError("Please ensure all items have a valid product and quantity.");
      return;
    }

    setLoading(true);
    setError(null);

    const customer = customers.find((c) => c.id === selectedCustomerId);

    const saleData = {
      customerId: selectedCustomerId,
      customerName: customer?.businessName || "Unknown",
      items: items.map(i => ({
        ...i,
        totalPrice: i.quantity * i.unitPrice
      })),
      subtotalINR: subtotal,
      taxINR: tax,
      discountINR: discount,
      totalINR: total,
      paymentMode,
      paymentStatus,
      salesPerson: "Khushi Soni", // In a real app with Auth, this comes from session
    };

    try {
      const res = await createSaleAction(saleData);
      if (res.success) {
        setIsOpen(false);
        // Reset state
        setItems([{ productId: "", quantity: 1, unitPrice: 0, productName: "" }]);
        setSelectedCustomerId("");
        setDiscountPercent(0);
        if (onSuccess) onSuccess();
      } else {
        setError(res.error || "Failed to create invoice");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const defaultTrigger = (
    <Button
      onClick={() => setIsOpen(true)}
      className="text-xs h-10 gap-1.5 font-semibold bg-indigo-600 hover:bg-indigo-700 text-white"
    >
      <Plus className="h-4 w-4" />
      <span>New Sale Invoice</span>
    </Button>
  );

  return (
    <>
      <div onClick={() => setIsOpen(true)} className="inline-block cursor-pointer">
        {trigger || defaultTrigger}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-3xl rounded-xl bg-white p-6 shadow-xl border border-slate-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-900">Create Sale Invoice</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {fetching ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-xs font-medium border border-rose-100">
                    {error}
                  </div>
                )}

                {/* Customer & Payment Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Customer / Wholesaler</label>
                    <select
                      value={selectedCustomerId}
                      onChange={(e) => setSelectedCustomerId(e.target.value)}
                      required
                      className="w-full h-9 rounded-md border border-slate-200 px-2 text-xs focus:border-indigo-500 focus:outline-hidden"
                    >
                      <option value="">Select Customer...</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.businessName} ({c.name})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Payment Mode</label>
                    <select
                      value={paymentMode}
                      onChange={(e) => setPaymentMode(e.target.value)}
                      className="w-full h-9 rounded-md border border-slate-200 px-2 text-xs focus:border-indigo-500 focus:outline-hidden"
                    >
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="UPI">UPI</option>
                      <option value="Cash">Cash</option>
                      <option value="Credit Line">Credit Line</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Payment Status</label>
                    <select
                      value={paymentStatus}
                      onChange={(e) => setPaymentStatus(e.target.value)}
                      className="w-full h-9 rounded-md border border-slate-200 px-2 text-xs focus:border-indigo-500 focus:outline-hidden"
                    >
                      <option value="Paid">Paid</option>
                      <option value="Pending">Pending</option>
                      <option value="Partially Paid">Partially Paid</option>
                    </select>
                  </div>
                </div>

                {/* Line Items */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900">Order Items</h4>
                    <Button type="button" variant="outline" size="sm" onClick={addLineItem} className="h-7 text-[11px]">
                      + Add Item
                    </Button>
                  </div>

                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                        <tr>
                          <th className="px-3 py-2 w-1/2">Product (Fabric SKU)</th>
                          <th className="px-3 py-2 w-24 text-center">Qty</th>
                          <th className="px-3 py-2 text-right">Unit Price</th>
                          <th className="px-3 py-2 text-right">Total</th>
                          <th className="px-3 py-2 w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {items.map((item, index) => (
                          <tr key={index}>
                            <td className="p-2">
                              <select
                                value={item.productId}
                                onChange={(e) => handleProductSelect(index, e.target.value)}
                                className="w-full h-8 rounded-md border border-slate-200 px-2 text-[11px] focus:border-indigo-500 focus:outline-hidden"
                              >
                                <option value="">Select Product...</option>
                                {products.map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {p.name} ({p.sku}) - ₹{p.unitPrice}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                min={1}
                                value={item.quantity}
                                onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 0)}
                                className="w-full h-8 rounded-md border border-slate-200 px-2 text-[11px] text-center focus:border-indigo-500 focus:outline-hidden"
                              />
                            </td>
                            <td className="p-2 text-right font-medium text-slate-600">
                              ₹{item.unitPrice.toLocaleString('en-IN')}
                            </td>
                            <td className="p-2 text-right font-bold text-slate-900">
                              ₹{(item.quantity * item.unitPrice).toLocaleString('en-IN')}
                            </td>
                            <td className="p-2 text-center">
                              {items.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeLineItem(index)}
                                  className="text-slate-400 hover:text-red-500 p-1"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Totals Calculation */}
                <div className="flex justify-between items-start">
                  <div className="w-1/3 space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Special Discount (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(Number(e.target.value) || 0)}
                      className="w-full h-9 rounded-md border border-slate-200 px-3 text-xs focus:border-indigo-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="w-1/3 bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal:</span>
                      <span className="font-medium">₹{subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>GST (5% or 12%):</span>
                      <span className="font-medium">+ ₹{tax.toLocaleString('en-IN')}</span>
                    </div>
                    {discountPercent > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount ({discountPercent}%):</span>
                        <span className="font-medium">- ₹{discount.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <div className="pt-2 mt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-slate-900">
                      <span>Grand Total:</span>
                      <span>₹{total.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
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
                    disabled={loading || items.length === 0}
                    className="text-xs h-9 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold min-w-32"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Generate Invoice"}
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
