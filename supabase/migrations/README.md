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

## Tables

| Table | Purpose |
|-------|---------|
| `aura_products` | Product catalogue (17 products) |
| `aura_slots` | 7 fixed image slots per product (119 total) |
| `aura_candidates` | Candidate images for review |
| `aura_briefs` | AI-generated image briefs per slot |
| `aura_media` | Approved/draft/rejected media with Supabase Storage URLs |
| `aura_admin_users` | Auth prep (not yet enforced) |

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
- RLS: Public reads only see `aura_media` rows where `status = 'approved'`
