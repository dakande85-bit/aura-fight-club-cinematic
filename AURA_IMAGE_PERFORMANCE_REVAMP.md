# AURA image performance revamp

## Problem
Images on the public site are still slow to load because the pages use large editorial/product images directly in visible sections. Several pages load heavy visual panels instead of mobile-sized or card-sized variants. The homepage also recently restored scroll sections, which increases the number of images below the hero.

## Goal
Make the site feel fast while keeping the premium cinematic AURA look.

## Non-negotiables
- Do not remove the premium imagery.
- Do not add GIFs.
- Do not reintroduce forced scrollTo behavior.
- Do not dispatch synthetic resize or scroll events.
- Do not break admin pages.
- Do not make Drop 002 products look live.
- Keep Drop 001 product rules intact.

## Main fixes required

### 1. Create responsive image variants
For every image used on homepage, drops, drop-001, apparel, footwear, equipment, campaign, fight-club, and who-we-are, create optimized WebP variants:

- hero: 1600w, 1200w, 900w, 640w
- card/panel: 900w, 640w, 420w
- mobile hero: 768w and 480w

Keep originals only if needed, but public pages should use optimized variants.

### 2. Add a central image manifest
Create a central image manifest with fields:

- src
- srcSet
- sizes
- width
- height
- alt
- loading
- fetchPriority
- fit
- position

Use this instead of hardcoded image paths across pages where possible.

### 3. Build a reusable OptimizedImage component
Create `src/components/OptimizedImage.jsx`.

Requirements:
- accepts src, srcSet, sizes, width, height, alt
- uses loading="lazy" by default
- uses decoding="async"
- allows fetchPriority="high" only for the single homepage hero image
- supports fallback placeholder class if image errors
- prevents layout shift with width/height or aspect ratio

### 4. Homepage priority loading rules
Homepage should load:

- hero image eager / high priority
- first below-fold section image lazy but close to viewport
- all later scroll images lazy

Do not load all campaign/category images as high priority.

### 5. Reduce number of images on homepage initial load
Homepage should remain cinematic but avoid loading too many images immediately.

Required homepage layout:
- Hero: one optimized hero image
- Statement: no image
- Drop 001: 3 or 4 product cards max
- Categories: 3 optimized panel images
- Campaign: 3 or 4 optimized images max
- Final CTA: no image

### 6. Product card media rules
For product cards:
- use product mockup images where available
- use object-fit: contain for product images
- use object-fit: cover only for editorial panels
- no broken images
- no random huge campaign images inside product cards if smaller product image exists

### 7. CSS performance fixes
Audit CSS for image panels and ensure:
- fixed aspect-ratio containers
- no image layout shift
- no unnecessary huge min-heights on mobile
- content-visibility: auto for below-fold heavy sections where safe
- contain-intrinsic-size for large below-fold sections where safe

### 8. Verification
Run:

npm run build

Then verify desktop and mobile:
- /
- /who-we-are
- /drops
- /drop-001
- /apparel
- /footwear
- /equipment
- /campaign
- /fight-club
- /admin

Check:
- no broken images
- no console errors
- no horizontal overflow
- hero image loads first
- below-fold images lazy load
- mobile does not download unnecessary desktop-sized images where variants exist
- no layout jumps on hard refresh

## Commit message
`perf: revamp image loading and responsive assets`
