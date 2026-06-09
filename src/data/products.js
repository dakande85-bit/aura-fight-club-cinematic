/**
 * AURA Fight Club — Product Catalogue
 * ─────────────────────────────────────
 * Source of truth: Supabase `aura_products` table (17 products).
 * This file mirrors that catalogue for local fallback + static typing.
 *
 * Public pages read LIVE media from Supabase via useProductMedia().
 * mediaStatus: 'live' = has confirmed card + hover + ≥3 gallery images.
 *              'missing' = awaiting media shoot.
 */

export const products = [
  // ── DROP 001 — LIVE MEDIA ─────────────────────────────────────────────
  {
    slug: 'aura-cream-fight-boots', name: 'AURA Cream Fight Boots',
    category: 'Footwear', collection: 'Drop 001', status: 'waitlist', mediaStatus: 'live',
    shortDesc: 'Lightweight training boot built for movement, grip, and presence.',
    description: 'The AURA Cream Fight Boot is the first footwear release from Drop 001. Lightweight construction, non-slip sole, ankle support — engineered for boxing footwork and worn for the aesthetic.',
    details: ['Cream leather upper','AURA logo at tongue and heel','Non-slip rubber sole','Reinforced ankle collar','Available in sizes UK 6–12'],
    image:      '/assets/products/aura-cream-fight-boots/card-product.webp',
    hoverImage: '/assets/products/aura-cream-fight-boots/card-hover-model.webp',
    gallery: [
      { src: '/assets/products/aura-cream-fight-boots/gallery-01.webp', alt: 'AURA Cream Fight Boots — product shot' },
      { src: '/assets/products/aura-cream-fight-boots/gallery-02.webp', alt: 'AURA Cream Fight Boots — high top detail' },
      { src: '/assets/products/aura-cream-fight-boots/gallery-03.webp', alt: 'AURA Cream Fight Boots — studio angle' },
      { src: '/assets/products/aura-cream-fight-boots/gallery-04.webp', alt: 'AURA Cream Fight Boots — model wearing' },
      { src: '/assets/products/aura-cream-fight-boots/gallery-05.webp', alt: 'AURA Cream Fight Boots — full outfit' },
    ],
  },
  {
    slug: 'aura-cream-boxing-gloves', name: 'AURA Cream Boxing Gloves',
    category: 'Equipment', collection: 'Drop 001', status: 'waitlist', mediaStatus: 'live',
    shortDesc: 'Premium cream leather gloves. 12oz and 16oz. Built for the work.',
    description: 'The AURA Cream Boxing Gloves are the centrepiece of Drop 001. Triple-layer foam padding, full-grain cream leather, chrome AURA detailing.',
    details: ['Full-grain cream leather','Triple-layer foam padding','Chrome AURA wordmark','Hook-and-loop wrist closure','Available in 12oz and 16oz'],
    image:      '/assets/products/aura-cream-boxing-gloves/card-product.webp',
    hoverImage: '/assets/products/aura-cream-boxing-gloves/card-hover-model.webp',
    gallery: [
      { src: '/assets/products/aura-cream-boxing-gloves/gallery-01.webp', alt: 'AURA Cream Boxing Gloves — product' },
      { src: '/assets/products/aura-cream-boxing-gloves/gallery-02.webp', alt: 'AURA Cream Boxing Gloves — detail' },
      { src: '/assets/products/aura-cream-boxing-gloves/gallery-03.webp', alt: 'AURA Cream Boxing Gloves — on pads' },
      { src: '/assets/products/aura-cream-boxing-gloves/gallery-04.webp', alt: 'AURA Cream Boxing Gloves — pad work' },
      { src: '/assets/products/aura-cream-boxing-gloves/gallery-05.webp', alt: 'AURA Cream Boxing Gloves — training' },
    ],
  },
  {
    slug: 'aura-sleeveless-hoodie', name: 'AURA Black Sleeveless Hoodie',
    category: 'Apparel', collection: 'Drop 001', status: 'waitlist', mediaStatus: 'live',
    shortDesc: 'Black heavyweight cotton. Cut for the gym. Worn for the culture.',
    description: "The AURA Black Sleeveless Hoodie is Drop 001's apparel anchor. Heavyweight black cotton fleece, dropped armhole, kangaroo pocket, tonal AURA logo.",
    details: ['100% heavyweight black cotton fleece','Tonal AURA embroidered chest logo','Dropped armhole for full range of motion','Kangaroo pocket','Available in S–XXL'],
    image:      '/assets/products/aura-sleeveless-hoodie/card-product.webp',
    hoverImage: '/assets/products/aura-sleeveless-hoodie/card-hover-model.webp',
    gallery: [
      { src: '/assets/products/aura-sleeveless-hoodie/gallery-01.webp', alt: 'AURA Black Sleeveless Hoodie — product' },
      { src: '/assets/products/aura-sleeveless-hoodie/gallery-02.webp', alt: 'AURA Black Sleeveless Hoodie — model front' },
      { src: '/assets/products/aura-sleeveless-hoodie/gallery-03.webp', alt: 'AURA Black Sleeveless Hoodie — dark studio' },
      { src: '/assets/products/aura-sleeveless-hoodie/gallery-05.webp', alt: 'AURA Black Sleeveless Hoodie — back detail' },
    ],
  },

  // ── DROP 001 — MISSING MEDIA ──────────────────────────────────────────
  { slug:'aura-sauna-suit',         name:'AURA Sauna Suit',            category:'Apparel',   collection:'Drop 001', status:'waitlist',    mediaStatus:'missing', shortDesc:'', description:'', details:[], image:null, hoverImage:null, gallery:[] },
  { slug:'aura-black-fight-club-tee',name:'AURA Black Fight Club Tee', category:'Apparel',   collection:'Drop 001', status:'waitlist',    mediaStatus:'missing', shortDesc:'', description:'', details:[], image:null, hoverImage:null, gallery:[] },
  { slug:'aura-black-shorts',       name:'AURA Black Training Shorts', category:'Apparel',   collection:'Drop 001', status:'waitlist',    mediaStatus:'missing', shortDesc:'Cut for the ring. Worn for the culture.', description:'AURA Black Training Shorts — satin finish, AURA waistband.', details:['Satin finish black','AURA embroidered waistband','S–XXL'], image:null, hoverImage:null, gallery:[] },
  { slug:'aura-cream-shorts',       name:'AURA Cream Training Shorts', category:'Apparel',   collection:'Drop 001', status:'waitlist',    mediaStatus:'missing', shortDesc:'Cream satin training short. Built for presence.', description:'AURA Cream Training Shorts — cream satin with black AURA waistband.', details:['Cream satin finish','AURA waistband','S–XXL'], image:null, hoverImage:null, gallery:[] },
  { slug:'aura-hand-wraps',         name:'AURA Hand Wraps',            category:'Equipment', collection:'Drop 001', status:'waitlist',    mediaStatus:'missing', shortDesc:'Mexican stretch wraps. 4.5m. Black and cream.', description:'AURA Hand Wraps — 4.5m Mexican stretch cotton. Velcro closure.', details:['4.5m Mexican stretch cotton','Velcro closure','Thumb loop'], image:null, hoverImage:null, gallery:[] },
  { slug:'aura-skipping-rope',      name:'AURA Skipping Rope',         category:'Equipment', collection:'Drop 001', status:'waitlist',    mediaStatus:'missing', shortDesc:'Speed rope. Gold cable. Aluminium handles.', description:'AURA Speed Rope — gold-plated cable, aluminium handles.', details:['Gold-plated steel cable','Aluminium handles','Adjustable length'], image:null, hoverImage:null, gallery:[] },
  { slug:'aura-mouthguard',         name:'AURA Mouthguard',            category:'Equipment', collection:'Drop 001', status:'waitlist',    mediaStatus:'missing', shortDesc:'Custom-fit mouthguard. Black and cream.', description:'AURA Mouthguard — boil-and-bite custom fit. High-impact EVA.', details:['Boil-and-bite','High-impact EVA','Carry case included'], image:null, hoverImage:null, gallery:[] },
  { slug:'aura-cream-hoodie',       name:'AURA Cream Hoodie',          category:'Apparel',   collection:'Drop 001', status:'waitlist',    mediaStatus:'missing', shortDesc:'Full-sleeve cream heavyweight hoodie.', description:'AURA Cream Hoodie — full sleeve heavyweight cotton fleece.', details:['Heavyweight cream cotton fleece','AURA chest logo','S–XXL'], image:null, hoverImage:null, gallery:[] },
  { slug:'aura-black-hoodie',       name:'AURA Black Hoodie',          category:'Apparel',   collection:'Drop 001', status:'waitlist',    mediaStatus:'missing', shortDesc:'Full-sleeve black heavyweight hoodie.', description:'AURA Black Hoodie — full sleeve heavyweight cotton fleece.', details:['Heavyweight black cotton fleece','AURA chest logo','S–XXL'], image:null, hoverImage:null, gallery:[] },
  { slug:'aura-cream-tee',          name:'AURA Cream Fight Club Tee',  category:'Apparel',   collection:'Drop 001', status:'waitlist',    mediaStatus:'missing', shortDesc:'Heavyweight cream cotton tee.', description:'AURA Cream Fight Club Tee — heavyweight cream cotton, AURA Fight Club chest print.', details:['Heavyweight cream cotton','AURA Fight Club chest print','S–XXL'], image:null, hoverImage:null, gallery:[] },
  { slug:'aura-black-track-jacket', name:'AURA Black Track Jacket',    category:'Apparel',   collection:'Drop 001', status:'waitlist',    mediaStatus:'missing', shortDesc:'Lightweight track jacket. Built for the session.', description:'AURA Black Track Jacket — lightweight nylon, AURA chest logo, full zip.', details:['Lightweight nylon','AURA chest embroidery','Full-length zip','S–XXL'], image:null, hoverImage:null, gallery:[] },
  { slug:'aura-cream-track-jacket', name:'AURA Cream Track Jacket',    category:'Apparel',   collection:'Drop 001', status:'waitlist',    mediaStatus:'missing', shortDesc:'Cream track jacket. Pre-session essential.', description:'AURA Cream Track Jacket — lightweight nylon, AURA logo, full zip.', details:['Lightweight nylon','Cream with black AURA logo','Full-length zip','S–XXL'], image:null, hoverImage:null, gallery:[] },

  // ── DROP 002 — FUTURE ─────────────────────────────────────────────────
  { slug:'aura-black-gloves',      name:'AURA Black Boxing Gloves',   category:'Equipment', collection:'Drop 002', status:'coming-soon', mediaStatus:'missing', shortDesc:'All-black leather gloves. Coming Drop 002.', description:'AURA Black Boxing Gloves — full-grain black leather, triple-layer foam. Drop 002.', details:['Full-grain black leather','Triple-layer foam','12oz and 16oz'], image:null, hoverImage:null, gallery:[] },
  { slug:'aura-black-fight-boots', name:'AURA Black Fight Boots',     category:'Footwear',  collection:'Drop 002', status:'coming-soon', mediaStatus:'missing', shortDesc:'Black leather fight boot. Coming Drop 002.', description:'AURA Black Fight Boots — full-grain black leather, AURA logo. Drop 002.', details:['Black leather upper','AURA logo','Non-slip rubber sole','UK 6–12'], image:null, hoverImage:null, gallery:[] },
];

// Public-facing: only confirmed live media
export const liveProducts = products.filter(p => p.mediaStatus === 'live');

// Lookup by slug
export function getProduct(slug) {
  return products.find(p => p.slug === slug) ?? null;
}
