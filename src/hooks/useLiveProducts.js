/**
 * useLiveProducts
 * ────────────────
 * Fetches products from Supabase `aura_products` where:
 *   - archived IS false or null
 *   - media_status = 'live'
 *
 * Falls back to local liveProducts if Supabase fails, so the
 * public site never breaks due to a network or config error.
 *
 * Once a product is marked media_status='live' in /admin,
 * it appears on public pages automatically — no code deploy needed.
 */
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase.js';
import { liveProducts as localFallback } from '../data/products.js';

export function useLiveProducts({ collection, category } = {}) {
  const [products, setProducts] = useState(null); // null = loading
  const [error,    setError]    = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetch() {
      try {
        let query = supabase
          .from('aura_products')
          .select('slug, name, category, collection, availability, media_status, short_desc, description, details, price_gbp, sort_order')
          .eq('media_status', 'live')
          .or('archived.is.null,archived.eq.false')
          .order('sort_order', { ascending: true });

        if (collection) query = query.eq('collection', collection);
        if (category)   query = query.eq('category',   category);

        const { data, error: sbError } = await query;

        if (cancelled) return;

        if (sbError) throw sbError;

        // Shape Supabase rows to match the local product shape
        // so ProductCard works with either source
        const shaped = (data || []).map(row => ({
          slug:        row.slug,
          name:        row.name,
          category:    row.category,
          collection:  row.collection,
          status:      row.availability || 'waitlist',
          mediaStatus: 'live',                         // already filtered above
          shortDesc:   row.short_desc || '',
          description: row.description || '',
          details:     Array.isArray(row.details) ? row.details : [],
          price:       row.price_gbp,
          // image/hoverImage intentionally left null here —
          // ProductCard uses useProductMedia(slug) for Supabase images,
          // falling back to local paths for the 3 legacy products.
          image:       null,
          hoverImage:  null,
          gallery:     [],
        }));

        setProducts(shaped);
      } catch (err) {
        if (cancelled) return;
        console.warn('[useLiveProducts] Supabase fetch failed, using local fallback:', err.message);
        setError(err.message);
        // Apply same filters to local fallback
        let fallback = localFallback;
        if (collection) fallback = fallback.filter(p => p.collection === collection);
        if (category)   fallback = fallback.filter(p => p.category   === category);
        setProducts(fallback);
      }
    }

    fetch();
    return () => { cancelled = true; };
  }, [collection, category]);

  return { products, loading: products === null, error };
}
