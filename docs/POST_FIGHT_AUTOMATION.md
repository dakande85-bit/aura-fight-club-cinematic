# AURA Fight Club / Automated post-fight publishing

The newsroom researches completed full WBA, WBC, IBF and WBO world-title fights, including undercards, and creates separate post-fight articles, accurate original results graphics, verified Fight Hub results and updated Google News sitemaps.

## One-time activation
1. Add OPENAI_API_KEY in the repository Actions secrets at https://github.com/dakande85-bit/aura-fight-club-cinematic/settings/secrets/actions .
2. Optionally set repository variable AURA_AI_MODEL. Default: gpt-5-mini.
3. Ensure Vercel production deploys pushes from main in GitHub.
4. In GitHub Actions, select AURA automatic post-fight reactions, Run workflow, dry_run true to verify discovery. Then run it with dry_run false.

## Schedule
09:17, 12:17, 18:17 in Atlantic/Canary. A 5-day lookback captures delayed results. Github Actions schedules can be delayed under load.

## Publication safeguards
- Full WBA/WBC/IBF/WBO championship bouts only.
- Must have two separate credible publisher domains already observed in web-search results, plus explicit verified winner and method. If not, skip.
- No duplicate reactions for the same fighter pairing.
- Original analysis only, no invented quotes, scorecards or official statements.
- Each story has an accurate custom graphic instead of unlicensed or misidentified fight photographs.
- AURA newsroom should check published stories daily because no AI research pipeline is infallible.
- Logs explain skipped stories or failed checks; Actions notifications surface failures.

## Files
- scripts/post-fight-news.mjs: live research, validation, article generation
- .github/workflows/aura-postfight.yml: scheduled runs and commits
- public/news/articles.json: existing website news feed
- public/news/fights.json: calendar result data
- public/news/media/: original graphics for each result
- public/news-sitemap.xml: sitemap regenerated after publication

## Cost and limitations
OpenAI API research and generation are billed separately from ChatGPT. The workflow limits each run to four articles. Publishing depends on an active GitHub-to-Vercel integration. For higher reliability and photographic assets, license a structured results data feed and an image provider. This tool deliberately fails closed when independent results cannot be corroborated.
