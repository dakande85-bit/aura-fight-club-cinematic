# AURA Fight Club — Lifestyle editorial lookbook

Updated 15 October 2026. The canonical lifestyle showcase is **/members**. **/lifestyle** redirects there.

## Editorial, not ecommerce
The Club presents AURA product and campaign **design concepts**, not an active product catalogue. Do not add prices, "buy now", carts, stock counters, checkout redirects, or paid-membership promises. Future collection enquiries use the site's email link.

## Imagery
Ten original user-provided campaign images are committed to `public/assets/lookbook-2026/` and verified during the production build. The React page uses those **local** files and explicit fallbacks already in `public/assets/category-support/` and `public/assets/aura-live/`.

Avoid external expiring image URLs on the live website. Assets are displayed with human-readable alt text, responsive crops, and dedicated editorial chapters:
1. Opening varsity campaign
2. The club manifesto
3. The uniform
4. Boxing training film
5. Movement/performance
6. Equipment and footwear
7. People and practice
8. Future-collection enquiry

Four uploaded staging images failed retrieval and are *not* referenced. Use the curated local alternatives rather than publishing broken artwork.

## Future owner-provided image batches
The optional GitHub Actions workflow `aura-lookbook-assets.yml` is **manual-only**. Prepare a fresh `data/aura-lookbook-import.json` with authenticated temporary staging URLs and safe lowercase hyphenated image names. Trigger manually and review its output. Import creates committed local JPEG files. Remove temporary URLs from the manifest once the import succeeds; the manifest stays empty between batches. Make responsive design changes using GitHub and verify Vercel READY; do not consume Lovable credits.
