/**
 * AURA Fight Club product catalogue.
 * Local fallback mirrors the public product structure while supplier-built
 * concepts stay outside Drop 001 until samples and QC are approved.
 */

export const products = [
  {
    slug: 'aura-cream-fight-boots',
    name: 'AURA Cream Fight Boots',
    category: 'Footwear',
    collection: 'Drop 002',
    status: 'coming-soon',
    mediaStatus: 'live',
    shortDesc: 'Drop 002 candidate. Supplier sample required.',
    description: 'The AURA Cream Fight Boot is a Drop 002 candidate. It stays in supplier development until samples, fit, materials, and production quality meet the AURA standard.',
    details: ['Supplier sample required', 'Fit approval required', 'Not part of Drop 001'],
    image: '/assets/products/aura-cream-fight-boots/card-product.webp',
    hoverImage: '/assets/products/aura-cream-fight-boots/card-hover-model.webp',
    gallery: [
      { src: '/assets/products/aura-cream-fight-boots/gallery-01.webp', alt: 'AURA Cream Fight Boots product shot' },
      { src: '/assets/products/aura-cream-fight-boots/gallery-02.webp', alt: 'AURA Cream Fight Boots high top detail' },
      { src: '/assets/products/aura-cream-fight-boots/gallery-03.webp', alt: 'AURA Cream Fight Boots studio angle' },
      { src: '/assets/products/aura-cream-fight-boots/gallery-04.webp', alt: 'AURA Cream Fight Boots model wearing' },
      { src: '/assets/products/aura-cream-fight-boots/gallery-05.webp', alt: 'AURA Cream Fight Boots full outfit' },
    ],
  },
  {
    slug: 'aura-cream-boxing-gloves',
    name: 'AURA Cream Boxing Gloves',
    category: 'Equipment',
    collection: 'Drop 002',
    status: 'coming-soon',
    mediaStatus: 'live',
    shortDesc: 'Drop 002 equipment candidate. Quality testing required.',
    description: 'The AURA Cream Boxing Gloves are supplier-built equipment candidates for Drop 002. They are not live until samples and quality checks are approved.',
    details: ['Supplier shortlist', 'Quality testing required', 'Not part of Drop 001'],
    image: '/assets/products/aura-cream-boxing-gloves/card-product.webp',
    hoverImage: '/assets/products/aura-cream-boxing-gloves/card-hover-model.webp',
    gallery: [
      { src: '/assets/products/aura-cream-boxing-gloves/gallery-01.webp', alt: 'AURA Cream Boxing Gloves product' },
      { src: '/assets/products/aura-cream-boxing-gloves/gallery-02.webp', alt: 'AURA Cream Boxing Gloves detail' },
      { src: '/assets/products/aura-cream-boxing-gloves/gallery-03.webp', alt: 'AURA Cream Boxing Gloves on pads' },
      { src: '/assets/products/aura-cream-boxing-gloves/gallery-04.webp', alt: 'AURA Cream Boxing Gloves pad work' },
      { src: '/assets/products/aura-cream-boxing-gloves/gallery-05.webp', alt: 'AURA Cream Boxing Gloves training' },
    ],
  },
  {
    slug: 'aura-sleeveless-hoodie',
    name: 'AURA Black Sleeveless Hoodie',
    category: 'Apparel',
    collection: 'Drop 002',
    status: 'coming-soon',
    mediaStatus: 'live',
    shortDesc: 'Sleeveless training layer. Supplier sample required.',
    description: 'The AURA Black Sleeveless Hoodie remains a future apparel candidate. It is not part of the confirmed Drop 001 POD launch.',
    details: ['Supplier sample required', 'Fit approval required', 'Not part of Drop 001'],
    image: '/assets/products/aura-sleeveless-hoodie/card-product.webp',
    hoverImage: '/assets/products/aura-sleeveless-hoodie/card-hover-model.webp',
    gallery: [
      { src: '/assets/products/aura-sleeveless-hoodie/gallery-01.webp', alt: 'AURA Black Sleeveless Hoodie product' },
      { src: '/assets/products/aura-sleeveless-hoodie/gallery-02.webp', alt: 'AURA Black Sleeveless Hoodie model front' },
      { src: '/assets/products/aura-sleeveless-hoodie/gallery-03.webp', alt: 'AURA Black Sleeveless Hoodie dark studio' },
      { src: '/assets/products/aura-sleeveless-hoodie/gallery-05.webp', alt: 'AURA Black Sleeveless Hoodie back detail' },
    ],
  },

  // Drop 001 POD / waitlist candidates.
  { slug: 'aura-black-fight-club-tee', name: 'AURA Black Fight Club Tee', category: 'Apparel', collection: 'Drop 001', status: 'waitlist', mediaStatus: 'missing', shortDesc: 'T-shirt. POD candidate.', description: 'AURA Black Fight Club Tee - Drop 001 POD candidate.', details: ['T-Shirt', 'Men & Women', 'Gelato / Printful / TBD'], image: null, hoverImage: null, gallery: [] },
  { slug: 'aura-cream-tee', name: 'AURA Cream Fight Club Tee', category: 'Apparel', collection: 'Drop 001', status: 'waitlist', mediaStatus: 'missing', shortDesc: 'T-shirt. POD candidate.', description: 'AURA Cream Fight Club Tee - Drop 001 POD candidate.', details: ['T-Shirt', 'Men & Women', 'Gelato / Printful / TBD'], image: null, hoverImage: null, gallery: [] },
  { slug: 'aura-cream-hoodie', name: 'AURA Cream Hoodie', category: 'Apparel', collection: 'Drop 001', status: 'waitlist', mediaStatus: 'missing', shortDesc: 'Hoodie. POD candidate.', description: 'AURA Cream Hoodie - Drop 001 POD candidate.', details: ['Hoodie', 'Men & Women', 'Gelato / Printful / TBD'], image: null, hoverImage: null, gallery: [] },
  { slug: 'aura-black-hoodie', name: 'AURA Black Hoodie', category: 'Apparel', collection: 'Drop 001', status: 'waitlist', mediaStatus: 'missing', shortDesc: 'Hoodie. POD candidate.', description: 'AURA Black Hoodie - Drop 001 POD candidate.', details: ['Hoodie', 'Men & Women', 'Gelato / Printful / TBD'], image: null, hoverImage: null, gallery: [] },

  // Drop 002 / future supplier-built candidates.
  { slug: 'aura-sauna-suit', name: 'AURA Sauna Suit', category: 'Apparel', collection: 'Drop 002', status: 'coming-soon', mediaStatus: 'missing', shortDesc: 'Supplier sample required.', description: 'AURA Sauna Suit - Drop 002 candidate. Supplier sample required before launch.', details: ['Supplier shortlist', 'Sample required', 'Not part of Drop 001'], image: null, hoverImage: null, gallery: [] },
  { slug: 'aura-black-shorts', name: 'AURA Black Training Shorts', category: 'Apparel', collection: 'Drop 002', status: 'coming-soon', mediaStatus: 'missing', shortDesc: 'Future supplier-built fightwear candidate.', description: 'AURA Black Training Shorts - Drop 002 candidate.', details: ['Supplier sample required', 'Not part of Drop 001'], image: null, hoverImage: null, gallery: [] },
  { slug: 'aura-cream-shorts', name: 'AURA Cream Training Shorts', category: 'Apparel', collection: 'Drop 002', status: 'coming-soon', mediaStatus: 'missing', shortDesc: 'Future supplier-built fightwear candidate.', description: 'AURA Cream Training Shorts - Drop 002 candidate.', details: ['Supplier sample required', 'Not part of Drop 001'], image: null, hoverImage: null, gallery: [] },
  { slug: 'aura-hand-wraps', name: 'AURA Hand Wraps', category: 'Equipment', collection: 'Drop 002', status: 'coming-soon', mediaStatus: 'missing', shortDesc: 'Supplier quote needed. Sample required.', description: 'AURA Hand Wraps - Drop 002 equipment candidate.', details: ['Supplier quote needed', 'Sample required', 'Not part of Drop 001'], image: null, hoverImage: null, gallery: [] },
  { slug: 'aura-skipping-rope', name: 'AURA Skipping Rope', category: 'Equipment', collection: 'Drop 002', status: 'coming-soon', mediaStatus: 'missing', shortDesc: 'Future equipment candidate.', description: 'AURA Speed Rope - Drop 002 equipment candidate.', details: ['Supplier sample required', 'Not part of Drop 001'], image: null, hoverImage: null, gallery: [] },
  { slug: 'aura-mouthguard', name: 'AURA Mouthguard', category: 'Equipment', collection: 'Drop 002', status: 'coming-soon', mediaStatus: 'missing', shortDesc: 'Future equipment candidate.', description: 'AURA Mouthguard - Drop 002 equipment candidate.', details: ['Supplier sample required', 'Not part of Drop 001'], image: null, hoverImage: null, gallery: [] },
  { slug: 'aura-black-track-jacket', name: 'AURA Black Track Jacket', category: 'Apparel', collection: 'Drop 002', status: 'coming-soon', mediaStatus: 'missing', shortDesc: 'Premium tracksuit candidate. Fabric sample required.', description: 'AURA Black Track Jacket - premium tracksuit candidate for Drop 002.', details: ['Fabric sample required', 'Supplier research', 'Not part of Drop 001'], image: null, hoverImage: null, gallery: [] },
  { slug: 'aura-cream-track-jacket', name: 'AURA Cream Track Jacket', category: 'Apparel', collection: 'Drop 002', status: 'coming-soon', mediaStatus: 'missing', shortDesc: 'Premium tracksuit candidate. Fabric sample required.', description: 'AURA Cream Track Jacket - premium tracksuit candidate for Drop 002.', details: ['Fabric sample required', 'Supplier research', 'Not part of Drop 001'], image: null, hoverImage: null, gallery: [] },
  { slug: 'aura-black-gloves', name: 'AURA Black Boxing Gloves', category: 'Equipment', collection: 'Drop 002', status: 'coming-soon', mediaStatus: 'missing', shortDesc: 'All-black gloves. Quality testing required.', description: 'AURA Black Boxing Gloves - Drop 002 candidate.', details: ['Supplier shortlist', 'Quality testing required', 'Not part of Drop 001'], image: null, hoverImage: null, gallery: [] },
  { slug: 'aura-black-fight-boots', name: 'AURA Black Fight Boots', category: 'Footwear', collection: 'Drop 002', status: 'coming-soon', mediaStatus: 'missing', shortDesc: 'Black fight boot. Sample required.', description: 'AURA Black Fight Boots - Drop 002 candidate.', details: ['Supplier research', 'Sample required', 'Not part of Drop 001'], image: null, hoverImage: null, gallery: [] },
];

