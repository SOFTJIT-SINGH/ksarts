import { redirect } from "next/navigation";
import { getCurrentUserAction } from "@/lib/actions/auth-actions";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { success, user } = await getCurrentUserAction();

  if (!success || !user) {
    redirect("/login");
  }

  return (
    <DashboardShell authUser={user}>
      {children}
    </DashboardShell>
  );
}
