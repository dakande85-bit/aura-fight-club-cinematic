# AURA Fight Club — editorial and TikTok manual operating plan
Updated: 12 October 2026

## Current decision
- **No paid AI news-generation API**. GitHub's scheduled OpenAI post-fight workflow is intentionally paused. No OpenAI API key is required for manual newsroom production.
- Source-led news articles will be researched, drafted and reviewed in ChatGPT, then committed as validated additions or revisions to `public/news/articles.json` in the existing GitHub repository.
- Production deployment is via Vercel's existing main-branch integration. Only call a story live when Vercel reports READY on the expected commit and custom domain.
- Spanish translations are a *separate* Google Cloud workflow; they are not part of AI news generation and may incur provider charges if its key is configured.
- The existing article API still serves/edits articles; it is **not** the paid AI generation API. Avoid removing it or breaking public news reads.

## Editorial standards — what makes AURA different
Lead with concrete news, not `AURA verdict` or generic boilerplate. Every researched story should:
1. Answer **what happened, who is involved, what is documented, why fans care, what happens next**.
2. Include two independent sources where feasible, preferably official commission, promoter, boxing board or contract papers plus reputable reportage; directly attribute opinions and unconfirmed reports.
3. Include boxing-specific mechanisms in fight stories: jab, range, timing, exits, punch selection, pressure, pace, scorecards or official round-by-round facts *only where source material supports them*.
4. State CONFIRMED / REPORTED / RUMOURED clearly; never present proposed bouts as signed or cite imaginary insider information.
5. Use a story-specific editorial image that is commercially usable and identity-accurate. No unlicensed publisher photo downloads; an original labelled graphic is a temporary alternative to authentic licensed fight photos.
6. Use concise 300–450-word straight news, 550–800-word post-fight reactions and 600–950-word technical features when the evidence supports the length. Depth is a quality measure, not a demand for filler.
7. Include an SEO title, 1–2 line summary, specific headings, actionable related-fight links, publishing date, and attribution. Correct material factual changes transparently.
8. Maintain a separate **prediction ledger**: pick, method, key conditions, date, sources, then post-fight result and retrospective. Do not quietly rewrite old picks.

## Manual daily cadence (Atlantic/Canary)
- Morning: check WBC/WBO/WBA/IBF statements, DAZN/Queensberry/Matchroom, The Ring, BoxingScene, Boxing News, Bad Left Hook and reputable original reporting. Use Hatman/Henry/YouTube fan reaction as leads, not final proof.
- Select **two or three** strongest stories maximum: at least one current development; add meaningful tactical or business analysis when warranted. Check `public/news/articles.json` for overlapping angle before commissioning.
- In ChatGPT: prepare evidence notes with live primary/reference URLs, article, image rights/provenance check and a 30-word share hook. Reviewer approves editorial angle.
- Commit to `main`; inspect GitHub article-quality workflow, Vercel production, live URL, mobile hero image and article references. Do not claim success on the strength of a commit alone.
- After relevant championship and headline fights: deliver a **next-morning reaction** explaining the *actual* contest; if only the result is confirmed, hold the technical analysis until credible fight reports exist. Avoid speculative blow-by-blow.
- Before major fights: publish a sourced prediction 48–72 hours ahead; create a related post-fight scorecard explaining what the forecast got right or wrong.

## Automated production without an AI API
- A card generator reacts to verified article updates and publishes **draft** 1080 x 1920 JPEG cover cards in `public/news/social/` and details in `public/news/social-queue.json`.
- A separate GitHub Actions workflow called **AURA vertical news video exports** generates **12-second H.264 MP4** story briefings (1080 x 1920), three slides each, with correct article text. Download from the run's `aura-vertical-news-clips` artifact; it is retained for 14 days.
- Video files contain no copied broadcasts, unlicensed athlete photos, licensed music, voice cloning or AI-generated facts. They are deliberately silent for optional TikTok native music or user voiceover.
- **No TikTok, Instagram or YouTube account is connected and no automatic post has occurred.** Manual upload or an approved connected scheduling platform is the release step.
- Use `/admin/social` for the queue and ready-to-copy captions. On each platform, review the precise title, caption, commercial content labels and creator account's allowed publication options.
- A TikTok profile website link may be used to direct interested viewers to `https://www.aurafightclub.com`, subject to the account's eligibility. Caption URLs should not be assumed clickable.
- If authorising a scheduler (e.g. Metricool) or TikTok official API later, user controls login/OAuth. A custom TikTok developer client needs app review for public API publishing; do not circumvent unaudited restrictions.

## Next backlog — 11 items under 300 words at latest audit
Rebuild the substantive features first:
- Anthony Joshua's chance of redemption against Fury — tactical/legacy sourced analysis
- Where current champions fit in boxing styles — genuinely researched, fighter-specific technical breakdown
- Murat Gassiev and WBA title confusion — primary sanctioning body verification
- Osleys Iglesias profile — updated verified latest result and southpaw tactical analysis
Then process dated short notices as either independently checked **proper news articles** or explicitly marked archival news briefs. Never bulk-expand old minor announcements with AI filler:
- Fury–Joshua Cardiff launch
- Canelo–Mbilli date confirmation
- Bentley reported Zuffa move
- Omari Jones–Sanchez Orlando
- Whittaker–Wallace fight week
- Birmingham fight week schedule
- Monte-Carlo December card

## Phased development plan
**Phase 1 (implemented / audit ongoing):** remove repeated images, rewrite key articles, pause failed AI schedule, enforce editorial minimums, produce manual MP4 drafts, create social review desk, verify deploys.

**Phase 2 (next priority):** finish 11-short-story editorial backlog, verify fighter identities and usage rights on all external photos, replace unreliable hotlinks where licences allow, add clear REPORTED/RUMOUR/CONFIRMED badges to article metadata only when meaningful (do not invent statuses), complete mobile image QA.

**Phase 3:** expand The Verdict into a fight-specific predictions hub with a retained date-stamped pick, method, confidence/uncertainty, post-fight comparison and a reader vote. No bookmaker referrals or betting monetisation until legally reviewed for target audiences and age controls.

**Phase 4:** connect authorised social scheduling account, tune clips with human-recorded voice and permitted music, add YouTube Shorts and Instagram Reels distribution, measure article referrals through UTM links and Vercel analytics. TikTok referral measurement must account for profile-link rather than assumed clickable captions.

## Operational locations
- Live newsroom: https://www.aurafightclub.com/news
- Article editor: https://www.aurafightclub.com/admin/articles
- Social draft desk: https://www.aurafightclub.com/admin/social
- Video exports: https://github.com/dakande85-bit/aura-fight-club-cinematic/actions/workflows/aura-video-exports.yml
- Editorial test: https://github.com/dakande85-bit/aura-fight-club-cinematic/actions/workflows/aura-editorial-quality.yml
