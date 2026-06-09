/**
 * useProductMedia — fetches approved media from Supabase for a product.
 * Public website only ever sees status='approved' rows (RLS enforced).
 *
 * Returns:
 *   cardImage     — hero_product_dark > model_full_outfit > clean_product_shot
 *   hoverImage    — model_full_outfit > lifestyle_1
 *   gallery       — all approved slots in sort_order
 *   loading
 */
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase.js';

const CARD_PRIORITY  = ['hero_product_dark','model_full_outfit','clean_product_shot'];
const HOVER_PRIORITY = ['model_full_outfit','lifestyle_ring','lifestyle_1','campaign_in_use'];

export function useProductMedia(slug) {
  const [media,   setMedia]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);

    supabase
      .from('aura_media')
      .select('*')
      .eq('product_slug', slug)
      .eq('status', 'approved')
      .order('sort_order')
      .then(({ data }) => {
        if (!data?.length) { setMedia(null); setLoading(false); return; }

        const byType = {};
        data.forEach(m => { byType[m.slot_type] = m.file_url; });

        const cardImage  = CARD_PRIORITY.find(t => byType[t])
          ? byType[CARD_PRIORITY.find(t => byType[t])]
          : data[0]?.file_url;

        const hoverImage = HOVER_PRIORITY.find(t => byType[t])
          ? byType[HOVER_PRIORITY.find(t => byType[t])]
          : null;

        const gallery = data.map(m => ({
          src:      m.file_url,
          alt:      m.alt_text || m.title || '',
          slotType: m.slot_type,
        }));

        setMedia({ cardImage, hoverImage, gallery, byType });
        setLoading(false);
      });
  }, [slug]);

  return { media, loading };
}

/**
 * useAllProductMedia — fetches approved media for all products at once.
 * Used by collection pages to avoid N+1 queries.
 */
export function useAllProductMedia() {
  const [mediaMap, setMediaMap] = useState({});
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    supabase
      .from('aura_media')
      .select('*')
      .eq('status', 'approved')
      .order('sort_order')
      .then(({ data }) => {
        const map = {};
        (data || []).forEach(m => {
          if (!map[m.product_slug]) map[m.product_slug] = [];
          map[m.product_slug].push(m);
        });

        const result = {};
        Object.entries(map).forEach(([slug, rows]) => {
          const byType = {};
          rows.forEach(m => { byType[m.slot_type] = m.file_url; });

          result[slug] = {
            cardImage:  CARD_PRIORITY.find(t => byType[t])
              ? byType[CARD_PRIORITY.find(t => byType[t])] : rows[0]?.file_url,
            hoverImage: HOVER_PRIORITY.find(t => byType[t])
              ? byType[HOVER_PRIORITY.find(t => byType[t])] : null,
            gallery: rows.map(m => ({ src: m.file_url, alt: m.alt_text || m.title || '', slotType: m.slot_type })),
          };
        });
        setMediaMap(result);
        setLoading(false);
      });
  }, []);

  return { mediaMap, loading };
}
