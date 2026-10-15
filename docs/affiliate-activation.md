# AURA Fight Club — affiliate activation checklist

Updated 15 October 2026. Revenue links must be unique, issued by the programme, and approved for the markets and placements served.

## Live readiness

- Seven placements support editorially relevant creative in the app. Each defaults to a house sponsorship CTA until its corresponding programme has a usable tracking link.
- Approved URLs live in `public/news/monetization.json` in `partners.<name>.affiliateUrl`, editable through Commercial Admin (`/admin/monetization`) when GitHub credentials are configured.
- Sitewide disclosure is already present in the editorial commerce components. Label ad banners as affiliate advertisements. Never describe a business as a paid sponsor before a contract.
- Google AdSense requires a verified `ca-pub-...` publisher ID plus ad-slot IDs, site approval and compliant consent. Leave disabled until confirmed. Never paste unverified credentials.

## Affiliate application links

| Programme | Application / programme URL | Tracking status |
| --- | --- | --- |
| DAZN | https://affiliate.dazn.com/ | Not supplied; submit the affiliate form; programme uses Partnerize |
| Ticketmaster global | https://developer.ticketmaster.com/partners/distribution-partners/affiliate-sign-up/ | Not supplied; signup through Impact |
| RDX Sports Europe | https://rdxsports.eu/pages/affiliate-referral | Not supplied; Impact / CJ applications |
| BOXRAW | https://me.boxraw.com/pages/sponsorships | Not supplied; contact partnerships team to ask about affiliate, referral or sponsor option |
| FightCamp | https://joinfightcamp.com/ | Not supplied; inquire about publisher affiliate programme |

## Correspondence

- Brand contact mailbox configured on the website: `partnerships@aurafightclub.com`. Validate DNS and ownership; it is **not** the same as the connected Gmail identity.
- Ask each company for publisher approval, geo-specific deep-link rules, banner creative permissions, cookie/attribution rules, payouts and a testing link.
- Do not use DAZN Bet affiliate links: they concern wagering, not the DAZN sports streaming subscription service.
- RDX publishes `affiliate@rdxsports.com` for programme support (outreach sent 15 October 2026).
- DAZN publishes `playmakers@dazn.com` for its Playmakers creator programme (outreach sent 15 October 2026); DAZN also has a separate publisher form at `https://affiliate.dazn.com/`.
- BOXRAW publishes `contact@boxraw.com` as its sponsorship contact (outreach sent 15 October 2026).
- Ticketmaster and FightCamp enquiries were also sent on 15 October 2026; confirm delivery and whether a specific affiliate team needs routing.
- Where there is no verified publisher contact address, use the official affiliate application form; do not invent addresses.
- Confirm affiliate link clicks convert in Partnerize/Impact dashboards, then enable the approved affiliate URL in Commercial Admin.
- Track placement results via the existing `/api/affiliate-click` telemetry and network reporting; a click log alone cannot prove sales or commissions.

## Placement mapping

| Placement | Partner after approval |
| --- | --- |
| article-top | RDX Sports |
| article-mid | DAZN |
| article-bottom | BOXRAW |
| fight-page | DAZN |
| calendar | Ticketmaster |
| home-feed | RDX Sports |
| rankings | FightCamp |
