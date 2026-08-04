-- ============================================================
-- Migration 004: Production security hardening
-- Date: 2026-08-04
-- ============================================================

ALTER TABLE aura_admin_users
  ADD COLUMN IF NOT EXISTS user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE OR REPLACE FUNCTION public.is_aura_admin(required_roles TEXT[] DEFAULT ARRAY['owner','editor','viewer'])
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM aura_admin_users admin
    WHERE admin.user_id = auth.uid()
      AND admin.role = ANY(required_roles)
  );
$$;

REVOKE ALL ON FUNCTION public.is_aura_admin(TEXT[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_aura_admin(TEXT[]) TO authenticated;

ALTER TABLE aura_products FORCE ROW LEVEL SECURITY;
ALTER TABLE aura_slots FORCE ROW LEVEL SECURITY;
ALTER TABLE aura_candidates FORCE ROW LEVEL SECURITY;
ALTER TABLE aura_briefs FORCE ROW LEVEL SECURITY;
ALTER TABLE aura_media FORCE ROW LEVEL SECURITY;
ALTER TABLE aura_admin_users FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_all_products" ON aura_products;
DROP POLICY IF EXISTS "allow_all_slots" ON aura_slots;
DROP POLICY IF EXISTS "allow_all_candidates" ON aura_candidates;
DROP POLICY IF EXISTS "allow_all_briefs" ON aura_briefs;
DROP POLICY IF EXISTS "admin_all_media" ON aura_media;
DROP POLICY IF EXISTS "admin_users_self" ON aura_admin_users;

CREATE POLICY "public_read_live_products"
  ON aura_products FOR SELECT
  USING (archived IS DISTINCT FROM true AND media_status = 'live');

CREATE POLICY "admin_all_products"
  ON aura_products FOR ALL
  USING (public.is_aura_admin(ARRAY['owner','editor']))
  WITH CHECK (public.is_aura_admin(ARRAY['owner','editor']));

CREATE POLICY "admin_read_products"
  ON aura_products FOR SELECT
  USING (public.is_aura_admin());

CREATE POLICY "admin_all_slots"
  ON aura_slots FOR ALL
  USING (public.is_aura_admin(ARRAY['owner','editor']))
  WITH CHECK (public.is_aura_admin(ARRAY['owner','editor']));

CREATE POLICY "admin_read_slots"
  ON aura_slots FOR SELECT
  USING (public.is_aura_admin());

CREATE POLICY "admin_all_candidates"
  ON aura_candidates FOR ALL
  USING (public.is_aura_admin(ARRAY['owner','editor']))
  WITH CHECK (public.is_aura_admin(ARRAY['owner','editor']));

CREATE POLICY "admin_read_candidates"
  ON aura_candidates FOR SELECT
  USING (public.is_aura_admin());

CREATE POLICY "admin_all_briefs"
  ON aura_briefs FOR ALL
  USING (public.is_aura_admin(ARRAY['owner','editor']))
  WITH CHECK (public.is_aura_admin(ARRAY['owner','editor']));

CREATE POLICY "admin_read_briefs"
  ON aura_briefs FOR SELECT
  USING (public.is_aura_admin());

CREATE POLICY "admin_all_media"
  ON aura_media FOR ALL
  USING (public.is_aura_admin(ARRAY['owner','editor']))
  WITH CHECK (public.is_aura_admin(ARRAY['owner','editor']));

CREATE POLICY "admin_read_media"
  ON aura_media FOR SELECT
  USING (public.is_aura_admin());

CREATE POLICY "admin_users_read_self"
  ON aura_admin_users FOR SELECT
  USING (user_id = auth.uid() OR public.is_aura_admin(ARRAY['owner']));

CREATE POLICY "owner_manage_admin_users"
  ON aura_admin_users FOR ALL
  USING (public.is_aura_admin(ARRAY['owner']))
  WITH CHECK (public.is_aura_admin(ARRAY['owner']));

DROP POLICY IF EXISTS "admin_write_product_images" ON storage.objects;
DROP POLICY IF EXISTS "admin_write_model_images" ON storage.objects;
DROP POLICY IF EXISTS "admin_write_campaign_images" ON storage.objects;
DROP POLICY IF EXISTS "admin_write_product_videos" ON storage.objects;

CREATE POLICY "admin_write_aura_media_buckets"
  ON storage.objects FOR ALL
  USING (
    bucket_id IN ('aura-product-images','aura-model-images','aura-campaign-images','aura-product-videos')
    AND public.is_aura_admin(ARRAY['owner','editor'])
  )
  WITH CHECK (
    bucket_id IN ('aura-product-images','aura-model-images','aura-campaign-images','aura-product-videos')
    AND public.is_aura_admin(ARRAY['owner','editor'])
  );

CREATE TABLE IF NOT EXISTS waitlist_submissions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email        TEXT NOT NULL,
  product_slug TEXT NOT NULL,
  source       TEXT NOT NULL DEFAULT 'website',
  consent      BOOLEAN NOT NULL DEFAULT false,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (email, product_slug)
);

CREATE OR REPLACE TRIGGER trg_waitlist_submissions_updated
  BEFORE UPDATE ON waitlist_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE waitlist_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist_submissions FORCE ROW LEVEL SECURITY;

CREATE POLICY "admin_read_waitlist"
  ON waitlist_submissions FOR SELECT
  USING (public.is_aura_admin());

CREATE POLICY "service_role_manage_waitlist"
  ON waitlist_submissions FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
