# AURA Fight Club Storefront

React/Vite storefront for AURA Fight Club.

## Repaired Architecture

- Customer routes render the existing AURA visual system and public product/media presentation.
- Shopify Storefront API is the commerce authority for products, variants, cart lines and checkout.
- Supabase stores admin-managed media metadata, admin authorization records and waitlist submissions.
- Admin routes require Supabase auth plus an `aura_admin_users.user_id` role check.
- Server-only waitlist writes use `SUPABASE_SERVICE_ROLE_KEY` from `/api/waitlist`; the browser never receives it.

## Required Environment Variables

Client:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_SHOPIFY_STORE_DOMAIN=
VITE_SHOPIFY_STOREFRONT_TOKEN=
VITE_SHOPIFY_STOREFRONT_API_VERSION=2026-07
```

Server-only:

```bash
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

Do not commit real values or `.env` files.

## Database Migrations

Apply migrations in `supabase/migrations` in order. The security repair is:

- `20260804_004_production_security_hardening.sql`

After applying it, link admin accounts by setting `aura_admin_users.user_id` to the matching `auth.users.id` and assigning `owner`, `editor` or `viewer`.

## Local Development

```bash
npm install
npm run dev
```

## Verification

```bash
npm run lint
npm test
npm run build
```

`npm test` runs the repository security/import scan.

## Deployment

1. Apply Supabase migrations.
2. Configure all required environment variables in the deployment platform.
3. Confirm Shopify Storefront API token has public Storefront permissions only.
4. Run CI and deploy the saved branch artifact.
5. Smoke test homepage, shop/category routes, product page, cart, waitlist, admin login, legal pages and 404 on mobile and desktop.

## Rollback

Revert the deployment to the previous platform release. Database rollback requires a reviewed SQL rollback plan because the hardening migration changes RLS policies.

## Known Blockers

- Verified business/legal details are required before legal pages are production-complete.
- Shopify Storefront environment values are required before real product/cart/checkout flows can operate.
- Supabase service-role env values are required server-side before waitlist submissions can persist.
- Historical commits exposed supplier intelligence; owner approval is required before any history rewrite or broader remediation.

## Retired Legacy Files

- `src/data/supplierCommandData.js` was removed from repository HEAD.
- The supplier command centre frontend was replaced with a locked admin placeholder until secured server-side supplier management is implemented.
