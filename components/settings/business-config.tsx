"use client";

import { useState, useEffect } from "react";
import { Building2, Percent, MapPin, Phone, Mail, Hash, CreditCard, Pencil, Check, X, Loader2, type LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { updateBusinessFieldAction } from "@/lib/actions/business-actions";
import {
  BUSINESS_FIELD_LABELS,
  normalizeBusinessField,
  validateBusinessField,
  type BusinessField,
  type BusinessProfile,
} from "@/lib/business-profile";

import Link from "next/link";
import { PlusCircle, FileText, BarChart3, Receipt } from "lucide-react";

export function QuickActionsCard() {
  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card className="border-indigo-100">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <PlusCircle className="h-5 w-5 text-indigo-600" />
            Quick Actions
          </CardTitle>
          <CardDescription className="text-xs">
            Shortcuts to common daily tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/sales" className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-xs font-semibold text-slate-700 group">
              <Receipt className="h-4 w-4 text-slate-400 group-hover:text-indigo-600" />
              Sales Invoices
            </Link>
            <Link href="/reports" className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-xs font-semibold text-slate-700 group">
              <FileText className="h-4 w-4 text-slate-400 group-hover:text-indigo-600" />
              Download Reports
            </Link>
            <Link href="/ai-insights" className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-xs font-semibold text-slate-700 group">
              <BarChart3 className="h-4 w-4 text-slate-400 group-hover:text-indigo-600" />
              AI Insights
            </Link>
            <Link href="/inventory" className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-xs font-semibold text-slate-700 group">
              <Building2 className="h-4 w-4 text-slate-400 group-hover:text-indigo-600" />
              Check Inventory
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* GST Info Panel */}
      <Card className="border-slate-200 bg-slate-50 shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-700">
            <Percent className="h-4 w-4 text-slate-500" />
            Indian Textile GST Rates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Unit price below ₹1,000</span>
              <span className="font-semibold text-slate-700">5%</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Unit price ₹1,000 and above</span>
              <span className="font-semibold text-slate-700">12%</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-4 leading-relaxed">
            Note: GST is charged on the value after discount. Choose Intra-state (CGST + SGST) or Inter-state (IGST)
            manually in the invoice builder for each sale.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

interface BusinessProfileCardProps {
  name: string;
  email: string;
  role: "admin" | "employee";
  profile: BusinessProfile;
  canEdit: boolean;
  needsSetup: boolean;
}

const FIELD_META: { field: BusinessField; icon: LucideIcon; placeholder: string; inputMode?: "tel" | "email" | "text" }[] = [
  { field: "businessName", icon: Building2, placeholder: "Your business name" },
  { field: "address", icon: MapPin, placeholder: "Shop / office address" },
  { field: "phone", icon: Phone, placeholder: "+91 98765 43210", inputMode: "tel" },
  { field: "email", icon: Mail, placeholder: "business@example.com", inputMode: "email" },
  { field: "gstin", icon: Hash, placeholder: "03ABCDE1234F1Z5" },
  { field: "pan", icon: CreditCard, placeholder: "ABCDE1234F" },
];

function EditableRow({
  field,
  icon: Icon,
  placeholder,
  inputMode,
  value,
  canEdit,
  onSaved,
  onNeedsSetup,
}: {
  field: BusinessField;
  icon: LucideIcon;
  placeholder: string;
  inputMode?: "tel" | "email" | "text";
  value: string;
  canEdit: boolean;
  onSaved: (profile: BusinessProfile) => void;
  onNeedsSetup: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  const label = BUSINESS_FIELD_LABELS[field];

  const startEdit = () => {
    setDraft(value);
    setError(null);
    setEditing(true);
  };

  const cancel = () => {
    setEditing(false);
    setError(null);
  };

  const save = async () => {
    if (normalizeBusinessField(field, draft) === value) {
      cancel();
      return;
    }
    const problem = validateBusinessField(field, draft);
    if (problem) {
      setError(problem);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await updateBusinessFieldAction(field, draft);
      if (res.success && res.profile) {
        onSaved(res.profile);
        setEditing(false);
        setJustSaved(true);
        setTimeout(() => setJustSaved(false), 2000);
      } else {
        if (res.needsSetup) onNeedsSetup();
        setError(res.error || "Could not save.");
      }
    } catch (err: any) {
      setError(err?.message || "Could not save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="group flex items-start gap-3 text-xs">
      <Icon className="h-3.5 w-3.5 text-slate-400 mt-2.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium shrink-0 w-24 sm:w-28">{label}</span>

          {editing ? (
            <div className="flex flex-1 min-w-0 items-center gap-1.5">
              <input
                autoFocus
                type={inputMode === "email" ? "email" : "text"}
                inputMode={inputMode}
                value={draft}
                placeholder={placeholder}
                aria-label={label}
                disabled={saving}
                onChange={(e) => {
                  setDraft(e.target.value);
                  setError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    save();
                  } else if (e.key === "Escape") {
                    cancel();
                  }
                }}
                className="h-9 min-w-0 flex-1 rounded-md px-2.5 text-xs font-semibold text-slate-900"
              />
              <button
                type="button"
                onClick={save}
                disabled={saving}
                aria-label={`Save ${label}`}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60 cursor-pointer"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={cancel}
                disabled={saving}
                aria-label={`Cancel editing ${label}`}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-500 hover:bg-slate-100 disabled:opacity-60 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-1 min-w-0 items-center gap-2">
              <span
                className={`min-w-0 break-words font-semibold ${value ? "text-slate-800" : "italic text-slate-400"}`}
              >
                {value || "Not set"}
              </span>
              {justSaved && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600">
                  <Check className="h-3 w-3" /> Saved
                </span>
              )}
              {canEdit && (
                <button
                  type="button"
                  onClick={startEdit}
                  aria-label={`Edit ${label}`}
                  className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-indigo-50 hover:text-indigo-700 sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100 transition-opacity cursor-pointer"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
        {error && <p className="mt-1 pl-24 sm:pl-28 text-[11px] font-semibold text-rose-600">{error}</p>}
      </div>
    </div>
  );
}

export function BusinessProfileCard({ name, email, role, profile, canEdit, needsSetup }: BusinessProfileCardProps) {
  const [current, setCurrent] = useState<BusinessProfile>(profile);
  const [setupNeeded, setSetupNeeded] = useState(needsSetup);

  // Pick up fresh server data after revalidation (e.g. edited in another tab)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrent(profile);
  }, [profile]);

  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const isAdmin = role === "admin";

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <Building2 className="h-5 w-5 text-emerald-600" />
          Business Profile
        </CardTitle>
        <CardDescription className="text-xs">
          {canEdit
            ? "Click the pencil next to any detail to edit it. Changes save instantly and appear on invoices."
            : "Your account details and registered business information"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Logged-in User */}
        <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div className="h-11 w-11 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate">{name}</p>
            <p className="text-xs text-slate-500 truncate">{email}</p>
          </div>
          <span
            className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${
              isAdmin ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-600"
            }`}
          >
            {role}
          </span>
        </div>

        {setupNeeded && (
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-[11px] leading-relaxed text-amber-900">
            <p className="font-bold">One-time setup needed to save changes</p>
            <p className="mt-1">
              Open Supabase → SQL Editor, paste the contents of <code className="font-mono">supabase/business_settings.sql</code>{" "}
              and click Run. Then reload this page. Until then the details below are the built-in defaults.
            </p>
          </div>
        )}

        {/* Business Details (inline editable) */}
        <div className="grid grid-cols-1 gap-3">
          {FIELD_META.map((meta) => (
            <EditableRow
              key={meta.field}
              {...meta}
              value={current[meta.field]}
              canEdit={canEdit}
              onSaved={(p) => {
                setCurrent(p);
                setSetupNeeded(false);
              }}
              onNeedsSetup={() => setSetupNeeded(true)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
