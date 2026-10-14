/**
 * Turns low-level errors into messages a shop owner can act on.
 * Supabase reports network problems as "TypeError: fetch failed" / connect timeouts.
 */
export function friendlyDbError(error: unknown, fallback: string): string {
  const e = error as { message?: string; details?: string } | null;
  const text = `${e?.message ?? ""} ${e?.details ?? ""}`;
  if (/fetch failed|ConnectTimeout|UND_ERR_CONNECT_TIMEOUT|ECONNREFUSED|ENOTFOUND|ETIMEDOUT/i.test(text)) {
    return "Cannot reach the database (network timeout). Check your internet connection and try again.";
  }
  return e?.message || fallback;
}
