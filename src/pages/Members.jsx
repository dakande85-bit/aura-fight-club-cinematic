import {useState} from 'react';
import {Link} from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import {PageSEO} from '../components/SEO.jsx';
import '../styles/aura-lifestyle-lookbook.css';

const base='/assets/lookbook-2026/';
const live='/assets/aura-live/';
const legacy='/assets/category-support/';

function LookImage({src, fallback, alt, className='', eager=false, focus='center center'}){
 const [failed,setFailed]=useState(false);
 return <img src={failed&&fallback?fallback:src}
  onError={()=>{if(!failed&&fallback)setFailed(true)}}
  alt={alt} className={className} style={{objectPosition:focus}}
  loading={eager?'eager':'lazy'} decoding="async" />;
}
function Tag({children}){return <span className="al-tag">{children}</span>;}
function ImageStory({number,title,eyebrow,copy,image,alt,fallback,variant=''}) {
 return <article className={`al-story al-story--${variant||'standard'}`}>
  <div className="al-story__frame"><LookImage src={image} fallback={fallback} alt={alt}/><span className="al-story__number">{number}</span></div>
  <div className="al-story__text"><Tag>{eyebrow}</Tag><h3>{title}</h3><p>{copy}</p></div>
 </article>;
}
const uniforms=[
 {number:'01',title:'The Varsity',eyebrow:'OFF-DUTY / CULTURE',copy:'The club codes, refined. Cream outerwear, dark essentials and the confidence to carry the gym’s attitude anywhere.',image:legacy+'apparel-cream-jacket.webp',alt:'AURA cream varsity jacket design photographed against a minimal backdrop',fallback:base+'varsity.jpg'},
 {number:'02',title:'The Blackout',eyebrow:'EVERYDAY / UNIFORM',copy:'Black-on-black silhouettes for the days between rounds. Restrained branding, purposeful details and a disciplined palette.',image:base+'hoodie-black.jpg',alt:'AURA black hoodie and matching tracksuit worn by a model in a studio campaign',fallback:legacy+'apparel-black-hoodie.webp'},
 {number:'03',title:'The Light Set',eyebrow:'TRAINING TO STREET',copy:'A softer tone with the same edge. Cream tailoring and technical inspiration meet everyday movement.',image:base+'tracksuit-cream.jpg',alt:'AURA cream coordinated hoodie and trousers on a model against a dark backdrop',fallback:live+'campaign/campaign-hoodie.webp'}
];
const highlights=[
 {eyebrow:'THE EVERYDAY',title:'CARRY THE STANDARD.',text:'The club does not end when you leave the gym. A considered mix of fightwear, sneakers and essentials that speaks without shouting.',image:base+'tee-cream.jpg',fallback:live+'campaign/campaign-tee.webp',alt:'Model wearing a cream AURA boxing T-shirt with sportswear and wrapped hands'},
 {eyebrow:'FOR THE WORK',title:'EARN EVERY ROUND.',text:'From the warm-up to the final bell: equipment and silhouettes shaped by movement, effort and repetition.',image:base+'performance-black.jpg',fallback:live+'campaign/campaign-trackjacket.webp',alt:'AURA model wearing black technical tracksuit in a training-inspired studio portrait'}
];
const objects=[
 {id:'gloves',name:'The gloves',sub:'Equipment study / Heritage cream',image:'/assets/products/aura-cream-boxing-gloves/card-product.webp',fallback:legacy+'equipment-gloves-front.webp',alt:'Cream AURA boxing glove design shown in a product studio photograph'},
 {id:'shorts',name:'Fight shorts',sub:'Combat silhouettes',image:live+'products/shorts.webp',fallback:'/assets/category-support/apparel-training-vest.webp',alt:'AURA black boxing shorts with contrasting trim'},
 {id:'rope',name:'Skipping rope',sub:'Daily ritual / Essential work',image:base+'rope-cream.jpg',fallback:live+'products/skipping-rope.webp',alt:'Cream AURA skipping rope with textured handles photographed on a dark background'},
 {id:'towel',name:'Training essentials',sub:'The smallest details matter',image:base+'towel-black.jpg',fallback:live+'products/wraps.webp',alt:'Black AURA Fight Club training towel photographed on dark textured backdrop'},
 {id:'footwear-cream',name:'The low-top',sub:'Footwear / Off-duty',image:legacy+'footwear-cream-low.webp',fallback:legacy+'footwear-cream-high.webp',alt:'Cream-and-black AURA low-top lifestyle sneakers'},
 {id:'footwear-black',name:'The blackout',sub:'Footwear / Everyday',image:legacy+'footwear-black-high.webp',fallback:legacy+'footwear-cream-low.webp',alt:'AURA black boxing-inspired high-top sneaker concept'}
];
const moments=[
 {src:base+'boxing-performance.jpg',alt:'AURA athlete wearing training wear in an active movement pose',fallback:base+'performance-black.jpg',title:'THE MOVEMENT'},
 {src:base+'boxing-black-model.jpg',alt:'AURA boxer-inspired black kit and accessories photographed in the studio',fallback:base+'hoodie-black.jpg',title:'THE DISCIPLINE'},
 {src:base+'training-sparring.jpg',alt:'Two boxers in a training ring wearing monochrome AURA outfits',fallback:live+'campaign/campaign-fighter.png',title:'THE WORK'}
];
const contact='mailto:hello@aurafightclub.com?subject=AURA%20Fight%20Club%20lifestyle%20preview';
export default function MembersPage(){
 return <div className="al-page">
  <PageSEO title="The Club | AURA Fight Club — Boxing Culture & Lifestyle" canonicalPath="/members"
   description="Explore the AURA Fight Club lifestyle: an editorial lookbook of boxing-inspired apparel, training equipment, footwear and independent design concepts."/>
  <Header/>
  <main className="al-main">
   <section className="al-hero" aria-labelledby="al-hero-title">
    <div className="al-hero__copy">
     <Tag>AURA / THE CLUB · COLLECTION 01</Tag>
     <h1 id="al-hero-title"><span>THE</span><span>FIGHT</span><em>lives on.</em></h1>
     <p>Not just boxing. The mentality that comes with it. A visual world built around the ring, the work and everything beyond.</p>
     <a href="#al-the-uniform" className="al-text-link">Explore the collection <span aria-hidden="true">↘</span></a>
     <span className="al-hero__index">01 / THE CULTURE</span>
    </div>
    <div className="al-hero__visual">
     <LookImage src={base+'varsity.jpg'} fallback={legacy+'apparel-cream-jacket.webp'} alt="AURA Fight Club varsity model in a cream jacket and black sportswear in a dark studio" eager focus="center 35%"/>
     <div className="al-hero__visual-caption">AURA / CLUB UNIFORM <span>EST. FOR THE FIGHT</span></div>
    </div>
   </section>

   <div className="al-stripe" aria-label="AURA values"><span>DISCIPLINE</span><b>✦</b><span>MOVEMENT</span><b>✦</b><span>IDENTITY</span><b>✦</b><span>CULTURE</span></div>

   <section className="al-manifesto" aria-labelledby="al-manifesto-title">
    <div><Tag>MORE THAN A BRAND</Tag><span className="al-manifesto__mark">AURA.</span></div>
    <div><h2 id="al-manifesto-title">THE GYM NEVER <em>LEAVES YOU.</em></h2>
      <p>Some people see boxing as a sport. We see it as a standard: commitment, craft, resilience and the courage to show up again. AURA carries those values into what we wear, what we train with and how we move through the world.</p>
      <p className="al-manifesto__note">These are evolving creative design concepts, shown as a lookbook—not products currently available to purchase.</p>
    </div>
   </section>

   <section className="al-uniform al-wrap" id="al-the-uniform" aria-labelledby="al-uniform-title">
    <div className="al-sectionhead"><div><Tag>CHAPTER ONE / THE UNIFORM</Tag><h2 id="al-uniform-title">BUILT TO <em>BELONG.</em></h2></div><p>Designed in the language of boxing. Worn in the rhythm of everyday life.</p></div>
    <div className="al-uniform__grid">{uniforms.map((s,i)=><ImageStory key={s.number} {...s} variant={i===0?'feature':''}/>)}</div>
   </section>

   <section className="al-training-film" aria-labelledby="al-training-title">
    <LookImage src={base+'training-sparring.jpg'} fallback={live+'campaign/campaign-fighter.png'} alt="Two AURA boxers sparring inside the ring during a cinematic training session" focus="center center"/>
    <div className="al-training-film__copy"><Tag>THE WORK / NEVER STOPS</Tag><h2 id="al-training-title">THE ROUNDS<br/>MAKE THE <em>MAN.</em></h2><p>There is no culture without the work behind it.</p></div>
    <span className="al-training-film__foot">AURA / TRAINING STUDIES / 2026</span>
   </section>

   <section className="al-performance al-wrap" aria-labelledby="al-performance-title">
    <div className="al-sectionhead"><div><Tag>CHAPTER TWO / THE MOVEMENT</Tag><h2 id="al-performance-title">IN MOTION. <em>ON PURPOSE.</em></h2></div><p>Training is the origin of the aesthetic. Everything else follows.</p></div>
    <div className="al-performance__layout">
      <div className="al-performance__main"><LookImage src={highlights[1].image} fallback={highlights[1].fallback} alt={highlights[1].alt}/><span className="al-photo-note">02 / THE MOVEMENT</span></div>
      <div className="al-performance__side"><LookImage src={highlights[0].image} fallback={highlights[0].fallback} alt={highlights[0].alt}/><div className="al-performance__quote"><span>ALWAYS<br/>IN YOUR<br/>CORNER.</span><p>A uniform for the days between fights.</p></div></div>
    </div>
   </section>

   <section className="al-equipment" id="al-equipment" aria-labelledby="al-equipment-title">
    <div className="al-wrap"><div className="al-sectionhead"><div><Tag>CHAPTER THREE / THE KIT</Tag><h2 id="al-equipment-title">THE DETAILS <em>MATTER.</em></h2></div><p>A growing study of training essentials, boxing equipment and streetwear-inspired footwear.</p></div>
    <div className="al-object-grid">{objects.map((o,i)=><figure key={o.id} className={`al-object al-object--${i}`}><div className="al-object__visual"><LookImage src={o.image} fallback={o.fallback} alt={o.alt}/></div><figcaption><span>{String(i+1).padStart(2,'0')} / {o.sub}</span><strong>{o.name}</strong></figcaption></figure>)}</div></div>
   </section>

   <section className="al-moments al-wrap" aria-labelledby="al-moments-title">
    <div className="al-sectionhead"><div><Tag>BEHIND THE COLLECTION</Tag><h2 id="al-moments-title">THE PEOPLE. <em>THE PRACTICE.</em></h2></div><p>A lifestyle shaped by fighters, not fashion trends.</p></div>
    <div className="al-moments__grid">{moments.map((m,i)=><figure key={m.title}><LookImage src={m.src} fallback={m.fallback} alt={m.alt}/><figcaption><span>0{i+1}</span>{m.title}</figcaption></figure>)}</div>
   </section>

   <section className="al-closing" aria-labelledby="al-closing-title"><div className="al-closing__photo"><LookImage src={base+'boxing-black-model.jpg'} fallback={legacy+'apparel-black-hoodie.webp'} alt="AURA athlete in a minimal black training outfit and club footwear"/></div><div className="al-closing__copy"><Tag>WELCOME TO THE CLUB</Tag><h2 id="al-closing-title">THIS IS ONLY<br/><em>THE BEGINNING.</em></h2><p>The collection is growing. We’re shaping a private lookbook of future drops, new training concepts and clothing for people who live the fight mentality.</p><a className="al-closing__button" href={contact}>Enquire about the collection <span>↗</span></a><p className="al-closing__disclaimer">Preview and enquiry only. No shop, checkout, pre-orders or paid memberships are operating here.</p><Link to="/news" className="al-closing__back">Back to the Fight Desk →</Link></div></section>
  </main>
  <Footer/>
 </div>;
}
