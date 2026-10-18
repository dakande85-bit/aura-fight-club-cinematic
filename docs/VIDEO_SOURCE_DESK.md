# Aura Film Room — YouTube reference shelf and video import

Implemented on branch `feature/real-footage-production-studio`, not automatically promoted to production.

## In-app production workflow

1. Open `/admin/video-production`, choose the fight (the script and research links are preloaded from the calendar production queue).
2. In **1. Footage**, select **Find on YouTube**. Search official match highlights, press conferences, face-offs, or interviews. Search opens the official YouTube results tab so no undocumented scraping is necessary.
3. Paste a watch, youtu.be, Shorts or live video URL. The reference is stored on the selected fight's in-browser research shelf and played in an embedded official YouTube player, where supported.
4. For a clip you own, license or are otherwise entitled to reproduce and transform, obtain a **real MP4/MOV/WebM file** through the source's authorised download offering (e.g., your own YouTube Studio video download, licensor file delivery, original camera footage, or providers with explicitly downloadable footage).
5. Select **Bring in footage**. Drag/drop or choose the file. Alternatively use a **direct, CORS-enabled downloadable HTTPS .mp4/.mov/.webm URL**, which imports the media bytes into the browser and passes them to the Film Room source library.
6. The existing editor scans the uploaded video for visual motion changes, proposes script-led scene timings and builds an editable rough-cut timeline. Motion is a heuristic, not verified detection of particular punches.
7. Preview, adjust selected starts/durations, record your narration and render the real footage as an MP4. Review the resulting video and usage rights before any publication.

## What the app does and does not do

- YouTube embeds are only for **research and viewing**, not file access. The official YouTube Data API offers search metadata but not a raw MP4 extraction endpoint.
- The application **does not rip YouTube videos, bypass DRM, download broadcast streams or imply fair use is automatic.** YouTube's ToS requires permitted services, prior permission, or another lawful basis.
- A file imported via a direct HTTPS video URL is processed client-side, not proxied through Vercel. Some hosts refuse cross-origin access; use their normal Download button and local upload if so.
- Videos, stored narration and edit renders currently live **in the browser session**, not a durable private backend media vault. Research URLs and the narration text are stored per fight in localStorage, not the media bytes.
- The current FFmpeg/WASM MP4 rendering path can be expensive on phone memory. Test with short videos on desktop Chrome. Cloud recording, licensed broadcast ingestion, background worker jobs and automatic publication are **not** completed.

## Relevant official policy

- YouTube Terms: https://www.youtube.com/t/terms
- YouTube IFrame player: https://developers.google.com/youtube/iframe_api_reference
- YouTube search/list API: https://developers.google.com/youtube/v3/docs/search/list
- YouTube Studio: https://studio.youtube.com/

## Technical files

- `src/components/AuraFootageFinder.jsx` — research reference shelf, source preview, drag/drop and direct video-file URL import.
- `src/lib/auraFootageSources.js` — validated YouTube video identifiers and guarded direct-file imports.
- `src/pages/AdminAutoVideoEditor.jsx` — existing rough-cut pipeline, source management, timeline and voice recording.
- `src/lib/auraAutoCut.js` — rough script-to-scene plan and real uploaded footage motion analysis.
- `src/lib/auraBrowserExport.js` — video file export.
- `tests/footage-sources.test.mjs` — URL parsing and safety checks.

## Remaining build priority

Add a secure, authenticated, private source-asset library that retains uploaded video across sessions. Implement signed resumable upload to access-controlled storage, source-rights provenance, background cloud FFmpeg jobs and analysed shot selection; only then can a project open with the real clips already prepared and ready to narrate.
