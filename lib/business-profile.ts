// Shared (client + server) business profile definitions. Not a "use server" file so it can export constants.

export interface BusinessProfile {
  businessName: string;
  address: string;
  phone: string;
  email: string;
  gstin: string;
  pan: string;
}

export type BusinessField = keyof BusinessProfile;

export const DEFAULT_BUSINESS_PROFILE: BusinessProfile = {
  businessName: "KS Arts — Textile Wholesale",
  address: "Amritsar, Punjab, India",
  phone: "+91 98765 43210",
  email: "ksonisarees@gmail.com",
  gstin: "",
  pan: "",
};

export const BUSINESS_FIELD_LABELS: Record<BusinessField, string> = {
  businessName: "Business Name",
  address: "Address",
  phone: "Phone",
  email: "Email",
  gstin: "GSTIN",
  pan: "PAN",
};

/**
 * Validates one field. Returns an error message, or null when the value is acceptable.
 * Used by the browser (instant feedback) and by the Server Action (the real check).
 */
export function validateBusinessField(field: BusinessField, raw: string): string | null {
  const value = raw.trim();
  switch (field) {
    case "businessName":
      if (!value) return "Business name is required.";
      if (value.length > 80) return "Keep it under 80 characters.";
      return null;
    case "address":
      if (!value) return "Address is required.";
      if (value.length > 200) return "Keep it under 200 characters.";
      return null;
    case "phone":
      if (!/^\+?[0-9][0-9\s-]{7,16}$/.test(value)) return "Enter a valid phone number (8-15 digits).";
      return null;
    case "email":
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Enter a valid email address.";
      return null;
    case "gstin":
      if (value && !/^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(value.toUpperCase())) {
        return "GSTIN must be 15 characters, e.g. 03ABCDE1234F1Z5.";
      }
      return null;
    case "pan":
      if (value && !/^[A-Z]{5}\d{4}[A-Z]$/.test(value.toUpperCase())) {
        return "PAN must be 10 characters, e.g. ABCDE1234F.";
      }
      return null;
  }
}

export function normalizeBusinessField(field: BusinessField, raw: string): string {
  const value = raw.trim();
  return field === "gstin" || field === "pan" ? value.toUpperCase() : value;
}
