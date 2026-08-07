import { Settings, Shield, Server, Database, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SeedDatabaseButton } from "@/components/settings/seed-button";
import { UserManagementCard } from "@/components/settings/user-management";
import { getCurrentUserAction } from "@/lib/actions/auth-actions";

export default async function SettingsPage() {
  const { user } = await getCurrentUserAction();
  const isAdmin = user?.role === "admin";
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            System & AI Configuration
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Configure Flask ML Service URL, MongoDB connection settings, and database initialization
          </p>
        </div>

        <Button className="text-xs h-10 gap-1.5 font-semibold bg-indigo-600 hover:bg-indigo-700">
          Save System Configuration
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Supabase Database Initialization */}
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
              Use the 1-click seeder below to automatically connect to your <span className="font-semibold text-slate-900">Supabase</span> instance and populate tables for Products, Customers, and Sales Invoices.
            </p>
            <SeedDatabaseButton />
          </CardContent>
        </Card>

        {/* Flask ML Service Settings */}
        <Card className="border-purple-100 shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Flask Machine Learning Microservice
            </CardTitle>
            <CardDescription className="text-xs">
              Configure Python Flask backend endpoint for model predictions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Flask Service URL</label>
              <input
                type="text"
                defaultValue="http://127.0.0.1:5000/api/v1/predict"
                className="h-10 w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden"
              />
            </div>
            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
              <span className="text-slate-500">ML Engine Status</span>
              <Badge variant="purple" className="text-[11px]">Ready / Standby</Badge>
            </div>
          </CardContent>
        </Card>

        {/* User Management (Admins Only) */}
        {isAdmin && user && (
          <UserManagementCard currentUserId={user.id} />
        )}
      </div>
    </div>
  );
}
