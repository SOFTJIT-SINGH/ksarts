"use client";

import { useState, useEffect } from "react";
import { Building2, Save, Percent, MapPin, Phone, Mail, Hash, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
              <span className="text-slate-500">Cotton & Basic Fabrics</span>
              <span className="font-semibold text-slate-700">5%</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Silk & Designer Wear</span>
              <span className="font-semibold text-slate-700">12%</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Luxury / Bridal / Zari</span>
              <span className="font-semibold text-slate-700">18%</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-4 leading-relaxed">
            Note: GST type (Intra-state CGST/SGST vs Inter-state IGST) is automatically selected during invoice creation based on customer location.
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
}

export function BusinessProfileCard({ name, email, role }: BusinessProfileCardProps) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const isAdmin = role === "admin";

  // Business info — in a real app this would come from a settings table
  const businessInfo = [
    { icon: Building2, label: "Business Name", value: "KS Arts — Textile Wholesale" },
    { icon: MapPin, label: "Address", value: "Amritsar, Punjab, India" },
    { icon: Phone, label: "Phone", value: "+91 98765 43210" },
    { icon: Mail, label: "Email", value: "ksonisarees@gmail.com" },
    { icon: Hash, label: "GSTIN", value: "03AXXXX1234X1Z5" },
    { icon: CreditCard, label: "PAN", value: "AXXXX1234X" },
  ];

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <Building2 className="h-5 w-5 text-emerald-600" />
          Business Profile
        </CardTitle>
        <CardDescription className="text-xs">
          Your account details and registered business information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Logged-in User */}
        <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
          <div className="h-11 w-11 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate">{name}</p>
            <p className="text-xs text-slate-500 truncate">{email}</p>
          </div>
          <span
            className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${
              isAdmin
                ? "bg-indigo-100 text-indigo-700"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {role}
          </span>
        </div>

        {/* Business Details */}
        <div className="grid grid-cols-1 gap-2.5">
          {businessInfo.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3 text-xs">
              <Icon className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
              <div className="flex-1 flex items-baseline gap-2">
                <span className="text-slate-400 font-medium shrink-0 w-28">{label}</span>
                <span className="text-slate-800 font-semibold">{value}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
