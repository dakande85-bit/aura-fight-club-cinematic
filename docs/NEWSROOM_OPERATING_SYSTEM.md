# AURA Fight Club — Daily editorial operating system

## Mission
Publish original, evidence-led boxing journalism that goes beyond generic announcements. Seven reader-facing channels: Breaking, The Fight Lab, Beyond the Ropes, Boxing Exposed, Future Kings, The Archives, Fight Culture. The Fight Desk allows filtering by these channels and incrementally loads the article archive.

## Daily desk (08:00 Atlantic/Canary)
An external scheduled ChatGPT research task produces 8–12 pitches and three priority recommendations daily. The task is NOT a direct GitHub publisher and must not be presented as one.

1. Monitor official fighters/promoters/broadcasters/sanctioning bodies and reputable boxing journalism; use commentary channels (including HatmanStrikesBack) as discovery leads, not primary verification.
2. Check developments against primary sources and log claim status as CONFIRMED, REPORTED or SPECULATIVE.
3. Search existing public/news/articles.json and live /api/articles to detect duplicate slug/angle.
4. Rank by news value, uniqueness, reader relevance and evidence strength.
5. Commission three strong articles: at least one news and one deep original analysis when viable.
6. Verify names, record, weight, belts, venues, time zones and broadcasters. Never substitute a guessed fight time or opponent.
7. Source a legitimately usable and relevant fighter/event image; verify source URL, copyright/licensing, caption and correct identities before publish. Unverified rights require alternative licensed imagery.
8. Editorial review: source links, original analysis, technical substance, title, lead, structure, SEO description, fighter links, related event, image and attribution.
9. Publish only after approval via /admin/articles using the configured API (or approved GitHub change); confirm public URL and image rendering after deploy.
10. Record corrections with date, source and update note.

## Article metadata
Current code uses public/news/articles.json, src/hooks/useArticles.js and /api/articles. Each article must satisfy src/lib/articleSchema.js. Required basic fields include slug, title, summary, date, category, articleType, body, source, sourceUrl and properly attributed image. Classifier currently uses articleType/category/tags; encode the channel directly as category (e.g., 'The Fight Lab') on NEW articles for precise routing. Existing articles are automatically categorised from metadata as an initial approximation.

## Story diversity
- Breaking 30%: real developments, weigh-ins, negotiations, results
- The Fight Lab 25%: tactical breakdowns, styles, game plans and film study
- Boxing Exposed / Beyond the Ropes 20%: overlooked people, promotional politics, business of the sport
- Future Kings 15%: prospective stars and career trajectories
- Archives / Fight Culture 10%: fight history, culture, gyms and style

## Editorial safety gates
- Never publish unverified allegations as fact.
- Label speculation in headline and body; differentiate negotiations from signed announcements.
- No article automatically goes live from scheduled research.
- Image accuracy takes precedence over image quantity; never depict an unrelated fighter as the subject.
- Fix inaccurate reports transparently, never silently revise substantial claims.
- Avoid redundant AI-generated copy or unattributed copying of YouTube commentary.

## Existing tools
- News desk: /news
- Editor: /admin/articles
- Editorial policy: /editorial-policy
- Article API: /api/articles
- Article schema: src/lib/articleSchema.js

## Planned next integrations (NOT implemented)
- Automated collection into a reviewed pitch queue
- Duplicate detection across full text and live content
- Attribution/licensing workflow for photo assets
- Editorial approvals backed by authenticated roles
- Automatic post-publication image, structured data and link QA
