"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Boxes,
  Sparkles,
  BarChart3,
  Settings,
  ChevronRight,
  SparkleIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserRole } from "@/lib/types";

interface SidebarProps {
  userRole: UserRole;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ userRole, isMobileOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      title: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
      roles: ["admin", "employee"],
    },
    {
      title: "Products",
      href: "/products",
      icon: Package,
      roles: ["admin", "employee"],
    },
    {
      title: "Sales Management",
      href: "/sales",
      icon: ShoppingCart,
      roles: ["admin", "employee"],
    },
    {
      title: "Inventory & Stock",
      href: "/inventory",
      icon: Boxes,
      roles: ["admin", "employee"],
    },
    {
      title: "Customers Directory",
      href: "/customers",
      icon: Users,
      roles: ["admin"],
    },
    {
      title: "AI Predictions Hub",
      href: "/ai-insights",
      icon: Sparkles,
      roles: ["admin"],
      badge: "AI Core",
    },
    {
      title: "Reports & Analytics",
      href: "/reports",
      icon: BarChart3,
      roles: ["admin"],
    },
    {
      title: "System Settings",
      href: "/settings",
      icon: Settings,
      roles: ["admin"],
    },
  ];

  const filteredNavItems = navItems.filter((item) => item.roles.includes(userRole));

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:static lg:translate-x-0",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-slate-100 px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
            <SparkleIcon className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-slate-900 leading-none">
              KS Vision AI
            </span>
            <span className="text-[11px] font-medium text-indigo-600 tracking-wide uppercase mt-0.5">
              Textile Intelligence
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
          Navigation
        </div>

        {filteredNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors min-h-11",
                isActive
                  ? "bg-indigo-50/80 text-indigo-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 shrink-0 transition-colors",
                  isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"
                )}
              />
              <span className="truncate">{item.title}</span>

              {item.badge && (
                <span className="ml-auto rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                  {item.badge}
                </span>
              )}

              {isActive && (
                <ChevronRight className="ml-auto h-4 w-4 text-indigo-600 shrink-0" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer / Role Indicator */}
      <div className="border-t border-slate-100 p-4">
        <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-800">Role Context</span>
            <span className="text-[11px] text-slate-500 capitalize">{userRole} Account</span>
          </div>
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold capitalize",
              userRole === "admin"
                ? "bg-indigo-100 text-indigo-700"
                : "bg-emerald-100 text-emerald-700"
            )}
          >
            {userRole}
          </span>
        </div>
      </div>
    </aside>
  );
}
