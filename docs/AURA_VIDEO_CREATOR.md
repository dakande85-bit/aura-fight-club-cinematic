# Aura Fight Club — Video Creator MVP (15 October 2026)

## Purpose

Produce original, **faceless, narrated boxing content** without Lovable or paying for a video AI model. Support one researched article in two formats:

- `short` — vertical **1080×1920 H.264 MP4**, designed for TikTok, Reels, YouTube Shorts.
- `youtube` — landscape **1920×1080 H.264 MP4**, designed for longer YouTube fight analysis.

The initial editorial project is **Dubois vs Wardley II** and its source is the published AURA article. Do not present demonstration scenes as authenticated fight footage.

## What is genuinely implemented

1. `/admin/videos` React page (currently on feature-branch preview) gives a script editor for both formats, browser voice recorder, local audio preview, downloadable narration and visual shot list, and clickable storyboard thumbnails.
2. `creator/projects/dubois-wardley-ii.json` stores the editorial narration script, per-format scene sequence, relative source media paths, source article and a rights register.
3. `scripts/render-creator-video.py` validates rights/paths, probes narration duration with FFprobe, allocates shots according to duration, cuts images approximately every 4.2 seconds for Shorts and 5.4 seconds for YouTube, adds gentle animated motion to still images, supports licensed MP4 video assets with text-overlay compositing, visibly marks illustrative visuals, normalises narration level, and emits AAC/H.264 MP4. The clip order is visual storyboard order, not AI transcription alignment.
4. `.github/workflows/aura-creator-render.yml` renders **without uploading to social media**. It accepts an optional narration path within `creator/voiceovers/` for each format, then uploads the resulting videos and a `review-manifest.json` to the run's Artifacts section.
5. `creator/stock-library.json` contains six link-only candidates with individual Pexels/Mixkit licence references, aspect ratios, and illustrative labels. The clips are **not downloaded into AURA** and have not been attached to the sample storyboard; research their current terms and download the specific assets before creating new manifest records.
6. GitHub push CI automatically validates storyboard rights and exports **4-second, reduced-resolution samples** in both aspect ratios. A passed smoke test does not mean a long-form five-minute narrated episode has passed editor review.

## Workflow right now

