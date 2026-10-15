import { Link, useParams } from 'react-router-dom';
import {useState} from 'react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { PageSEO, SITE_URL } from '../components/SEO.jsx';
import Breadcrumbs, { breadcrumbSchema } from '../components/Breadcrumbs.jsx';
import { fighters, topics, evergreenGuides, author } from '../data/seoEntities.js';
import { useArticles } from '../hooks/useArticles.js';
import fightEdition from '../../public/news/fights.json';
import {auraTop50,auraTop50CheckedAt,auraTop50Sources} from '../data/auraTop50.js';
import {VerifiedPhoto} from '../components/VerifiedPhoto.jsx';
import '../styles/aura-editorial.css';
import '../styles/fight-hub.css';
import '../styles/aura-top50.css';

const clean = value => String(value || '').toLowerCase();

function Shell({children, seo, crumbs=[]}) {
 const schema = seo?.schema
   ? {'@context':'https://schema.org','@graph':[...(Array.isArray(seo.schema)?seo.schema:[seo.schema]), breadcrumbSchema(crumbs)]}
   : breadcrumbSchema(crumbs);
 return <><PageSEO {...seo} schema={schema}/><Header/><main className="aura-editorial aura-ed-page"><Breadcrumbs items={crumbs}/>{children}</main><Footer/></>;
}

function ArticleLinks({items}) {
 if(!items.length) return <p className="aura-ed-note">Coverage will appear here as new AURA stories are published.</p>;
 return <div className="aura-coverage-list">{items.map(item=><article key={item.slug}><p className="aura-ed-kicker">{item.category} · {item.date}</p><h3><Link to={`/news/${item.slug}`}>{item.title}</Link></h3><p>{item.summary}</p><Link to={`/news/${item.slug}`}>Read article</Link></article>)}</div>;
}

function AuraTop50({base,isEs,query=''}) {
 const visible=auraTop50.filter(item=>!query||item.name.toLowerCase().includes(query)||item.division.toLowerCase().includes(query));
 const t=(en,es)=>isEs?es:en;
 return <section className="aura-50" id="aura-top-50" aria-labelledby="aura-50-title">
  <div className="aura-50__head"><div>
   <p className="aura-ed-kicker">AURA / WORLD RANKINGS</p><h2 id="aura-50-title">{t('THE AURA 50.','LOS 50 DE AURA.')}</h2>
   <p>{t("Our independently curated ranking of active men's boxers, regardless of weight. The order rewards elite opposition, technical ability, achievement and recent form — not popularity alone.","Nuestra lista editorial de 50 boxeadores profesionales en activo de todas las categorías; no es una clasificación oficial.")}</p>
  </div><div className="aura-50__stamp">{t('Editorial snapshot','Revisión editorial')}<br/><strong>{auraTop50CheckedAt}</strong></div></div>
  <p className="aura-50__method">{t('AURA opinion — not a live BoxRec feed or an official Ring/TBRB ranking. The five-bout ledger is a verification workstream: only sourced results appear; pending cells do not mean a fighter has not competed. Tap a row for analysis and available bout history.','Opinión editorial de AURA; no conectada en directo a BoxRec. Se publican únicamente los resultados verificados; las casillas pendientes no representan inactividad.')}</p>
  <div className="aura-50__sources">{auraTop50Sources.map(source=><a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.label} ↗</a>)}</div>
  <div className="aura-50__rows">
   {visible.map(item=>{
    const profile=fighters.find(f=>f.slug===item.slug);
    return <details className="aura-50__row" key={item.slug}>
     <summary>
      <span className="aura-50__rank">{String(item.rank).padStart(2,'0')}</span>
      <span className="aura-50__portrait"><VerifiedPhoto fighterSlug={item.slug} label={item.name}/></span>
      <span className="aura-50__identity"><strong>{profile?<Link to={base+'/'+profile.slug} onClick={e=>e.stopPropagation()}>{item.name}</Link>:item.name}</strong><small>{item.division}</small></span>
      <span className="aura-50__division">{item.division}</span>
      <span className={'aura-50__record'+(!profile?.record?' aura-50__record--none':'')}>{profile?.record||'—'}<small>{t('Career record snapshot','Récord no actualizado')}</small></span>
      <span className="aura-50__expand">{t('Fight form ↗','Forma reciente ↗')}</span>
      <span className="aura-50__chevron" aria-hidden="true">+</span>
     </summary>
     <div className="aura-50__detail">
      <p><strong>{t('AURA assessment:','Análisis de AURA:')}</strong> {item.reason}</p>
      <div className="aura-50__form">
       {(item.recentBouts||[]).map((bout,i)=><div className="aura-50__bout" key={i}>
        <b>{bout.result} · {bout.opponent}</b><time dateTime={bout.date}>{bout.date}</time><small>{bout.method}</small>
        <a href={bout.sourceUrl} target="_blank" rel="noreferrer">{t('Verify source ↗','Fuente ↗')}</a>
       </div>)}
       {!item.recentBouts?.length&&<div className="aura-50__form-status">{t('Detailed bout history in verification. Scouting assessment above reflects AURA editorial analysis; this is not an implied unbeaten streak.','El historial de combates está en verificación. El análisis anterior representa el criterio editorial, no una racha inferida.')}</div>}
      </div>
      {Boolean(item.recentBouts?.length&&item.recentBouts.length<5)&&<p className="aura-50__form-hint">{t('Only verified bouts are shown; remaining recent fights are being checked, not presumed wins.','Solo mostramos combates verificados; los resultados restantes están pendientes de comprobación.')}</p>}
      {!profile&&<p style={{marginTop:'12px',fontSize:'12px'}}>{t('Detailed profile, verified record and licensed portrait in editorial review.','Perfil detallado, récord y fotografía sujetos a revisión editorial.')}</p>}
     </div>
    </details>
   })}
  </div>
  {!visible.length&&<p className="aura-directory-empty">{t('No matching names in the active top 50.','Sin coincidencias en el top 50.')}</p>}
 </section>;
}

