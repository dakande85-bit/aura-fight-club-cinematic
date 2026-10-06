import { Link } from 'react-router-dom';
import { SITE_URL } from './SEO.jsx';

export function breadcrumbSchema(items=[]) {
 return {
  '@context':'https://schema.org',
  '@type':'BreadcrumbList',
  itemListElement: items.map((item,index)=>({
   '@type':'ListItem',
   position:index+1,
   name:item.label,
   item:`${SITE_URL}${item.to}`
  }))
 };
}

export default function Breadcrumbs({items=[]}) {
 if(!items.length) return null;
 return <nav className="aura-breadcrumbs" aria-label="Breadcrumb">
  <ol>
   {items.map((item,index)=><li key={item.to || item.label}>
    {index < items.length-1 && item.to ? <Link to={item.to}>{item.label}</Link> : <span aria-current={index===items.length-1?'page':undefined}>{item.label}</span>}
   </li>)}
  </ol>
 </nav>;
}
