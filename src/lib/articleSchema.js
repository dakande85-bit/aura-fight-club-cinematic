export function httpsUrl(value, optional = false) {
 if(optional && !value) return '';
 try {const url = new URL(value); if(url.protocol !== 'https:' || url.username || url.password) throw Error(); return url.href;} catch {throw new Error('Use a valid HTTPS link.');}
}
export function validateArticle(input) {
 const text = (key,max) => {const value=String(input[key]||'').trim();if(!value || value.length>max) throw new Error(`${key} is required (maximum ${max} characters).`);return value;};
 const slug=text('slug',120); if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error('Article address must use lowercase words separated by hyphens.');
 const date=text('date',10);if(!/^\d{4}-\d{2}-\d{2}$/.test(date) || new Date(date).toISOString().slice(0,10)!==date) throw new Error('Choose a valid publication date.');
 if(date>new Intl.DateTimeFormat('en-CA',{timeZone:'Atlantic/Canary',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())) throw new Error('Scheduled publishing is not available. Choose today or an earlier date.');
 const body=Array.isArray(input.body)?input.body.map(p=>String(p).trim()).filter(Boolean):[];
 if(!body.length || body.length>100 || body.join('').length>30000) throw new Error('Add article text, up to 30,000 characters.');
 const image=input.image||{}; if(!image.alt?.trim() || !image.credit?.trim()) throw new Error('Add an accurate image description and credit.');
 const youtubeId=input.youtubeId||null;if(youtubeId && !/^[\w-]{11}$/.test(youtubeId)) throw new Error('Use a valid YouTube video ID.');
 const articleType=input.articleType||'News';if(!['News','Analysis','Opinion'].includes(articleType)) throw new Error('Choose News, Analysis or Opinion.');
 const sources=input.sources||[];if(!Array.isArray(sources)||sources.length>10) throw new Error('Add at most 10 additional sources.');
 const checkedSources=sources.map(s=>{const name=String(s.name||'').trim();if(!name||name.length>150)throw new Error('Each source needs a name, up to 150 characters.');return {name,url:httpsUrl(s.url)};});
 return {articleType,sources:checkedSources,slug,title:text('title',200),summary:text('summary',500),category:text('category',60),date,body,source:text('source',150),sourceUrl:httpsUrl(input.sourceUrl),featured:input.featured===true,priority:Math.max(0,Math.min(100,Number(input.priority)||0)),youtubeId,videoUrl:youtubeId?`https://www.youtube.com/watch?v=${youtubeId}`:httpsUrl(input.videoUrl,true),image:{src:httpsUrl(image.src),alt:String(image.alt).trim().slice(0,500),credit:String(image.credit).trim().slice(0,300),caption:String(image.caption||'').trim().slice(0,500),sourceUrl:httpsUrl(image.sourceUrl,true)}};
}
export function orderArticles(articles) {
 return [...articles].sort((a,b)=>Number(b.featured===true)-Number(a.featured===true) || (Number(b.priority)||0)-(Number(a.priority)||0) || b.date.localeCompare(a.date));
}
