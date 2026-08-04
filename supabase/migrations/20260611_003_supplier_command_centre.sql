-- ============================================================
-- Migration 003: Supplier Command Centre schema
-- Applied: 2026-06-11
--
-- Security repair note:
-- Supplier seed data and commercial terms were removed from repository HEAD.
-- Manage supplier records through secured database/admin operations only.
-- Historical Git commits still exposed prior supplier data and require
-- owner-approved remediation; do not rewrite history without approval.
-- ============================================================

CREATE TABLE IF NOT EXISTS suppliers (
  id                 TEXT PRIMARY KEY,
  name               TEXT NOT NULL,
  type               TEXT NOT NULL CHECK (type IN ('POD','OEM','LOCAL','PACKAGING','ACCESSORIES')),
  website            TEXT DEFAULT '',
  contact_email      TEXT DEFAULT '',
  country            TEXT DEFAULT '',
  product_categories JSONB DEFAULT '[]',
  moq                TEXT DEFAULT '',
  sample_available   BOOLEAN DEFAULT false,
  best_for           TEXT DEFAULT '',
  notes              TEXT DEFAULT '',
  status             TEXT NOT NULL DEFAULT 'not_contacted'
    CHECK (status IN ('not_contacted','contacted','sample_requested','sample_received','approved','rejected','production_ready')),
  last_contacted     DATE,
  created_at         TIMESTAMPTZ DEFAULT now(),
  updated_at         TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS supplier_products (
  id                     TEXT PRIMARY KEY,
  product_name           TEXT NOT NULL,
  category               TEXT NOT NULL,
  supplier_type_needed   TEXT NOT NULL CHECK (supplier_type_needed IN ('POD','OEM','LOCAL','PACKAGING','ACCESSORIES')),
  preferred_supplier_id  TEXT REFERENCES suppliers(id) ON DELETE SET NULL,
  backup_supplier_id     TEXT REFERENCES suppliers(id) ON DELETE SET NULL,
  reference_image_urls   JSONB DEFAULT '[]',
  material               TEXT DEFAULT '',
  fabric_weight_gsm      TEXT DEFAULT '',
  colourway              TEXT DEFAULT '',
  logo_placement         TEXT DEFAULT '',
  typography_notes       TEXT DEFAULT '',
  hardware               TEXT DEFAULT '',
  sole_padding_stitching TEXT DEFAULT '',
  finish                 TEXT DEFAULT '',
  sizing                 TEXT DEFAULT '',
  packaging              TEXT DEFAULT '',
  accuracy_notes         TEXT DEFAULT '',
  manufacturing_notes    TEXT DEFAULT '',
  target_price           TEXT DEFAULT '',
  target_moq             TEXT DEFAULT '',
  status                 TEXT NOT NULL DEFAULT 'not_contacted',
  created_at             TIMESTAMPTZ DEFAULT now(),
  updated_at             TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS supplier_contact_logs (
  id              TEXT PRIMARY KEY,
  supplier_id     TEXT NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  product_spec_id TEXT REFERENCES supplier_products(id) ON DELETE SET NULL,
  contact_type    TEXT NOT NULL DEFAULT 'email',
  subject         TEXT DEFAULT '',
  body            TEXT DEFAULT '',
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE OR REPLACE TRIGGER trg_suppliers_updated
  BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE OR REPLACE TRIGGER trg_supplier_products_updated
  BEFORE UPDATE ON supplier_products FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_suppliers_status ON suppliers(status);
CREATE INDEX IF NOT EXISTS idx_suppliers_type ON suppliers(type);
CREATE INDEX IF NOT EXISTS idx_supplier_products_status ON supplier_products(status);
CREATE INDEX IF NOT EXISTS idx_supplier_contact_logs_supplier ON supplier_contact_logs(supplier_id);

ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_contact_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_all_suppliers" ON suppliers;
DROP POLICY IF EXISTS "allow_all_supplier_products" ON supplier_products;
DROP POLICY IF EXISTS "allow_all_supplier_contact_logs" ON supplier_contact_logs;

CREATE POLICY "admin_all_suppliers"
  ON suppliers FOR ALL
  USING (public.is_aura_admin())
  WITH CHECK (public.is_aura_admin());

CREATE POLICY "admin_all_supplier_products"
  ON supplier_products FOR ALL
  USING (public.is_aura_admin())
  WITH CHECK (public.is_aura_admin());

CREATE POLICY "admin_all_supplier_contact_logs"
  ON supplier_contact_logs FOR ALL
  USING (public.is_aura_admin())
  WITH CHECK (public.is_aura_admin());
