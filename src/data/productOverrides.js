import { DUFFLE_SLUGS, makeDuffleProduct } from './duffleProduct.js';
import { WATER_BOTTLE_SLUGS, makeWaterBottleProduct } from './waterBottleProduct.js';
import {
  NAVY_TRAINING_SET_SLUG,
  NAVY_TRAINING_HOODIE_SLUGS,
  NAVY_TRAINING_JOGGERS_SLUGS,
  makeNavyTrainingSetProduct,
  makeNavyTrainingHoodieProduct,
  makeNavyTrainingJoggersProduct,
} from './navyTrainingSet.js';

const ESSENTIAL_TEE_MEDIA = {
  front: 'https://cdn.shopify.com/s/files/1/1029/3339/7846/files/aura-boxing-essential-navy-front-v2_071fa5a7-76ef-482c-a14b-91590bdc6397.png?v=1784055124',
  model: 'https://cdn.shopify.com/s/files/1/1029/3339/7846/files/aura-boxing-essential-navy-model-hover_dc7a6fe0-bef6-4ebd-acb2-b044db599065.png?v=1784052972',
  backModel: 'https://cdn.shopify.com/s/files/1/1029/3339/7846/files/aura-boxing-essential-navy-back-model-clean.png?v=1784061514',
  back: 'https://cdn.shopify.com/s/files/1/1029/3339/7846/files/aura-boxing-essential-navy-back_f3ecc250-ce86-47b4-8584-16f7b52583a3.png?v=1784052972',
  detail: 'https://cdn.shopify.com/s/files/1/1029/3339/7846/files/aura-boxing-essential-navy-logo-detail_f1c8db0b-8904-455c-9cd4-250b567c0af9.png?v=1784052972',
  lifestyle: 'https://cdn.shopify.com/s/files/1/1029/3339/7846/files/aura-boxing-essential-navy-lifestyle_42de233a-54b8-42c8-b330-a89fb1a6203f.png?v=1784052972',
};

const SLEEVELESS_HOODIE_MEDIA = {
  front: 'https://cdn.shopify.com/s/files/1/1029/3339/7846/files/aura-sleeveless-training-hoodie-black-front.png?v=1784072140',
  back: 'https://cdn.shopify.com/s/files/1/1029/3339/7846/files/aura-sleeveless-training-hoodie-black-back.png?v=1784072154',
};