export function FightersIndexPage({locale='en'}){
 const isEs=locale==='es'; const base=isEs?'/es/fighters':'/fighters';
 const translate=(en,es)=>isEs?es:en;
 const groupTranslations={
 'The elite':['La élite','Los mejores del mundo libra por libra y los que compiten al máximo nivel.'],
 'Future stars':['Estrellas del futuro','Jóvenes talentos que están llamando a la puerta de la élite.'],
 'Fighters to watch':['Boxeadores a seguir','Campeones, aspirantes peligrosos y enfrentamientos que queremos ver.'],
 'Modern greats':['Grandes figuras','Leyendas retiradas que se conservan como archivos históricos.']
 };
 const [query,setQuery]=useState('');
 const groups=[
  {title:'The elite',subtitle:'World-class pound-for-pound talents and established champions with proven opposition.',slugs:['jesse-bam-rodriguez','oleksandr-usyk','naoya-inoue','shakur-stevenson','dmitry-bivol','david-benavidez','jaron-ennis','junto-nakatani','devin-haney','canelo-alvarez','oscar-collazo','artur-beterbiev','rafael-espinoza']},
  {title:'Future stars',subtitle:'The breakout generation — elite amateurs, emerging professionals and young champions building a legacy.',slugs:['abdullah-mason','moses-itauma','floyd-schofield','ben-whittaker','curmel-moton','emiliano-vargas','giorgio-visioli','andy-cruz','hamza-uddin','xander-zayas','dalton-smith','keyshawn-davis']},
  {title:'Fighters to watch',subtitle:'Dangerous titleholders, compelling contenders and the next must-see matchups.',slugs:['isaac-cruz','jai-opetaia','daniel-dubois','fabio-wardley','sebastian-fundora','osleys-iglesias','christian-mbilli','vergil-ortiz','callum-smith','tim-tszyu','ryan-garcia','oshaquie-foster','emanuel-navarrete']},
  {title:'Modern greats',subtitle:'Retired icons and veteran stars who have already shaped an era.',slugs:['terence-crawford','anthony-joshua','tyson-fury','erislandy-lara']}
 ];
 const q=query.trim().toLowerCase();
 const count=groups.reduce((n,g)=>n+g.slugs.filter(slug=>{const f=fighters.find(x=>x.slug===slug);return f&&(!q||f.name.toLowerCase().includes(q))}).length,0);
 return <Shell seo={{title:isEs?'Boxeadores — perfiles y comparaciones | AURA Fight Club':'Fighter Intelligence, Boxing Prospects & Head-to-Head | AURA Fight Club',description:'Discover outstanding active fighters, exciting boxing prospects and side-by-side fighter comparisons.',canonicalPath:base}} crumbs={[{label:translate('Home','Inicio'),to:isEs?'/es':'/'},{label:translate('Fighter Intelligence','Boxeadores'),to:base}]}>
  <header className="aura-fighters-header"><p className="aura-ed-kicker">{translate('AURA / FIGHTER INTELLIGENCE','AURA / LOS BOXEADORES')}</p><h1>{translate('THE FIGHTERS.','LOS BOXEADORES.')}</h1><p>{translate("The elite. The ones to watch. The next generation. A curated guide to boxing's most compelling names.","La élite, los nombres a seguir y la próxima generación del boxeo.")}</p>
   <div className="aura-fighter-index-actions"><Link className="aura-compare-cta" to={base+'/compare'}>{translate('Compare two fighters ↗','Comparar dos boxeadores ↗')}</Link><Link to="/verdict">{translate('Explore upcoming fights ↗','Próximos combates (EN) ↗')}</Link></div>
  </header>
  <div className="aura-directory-controls"><label>{translate('Find a fighter','Buscar boxeador')}<input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder={translate('Search by fighter name','Busca por nombre')} /></label><span>{count} {translate('selected profiles · Records are dated editorial snapshots','perfiles · Récords con fecha de revisión')}</span></div>
  {groups.map(group=>{
   const selected=group.slugs.map(slug=>fighters.find(f=>f.slug===slug)).filter(f=>f&&(!q||f.name.toLowerCase().includes(q)));
   if(!selected.length)return null;
   return <section key={group.title} className="aura-intelligence-group">
    <div className="aura-intelligence-group__head"><div><p className="aura-ed-kicker">{translate('AURA / THE FIGHTERS','AURA / LOS BOXEADORES')}</p><h2>{isEs?groupTranslations[group.title]?.[0]||group.title:group.title}</h2><p>{isEs?groupTranslations[group.title]?.[1]||group.subtitle:group.subtitle}</p></div><small>{selected.length} {translate('fighters','boxeadores')}</small></div>
    <div className="aura-fighter-directory">{selected.map(f=><Link to={base+"/"+f.slug} className="aura-fighter-tile" key={f.slug}>
     <div className="aura-fighter-tile__photo"><VerifiedPhoto fighterSlug={f.slug} label={f.name}/></div>
     <div className="aura-fighter-tile__info"><span>{f.division}{f.careerStatus?' · Retired':''}</span><h3>{f.name}</h3><p>{f.summary}</p><strong>{translate('VIEW INTELLIGENCE ↗','VER PERFIL ↗')}</strong></div>
    </Link>)}</div>
   </section>;
  })}
  {!count&&<p className="aura-directory-empty">{translate('No matching fighter in our curated index yet.','No se ha encontrado ningún boxeador.')}</p>}
  <AuraTop50 base={base} isEs={isEs} query={q}/>
  <p className="aura-ed-note aura-fighter-disclaimer">{translate('Our editorial selection is not an official ranking. Records are supplied only where independently checked; photo placeholders are clearly identified.','Esta selección editorial no es una clasificación oficial. Los récords se muestran cuando han sido contrastados y se indican las imágenes pendientes.')}</p>
 </Shell>;
}

