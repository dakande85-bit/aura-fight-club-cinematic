export const DUFFLE_MEDIA = {
  front: 'https://cdn.shopify.com/s/files/1/1029/3339/7846/files/aura-duffle-white-front-v2_200e499f-7393-4e6c-98aa-0b0ea4fd5424.png?v=1784057337',
  model: 'https://cdn.shopify.com/s/files/1/1029/3339/7846/files/aura-duffle-white-model-hover-v2_19fd004e-3f82-4f67-b911-85ad803dc565.png?v=1784057338',
  side: 'https://cdn.shopify.com/s/files/1/1029/3339/7846/files/aura-duffle-white-side-v2_daf556de-ebef-4097-8a88-681a8f71e119.png?v=1784057337',
  detail: 'https://cdn.shopify.com/s/files/1/1029/3339/7846/files/aura-duffle-white-detail-v2_3157c340-b00a-432d-9204-bba09211e407.png?v=1784057339',
  lifestyle: 'https://cdn.shopify.com/s/files/1/1029/3339/7846/files/aura-duffle-white-lifestyle-v2_5814dc99-24e8-4bba-a9db-f6856e60276c.png?v=1784057338',
};

export const DUFFLE_SLUGS = new Set([
  'duffle-bag',
  'aura-fight-club-training-duffle-bag-white',
  'aura-training-duffle-bag-white',
]);

export function makeDuffleProduct(slug = 'duffle-bag') {
  return {
    slug,
    title: 'AURA Fight Club Training Duffle Bag — White',
    name: 'AURA Fight Club Training Duffle Bag — White',
    category: 'Equipment',
    department: 'Equipment',
    collection: 'Drop 001',
    status: 'available',
    mediaStatus: 'live',
    audience: 'Men & Women',
    shortDescription: 'Spacious white training duffle for boxing sessions, gym work, travel, and weekends away.',
    shortDesc: 'Spacious white training duffle for boxing sessions, gym work, travel, and weekends away.',
    description: 'A durable white AURA Fight Club training duffle with organised storage, padded carry handles, and a removable shoulder strap.',
    longDescription: 'Built for the full training day, with space for gloves, wraps, clothing, footwear, and everyday essentials.',
    materialNote: 'Durable polyester construction. Approximate dimensions: 22 × 11.5 × 11.5 inches. Spot clean and air dry.',
    details: ['White / Black', 'One Size', 'Produced on demand'],
    imageStatus: 'Ready',
    mockupNeeded: false,
    primaryImage: DUFFLE_MEDIA.front,
    image: DUFFLE_MEDIA.front,
    hoverImage: DUFFLE_MEDIA.model,
    imageAlt: 'AURA Fight Club Training Duffle Bag in white, front product view',
    galleryImages: [
      DUFFLE_MEDIA.front,
      DUFFLE_MEDIA.model,
      DUFFLE_MEDIA.side,
      DUFFLE_MEDIA.detail,
      DUFFLE_MEDIA.lifestyle,
    ],
    gallery: [
      { src: DUFFLE_MEDIA.front, alt: 'AURA Fight Club Training Duffle Bag in white, front product view' },
      { src: DUFFLE_MEDIA.model, alt: 'Boxer carrying the AURA Fight Club white training duffle bag' },
      { src: DUFFLE_MEDIA.side, alt: 'AURA Fight Club Training Duffle Bag in white, side and rear angle' },
      { src: DUFFLE_MEDIA.detail, alt: 'Close-up of the AURA white duffle bag zips, straps and material' },
      { src: DUFFLE_MEDIA.lifestyle, alt: 'AURA Fight Club white training duffle bag in a boxing gym' },
    ],
  };
}
