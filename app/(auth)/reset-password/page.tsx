"use client";

import { useState } from "react";
import Link from "next/link";
import { Lock, Eye, EyeOff, Loader2, AlertCircle, ShieldCheck, SparkleIcon } from "lucide-react";
import { updatePasswordAction } from "@/lib/actions/auth-actions";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    const res = await updatePasswordAction(password);
    setLoading(false);
    if (res.success) setDone(true);
    else setError(res.error || "Failed to update password.");
  }

  const inputClass =
    "h-11 w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-10 pr-11 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500";

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
          <SparkleIcon className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Set a New Password</h1>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50">
        {done ? (
          <div className="space-y-4 text-center">
            <div className="flex items-center justify-center gap-2 rounded-lg bg-green-50 border border-green-200 px-3 py-3 text-sm text-green-700">
              <ShieldCheck className="h-4 w-4" /> Password updated successfully.
            </div>
            <Link
              href="/"
              className="flex h-11 w-full items-center justify-center rounded-lg bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Continue to Dashboard
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <div>
              <label htmlFor="new-password" className="mb-1.5 block text-xs font-semibold text-slate-700">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="new-password"
                  type={show ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  aria-label={show ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="confirm-password" className="mb-1.5 block text-xs font-semibold text-slate-700">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="confirm-password"
                  type={show ? "text" : "password"}
                  required
                  minLength={6}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repeat your password"
                  className={inputClass}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              Update Password
            </button>
            <div className="flex justify-center">
              <Link href="/login" className="text-xs font-medium text-slate-500 hover:text-slate-700">
                Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
