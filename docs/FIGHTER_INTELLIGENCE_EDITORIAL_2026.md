# AURA Fighter Intelligence — editorial policy and completion

**Snapshot:** 16 October 2026.
**Repository:** `dakande85-bit/aura-fight-club-cinematic`.
**Development:** pull request #21, not automatically published.

## Directory editorial categories

- **The Elite:** cross-division world champions and pound-for-pound-level boxers, based on technical quality, elite opposition and championship pedigree. Not simply everyone who has once won a belt.
- **Future Stars:** exceptional amateurs, rising prospects and younger world-level talents building their résumés. A new champion such as Dalton Smith may remain here until the wider résumé matures.
- **Fighters to Watch:** dangerous challengers, former champions and divisional movers with compelling matchups.
- **Modern Greats:** retired icons and era-defining veterans. Do not label currently active veterans as retired.
- Categories are maintained as an explicit registry in `src/data/fighterTiers.js`. Each of the 65 public profiles appears exactly once; the ranking's 50 fighters all appear in the editorial directory.

## AURA Top 50 men's pound-for-pound

This is **AURA editorial opinion**, not The Ring, BoxRec, TBRB or any sanctioning body's official ranking. AURA places Jesse 'Bam' Rodriguez at No. 1 for his multi-weight résumé, while recognising that other credible lists favour Usyk or Inoue. Editorial positioning rewards peak skill, opponent level, form, activity, tactical sophistication, championship quality and weight-class depth.

Every one of the **50 ranked boxers has exactly five dated, source-linked professional fight results**, totalling **250 bout records**. Results include W, L, D and NC rather than inferring success from win-loss statistics. Automated audits check uniqueness, chronology and result metadata, but **a reachable citation alone does not prove the underlying outcome**. Editorial accuracy and records must continue to be reviewed after major fights.

## Portrait and licensing policy

- Use only photographs that actually depict the named boxer. Never show an unrelated athlete as a substitute.
- Every external image has a source, credit and rights review status. **Attribution does not grant usage permission**, and successful delivery from an image CDN does not confer a publishing license.
- If a host blocks or removes a photo, display an honestly labelled identity-specific fallback.
- Priority boxer photographs (Benavidez, Bivol, Haney, Fundora) were checked against actual browser rendering in CI.
- A rights-cleared replacement can be imported with `npm run fighters:portrait:add` and will automatically supersede external publisher photo links. Store proof of license privately, not in the Git repository. Verify the source license actually permits the intended editorial/commercial context.
- For conservative publication when rights remain unresolved, build with `VITE_AURA_FIGHTER_MEDIA_RIGHTS_STRICT=true`. This prevents Fighter Intelligence from requesting externally hosted, rights-unconfirmed photos. It will temporarily display local original art or labelled placeholders instead.
- Full instructions: `docs/FIGHTER_INTELLIGENCE_DEPLOYMENT.md`.

## Data and release verification

- 50 active men ranked and 65 public boxer profiles in the XML sitemap.
- Four curated boxer tiers, every public boxer included once.
- 250 recent fight results and auditable reference links.
- Search, division filter, name/rank/form ordering, scouting insights, mobile layout and functional fighter comparison.
- English and Spanish ranking pages, crawlable static previews and ranking structured data.
- Promoter/source-referenced upcoming fight cards, time-limited editorial snapshots rather than live reservation or BoxRec feeds.
- Automated source checks and CI compilation.
- Chromium desktop and mobile browser testing, screenshot artifacts, four priority portraits, Spanish/English and navigation workflows.
- Opt-in production-safe image mode and source-checked approved-image ingestion workflow.

## Remaining non-code approvals

1. **External photography rights:** Existing third-party editorial images cannot be declared licensed merely because URLs resolve. Obtain permissions or deploy the rights-strict placeholder mode until cleared.
2. **Editorial sign-off:** A human editor should spot-check material bout results, activity, career status and belt ownership at launch time, and sign off the subjective Top 50 ranking order.
3. **Production release:** No automatic merge to `main` and no Vercel production deployment have been performed; the connected Vercel account did not expose an accessible Aura project for deployment verification.

## Open editorial identity question

A previously mentioned emerging fighter sounded like 'Kerman…'. Do not identify this person as Kerman Lejarraga or Curmel Moton without confirmation. Curmel Moton is listed independently on his boxing résumé, not by assuming he is the unnamed fighter.
