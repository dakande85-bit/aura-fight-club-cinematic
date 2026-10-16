# AURA real fight-footage production — Dubois vs Wardley II

## Status (16 October 2026)
- Built on the **existing** aura-fight-club-cinematic repository in a feature branch; does **not** update production.
- Access route after a preview deployment/merge: `/admin/video-production`. Linked from `/admin/social`.
- Source registry: `public/news/video-production/dubois-wardley-ii.json`. Verified primary broadcast watch pages, with no copied footage bytes.
- Editing UI: choose source, open it at a timestamp, mark in/out (up to 12 seconds), state the analytical purpose, attach locally supplied real footage and a voice recording, arrange cuts, export the edit decision list.
- Engine: `scripts/render-real-footage-short.py` uses FFmpeg to cut locally supplied video (never downloads from YouTube), preserve the real scene, add short explanatory captions, mute broadcast audio and use the presenter's audio track; output is 9:16 H.264/AAC MP4.
- No AI-generated fight footage, paid generation API, automatic TikTok uploads, OAuth, or Lovable credits.

## Verified research footage
1. Official DAZN first-fight highlights (9 May): https://www.youtube.com/watch?v=5HReUSh22bY
2. Official DAZN rematch launch conference (2 Sep): https://www.youtube.com/watch?v=KMozMmGVII0
3. Official DAZN rematch face-off (18 Sep): https://www.youtube.com/watch?v=2W33Uyr3KBc
4. Archive first-fight press conference by Seconds Out: https://www.youtube.com/watch?v=btNdii0CexM
5. 14 Oct talkSPORT face-off news: https://talksport.com/boxing/4641624/fabio-wardley-daniel-dubois-face-off/

**Research links are not licensed MP4 files.** Watch via official players. Do not scrape, rip, download or automatically redistribute third-party footage. Obtain footage from a licensor, creator, platform-sanctioned remix, or other lawful source and make a case-by-case assessment of quotation/criticism exceptions in the relevant jurisdictions. Reusing even brief clips may trigger claims. Do not claim a safe second limit or assume credits alone confer rights.

## Immediate production flow
1. Open the studio, play the DAZN first-fight highlights, locate knockdowns, Dubois adjustments and stoppage.
2. For each scene, log an actual source in/out time; default storyboard has **no invented timestamps**.
3. For context add a few seconds of press conference or face-off **only if relevant to the spoken analysis**.
4. Attach the same source as a legitimate local video file using the source's file input; tick the rights-review checkbox only after checking its legal basis.
5. Record the script on your device; attach the audio file. Edit shot order, captions and narration.
6. Download `aura-dubois-wardley-real-footage-edit.json`.
7. Place legitimately obtained video and voice files **in a local `media/` folder**, each using the exact filename shown in the exported JSON's `localFile` / `voiceoverFile`.
8. Install FFmpeg (with libx264 and drawtext) and execute from the repository root:

```bash
python3 scripts/render-real-footage-short.py \
  --project aura-dubois-wardley-real-footage-edit.json \
  --media-dir ./media \
  --out ./social-exports/wardley-dubois-analysis.mp4
```

The exported JSON is a portable EDL; no local video is uploaded to the public website and a reload requires reattaching local files for browser preview. `--check` validates a completed shot list without needing videos:

```bash
python3 scripts/render-real-footage-short.py --project aura-dubois-wardley-real-footage-edit.json --check
```

Rendered video is unposted; review quality, accuracy, graphics, audio, aspect ratio, and copyright before manual TikTok/Instagram/YouTube publication. If a licensor does not allow social redistribution, **do not export that source**.

## Current known limitations and next build
- No local source file or timestamped cuts have been supplied; therefore **no authentic fight footage MP4 has yet been rendered**.
- Current UI saves edit plans in browser localStorage; it is not a multi-user authenticated cloud media database.
- FFmpeg export presently runs on a local machine or approved worker with access to the rights-reviewed files, **not inside the browser**.
- Improve with authenticated cloud media storage + signed uploads, provenance audit, frame-accurate in/out preview, automated waveform/subtitle timing, rights-based approval, export jobs and Metricool/TikTok connections after proper permissions.
- Do not enable public automatic posting without explicit account consent and editorial approval.

## Fight date fact check
Dubois vs Wardley II is Saturday **17 October 2026** at The O2 in London. The plan is a **pre-fight** analysis release on Friday 16 October, not a reaction to a result that has not occurred. The May first bout ended in an 11th-round Dubois stoppage after Wardley scored two early knockdowns.