export function FighterProfilePage({locale='en'}){
 const isEs=locale==='es'; const base=isEs?'/es/fighters':'/fighters';
 const {slug}=useParams(); const fighter=fighters.find(f=>f.slug===slug); const {articles}=useArticles();
 if(!fighter) return <Shell seo={{title:'Fighter not found | AURA Fight Club',description:'Fighter profile not found.',canonicalPath:`/fighters/${slug}`,noindex:true}} crumbs={[{label:'Home',to:'/'},{label:'Fighters',to:'/fighters'},{label:'Not found',to:`/fighters/${slug}`}]}><div className="aura-ed-page-title"><h1>Fighter not found.</h1><Link to="/fighters">Browse fighters</Link></div></Shell>;
 const related=articles.filter(a=>fighter.aliases.some(alias=>clean(a.title+' '+a.summary+' '+(a.body||[]).join(' ')).includes(clean(alias)))).slice(0,12);
 const fights=fightEdition.fights.filter(f=>(f.fighters||[]).some(name=>fighter.aliases.some(alias=>clean(name)===clean(alias))) || fighter.aliases.some(alias=>clean(f.name).includes(clean(alias)))).slice(0,8);
 const now=new Date().toISOString().slice(0,10);
 const forthcoming=fights.filter(f=>f.date>=now&&f.status!=='Completed').sort((a,b)=>a.date.localeCompare(b.date));
 const pastListings=fights.filter(f=>f.status==='Completed'||f.date<now).sort((a,b)=>b.date.localeCompare(a.date));
 const recordKnown=Boolean(fighter.record);
 const sourceUrl=fighter.recordSource||fighter.bioSourceUrl;
 const verifiedFields=[fighter.record,fighter.stance,fighter.height,fighter.reach,fighter.birthDate].filter(Boolean).length;
 const personSchema={'@type':'Person','@id':`${SITE_URL}/fighters/${fighter.slug}#person`,name:fighter.name,nationality:fighter.nationality||undefined,description:fighter.summary,url:`${SITE_URL}/fighters/${fighter.slug}`,jobTitle:'Professional boxer'};
 const crumbs=[{label:isEs?'Inicio':'Home',to:isEs?'/es':'/'},{label:isEs?'Boxeadores':'Fighters',to:base},{label:fighter.name,to:base+'/'+fighter.slug}];
 return <Shell seo={{title:`${fighter.name} — Record, Division, News & Analysis | AURA Fight Club`,description:`${fighter.name}: ${fighter.summary} Latest AURA Fight Club news, rankings and fight coverage.`,canonicalPath:base+'/'+fighter.slug,schema:personSchema}} crumbs={crumbs}>
  <p className="aura-compare-profile-link"><Link to={base+'/compare'}>{isEs?'Comparar boxeadores ↗':'Compare fighters side by side ↗'}</Link></p><div className="aura-ed-page-title aura-profile-hero"><VerifiedPhoto fighterSlug={fighter.slug} label={fighter.name}/><div><p className="aura-ed-kicker">{fighter.division}{fighter.nationality?` · ${fighter.nationality}`:''}</p><h1>{fighter.name}</h1>{fighter.record&&<p className="aura-article-deck">{fighter.record}</p>}<p>{fighter.summary}</p><div className="aura-profile-actions"><Link to={`${base}/compare?left=${fighter.slug}&right=${fighters.find(candidate=>candidate.slug!==fighter.slug&&candidate.division===fighter.division&&!candidate.editorialHidden)?.slug||'oleksandr-usyk'}`}>{isEs?'Comparar este boxeador ↗':'Compare this fighter ↗'}</Link><Link to="/verdict">{isEs?'Próximos pronósticos ↗':'Upcoming predictions ↗'}</Link></div></div></div>
  <section className="aura-ed-section"><div className="aura-ed-section-head"><h2>{isEs?'Ficha técnica.':'Fighter intelligence.'}</h2></div><div className="aura-profile-trust"><strong>{verifiedFields}/5</strong><span>{isEs?'campos estadísticos disponibles':'Stat fields currently populated'}</span><span>{recordKnown?"Record displayed as an editorial snapshot":"Professional record awaiting confirmation"}{fighter.recordCheckedAt?` · Reviewed ${fighter.recordCheckedAt}`:""}</span></div><div className="fh-profile-stats">{[['Record',fighter.record],['Division',fighter.division],['Country',fighter.nationality],['Stance',fighter.stance],['Height',fighter.height],['Reach',fighter.reach],['Date of birth',fighter.birthDate]].map(([label,value])=><div key={label}><span>{isEs?({Record:'Récord',Division:'Categoría',Country:'País',Stance:'Guardia',Height:'Estatura',Reach:'Alcance','Date of birth':'Nacimiento'}[label]||label):label}</span><strong>{value||(isEs?'Sin verificar':'Not verified')}</strong></div>)}</div><p className="aura-ed-note">{isEs?'Mostramos datos con fuentes revisadas. No estamos conectados en directo a BoxRec.':'Data is displayed only when an editorial source has been reviewed. Profiles are not connected to BoxRec\'s live database.'}</p>{fighter.statSourceUrl&&<p className="aura-ed-note"><a href={fighter.statSourceUrl} rel="noreferrer" target="_blank">{isEs?'Fuente de estatura y alcance ↗':'Physical measurements source ↗'}</a>{fighter.statsCheckedAt&&' · '+fighter.statsCheckedAt}</p>}{sourceUrl&&<p className="aura-ed-note"><a href={sourceUrl} rel="noreferrer" target="_blank">{isEs?'Fuente del récord ↗':'View original promoter/source statistics ↗'}</a> · Source figures can change between bouts.</p>}</section>
  <section className="aura-ed-section"><div className="aura-ed-section-head"><h2>{isEs?'Próximo combate programado.':'Next scheduled appearance.'}</h2></div>{forthcoming.length?<div className="aura-profile-fights">{forthcoming.map(f=><article key={f.id}><p className="aura-ed-kicker">{f.date} · {f.division}</p><h3><Link to={`/fights/${f.id}`}>{f.name}</Link></h3><p>{f.venue}</p><p><strong>{isEs?'Emisión:':'Broadcaster:'}</strong> {f.broadcastStatus==='confirmed'?f.broadcast:'Not independently confirmed'} · <strong>{isEs?'Entrada al ring:':'Ring walk:'}</strong> {f.schedule?.ringWalkStatus==='confirmed'?'Official schedule published':'Not confirmed'}</p><Link to={`/fights/${f.id}`}>{isEs?'Detalles del combate →':'Full fight details →'}</Link></article>)}</div>:<p className="aura-ed-note">No future bout listed in the current AURA schedule. That does not establish that the fighter has no fight booked.</p>}</section>
  {pastListings.length>0&&<section className="aura-ed-section"><div className="aura-ed-section-head"><h2>{isEs?'Combates anteriores.':'Earlier event listings.'}</h2></div><div className="aura-profile-fights">{pastListings.map(f=><article key={f.id}><p className="aura-ed-kicker">{f.date} · {f.status==='Completed'?'Result reported':'Archived schedule entry'}</p><h3><Link to={`/fights/${f.id}`}>{f.name}</Link></h3><p>{f.result||'Result has not been confirmed in this database.'}</p></article>)}</div><p className="aura-ed-note">{isEs?'No es el historial completo de combates.':'This is not the fighter\'s complete bout history.'}</p></section>}
  <section className="aura-ed-section"><div className="aura-ed-section-head"><h2>{isEs?'Cobertura reciente.':'Latest coverage.'}</h2></div>{isEs&&<p className="aura-ed-note">Los artículos originales están en inglés.</p>}<ArticleLinks items={related}/></section>
  <p className="aura-ed-note"><strong>Accuracy notice:</strong> Fighter records and divisions are editorial snapshots, not a live BoxRec feed. Unverified measurements, bout results and title changes are deliberately omitted. Confirm current records against official fight results before relying on them.</p>
 </Shell>;
}