export const dropOneCategories = [
  'T-Shirts',
  'Hoodies',
  'Steel Water Bottles',
  'Joggers',
  'Tank Tops',
];

export const dropOneProducts = [
  { name: 'AURA Fight Club T-Shirt', category: 'T-Shirt', audience: 'Men & Women', status: 'Coming Soon / Waitlist', fulfilment: 'Gelato / Printful / TBD' },
  { name: 'AURA Shadow Boxer T-Shirt', category: 'T-Shirt', audience: 'Men & Women', status: 'Coming Soon / Waitlist', fulfilment: 'Gelato / Printful / TBD' },
  { name: 'AURA Fight Club Hoodie', category: 'Hoodie', audience: 'Men & Women', status: 'Coming Soon / Waitlist', fulfilment: 'Gelato / Printful / TBD' },
  { name: 'AURA Discipline Hoodie', category: 'Hoodie', audience: 'Men & Women', status: 'Coming Soon / Waitlist', fulfilment: 'Gelato / Printful / TBD' },
  { name: 'AURA Steel Water Bottle', category: 'Steel Water Bottle', audience: 'Men & Women', status: 'Coming Soon / Waitlist', fulfilment: 'Gelato / Printful / TBD' },
  { name: 'AURA Fight Club Joggers', category: 'Joggers', audience: 'Men & Women', status: 'Coming Soon / Waitlist', fulfilment: 'Gelato / Printful / TBD' },
  { name: 'AURA Training Tank Top', category: 'Tank Top', audience: 'Men & Women', status: 'Coming Soon / Waitlist', fulfilment: 'Gelato / Printful / TBD' },
];

