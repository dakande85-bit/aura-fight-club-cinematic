export const NAVY_TRAINING_MEDIA = {
  hoodie: 'https://cdn.shopify.com/s/files/1/1029/3339/7846/files/91761ddd-46bd-409a-814c-0564ac2013ba.webp?v=1784024205',
  joggers: 'https://cdn.shopify.com/s/files/1/1029/3339/7846/files/196e9d9b-62c7-4754-a165-8904d57e4dca.webp?v=1784029769',
};

export const NAVY_TRAINING_SET_SLUG = 'aura-navy-training-set';

export const NAVY_TRAINING_HOODIE_SLUGS = new Set([
  'aura-fight-club-hoodie',
  'unisex-pullover-hoodie-bella-canvas-3719-navy',
  'aura-fight-club-navy-training-hoodie',
]);

export const NAVY_TRAINING_JOGGERS_SLUGS = new Set([
  'aura-fight-club-joggers',
  'unisex-jogging-pants-with-organic-cotton-in-conversion-and-recycled-polyester-sols-jumbo-03810-french-navy',
  'aura-fight-club-navy-training-joggers',
]);

const PURCHASE_OPTIONS = [
  { label: 'Full Navy Training Set', slug: NAVY_TRAINING_SET_SLUG, priceEUR: 110.30 },
  { label: 'Navy Training Hoodie Only', slug: 'aura-fight-club-hoodie', priceEUR: 60 },
  { label: 'Navy Training Joggers Only', slug: 'aura-fight-club-joggers', priceEUR: 50.30 },
];

const BASE_PRODUCT = {
  department: 'Apparel',
  collection: 'Drop 001',
  drop: 'Drop 001',
  status: 'available',
  mediaStatus: 'live',
  audience: 'Men & Women',
  fulfilment: 'AURA Checkout',
  podCandidate: true,
  imageStatus: 'Supplier imagery — replacement pending',
  mockupNeeded: true,
  ctaLabel: 'Add to Cart',
  secondaryLabel: 'Drop 001 / Available to Order',
  purchaseOptions: PURCHASE_OPTIONS,
};

export function makeNavyTrainingSetProduct(slug = NAVY_TRAINING_SET_SLUG) {
  return {
    ...BASE_PRODUCT,
    slug,
    title: 'AURA Fight Club Navy Training Set',
    name: 'AURA Fight Club Navy Training Set',
    category: 'Training Set',
    shortDescription: 'Coordinated French navy hoodie and joggers for training, recovery, travel and everyday wear.',
    shortDesc: 'Coordinated French navy hoodie and joggers for training, recovery, travel and everyday wear.',
    description: 'The complete AURA Navy Training Set pairs the soft sponge-fleece pullover hoodie with brushed-fleece training joggers.',
    longDescription: 'Designed as one training-to-lifestyle uniform, the AURA Navy Training Set can be ordered together or purchased as separate hoodie and jogger pieces.',
    materialNote: 'Hoodie: Bella + Canvas 3719 sponge fleece. Joggers: SOL’S Jumbo 03810 organic cotton in conversion and recycled polyester. French navy colourway. Produced on demand.',
    details: ['Hoodie + Joggers', 'French Navy', 'Produced on demand'],
    primaryImage: NAVY_TRAINING_MEDIA.hoodie,
    image: NAVY_TRAINING_MEDIA.hoodie,
    hoverImage: NAVY_TRAINING_MEDIA.joggers,
    imageAlt: 'AURA Fight Club Navy Training Hoodie supplier product preview',
    hoverImageAlt: 'AURA Fight Club Navy Training Joggers supplier product preview',
    galleryImages: [NAVY_TRAINING_MEDIA.hoodie, NAVY_TRAINING_MEDIA.joggers],
    gallery: [
      { src: NAVY_TRAINING_MEDIA.hoodie, alt: 'AURA Fight Club Navy Training Hoodie supplier product preview' },
      { src: NAVY_TRAINING_MEDIA.joggers, alt: 'AURA Fight Club Navy Training Joggers supplier product preview' },
    ],
  };
}

export function makeNavyTrainingHoodieProduct(slug = 'aura-fight-club-hoodie') {
  return {
    ...BASE_PRODUCT,
    slug,
    title: 'AURA Fight Club Navy Training Hoodie',
    name: 'AURA Fight Club Navy Training Hoodie',
    category: 'Hoodie',
    shortDescription: 'Soft French navy sponge-fleece hoodie, available separately or as part of the Navy Training Set.',
    shortDesc: 'Soft French navy sponge-fleece hoodie, available separately or as part of the Navy Training Set.',
    description: 'A relaxed unisex pullover for warm-ups, recovery, travel and everyday wear.',
    longDescription: 'The upper half of the AURA Navy Training Set, built with soft sponge fleece, a drawstring hood and kangaroo pocket.',
    materialNote: 'Bella + Canvas 3719 unisex sponge-fleece pullover hoodie. French navy. Sizes S-L currently available through the connected Shopify product.',
    details: ['Bella + Canvas 3719', 'French Navy', 'Available separately'],
    primaryImage: NAVY_TRAINING_MEDIA.hoodie,
    image: NAVY_TRAINING_MEDIA.hoodie,
    imageAlt: 'AURA Fight Club Navy Training Hoodie supplier product preview',
    galleryImages: [NAVY_TRAINING_MEDIA.hoodie],
    gallery: [
      { src: NAVY_TRAINING_MEDIA.hoodie, alt: 'AURA Fight Club Navy Training Hoodie supplier product preview' },
    ],
  };
}

export function makeNavyTrainingJoggersProduct(slug = 'aura-fight-club-joggers') {
  return {
    ...BASE_PRODUCT,
    slug,
    title: 'AURA Fight Club Navy Training Joggers',
    name: 'AURA Fight Club Navy Training Joggers',
    category: 'Joggers',
    shortDescription: 'French navy brushed-fleece joggers, available separately or as part of the Navy Training Set.',
    shortDesc: 'French navy brushed-fleece joggers, available separately or as part of the Navy Training Set.',
    description: 'Clean unisex training joggers for movement, recovery, travel and daily wear.',
    longDescription: 'The lower half of the AURA Navy Training Set, combining a brushed-fleece interior with an elasticated waist and cuffed ankles.',
    materialNote: 'SOL’S Jumbo 03810. Organic cotton in conversion and recycled polyester. French navy. The connected Shopify product currently requires final size confirmation.',
    details: ['SOL’S Jumbo 03810', 'French Navy', 'Available separately'],
    primaryImage: NAVY_TRAINING_MEDIA.joggers,
    image: NAVY_TRAINING_MEDIA.joggers,
    imageAlt: 'AURA Fight Club Navy Training Joggers supplier product preview',
    galleryImages: [NAVY_TRAINING_MEDIA.joggers],
    gallery: [
      { src: NAVY_TRAINING_MEDIA.joggers, alt: 'AURA Fight Club Navy Training Joggers supplier product preview' },
    ],
  };
}
