# AURA Cinematic Trailer Studio — Phase 1

## Location
- Existing editorial studio: /admin/social
- New cinematic trailer mode: /admin/social/trailer
- Existing 12-second article-to-card MP4 exporter is unchanged.
- Live public website and current production deploy are untouched until a reviewed merge.

## User workflow
1. Select Cinematic teaser (24s) or Boxing breakdown (45s).
2. The preset creates a six/five-shot editorial treatment, not fake fighter media. All shots initially have missing-media status.
3. For each scene, review the proposed visual, upload an authentic cleared photo/video or original illustrative AI video, and enter a provenance reference (licence ID or own production reference).
4. Check that a bout is CONFIRMED or HYPOTHETICAL. The Fundora × Ennis template starts as hypothetical. Any hypothetical reveal is explicitly labelled DREAM MATCHUP - NOT ANNOUNCED in the final render.
5. Edit each duration and order. Preview the storyboard sequence locally in the browser. Optional: import an owned/approved narration MP3 and soundtrack.
6. Confirm each shot's factual accuracy and rights status. A newly uploaded replacement resets its approval checkboxes.
7. Download the plan as JSON any time. Once the readiness gate passes, export a local-media ZIP.
8. On a workstation or render runner with FFmpeg and DejaVu Sans Bold installed, run:

    python3 scripts/render-cinematic-trailer.py aura-trailer-pack.zip --output aura-trailer.mp4

9. Review the actual exported video for timing, crop, soundtrack, factual status and third-party rights. Post manually through TikTok/Metricool. This branch does not connect to a TikTok account.

## Capabilities now
- 9:16 vertical, 1080x1920, 24fps H.264 MP4 renderer.
- Scene-by-scene media replacement, durations, ordering, preview and title reveal.
- Original AI visuals allowed ONLY as clearly labelled illustrative content, not fabricated event footage.
- Source-provenance and human-review gates for every shot; commercial music usage has a separate rights check.
- Audio mixing (narration at 100%, music under voice at 20% default) and silent output when no audio supplied.
- No generation credits, API keys, downloaded broadcaster footage, auto-posting or public media changes.

## Deliberate limitations
- Browser preview is a storyboard sequence. The production-quality MP4 is rendered with the offline CLI, not yet rendered directly in the browser.
- Uploaded files are held only in the current browser session. The plan JSON has no embedded media data. Export the ZIP before navigating away.
- This is not a secured multi-user asset-management system: admin routes should be protected at the hosting/auth layer before paid provider credentials or persistent media uploads are enabled.
- No beat detection, vocal ducking automation, stock library connector, Runway generation trigger or OAuth distribution yet.
- Cover art must be owned/licensed and marked as verified before packaging.
- Permission to watch a YouTube or press video is not permission to re-upload or cut it into a commercial promo.

## Architecture (next iteration, after preview approval)
React admin screen -> storyboard schema and asset provenance -> authenticated storage (private buckets)
-> background queue (render jobs) -> licensed clip validator -> FFmpeg/Remotion renderer
-> review/approval -> optional approved scheduling OAuth.

The deterministic assembly stack should stay separate from pay-per-generation tools. For example:
- Free: approved real clips, own interviews, photographs, voiceover, sound design and local render.
- Optional paid: Runway or comparable image-to-video models for a short original cinematic shot; provider server-side key, displayed max cost, explicit consent, result stored as illustration.
- Never: silent use of credits; scraping copyright-protected fight broadcasts; changing published material without review; auto-posting a fight that has not been announced.

## Acceptance criteria for the next phase
- At least one actual 24-second Fundora treatment assembled from permission-cleared assets.
- Video audio tested on desktop and mobile; frame cuts match narration.
- Zero unknown rights-status media in export ZIP.
- Full clip licence audit log and access-control audit.
- Export job succeeds with re-usable signed media URLs without embedding any provider API key in the frontend.
- User approval before merging into the protected public release branch.
