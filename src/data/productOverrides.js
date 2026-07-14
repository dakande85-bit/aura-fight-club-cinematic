const ESSENTIAL_TEE_MEDIA = {
  front: 'https://cdn.shopify.com/s/files/1/1029/3339/7846/files/aura-boxing-essential-navy-front_df74721f-1951-4512-8355-c82b62e770ea.png?v=1784052972',
  model: 'https://cdn.shopify.com/s/files/1/1029/3339/7846/files/aura-boxing-essential-navy-model-hover_dc7a6fe0-bef6-4ebd-acb2-b044db599065.png?v=1784052972',
  back: 'https://cdn.shopify.com/s/files/1/1029/3339/7846/files/aura-boxing-essential-navy-back_f3ecc250-ce86-47b4-8584-16f7b52583a3.png?v=1784052972',
  detail: 'https://cdn.shopify.com/s/files/1/1029/3339/7846/files/aura-boxing-essential-navy-logo-detail_f1c8db0b-8904-455c-9cd4-250b567c0af9.png?v=1784052972',
  lifestyle: 'https://cdn.shopify.com/s/files/1/1029/3339/7846/files/aura-boxing-essential-navy-lifestyle_42de233a-54b8-42c8-b330-a89fb1a6203f.png?v=1784052972',
};

const PRODUCT_OVERRIDES = {
  'aura-fight-club-t-shirt': {
    title: 'AURA Boxing Essential Unisex T-Shirt',
    name: 'AURA Boxing Essential Unisex T-Shirt',
    shortDescription: 'Premium soft-cotton tee with navy and black colourways, a gold AURA chest mark, and AURA Fight Club back branding.',
    shortDesc: 'Premium soft-cotton tee with navy and black colourways, a gold AURA chest mark, and AURA Fight Club back branding.',
    description: 'A premium Bella + Canvas 3001 unisex T-shirt designed for training-camp downtime, travel, recovery, and everyday wear.',
    longDescription: 'The AURA Boxing Essential Unisex T-Shirt combines a clean athletic identity with the soft, lightweight feel of Airlume combed and ring-spun cotton. The side-seamed unisex cut is streamlined without feeling restrictive.',
    materialNote: 'Premium Bella + Canvas 3001 base garment. Airlume combed and ring-spun cotton, side-seamed construction, modern unisex retail fit. Available in Black and Navy, sizes S-5XL.',
    imageStatus: 'Ready',
    mockupNeeded: false,
    primaryImage: ESSENTIAL_TEE_MEDIA.front,
    image: ESSENTIAL_TEE_MEDIA.front,
    hoverImage: ESSENTIAL_TEE_MEDIA.model,
    imageAlt: 'AURA Boxing Essential Unisex T-Shirt in navy, front view',
    galleryImages: [
      ESSENTIAL_TEE_MEDIA.front,
      ESSENTIAL_TEE_MEDIA.model,
      ESSENTIAL_TEE_MEDIA.back,
      ESSENTIAL_TEE_MEDIA.detail,
      ESSENTIAL_TEE_MEDIA.lifestyle,
    ],
    gallery: [
      { src: ESSENTIAL_TEE_MEDIA.front, alt: 'AURA Boxing Essential Unisex T-Shirt in navy, front view' },
      { src: ESSENTIAL_TEE_MEDIA.model, alt: 'Male model wearing the AURA Boxing Essential navy unisex T-shirt' },
      { src: ESSENTIAL_TEE_MEDIA.back, alt: 'AURA Boxing Essential Unisex T-Shirt in navy, back view' },
      { src: ESSENTIAL_TEE_MEDIA.detail, alt: 'Close-up detail of the gold AURA emblem on the navy T-shirt' },
      { src: ESSENTIAL_TEE_MEDIA.lifestyle, alt: 'Boxer wearing the AURA Boxing Essential navy T-shirt in a boxing gym' },
    ],
  },
};

export function applyProductOverride(product) {
  if (!product) return product;
  const override = PRODUCT_OVERRIDES[product.slug];
  return override ? { ...product, ...override } : product;
}
