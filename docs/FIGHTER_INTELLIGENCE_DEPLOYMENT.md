# Fighter Intelligence — Production handover

**Site:** `https://www.aurafightclub.com`
**GitHub repository:** `dakande85-bit/aura-fight-club-cinematic`
**Feature branch:** `feature/fighter-intelligence-top50-20261015`
**Integration:** draft pull request #21. No Lovable credits required.
**Editorial snapshot:** 16 October 2026.

## What is technically implemented

- Curated boxer directory with exactly four mutually exclusive editorial tiers.
- 50 independent AURA pound-for-pound rankings; editorial, never represented as official The Ring, TBRB or BoxRec.
- 50 profiles with five individually source-referenced recent professional bouts each (250 total), scouting verdicts, image credits and stat links.
- Source-referenced upcoming title fights where a promoter, governing body or reputable publication has confirmed the booking.
- Search, division filters, rank/name/recent-fight sorting, results-only filter, expandable records, linked full profiles.
- English/Spanish route compatibility and CSS breakpoints for phone and desktop.
- SEO metadata and server-prerendered English/Spanish directory indexes, sitemap entries for every public profile, profile and ItemList schema.
- CI: strict ranking/tier/source audit, web-linked photos and articles checks, production build and Playwright screenshots of live-built browser pages.
- Source documentation and a non-Lovable ingest pipeline for legal, locally optimized fighter portraits.

## Release tests

1. GitHub Actions: **Fighter pages and Spanish layout build** must be green at the PR head SHA. This checks all 250 bouts, unique fighter categories, records, image metadata, source link status and compiled/prerendered SEO routes.
2. GitHub Actions: **Fighter Intelligence Browser QA** must be green at the same SHA. It runs Chromium at 1440x900 and 390x844, checks rankings, filters, EN/ES URLs, four priority fighter photos, head-to-head and no horizontal scrolling. Screenshots are stored as a downloadable 14-day GitHub Actions artifact named `fighter-intelligence-screenshots`.
3. Review screenshots before approval: index, ranking, translation, comparison and profiles for Benavidez, Bivol, Haney and Fundora.
4. Confirm the upcoming fight schedule has not changed since the editorial snapshot. The site reports only a reviewed snapshot, not live BoxRec data.
5. Confirm the current fighter media legal status. **HTTP 200 and attribution never constitute a reuse license.**

## Rights-cleared portrait pipeline

Most existing URLs point directly to publisher photography. This is a **publication-rights dependency**, not a code failure. Before commercial use, secure a licensing agreement, photographer's written permission, a demonstrably applicable Creative Commons license, or original user-owned photographic assets. Maintain proof in a private rights archive (do not commit signed contracts or identities to the public repo).

Once a properly cleared portrait is supplied, from the repository root:

```bash
npm run fighters:portrait:add -- \
  --slug sebastian-fundora \
  --file ./approved-photos/fundora.jpg \
  --credit "Photographer / Agency" \
  --source-url "https://rights-holder.example.com/the-photo" \
  --license-type written-permission \
  --rights-ref "CONTRACT-2026-001"
```

This creates optimized `public/assets/fighters/licensed/sebastian-fundora.webp`, registers the local override in `src/data/licensedFighterPortraits.json`, and retains copyright/source metadata. All existing Fighter Intelligence components automatically prefer this asset. Do not mark rights as approved until the actual license and intended website use have been reviewed.

Run `npm run fighters:portrait:audit` to check override integrity. The summary prints the remaining rights-pending public profiles.

## Optional legally conservative launch configuration

Production builds now default to legally conservative, rights-safe rendering **without additional Vercel settings**. To enforce the same policy explicitly, set `VITE_AURA_FIGHTER_MEDIA_RIGHTS_STRICT=true` as the Vercel **build-time environment variable**, then build/deploy normally. This mode blocks requests for rights-unconfirmed third-party photography in the Fighter Intelligence component and shows original local illustrations or labelled name placeholders. It **does not** alter the rankings, records, scouting content, links or comparison statistics. It does not cover other legacy parts of the site that render external photos through separate components.

You can reproduce the safe build locally using `npm run build:rights-safe` or the default `npm run build`. Only test previews with `VITE_AURA_FIGHTER_MEDIA_RIGHTS_STRICT=false npm run build` can display rights-pending third-party photos. The GitHub Browser QA workflow tests both the normal editorial preview and this strict variant. When signed proof and approved local photos have been recorded using the importer, those images remain visible even in rights-strict mode.

**Visual trade-off:** until licensed replacements are supplied, portraits subject to restrictions appear as placeholders. If fighter photography is essential to public launch, obtain the relevant licenses before switching from preview to production; do not turn off rights-strict mode solely to conceal a permissions problem.

## Release, rollback and ownership

- No Lovable calls or credits were used. Deploy through the existing GitHub-to-Vercel integration after explicit release approval and the rights review.
- The connected Vercel account did not expose this site's team/project in this session, so a Vercel production deployment cannot be verified or triggered from the currently available connection.
- Do **not** push blind production overrides, hotfix unrelated routes, or bypass failed CI.
- Once approved, merge PR #21 to `main`; confirm Vercel's production deployment is healthy and test `/fighters`, `/es/fighters`, `/fighters/compare`, and `/fighters/sebastian-fundora` on the live domain.
- If regression occurs, revert the single merged PR through GitHub to restore the prior production version; re-run CI before attempting re-release.

### Sign-off

- [x] 50 ranking profiles and 250 source-linked bout entries
- [x] Directory and tier integrity checks, no duplicate fighters
- [x] Automated desktop and mobile test suite (latest passing run required)
- [x] Image accessibility and dead source-link audit
- [x] Documented local portrait licensing/import process
- [ ] Rights cleared for images intended for commercial publication
- [ ] Human editorial spot-check of match results and rankings
- [ ] Human screenshot approval and live production deployment verification

**Release status:** software feature-complete; publication sign-off pending on image rights and final editorial acceptance.
