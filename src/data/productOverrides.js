import { DUFFLE_SLUGS, makeDuffleProduct } from './duffleProduct.js';
import { WATER_BOTTLE_SLUGS, makeWaterBottleProduct } from './waterBottleProduct.js';

const ESSENTIAL_TEE_MEDIA = {
  front: 'https://cdn.shopify.com/s/files/1/1029/3339/7846/files/aura-boxing-essential-navy-front-v2_071fa5a7-76ef-482c-a14b-91590bdc6397.png?v=1784055124',
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
    primaryImage: ESSENTIAL_TEE_MEDIA.model,
    image: ESSENTIAL_TEE_MEDIA.model,
    hoverImage: ESSENTIAL_TEE_MEDIA.front,
    imageAlt: 'Male model wearing the AURA Boxing Essential navy unisex T-shirt',
    hoverImageAlt: 'AURA Boxing Essential Unisex T-Shirt in navy with gold chest emblem, front product view',
    galleryImages: [
      ESSENTIAL_TEE_MEDIA.model,
      ESSENTIAL_TEE_MEDIA.front,
      ESSENTIAL_TEE_MEDIA.back,
      ESSENTIAL_TEE_MEDIA.detail,
      ESSENTIAL_TEE_MEDIA.lifestyle,
    ],
    gallery: [
      { src: ESSENTIAL_TEE_MEDIA.model, alt: 'Male model wearing the AURA Boxing Essential navy unisex T-shirt' },
      { src: ESSENTIAL_TEE_MEDIA.front, alt: 'AURA Boxing Essential Unisex T-Shirt in navy with gold chest emblem, front view' },
      { src: ESSENTIAL_TEE_MEDIA.back, alt: 'AURA Boxing Essential Unisex T-Shirt in navy, back view' },
      { src: ESSENTIAL_TEE_MEDIA.detail, alt: 'Close-up detail of the gold AURA emblem on the navy T-shirt' },
      { src: ESSENTIAL_TEE_MEDIA.lifestyle, alt: 'Boxer wearing the AURA Boxing Essential navy T-shirt in a boxing gym' },
    ],
  },
};

function isDuffleSlug(slug) {
  const key = String(slug || '').toLowerCase();
  return DUFFLE_SLUGS.has(key) || (key.includes('duffle') && key.includes('white'));
}

function isWaterBottleSlug(slug) {
  const key = String(slug || '').toLowerCase();
  return WATER_BOTTLE_SLUGS.has(key)
    || (key.includes('water-bottle') && (key.includes('white') || key.includes('steel')));
}

function isWhiteDuffle(product) {
  if (!product) return false;
  if (isDuffleSlug(product.slug)) return true;
  const name = String(product.name || product.title || '').toLowerCase();
  return name.includes('duffle bag') && name.includes('white');
}

function isWhiteWaterBottle(product) {
  if (!product) return false;
  if (isWaterBottleSlug(product.slug)) return true;
  const name = String(product.name || product.title || '').toLowerCase();
  return name.includes('water bottle') && (name.includes('white') || name.includes('steel'));
}

export function getStandaloneProductOverride(slug) {
  if (isDuffleSlug(slug)) return makeDuffleProduct(slug);
  if (isWaterBottleSlug(slug)) return makeWaterBottleProduct(slug);
  return null;
}

export function applyProductOverride(product) {
  if (!product) return product;
  if (isWhiteDuffle(product)) return { ...product, ...makeDuffleProduct(product.slug) };
  if (isWhiteWaterBottle(product)) return { ...product, ...makeWaterBottleProduct(product.slug) };
  const override = PRODUCT_OVERRIDES[product.slug];
  return override ? { ...product, ...override } : product;
}
