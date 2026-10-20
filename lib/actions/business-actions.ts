"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase/client";
import { getCurrentUserAction } from "@/lib/actions/auth-actions";
import { friendlyDbError } from "@/lib/errors";
import {
  DEFAULT_BUSINESS_PROFILE,
  normalizeBusinessField,
  validateBusinessField,
  type BusinessField,
  type BusinessProfile,
} from "@/lib/business-profile";

const FIELDS: BusinessField[] = ["businessName", "address", "phone", "email", "gstin", "pan"];

// Postgres "undefined_table" / PostgREST "table not in schema cache"
function isMissingTable(error: { code?: string; message?: string } | null): boolean {
  return (
    !!error &&
    (error.code === "42P01" ||
      error.code === "PGRST205" ||
      /does not exist|schema cache/i.test(error.message ?? ""))
  );
}

/**
 * Reads the business profile. Falls back to defaults when the table is empty or has not
 * been created yet (`needsSetup` tells the UI to show the one-time SQL instructions).
 */
export async function getBusinessProfileAction(): Promise<{
  profile: BusinessProfile;
  needsSetup: boolean;
}> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return { profile: DEFAULT_BUSINESS_PROFILE, needsSetup: false };
    }

    const { data, error } = await supabase
      .from("business_settings")
      .select('"businessName", address, phone, email, gstin, pan')
      .eq("id", 1)
      .maybeSingle();

    if (error) {
      return { profile: DEFAULT_BUSINESS_PROFILE, needsSetup: isMissingTable(error) };
    }
    if (!data) return { profile: DEFAULT_BUSINESS_PROFILE, needsSetup: false };

    return {
      profile: {
        businessName: data.businessName ?? DEFAULT_BUSINESS_PROFILE.businessName,
        address: data.address ?? DEFAULT_BUSINESS_PROFILE.address,
        phone: data.phone ?? DEFAULT_BUSINESS_PROFILE.phone,
        email: data.email ?? DEFAULT_BUSINESS_PROFILE.email,
        gstin: data.gstin ?? "",
        pan: data.pan ?? "",
      },
      needsSetup: false,
    };
  } catch (error) {
    console.error("Error reading business profile:", error);
    return { profile: DEFAULT_BUSINESS_PROFILE, needsSetup: false };
  }
}

/**
 * Updates ONE field of the business profile (inline editing). Admin only.
 * Returns the saved, normalised profile so the UI can update instantly.
 */
export async function updateBusinessFieldAction(
  field: BusinessField,
  value: string
): Promise<{ success: boolean; error?: string; needsSetup?: boolean; profile?: BusinessProfile }> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return { success: false, error: "NEXT_PUBLIC_SUPABASE_URL is not configured." };
    }
    if (!FIELDS.includes(field)) return { success: false, error: "Unknown field." };

    const current = await getCurrentUserAction();
    if (!current.success || current.user?.role !== "admin") {
      return { success: false, error: "Only the Admin can edit business details." };
    }

    const problem = validateBusinessField(field, value);
    if (problem) return { success: false, error: problem };
    const clean = normalizeBusinessField(field, value);

    const { error } = await supabase.from("business_settings").upsert(
      {
        id: 1,
        [field]: clean,
        updated_at: new Date().toISOString(),
        updated_by: current.user.email,
      },
      { onConflict: "id" }
    );

    if (error) {
      if (isMissingTable(error)) {
        return {
          success: false,
          needsSetup: true,
          error:
            "The business_settings table does not exist yet. Run supabase/business_settings.sql once in the Supabase SQL Editor.",
        };
      }
      throw error;
    }

    const { profile } = await getBusinessProfileAction();

    revalidatePath("/settings");
    revalidatePath("/sales");
    return { success: true, profile };
  } catch (error: any) {
    console.error("Error updating business profile:", error);
    return { success: false, error: friendlyDbError(error, "Failed to save business detail") };
  }
}
