"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Bell,
  Menu,
  X,
  LogOut,
  PackageX,
  AlertTriangle,
  Wallet,
  Settings,
  KeyRound,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { UserRole } from "@/lib/types";
import { Button } from "@/components/ui/button";
import type { AuthUser } from "@/lib/actions/auth-actions";
import {
  getNotificationsAction,
  globalSearchAction,
  type NotificationItem,
  type SearchResult,
} from "@/lib/actions/navbar-actions";

interface HeaderProps {
  userRole: UserRole;
  authUser: AuthUser;
  onToggleMobileMenu: () => void;
  onLogout: () => void;
  isMobileOpen: boolean;
}

type OpenPanel = "none" | "search" | "notifications" | "profile";

export function Header({ authUser, onToggleMobileMenu, onLogout, isMobileOpen }: HeaderProps) {
  const router = useRouter();
  const [panel, setPanel] = useState<OpenPanel>("none");

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const initials = authUser.fullName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Close any open dropdown when clicking elsewhere or pressing Escape
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        !searchRef.current?.contains(t) &&
        !notifRef.current?.contains(t) &&
        !profileRef.current?.contains(t)
      ) {
        setPanel("none");
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPanel("none");
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // Notifications: load on mount, refresh every 60s and whenever the bell opens
  const loadNotifications = async () => {
    setNotifLoading(true);
    try {
      const res = await getNotificationsAction();
      if (res.success) setNotifications(res.items);
    } finally {
      setNotifLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      const res = await getNotificationsAction();
      if (!cancelled && res.success) setNotifications(res.items);
    };
    tick();
    const id = setInterval(tick, 60_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  // Debounced live search
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults([]);
      return;
    }
    let cancelled = false;
    setSearching(true);
    const id = setTimeout(async () => {
      const res = await globalSearchAction(q);
      if (!cancelled) {
        setResults(res.results);
        setSearching(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [query]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setPanel("none");
    router.push(`/products?q=${encodeURIComponent(q)}`);
  };

  const go = (href: string) => {
    setPanel("none");
    setQuery("");
    router.push(href);
  };

  const criticalCount = notifications.filter((n) => n.severity === "critical").length;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between gap-3 border-b border-slate-300 bg-white px-4 shadow-sm md:px-6">
      {/* Mobile Menu Toggle + Global Search */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden shrink-0"
          onClick={onToggleMobileMenu}
          aria-label="Toggle navigation menu"
        >
          {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        <div ref={searchRef} className="relative w-full max-w-sm">
          <form onSubmit={submitSearch}>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPanel("search");
              }}
              onFocus={() => setPanel("search")}
              placeholder="Search products, invoices, customers..."
              aria-label="Global search"
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-9 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
          </form>

          {panel === "search" && query.trim().length >= 2 && (
            <div className="absolute left-0 right-0 top-12 z-40 max-h-96 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
              {searching && (
                <div className="flex items-center gap-2 px-3 py-3 text-xs text-slate-500">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Searching...
                </div>
              )}
              {!searching && results.length === 0 && (
                <div className="px-3 py-3 text-xs text-slate-500">No matches for &quot;{query.trim()}&quot;.</div>
              )}
              {results.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => go(r.href)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-slate-50 cursor-pointer"
                >
                  <span className="shrink-0 rounded-md bg-indigo-50 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700">
                    {r.type}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-semibold text-slate-900">{r.title}</span>
                    <span className="block truncate text-[11px] text-slate-500">{r.subtitle}</span>
                  </span>
                </button>
              ))}
              {!searching && (
                <button
                  type="button"
                  onClick={() => go(`/products?q=${encodeURIComponent(query.trim())}`)}
                  className="mt-1 w-full rounded-lg border-t border-slate-100 px-3 py-2 text-left text-[11px] font-semibold text-indigo-600 hover:bg-slate-50 cursor-pointer"
                >
                  See all product results for &quot;{query.trim()}&quot; →
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex shrink-0 items-center gap-1 md:gap-3">
        {/* Notification Bell */}
        <div ref={notifRef} className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="relative text-slate-500 hover:text-slate-900"
            aria-label={`Notifications (${notifications.length})`}
            aria-expanded={panel === "notifications"}
            onClick={() => {
              const next = panel === "notifications" ? "none" : "notifications";
              setPanel(next);
              if (next === "notifications") loadNotifications();
            }}
          >
            <Bell className="h-5 w-5" />
            {notifications.length > 0 && (
              <span
                className={`absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold text-white ring-2 ring-white ${
                  criticalCount > 0 ? "bg-rose-600" : "bg-amber-500"
                }`}
              >
                {notifications.length > 9 ? "9+" : notifications.length}
              </span>
            )}
          </Button>

          {panel === "notifications" && (
            <div className="absolute right-0 top-12 z-40 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 bg-white shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <span className="text-sm font-bold text-slate-900">Notifications</span>
                {notifLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />}
              </div>
              <div className="max-h-96 overflow-y-auto p-1.5">
                {notifications.length === 0 ? (
                  <div className="px-3 py-8 text-center text-xs text-slate-500">
                    You&apos;re all caught up. No stock or payment alerts.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <Link
                      key={n.id}
                      href={n.href}
                      onClick={() => setPanel("none")}
                      className="flex items-start gap-3 rounded-lg px-3 py-2.5 hover:bg-slate-50"
                    >
                      <span
                        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                          n.severity === "critical" ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"
                        }`}
                      >
                        {n.kind === "payment" ? (
                          <Wallet className="h-3.5 w-3.5" />
                        ) : n.severity === "critical" ? (
                          <PackageX className="h-3.5 w-3.5" />
                        ) : (
                          <AlertTriangle className="h-3.5 w-3.5" />
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-xs font-semibold text-slate-900">{n.title}</span>
                        <span className="block text-[11px] text-slate-500">{n.detail}</span>
                      </span>
                    </Link>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-slate-200" />

        {/* User Profile Menu */}
        <div ref={profileRef} className="relative">
          <button
            type="button"
            onClick={() => setPanel(panel === "profile" ? "none" : "profile")}
            aria-expanded={panel === "profile"}
            aria-label="Open profile menu"
            className="flex items-center gap-2.5 rounded-lg p-1 pr-2 hover:bg-slate-50 cursor-pointer min-h-11"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-xs shadow-xs">
              {initials}
            </div>
            <div className="hidden flex-col text-left md:flex">
              <span className="text-xs font-semibold text-slate-900 leading-none">{authUser.fullName}</span>
              <span className="text-[11px] text-slate-500 mt-0.5">
                {authUser.role === "admin" ? "Business Owner" : "Sales Executive"}
              </span>
            </div>
            <ChevronDown className="hidden h-3.5 w-3.5 text-slate-400 md:block" />
          </button>

          {panel === "profile" && (
            <div className="absolute right-0 top-12 z-40 w-64 rounded-xl border border-slate-200 bg-white shadow-lg">
              <div className="border-b border-slate-100 px-4 py-3">
                <p className="truncate text-sm font-bold text-slate-900">{authUser.fullName}</p>
                <p className="truncate text-xs text-slate-500">{authUser.email}</p>
                <span
                  className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                    authUser.role === "admin" ? "bg-indigo-100 text-indigo-700" : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {authUser.role}
                </span>
              </div>
              <div className="p-1.5">
                {authUser.role === "admin" && (
                  <Link
                    href="/settings"
                    onClick={() => setPanel("none")}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <Settings className="h-4 w-4 text-slate-400" /> Account &amp; Settings
                  </Link>
                )}
                <Link
                  href="/reset-password"
                  onClick={() => setPanel("none")}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <KeyRound className="h-4 w-4 text-slate-400" /> Change Password
                </Link>
                <button
                  type="button"
                  onClick={onLogout}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
