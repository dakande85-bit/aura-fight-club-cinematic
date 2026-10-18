/**
 * Static search-engine/social-crawler entry HTML for Aura's Vite SPA.
 * Keep the existing React application: its client router replaces the article
 * preview after JS starts. All URLs remain canonical, without trailing slashes.
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {fighters,topics} from '../src/data/seoEntities.js';
import {auraTop50,auraTop50CheckedAt} from '../src/data/auraTop50.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dist=path.join(root,'dist');
const site='https://www.aurafightclub.com';
const template=fs.readFileSync(path.join(dist,'index.html'),'utf8');
const articles=JSON.parse(fs.readFileSync(path.join(root,'public/news/articles.json'),'utf8')).articles||[];
const fights=JSON.parse(fs.readFileSync(path.join(root,'public/news/fights.json'),'utf8')).fights||[];
const esc=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const plain=s=>String(s??'').replace(/<[^>]*>/g,'').trim();
const cleanDate=s=>/^\d{4}-\d{2}-\d{2}$/.test(String(s||''))?s:undefined;
const linkImage=value=>{
 if(!value)return site+'/assets/aura-live/hero/hero-fighter-stance.png';
 try{const url=new URL(value,site);return url.protocol==='https:'?url.href:site+'/assets/aura-live/hero/hero-fighter-stance.png';}catch{return site+'/assets/aura-live/hero/hero-fighter-stance.png';}
};
const schemaEscape=value=>JSON.stringify(value).replace(/</g,'\\u003c').replace(/>/g,'\\u003e');
const paragraph=text=>{
 const value=String(text||'').trim();
 if(!value)return '';
 if(value.startsWith('### '))return '<h3>'+esc(value.slice(4))+'</h3>';
 if(value.startsWith('## '))return '<h2>'+esc(value.slice(3))+'</h2>';
 if(value.startsWith('# '))return '<h2>'+esc(value.slice(2))+'</h2>';
 return '<p>'+esc(value).replace(/\n/g,' ')+'</p>';
};
const person=name=>({'@type':'Person',name});
const publisher={'@type':'Organization',name:'AURA Fight Club',url:site,logo:{'@type':'ImageObject',url:site+'/assets/aura-live/logos/mark-white.png'}};

function pageHtml({url,title,description,image,schema,body='',noindex=false}){
 const canonical=site+url;
 const tags=[
  '<meta name="description" content="'+esc(plain(description).slice(0,300))+'">',
  '<meta name="robots" content="'+(noindex?'noindex,nofollow':'index,follow,max-image-preview:large,max-snippet:-1')+'">',
  '<link rel="canonical" href="'+esc(canonical)+'">',
  '<meta property="og:site_name" content="AURA Fight Club">',
  '<meta property="og:type" content="'+(schema?.['@type']==='NewsArticle'?'article':'website')+'">',
  '<meta property="og:title" content="'+esc(title)+'">',
  '<meta property="og:description" content="'+esc(description)+'">',
  '<meta property="og:url" content="'+esc(canonical)+'">',
  '<meta property="og:image" content="'+esc(linkImage(image))+'">',
  '<meta name="twitter:card" content="summary_large_image">',
  '<meta name="twitter:title" content="'+esc(title)+'">',
  '<meta name="twitter:description" content="'+esc(description)+'">',
  '<meta name="twitter:image" content="'+esc(linkImage(image))+'">',
  schema?'<script type="application/ld+json" id="aura-static-schema">'+schemaEscape({'@context':'https://schema.org',...schema})+'</script>':'',
 ].filter(Boolean).join('\n    ');
 let html=template
  .replace(/<title>[\s\S]*?<\/title>/i,'<title>'+esc(title)+'</title>')
  .replace(/<meta (?:name|property)="(?:description|keywords|robots|og:[^"]+|twitter:[^"]+)"[^>]*>\s*/gi,'')
  .replace(/<link rel="canonical"[^>]*>\s*/gi,'')
  .replace('</head>','    '+tags+'\n  </head>');
 // Text fallback lets non-JS readers see the story while the SPA still owns navigation.
 if(body)html=html.replace('<div id="root"></div>','<div id="root"><main class="aura-static-preview" style="max-width:900px;margin:3rem auto;padding:1.5rem;color:#eee;font-family:Arial,sans-serif"><article>'+body+'</article></main></div>');
 return html;
}
function save(url,options){
 if(!/^\/(news|fights|fighters|topics)\/[a-z0-9-]+$/.test(url))throw Error('Unexpected prerender route '+url);
 const folder=path.join(dist,url.slice(1));
 fs.mkdirSync(folder,{recursive:true});
 fs.writeFileSync(path.join(folder,'index.html'),pageHtml({url,...options}));
}

const storyLinks=articles
  .filter(article=>article.slug && article.title)
  .map(article=>'<li><a href="/news/'+encodeURIComponent(article.slug)+'">'+esc(article.title)+'</a></li>')
  .join('');
const newsroomBody='<h1>Boxing News &amp; Original Analysis</h1><p>Latest reporting and tactical analysis from the AURA Fight Club fight desk.</p><nav aria-label="Latest boxing articles"><ul>'+storyLinks+'</ul></nav>';
fs.mkdirSync(path.join(dist,'news'),{recursive:true});
fs.writeFileSync(path.join(dist,'news','index.html'),pageHtml({
  url:'/news',
  title:'Boxing News & Original Analysis | AURA Fight Club',
  description:'Latest boxing news, fight results, informed previews, analysis and original reporting from AURA Fight Club.',
  schema:{'@type':'CollectionPage',name:'AURA Fight Club Boxing News',url:site+'/news',inLanguage:'en'},
  body:newsroomBody
}));

