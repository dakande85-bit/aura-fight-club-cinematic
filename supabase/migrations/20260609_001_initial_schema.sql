-- ============================================================
-- Migration 001: Initial AURA Asset Manager Schema
-- Applied: 2026-06-09
-- Project: bgqizcctelzuttlfmnve (EU Central)
-- ============================================================

-- Products table
CREATE TABLE IF NOT EXISTS aura_products (
  slug               TEXT PRIMARY KEY,
  name               TEXT NOT NULL,
  category           TEXT NOT NULL,
  collection         TEXT NOT NULL DEFAULT 'Drop 001',
  notes              TEXT DEFAULT '',
  media_fill_status  TEXT NOT NULL DEFAULT 'missing'
    CHECK (media_fill_status IN ('complete','progress','missing')),
  availability       TEXT DEFAULT 'waitlist'
    CHECK (availability IN ('available','waitlist','coming-soon','archived')),
  short_desc         TEXT DEFAULT '',
  description        TEXT DEFAULT '',
  details            JSONB DEFAULT '[]',
  price_gbp          NUMERIC(10,2),
  product_type       TEXT DEFAULT 'physical',
  sort_order         INTEGER DEFAULT 0,
  archived           BOOLEAN DEFAULT false,
  media_status       TEXT DEFAULT 'missing',
  updated_at         TIMESTAMPTZ DEFAULT now()
);

-- 7 fixed image slots per product
CREATE TABLE IF NOT EXISTS aura_slots (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_slug TEXT NOT NULL REFERENCES aura_products(slug) ON DELETE CASCADE,
  slot_index   INTEGER NOT NULL CHECK (slot_index >= 0 AND slot_index <= 6),
  slot_type    TEXT DEFAULT '',
  img_url      TEXT,
  note         TEXT DEFAULT '',
  updated_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE (product_slug, slot_index)
);

-- Candidate images per product
CREATE TABLE IF NOT EXISTS aura_candidates (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_slug TEXT NOT NULL REFERENCES aura_products(slug) ON DELETE CASCADE,
  src          TEXT NOT NULL,
  name         TEXT DEFAULT '',
  status       TEXT NOT NULL DEFAULT 'keep'
    CHECK (status IN ('approved','keep','maybe','rejected')),
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

-- AI-generated briefs per product + slot
CREATE TABLE IF NOT EXISTS aura_briefs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_slug TEXT NOT NULL REFERENCES aura_products(slug) ON DELETE CASCADE,
  slot_index   INTEGER NOT NULL CHECK (slot_index >= 0 AND slot_index <= 6),
  brief_text   TEXT NOT NULL DEFAULT '',
  updated_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE (product_slug, slot_index)
);

-- Media metadata table
CREATE TABLE IF NOT EXISTS aura_media (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_slug   TEXT NOT NULL REFERENCES aura_products(slug) ON DELETE CASCADE,
  slot_index     INTEGER NOT NULL CHECK (slot_index >= 0 AND slot_index <= 6),
  slot_type      TEXT NOT NULL DEFAULT 'gallery',
  file_url       TEXT,
  storage_path   TEXT,
  storage_bucket TEXT,
  file_type      TEXT DEFAULT 'image',
  title          TEXT DEFAULT '',
  alt_text       TEXT DEFAULT '',
  notes          TEXT DEFAULT '',
  status         TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','approved','rejected','replaced')),
  sort_order     INTEGER DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now()
);

-- Admin users (auth prep — not enforced yet)
CREATE TABLE IF NOT EXISTS aura_admin_users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT UNIQUE NOT NULL,
  role       TEXT NOT NULL DEFAULT 'editor'
    CHECK (role IN ('owner','editor','viewer')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── AUTO-UPDATE TRIGGERS ────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_products_updated
  BEFORE UPDATE ON aura_products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE OR REPLACE TRIGGER trg_slots_updated
  BEFORE UPDATE ON aura_slots FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE OR REPLACE TRIGGER trg_candidates_updated
  BEFORE UPDATE ON aura_candidates FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE OR REPLACE TRIGGER trg_briefs_updated
  BEFORE UPDATE ON aura_briefs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE OR REPLACE TRIGGER trg_media_updated
  BEFORE UPDATE ON aura_media FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── INDEXES ─────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_media_product_slug    ON aura_media(product_slug);
CREATE INDEX IF NOT EXISTS idx_media_status          ON aura_media(status);
CREATE INDEX IF NOT EXISTS idx_media_product_status  ON aura_media(product_slug, status);

-- ── ROW LEVEL SECURITY ──────────────────────────────────────────────────
ALTER TABLE aura_products    ENABLE ROW LEVEL SECURITY;
ALTER TABLE aura_slots       ENABLE ROW LEVEL SECURITY;
ALTER TABLE aura_candidates  ENABLE ROW LEVEL SECURITY;
ALTER TABLE aura_briefs      ENABLE ROW LEVEL SECURITY;
ALTER TABLE aura_media       ENABLE ROW LEVEL SECURITY;
ALTER TABLE aura_admin_users ENABLE ROW LEVEL SECURITY;

-- Open policies (lock down with auth later)
CREATE POLICY "allow_all_products"   ON aura_products   FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_slots"      ON aura_slots      FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_candidates" ON aura_candidates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_briefs"     ON aura_briefs     FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "admin_all_media"      ON aura_media      FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "admin_users_self"     ON aura_admin_users FOR SELECT USING (true);

-- Public can only read approved media
CREATE POLICY "public_read_approved_media"
  ON aura_media FOR SELECT USING (status = 'approved');

-- ── STORAGE BUCKETS ─────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('aura-product-images',  'aura-product-images',  true, 10485760, ARRAY['image/webp','image/jpeg','image/png','image/jpg']),
  ('aura-model-images',    'aura-model-images',    true, 10485760, ARRAY['image/webp','image/jpeg','image/png','image/jpg']),
  ('aura-campaign-images', 'aura-campaign-images', true, 10485760, ARRAY['image/webp','image/jpeg','image/png','image/jpg']),
  ('aura-product-videos',  'aura-product-videos',  true, 52428800, ARRAY['video/mp4','video/webm'])
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "public_read_product_images"  ON storage.objects FOR SELECT USING (bucket_id = 'aura-product-images');
CREATE POLICY "public_read_model_images"    ON storage.objects FOR SELECT USING (bucket_id = 'aura-model-images');
CREATE POLICY "public_read_campaign_images" ON storage.objects FOR SELECT USING (bucket_id = 'aura-campaign-images');
CREATE POLICY "public_read_product_videos"  ON storage.objects FOR SELECT USING (bucket_id = 'aura-product-videos');
CREATE POLICY "admin_write_product_images"  ON storage.objects FOR ALL USING (bucket_id = 'aura-product-images')  WITH CHECK (bucket_id = 'aura-product-images');
CREATE POLICY "admin_write_model_images"    ON storage.objects FOR ALL USING (bucket_id = 'aura-model-images')    WITH CHECK (bucket_id = 'aura-model-images');
CREATE POLICY "admin_write_campaign_images" ON storage.objects FOR ALL USING (bucket_id = 'aura-campaign-images') WITH CHECK (bucket_id = 'aura-campaign-images');
CREATE POLICY "admin_write_product_videos"  ON storage.objects FOR ALL USING (bucket_id = 'aura-product-videos')  WITH CHECK (bucket_id = 'aura-product-videos');