export const dropOnePipeline = [
  { product: 'T-Shirts', drop: 'Drop 001', stage: 'POD Candidate', status: 'Waitlist opening' },
  { product: 'Hoodies', drop: 'Drop 001', stage: 'POD Candidate', status: 'Waitlist opening' },
  { product: 'Steel Water Bottle', drop: 'Drop 001', stage: 'POD Candidate', status: 'Waitlist opening' },
  { product: 'Joggers', drop: 'Drop 001', stage: 'POD Candidate', status: 'Waitlist opening' },
  { product: 'Tank Tops', drop: 'Drop 001', stage: 'POD Candidate', status: 'Waitlist opening' },
];

export const dropTwoPipeline = [
  { product: 'Boxing-style shoes', drop: 'Drop 002', stage: 'Supplier research', status: 'Sample required' },
  { product: 'Wrestling high-top trainer', drop: 'Drop 002', stage: 'Supplier research', status: 'Sample required' },
  { product: 'Sauna suit', drop: 'Drop 002', stage: 'Supplier shortlist', status: 'Sample required' },
  { product: 'Boxing gloves', drop: 'Drop 002', stage: 'Supplier shortlist', status: 'Quality testing required' },
  { product: 'Hand wraps', drop: 'Drop 002', stage: 'Supplier quote needed', status: 'Sample required' },
  { product: 'Fight bag', drop: 'Drop 002', stage: 'Design phase', status: 'Supplier quote needed' },
  { product: 'Premium tracksuit', drop: 'Drop 002', stage: 'Supplier research', status: 'Fabric sample required' },
  { product: 'Compression/performance wear', drop: 'Drop 002', stage: 'Supplier research', status: 'Fabric and fit sample required' },
];

export const futureProductSlugs = new Set([
  'aura-cream-fight-boots',
  'aura-cream-boxing-gloves',
  'aura-sleeveless-hoodie',
  'aura-sauna-suit',
  'aura-black-shorts',
  'aura-cream-shorts',
  'aura-hand-wraps',
  'aura-skipping-rope',
  'aura-mouthguard',
  'aura-black-track-jacket',
  'aura-cream-track-jacket',
  'aura-black-gloves',
  'aura-black-fight-boots',
]);

// Public-facing: only confirmed live media, with supplier concepts relabelled as future.
export const liveProducts = products.filter((product) => product.mediaStatus === 'live');

export function getProduct(slug) {
  return products.find((product) => product.slug === slug) ?? null;
}
