# Supabase Migrations

This directory documents every schema change applied to the AURA Fight Club Supabase project.

**Project ID:** `bgqizcctelzuttlfmnve`  
**Region:** EU Central  
**URL:** `https://bgqizcctelzuttlfmnve.supabase.co`

## How to apply

These migrations are reference files — they document what was applied via the Supabase MCP tool or SQL editor. To re-apply to a new project, run them in order through the Supabase SQL editor or CLI.

```bash
# Using Supabase CLI (if configured)
supabase db push
```

## Migration log

| File | Date | Description |
|------|------|-------------|
| `20260609_001_initial_schema.sql` | 2026-06-09 | Full initial schema: products, slots, candidates, briefs, media, admin_users, storage buckets, RLS policies |
| `20260610_002_prevent_duplicate_approved_media.sql` | 2026-06-10 | Add `replaced` status, demote duplicate approved rows, partial unique index `idx_media_one_approved_per_slot`, `approve_media_for_slot()` function |
| `20260611_003_supplier_command_centre.sql` | 2026-06-11 | Supplier command schema only; seed intelligence removed from repository HEAD |
| `20260804_004_production_security_hardening.sql` | 2026-08-04 | Admin role enforcement, strict RLS/storage policies, waitlist submissions |

## Tables

| Table | Purpose |
|-------|---------|
| `aura_products` | Product catalogue (17 products) |
| `aura_slots` | 7 fixed image slots per product (119 total) |
| `aura_candidates` | Candidate images for review |
| `aura_briefs` | AI-generated image briefs per slot |
| `aura_media` | Approved/draft/rejected media with Supabase Storage URLs |
| `aura_admin_users` | Supabase-auth linked admin authorization |
| `waitlist_submissions` | Server-side waitlist submissions |

## Storage buckets

| Bucket | Purpose | Max size |
|--------|---------|----------|
| `aura-product-images` | Clean product shots, angles | 10MB |
| `aura-model-images` | Model wearing/using product | 10MB |
| `aura-campaign-images` | Lifestyle, campaign, ring | 10MB |
| `aura-product-videos` | Video content | 50MB |

## Key constraints

- `aura_slots`: `UNIQUE(product_slug, slot_index)` — one slot record per product per index
- `aura_media`: `UNIQUE INDEX idx_media_one_approved_per_slot WHERE status='approved'` — one approved media row per product per slot index
- RLS: Public reads only see live storefront product rows and approved media.
- Admin writes require a Supabase authenticated user linked through `aura_admin_users.user_id`.
- Waitlist writes are performed by the server-only service role endpoint; anonymous users cannot list submissions.
- Historical commits exposed supplier intelligence before this repair. Do not rewrite history without owner approval.
