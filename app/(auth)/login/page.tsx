"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  SparkleIcon,
  Mail,
  Lock,
  User,
  ShieldCheck,
  UserCheck,
  LogIn,
  UserPlus,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  loginAction,
  signupAction,
  demoLoginAction,
} from "@/lib/actions/auth-actions";
import type { UserRole } from "@/lib/types";

type AuthTab = "login" | "signup";

export default function LoginPage() {
  const router = useRouter();

  // ─── State ─────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<AuthTab>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<UserRole>("admin");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ─── Handlers ──────────────────────────────────────────────────
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await loginAction(email, password);

    if (result.success && result.user) {
      // Store user in sessionStorage for client-side access
      sessionStorage.setItem("ks_user", JSON.stringify(result.user));
      router.push("/");
    } else {
      setError(result.error || "Login failed.");
    }
    setIsLoading(false);
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setIsLoading(false);
      return;
    }

    const result = await signupAction(email, password, fullName, role);

    if (result.success && result.user) {
      sessionStorage.setItem("ks_user", JSON.stringify(result.user));
      router.push("/");
    } else {
      setError(result.error || "Signup failed.");
    }
    setIsLoading(false);
  }

  async function handleDemoLogin(demoRole: UserRole) {
    setError("");
    setIsLoading(true);

    const result = await demoLoginAction(demoRole);

    if (result.success && result.user) {
      sessionStorage.setItem("ks_user", JSON.stringify(result.user));
      router.push("/");
    } else {
      setError(result.error || "Demo login failed.");
    }
    setIsLoading(false);
  }

  // ─── Render ────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-md">
      {/* ── Brand Header ────────────────────────────────────── */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
          <SparkleIcon className="h-7 w-7" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Ks Arts AI
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            AI-Powered Textile Sales & Inventory System
          </p>
        </div>
      </div>

      {/* ── Main Auth Card ──────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50">
        {/* Tab Switcher */}
        <div className="mb-6 flex rounded-xl bg-slate-100 p-1">
          <button
            onClick={() => {
              setActiveTab("login");
              setError("");
            }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "login"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <LogIn className="h-4 w-4" />
            Sign In
          </button>
          <button
            onClick={() => {
              setActiveTab("signup");
              setError("");
            }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "signup"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <UserPlus className="h-4 w-4" />
            Create Account
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ── Sign In Form ────────────────────────────────── */}
        {activeTab === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="login-email"
                className="mb-1.5 block text-xs font-semibold text-slate-700"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="khushi@ksarts.in"
                  className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="login-password"
                className="mb-1.5 block text-xs font-semibold text-slate-700"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-10 pr-11 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="h-4 w-4" />
              )}
              Sign In
            </button>
          </form>
        )}

        {/* ── Sign Up Form ────────────────────────────────── */}
        {activeTab === "signup" && (
          <form onSubmit={handleSignup} className="space-y-4">
            {/* Full Name */}
            <div>
              <label
                htmlFor="signup-name"
                className="mb-1.5 block text-xs font-semibold text-slate-700"
              >
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="signup-name"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Khushi Soni"
                  className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="signup-email"
                className="mb-1.5 block text-xs font-semibold text-slate-700"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="signup-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@ksarts.in"
                  className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="signup-password"
                className="mb-1.5 block text-xs font-semibold text-slate-700"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-10 pr-11 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                Account Role
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRole("admin")}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg border py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                    role === "admin"
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <ShieldCheck className="h-4 w-4" />
                  Admin (Owner)
                </button>
                <button
                  type="button"
                  onClick={() => setRole("employee")}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg border py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                    role === "employee"
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <UserCheck className="h-4 w-4" />
                  Employee
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              Create Account
            </button>
          </form>
        )}

        {/* ── Divider ─────────────────────────────────────── */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-3 font-medium text-slate-400">
              Quick Demo Login
            </span>
          </div>
        </div>

        {/* ── 1-Click Demo Login Buttons ──────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleDemoLogin("admin")}
            disabled={isLoading}
            className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 transition-all hover:border-indigo-300 hover:bg-indigo-50 disabled:opacity-50 cursor-pointer group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-white text-xs font-bold shadow-sm group-hover:shadow-md transition-shadow">
              KS
            </div>
            <span className="text-xs font-semibold text-slate-800">
              Khushi Soni
            </span>
            <span className="text-[10px] text-indigo-600 font-medium">
              Admin (Owner)
            </span>
          </button>

          <button
            onClick={() => handleDemoLogin("employee")}
            disabled={isLoading}
            className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 transition-all hover:border-emerald-300 hover:bg-emerald-50 disabled:opacity-50 cursor-pointer group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-bold shadow-sm group-hover:shadow-md transition-shadow">
              PS
            </div>
            <span className="text-xs font-semibold text-slate-800">
              Priya Sharma
            </span>
            <span className="text-[10px] text-emerald-600 font-medium">
              Sales Executive
            </span>
          </button>
        </div>
      </div>

      {/* ── Footer ──────────────────────────────────────────── */}
      <p className="mt-6 text-center text-xs text-slate-400">
        B.Tech Final Year Project — Khushi Soni, Data Science
      </p>
    </div>
  );
}
