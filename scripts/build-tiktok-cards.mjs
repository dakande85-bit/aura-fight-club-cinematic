#!/usr/bin/env node
// Generate 1080x1920 editorial JPEG carousels. No outside photography or image API.
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const WIDTH=1080,HEIGHT=1920;
const source='data/tiktok-editorial-packs.json';
const escapeXml=value=>String(value||'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&apos;');
function lineWidths(text,size,maxWidth,maxLines=9) {
 const width = str => [...str].reduce((sum,ch)=>sum+size*(/[MWQ]/.test(ch)?.82:/[ilI1.,:!|]/.test(ch)?.31:/[A-Z0-9]/.test(ch)?.65:.56),0);
 const chunks=String(text||'').split(/\s+/).filter(Boolean);
 let line='',lines=[];
 for(const token of chunks){
  const next=line?line+' '+token:token;
  if(width(next)<=maxWidth||!line)line=next;
  else{lines.push(line);line=token;}
 }
 if(line)lines.push(line);
 if(lines.length>maxLines){lines=lines.slice(0,maxLines);lines[maxLines-1]=lines[maxLines-1].slice(0,-3)+'…';}
 return lines;
}
function lines(text,x,y,size,width,leading,maxLines,color,weight=800) {
 return lineWidths(text,size,width,maxLines).map((line,i)=>'<text x="'+x+'" y="'+(y+i*leading)+'" fill="'+color+'" font-family="Arial,DejaVu Sans,Liberation Sans,sans-serif" font-weight="'+weight+'" font-size="'+size+'">'+escapeXml(line)+'</text>').join('');
}
function silhouette(x,reverse=false) {
 return '<g transform="translate('+x+',640) scale('+(reverse?-1:1)+',1)" opacity=".24">'+
  '<ellipse cx="0" cy="28" rx="130" ry="157" fill="url(#portrait)"/>'+
  '<path d="M-87 154 Q-188 187 -228 315 L-210 632 L197 632 L231 299 Q154 174 82 153 Q0 201 -87 154Z" fill="url(#portrait)"/>'+
  '<path d="M-150 248 Q-260 168 -304 248 Q-351 326 -295 384 Q-232 439 -170 377Z" fill="#c4a168"/>'+
  '<path d="M86 240 Q184 170 230 238 Q265 300 213 364 Q164 404 111 354Z" fill="#d7b578"/></g>';
}
function makeSvg(pack,slide,idx) {
 const accent=idx===0?'#e3c68a':idx===4?'#e6bd72':'#d5ad6b';
 const title=String(slide.headline).toUpperCase();
 const size=idx===0?(title.length>58?78:89):(title.length>55?72:83);
 const titleY=idx===0?510:620;
 const titleHeight=lineWidths(title,size,916,8).length*1.16*size;
 const bodyY=Math.max(titleY+titleHeight+118,1010);
 const body=slide.body||slide.subhead||'';
 const bodySize=idx===0?52:idx===4?52:46;
 const bg=idx===0?(silhouette(330)+silhouette(770,true)):
  '<g opacity=".16"><circle cx="880" cy="980" r="405" fill="none" stroke="#dcb878" stroke-width="8"/><circle cx="880" cy="980" r="260" fill="none" stroke="#dcb878" stroke-width="2"/><path d="M475 980 H1285 M880 545 V1405" stroke="#c3ced0" stroke-width="3" /></g>';
 const parts=[
  '<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">',
  '<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#293643"/><stop offset=".43" stop-color="#101923"/><stop offset="1" stop-color="#080d12"/></linearGradient>',
  '<radialGradient id="glow"><stop stop-color="#ad8d52" stop-opacity=".34"/><stop offset="1" stop-color="#ad8d52" stop-opacity="0"/></radialGradient>',
  '<linearGradient id="portrait" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#e8c184"/><stop offset="1" stop-color="#4f6071"/></linearGradient>',
  '<pattern id="grid" width="96" height="96" patternUnits="userSpaceOnUse"><path d="M96 0H0V96" fill="none" stroke="#b9c4ce" stroke-opacity=".075" stroke-width="2"/></pattern>',
  '<linearGradient id="shade" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#080c14" stop-opacity="0"/><stop offset=".45" stop-color="#080c14" stop-opacity=".34"/><stop offset="1" stop-color="#080c14" stop-opacity=".9"/></linearGradient></defs>',
  '<rect width="1080" height="1920" fill="url(#bg)"/>',
  '<rect width="1080" height="1920" fill="url(#grid)"/>',
  '<ellipse cx="'+(idx===0?530:950)+'" cy="'+(idx===0?835:1100)+'" rx="790" ry="880" fill="url(#glow)"/>',
  '<path d="M-100 1400 L1180 160 M-100 1580 L1180 340 M-100 1760 L1180 520" fill="none" stroke="#d0b07c" stroke-opacity=".065" stroke-width="5"/>',
  bg,
  '<rect width="1080" height="1920" fill="url(#shade)"/>',
  '<rect width="1080" height="14" fill="'+accent+'"/>',
  '<rect x="80" y="121" width="66" height="9" fill="'+accent+'"/>',
  '<text x="163" y="145" fill="#f7f4ec" font-family="Arial,DejaVu Sans,sans-serif" font-size="36" font-weight="900" letter-spacing="4">AURA / FIGHT DESK</text>',
  '<text x="80" y="244" fill="'+accent+'" font-family="Arial,DejaVu Sans,sans-serif" font-size="30" font-weight="800" letter-spacing="2">'+escapeXml(pack.category.toUpperCase())+'</text>',
  '<path d="M80 310 H1000" stroke="#e8e9e7" stroke-opacity=".27" stroke-width="3"/>',
  '<text x="80" y="405" fill="#ccd4d8" font-family="Arial,DejaVu Sans,sans-serif" font-size="28" letter-spacing="2">'+escapeXml(slide.eyebrow)+'</text>',
  lines(title,80,titleY,size,916,size*1.16,8,'#f8f6f0',900),
  '<rect x="80" y="'+Math.min(bodyY-70,1530)+'" width="184" height="8" fill="'+accent+'"/>',
  lines(body,82,bodyY,bodySize,900,bodySize*1.41,9,idx===0?accent:'#dde3e5',idx===0?840:570),
  '<path d="M80 1695 H1000" stroke="#f0eadc" stroke-opacity=".3" stroke-width="3"/>',
  '<text x="80" y="1763" fill="#c9d2d9" font-family="Arial,DejaVu Sans,sans-serif" font-size="24" font-weight="780" letter-spacing="2">INDEPENDENT BOXING REPORTING / AURA FIGHT CLUB</text>',
  '<text x="80" y="1831" fill="'+accent+'" font-family="Arial,DejaVu Sans,sans-serif" font-size="30" font-weight="800">'+escapeXml(pack.id.toUpperCase().replaceAll('-',' / '))+'</text>',
  '<text x="1000" y="1834" fill="'+accent+'" text-anchor="end" font-family="Arial,DejaVu Sans,sans-serif" font-size="37" font-weight="800">'+String(idx+1).padStart(2,'0')+' / 05</text>',
  '</svg>'
 ];
 return parts.join('');
}
async function main() {
 const edition=JSON.parse(await fs.readFile(source,'utf8'));
 const articles=JSON.parse(await fs.readFile('public/news/articles.json','utf8')).articles;
 const known=new Set(articles.map(a=>a.slug));
 if(!Array.isArray(edition.packs)||!edition.packs.length)throw Error('No social story packs');
 const out={version:1,reviewedAt:edition.reviewedAt,packs:[]};
 for(const pack of edition.packs) {
  if(!/^[a-z0-9-]+$/.test(pack.id)||!known.has(pack.relatedArticle))throw Error('Bad pack or missing source article: '+pack.id);
  if(!Array.isArray(pack.slides)||pack.slides.length!==5)throw Error('Pack must contain 5 slides');
  const dest=path.join('public','news','tiktok',pack.id);
  await fs.mkdir(dest,{recursive:true});
  const media=[];
  for(let i=0;i<5;i++){
   const slide=pack.slides[i];if(!slide.headline||!slide.eyebrow||!slide.type)throw Error('Incomplete slide');
   const name=String(i+1).padStart(2,'0')+'.jpg';
   await sharp(Buffer.from(makeSvg(pack,slide,i)),{density:144}).resize(WIDTH,HEIGHT)
    .jpeg({quality:87,mozjpeg:true}).toFile(path.join(dest,name));
   media.push('/news/tiktok/'+pack.id+'/'+name);
  }
  out.packs.push({id:pack.id,relatedArticle:pack.relatedArticle,caption:pack.caption,media});
 }
 await fs.writeFile('public/news/tiktok/manifest.json',JSON.stringify(out,null,2)+'\n');
 console.log('Generated '+out.packs.reduce((n,p)=>n+p.media.length,0)+' editorial slides.');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
