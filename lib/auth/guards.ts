import { redirect } from "next/navigation";
import { getCurrentUserAction } from "@/lib/actions/auth-actions";

/**
 * Server-side page guard. The sidebar only hides links, so admin-only pages
 * must also refuse to render when an employee types the URL directly.
 */
export async function requireAdmin() {
  const { success, user } = await getCurrentUserAction();
  if (!success || !user) redirect("/login");
  if (user.role !== "admin") redirect("/");
  return user;
}
