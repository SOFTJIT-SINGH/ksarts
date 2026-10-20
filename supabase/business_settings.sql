-- ==============================================================================
-- BUSINESS PROFILE (single row) — editable by the Admin on the Settings page
-- Run this once in Supabase → SQL Editor. Safe to re-run.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS business_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),   -- enforces exactly one row
  "businessName" TEXT NOT NULL DEFAULT 'KS Arts — Textile Wholesale',
  address TEXT NOT NULL DEFAULT 'Amritsar, Punjab, India',
  phone TEXT NOT NULL DEFAULT '+91 98765 43210',
  email TEXT NOT NULL DEFAULT 'ksonisarees@gmail.com',
  gstin TEXT NOT NULL DEFAULT '',
  pan TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_by TEXT
);

INSERT INTO business_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read/write access to business_settings" ON business_settings;
CREATE POLICY "Allow public read/write access to business_settings"
  ON business_settings FOR ALL USING (true) WITH CHECK (true);
