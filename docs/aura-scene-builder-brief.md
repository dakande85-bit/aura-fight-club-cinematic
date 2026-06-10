# AURA Scene Builder — Technical Build Brief

## Purpose

AURA Scene Builder is the backend/admin system for managing cinematic scroll-film pages across the Aura Fight Club site.

The goal is to stop hardcoding homepage/campaign visuals directly inside React components. Admin users should be able to upload videos, frame sequences, posters, fallbacks, scene text, CTA links, and mobile/desktop crop settings through forms, then publish those changes safely without touching frontend code.

This system is inspired by the current AURA image review/admin workflow, but focused specifically on cinematic page structure.

---

## Current Problem

The live site currently has cinematic pages where visual sequences are hardcoded in files such as:

- `src/ScrollFilm.jsx`
- `src/CampaignScrollFilm.jsx`

This creates several problems:

1. Replacing visuals requires code edits.
2. Bad AI-generated frames can accidentally go live.
3. Mobile and desktop crops cannot be managed cleanly.
4. First-load poster/fallback issues are hard to fix safely.
5. Frame counts can make pages slow if not controlled.
6. Scene text, CTAs, timing, and media order are not editable from admin.

---

## Target Outcome

Create a robust admin system where cinematic pages are controlled by data:

```text
Cinematic Page
  -> Scenes
    -> Media assets
    -> Text content
    -> Timing
    -> Mobile/desktop settings
    -> Publish status
```

The frontend should eventually read scene configuration from generated JSON or Supabase-backed API data instead of manually hardcoded scene arrays.

---

## Admin Areas

### 1. Cinematic Pages

Manage top-level cinematic pages:

- Homepage
- Campaign
- Fight Club
- Drop launch pages
- Future collection/campaign pages

Fields:

- Page title
- Page slug
- Page type
- Status: draft / published / archived
- Published version
- Notes

---

### 2. Scene Manager

Each page contains ordered scenes.

Scene fields:

- Scene name
- Scene key
- Scene order
- Scene type:
  - video
  - image_sequence
  - static_image
  - product_reveal
  - manifesto
- Start position
- End position
- Label
- Headline lines
- Subtitle
- Frame captions
- CTA label
- CTA URL
- Desktop object position
- Mobile object position
- Brightness/filter controls
- Active toggle

Example:

```json
{
  "id": "footwork",
  "type": "image_sequence",
  "label": "FOOTWORK",
  "headline": ["FOOTWORK.", "TIMING.", "CONTROL."],
  "subtitle": "Built where nobody is watching.",
  "start": 0.36,
  "end": 0.52,
  "ctaLabel": "Explore Footwear",
  "ctaHref": "/footwear"
}
```

---

### 3. Media Library

Media records are attached to scenes.

Supported media:

- Desktop video
- Mobile video
- Poster image
- Fallback image
- Desktop frame sequence
- Mobile frame sequence
- Product reveal stills

Media fields:

- Scene ID
- Media type
- URL
- Storage path
- Filename
- Device target: desktop / mobile / all
- Frame order
- Status:
  - pending_review
  - approved
  - rejected
  - needs_retouch
  - hidden_from_live
  - published
- Notes
- Width
- Height
- Duration
- File size
- Created date

---

### 4. Frame Review Workflow

Every uploaded image/video frame should be reviewed before publishing.

Review statuses:

```text
Pending Review
Approved
Rejected
Needs Retouch
Hidden From Live
Published
```

Review notes examples:

```text
Bad glove
Wrong hand
Too dark
Good for mobile
Use as poster
Use as final frame
Crop too tight
```

Live pages should only consume media marked:

```text
Approved + Published
```

This prevents weak AI frames from accidentally appearing in the campaign or homepage.

---

### 5. Preview System

The admin needs previews before publishing:

- Desktop preview
- Mobile preview
- Scene-by-scene preview
- Scroll-film preview
- Poster/fallback preview
- Load-time/media-weight warning

Preview checks:

- Does first frame load correctly?
- Does video autoplay correctly?
- Does mobile crop work?
- Is text readable?
- Are too many frames loaded?
- Are any unapproved frames included?

---

## Storage Recommendation

Preferred stack:

```text
Supabase = database/auth/version records
Cloudinary = image/video storage + optimisation
Vercel = frontend deployment
```

Alternative:

```text
Supabase Storage instead of Cloudinary
```

Cloudinary is preferred for automatic transformations, compression, video handling, responsive sizes, and CDN delivery.

---

## Folder/URL Structure

Generated media paths should be organised like:

```text
/cinematic/homepage/scene-01-hero/desktop-video.mp4
/cinematic/homepage/scene-01-hero/mobile-video.mp4
/cinematic/homepage/scene-01-hero/poster.webp
/cinematic/homepage/scene-01-hero/fallback.webp

/cinematic/homepage/scene-02-shadow-boxing/frame-01.webp
/cinematic/homepage/scene-02-shadow-boxing/frame-02.webp

/cinematic/campaign/scene-03-sparring/frame-01.webp
/cinematic/campaign/scene-03-sparring/frame-02.webp
```

