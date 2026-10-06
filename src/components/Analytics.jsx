import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const GA_ID=import.meta.env.VITE_GA_MEASUREMENT_ID;

export default function Analytics(){
 const location=useLocation();

 useEffect(()=>{
  if(!GA_ID || typeof document==='undefined') return;
  if(!document.getElementById('aura-gtag')){
   const script=document.createElement('script');
   script.id='aura-gtag';
   script.async=true;
   script.src=`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
   document.head.appendChild(script);
   window.dataLayer=window.dataLayer||[];
   window.gtag=function(){window.dataLayer.push(arguments);};
   window.gtag('js',new Date());
   window.gtag('config',GA_ID,{send_page_view:false});
  }
 },[]);

 useEffect(()=>{
  if(!GA_ID || !window.gtag) return;
  window.gtag('event','page_view',{
   page_path:location.pathname+location.search,
   page_location:window.location.href,
   page_title:document.title
  });
 },[location.pathname,location.search]);

 return null;
}

export function trackOutbound(label,url){
 if(window.gtag) window.gtag('event','click',{event_category:'outbound',event_label:label,link_url:url});
}
