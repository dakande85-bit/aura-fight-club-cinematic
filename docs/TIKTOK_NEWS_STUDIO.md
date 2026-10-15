# AURA TikTok News Studio — release and publishing instructions

## Included in this branch
- Existing /admin/social upgraded with **five-slide, 1080x1920 PNG carousel export**, selected-slide export, editable caption style options, licensed-image intake with confirmation, and no-API article loading.
- The downloadable ZIP includes images, caption text, source-article link with UTM tags, profile link and a human-review checklist.
- Existing manual 12-second MP4 workflow remains available through GitHub Actions.
- New public /tiktok landing page prioritises recent news and routes visitors to individual articles with TikTok attribution (GA4 uses VITE_GA_MEASUREMENT_ID).
- Original cover archive remains visible.
- Test coverage for source grounding, URL validation, caption and sorting.
- No TikTok keys, logins, public posting, live-article edits, paid generation services or Lovable credits.

## Using it manually
1. Confirm the latest published article is accurate and well-sourced at /admin/articles.
2. Open /admin/social on a preview deployment and select the article. Search by headline or fighter.
3. Review each slide: generated phrases are excerpts from the source, not new claims.
4. Optional: upload only **your own licensed** image to the cover; confirm rights first.
5. Download the ZIP of portrait PNGs. Create a Photo post in the TikTok app, upload slides in numbered order, copy and customise the caption. Choose music and publish yourself.
6. If your account can add an external website link, set it once to:
   https://www.aurafightclub.com/tiktok?utm_source=tiktok&utm_medium=profile&utm_campaign=link_in_bio
7. In Google Analytics 4, view traffic where session source / medium = tiktok / profile or tiktok / organic_social (attribution varies by browser/TikTok redirects). Verify VITE_GA_MEASUREMENT_ID is configured and test using the GA4 realtime report.
8. Optionally export a 12s MP4 by manually triggering the existing aura-video-exports GitHub workflow.

## Publishing API — deliberately NOT enabled
TikTok's official Content Posting API supports photo carousels from **publicly available URLs on a verified website/domain**. Direct Post requires TikTok developer app approval, user OAuth consent with video.publish scope, creator_info/query privacy options and an audit for public posting. An upload-to-inbox integration can instead use video.upload after app approval. Human consent, privacy controls and the TikTok anti-promotional-overlay rules apply. Never put an API token in frontend source, GitHub, or a query string.

Official documentation:
- https://developers.tiktok.com/docs/en/content-posting-api-reference-photo-post
- https://developers.tiktok.com/docs/en/content-sharing-guidelines
- https://developers.tiktok.com/docs/en/content-posting-api-get-started
- https://support.tiktok.com/en/getting-started/setting-up-your-profile/linking-another-social-media-account

## Release gate
- Pull request review, tests green, successful Vite production build and preview smoke test for /admin/social and /tiktok at mobile widths.
- Confirm PNG export includes all five slides and caption; uploading a sample licensed image does not transmit it to a server.
- Confirm article URLs exist and attribution query parameters survive navigation.
- Publish/merge only after approval. No production changes are made from this branch until merged.
- No secrets are needed for manual publishing. No paid API required.

## Editorial discipline
Photos supplied by fight promoters, TV networks and photographers are NOT automatically licensable for TikTok; linking a photograph from an article is not proof of reuse rights. Check licences. The default slides are text-first original designs. Headlines and excerpts must be current and reflect the actual article. Do not describe reaction or predictions as confirmed fight outcomes.
