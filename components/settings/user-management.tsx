"use client";

import { useEffect, useState } from "react";
import { Shield, User, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getUsersAction, updateUserRoleAction, AuthUser } from "@/lib/actions/auth-actions";

export function UserManagementCard({ currentUserId }: { currentUserId: string }) {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getUsersAction();
      if (res.success && res.users) {
        setUsers(res.users);
      } else {
        setError(res.error || "Failed to fetch users");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRoleChange(userId: string, newRole: "admin" | "employee") {
    setUpdatingId(userId);
    setError(null);
    try {
      const res = await updateUserRoleAction(userId, newRole);
      if (res.success) {
        // Refresh the list
        await fetchUsers();
      } else {
        setError(res.error || "Failed to update role");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <Card className="border-indigo-100 shadow-xs md:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Shield className="h-5 w-5 text-indigo-600" />
              User Role Management
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              Manage system access and promote employees to administrators
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs h-8"
            onClick={fetchUsers}
            disabled={isLoading}
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-xs text-red-600 flex items-start gap-2 border border-red-100">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="rounded-lg border border-slate-200 overflow-hidden">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading && users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto text-slate-400 mb-2" />
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900 flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                        <User className="h-4 w-4" />
                      </div>
                      {user.fullName}
                      {user.id === currentUserId && (
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-medium ml-1">You</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{user.email}</td>
                    <td className="px-4 py-3">
                      <Badge variant={user.role === "admin" ? "purple" : "secondary"} className="text-[10px]">
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {user.role === "employee" ? (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-7 text-[10px] text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                          onClick={() => handleRoleChange(user.id, "admin")}
                          disabled={updatingId !== null || user.id === currentUserId}
                        >
                          {updatingId === user.id ? "Updating..." : "Make Admin"}
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-7 text-[10px] text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => handleRoleChange(user.id, "employee")}
                          disabled={updatingId !== null || user.id === currentUserId}
                          title={user.id === currentUserId ? "You cannot demote yourself" : ""}
                        >
                          {updatingId === user.id ? "Updating..." : "Demote"}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
