/**
 * useProductMedia  v2
 * ────────────────────
 * Deterministic slot-based media mapping.
 * Every image role is resolved by explicit slot_type, not priority guessing.
 *
 * Slot roles (both default and boots-specific):
 *
 *   CARD IMAGE    ← clean_product_shot  (slot 0)
 *                   hero_product_dark   (boots slot 1, preferred over clean)
 *
 *   HOVER IMAGE   ← model_full_outfit   (slot 3 always)
 *                   DISABLED if empty — never shows a random wrong image
 *
 *   GALLERY       ← all approved slots in slot_index order
 *                   slot_type preserved for ProductMediaGallery cover/contain logic
 *
 * Fallback rules:
 *   - cardImage:  clean_product_shot → hero_product_dark → first approved → null
 *   - hoverImage: model_full_outfit only → null (no fallback — disable swap if missing)
 *   - gallery:    all approved rows ordered by slot_index
 *
 * Public RLS: only status='approved' rows are readable — draft/rejected stay admin-only.
 */
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase.js';

// Slot types whose images should use object-fit: cover (model/lifestyle shots)
export const COVER_SLOT_TYPES = new Set([
  'model_full_outfit',
  'lifestyle_1', 'lifestyle_2', 'lifestyle_ring',
  'campaign_in_use',
  'hero_product_dark',
]);

// Slot types that should use object-fit: contain (clean product shots)
export const CONTAIN_SLOT_TYPES = new Set([
  'clean_product_shot',
  'secondary_angle', 'detail_shot', 'detail_side_angle', 'studio_angle',
]);

function resolveMedia(rows) {
  if (!rows?.length) return null;

  // Index by slot_type — keep the lowest slot_index if duplicates
  const byType = {};
  [...rows].sort((a, b) => a.slot_index - b.slot_index)
    .forEach(m => {
      if (!byType[m.slot_type]) byType[m.slot_type] = m;
    });

  // ── CARD IMAGE ────────────────────────────────────────────────────────
  // Footwear: hero_product_dark is the preferred dark-background product shot
  // All others: clean_product_shot
  // Final fallback: first approved row by slot_index
  const cardRow =
    byType['clean_product_shot'] ??
    byType['hero_product_dark']  ??
    rows[0];
  const cardImage = cardRow?.file_url ?? null;

  // ── HOVER IMAGE ───────────────────────────────────────────────────────
  // Strictly model_full_outfit only.
  // If empty → null. We never substitute a lifestyle or campaign image
  // to avoid wrong-product hover images.
  const hoverRow  = byType['model_full_outfit'] ?? null;
  const hoverImage = hoverRow?.file_url ?? null;

  // ── GALLERY ───────────────────────────────────────────────────────────
  // All approved rows in slot_index order, with slot_type for cover/contain
  const gallery = [...rows]
    .sort((a, b) => a.slot_index - b.slot_index)
    .map(m => ({
      src:      m.file_url,
      alt:      m.alt_text || m.title || m.slot_type || '',
      slotType: m.slot_type,
      isCover:  COVER_SLOT_TYPES.has(m.slot_type),
    }));

  return { cardImage, hoverImage, gallery, byType };
}

// ── SINGLE PRODUCT ────────────────────────────────────────────────────────
export function useProductMedia(slug) {
  const [media,   setMedia]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) { setLoading(false); return; }
    setLoading(true);

    supabase
      .from('aura_media')
      .select('slot_index, slot_type, file_url, alt_text, title')
      .eq('product_slug', slug)
      .eq('status', 'approved')
      .order('slot_index')
      .then(({ data }) => {
        setMedia(data?.length ? resolveMedia(data) : null);
        setLoading(false);
      });
  }, [slug]);

  return { media, loading };
}

// ── ALL PRODUCTS (collection pages — avoids N+1) ──────────────────────────
export function useAllProductMedia() {
  const [mediaMap, setMediaMap] = useState({});
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    supabase
      .from('aura_media')
      .select('product_slug, slot_index, slot_type, file_url, alt_text, title')
      .eq('status', 'approved')
      .order('slot_index')
      .then(({ data }) => {
        const grouped = {};
        (data || []).forEach(m => {
          if (!grouped[m.product_slug]) grouped[m.product_slug] = [];
          grouped[m.product_slug].push(m);
        });
        const result = {};
        Object.entries(grouped).forEach(([slug, rows]) => {
          result[slug] = resolveMedia(rows);
        });
        setMediaMap(result);
        setLoading(false);
      });
  }, []);

  return { mediaMap, loading };
}
