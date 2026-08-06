"use client";

import { Search, Bell, Menu, ShieldCheck, UserCheck, X, LogOut } from "lucide-react";
import { UserRole } from "@/lib/types";
import { Button } from "@/components/ui/button";
import type { AuthUser } from "@/lib/actions/auth-actions";

interface HeaderProps {
  userRole: UserRole;
  authUser: AuthUser;
  onToggleMobileMenu: () => void;
  onLogout: () => void;
  isMobileOpen: boolean;
}

export function Header({
  userRole,
  authUser,
  onToggleMobileMenu,
  onLogout,
  isMobileOpen,
}: HeaderProps) {
  // Derive initials from authenticated user's full name
  const initials = authUser.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

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

        {/* User Profile Avatar — now dynamic from authUser */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-xs shadow-xs">
            {initials}
          </div>
          <div className="hidden flex-col md:flex">
            <span className="text-xs font-semibold text-slate-900 leading-none">
              {authUser.fullName}
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 capitalize">
              {authUser.role === "admin" ? "Business Owner" : "Sales Executive"}
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onLogout}
          className="text-slate-400 hover:text-red-600 hover:bg-red-50"
          aria-label="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
