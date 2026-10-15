# AURA Fight Club / Editorial Intelligence

## Purpose
Find **worthwhile** boxing stories early and give an editor enough evidence to decide whether to report, investigate, analyse, or pass. Discovery is **not** publishing. Never infer that popularity makes an allegation true.

## What is actually built
- \`scripts/newsroom-radar.py\`: standard-library Python crawler of **public Google News search RSS**, plus **UK Google Trends RSS** (where available), restricted to the last 7 days.
- \`newsroom/sources.json\`: source-focused queries and named subject watchlist. Edit this file to add/remove sources or focus areas.
- Existing \`public/news/articles.json\`: compared against headline similarity to flag possible duplicate coverage (a title match is *not* a complete semantic comparison).
- \`.github/workflows/editorial-radar.yml\`: every three hours on the **default branch**, or manually via **Actions > AURA Editorial Radar > Run workflow**. Pull requests execute tests only; live site data does not change.
- GitHub Actions **job summary**: top 25 research leads, sources, recommended angle, hold flags. **Artifact**: \`editorial-brief.md\` and \`stories.json\`, retained seven days.

The workflow does not need Lovable, a language-model subscription, social-media passwords, or any API key. GitHub scheduled workflows may be delayed or skipped under load; do not use them as a guaranteed urgent breaking-news alert.

## Scoring: transparent *opportunity* rank, NOT global popularity
A provisional 0–100 score uses:

| Signal | Points | Meaning |
| --- | ---: | --- |
| Recency (last 12h / 24h / 72h / 7d) | 30 / 24 / 16 / 8 | Fresh enough to cover |
| Extra independent publishers (up to three) | 0–20 | Corroboration *lead*, not verified fact |
| Relevant Google Trends UK trend | 0 or 20 | Search attention; **not boxing-wide** |
| Uncovered by close existing headline | 15 | Novelty of opportunity |
| Boxing relevance (queries are already filtered) | 10 | Relevance |
| Official/promoter/broadcaster publisher observed | 0 or 5 | May help find the primary source |
| Close title to existing article | **−35** | Avoid duplicate coverage |

Final priority must be reviewed editorially: a low-volume exclusive can beat a widely syndicated story. The script cannot currently measure TikTok/X/Instagram discussion or YouTube view velocity. The label "most talked about" is therefore **not** used. Some feeds may under-represent an outlet due to Google News indexing.

Stories with allegation, doping, crime, corruption, rule-bending or similarly contentious wording are **held for primary-source verification and a response**. Every other item requires editorial review too. Automated title-derived format/angle suggestions are starting prompts, not researched interpretations.

## Newsroom rhythm
1. **Every three hours:** Radar collects and clusters source headlines; errors are recorded.
2. **Morning (15 min):** Editor reviews the highest-scoring 10, rejects low-quality or already-covered topics, and selects up to three.
3. **Breaking / reaction:** Check exact interview/video/post, chronology, official comment, and context. Report *what is known versus alleged*, not snippets or rumours as established facts.
4. **Deep analysis / investigation:** Develop an original hypothesis with fight footage, boxer statistics where licensed, official rankings, rules, tactical review and opposing viewpoints.
5. **Publication gate:** Two source checks for contested facts, sourcing links, distinct angle, factual title, relevant credited image and permission/licensing, no duplicate slug, fresh match details, expert read, SEO, and editor approval.
6. **After publishing:** Update follow-up events and correct materially changed facts clearly. Monitor unique visitors, search impressions, clicks, engagement and conversions; prioritise topic clusters that produce returning readers, not pageviews alone.

Suggested editorial mix (guideline, not a strict quota): 35% breaking/reporting, 25% reactions and debate, 25% original analysis/investigation, 15% evergreen explainers, fighter profiles and watch guides. Avoid forcing a story just to fill a slot.

## Editorial sections
- **The Pulse:** confirmed developments and verified statements.
- **The Fallout:** reactions and counterarguments sourced to full context.
- **Inside the Fight:** independent tactical analysis, scouting and prediction with source-backed data.
- **Under the Microscope:** investigations into officiating, contracts, management, politics, sanctioning, rankings and money.
- **Next Generation:** emerging prospects and under-covered divisions (also women's boxing).

## Next data integrations (not included in v1)
- **YouTube:** verified channel IDs, public uploads feed or official YouTube Data API with views-per-hour, comments-per-view and velocity against each channel's baseline; watch Hatman Strikes Back, Boxing Social, iFL TV, talkSPORT Boxing and selected commentators. Avoid treating heated rhetoric as independent factual confirmation.
- **Primary accounts:** verified official handles and permitted integrations for fighters, promoters and commissions. Do not scrape logins or repost copyrighted footage.
- **Social:** Reddit API/community activity and approved public platform analytics; label scores as samples rather than a complete market measurement.
- **Trend acceleration:** track topic mention counts per 3-hour window, separately from overall article count, without misidentifying syndicated copies as independent sources.
- **Admin UI:** searchable review cards, 24h/7d filters, source provenance, side-by-side article duplicates, editor approve/reject and draft brief generation. Only add CMS publication actions behind manual explicit approval.
- **Data validation:** distinct feed health checks, source-domain resolution, entity matching for divergent headlines, event/boxer ID linkage.

## Running locally
Requires Python 3.12+.

\`\`\`bash
python -m unittest discover -s newsroom/tests -v
python scripts/newsroom-radar.py --output newsroom-output
\`\`\`

Results live in \`newsroom-output/\` (not \`public/\`) and should be treated as a private editorial work product.

**Copyright**: Attribution and outbound research links are not permission to reproduce article text, photographs, interviews or broadcast clips. Original paraphrase and independently developed analysis only, with rights verification before use.
