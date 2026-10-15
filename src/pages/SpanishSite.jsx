import {useEffect} from 'react';
import {Link, useLocation} from 'react-router-dom';
import {PageSEO, SITE_URL} from '../components/SEO.jsx';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import articlesData from '../../public/news/articles.json';
import fightsData from '../../public/news/fights.json';
import rankingsData from '../../public/news/rankings.json';
import {fighters} from '../data/seoEntities.js';
import {spanishArticles} from '../i18n/esArticles.js';
import '../styles/aura-spanish.css';

const ALL = articlesData.articles || [];
const COVERAGE = ALL.filter(article => spanishArticles[article.slug]);
const EVENTS = fightsData.fights || [];
const dateES = value => {
  const date = new Date(value + 'T12:00:00Z');
  return Number.isNaN(+date) ? value : new Intl.DateTimeFormat('es-ES',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(date);
};
const divisionES = name => ({
  Heavyweight:'Peso pesado', Bridgerweight:'Peso puente', Cruiserweight:'Peso crucero',
  'Light heavyweight':'Semipesado', 'Super middleweight':'Supermediano', Middleweight:'Peso mediano',
  'Super welterweight':'Superwélter', Welterweight:'Peso wélter', 'Super lightweight':'Superligero',
  Lightweight:'Peso ligero', 'Super featherweight':'Superpluma', Featherweight:'Peso pluma',
  'Super bantamweight':'Supergallo', Bantamweight:'Peso gallo', 'Super flyweight':'Supermosca',
  Flyweight:'Peso mosca', 'Light flyweight':'Minimosca', Minimumweight:'Peso mínimo'
})[name] || name;
const url = path => SITE_URL + path;
const fallbackPhoto = '/assets/aura-live/hero/hero-fighter-stance.png';

function Hero({eyebrow,title,description,image=fallbackPhoto,children}) {
  return <section className="aura-es-hero">
    <div className="aura-es-hero__image" style={{backgroundImage:`linear-gradient(90deg,rgba(11,10,9,.92),rgba(11,10,9,.52)),url("${image}")`}} role="presentation" />
    <div className="aura-es-hero__inner"><p className="aura-es-eyebrow">{eyebrow}</p><h1>{title}</h1><p>{description}</p>{children}</div>
  </section>;
}
function Metadata({title,description,path,noindex=false,image,schema}) {
  return <PageSEO title={title+' | AURA Fight Club'} description={description} canonicalPath={path} image={image} noindex={noindex} type={schema?'article':'website'} schema={schema}/>;
}
function Cards({articles=COVERAGE,limit}) {
  const list=limit?articles.slice(0,limit):articles;
  return <div className="aura-es-grid">{list.map((a,i)=>{
    const es=spanishArticles[a.slug];
    return <article className="aura-es-story" key={a.slug}>
      <Link to={'/es/news/'+a.slug} aria-label={'Leer: '+es.title}>
        <div className="aura-es-story__image"><img src={a.image?.src||fallbackPhoto} alt={a.image?.alt||es.title} loading={i<2?'eager':'lazy'} onError={e=>{if(!e.currentTarget.src.includes('hero-fighter-stance'))e.currentTarget.src=fallbackPhoto;}}/></div>
      </Link>
      <div className="aura-es-story__content"><p className="aura-es-eyebrow">Análisis · {dateES(a.date)}</p>
        <h3><Link to={'/es/news/'+a.slug}>{es.title}</Link></h3><p>{es.summary}</p>
        <Link className="aura-es-read" to={'/es/news/'+a.slug}>Leer artículo <span aria-hidden="true">↗</span></Link></div>
    </article>;
  })}</div>;
}
function Homepage() {
  return <><Metadata title="Noticias y análisis del boxeo" description="Noticias de boxeo en español, análisis táctico, próximos combates, campeones y cultura del ring." path="/es"/>
    <Hero eyebrow="AURA / BOXEO SIN FILTROS" title={<>EL BOXEO.<br/><em>DESDE OTRA ESQUINA.</em></>} description="Noticias, análisis con criterio, combates que importan y cultura del boxeo. Una mirada independiente al deporte dentro y fuera del ring.">
      <div className="aura-es-actions"><Link className="aura-es-button" to="/es/news">Últimas noticias <span>↗</span></Link><Link className="aura-es-button aura-es-button--line" to="/es/fight-hub">Próximos combates</Link></div>
    </Hero><div className="aura-es-container"><div className="aura-es-heading"><div><p className="aura-es-eyebrow">LA REDACCIÓN / AURA</p><h2>Historias que merecen atención.</h2></div><Link to="/es/news">Todas las noticias →</Link></div><Cards limit={6}/><div className="aura-es-promo"><p className="aura-es-eyebrow">MÁS ALLÁ DE LOS TITULARES</p><h2>La próxima gran pelea empieza mucho antes del primer asalto.</h2><p>Consulta fechas, campeones y dónde ver las veladas. Los horarios no confirmados se indicarán como tales.</p><Link className="aura-es-button" to="/es/fight-hub">Explorar combates ↗</Link></div></div></>;
}
function News() {
  return <><Metadata title="Últimas noticias de boxeo en español" description="Artículos y análisis de boxeo en español: Fury, Joshua, campeones, rivales y el negocio del ring." path="/es/news"/>
    <Hero eyebrow="AURA / LA REDACCIÓN" title="EL RINCÓN DE LA NOTICIA." description="Contexto, análisis táctico, investigación y opinión independiente. Los artículos en español se publican cuando tienen una traducción íntegra." image="/assets/fight-club/aura-app-coming-soon.webp" />
    <div className="aura-es-container"><div className="aura-es-heading"><div><p className="aura-es-eyebrow">ARTÍCULOS EN ESPAÑOL</p><h2>En portada.</h2></div><a href="/news">Todas las noticias en inglés ↗</a></div><Cards/><p className="aura-es-notice">Edición en español en expansión. La cobertura inglesa puede incluir artículos adicionales aún pendientes de traducción. Las fuentes originales se conservan en cada noticia.</p></div></>;
}
function Article({slug}) {
  const original=ALL.find(a=>a.slug===slug), es=spanishArticles[slug];
  if(!original||!es)return <><Metadata title="Traducción aún no disponible" description="Consulta el artículo original en inglés." path={'/es/news/'+slug} noindex/><div className="aura-es-container aura-es-reading"><h1>Esta noticia aún no está traducida.</h1><p>La edición íntegra en español no está disponible. Puedes consultar el artículo original en inglés.</p><a className="aura-es-button" href={'/news/'+encodeURIComponent(slug)}>Leer en inglés ↗</a></div></>;
  const path='/es/news/'+slug;
  const schema={'@context':'https://schema.org','@type':'NewsArticle',headline:es.title,description:es.summary,inLanguage:'es',datePublished:original.date,dateModified:original.updatedAt||original.date,mainEntityOfPage:url(path),image:original.image?.src?[original.image.src]:undefined,author:{'@type':'Organization',name:'AURA Fight Club'},publisher:{'@type':'Organization',name:'AURA Fight Club',url:SITE_URL}};
  return <><Metadata title={es.title} description={es.summary} path={path} image={original.image?.src} schema={schema}/>
    <article className="aura-es-article aura-es-container"><div className="aura-es-crumbs"><Link to="/es">Inicio</Link> / <Link to="/es/news">Noticias</Link></div><p className="aura-es-eyebrow">ANÁLISIS / {dateES(original.date)}</p><h1>{es.title}</h1><p className="aura-es-deck">{es.summary}</p><div className="aura-es-byline">AURA Fight Club · Publicado el {dateES(original.date)} · <a href={'/news/'+original.slug}>English edition ↗</a></div>
    {original.image?.src&&<figure className="aura-es-article__figure"><img src={original.image.src} alt={original.image.alt||es.title} onError={e=>{e.currentTarget.src=fallbackPhoto}}/><figcaption>{original.image.credit||''}{original.image.caption?' · '+original.image.caption:''}</figcaption></figure>}
    <div className="aura-es-prose">{es.body.map((p,i)=><p key={i}>{p}</p>)}</div>
    <div className="aura-es-source"><h2>Fuentes y verificación</h2><p>La traducción conserva las afirmaciones y la fecha de revisión de la edición original. Los hechos pueden cambiar después de la publicación.</p>{original.sourceUrl&&<p><a href={original.sourceUrl} target="_blank" rel="noopener noreferrer">Consultar la fuente principal ↗</a></p>}{original.sources?.map(s=><p key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.name} ↗</a></p>)}</div>
    <div className="aura-es-heading"><h2>Seguir leyendo</h2><Link to="/es/news">Todas las noticias →</Link></div><Cards articles={COVERAGE.filter(a=>a.slug!==slug)} limit={3}/></article></>;
}
function FightHub() {
  const today = new Date().toISOString().slice(0,10);
  const upcoming=EVENTS.filter(f=>f.date>=today&&f.status!=='Completed').sort((a,b)=>a.date.localeCompare(b.date));
  return <><Metadata title="Calendario de boxeo y próximos combates" description="Próximas peleas de boxeo, fechas, sedes, retransmisiones y enlaces oficiales de verificación." path="/es/fight-hub"/>
    <Hero eyebrow="AURA / CENTRO DE COMBATES" title="LAS PELEAS QUE IMPORTAN." description="Fechas, sedes, televisión y enlaces de las próximas grandes veladas. No inventamos horarios ni operadores cuando no están confirmados." />
    <div className="aura-es-container"><div className="aura-es-heading"><div><p className="aura-es-eyebrow">PRÓXIMAS VELADAS</p><h2>En el calendario.</h2></div><a href="/fight-hub">Ficha detallada (EN) ↗</a></div>
      <div className="aura-es-events">{upcoming.length?upcoming.slice(0,24).map(f=><article key={f.id} className="aura-es-event"><div><p className="aura-es-eyebrow">{dateES(f.date)} · {divisionES(f.division)}</p><h3>{f.name}</h3><p>{f.venue}</p><p><strong>Retransmisión:</strong> {f.broadcastStatus==='confirmed'?f.broadcast:'Pendiente de confirmación'}</p><p><strong>Territorio:</strong> {f.broadcastTerritory||'Consultar al proveedor local'}</p></div><div className="aura-es-event__links"><a href={'/fights/'+f.id}>Análisis de la pelea (EN) ↗</a>{f.sourceUrl&&<a href={f.sourceUrl} target="_blank" rel="noopener noreferrer">Verificar evento ↗</a>}</div></article>):<p>No hay próximas veladas confirmadas en la base de datos.</p>}</div><p className="aura-es-notice">Los horarios del combate principal pueden variar. Verifica la disponibilidad de la retransmisión en tu país antes de contratar cualquier servicio.</p></div></>;
}
function Rankings() {
  const divisions=rankingsData.divisions||[];
  return <><Metadata title="Campeones del mundo y clasificaciones de boxeo" description="Campeones de la WBA, WBC, IBF y WBO por categoría de peso, con información y fuentes actualizadas." path="/es/rankings"/>
    <Hero eyebrow="AURA / EL MAPA DE LOS TÍTULOS" title="CAMPEONES Y CLASIFICACIONES." description="Descubre quién ostenta los cinturones mundiales por división. Las listas representan una revisión editorial, no una clasificación en tiempo real."/>
    <div className="aura-es-container"><p className="aura-es-notice">Última revisión de las clasificaciones: {rankingsData.checkedAt}. Los títulos y las posiciones deben verificarse con el organismo correspondiente.</p><div className="aura-es-rankings">{divisions.map(d=><article key={d.id}><p className="aura-es-eyebrow">DIVISIÓN</p><h2>{divisionES(d.name)}</h2>{['WBA','WBC','IBF','WBO'].map(body=><div key={body} className="aura-es-titleholder"><strong>{body}</strong><span>{d.champions?.[body]||'Vacante / por confirmar'}</span></div>)}</article>)}</div><p><a className="aura-es-button" href="/rankings">Clasificaciones detalladas y fuentes (EN) ↗</a></p></div></>;
}
function Fighters() {
  return <><Metadata title="Boxeadores y perfiles" description="Explora boxeadores, campeones, aspirantes, registros profesionales y próximos enfrentamientos." path="/es/fighters"/>
    <Hero eyebrow="AURA / LOS PROTAGONISTAS" title="LOS BOXEADORES." description="Campeones, aspirantes y promesas del boxeo mundial. Datos contrastados con fuentes; los perfiles completos siguen disponibles en la edición inglesa."/>
    <div className="aura-es-container aura-es-fighters">{fighters.slice(0,50).map(f=><a key={f.slug} href={'/fighters/'+f.slug}><span>{divisionES(f.division)} · {f.nationality||'—'}</span><strong>{f.name}</strong><small>Ficha completa en inglés ↗</small></a>)}</div></>;
}
function TextPage({page}) {
 const pages={
  '/lifestyle': {title:'BOXEO. CULTURA. IDENTIDAD.',eyebrow:'AURA / ESTILO DE VIDA',intro:'AURA Fight Club va más allá de las doce cuerdas. El entrenamiento, el diseño y la actitud forman parte de una misma cultura.',heading:'Hecho para quienes viven el boxeo.',body:'Exploramos conceptos de moda y calzado inspirados en la disciplina y personalidad del ring. Sin tienda ni cesta: las colecciones exclusivas se comunicarán a nuestra comunidad de socios.',action:'Solicitar acceso como socio',href:'/members'},
  '/who-we-are': {title:'MUCHO MÁS QUE BOXEO.',eyebrow:'AURA / NUESTRA HISTORIA',intro:'Somos una plataforma independiente dedicada al boxeo, su gente y su cultura.',heading:'Noticias con criterio. Historias con carácter.',body:'Publicamos análisis y artículos originales, creamos contenido de vídeo para YouTube y desarrollamos una identidad de estilo de vida vinculada al deporte. Queremos que los aficionados entiendan lo que ocurre dentro y fuera del ring.',action:'Explorar noticias',href:'/es/news'},
  '/members': {title:'FORMA PARTE DEL CLUB.',eyebrow:'AURA / SOCIOS',intro:'Un punto de encuentro para aficionados que quieren más noticias, cultura y acceso a diseños exclusivos.',heading:'Entra en la comunidad AURA.',body:'La inscripción de socios se realiza por ahora en nuestro formulario original en inglés. No es necesario comprar ningún producto para interesarte por la comunidad.',action:'Ir al formulario de inscripción (EN)',href:'/members'}
 };
 const x=pages[page];
 if(!x)return null;
 return <><Metadata title={x.heading} description={x.intro} path={'/es'+page}/><Hero title={x.title} eyebrow={x.eyebrow} description={x.intro}/><div className="aura-es-container aura-es-text"><h2>{x.heading}</h2><p>{x.body}</p><a className="aura-es-button" href={x.href}>{x.action} ↗</a></div></>;
}
export default function SpanishSite() {
 const location=useLocation();
 const path=location.pathname.replace(/^\/es(?=\/|$)/,'')||'/';
 useEffect(()=>{document.documentElement.lang='es';window.scrollTo(0,0);},[path]);
 const originalPath=path==='/'?'/':path;
 const isArticle=path.startsWith('/news/');
 return <><Header/><div className="aura-es">
    <main id="contenido" className="aura-es-main">{path==='/'?<Homepage/>:path==='/news'?<News/>:isArticle?<Article slug={path.slice('/news/'.length)}/>:path==='/fight-hub'||path==='/calendar'?<FightHub/>:path==='/rankings'?<Rankings/>:path==='/fighters'?<Fighters/>:['/lifestyle','/who-we-are','/members'].includes(path)?<TextPage page={path}/>:<><Metadata title="Página no disponible en español" description="Consulta la página original en inglés." path={'/es'+path} noindex/><div className="aura-es-container aura-es-reading"><h1>Página pendiente de traducción.</h1><p>Esta sección sigue disponible en inglés.</p><a className="aura-es-button" href={originalPath}>Ver la página en inglés ↗</a></div></>}</main>
  </div><Footer/></>;
}