for(const article of articles){
 if(!article.slug || !article.title)continue;
 const url='/news/'+article.slug;
 const image=article.image?.src||article.image?.fallbackSrc;
 const description=article.metaDescription||article.summary;
 const schema={
  '@type':'NewsArticle',headline:article.title,description,mainEntityOfPage:site+url,
  datePublished:cleanDate(article.date),dateModified:cleanDate(article.updatedAt)||cleanDate(article.date),
  image:[linkImage(image)],author:person('AURA Fight Club Editorial'),
  publisher,articleSection:article.category||'Boxing',inLanguage:'en'
 };
 const body='<h1>'+esc(article.title)+'</h1><p>'+esc(article.summary)+'</p><p>Published: '+esc(article.date)+'</p>'+(article.body||[]).map(paragraph).join('');
 save(url,{title:article.seoTitle||article.title+' | AURA Fight Club',description,image,schema,body});
}
// Pre-render ranking index for search engines and link-preview scrapers.
// The SPA replaces this accessible HTML once JavaScript boots.
const rankingBody='<h1>AURA Fighter Intelligence — Top 50 Men\'s Boxing Ranking</h1>'
 +'<p>Independent AURA Fight Club editorial ranking, last reviewed '+esc(auraTop50CheckedAt)+'. Not an official Ring, TBRB or BoxRec ranking.</p>'
 +'<ol>'+auraTop50.map(f=>'<li><a href="/fighters/'+esc(f.slug)+'">'+esc(f.name)+'</a> — '+esc(f.division)+'</li>').join('')+'</ol>';
fs.mkdirSync(path.join(dist,'fighters'),{recursive:true});
fs.writeFileSync(path.join(dist,'fighters','index.html'),pageHtml({
 url:'/fighters',title:'AURA Top 50 Men\'s Boxing Rankings & Fighter Intelligence | AURA Fight Club',
 description:'Explore 50 ranked boxer profiles, professional records, recent verified fights, detailed scouting and modern boxing stars.',
 body:rankingBody,schema:{'@type':'ItemList',name:'AURA Top 50',itemListOrder:'https://schema.org/ItemListOrderAscending',
 itemListElement:auraTop50.map(f=>({'@type':'ListItem',position:f.rank,name:f.name,url:site+'/fighters/'+f.slug})),dateModified:auraTop50CheckedAt}
}));
const spanishRankingBody='<h1>Los 50 de AURA — perfiles de boxeadores</h1>'
 +'<p>Clasificación editorial independiente; revisión '+esc(auraTop50CheckedAt)+'. No es una lista oficial de BoxRec ni de The Ring.</p>'
 +'<ol>'+auraTop50.map(f=>'<li><a href="/es/fighters/'+esc(f.slug)+'">'+esc(f.name)+'</a> — '+esc(f.division)+'</li>').join('')+'</ol>';
fs.mkdirSync(path.join(dist,'es','fighters'),{recursive:true});
fs.writeFileSync(path.join(dist,'es','fighters','index.html'),pageHtml({
 url:'/es/fighters',title:'Los 50 de AURA — clasificación de boxeo | AURA Fight Club',
 description:'Una clasificación editorial de 50 boxeadores, con perfiles, combates contrastados y análisis del boxeo.',
 body:spanishRankingBody
}));

for(const fighter of fighters){
 const url='/fighters/'+fighter.slug;
 const description=fighter.name+': '+fighter.summary;
 const body='<h1>'+esc(fighter.name)+'</h1><p>'+esc(fighter.summary)+'</p><p>Division: '+esc(fighter.division)+'. '+(fighter.record?'Record: '+esc(fighter.record):'')+'</p>';
 save(url,{title:fighter.name+' — Boxing Profile & Analysis | AURA',description,schema:{'@type':'ProfilePage',mainEntity:{'@type':'Person',name:fighter.name,url:site+url,description:fighter.summary},dateModified:undefined},body});
}
for(const fight of fights){
 const url='/fights/'+fight.id;
 const description=fight.name+': '+(fight.stakes||'')+'. Verified dates, watch details and fight analysis.';
 const body='<h1>'+esc(fight.name)+'</h1><p>'+esc(fight.stakes||'')+'</p><p>Scheduled date: '+esc(fight.date)+'. '+esc(fight.venue)+'</p>';
 save(url,{title:fight.name+' — Fight Preview & Details | AURA',description,schema:{'@type':'SportsEvent',name:fight.name,startDate:fight.date,location:{'@type':'Place',name:fight.venue},url:site+url},body});
}
for(const topic of topics){
 const url='/topics/'+topic.slug;
 const body='<h1>'+esc(topic.title)+'</h1><p>'+esc(topic.description)+'</p>';
 save(url,{title:topic.title+' — News & Analysis | AURA',description:topic.description,body});
}
console.log('Prerendered '+articles.length+' article SEO entries, '+fighters.length+' fighters, '+fights.length+' fights and '+topics.length+' topics.');