Admin uploads should auto-rename files into stable publish paths.

---

## Database Schema Draft

### `cinematic_pages`

```sql
id uuid primary key
slug text unique not null
title text not null
page_type text not null
status text not null default 'draft'
published_version_id uuid null
notes text null
created_at timestamptz default now()
updated_at timestamptz default now()
```

### `cinematic_scenes`

```sql
id uuid primary key
page_id uuid references cinematic_pages(id) on delete cascade
scene_order int not null
scene_key text not null
scene_type text not null
label text null
headline_lines jsonb not null default '[]'
subtitle text null
frame_captions jsonb not null default '[]'
cta_label text null
cta_href text null
start_position numeric null
end_position numeric null
desktop_object_position text default 'center center'
mobile_object_position text default 'center center'
filter_settings jsonb not null default '{}'
is_active boolean default true
notes text null
created_at timestamptz default now()
updated_at timestamptz default now()
```

### `cinematic_media`

```sql
id uuid primary key
scene_id uuid references cinematic_scenes(id) on delete cascade
media_type text not null
url text not null
storage_path text null
filename text not null
frame_order int null
device_target text not null default 'all'
status text not null default 'pending_review'
notes text null
width int null
height int null
duration_seconds numeric null
file_size_bytes bigint null
created_at timestamptz default now()
updated_at timestamptz default now()
```

### `cinematic_versions`

```sql
id uuid primary key
page_id uuid references cinematic_pages(id) on delete cascade
version_name text null
config_json jsonb not null
created_by text null
created_at timestamptz default now()
published_at timestamptz null
```

---

## Generated Frontend Config Shape

The frontend should eventually consume a config like:

```js
export const homepageScenes = [
  {
    id: 'hero',
    type: 'video',
    label: 'AURA FIGHT CLUB',
    headline: ['YOUR AURA', 'IS EARNED.'],
    subtitle: 'The real fight is internal. The opponent is just the mirror.',
    start: 0,
    end: 0.12,
    desktopVideo: '/cinematic/homepage/scene-01-hero/desktop-video.mp4',
    mobileVideo: '/cinematic/homepage/scene-01-hero/mobile-video.mp4',
    poster: '/cinematic/homepage/scene-01-hero/poster.webp',
    fallback: '/cinematic/homepage/scene-01-hero/fallback.webp',
    objectPositionDesktop: 'center center',
    objectPositionMobile: 'center top'
  }
];
```

---

## Build Phases

### Phase 1 — Admin Data Model + Manual Config Export

Goal: create the structure without risking live site stability.

Tasks:

1. Add Supabase tables.
2. Add admin pages:
   - Cinematic Pages list
   - Scene list/editor
   - Media upload/review list
3. Allow draft scene data entry.
4. Allow approved media selection.
5. Generate/export JSON config.
6. Keep current hardcoded frontend live until config is tested.

---

### Phase 2 — Frontend Config Reader

Goal: move homepage/campaign away from hardcoded arrays.

Tasks:

1. Create shared `CinematicScrollPage` component.
2. Read generated scene configs.
3. Support video, image sequence, static image, and product reveal scenes.
4. Support desktop/mobile media variants.
5. Support poster/fallback logic.
6. Add safer preload strategy:
   - initial scene media only
   - next/previous frames only
   - lazy load below-the-fold scenes

---

### Phase 3 — Preview + Publish Workflow

Goal: make the admin usable as a real production tool.

Tasks:

1. Add desktop/mobile preview.
2. Add scene-by-scene preview.
3. Add frame ordering drag-and-drop.
4. Add publish/version system.
5. Add rollback to previous version.
6. Add media weight/load warnings.

---

### Phase 4 — AI Production Workflow

Goal: connect creative generation/review to publishing.

Tasks:

1. Store prompt briefs per scene.
2. Upload AI outputs into pending review.
3. Mark AI frame issues.
4. Approve/retouch/replace.
5. Publish approved assets only.

---

## Non-Goals For Phase 1

Do not build these yet:

- AI generation inside the app
- Auto-retouching
- Complex role permissions
- Full animation editor
- Full timeline editor
- Direct live homepage replacement

Phase 1 should be a safe admin/data layer first.

---

## Immediate Implementation Priority

Build the first version in this order:

1. Database schema.
2. Admin route: `/admin/cinematic`.
3. Page list.
4. Scene editor.
5. Media/frame review table.
6. JSON export.
7. Manual preview.

Only after this works should homepage/campaign consume the generated data.

---

## Launch Principle

The live website must remain stable while this system is built.

Do not replace the current homepage/campaign runtime until the new config-driven version can match the current pages visually and perform better.
