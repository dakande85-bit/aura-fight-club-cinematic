# AURA Fight Analysis Lab — Editorial/data integration

## Branch and routes
- Work is isolated from production until review.
- `/verdict` is now served by `src/pages/FightAnalysisLab.jsx`; the prior page remains in the repo for rollback.
- Header label becomes "Analysis Lab". Existing fight schedule and event pages are unchanged.
- Source of confirmed fixtures: `public/news/fights.json`. No placeholder fixtures are introduced.

## What is verifiably functional now
1. Switch between confirmed upcoming events, with fighter profile data resolved from `src/data/seoEntities.js`.
2. Career-record-derived KO win share and total-fight win share, reach, height, data availability labels, comparison bars.
3. Source-backed tactical briefs for Dubois vs Wardley II and Fundora vs Hadribeaj. Other bouts show an explicit "awaiting review".
4. Partial, source-linked recent form (not an invented 5-fight history).
5. A reader-controlled sensitivity comparison: selected weighting for knockout win share, career win share and reach. No calibrated percentages, betting odds or fake confidence figures.
6. Private winner picks stored in localStorage.
7. Media fallback: Fundora picture failures revert to original AURA illustrated art with accurate attribution; never substitute a different fighter.

## Punch feed contract
File: `src/data/licensedPunchStats.json`, imported as `punchDataContract`.

The currently committed feed is empty with `licensedForDisplay: false`:
```json
{
  "schemaVersion": 1,
  "provider": null,
  "licensedForDisplay": false,
  "lastUpdated": null,
  "fights": {}
}
```

Once a licence with redistribution rights is signed, maintain a private ingestion job with the API key as a server-side secret, cache a reviewable normalized snapshot, then publish validated averages to this JSON. An entry per UPCOMING matchup holds each fighter's historic tracked rounds from labelled source bouts:

```json
{
  "schemaVersion": 1,
  "provider": "LICENSED_VENDOR",
  "licensedForDisplay": true,
  "lastUpdated": "YYYY-MM-DD",
  "fights": {
    "dubois-wardley-2": {
      "fighters": {
        "Daniel Dubois": {
          "sampleFights": 4,
          "sourceUrl": "https://licensed-source.example/record",
          "reviewedAt": "YYYY-MM-DD",
          "rounds": [
            {"round": 1, "jabsThrown": 20, "jabsLanded": 6, "powerThrown": 16, "powerLanded": 5}
          ]
        }
      }
    }
  }
}
```

The *numbers above are STRUCTURE-ONLY EXAMPLES*, not fight data; DO NOT publish them as actual telemetry. The React component requires both fighters' data plus a provider identifier, a valid round series, and source URLs. The graph and round averages appear only if these conditions pass. A production ETL must add deduplication, bout IDs, minimum sample size, provenance, metric definitions, validation that landed<=thrown, rights metadata, fight date cut-off before the upcoming event, and QA signoff. Never inject unsourced text or claim a KO round probability using career win data.

## Suggested acquisition strategy
1. **CompuBox data licence**: contact the company via its data service at https://api2.compuboxdata.com/reports/79. CompuBox's public data is personal-use only; republication commercially is explicitly prohibited without approval.
2. **Boxing Data API**: https://boxing-data.com/docs/endpoints/fighters/ offers fighter, physical and career stats. Validate quality/coverage, commercial rights and exact endpoint schema with a test before subscribing. This is NOT a CompuBox substitute for punch-by-punch statistics.
3. **Fallback**: manual editorial entry with a primary public source where reuse is permitted, source URL, source timestamp, record-level review and explicit nulls.
4. The model should only be trained/calibrated after acquiring historical labelled fights, pre-fight-only inputs, defensible out-of-time validation, calibration plots and a genuine abstention threshold.

## Visual rights
- Existing externally hosted editorial images in `src/data/boxingPhotography.js` have several rights statuses marked as unconfirmed. Do not assume an image being hotlinkable grants republication rights.
- Fallback SVGs are clearly labelled original illustration, not a photo of a boxer.
- Replace external photos with licensed, verified portraits before monetised launch.

## Advertising and disclosure
- Betting is **not** integrated. No operator links are inserted. Affiliates may require contractual approval, age-gating, territory restrictions, dedicated betting-information surfaces and explicit "paid/affiliate" labels.
- Spanish DGOJ guidance: https://www.ordenacionjuego.es/preguntas-frecuentes and https://ordenacionjuego.es/preguntas-frecuentes?faq=204&text= .
- Editorial forecasts are commentary, never guaranteed profit or gambling advice.

## Before merge
- Run `npm run lint` and `npm run build` in GitHub/preview, inspect console and accessibility.
- Verify `/verdict` in wide/compact mobile widths, dropdown transitions, image onerror fallback, metric tabs, sensitivity sliders, reader pick persistence, sources, locale handling and no horizontal overflow.
- Review records against live commissions for same-day updates.
- Roll back by restoring `src/AppRouter.jsx` import and route to original `VerdictPage`.
