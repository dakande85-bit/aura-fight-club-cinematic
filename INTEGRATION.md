# AURA Cinematic Scene Builder — Integration

## Route

The React admin page is intended to live at:

```text
/admin/cinematic
```

## Files added

```text
src/pages/admin/CinematicSceneBuilder.jsx
src/pages/admin/cinematic-scene-builder.css
```

The page reads frame data from:

```text
public/admin-cinematic/frames.json
```

## Phase 1 behavior

This is a safe local-preview admin tool. It can:

- view pages and scenes
- view current media/frame paths
- preview current images
- select a local replacement image in the browser
- preview the replacement instantly
- mark a media item as hidden/show
- reorder media inside a scene with left/right controls
- mark poster candidates
- copy or download generated JSON

## What it does not do yet

- It does not write to `frames.json`.
- It does not upload to Supabase or Cloudinary.
- It does not modify `ScrollFilm.jsx` or `CampaignScrollFilm.jsx`.
- It does not change live homepage/campaign visuals.
- It does not publish changes to the website yet.

## Router integration

Add this import in `src/AppRouter.jsx`:

```jsx
import CinematicSceneBuilder from './pages/admin/CinematicSceneBuilder.jsx';
```

Add this route next to the existing admin route:

```jsx
<Route path="/admin/cinematic" element={<CinematicSceneBuilder />} />
```

## Next phase

Phase 2 should connect this admin UI to persistent storage:

- Supabase table for pages/scenes/media
- Supabase Storage or Cloudinary for uploads
- published scene config fetched by the homepage/campaign renderers
- rollback/version history
