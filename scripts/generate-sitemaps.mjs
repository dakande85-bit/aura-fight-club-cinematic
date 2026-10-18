import fs from 'node:fs';
import path from 'node:path';
import {fighters,topics,evergreenGuides} from '../src/data/seoEntities.js';

const ROOT=process.cwd();
const PUBLIC=path.join(ROOT,'public');
const SITE='https://www.aurafightclub.com';
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
const isoDate=value=>{
 const d=value ? new Date(value) : new Date();
 return Number.isNaN(d.getTime()) ? new Date().toISOString().slice(0,10) : d.toISOString().slice(0,10);
};
const readJson=file=>JSON.parse(fs.readFileSync(path.join(PUBLIC,'news',file),'utf8'));
const readText=file=>fs.readFileSync(path.join(ROOT,file),'utf8');

const articles=readJson('articles.json').articles || [];
const fights=readJson('fights.json').fights || [];
const spanishArticlesSource=readText('src/i18n/esArticles.js');
const reviewedSpanishSlugs=[...spanishArticlesSource.matchAll(/^  '([^']+)': \{/gm)].map(match=>match[1]);
const generatedSpanishSlugs=Object.keys(JSON.parse(readText('public/news/articles.es.json')).articles||{});
const spanishArticleSlugs=[...new Set([...reviewedSpanishSlugs,...generatedSpanishSlugs])];
// Import the actual ESM data rather than parsing only single-quoted slugs
// (JSON-style entries used by newer profiles were silently missing from SEO).
const fighterSlugs=fighters.filter(f=>!f.editorialHidden).map(f=>f.slug);
const topicSlugs=topics.map(t=>t.slug);
const guideSlugs=evergreenGuides.map(g=>g.slug);
if(fighterSlugs.length<50)throw Error('Fighter sitemap unexpectedly below 50 profiles');
if(new Set(fighterSlugs).size!==fighterSlugs.length)throw Error('Duplicate fighter sitemap entries');

const today=isoDate(new Date());
const staticPages=[
 '/', '/news','/tiktok','/fight-hub','/film-room','/verdict','/rankings','/members','/who-we-are',
 '/fighters','/topics','/authors/dare-akande','/editorial-policy','/corrections',
 '/advertise','/commercial-policy','/privacy','/cookies','/terms'
];

const urlset=items=>`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${items.map(i=>`  <url><loc>${esc(SITE+i.path)}</loc><lastmod>${esc(i.lastmod||today)}</lastmod></url>`).join('\n')}
</urlset>
`;

const newsCutoff=Date.now()-48*60*60*1000;
const newsArticles=articles.filter(a=>{
 const t=new Date(`${a.date}T12:00:00Z`).getTime();
 return Number.isFinite(t) && t>=newsCutoff;
});
const newsXml=`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${newsArticles.map(a=>`  <url>
    <loc>${esc(SITE+'/news/'+a.slug)}</loc>
    <news:news>
      <news:publication><news:name>AURA Fight Club</news:name><news:language>en</news:language></news:publication>
      <news:publication_date>${esc(a.date)}</news:publication_date>
      <news:title>${esc(a.title)}</news:title>
    </news:news>
  </url>`).join('\n')}
</urlset>
`;

const groups={
 'sitemap-pages.xml':staticPages.map(path=>({path,lastmod:today})),
 'sitemap-articles.xml':articles.map(a=>({path:`/news/${a.slug}`,lastmod:a.updatedAt||a.date||today})),
 'sitemap-fights.xml':fights.map(f=>({path:`/fights/${f.id}`,lastmod:f.updatedAt||f.date||today})),
 'sitemap-fighters.xml':fighterSlugs.map(slug=>({path:`/fighters/${slug}`,lastmod:today})),
 'sitemap-topics.xml':[
  ...topicSlugs.map(slug=>({path:`/topics/${slug}`,lastmod:today}))
 ]
};

for(const [file,items] of Object.entries(groups)) fs.writeFileSync(path.join(PUBLIC,file),urlset(items));
fs.writeFileSync(path.join(PUBLIC,'news-sitemap.xml'),newsXml);

// Only publish complete Spanish pages and articles: never index English fallbacks as Spanish.
const spanishOriginalPaths=[
 '/', '/news', '/fight-hub', '/rankings', '/fighters', '/who-we-are', '/members',
 ...spanishArticleSlugs.filter(slug=>articles.some(a=>a.slug===slug)).map(slug=>'/news/'+slug)
];
const spanishXml=`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${spanishOriginalPaths.map(page=>{
 const es='/es'+(page==='/'?'':page);
 return `  <url><loc>${esc(SITE+es)}</loc>
    <xhtml:link rel="alternate" hreflang="es" href="${esc(SITE+es)}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${esc(SITE+page)}"/>
  </url>`;
}).join('\\n')}
</urlset>
`;
fs.writeFileSync(path.join(PUBLIC,'sitemap-spanish.xml'),spanishXml);

const sitemapIndex=`<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...Object.keys(groups),'news-sitemap.xml','sitemap-spanish.xml'].map(file=>`  <sitemap><loc>${SITE}/${file}</loc><lastmod>${today}</lastmod></sitemap>`).join('\n')}
</sitemapindex>
`;
fs.writeFileSync(path.join(PUBLIC,'sitemap.xml'),sitemapIndex);

const robots=`User-agent: *
Allow: /
Disallow: /admin
Disallow: /cart

Sitemap: ${SITE}/sitemap.xml
Sitemap: ${SITE}/news-sitemap.xml
`;
fs.writeFileSync(path.join(PUBLIC,'robots.txt'),robots);
console.log(`Generated SEO sitemaps for ${articles.length} articles, ${fights.length} fights and ${fighterSlugs.length} fighters.`);
