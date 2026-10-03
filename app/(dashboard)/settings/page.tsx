import { AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SystemStatusCard } from "@/components/settings/system-status-card";
import { UserManagementCard } from "@/components/settings/user-management";
import { BusinessProfileCard, QuickActionsCard } from "@/components/settings/business-config";
import { getCurrentUserAction } from "@/lib/actions/auth-actions";

export default async function SettingsPage() {
  const { user } = await getCurrentUserAction();
  const isAdmin = user?.role === "admin";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          Settings
        </h1>
        <p className="text-xs md:text-sm text-slate-500 mt-1">
          Manage your business profile, GST configuration, system health, and user access
        </p>
      </div>

      {/* Live health monitoring (Supabase + Flask ML + Auth) */}
      <SystemStatusCard />

      {/* Business Profile + GST Config */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <BusinessProfileCard
          name={user?.fullName || "Khushi Soni"}
          email={user?.email || "ksonisarees@gmail.com"}
          role={user?.role || "admin"}
        />
        <QuickActionsCard />
      </div>

      {/* User Management (Admins Only) */}
      <div>
        {isAdmin && user ? (
          <UserManagementCard currentUserId={user.id} />
        ) : (
          <Card className="border-slate-200">
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