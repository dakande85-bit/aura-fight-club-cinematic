// Pure editorial helpers. No TikTok connection or automatic publishing.
export const AURA_SITE = 'https://www.aurafightclub.com';
const clean = (value) => String(value || '')
  .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
  .replace(/[\*_#>`]/g, '')
  .replace(/\s+/g, ' ').trim();

export function shortText(text, limit = 255) {
  const value = clean(text);
  if (value.length <= limit) return value;
  const end = value.slice(0, limit - 1).lastIndexOf(' ');
  return value.slice(0, Math.max(end, limit - 32)) + '…';
}
export function articleUrl(slug, campaign = 'story') {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(slug || ''))) return '';
  const url = new URL('/news/' + slug, AURA_SITE);
  url.searchParams.set('utm_source', 'tiktok');
  url.searchParams.set('utm_medium', 'organic_social');
  url.searchParams.set('utm_campaign', clean(campaign).toLowerCase().replace(/[^a-z0-9_-]/g, '-').slice(0, 60) || 'story');
  return url.toString();
}
export const tikTokBioUrl = AURA_SITE + '/tiktok?utm_source=tiktok&utm_medium=profile&utm_campaign=link_in_bio';

export function storySlides(article) {
  if (!article || !article.title || !article.summary) return [];
  const sections = (Array.isArray(article.body) ? article.body : [])
    .filter(part => typeof part === 'string' && part.trim());
  const blocks = [];
  let label = 'THE STORY';
  sections.forEach(part => {
    if (/^\s*##\s+/.test(part)) { label = shortText(part, 38).toUpperCase(); return; }
    const value = shortText(part, 340);
    if (value.length >= 35) blocks.push({ label, text: value });
  });
  const candidates = blocks.filter((block, index) => !blocks.slice(0,index).some(prev => prev.text === block.text));
  const selected = candidates.slice(0, 3);
  if (candidates.length > 3) selected[2] = candidates[candidates.length - 1];
  const slides = [
    {label: 'FIGHT DESK / ' + clean(article.category || 'BOXING'), heading: shortText(article.title, 145), body: '', kind: 'cover'},
    {label: 'THE BIG PICTURE', heading: 'WHAT IS REALLY HAPPENING?', body: shortText(article.summary, 315), kind:'context'},
    ...selected.map(b=>({label: b.label, heading: '', body: b.text, kind:'analysis'}))
  ];
  return slides.slice(0, 5);
}

export function suggestedCaption(article, angle = 'question') {
  if (!article) return '';
  const headline = clean(article.title);
  const intro = angle === 'analysis'
    ? 'The key boxing question: ' + headline
    : angle === 'breaking' ? headline : headline + ' — what do you make of it?';
  const tags = (Array.isArray(article.tags) ? article.tags : [])
    .map(tag => '#' + String(tag).replace(/[^a-zA-Z0-9]/g,''))
    .filter(tag=>tag.length>3).slice(0,3);
  return [shortText(intro, 160), '', shortText(article.summary, 240),
    '', 'Full reporting and analysis at the AURA Fight Club link in bio.',
    ['', '#Boxing', '#BoxingNews', ...tags].join(' ').trim()].join('\n').trim();
}

export function latestArticles(articles, limit = 18) {
  return (Array.isArray(articles) ? articles : [])
    .filter(article => article && article.slug && article.title && article.summary)
    .sort((a,b) => String(b.updatedAt || b.date || '').localeCompare(String(a.updatedAt || a.date || '')) ||
      Number(b.priority || 0) - Number(a.priority || 0))
    .slice(0, limit);
}
