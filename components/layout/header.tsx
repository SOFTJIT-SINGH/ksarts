"use client";

import { Search, Bell, Menu, ShieldCheck, UserCheck, X } from "lucide-react";
import { UserRole } from "@/lib/types";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  userRole: UserRole;
  onToggleRole: () => void;
  onToggleMobileMenu: () => void;
  isMobileOpen: boolean;
}

export function Header({
  userRole,
  onToggleRole,
  onToggleMobileMenu,
  isMobileOpen,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-sm md:px-6">
      {/* Mobile Menu Toggle + Global Search */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onToggleMobileMenu}
          aria-label="Toggle navigation menu"
        >
          {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        <div className="relative hidden md:block w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search products, invoices, fabric type..."
            className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-9 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Role Toggle Switcher (Interactive Demo Helper) */}
        <div className="flex items-center gap-2 rounded-lg bg-slate-100 p-1 border border-slate-200">
          <button
            onClick={onToggleRole}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
              userRole === "admin"
                ? "bg-white text-indigo-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Admin</span>
          </button>
          <button
            onClick={onToggleRole}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
              userRole === "employee"
                ? "bg-white text-emerald-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <UserCheck className="h-3.5 w-3.5" />
            <span>Employee</span>
          </button>
        </div>

        {/* Notification Bell */}
        <Button
          variant="ghost"
          size="icon"
          className="relative text-slate-500 hover:text-slate-900"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-indigo-600 ring-2 ring-white" />
        </Button>

        <div className="h-6 w-px bg-slate-200" />

        {/* User Profile Avatar */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-xs shadow-xs">
            {userRole === "admin" ? "KS" : "PS"}
          </div>
          <div className="hidden flex-col md:flex">
            <span className="text-xs font-semibold text-slate-900 leading-none">
              {userRole === "admin" ? "Khushi Soni" : "Priya Sharma"}
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 capitalize">
              {userRole === "admin" ? "Business Owner" : "Sales Executive"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
