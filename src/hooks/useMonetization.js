import { useEffect, useState } from 'react';
import fallback from '../../public/news/monetization.json';

export function useMonetization() {
  const [config,setConfig]=useState(fallback);
  useEffect(()=>{
    let active=true;
    fetch('/api/monetization',{cache:'no-store'})
      .then(r=>r.ok?r.json():Promise.reject())
      .then(data=>{if(active)setConfig(data);})
      .catch(()=>{});
    return()=>{active=false;};
  },[]);
  return config;
}
