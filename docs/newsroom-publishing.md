# AURA daily newsroom

Open `/admin/articles` to create or edit stories. Load the published edition, fill in headline, date, paragraphs, original source link, accurate image description and credit, and optional YouTube link. Save drafts privately on the current device and preview before publishing. Featured articles appear first on the homepage. This is manual daily publishing, with no automated reporting or unverified popularity metrics.

## One-time hosting setup

The existing Vercel project needs `GITHUB_TOKEN` with Contents read/write for this repository (the cinematic publisher already uses this variable) and a new `ARTICLE_EDITOR_PASSWORD` secret of at least 32 random characters. The password must stay server-side; do not use a VITE_ variable. Redeploy after adding environment values. Optional repository defaults: GITHUB_OWNER=dakande85-bit, GITHUB_REPO=aura-fight-club-cinematic, GITHUB_BRANCH=main. Preview deployments default to their VERCEL_GIT_COMMIT_REF branch. If overriding GITHUB_BRANCH for previews, set it to aura-boxing-news-lifestyle so previews cannot publish into production.

If either required value is absent, publishing stays disabled and the editor reports the missing connection. No local draft is presented as a public publish. These hosting values have not been configured or verified in this task.

## Durable publishing

The API writes only `public/news/articles.json` through the GitHub Contents API. Password verification happens on the server. The file SHA is checked before every write to reject concurrent edits. Browser visitors read the current saved edition from `/api/articles`; the bundled JSON edition is the fallback when the API is unavailable. The source review date is independent of the last publish timestamp.

Published story addresses remain fixed. Duplicate addresses are rejected unless the editor explicitly opened that story for update. Drafts are local to the editor's device and never sent to the public JSON. Failed publishing retains the draft. Public reading requires no editor password. Image URLs are externally hosted; credits and archive captions are retained, with an unavailable-image fallback. Confirm image reuse rights before public commercial publication.

## Initial research edition — 2 October 2026

Featured coverage: Fury–Joshua launch (Netflix Tudum); Canelo–Mbilli date and venue (BoxingInsider); Bentley's reported Zuffa move (FIGHTMAG); Jones–Sanchez in Orlando (FIGHTMAG); Whittaker–Wallace fight week (Matchroom). Original-source dates and image captions distinguish current reporting from archive photographs. Bentley's move remains attributed and reported, rather than labelled confirmed. These are editorial selections based on current coverage, not a measured traffic ranking.

## Publishing from the AURA chat

The GitHub connection can publish approved article drafts directly to `public/news/articles.json` on `main`. Write or revise the piece in this project chat and ask to publish it. Validate the article schema, attach verified sources and an accurate credited image, assign `fightId` and `coverageStage` (Build-up or Reaction), commit the edition, and verify the Vercel deployment status. Main-branch publishing requires no browser editor password. Daily means a manual editorial workflow; no unattended schedule has been configured.

The browser editor can import/export one article JSON object (or an object with an `article` property). Importing is a draft operation, never a public write. Its existing password-protected publishing still requires the hosting secrets above.

## Fight desk data

`public/news/fights.json` stores selected major events and completed results. Only sourced dates and outcomes belong here. `public/news/rankings.json` stores dated men's champions and top-five contender positions for heavyweight, light heavyweight and super middleweight. Each federation has its own publication period. The initial IBF snapshot is August 2026; do not label it an October list. Compiled rankings link to Box-Rank and each federation's official list. WBA entries are cross-checked with the official September rankings. Neither calendar nor rankings refresh automatically; edit the source files in the chat and publish the updated edition.
