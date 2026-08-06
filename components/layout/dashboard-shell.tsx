"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { UserRole } from "@/lib/types";
import type { AuthUser } from "@/lib/actions/auth-actions";

interface DashboardShellProps {
  children: React.ReactNode;
  authUser: AuthUser;
}

export function DashboardShell({ children, authUser }: DashboardShellProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleToggleMobileMenu = () => {
    setIsMobileOpen((prev) => !prev);
  };

  const handleLogout = async () => {
    const { logoutAction } = await import("@/lib/actions/auth-actions");
    await logoutAction();
    window.location.href = "/login";
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900">
      {/* Sidebar Navigation */}
      <Sidebar
        userRole={authUser.role}
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
          userRole={authUser.role}
          authUser={authUser}
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
