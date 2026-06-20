/**
 * Fetches live public products from Supabase and falls back to the local
 * catalogue if Supabase is unavailable.
 */
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase.js';
import { liveProducts as localFallback } from '../data/products.js';

const localProductsBySlug = new Map(localFallback.map((product) => [product.slug, product]));

export function useLiveProducts({ collection, category } = {}) {
  const [products, setProducts] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchProducts() {
      try {
        let query = supabase
          .from('aura_products')
          .select('slug, name, category, collection, availability, media_status, short_desc, description, details, price_gbp, sort_order')
          .eq('media_status', 'live')
          .or('archived.is.null,archived.eq.false')
          .order('sort_order', { ascending: true });

        if (collection) query = query.eq('collection', collection);
        if (category) query = query.eq('category', category);

        const { data, error: sbError } = await query;
        if (cancelled) return;
        if (sbError) throw sbError;

        const shaped = (data || []).map((row) => {
          const localProduct = localProductsBySlug.get(row.slug);

          return {
            slug: row.slug,
            name: row.name,
            category: row.category,
            collection: row.collection,
            status: row.availability || 'waitlist',
            mediaStatus: 'live',
            shortDesc: row.short_desc || '',
            description: row.description || '',
            details: Array.isArray(row.details) ? row.details : [],
            price: row.price_gbp,
            image: localProduct?.image ?? null,
            hoverImage: localProduct?.hoverImage ?? null,
            gallery: localProduct?.gallery ?? [],
          };
        });

        setProducts(shaped);
      } catch (err) {
        if (cancelled) return;
        console.warn('[useLiveProducts] Supabase fetch failed, using local fallback:', err.message);
        setError(err.message);

        let fallback = localFallback;
        if (collection) fallback = fallback.filter((product) => product.collection === collection);
        if (category) fallback = fallback.filter((product) => product.category === category);
        setProducts(fallback);
      }
    }

    fetchProducts();
    return () => {
      cancelled = true;
    };
  }, [collection, category]);

  return { products, loading: products === null, error };
}
