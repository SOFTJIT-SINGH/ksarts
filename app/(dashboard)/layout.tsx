"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { UserRole } from "@/lib/types";
import type { AuthUser } from "@/lib/actions/auth-actions";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [userRole, setUserRole] = useState<UserRole>("admin");
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

  // ─── Check session on mount ───────────────────────────────────
  useEffect(() => {
    const stored = sessionStorage.getItem("ks_user");
    if (!stored) {
      router.push("/login");
      return;
    }
    try {
      const user: AuthUser = JSON.parse(stored);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAuthUser(user);
      setUserRole(user.role);
    } catch {
      router.push("/login");
    }
  }, [router]);

  const handleToggleRole = () => {
    setUserRole((prev) => (prev === "admin" ? "employee" : "admin"));
  };

  const handleToggleMobileMenu = () => {
    setIsMobileOpen((prev) => !prev);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("ks_user");
    router.push("/login");
  };

  // Don't render dashboard until session is verified
  if (!authUser) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          <span className="text-sm text-slate-500">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900">
      {/* Sidebar Navigation */}
      <Sidebar
        userRole={userRole}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          userRole={userRole}
          authUser={authUser}
          onToggleRole={handleToggleRole}
          onToggleMobileMenu={handleToggleMobileMenu}
          onLogout={handleLogout}
          isMobileOpen={isMobileOpen}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
