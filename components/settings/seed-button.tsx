"use client";

import { useState } from "react";
import { Database, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { seedDatabaseAction } from "@/lib/actions/seed-actions";

export function SeedDatabaseButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSeed = async () => {
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await seedDatabaseAction();
      if (res.success) {
        setMessage(res.message || "Database seeded successfully!");
      } else {
        setError(res.error || "Failed to seed database.");
      }
    } catch (err: any) {
      setError(err.message || "Unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <Button
        onClick={handleSeed}
        disabled={loading}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-10 justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Connecting & Seeding MongoDB...</span>
          </>
        ) : (
          <>
            <Database className="h-4 w-4" />
            <span>Seed MongoDB Atlas (1-Click Init)</span>
          </>
        )}
      </Button>

      {message && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 text-xs">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
