export const WATER_BOTTLE_MEDIA = {
  front: 'https://cdn.shopify.com/s/files/1/1029/3339/7846/files/aura-fight-club-17oz-water-bottle-white-front_f7adb5ce-12ff-41e4-834c-3bbf8d6efcdf.png?v=1784059249',
  model: 'https://cdn.shopify.com/s/files/1/1029/3339/7846/files/aura-fight-club-17oz-water-bottle-white-model-hover_f0c5f5bf-a738-42ec-80b9-466545a1af75.png?v=1784059250',
  angle: 'https://cdn.shopify.com/s/files/1/1029/3339/7846/files/aura-fight-club-17oz-water-bottle-white-angle_2d463e26-1d01-4028-a09f-70498ce64b6d.png?v=1784059249',
  detail: 'https://cdn.shopify.com/s/files/1/1029/3339/7846/files/aura-fight-club-17oz-water-bottle-white-detail_4816014d-e428-4113-9e53-defa78194dd3.png?v=1784059249',
  lifestyle: 'https://cdn.shopify.com/s/files/1/1029/3339/7846/files/aura-fight-club-17oz-water-bottle-white-lifestyle_21039555-02e7-4e73-9f7f-092e20bc99a8.png?v=1784059251',
};

export const WATER_BOTTLE_SLUGS = new Set([
  'aura-steel-water-bottle',
  'white-17oz-stainless-steel-water-bottle',
  'aura-fight-club-steel-water-bottle-white',
  'aura-fight-club-17oz-insulated-steel-water-bottle-white',
]);

export function makeWaterBottleProduct(slug = 'aura-steel-water-bottle') {
  return {
    slug,
    title: 'AURA Fight Club 17 oz Insulated Steel Water Bottle — White',
    name: 'AURA Fight Club 17 oz Insulated Steel Water Bottle — White',
    category: 'Equipment',
    department: 'Equipment',
    collection: 'Drop 001',
    status: 'available',
    mediaStatus: 'live',
    audience: 'Men & Women',
    shortDescription: 'Slim 17 oz double-wall insulated steel bottle in white with a metallic gold cap and gold AURA branding.',
    shortDesc: 'Slim 17 oz double-wall insulated steel bottle in white with a metallic gold cap and gold AURA branding.',
    description: 'A compact reusable stainless-steel bottle designed for boxing sessions, roadwork, travel and everyday hydration.',
    longDescription: 'The AURA Fight Club 17 oz Insulated Steel Water Bottle combines double-wall insulation with a slim gym-bag-friendly profile, white finish and metallic gold detailing.',
    materialNote: 'High-quality stainless steel with double-wall insulation. 17 oz capacity. Hand wash only; do not microwave.',
    details: ['17 oz', 'White / Metallic Gold', 'Produced on demand'],
    imageStatus: 'Ready',
    mockupNeeded: false,
    primaryImage: WATER_BOTTLE_MEDIA.front,
    image: WATER_BOTTLE_MEDIA.front,
    hoverImage: WATER_BOTTLE_MEDIA.model,
    imageAlt: 'AURA Fight Club 17 oz insulated steel water bottle in white with gold branding',
    galleryImages: [
      WATER_BOTTLE_MEDIA.front,
      WATER_BOTTLE_MEDIA.model,
      WATER_BOTTLE_MEDIA.angle,
      WATER_BOTTLE_MEDIA.detail,
      WATER_BOTTLE_MEDIA.lifestyle,
    ],
    gallery: [
      { src: WATER_BOTTLE_MEDIA.front, alt: 'AURA Fight Club 17 oz insulated steel water bottle in white with gold branding, front view' },
      { src: WATER_BOTTLE_MEDIA.model, alt: 'Boxer holding the AURA Fight Club white and gold insulated steel water bottle' },
      { src: WATER_BOTTLE_MEDIA.angle, alt: 'AURA Fight Club white insulated steel water bottle, angled product view' },
      { src: WATER_BOTTLE_MEDIA.detail, alt: 'Close-up of the metallic gold cap and gold AURA Fight Club branding' },
      { src: WATER_BOTTLE_MEDIA.lifestyle, alt: 'AURA Fight Club white and gold insulated steel water bottle in a boxing gym' },
    ],
  };
}
