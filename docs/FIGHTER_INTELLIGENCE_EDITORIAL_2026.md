# AURA Fighter Intelligence — editorial model (15 October 2026)
## Audience-facing categories
- **The Elite:** proven highest-tier pound-for-pound specialists and multi-division / established world champions with elite opposition. A title alone is not sufficient to establish an all-time or pound-for-pound case.
- **Future Stars:** prospects, exceptional under-25s, breakout contenders, amateur standouts and new young champions. A champion may remain here temporarily while building an elite-level résumé (e.g. Dalton Smith).
- **Fighters to Watch:** dangerous contenders, titleholders with compelling matchups, knockout threats, distinctive styles, momentum and fan interest; not a catch-all for legacy superstars.
- **Modern Greats:** retired or veteran household-name legends with major achievements; show retired status accurately.

## AURA 50 active men's pound-for-pound
This is an **opinionated, separately published editorial order**, **not** the official BoxRec, Ring or TBRB ranking. #1 Bam Rodriguez is an AURA editorial selection, acknowledging other respected bodies have Inoue or Usyk ahead. Activity, quality of opposition, recent form, technical level, division depth, championships, and record are weighted together. No BoxRec scraping or implied live sync.

**Five-fight form contract:** display individually checked dated bout outcomes only; do not infer W or L from a record. If absent, mark pending rather than fabricating five results. Source for every populated bout. The form section is progressively verified, **not complete yet**.

## Portrait policy
- In-ring image of the correct boxer; never show another boxer as a substitute.
- Include credit and source link with every image; maintain an image-rights review before monetising.
- If source fails, show honest labelled unavailable placeholder, not a misleading silhouette or unrelated image.
- Four highlighted upgrades: Benavidez, Bivol, Haney, Fundora, pending publisher permissions. Avoid downloading or copying restricted/Getty assets.
- Before editorial promotion to Elite or Top 50 verify recent fight results, retirement status, weight class and relevant source date.

## Named question
The user mentioned **"Kerman ..."** as a possible emerging fighter. Do not assign this to Kerman Lejarraga (older former European champion) or Curmel Moton without confirmation; meanwhile Curmel Moton is included on merit as a rising prospect.

## Development continuation — 15 October 2026

**Code on draft PR #21; not published.** All 50 positions now resolve to a dedicated AURA fighter profile. The top-50 row and profile page link to one another and display a dated scouting verdict, available source-linked bout results, and photo credits. Top-50 placement is **editorial opinion**, not a verbatim Ring / BoxRec list.

**New coverage:** Gilberto Ramirez, Hamzah Sheeraz, Agit Kabayel, Teofimo Lopez, Richardson Hitchins, Lester Martinez, Raymond Ford, Carlos Adames, Nick Ball, Brandon Figueroa, Stephen Fulton, Kenshiro Teraji, Anthony Olascuaga, Chris Billam-Smith, Bakhram Murtazaliev, Joseph Parker and Alberto Puello. Later added Raymond Muratalla (IBF lightweight champion) to the active Top 50 based on title wins over Andy Cruz and Robson Conceicao; Moses Itauma remains in Future Stars, not the active pound-for-pound top 50.

**Rank-to-profile corrections:** Hitchins is at welterweight (vacated junior-welterweight belt April 2026); Fulton at lightweight following 2026 weight problems; Kenshiro Teraji at junior bantamweight; Nick Ball is a former champion after defeat to Brandon Figueroa. Fabio Wardley vs Daniel Dubois result dated May 9, 2026. Only manually evidenced and independently source-linked fight outcomes are shown in AURA's partial five-fight ledgers.

**Modern Greats expanded to nine:** Crawford, Lomachenko, Spence, Pacquiao, Joshua, Fury, Wilder, Josh Taylor, Lara. Retirees have a retired status; veterans are not falsely labelled retired.

**Open editorial and release blockers:** Portrait URLs have metadata, but visual/browser and copyright/licensing clearance for externally hosted publisher photography remains outstanding. Structural audit/CI must pass on current branch. Full five-result history for all 50 is not yet complete, and some career records are deliberately blank rather than unverified. This branch is separate from the production `main` branch. Do not merge until visual inspection, permission confirmation, and current-source review.

## Fighter Intelligence delivery verification — 16 October 2026

- All 50 men’s editorial Top 50 ranks have full profiles. AURA 50 is not an official Ring, TBRB or BoxRec ranking.
- **186 result entries** now have source URLs; all 50 ranked fighters have at least one documented result; **28/50** have five documented results. Partial ledgers must never be represented as complete latest-five histories.
- All **65 public fighter profiles** are now in the sitemap (previously 18 because a regex missed JSON-format profiles). Static English and Spanish rankings are generated, with 50 crawled fighter links and English ItemList structured data.
- Added responsive division filters, sorting by ranking, name or verified result date, verified-results-only toggle, and full-profile links from the expandable rank rows.
- Profile pages now show scheduled fights from src/data/fighterUpcoming.js with individual source links, when available. This is not an exhaustive official fight calendar.
- GitHub Actions remotely probes 65 external fighter images and checks 75 unique fight-result or upcoming-card source URLs without downloading content.
- Last CI probe: 64/65 images return HTTP 2xx image responses; one publisher blocks automated image access (Anthony Olascuaga), and no definitive 404/410 images. Benavidez, Bivol, Haney and Fundora all pass.
- Source probe: 65/75 response status 2xx/3xx; zero definite 404/410; ten protected by login/CDN (401/403), requiring separate editorial browser verification. Response status alone never validates the fight fact.
- **Publication blockers**: no demonstrated republication rights for most publisher images, no independent full desktop/mobile screenshot pass, plus 86 pending latest-five fight-result slots.
- **Status**: development feature branch and draft PR #21 only. No Lovable credits, no live merge. Keep draft until image-use permissions, visual QA and remaining fight-result research are completed.
