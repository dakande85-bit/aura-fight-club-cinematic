import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {fighters} from '../src/data/seoEntities.js';
import {auraTop50} from '../src/data/auraTop50.js';

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
console.log('SEO smoke test passed:',sample.slug,'and sitemap index');

const fighterXml=fs.readFileSync(path.join(root,'public','sitemap-fighters.xml'),'utf8');
const publicFighters=fighters.filter(f=>!f.editorialHidden);
assert.ok(publicFighters.length>=50,'At least 50 public fighter profiles expected');
const fighterLocs=[...fighterXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
assert.equal(fighterLocs.length,publicFighters.length,'Fighter sitemap must include every public fighter');
assert.equal(new Set(fighterLocs).size,fighterLocs.length,'Fighter sitemap contains duplicate paths');
for(const fighter of publicFighters){
 const route='/fighters/'+fighter.slug;
 assert.ok(fighterLocs.includes('https://www.aurafightclub.com'+route),'Fighter not indexed: '+fighter.slug);
 const html=fs.readFileSync(path.join(dist,route.slice(1),'index.html'),'utf8');
 assert.ok(html.includes('rel="canonical"')&&html.includes(route),'Missing fighter canonical: '+fighter.slug);
 assert.ok(html.includes('ProfilePage'),'Missing profile structured data: '+fighter.slug);
}
const rankingIndex=fs.readFileSync(path.join(dist,'fighters','index.html'),'utf8');
assert.ok(rankingIndex.includes('ItemList'),'AURA rankings structured data missing');
for(const fighter of auraTop50)assert.ok(rankingIndex.includes('href="/fighters/'+fighter.slug+'"'),'Ranking missing static SEO fighter link: '+fighter.slug);
const rankingEs=fs.readFileSync(path.join(dist,'es','fighters','index.html'),'utf8');
assert.ok(rankingEs.includes('<h1>Los 50 de AURA'),'Spanish rankings static preview missing');
console.log('Fighter SEO complete: '+publicFighters.length+' public fighter entries, '+auraTop50.length+' AURA ranked links in both languages.');
