import fs from 'node:fs';
import path from 'node:path';

const ROOT=process.cwd();
const PUBLIC=path.join(ROOT,'public');
const SITE='https://aurafightclub.com';
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
const isoDate=value=>{
 const d=value ? new Date(value) : new Date();
 return Number.isNaN(d.getTime()) ? new Date().toISOString().slice(0,10) : d.toISOString().slice(0,10);
};
const readJson=file=>JSON.parse(fs.readFileSync(path.join(PUBLIC,'news',file),'utf8'));
const readText=file=>fs.readFileSync(path.join(ROOT,file),'utf8');

const articles=readJson('articles.json').articles || [];
const fights=readJson('fights.json').fights || [];
const entities=readText('src/data/seoEntities.js');
const pull=(name)=>{
 const block=entities.match(new RegExp(`export const ${name} = \\[([\\s\\S]*?)\\n\\];`));
 if(!block) return [];
 return [...block[1].matchAll(/slug:'([^']+)'/g)].map(m=>m[1]);
};
const fighterSlugs=pull('fighters');
const topicSlugs=pull('topics');
const guideSlugs=pull('evergreenGuides');

const today=isoDate(new Date());
const staticPages=[
 '/', '/news','/calendar','/rankings','/watch','/lifestyle','/members','/who-we-are',
 '/fighters','/topics','/guides','/authors/dare-akande','/editorial-policy','/corrections',
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
  ...topicSlugs.map(slug=>({path:`/topics/${slug}`,lastmod:today})),
  ...guideSlugs.map(slug=>({path:`/guides/${slug}`,lastmod:today}))
 ]
};

for(const [file,items] of Object.entries(groups)) fs.writeFileSync(path.join(PUBLIC,file),urlset(items));
fs.writeFileSync(path.join(PUBLIC,'news-sitemap.xml'),newsXml);

const sitemapIndex=`<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...Object.keys(groups),'news-sitemap.xml'].map(file=>`  <sitemap><loc>${SITE}/${file}</loc><lastmod>${today}</lastmod></sitemap>`).join('\n')}
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
