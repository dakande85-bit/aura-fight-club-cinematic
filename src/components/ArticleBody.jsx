export function articleReadingMinutes(body = []) {
 const words = body.filter(text => !text.startsWith('## ')).join(' ').trim().split(/\s+/).filter(Boolean).length;
 return Math.max(1, Math.ceil(words / 220));
}

export default function ArticleBody({body = []}) {
 return <div className="aura-article-body">{body.map((text, index) => text.startsWith('## ')
   ? <h2 key={index}>{text.slice(3)}</h2>
   : <p key={index}>{text}</p>)}</div>;
}
