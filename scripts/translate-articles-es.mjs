import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {reviewedSpanishArticles} from '../src/i18n/esArticles.js';

const root=process.cwd();
const inputFile=path.join(root,'public/news/articles.json');
const outputFile=path.join(root,'public/news/articles.es.json');
const key=process.env.GOOGLE_TRANSLATE_API_KEY;
if(!key){
  console.log('GOOGLE_TRANSLATE_API_KEY missing: no automatic Spanish translations generated.');
  process.exit(0);
}
const input=JSON.parse(fs.readFileSync(inputFile,'utf8'));
const existing=JSON.parse(fs.readFileSync(outputFile,'utf8'));
const translations={...(existing.articles||{})};
const hash=a=>createHash('sha256').update(JSON.stringify([a.title,a.summary,a.body])).digest('hex');
const decodeEntities=text=>String(text)
  .replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n)))
  .replace(/&#x([a-f\d]+);/gi,(_,n)=>String.fromCodePoint(parseInt(n,16)))
  .replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&apos;/g,"'")
  .replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>');

async function translateTexts(texts){
  const output=[];
  for(let start=0;start<texts.length;){
    const batch=[];let length=0;
    while(start<texts.length&&batch.length<40){
      const next=String(texts[start]||'');
      if(batch.length&&length+next.length>18000)break;
      batch.push(next);length+=next.length;start++;
    }
    const response=await fetch('https://translation.googleapis.com/language/translate/v2',{
      method:'POST',
      headers:{'Content-Type':'application/json','X-goog-api-key':key},
      body:JSON.stringify({q:batch,source:'en',target:'es',format:'text'})
    });
    if(!response.ok)throw new Error('Translation API error: HTTP '+response.status);
    const json=await response.json();
    const translationsBatch=json.data?.translations;
    if(!Array.isArray(translationsBatch)||translationsBatch.length!==batch.length)
      throw new Error('Translation API response is incomplete.');
    output.push(...translationsBatch.map(x=>decodeEntities(x.translatedText||'')));
  }
  return output;
}
let processed=0;
for(const article of input.articles||[]){
  // Reviewed stories remain editorially controlled even when the English source changes.
  if(reviewedSpanishArticles[article.slug])continue;
  const sourceHash=hash(article);
  if(translations[article.slug]?.sourceHash===sourceHash)continue;
  if(!Array.isArray(article.body)||!article.body.every(x=>typeof x==='string'))continue;
  const english=[article.title,article.summary,...article.body];
  const translated=await translateTexts(english);
  if(translated.length!==english.length||translated.some(x=>!x.trim()))throw new Error('Empty translated text for '+article.slug);
  translations[article.slug]={
    title:translated[0],summary:translated[1],body:translated.slice(2),
    automatic:true,sourceHash
  };
  processed++;
}
const stillPublished=new Set((input.articles||[]).map(a=>a.slug));
for(const slug of Object.keys(translations))if(!stillPublished.has(slug))delete translations[slug];
const output={generatedAt:new Date().toISOString(),provider:'Google Cloud Translation',articles:translations};
fs.writeFileSync(outputFile,JSON.stringify(output,null,2)+'\n');
console.log('Automatic Spanish translations updated: '+processed+'. Total generated: '+Object.keys(translations).length+'.');
