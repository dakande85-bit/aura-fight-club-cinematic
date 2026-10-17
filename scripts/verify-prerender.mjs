import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dist=path.join(root,'dist');
const articles=JSON.parse(fs.readFileSync(path.join(root,'public/news/articles.json'),'utf8')).articles;
const sample=articles[0];
assert.ok(sample,'At least one news article is required');
const html=fs.readFileSync(path.join(dist,'news',sample.slug,'index.html'),'utf8');
assert.ok(html.includes('name="description"'),'Article metadata missing');
assert.ok(html.includes('application/ld+json'),'Article structured data missing');
assert.ok(html.includes('https://www.aurafightclub.com/news/'+sample.slug),'Article canonical missing');
assert.ok(html.includes('NewsArticle'),'Article schema type missing');
assert.ok(html.includes('<h1>'+sample.title.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\"/g,'&quot;').replace(/'/g,'&#39;')),'Article preview missing');
assert.equal((html.match(/rel="canonical"/g)||[]).length,1,'Duplicate canonical tags');
const titleMatches=(html.match(/<title>/g)||[]).length;
assert.equal(titleMatches,1,'Duplicate page titles');
const sitemap=fs.readFileSync(path.join(root,'public/sitemap.xml'),'utf8');
assert.ok(sitemap.includes('sitemap-articles.xml'),'Articles sitemap not indexed');
assert.ok(!sitemap.includes('<loc>https://www.aurafightclub.com/apparel</loc>'),'Legacy shop URL in sitemap');

const rewrites=JSON.parse(fs.readFileSync(path.join(root,'vercel.json'),'utf8')).rewrites;
for(const route of [
 ['/news','/news/index.html'],
 ['/news/:slug','/news/:slug/index.html'],
 ['/fighters/:slug','/fighters/:slug/index.html'],
 ['/fights/:id','/fights/:id/index.html'],
 ['/topics/:slug','/topics/:slug/index.html']
]) {
 assert.ok(rewrites.some(rule=>rule.source===route[0] && rule.destination===route[1]),'SEO route must serve pre-rendered HTML: '+route[0]);
}
assert.ok(rewrites.findIndex(rule=>rule.source==='/news/:slug') < rewrites.findIndex(rule=>rule.source==='/(.*)'), 'Article rewrite must precede SPA fallback');
const hub=fs.readFileSync(path.join(dist,'news','index.html'),'utf8');
assert.ok(hub.includes('href="/news/'+sample.slug+'"'),'Newsroom must link to crawlable article URLs');
assert.ok(hub.includes('https://www.aurafightclub.com/news'),'Newsroom canonical must use primary www host');
for(const article of articles){
 const file=path.join(dist,'news',article.slug,'index.html');
 assert.ok(fs.existsSync(file),'Missing prerendered article: '+article.slug);
 const text=fs.readFileSync(file,'utf8');
 assert.ok(text.includes('https://www.aurafightclub.com/news/'+article.slug),'Non-primary canonical for: '+article.slug);
 assert.ok(text.includes('NewsArticle'),'NewsArticle schema missing: '+article.slug);
}
assert.ok(sitemap.includes('https://www.aurafightclub.com/sitemap-articles.xml'),'Sitemap index must use primary www host');
assert.ok(!sitemap.includes('https://aurafightclub.com/'),'Sitemap index must not link to redirecting apex host');
console.log('SEO smoke test passed:',sample.slug,'and sitemap index');