export function TopicsIndexPage(){
 return <Shell seo={{title:'Boxing Topics, Guides & Analysis | AURA Fight Club',description:'Browse AURA Fight Club topic hubs covering heavyweight boxing, prospects, predictions, British boxing, pound-for-pound and boxing guides.',canonicalPath:'/topics'}} crumbs={[{label:'Home',to:'/'},{label:'Topics',to:'/topics'}]}>
  <div className="aura-ed-page-title"><p className="aura-ed-kicker">Search hubs</p><h1>Boxing topics.</h1><p>Evergreen hubs that organise AURA reporting around the subjects fans search for repeatedly.</p></div>
  <div className="aura-coverage-list">{topics.map(t=><article key={t.slug}><h2><Link to={`/topics/${t.slug}`}>{t.title}</Link></h2><p>{t.description}</p></article>)}</div>
 </Shell>;
}

export function TopicPage(){
 const {slug}=useParams(); const topic=topics.find(t=>t.slug===slug); const {articles}=useArticles();
 if(!topic) return <Shell seo={{title:'Topic not found | AURA Fight Club',description:'Topic not found.',canonicalPath:`/topics/${slug}`,noindex:true}} crumbs={[{label:'Home',to:'/'},{label:'Topics',to:'/topics'},{label:'Not found',to:`/topics/${slug}`}]}><div className="aura-ed-page-title"><h1>Topic not found.</h1></div></Shell>;
 const related=articles.filter(a=>topic.keywords.some(k=>clean(a.title+' '+a.summary+' '+a.category+' '+(a.body||[]).join(' ')).includes(clean(k)))).slice(0,20);
 const crumbs=[{label:'Home',to:'/'},{label:'Topics',to:'/topics'},{label:topic.title,to:`/topics/${topic.slug}`}];
 return <Shell seo={{title:`${topic.title} — News, Rankings & Analysis | AURA Fight Club`,description:topic.description,canonicalPath:`/topics/${topic.slug}`}} crumbs={crumbs}>
  <div className="aura-ed-page-title"><p className="aura-ed-kicker">AURA topic hub</p><h1>{topic.title}.</h1><p>{topic.description}</p></div>
  <ArticleLinks items={related}/>
 </Shell>;
}

