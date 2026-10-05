import { AdSlot } from './Monetization.jsx';

export function articleReadingMinutes(body = []) {
 const words = body.filter(text => !text.startsWith('## ')).join(' ').trim().split(/\s+/).filter(Boolean).length;
 return Math.max(1, Math.ceil(words / 220));
}

export default function ArticleBody({body = [], monetized = false}) {
 const midpoint=Math.max(1,Math.floor(body.length/2));
 return <div className="aura-article-body">{body.map((text,index)=><span key={index}>
   {text.startsWith('## ')?<h2>{text.slice(3)}</h2>:<p>{text}</p>}
   {monetized && index===midpoint && <AdSlot slot="article-mid" />}
 </span>)}</div>;
}