const BLACK_TANK_MEDIA = {
  frontProduct: 'https://cdn.shopify.com/s/files/1/1029/3339/7846/files/aura-fight-club-training-tank-black-front-product.png?v=1784125865',
  frontModel: 'https://cdn.shopify.com/s/files/1/1029/3339/7846/files/aura-fight-club-training-tank-black-front-model.png?v=1784125885',
  backModel: 'https://cdn.shopify.com/s/files/1/1029/3339/7846/files/aura-fight-club-training-tank-black-back-model.png?v=1784125902',
  backProduct: 'https://cdn.shopify.com/s/files/1/1029/3339/7846/files/aura-fight-club-training-tank-black-back-product.png?v=1784125923',
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
    hoverImage: ESSENTIAL_TEE_MEDIA.backModel,
    imageAlt: 'Male model wearing the AURA Boxing Essential navy unisex T-shirt, front view',
    hoverImageAlt: 'Male model wearing the AURA Boxing Essential navy unisex T-shirt, back view with gold AURA Fight Club branding',
    galleryImages: [
      ESSENTIAL_TEE_MEDIA.model,
      ESSENTIAL_TEE_MEDIA.backModel,
      ESSENTIAL_TEE_MEDIA.front,
      ESSENTIAL_TEE_MEDIA.back,
      ESSENTIAL_TEE_MEDIA.detail,
      ESSENTIAL_TEE_MEDIA.lifestyle,
    ],
    gallery: [
      { src: ESSENTIAL_TEE_MEDIA.model, alt: 'Male model wearing the AURA Boxing Essential navy unisex T-shirt, front view' },
      { src: ESSENTIAL_TEE_MEDIA.backModel, alt: 'Male model wearing the AURA Boxing Essential navy unisex T-shirt, back view with gold AURA Fight Club branding' },
      { src: ESSENTIAL_TEE_MEDIA.front, alt: 'AURA Boxing Essential Unisex T-Shirt in navy with gold chest emblem, front view' },
      { src: ESSENTIAL_TEE_MEDIA.back, alt: 'AURA Boxing Essential Unisex T-Shirt in navy, back view' },
      { src: ESSENTIAL_TEE_MEDIA.detail, alt: 'Close-up detail of the gold AURA emblem on the navy T-shirt' },
      { src: ESSENTIAL_TEE_MEDIA.lifestyle, alt: 'Boxer wearing the AURA Boxing Essential navy T-shirt in a boxing gym' },
    ],
  },
  'aura-discipline-hoodie': {
    title: 'AURA Discipline Unisex Pullover Hoodie — Black',
    name: 'AURA Discipline Unisex Pullover Hoodie — Black',
    shortDescription: 'Black Bella + Canvas 3719 sponge-fleece hoodie with silver AURA Fight Club chest branding.',
    shortDesc: 'Black Bella + Canvas 3719 sponge-fleece hoodie with silver AURA Fight Club chest branding.',
    description: 'A clean black training-to-lifestyle hoodie for warm-ups, recovery, travel and everyday wear.',
    longDescription: 'The AURA Discipline Unisex Pullover Hoodie combines a soft sponge-fleece feel with a regular unisex fit, adjustable hood, kangaroo pocket and understated silver AURA Fight Club identity.',
    materialNote: 'Bella + Canvas 3719 unisex pullover hoodie. Soft sponge fleece, side-seamed construction, adjustable drawcord hood, front kangaroo pocket, ribbed cuffs and waistband. Black colourway, sizes S-2XL.',
    details: ['Bella + Canvas 3719', 'Black', 'Sizes S-2XL'],
    imageStatus: 'Ready — keep current campaign image as lead media',
    mockupNeeded: false,
  },
  'premium-unisex-tank-top-black': {
    title: 'AURA Fight Club Training Tank — Black',
    name: 'AURA Fight Club Training Tank — Black',
    shortDescription: 'Lightweight black unisex training tank with a compact A chest mark and AURA Fight Club back branding.',
    shortDesc: 'Lightweight black unisex training tank with a compact A chest mark and AURA Fight Club back branding.',
    description: 'A clean training tank for boxing sessions, conditioning, gym work and warm-weather movement.',
    longDescription: 'The AURA Fight Club Training Tank — Black combines a modern unisex athletic fit with a small A chest mark and AURA Fight Club identity across the back.',
    materialNote: 'Premium combed and ring-spun cotton jersey with a rounded neckline, modern unisex fit, compact A chest mark and AURA Fight Club back branding.',
    details: ['Black', 'Unisex', 'Sizes XS-2XL'],
    imageStatus: 'Approved four-image Shopify gallery live',
    mockupNeeded: false,
    primaryImage: BLACK_TANK_MEDIA.frontProduct,
    image: BLACK_TANK_MEDIA.frontProduct,
    hoverImage: BLACK_TANK_MEDIA.frontModel,
    imageAlt: 'AURA Fight Club Training Tank in black, front product view with small A chest logo',
    hoverImageAlt: 'Male model wearing the AURA Fight Club Training Tank in black, front view',
    galleryImages: [
      BLACK_TANK_MEDIA.frontProduct,
      BLACK_TANK_MEDIA.frontModel,
      BLACK_TANK_MEDIA.backModel,
      BLACK_TANK_MEDIA.backProduct,
    ],
    gallery: [
      { src: BLACK_TANK_MEDIA.frontProduct, alt: 'AURA Fight Club Training Tank in black, front product view with small A chest logo' },
      { src: BLACK_TANK_MEDIA.frontModel, alt: 'Male model wearing the AURA Fight Club Training Tank in black, front view' },
      { src: BLACK_TANK_MEDIA.backModel, alt: 'Male model wearing the AURA Fight Club Training Tank in black, back view with AURA Fight Club branding' },
      { src: BLACK_TANK_MEDIA.backProduct, alt: 'AURA Fight Club Training Tank in black, back product view with AURA Fight Club branding' },
    ],
  },
  'aura-sleeveless-training-hoodie': {
    title: 'AURA Sleeveless Training Hoodie — Pre-Order',
    name: 'AURA Sleeveless Training Hoodie — Pre-Order',
    shortDescription: 'Black made-to-order sleeveless training hoodie with a small A chest mark and AURA Fight Club back branding.',
    shortDesc: 'Black made-to-order sleeveless training hoodie with a small A chest mark and AURA Fight Club back branding.',
    description: 'A streamlined sleeveless layer for boxing warm-ups, strength work, travel, and unrestricted movement.',
    longDescription: 'The AURA Sleeveless Training Hoodie uses a clean black zip-front silhouette, open armholes, a compact A chest mark, and the AURA Fight Club wordmark across the back.',
    materialNote: 'Black sleeveless hooded training layer with full front zip, open armholes, small A chest mark, and AURA Fight Club back branding. Made to order with an estimated 5–7 week delivery window.',
    details: ['Black', 'Sizes S-XXL', 'Made to order / estimated 5–7 weeks'],
    imageStatus: 'Ready',
    mockupNeeded: false,
    primaryImage: SLEEVELESS_HOODIE_MEDIA.front,
    image: SLEEVELESS_HOODIE_MEDIA.front,
    hoverImage: SLEEVELESS_HOODIE_MEDIA.back,
    imageAlt: 'AURA Sleeveless Training Hoodie in black, front product view with small A chest logo',
    hoverImageAlt: 'AURA Sleeveless Training Hoodie in black, back product view with AURA Fight Club branding',
    galleryImages: [
      SLEEVELESS_HOODIE_MEDIA.front,
      SLEEVELESS_HOODIE_MEDIA.back,
    ],
    gallery: [
      { src: SLEEVELESS_HOODIE_MEDIA.front, alt: 'AURA Sleeveless Training Hoodie in black, front product view with small A chest logo' },
      { src: SLEEVELESS_HOODIE_MEDIA.back, alt: 'AURA Sleeveless Training Hoodie in black, back product view with AURA Fight Club branding' },
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

function isNavyTrainingSetSlug(slug) {
  return String(slug || '').toLowerCase() === NAVY_TRAINING_SET_SLUG;
}

function isNavyTrainingHoodieSlug(slug) {
  return NAVY_TRAINING_HOODIE_SLUGS.has(String(slug || '').toLowerCase());
}

function isNavyTrainingJoggersSlug(slug) {
  return NAVY_TRAINING_JOGGERS_SLUGS.has(String(slug || '').toLowerCase());
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

function isNavyTrainingHoodie(product) {
  if (!product) return false;
  if (isNavyTrainingHoodieSlug(product.slug)) return true;
  const name = String(product.name || product.title || '').toLowerCase();
  return name.includes('navy training hoodie');
}

function isNavyTrainingJoggers(product) {
  if (!product) return false;
  if (isNavyTrainingJoggersSlug(product.slug)) return true;
  const name = String(product.name || product.title || '').toLowerCase();
  return name.includes('navy training jogger');
}

export function getStandaloneProductOverride(slug) {
  if (isDuffleSlug(slug)) return makeDuffleProduct(slug);
  if (isWaterBottleSlug(slug)) return makeWaterBottleProduct(slug);
  if (isNavyTrainingSetSlug(slug)) return makeNavyTrainingSetProduct(slug);
  if (isNavyTrainingHoodieSlug(slug)) return makeNavyTrainingHoodieProduct(slug);
  if (isNavyTrainingJoggersSlug(slug)) return makeNavyTrainingJoggersProduct(slug);
  return null;
}

export function applyProductOverride(product) {
  if (!product) return product;
  if (isWhiteDuffle(product)) return { ...product, ...makeDuffleProduct(product.slug) };
  if (isWhiteWaterBottle(product)) return { ...product, ...makeWaterBottleProduct(product.slug) };
  if (isNavyTrainingHoodie(product)) return { ...product, ...makeNavyTrainingHoodieProduct(product.slug) };
  if (isNavyTrainingJoggers(product)) return { ...product, ...makeNavyTrainingJoggersProduct(product.slug) };
  const override = PRODUCT_OVERRIDES[product.slug];
  return override ? { ...product, ...override } : product;
}
