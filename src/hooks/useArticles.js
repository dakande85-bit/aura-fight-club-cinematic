import {useEffect,useState} from 'react';
import edition from '../../public/news/articles.json';
import {orderArticles} from '../lib/articleSchema.js';
export function useArticles() {
 const [data,setData]=useState(edition);const [loading,setLoading]=useState(true);
 useEffect(()=>{const controller=new AbortController();fetch('/api/articles',{signal:controller.signal}).then(r=>{if(!r.ok)throw Error();return r.json();}).then(payload=>{if(Array.isArray(payload.articles))setData(payload);}).catch(()=>{}).finally(()=>setLoading(false));return()=>controller.abort();},[]);
 return {...data,articles:orderArticles(data.articles),loading};
}
