"use server";

import { createClient } from "@/lib/supabase/server";
import { UserRole } from "@/lib/types";

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
}

// ─── Demo Users (used when Supabase is not configured) ─────────────
const DEMO_USERS: Record<string, AuthUser> = {
  admin: {
    id: "demo-admin-001",
    email: "khushi@ksarts.in",
    fullName: "Khushi Soni",
    role: "admin",
  },
  employee: {
    id: "demo-employee-001",
    email: "priya@ksarts.in",
    fullName: "Priya Sharma",
    role: "employee",
  },
};

// ─── Helper: Check if live Supabase is configured ──────────────────
function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("dummy")
  );
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
  // Demo mode fallback
  if (!isSupabaseConfigured()) {
    const demoUser =
      email === DEMO_USERS.admin.email
        ? DEMO_USERS.admin
        : email === DEMO_USERS.employee.email
          ? DEMO_USERS.employee
          : null;

    if (demoUser) {
      return { success: true, user: demoUser };
    }
    return {
      success: false,
      error: "Invalid demo credentials. Use khushi@ksarts.in or priya@ksarts.in with any password.",
    };
  }

  // Live Supabase authentication
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
  role: UserRole
): Promise<AuthResult> {
  // Demo mode fallback
  if (!isSupabaseConfigured()) {
    return {
      success: true,
      user: {
        id: "demo-new-user",
        email,
        fullName,
        role,
      },
    };
  }

  // Live Supabase signup
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data.user) {
      return { success: false, error: "Signup failed. Please try again." };
    }

    return { success: true, user: extractAuthUser(data.user) };
  } catch (err: any) {
    return { success: false, error: err.message || "An unexpected error occurred." };
  }
}

// ─── Logout Action ─────────────────────────────────────────────────
export async function logoutAction(): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: true };
  }

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

// ─── Get Current User Action ───────────────────────────────────────
export async function getCurrentUserAction(): Promise<AuthResult> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Demo mode: no persistent session." };
  }

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

// ─── Demo Login Action (1-Click) ───────────────────────────────────
export async function demoLoginAction(role: UserRole): Promise<AuthResult> {
  const user = role === "admin" ? DEMO_USERS.admin : DEMO_USERS.employee;
  return { success: true, user };
}
