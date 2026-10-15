# AURA Fight Club — Betting partnerships and data separation
Updated: 2026-10-15

## Product boundary
The Fight Decision Cockpit is an editorial, data-driven boxing research interface, not a sportsbook or a source of investment returns.
- Technical analysis and a user's own pick must remain visually separate from any bookmaker advertisement.
- AURA must not imply that a weighted career record is a fitted win probability. Do not display bookmaker odds, likely KO rounds, or market value without a verified licensed feed and clear timestamps.
- Default state: no offers displayed and no active gambling affiliate links. See `public/news/betting-partners.json`.

## Market-specific activation checklist
1. Obtain written approval from a bookmaker affiliate scheme that permits the exact domain, market(s), creatives and placement, plus unique tracking links. In Spain, check current licences using the DGOJ register: https://www.ordenacionjuego.es/en/operadores-juego/operadores-licencia/operadores
2. Review Spanish Real Decreto 958/2020 as consolidated after the Supreme Court annulment of Article 23.1 in 2024: https://www.boe.es/buscar/act.php?id=BOE-A-2020-13495 . Other rules, especially those concerning minors and misleading commercial communication, remain material. Also review any updated rules passed after this memo.
3. Decide which jurisdictions each operator accepts. Do not rely on a front-end country selector or an IP guess as a full jurisdiction/eligibility control.
4. Build verified age and territorial controls if legally required by counsel and programme terms, plus responsible-gambling content, cookie consent, commercial disclosures, and operator licence displays.
5. Keep promotional content and age-specific information on a distinctly marked surface. Minors should never see promotional content intended for adult users.
6. Obtain a licensed odds feed with market identity, event mapping, timestamps, currencies and territories; never hard-code betting returns or offer values. Show odds age / staleness with links back to the operator, and avoid claims of guaranteed or risk-free winnings.
7. Apply `rel="sponsored nofollow noopener noreferrer"` to paid outbound links. Instrument clicks, but do not collect sensitive gambling data in analytics.
8. Require review and sign-off before `enabled` can be true; the future API should return only eligible offers after backend checks. A static JSON toggle is not a legal gate.

## Publisher programme discovery (official links, applications only)
| Potential affiliate programme | Application or publisher info | Current AURA status |
| --- | --- | --- |
| Betfair España | https://www.betfair.es/es/aboutUs/Affiliate.Scheme/ or https://partnerships.betfair.es | Not approved; tracking link not supplied |
| bet365 Partners | https://www.bet365partners.com/es/termsandconditions | Not approved; tracking link not supplied |

These are **not** sponsored placements and must not be presented as commercial relationships on the public website before contracts and approvals.

## Analytics roadmap
- Source-controlled fighter identities, correct rights to photos and CompuBox-type boxing punch statistics.
- Initial weights are heuristic, deliberately not calibrated.
- Secure verified punch and market feeds separately (different licensing and rights).
- Build an evidence table showing citations for each input. Include pre-fight historical sample windows.
- Train a historical outcome model only with out-of-time validation, credible opponent adjustments, calibrated output and abstention for missing data.
- Do not use affiliate conversion goals to optimise editorial predictions or fighter rankings.

## Previous prototype
The older analysis page is preserved at `src/pages/FightAnalysisLab.jsx`; it can be restored without removing the data modules. The new guided experience is in `src/pages/FightDecisionCockpit.jsx`.
