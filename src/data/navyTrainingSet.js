export const NAVY_TRAINING_MEDIA = {
  front: 'https://cdn.shopify.com/s/files/1/1029/3339/7846/files/aura-navy-training-set-front.png?v=1784062035',
  model: 'https://cdn.shopify.com/s/files/1/1029/3339/7846/files/aura-navy-training-set-model.png?v=1784062051',
  back: 'https://cdn.shopify.com/s/files/1/1029/3339/7846/files/aura-navy-training-set-back.png?v=1784062066',
  detail: 'https://cdn.shopify.com/s/files/1/1029/3339/7846/files/aura-navy-training-set-detail.png?v=1784062084',
  lifestyle: 'https://cdn.shopify.com/s/files/1/1029/3339/7846/files/aura-navy-training-set-lifestyle.png?v=1784062100',
};

const NAVY_TRAINING_GALLERY = [
  { src: NAVY_TRAINING_MEDIA.front, alt: 'AURA Fight Club Navy Training Set with hoodie and joggers, front product view' },
  { src: NAVY_TRAINING_MEDIA.model, alt: 'Male model wearing the AURA Fight Club Navy Training Hoodie and Joggers' },
  { src: NAVY_TRAINING_MEDIA.back, alt: 'AURA Fight Club Navy Training Hoodie and Joggers, back product view' },
  { src: NAVY_TRAINING_MEDIA.detail, alt: 'Close-up of the AURA gold chest emblem, jogger branding, drawstrings and navy fabric' },
  { src: NAVY_TRAINING_MEDIA.lifestyle, alt: 'Male athlete wearing the AURA Fight Club Navy Training Set in a boxing gym' },
];

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
  imageStatus: 'Ready',
  mockupNeeded: false,
  ctaLabel: 'Add to Cart',
  secondaryLabel: 'Drop 001 / Available to Order',
  purchaseOptions: PURCHASE_OPTIONS,
};

function productMedia() {
  return {
    primaryImage: NAVY_TRAINING_MEDIA.front,
    image: NAVY_TRAINING_MEDIA.front,
    hoverImage: NAVY_TRAINING_MEDIA.model,
    imageAlt: 'AURA Fight Club Navy Training Set with hoodie and joggers, front product view',
    hoverImageAlt: 'Male model wearing the AURA Fight Club Navy Training Hoodie and Joggers',
    galleryImages: NAVY_TRAINING_GALLERY.map((item) => item.src),
    gallery: NAVY_TRAINING_GALLERY,
  };
}

export function makeNavyTrainingSetProduct(slug = NAVY_TRAINING_SET_SLUG) {
  return {
    ...BASE_PRODUCT,
    ...productMedia(),
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
  };
}

export function makeNavyTrainingHoodieProduct(slug = 'aura-fight-club-hoodie') {
  return {
    ...BASE_PRODUCT,
    ...productMedia(),
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
  };
}

export function makeNavyTrainingJoggersProduct(slug = 'aura-fight-club-joggers') {
  return {
    ...BASE_PRODUCT,
    ...productMedia(),
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
  };
}
