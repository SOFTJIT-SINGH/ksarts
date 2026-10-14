"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { UserRole } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

// ─── Types ─────────────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
}

export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
  /** true when signup worked but the user must confirm their email before signing in */
  needsEmailConfirmation?: boolean;
}

// ─── Helper: Extract AuthUser from Supabase user object ────────────
function extractAuthUser(user: any): AuthUser {
  const meta = user.user_metadata || {};
  return {
    id: user.id,
    email: user.email || "",
    fullName: meta.full_name || user.email?.split("@")[0] || "User",
    role: (meta.role as UserRole) || "employee",
  };
}

// ─── Login Action ──────────────────────────────────────────────────
export async function loginAction(
  email: string,
  password: string
): Promise<AuthResult> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data.user) {
      return { success: false, error: "Login failed. Please try again." };
    }

    return { success: true, user: extractAuthUser(data.user) };
  } catch (err: any) {
    return { success: false, error: err.message || "An unexpected error occurred." };
  }
}

// ─── Signup Action ─────────────────────────────────────────────────
export async function signupAction(
  email: string,
  password: string,
  fullName: string,
  phone: string
): Promise<AuthResult> {
  // Always default to employee for new registrations
  const role: UserRole = "employee";

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
          phone: phone,
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data.user) {
      return { success: false, error: "Signup failed. Please try again." };
    }

    return {
      success: true,
      user: extractAuthUser(data.user),
      needsEmailConfirmation: !data.session,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "An unexpected error occurred." };
  }
}

// ─── Logout Action ─────────────────────────────────────────────────
export async function logoutAction(): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Logout failed." };
  }
}

// ─── Reset Password Action ─────────────────────────────────────────
export async function resetPasswordAction(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // Build the redirect from the real request origin so it works on localhost AND Vercel.
    // The link lands on /auth/callback, which exchanges the code for a session and then
    // forwards to /reset-password. (This URL must be in Supabase > Auth > URL Configuration > Redirect URLs.)
    const h = await headers();
    const origin =
      h.get("origin") ||
      (h.get("host") ? `${h.get("x-forwarded-proto") || "http"}://${h.get("host")}` : null) ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000";

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/callback?next=/reset-password`,
    });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Password reset failed." };
  }
}

// ─── Update Password Action (used by /reset-password after the email link) ──
export async function updatePasswordAction(newPassword: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: "Password must be at least 6 characters." };
    }
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Your reset link has expired. Request a new one from the sign-in page." };
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update password." };
  }
}

// ─── Get Current User Action ───────────────────────────────────────
export async function getCurrentUserAction(): Promise<AuthResult> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      return { success: false, error: "No active session." };
    }

    return { success: true, user: extractAuthUser(data.user) };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to get user." };
  }
}

// ─── Admin Client Helper ───────────────────────────────────────────
function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

// ─── Get All Users (Admin Only) ────────────────────────────────────
export async function getUsersAction(): Promise<{ success: boolean; users?: AuthUser[]; error?: string }> {
  try {
    const currentUserRes = await getCurrentUserAction();
    if (!currentUserRes.success || currentUserRes.user?.role !== "admin") {
      return { success: false, error: "Unauthorized. Only admins can view users." };
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return { success: false, error: "Service Role Key is missing. Cannot fetch users." };
    }

    const adminClient = createAdminClient();
    const { data, error } = await adminClient.auth.admin.listUsers();
    if (error) {
      return { success: false, error: error.message };
    }
    
    const users = data.users.map(extractAuthUser);
    return { success: true, users };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to fetch users." };
  }
}

// ─── Update User Role (Admin Only) ─────────────────────────────────
export async function updateUserRoleAction(userId: string, newRole: UserRole): Promise<{ success: boolean; error?: string }> {
  try {
    const currentUserRes = await getCurrentUserAction();
    if (!currentUserRes.success || currentUserRes.user?.role !== "admin") {
      return { success: false, error: "Unauthorized. Only admins can update roles." };
    }

    if (currentUserRes.user.id === userId) {
      return { success: false, error: "You cannot change your own role." };
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return { success: false, error: "Service Role Key is missing. Cannot update user." };
    }

    const adminClient = createAdminClient();
    
    // Update user metadata. Note that for existing metadata, we might want to fetch it first,
    // but updateUserById merges user_metadata by default in recent Supabase versions.
    const { data, error: userError } = await adminClient.auth.admin.getUserById(userId);
    if (userError) return { success: false, error: userError.message };

    const currentMeta = data.user.user_metadata || {};
    
    const { error } = await adminClient.auth.admin.updateUserById(userId, {
      user_metadata: { ...currentMeta, role: newRole }
    });

    if (error) {
      return { success: false, error: error.message };
    }
    
    revalidatePath("/settings");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update user." };
  }
}