1. Open `/admin/videos` on the **preview deployment** (this is not yet a live route).
2. Select Short or YouTube, edit the script, then record or upload your own voice track.
3. Review the available artwork, the current scene timeline, and optional stock footage.
4. Download your audio.
5. **Only if acceptable to make the audio public**, upload it to the public GitHub repository's `creator/voiceovers/` folder. GitHub is currently only a temporary workaround; *do not upload confidential recordings*.
6. **After this feature branch is approved and merged into the default branch** (GitHub requires a default-branch workflow for manual dispatch), open [AURA Creator workflow](https://github.com/dakande85-bit/aura-fight-club-cinematic/actions/workflows/aura-creator-render.yml), run it manually on the feature branch, choose the format, and enter the relative file paths for the uploaded voiceover(s).
7. Download the Artifact ZIP, verify video and audio, inspect still imagery/stock licensing, confirm all claims against the article, review captions and publishing metadata.
8. Publish manually to TikTok or YouTube (or via Metricool if the desired social account is connected and specifically authorised). **No posting or unreviewed publication is automated**.

### Local, private render

Instead of committing your voice to a public repository, run FFmpeg and Python/Pillow on a trusted machine, with the voice file stored locally:

```bash
python -m pip install 'Pillow>=11,<13'
python scripts/render-creator-video.py \
  --project creator/projects/dubois-wardley-ii.json \
  --format short \
  --voiceover-short /path/to/your/short.m4a
```

For widescreen YouTube, change `--format youtube` and supply `--voiceover-youtube /path/to/your/analysis.wav`. Use both flags with `--format both`.

Without audio files, the renderer produces silent **REVIEW-ONLY DEMOS** with an explicit "VOICEOVER NEEDED" label.

### Stock footage intake

- Search **Pexels**: https://www.pexels.com/videos/ (https://www.pexels.com/legal-pages/license/)
- Search **Mixkit**: https://mixkit.co/free-stock-video/boxing/ (https://mixkit.co/license/)
- Each video must be locally imported and entered in the project `assets` registry with `approved:true`, `licence`, `attribution`, `illustrative:true` and `originalOrLicensedForVideo:true`.
- Illustrative stock is labelled on-screen and should not be described as an authentic exchange from a named fight.
- Promotional broadcasters' footage should not be downloaded or reused simply because it's on YouTube. Permission or a case-specific assessment of lawful quotation/criticism is needed; credits or use of a few seconds does not automatically protect a use.
- Use only music with commercial social rights and avoid unlicensed audio.

## Known limits / acceptance gates

- Browser can record and preview audio but **cannot privately upload it or generate finished MP4 directly**. Private storage + job service is the next major build, not complete now.
- The sample storyboard is primarily still images; actual stock-footage insertion is supported by the renderer but not yet populated.
- Cut timing is proportional to the uploaded audio's total duration; accurate word-level speech-to-caption alignment and a drag-and-drop timeline are **not** implemented.
- No YouTube account is connected through this workflow. Direct upload will require channel OAuth / YouTube integration, privacy/metadata controls and explicit user approval.
- No TikTok or YouTube publish action is triggered by rendering.
- Video publication is conditional on human editorial approval. AI-generated cover art is illustrative.
- `/admin/videos` is a functional editor UI, not a private backend with account roles or access control. Avoid private business data in browser preview.

## Future architecture (not claimed built)

1. Authenticated admin roles + private Supabase Storage bucket (or equivalent), signed uploads, protected manifests and short-lived downloads.
2. Background FFmpeg worker/queue with job status and MP4 thumbnail previews (not Vercel's public front-end request cycle).
3. Rights-cleared stock API picker via Pexels API; immutable media usage + rights records.
4. Optional audio transcription for real subtitle timings; editor controls for scene timing, clip trims, reordering, titles, b-roll and sound beds.
5. Export to Metricool or a channel-connected uploader after a user confirms final content, public privacy setting and title/description.
6. Track TikTok and YouTube metrics in the dashboard and compare Shorts vs longer analyses.

### CI proof

The GitHub Actions `render-preview` workflow completed successfully on the starter renderer. It generated valid short and landscape MP4 artifacts at reduced resolution and passed both FFprobe stream checks. This confirms the encoding and core shot loop, **not production-level aesthetics or automatic uploads**.


## Authentic fight footage discovery & editorial edit decisions (October 15 update)

The Creator now includes a **Research & clip library** tab under /admin/videos. It brings actual fight footage into the editorial process without treating a public video player as a licence.

### Sources already indexed for the Dubois–Wardley story

- Official **DAZN Boxing** May 9, 2026 fight highlights: https://www.youtube.com/watch?v=5HReUSh22bY
- **Sky Sports** highlights, credited as DAZN footage: https://www.skysports.com/boxing/video/37488/13542180/highlights-dubois-floored-in-ten-seconds-but-stops-wardley-in-thriller
- DAZN broadcaster watchalong: https://www.youtube.com/watch?v=gFGnTZsxioA
- talkSPORT fight-week interview: https://talksport.com/boxing/4641624/fabio-wardley-daniel-dubois-face-off/
- BBC round-by-round editorial reference: https://www.bbc.co.uk/sport/boxing/live/cx21npe9prlt

The source queue stores fighter/topic tags, date, rights holder and **reference_only** status. A source can be viewed at its original destination. A researcher can mark an in/out timecode and the relevant storyboard beat, adding a text annotation such as "Wardley exits on a straight line" or "Dubois controls the jab".

**These reference markers are not usable media**. They are source URLs/timecodes for review, not video bytes.

For files obtained through a valid licence, the browser can load an MP4/MOV/WEBM for *local preview* and ask the editor to attest an original production, written licence or applicable compatible Creative Commons rights. The editor must record the licence/permission evidence before the clip can be assigned to the usable part of the timeline. A session-based edit decision list can be exported as JSON, including licence status, assigned narration beat, source and in/out points.

The EDL currently records decisions, **not a finished cut**. Importing video bytes to private media storage and creating a render job from that EDL still need to be built. Do not upload licenced broadcast footage or private recordings to a public GitHub repository.

### Footage rights sources

- Queensberry Promotions' official policy directs requests to **IMG Video Archive**, https://imgvideoarchive.com/client/frank_warren_boxing. Contact: craig.wooff@img.com (as listed by IMG). Ask whether the specific fight and excerpts can be sublicensed for an independent, monetised boxing analysis video on YouTube/TikTok.
- DAZN press/media enquiry: pr-boxing@dazn.com — ask for the licensing owner for the event, not merely the broadcaster press office.
- Queensberry and DAZN have a global broadcast agreement dating from April 2025. That does not by itself establish who can grant sublicensing rights for every individual highlight or still.

The YouTube Data API supports **video metadata discovery** but not arbitrary reuse of video downloads. Automating discovery can be added using a YouTube API key. **Do not implement an automatic download/scraping pipeline for broadcaster footage**. YouTube's terms generally restrict download/reproduction without authorisation or a valid legal permission. A short excerpt for criticism/quotation may sometimes be lawful depending on purpose and jurisdiction, but there is no automatic safe-duration rule. YouTube Content ID could still block or claim an uploaded video.

### Desired production workflow once private assets and rendering are connected

1. New boxing story → fighter names, fight dates, key moments extracted from reviewed reporting.
2. Rights-aware video source discovery → exact official highlights and licensed media candidates, verified metadata and edit reference points.
3. Editor reviews source and rights → clips can be tagged as "licensed", "owned", "public-domain/compatible Creative Commons" or "reference only".
4. Imported and approved **binary** clips live in a private library, with checksum, provenance, territory and licence date.
5. Narration recorded/uploaded privately. Speech recognition supplies word-level timestamps.
6. Match narration claims to editorial reference beats and cleared footage; automatically draft an editable timeline. No fake video of named fights.
7. User adjusts in/out points, selects angles, moves clips or adjusts subtitles.
8. Render TikTok Shorts and YouTube long-form from the same project data. Preview for fact/copyright/editorial review.
9. Owner approves publication → TikTok via the connected Metricool integration, YouTube through connected channel permissions, separately.

The current release implements **steps 1–3 (manual selection), part of 4 (local preview only) and a separate existing MP4 renderer**. End-to-end private media ingestion and precise edit integration remain open work.
