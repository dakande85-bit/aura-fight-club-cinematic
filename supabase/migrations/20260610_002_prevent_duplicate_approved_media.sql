-- ============================================================
-- Migration 002: Prevent Duplicate Approved Media Rows
-- Applied: 2026-06-10
-- Project: bgqizcctelzuttlfmnve (EU Central)
-- ============================================================
-- Problem: Phase 2 migration seeded legacy local webp paths as
-- approved rows, then uploads added new Supabase Storage rows
-- without demoting the old ones. Gallery counts inflated and
-- the wrong (legacy) URL could appear in card/hover positions.
--
-- Solution:
--   1. Add 'replaced' as valid status for superseded rows
--   2. Demote all existing duplicates (keep newest per slot)
--   3. Partial unique index: one approved row per product+slot
--   4. DB function: approve_media_for_slot() for safe promotion
-- ============================================================

-- ── STEP 1: Expand status enum to include 'replaced' ───────────────────
ALTER TABLE aura_media DROP CONSTRAINT IF EXISTS aura_media_status_check;
ALTER TABLE aura_media ADD CONSTRAINT aura_media_status_check
  CHECK (status IN ('draft', 'approved', 'rejected', 'replaced'));

-- ── STEP 2: Demote existing duplicate approved rows ─────────────────────
-- For each (product_slug, slot_index) group with multiple approved rows,
-- keep only the one with the highest slot_index / most recent created_at.
-- All others become 'replaced' — not deleted, just hidden from public.
WITH ranked AS (
  SELECT
    id,
    product_slug,
    slot_index,
    ROW_NUMBER() OVER (
      PARTITION BY product_slug, slot_index
      ORDER BY slot_index DESC, created_at DESC
    ) AS rn
  FROM aura_media
  WHERE status = 'approved'
),
to_demote AS (SELECT id FROM ranked WHERE rn > 1)
UPDATE aura_media
SET status = 'replaced'
WHERE id IN (SELECT id FROM to_demote);

-- ── STEP 3: Partial unique index ────────────────────────────────────────
-- Enforces: only ONE approved row per (product_slug, slot_index).
-- Draft, rejected, and replaced rows are unaffected.
-- Any INSERT/UPDATE violating this raises a constraint error at DB level.
DROP INDEX IF EXISTS idx_media_one_approved_per_slot;
CREATE UNIQUE INDEX idx_media_one_approved_per_slot
  ON aura_media (product_slug, slot_index)
  WHERE (status = 'approved');

-- ── STEP 4: Safe approval function ─────────────────────────────────────
-- Use this in application code or admin flows when approving a media row.
-- Atomically demotes the old approved row and promotes the new one.
-- Prevents race conditions from simultaneous approvals.
CREATE OR REPLACE FUNCTION approve_media_for_slot(
  p_product_slug TEXT,
  p_slot_index   INTEGER,
  p_media_id     UUID
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Demote any currently approved row for this slot to 'replaced'
  UPDATE aura_media
  SET    status = 'replaced'
  WHERE  product_slug = p_product_slug
    AND  slot_index   = p_slot_index
    AND  status       = 'approved'
    AND  id           != p_media_id;

  -- Approve the target row
  UPDATE aura_media
  SET    status = 'approved'
  WHERE  id = p_media_id;
END;
$$;

-- ── VERIFICATION ────────────────────────────────────────────────────────
-- Run after applying to confirm zero duplicates remain:
--
--   SELECT count(*) as duplicate_groups
--   FROM (
--     SELECT product_slug, slot_index
--     FROM aura_media
--     WHERE status = 'approved'
--     GROUP BY product_slug, slot_index
--     HAVING count(*) > 1
--   ) sub;
--
-- Expected result: 0
