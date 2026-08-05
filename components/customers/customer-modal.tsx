"use client";

import { useState, useEffect } from "react";
import { Plus, Loader2, X, Users, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Customer, CustomerSegment } from "@/lib/types";
import { createCustomerAction, updateCustomerAction } from "@/lib/actions/customer-actions";

interface CustomerModalProps {
  customer?: Customer;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function CustomerModal({ customer, onSuccess, trigger }: CustomerModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!customer;

  const [formData, setFormData] = useState({
    name: "",
    businessName: "",
    phone: "",
    email: "",
    city: "",
    segment: "Regular Retailer" as CustomerSegment,
    creditLimitINR: 100000,
  });

  useEffect(() => {
    if (customer && isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        name: customer.name,
        businessName: customer.businessName,
        phone: customer.phone,
        email: customer.email,
        city: customer.city,
        segment: customer.segment,
        creditLimitINR: customer.creditLimitINR,
      });
    }
  }, [customer, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let res;
      if (isEditing && customer) {
        res = await updateCustomerAction(customer.id, formData);
      } else {
        res = await createCustomerAction(formData);
      }
      
      if (res.success) {
        setIsOpen(false);
        if (onSuccess) onSuccess();
      } else {
        setError(res.error || `Failed to ${isEditing ? "update" : "create"} customer`);
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
      <span>Add Customer</span>
    </Button>
  );

  return (
    <>
      <div onClick={() => setIsOpen(true)} className="inline-block cursor-pointer">
        {trigger || defaultTrigger}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <Edit className="h-5 w-5 text-indigo-600" />
                ) : (
                  <Users className="h-5 w-5 text-indigo-600" />
                )}
                <h3 className="text-lg font-bold text-slate-900">
                  {isEditing ? "Edit Customer Profile" : "Add New Customer"}
                </h3>
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
                <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-xs font-medium border border-rose-100">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Contact Person Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-9 rounded-md border border-slate-200 px-3 text-xs focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Business / Store Name</label>
                  <input
                    type="text"
                    required
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    className="w-full h-9 rounded-md border border-slate-200 px-3 text-xs focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full h-9 rounded-md border border-slate-200 px-3 text-xs focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full h-9 rounded-md border border-slate-200 px-3 text-xs focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">City / Location</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full h-9 rounded-md border border-slate-200 px-3 text-xs focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Customer Segment</label>
                  <select
                    value={formData.segment}
                    onChange={(e) =>
                      setFormData({ ...formData, segment: e.target.value as CustomerSegment })
                    }
                    className="w-full h-9 rounded-md border border-slate-200 px-2 text-xs focus:border-indigo-500 focus:outline-hidden"
                  >
                    <option value="VIP Wholesaler">VIP Wholesaler</option>
                    <option value="Regular Retailer">Regular Retailer</option>
                    <option value="Occasional Buyer">Occasional Buyer</option>
                    <option value="At-Risk">At-Risk</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Credit Limit (₹)</label>
                  <input
                    type="number"
                    required
                    value={formData.creditLimitINR}
                    onChange={(e) => setFormData({ ...formData, creditLimitINR: Number(e.target.value) })}
                    className="w-full h-9 rounded-md border border-slate-200 px-3 text-xs focus:border-indigo-500 focus:outline-hidden"
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
                  className="text-xs h-9 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold min-w-32"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isEditing ? (
                    "Save Changes"
                  ) : (
                    "Create Customer"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
