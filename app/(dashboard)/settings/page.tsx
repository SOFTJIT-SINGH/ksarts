import { Database, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SeedDatabaseButton } from "@/components/settings/seed-button";
import { SystemStatusCard } from "@/components/settings/system-status-card";
import { UserManagementCard } from "@/components/settings/user-management";
import { getCurrentUserAction } from "@/lib/actions/auth-actions";

export default async function SettingsPage() {
  const { user } = await getCurrentUserAction();
  const isAdmin = user?.role === "admin";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          System &amp; AI Configuration
        </h1>
        <p className="text-xs md:text-sm text-slate-500 mt-1">
          Monitor live health of the Supabase database and Flask ML microservice, seed demo
          data, and manage user roles
        </p>
      </div>

      {/* Live health monitoring (Supabase + Flask ML + Auth) */}
      <SystemStatusCard />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Supabase Database Initialization (all users can seed for demo) */}
        <Card className="border-indigo-100 shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Database className="h-5 w-5 text-indigo-600" />
              Supabase PostgreSQL Database Initialization
            </CardTitle>
            <CardDescription className="text-xs">
              Populate Supabase with realistic Indian textile catalog, customers, and invoices
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              Use the 1-click seeder below to connect to your{" "}
              <span className="font-semibold text-slate-900">Supabase PostgreSQL</span> instance
              and populate tables for Products, Customers, and Sales Invoices. Existing rows are
              kept — the seeder only adds missing entries.
            </p>
            <SeedDatabaseButton />
          </CardContent>
        </Card>

        {/* User Management (Admins Only) */}
        {isAdmin && user ? (
          <UserManagementCard currentUserId={user.id} />
        ) : (
          <Card className="border-slate-200 shadow-xs">
            <CardHeader>
              <CardTitle className="text-base font-bold">User Management</CardTitle>
              <CardDescription className="text-xs">
                Manage employee access and roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                <span>
                  Only the Admin (business owner) can view and manage user roles. Contact the
                  Admin to be promoted.
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}