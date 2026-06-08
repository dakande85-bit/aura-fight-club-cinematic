/**
 * AURA Fight Club — Product Data  (Phase 1)
 * ──────────────────────────────────────────
 * All media paths point to /assets/products/[slug]/
 * Webp files generated from approved source images.
 *
 * mediaStatus rules:
 *   'live'    — card-product + card-hover-model + ≥3 gallery images confirmed
 *   'missing' — insufficient approved media, not shown publicly
 */

export const products = [
  // ── LIVE ──────────────────────────────────────────────────────────────
  {
    slug:        'aura-cream-fight-boots',
    name:        'AURA Cream Fight Boots',
    category:    'Footwear',
    collection:  'Drop 001',
    status:      'waitlist',
    mediaStatus: 'live',
    shortDesc:   'Lightweight training boot built for movement, grip, and presence.',
    description: 'The AURA Cream Fight Boot is the first footwear release from Drop 001. Designed for the gym floor and the pavement. Lightweight construction, non-slip sole, ankle support — engineered for boxing footwork and worn for the aesthetic.',
    details: [
      'Cream leather upper',
      'AURA logo at tongue and heel',
      'Non-slip rubber sole',
      'Reinforced ankle collar',
      'Available in sizes UK 6–12',
    ],
    image:      '/assets/products/aura-cream-fight-boots/card-product.webp',
    hoverImage: '/assets/products/aura-cream-fight-boots/card-hover-model.webp',
    gallery: [
      { src: '/assets/products/aura-cream-fight-boots/gallery-01.webp', alt: 'AURA Cream Fight Boots — product shot' },
      { src: '/assets/products/aura-cream-fight-boots/gallery-02.webp', alt: 'AURA Cream Fight Boots — high top' },
      { src: '/assets/products/aura-cream-fight-boots/gallery-03.webp', alt: 'AURA Cream Fight Boots — low top' },
      { src: '/assets/products/aura-cream-fight-boots/gallery-04.webp', alt: 'AURA Cream Fight Boots — model wearing' },
      { src: '/assets/products/aura-cream-fight-boots/gallery-05.webp', alt: 'AURA Cream Fight Boots — full outfit' },
    ],
  },

  {
    slug:        'aura-cream-boxing-gloves',
    name:        'AURA Cream Boxing Gloves',
    category:    'Equipment',
    collection:  'Drop 001',
    status:      'waitlist',
    mediaStatus: 'live',
    shortDesc:   'Premium cream leather gloves. 12oz and 16oz. Built for the work.',
    description: 'The AURA Cream Boxing Gloves are the centrepiece of Drop 001. Triple-layer foam padding, full-grain cream leather, chrome AURA detailing. Built for bag work, pads, and presence.',
    details: [
      'Full-grain cream leather',
      'Triple-layer foam padding',
      'Chrome AURA wordmark',
      'Hook-and-loop wrist closure',
      'Available in 12oz and 16oz',
    ],
    image:      '/assets/products/aura-cream-boxing-gloves/card-product.webp',
    hoverImage: '/assets/products/aura-cream-boxing-gloves/card-hover-model.webp',
    gallery: [
      { src: '/assets/products/aura-cream-boxing-gloves/gallery-01.webp', alt: 'AURA Cream Boxing Gloves — product' },
      { src: '/assets/products/aura-cream-boxing-gloves/gallery-02.webp', alt: 'AURA Cream Boxing Gloves — detail closeup' },
      { src: '/assets/products/aura-cream-boxing-gloves/gallery-03.webp', alt: 'AURA Cream Boxing Gloves — on pads' },
      { src: '/assets/products/aura-cream-boxing-gloves/gallery-04.webp', alt: 'AURA Cream Boxing Gloves — pad work' },
      { src: '/assets/products/aura-cream-boxing-gloves/gallery-05.webp', alt: 'AURA Cream Boxing Gloves — training' },
    ],
  },

  {
    slug:        'aura-sleeveless-hoodie',
    name:        'AURA Sleeveless Hoodie',
    category:    'Apparel',
    collection:  'Drop 001',
    status:      'waitlist',
    mediaStatus: 'live',
    shortDesc:   'Cream heavyweight cotton. Cut for the gym. Worn for the culture.',
    description: 'The AURA Sleeveless Hoodie is Drop 001\'s apparel anchor. Heavyweight cream cotton fleece, dropped armhole, kangaroo pocket, tonal AURA logo. Made to be worn over wraps, under a punchbag, and everywhere in between.',
    details: [
      '100% heavyweight cotton fleece',
      'Tonal AURA embroidered chest logo',
      'Dropped armhole for full range of motion',
      'Kangaroo pocket',
      'Available in S, M, L, XL, XXL',
    ],
    image:      '/assets/products/aura-sleeveless-hoodie/card-product.webp',
    hoverImage: '/assets/products/aura-sleeveless-hoodie/card-hover-model.webp',
    gallery: [
      { src: '/assets/products/aura-sleeveless-hoodie/gallery-01.webp', alt: 'AURA Sleeveless Hoodie — product' },
      { src: '/assets/products/aura-sleeveless-hoodie/gallery-02.webp', alt: 'AURA Sleeveless Hoodie — model front' },
      { src: '/assets/products/aura-sleeveless-hoodie/gallery-03.webp', alt: 'AURA Sleeveless Hoodie — dark studio' },
      { src: '/assets/products/aura-sleeveless-hoodie/gallery-04.webp', alt: 'AURA Sleeveless Hoodie — campaign' },
      { src: '/assets/products/aura-sleeveless-hoodie/gallery-05.webp', alt: 'AURA Sleeveless Hoodie — back detail' },
    ],
  },

  // ── MISSING MEDIA — not shown publicly ───────────────────────────────
  {
    slug:        'aura-sauna-suit',
    name:        'AURA Sauna Suit',
    category:    'Apparel',
    collection:  'Drop 001',
    status:      'waitlist',
    mediaStatus: 'missing',
    notes:       'No confirmed sauna suit images available. Needs dedicated shoot. tracksuit-set.png is a different product.',
    shortDesc:   '',
    description: '',
    details:     [],
    image:       null,
    hoverImage:  null,
    gallery:     [],
  },

  {
    slug:        'aura-black-fight-club-tee',
    name:        'AURA Black Fight Club Tee',
    category:    'Apparel',
    collection:  'Drop 001',
    status:      'waitlist',
    mediaStatus: 'missing',
    notes:       'Only 2 images available, no hover model shot confirmed as this specific tee. Needs shoot.',
    shortDesc:   '',
    description: '',
    details:     [],
    image:       null,
    hoverImage:  null,
    gallery:     [],
  },
];

// Public-facing: only products with full live media
export const liveProducts = products.filter(p => p.mediaStatus === 'live');

// Lookup by slug
export function getProduct(slug) {
  return products.find(p => p.slug === slug) ?? null;
}
