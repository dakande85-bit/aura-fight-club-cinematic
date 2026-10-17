# Aura automatic subject-to-video Film Room

The required UX is: pick fight -> automatic research -> permitted real-footage download -> automatic short visual cuts -> five-to-ten-minute silent YouTube video -> user narration, adjustments and final export. No manual YouTube browsing is the default.

## Built on feature branch

- AdminAutoFilmProducer.jsx provides the default Film Room dashboard for selecting subject, editorial mode, length and preparing scene-timed narration.
- auraAutoFilmStoryboard.js turns actual Aura editorial copy into categorised timecoded shot plans.
- api/auto-film.js provides a server-side password-authorised production-job dispatcher with no secrets in browser code.
- scripts/auto-filmroom-producer.py discovers sources via the official Pexels API (when PEXELS_API_KEY exists) and Wikimedia Commons video licences, accepts rights-reviewed first-party local source files, downloads permitted footage, assigns visual beats, trims with FFmpeg, marks illustrative stock, and produces a silent MP4 and scene/credit ledger.
- aura-auto-film-production.yml runs the full worker when dispatched from the installed default-branch workflow; outputs an Actions artifact, not a public article or an automatically published video.
- aura-auto-film-ci.yml tests licensing/no-fabrication logic and a genuine external unkeyed source search.
- The old functional manual editor is retained at /admin/video-production/editor.

## Verified blocker

The Dubois vs Wardley II research project contains broadcaster WATCH links, not transferable MP4 files cleared for automated ingestion. The unkeyed Wikimedia Commons search on 17 October 2026 found zero eligible clips for this subject. It did not create a fake completed video. Pexels API key is not confirmed on this repository. Videos for actual fighters, highlights and weigh-ins require approved source-file delivery or a content licence.

Do not use a YouTube streaming extractor. YouTube API policies explicitly prohibit copying/download of others' audiovisual content without YouTube prior written approval; permission or a relevant statutory exception must be assessed separately. Generic training stock must not be represented as actual fight footage.

## Source and quality policy

- Every downloaded clip must have source URL, licence and provenance. Avoid NC/ND media.
- Do not repeat a few shots to stretch a video. The worker enforces enough independent licensed video seconds before it renders 5-10 minutes.
- Motion scoring, where used, does not constitute verified knockdowns or individual fighter identity.
- Generic training stock is labelled ILLUSTRATIVE BOXING FOOTAGE.
- Scripts from existing Aura editorial articles are drafts needing verification for current timing and sporting facts.
- Pexels terms disallow distributing standalone stock video or replicating a stock provider. Pixabay forbids systematic mass downloads without special permission; it is not used as an automatic footage scraper.

## Still needed for full product

1. Back-end licensed footage delivery for real fight/promoter material and routine rights management.
2. PEXELS_API_KEY secret, if that supplier is approved, and GITHUB_TOKEN + ARTICLE_EDITOR_PASSWORD for background dispatch.
3. Merge reviewed code to main so GitHub Actions can be dispatched. Production is deliberately unchanged pending verification.
4. Persistent private media storage, signed URLs and processing status accessible from the app. The Supabase project currently pointed to by the website is inactive; an active vault or another secure storage account must be connected.
5. Human editorial review of the exact filmed tactical actions and a complete rendered 5–10-minute video with voiceover audio before publication.

## Provider references

Pexels: https://www.pexels.com/api/documentation/
YouTube developer policies: https://developers.google.com/youtube/terms/developer-policies
Pixabay: https://pixabay.com/api/docs/
