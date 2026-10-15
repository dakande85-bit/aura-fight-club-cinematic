# AURA Fight Club — Analytics & SEO deployment guide

## Scope
This release keeps the Vite + React site, existing published articles, fighter data and live API untouched. It adds an editorial reporting dashboard, private data API, static per-URL crawler HTML, sitemap cleanup and build tests.

## Dashboard
- URL: `/admin/analytics`
- Authentication: `AURA_ANALYTICS_ADMIN_PASSWORD` server environment variable, falling back to the existing `ARTICLE_EDITOR_PASSWORD`.
- Report source: Vercel Web Analytics (not GA4, and not fake sample numbers).
- Reporting periods: 7 days or 30 days, including totals, daily trend, top pages, most-read articles, referrers, countries, devices and UTM sources.
- The password is only held in current React component memory and passed to the same-origin serverless API in an Authorization header. It is not placed in any client build environment variable or browser local storage.

## Vercel Production / Preview configuration
1. In the **Aura Fight Club Cinematic** Vercel project, enable **Web Analytics** on the Analytics tab.
2. Create a Vercel access token with the correct `dare-akande-s-projects` team scope at https://vercel.com/account/tokens.
3. Add **AURA_VERCEL_TOKEN** to server-side Production and Preview environment variables, then redeploy.
4. Confirm **ARTICLE_EDITOR_PASSWORD** is present, or set a distinct **AURA_ANALYTICS_ADMIN_PASSWORD** (recommended).
5. Optional project overrides (already populated as safe defaults in the endpoint):
   - `AURA_VERCEL_PROJECT_ID=prj_csrVYmjsoZFLuqPtjZDE0j5zBp2U`
   - `AURA_VERCEL_TEAM_ID=team_dbaQGgEAfQg3bdl0pZhrmitX`
6. Sign in at `/admin/analytics` and verify data matches the same reporting window in Vercel Analytics.

**Never put a Vercel access token in a variable prefixed with `VITE_`.** Do not add real secrets to GitHub code or commit them. A Vercel 403 means the token does not have access to the project/team scope.

## SEO deployment checks
The existing `prebuild` script generates XML sitemaps. The new `postbuild` script creates search-engine HTML entrypoints and runs the SEO smoke test.

After deployment:
- `/news/<slug>`: initial HTML response must contain the article title, single canonical link, NewsArticle JSON-LD and full article preview text.
- `/fighters/<slug>` and `/fights/<id>`: initial HTML response has specific metadata and machine-readable entities.
- `/sitemap.xml`: sitemap index with articles, fights, fighters, topics, Spanish routes, news.
- `/news-sitemap.xml`: last-48-hour published articles only.
- `/robots.txt`: admin and cart URLs disallowed; sitemap locations included.
- `/apparel`, `/equipment`, `/shop`, `/lifestyle`: direct permanent redirects to `/members`.
- Unfinished guide articles are noindex until substantive content is written.
- Validate page speed, canonical rendering and Spanish hreflang using Search Console and PageSpeed Insights.

## Google tools (separate account configuration)
- Search Console: https://search.google.com/search-console — verify the domain property and submit `https://aurafightclub.com/sitemap.xml`.
- Google Analytics: https://analytics.google.com/ — create a GA4 web data stream and set `VITE_GA_MEASUREMENT_ID` if GA4 reporting is desired.
- Google verification: set `VITE_GOOGLE_SITE_VERIFICATION` if using an HTML-tag verification method. Prefer DNS validation for full domain ownership.

Google Search Console and GA4 are linked externally from the dashboard; they do not appear as in-dashboard metrics until their own APIs are connected. Images hosted on third-party editorial sites still require a separate licensing and reliability review.

## Post-release
- Check that new articles published through GitHub trigger a build and acquire corresponding prerender HTML. Articles added solely through the live API and not reflected in a build will retain client-only fallback until the next deployment.
- Verify Spanish pages do not fall back to English. Keep only genuinely translated URLs in the Spanish sitemap.
- Use `?utm_source=tiktok&utm_medium=social&utm_campaign=boxing_news` on outbound links to understand campaign attribution.