export function GuidesIndexPage(){
 return <Shell seo={{title:'Boxing Guides & Explainers | AURA Fight Club',description:'Boxing rules, rankings, belts, scoring, weight classes and tactical concepts explained clearly by AURA Fight Club.',canonicalPath:'/guides'}} crumbs={[{label:'Home',to:'/'},{label:'Guides',to:'/guides'}]}>
  <div className="aura-ed-page-title"><p className="aura-ed-kicker">Learn the sport</p><h1>Boxing guides.</h1><p>Evergreen explainers designed for casual fans and serious followers who want the sport made clear.</p></div>
  <div className="aura-coverage-list">{evergreenGuides.map(g=><article key={g.slug}><p className="aura-ed-kicker">{g.category}</p><h2><Link to={`/guides/${g.slug}`}>{g.title}</Link></h2><p>{g.description}</p></article>)}</div>
 </Shell>;
}

export function GuidePage(){
 const {slug}=useParams(); const guide=evergreenGuides.find(g=>g.slug===slug);
 if(!guide) return <Shell seo={{title:'Guide not found | AURA Fight Club',description:'Guide not found.',canonicalPath:`/guides/${slug}`,noindex:true}} crumbs={[{label:'Home',to:'/'},{label:'Guides',to:'/guides'},{label:'Not found',to:`/guides/${slug}`}]}><div className="aura-ed-page-title"><h1>Guide not found.</h1></div></Shell>;
 const crumbs=[{label:'Home',to:'/'},{label:'Guides',to:'/guides'},{label:guide.title,to:`/guides/${guide.slug}`}];
 const articleSchema={'@type':'Article',headline:guide.title,description:guide.description,author:{'@id':`${SITE_URL}/authors/${author.slug}#person`},publisher:{'@type':'Organization',name:'AURA Fight Club',url:SITE_URL},mainEntityOfPage:`${SITE_URL}/guides/${guide.slug}`,inLanguage:'en'};
 return <Shell seo={{title:`${guide.title} | AURA Fight Club`,description:guide.description,canonicalPath:`/guides/${guide.slug}`,type:'article',schema:articleSchema,noindex:true}} crumbs={crumbs}>
  <article className="aura-article"><p className="aura-ed-kicker">AURA boxing guide</p><h1>{guide.title}</h1><p className="aura-article-deck">{guide.description}</p><p>This guide is part of AURA Fight Club’s evergreen boxing knowledge base. It is structured and indexed now so editorial copy can be expanded without changing the URL, internal links or search intent.</p><p className="aura-ed-note">Editorial owner: <Link to={`/authors/${author.slug}`}>{author.name}</Link>. Update this page whenever rules, sanctioning-body procedures or terminology materially change.</p></article>
 </Shell>;
}

