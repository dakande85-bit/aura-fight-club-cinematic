import {useState} from 'react';
import {Link, useSearchParams} from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import {PageSEO} from '../components/SEO.jsx';
import {fighters} from '../data/seoEntities.js';
import {VerifiedPhoto} from '../components/VerifiedPhoto.jsx';
import '../styles/fight-hub.css';

const choices=fighters.filter(f=>!f.editorialHidden);
const suggestions=[
 {label:'Usyk vs Fury',left:'oleksandr-usyk',right:'tyson-fury'},
 {label:'Inoue vs Nakatani',left:'naoya-inoue',right:'junto-nakatani'},
 {label:'Canelo vs Mbilli',left:'canelo-alvarez',right:'christian-mbilli'},
 {label:'Ennis vs Fundora',left:'jaron-ennis',right:'sebastian-fundora'}
];
const fields=[['Record','record'],['Reach','reach'],['Height','height'],['Weight class','division'],['Stance','stance'],['Nationality','nationality'],['Date of birth','birthDate']];
const labels={
 en:{title:'HEAD TO HEAD.',eyebrow:'AURA / FIGHTER INTELLIGENCE',intro:'Compare verified records, size, reach and fighting styles side by side. Unconfirmed figures are clearly identified.',suggest:'Explore a matchup',first:'First fighter',second:'Second fighter',swap:'Swap',retired:' (retired)',archive:'Career archive',profile:'Fighter profile',style:'Style & strengths',view:'View fighter intelligence →',sources:'Sources for available statistics ↗',checked:'Physical stats checked',recordChecked:'Record last reviewed',unverified:'Not verified',unreviewed:'Data not recently source-verified',different:'Choose two different fighters to compare.',copy:'Copy comparison link ↗',copied:'Comparison link copied',copyUnavailable:'Copy unavailable; use the address bar',browse:'Browse the fighter index →',note:'Records are editorial snapshots, not a live BoxRec feed. Height and reach may vary by publisher. Source references and last-checked dates accompany available statistics.',fields:{Record:'Record',Reach:'Reach',Height:'Height','Weight class':'Weight class',Stance:'Stance',Nationality:'Nationality','Date of birth':'Date of birth'}},
 es:{title:'CARA A CARA.',eyebrow:'AURA / INTELIGENCIA DEL RING',intro:'Compara récords, estatura, alcance y estilos de boxeo con fuentes. Los datos no verificados se identifican claramente.',suggest:'Explora un enfrentamiento',first:'Primer boxeador',second:'Segundo boxeador',swap:'Cambiar',retired:' (retirado)',archive:'Archivo de carrera',profile:'Perfil del boxeador',style:'Estilo y puntos fuertes',view:'Ver ficha del boxeador →',sources:'Fuentes de las estadísticas ↗',checked:'Medidas revisadas',recordChecked:'Récord revisado',unverified:'Sin verificar',unreviewed:'Datos pendientes de revisión',different:'Selecciona dos boxeadores distintos.',copy:'Copiar enlace ↗',copied:'Enlace copiado',copyUnavailable:'No se puede copiar; utiliza la barra de direcciones',browse:'Ver todos los boxeadores →',note:'Los récords son datos editoriales puntuales, no una conexión en directo con BoxRec. La estatura y el alcance pueden variar según la fuente. Se muestran referencias y fechas de revisión.',fields:{Record:'Récord',Reach:'Alcance',Height:'Estatura','Weight class':'Categoría',Stance:'Guardia',Nationality:'País','Date of birth':'Nacimiento'}}
};
const divisionES={'Heavyweight':'Peso pesado','Super middleweight':'Peso supermediano','Junior middleweight':'Peso superwélter','Junior featherweight':'Peso supergallo','Light heavyweight':'Peso semipesado','Cruiserweight':'Peso crucero','Welterweight':'Peso wélter'};
const countryES={Ukraine:'Ucrania','United Kingdom':'Reino Unido',Japan:'Japón','United States':'Estados Unidos',Mexico:'México',France:'Francia'};
const displayValue=(fighter,key,locale,t)=>{
 const value=fighter[key];
 if(!value)return t.unverified;
 if(locale!=='es')return value;
 if(key==='stance')return {Southpaw:'Zurdo',Orthodox:'Ortodoxo',Switch:'Ambidiestro'}[value]||value;
 if(key==='division')return divisionES[value]||value;
 if(key==='nationality')return countryES[value]||value;
 if(key==='birthDate'&&/^\d{4}-\d{2}-\d{2}$/.test(value))return new Intl.DateTimeFormat('es-ES',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(value+'T12:00:00Z'));
 return value;
};
function SourceBadge({fighter,t}){
 const statsSource=fighter.statSourceUrl;
 const recordSource=fighter.recordSource||fighter.bioSourceUrl;
 return <div className="aura-compare-source">
  <span>{fighter.statsCheckedAt?t.checked+': '+fighter.statsCheckedAt:t.unreviewed}</span>
  {statsSource&&<a href={statsSource} target="_blank" rel="noopener noreferrer">{t.sources}</a>}
  {fighter.recordCheckedAt&&<span>{t.recordChecked+': '+fighter.recordCheckedAt}</span>}
  {!statsSource&&recordSource&&<a href={recordSource} target="_blank" rel="noopener noreferrer">{t.sources}</a>}
 </div>;
}
function FighterColumn({fighter,locale,t}){
 const base=locale==='es'?'/es/fighters':'/fighters';
 return <section className="fh-compare-fighter" aria-label={fighter.name}>
  <VerifiedPhoto fighterSlug={fighter.slug} label={fighter.name} creditLink/>
  <p className="aura-compare-status">{fighter.careerStatus==='Retired'?t.archive:t.profile}</p>
  <h2>{fighter.name}</h2>
  <div className="aura-compare-key-stats">
   {['reach','height'].map(key=><div key={key}><span>{t.fields[key==='reach'?'Reach':'Height']}</span><strong>{displayValue(fighter,key,locale,t)}</strong></div>)}
  </div>
  <p className="aura-compare-style">{fighter.summary}</p>
  <Link to={base+'/'+fighter.slug}>{t.view}</Link>
  <SourceBadge fighter={fighter} t={t}/>
 </section>;
}
export default function FighterComparePage({locale='en'}){
 const t=labels[locale]||labels.en;
 const [params,setParams]=useSearchParams();
 const [copyStatus,setCopyStatus]=useState('');
 const valid=id=>choices.some(f=>f.slug===id);
 const left=valid(params.get('left'))?params.get('left'):'oleksandr-usyk';
 const right=valid(params.get('right'))?params.get('right'):'tyson-fury';
 const a=choices.find(f=>f.slug===left);
 const b=choices.find(f=>f.slug===right);
 const same=left===right;
 const base=locale==='es'?'/es/fighters':'/fighters';
 const update=(nextLeft,nextRight)=>{setParams({left:nextLeft,right:nextRight});setCopyStatus('');};
 const copyLink=()=>{
  const url=window.location.origin+base+'/compare?left='+encodeURIComponent(left)+'&right='+encodeURIComponent(right);
  if(!navigator.clipboard?.writeText){setCopyStatus(t.copyUnavailable);return;}
  navigator.clipboard.writeText(url).then(()=>setCopyStatus(t.copied)).catch(()=>setCopyStatus(t.copyUnavailable));
 };
 return <><PageSEO title={locale==='es'?'Comparar boxeadores — AURA Fight Club':'Compare Two Boxers — Fighter Head-to-Head | AURA Fight Club'} canonicalPath={base+'/compare'} description={t.intro}/><Header/>
  <main className="fh-page aura-compare-page">
   <header className="fh-intro"><p className="fh-kicker">{t.eyebrow}</p><h1>{t.title}</h1><p>{t.intro}</p></header>
   <div className="aura-compare-suggestions" aria-label={t.suggest}>
    <span>{t.suggest}</span>
    {suggestions.map(s=><button key={s.label} type="button" onClick={()=>update(s.left,s.right)} aria-pressed={left===s.left&&right===s.right}>{s.label}</button>)}
   </div>
   <div className="fh-comparison-selectors">
    <label>{t.first}<select value={left} onChange={e=>update(e.target.value,right)}>{choices.map(f=><option value={f.slug} key={f.slug}>{f.name}{f.careerStatus==='Retired'?t.retired:''}</option>)}</select></label>
    <button type="button" className="aura-compare-swap" onClick={()=>update(right,left)} aria-label={t.swap}>⇄ <span>{t.swap}</span></button>
    <label>{t.second}<select value={right} onChange={e=>update(left,e.target.value)}>{choices.map(f=><option value={f.slug} key={f.slug}>{f.name}{f.careerStatus==='Retired'?t.retired:''}</option>)}</select></label>
   </div>
   {same?<p className="fh-compare-note" role="status">{t.different}</p>:<>
    <div className="fh-compare-grid"><FighterColumn fighter={a} locale={locale} t={t}/><FighterColumn fighter={b} locale={locale} t={t}/></div>
    <div className="fh-compare-table" aria-label={locale==='es'?'Comparación de estadísticas':'Side-by-side fighter statistics'}>{fields.map(([label,key])=><div className="fh-compare-row" key={key}>
     <strong>{displayValue(a,key,locale,t)}</strong><span>{t.fields[label]}</span><strong>{displayValue(b,key,locale,t)}</strong>
    </div>)}</div>
   </>}
   <div className="aura-compare-actions"><button type="button" onClick={copyLink}>{t.copy}</button>{copyStatus&&<span role="status">{copyStatus}</span>}<Link to={base}>{t.browse}</Link></div>
   <p className="fh-compare-note">{t.note}</p>
  </main><Footer/>
 </>;
}