export function AuthorPage(){
 const personSchema={'@type':'Person','@id':`${SITE_URL}/authors/${author.slug}#person`,name:author.name,jobTitle:author.role,description:author.bio,url:`${SITE_URL}/authors/${author.slug}`};
 return <Shell seo={{title:`${author.name} | AURA Fight Club`,description:author.bio,canonicalPath:`/authors/${author.slug}`,schema:personSchema}} crumbs={[{label:'Home',to:'/'},{label:'Authors',to:'/authors/dare-akande'},{label:author.name,to:`/authors/${author.slug}`}]}>
  <div className="aura-ed-page-title"><p className="aura-ed-kicker">Author</p><h1>{author.name}</h1><p className="aura-article-deck">{author.role}</p><p>{author.bio}</p></div>
 </Shell>;
}

export function EditorialPolicyPage(){
 return <Shell seo={{title:'Editorial Policy | AURA Fight Club',description:'How AURA Fight Club researches, writes, updates and corrects boxing coverage.',canonicalPath:'/editorial-policy'}} crumbs={[{label:'Home',to:'/'},{label:'Editorial Policy',to:'/editorial-policy'}]}>
  <article className="aura-article"><p className="aura-ed-kicker">Trust & standards</p><h1>Editorial policy.</h1><p>AURA Fight Club separates verified reporting from analysis and opinion. Factual claims should be checked against primary or reputable sources before publication, sources should be linked where practical, and articles should show publication and modification dates.</p><h2>Original analysis</h2><p>Our aim is not to rewrite headlines. We add tactical context, career context, rankings implications and clearly-labelled opinion.</p><h2>Images and media</h2><p>Images must be relevant to the named fighter or event, accurately described with alt text, and credited where a source requires it. Prominent stories should not recycle the same hero image unless editorially necessary.</p><h2>Updates</h2><p>Fight schedules, rankings and fighter information change quickly. Material changes should update the page dateModified value and visible update note.</p></article>
 </Shell>;
}

export function CorrectionsPolicyPage(){
 return <Shell seo={{title:'Corrections Policy | AURA Fight Club',description:'AURA Fight Club corrections and update policy for boxing news, rankings and analysis.',canonicalPath:'/corrections'}} crumbs={[{label:'Home',to:'/'},{label:'Corrections',to:'/corrections'}]}>
  <article className="aura-article"><p className="aura-ed-kicker">Trust & standards</p><h1>Corrections policy.</h1><p>When a material factual error is confirmed, AURA Fight Club should correct it promptly, update the modification date and make the corrected version clear to readers where the change affects the meaning of the story.</p><p>Minor spelling, formatting and style corrections may be made without a correction note when they do not alter the substance of the report.</p></article>
 </Shell>;
}
