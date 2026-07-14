import {
  makeNavyTrainingSetProduct,
  makeNavyTrainingHoodieProduct,
  makeNavyTrainingJoggersProduct,
} from './navyTrainingSet.js';
import { makeDuffleProduct } from './duffleProduct.js';
import { makeWaterBottleProduct } from './waterBottleProduct.js';

const TEE_MEDIA = {
  front: 'https://cdn.shopify.com/s/files/1/1029/3339/7846/files/aura-boxing-essential-navy-front-v2_071fa5a7-76ef-482c-a14b-91590bdc6397.png?v=1784055124',
  model: 'https://cdn.shopify.com/s/files/1/1029/3339/7846/files/aura-boxing-essential-navy-model-hover_dc7a6fe0-bef6-4ebd-acb2-b044db599065.png?v=1784052972',
  backModel: 'https://cdn.shopify.com/s/files/1/1029/3339/7846/files/aura-boxing-essential-navy-back-model-clean.png?v=1784061514',
  back: 'https://cdn.shopify.com/s/files/1/1029/3339/7846/files/aura-boxing-essential-navy-back_f3ecc250-ce86-47b4-8584-16f7b52583a3.png?v=1784052972',
  detail: 'https://cdn.shopify.com/s/files/1/1029/3339/7846/files/aura-boxing-essential-navy-logo-detail_f1c8db0b-8904-455c-9cd4-250b567c0af9.png?v=1784052972',
  lifestyle: 'https://cdn.shopify.com/s/files/1/1029/3339/7846/files/aura-boxing-essential-navy-lifestyle_42de233a-54b8-42c8-b330-a89fb1a6203f.png?v=1784052972',
};

const VARSITY_MEDIA = {
  front: 'https://cdn.shopify.com/s/files/1/1029/3339/7846/files/aura-fight-club-varsity-bomber-front_423b6374-e987-4c50-bc11-29cbe39a7d51.png?v=1784072195',
  back: 'https://cdn.shopify.com/s/files/1/1029/3339/7846/files/aura-fight-club-varsity-bomber-back_43f504b6-944d-41c9-bf56-f2852e57d718.png?v=1784072195',
  modelFront: 'https://cdn.shopify.com/s/files/1/1029/3339/7846/files/aura-fight-club-varsity-bomber-model-front_2a5371d2-72b5-4190-aa4d-cd50d19dcb42.png?v=1784072195',
  modelBack: 'https://cdn.shopify.com/s/files/1/1029/3339/7846/files/aura-fight-club-varsity-bomber-model-back_82bd3186-daca-42c1-9654-d1a68ffe48af.png?v=1784072195',
  detail: 'https://cdn.shopify.com/s/files/1/1029/3339/7846/files/aura-fight-club-varsity-bomber-detail_a64b6f5e-79aa-4404-80e3-24c793f5abc4.png?v=1784072195',
};

const makeProduct = ({
  slug,
  title,
  category,
  department = 'Apparel',
  description,
  materialNote,
  image = null,
  hoverImage = null,
  gallery = null,
  preorder = false,
  audience = 'Men & Women',
  imageStatus = image ? 'Shopify image live' : 'Awaiting approved product imagery',
  details = [],
}) => {
  const resolvedGallery = gallery || (image ? [{ src: image, alt: `${title} product image` }] : []);
  return {
    slug,
    title,
    name: title,
    category,
    department,
    audience,
    drop: preorder ? 'Pre-Order' : 'Drop 001',
    collection: preorder ? 'Pre-Order' : 'Drop 001',
    status: preorder ? 'preorder' : 'available',
    fulfilment: preorder ? 'Made to Order' : 'AURA Checkout',
    podCandidate: !preorder,
    shortDescription: description,
    shortDesc: description,
    description,
    longDescription: description,
    materialNote,
    details,
    imageStatus,
    mockupNeeded: !image,
    primaryImage: image,
    image,
    hoverImage,
    imageAlt: image ? `${title} product image` : `${title} imagery pending`,
    hoverImageAlt: hoverImage ? `${title} alternate view` : undefined,
    galleryImages: resolvedGallery.map((item) => item.src),
    gallery: resolvedGallery,
    ctaLabel: preorder ? 'Pre-Order' : 'Add to Cart',
    secondaryLabel: preorder
      ? 'Made to order / estimated 5-7 weeks'
      : 'Drop 001 / Available to Order',
  };
};

const navySet = makeNavyTrainingSetProduct();
const navyHoodie = makeNavyTrainingHoodieProduct('aura-fight-club-hoodie');
const navyJoggers = makeNavyTrainingJoggersProduct('aura-fight-club-joggers');
const duffle = makeDuffleProduct('duffle-bag');
const bottle = makeWaterBottleProduct('aura-steel-water-bottle');

const essentialTee = makeProduct({
  slug: 'aura-fight-club-t-shirt',
  title: 'AURA Boxing Essential Unisex T-Shirt',
  category: 'T-Shirt',
  description: 'Premium soft-cotton unisex T-shirt with navy and black colourways, gold AURA chest branding and AURA Fight Club back identity.',
  materialNote: 'Bella + Canvas 3001. Airlume combed and ring-spun cotton, side-seamed construction and modern unisex retail fit.',
  image: TEE_MEDIA.model,
  hoverImage: TEE_MEDIA.backModel,
  details: ['Bella + Canvas 3001', 'Navy or Black', 'Sizes S-5XL'],
  gallery: [
    { src: TEE_MEDIA.model, alt: 'Male model wearing the AURA Boxing Essential navy T-shirt, front view' },
    { src: TEE_MEDIA.backModel, alt: 'Male model wearing the AURA Boxing Essential navy T-shirt, back view' },
    { src: TEE_MEDIA.front, alt: 'AURA Boxing Essential navy T-shirt, front product view' },
    { src: TEE_MEDIA.back, alt: 'AURA Boxing Essential navy T-shirt, back product view' },
    { src: TEE_MEDIA.detail, alt: 'Gold AURA emblem detail on the navy T-shirt' },
    { src: TEE_MEDIA.lifestyle, alt: 'AURA Boxing Essential T-shirt in a boxing gym' },
  ],
});

const blackTank = makeProduct({
  slug: 'premium-unisex-tank-top-black',
  title: 'AURA Fight Club Training Tank — Black',
  category: 'Tank Top',
  description: 'Lightweight black unisex training tank for boxing sessions, conditioning, gym work and warm-weather movement.',
  materialNote: 'Premium combed and ring-spun cotton jersey with a modern unisex fit and rounded neckline.',
  image: 'https://cdn.shopify.com/s/files/1/1029/3339/7846/files/efb8e1e1-3d3d-4d58-87e5-bd6ec67648d4.webp?v=1784028476',
  details: ['Black', 'Unisex', 'Sizes XS-2XL'],
});

const whiteTank = makeProduct({
  slug: 'premium-unisex-tank-top-white',
  title: 'AURA Fight Club Training Tank — White',
  category: 'Tank Top',
  description: 'Lightweight white unisex training tank for boxing sessions, conditioning, gym work and warm-weather movement.',
  materialNote: 'Premium combed and ring-spun cotton jersey with a modern unisex fit and rounded neckline.',
  image: 'https://cdn.shopify.com/s/files/1/1029/3339/7846/files/8a52c106-59ac-42de-b451-c209b1be3ad7.webp?v=1784023594',
  details: ['White', 'Unisex', 'Sizes XS-L'],
});

const disciplineHoodie = makeProduct({
  slug: 'aura-discipline-hoodie',
  title: 'AURA Discipline Unisex Pullover Hoodie — Black',
  category: 'Hoodie',
  description: 'Black sponge-fleece pullover hoodie with a clean unisex fit and understated AURA Discipline identity.',
  materialNote: 'Bella + Canvas 3719 sponge fleece with drawcord hood, kangaroo pocket and ribbed cuffs and waistband.',
  image: 'https://cdn.shopify.com/s/files/1/1029/3339/7846/files/b61cd57c-73b0-4387-acc2-cde0786d48c3.webp?v=1784060682',
  details: ['Bella + Canvas 3719', 'Black', 'Sizes S-2XL'],
});

const organicHoodie = makeProduct({
  slug: 'organic-unisex-hoodie-sols-stellar-03568-french-navy',
  title: 'AURA Fight Club Organic Hoodie — Navy',
  category: 'Hoodie',
  description: 'French navy organic-blend hoodie designed for warm-ups, recovery, travel and everyday wear.',
  materialNote: 'SOL’S Stellar 03568 organic unisex hoodie in French navy, produced on demand.',
  image: 'https://cdn.shopify.com/s/files/1/1029/3339/7846/files/0752957b-78ea-46bc-adb7-61b1fade8c5a.webp?v=1784028972',
  details: ['Organic-blend fleece', 'French Navy', 'Sizes XS-3XL'],
});

const varsityJacket = makeProduct({
  slug: 'heavyweight-letterman-jacket',
  title: 'AURA Fight Club Varsity Bomber Jacket',
  category: 'Varsity Bomber Jacket',
  description: 'Heavyweight varsity-style outer layer for training days, travel, fight nights and everyday wear.',
  materialNote: 'Structured heavyweight letterman jacket with ribbed trims, snap front and athletic unisex silhouette.',
  image: VARSITY_MEDIA.front,
  hoverImage: VARSITY_MEDIA.modelBack,
  imageStatus: 'Approved five-image Shopify gallery live',
  details: ['Black / White', 'Heavyweight', 'Sizes S-3XL'],
  gallery: [
    { src: VARSITY_MEDIA.front, alt: 'AURA Fight Club Varsity Bomber Jacket front product view' },
    { src: VARSITY_MEDIA.back, alt: 'AURA Fight Club Varsity Bomber Jacket back product view with AURA Fight Club wordmark' },
    { src: VARSITY_MEDIA.modelFront, alt: 'Model wearing the AURA Fight Club Varsity Bomber Jacket, front view' },
    { src: VARSITY_MEDIA.modelBack, alt: 'Model wearing the AURA Fight Club Varsity Bomber Jacket, back view' },
    { src: VARSITY_MEDIA.detail, alt: 'AURA Fight Club Varsity Bomber Jacket collar and chest logo detail' },
  ],
});

const customGloves = makeProduct({
  slug: 'aura-custom-training-gloves',
  title: 'AURA Fight Club Custom Training Gloves — Pre-Order',
  category: 'Boxing Gloves',
  department: 'Equipment',
  preorder: true,
  description: 'Made-to-order AURA training gloves produced individually after weight, colour and personalisation are confirmed.',
  materialNote: 'Custom glove specification with final leather, padding, closure, colour and branding confirmed before production.',
  image: 'https://cdn.shopify.com/s/files/1/1029/3339/7846/files/hf_20260525_234441_0c17b6fc-c3e2-4a19-b6c1-ec9c04fd27a3.png?v=1779929865',
  details: ['12 oz, 14 oz or 16 oz', 'Black or Cream', 'Made to order'],
});

const trainingShorts = makeProduct({
  slug: 'aura-fight-club-training-shorts',
  title: 'AURA Fight Club Training Shorts — Pre-Order',
  category: 'Training Shorts',
  preorder: true,
  description: 'Lightweight made-to-order training shorts for boxing conditioning, striking, gym work and unrestricted movement.',
  materialNote: 'Moisture-wicking fightwear construction with wide leg openings, reinforced seams and adjustable waistband.',
  image: 'https://cdn.shopify.com/s/files/1/1029/3339/7846/files/aura-preorder-performance-fight-shorts.webp?v=1784027651',
  details: ['Black or Cream', 'Sizes S-XXL', 'Made to order'],
});

const highImpactBra = makeProduct({
  slug: 'aura-women-s-high-impact-sports-bra-pre-order',
  title: 'AURA Women’s High-Impact Boxing Sports Bra — Pre-Order',
  category: 'Women’s Sports Bra',
  preorder: true,
  audience: 'Women',
  description: 'High-support made-to-order boxing sports bra for hard rounds, bag work, conditioning and high-movement training.',
  materialNote: 'Performance sports-bra construction. Final fabric, support structure and AURA branding are confirmed before production.',
  details: ['Black', 'Sizes XS-XL', 'Made to order'],
});

const encoreBra = makeProduct({
  slug: 'aura-women-s-encore-sports-bra-pre-order',
  title: 'AURA Women’s Encore Sports Bra — Pre-Order',
  category: 'Women’s Sports Bra',
  preorder: true,
  audience: 'Women',
  description: 'Made-to-order women’s training sports bra designed for boxing movement, pad work, conditioning and everyday training.',
  materialNote: 'Performance sports-bra construction with final fabric and branding confirmed before production.',
  details: ['Black', 'Sizes XS-XL', 'Made to order'],
});

const victoryRobe = makeProduct({
  slug: 'aura-women-s-victory-short-ring-robe-pre-order',
  title: 'AURA Women’s Victory Short Ring Robe — Pre-Order',
  category: 'Women’s Ring Robe',
  preorder: true,
  audience: 'Women',
  description: 'Made-to-order short ring robe for fighter entrances, competition nights and corner use.',
  materialNote: 'Custom women’s ring robe with final fabric, trim, branding and fighter details confirmed before production.',
  details: ['Black', 'Sizes S-XXL', 'Made to order'],
});

const combatShorts = makeProduct({
  slug: 'aura-women-s-combat-boxing-shorts-pre-order',
  title: 'AURA Women’s Combat Boxing Shorts — Pre-Order',
  category: 'Women’s Fight Shorts',
  preorder: true,
  audience: 'Women',
  description: 'Lightweight made-to-order women’s boxing shorts built for speed, movement and clean ring presence.',
  materialNote: 'Custom fight-short construction with final black colourway, trim and branding confirmed before production.',
  details: ['Black', 'Sizes S-XXL', 'Made to order'],
});

export const activeApparelProducts = [
  navySet,
  essentialTee,
  blackTank,
  whiteTank,
  disciplineHoodie,
  organicHoodie,
  varsityJacket,
];

export const activeEquipmentProducts = [duffle, bottle];

export const activePreorderProducts = [
  customGloves,
  trainingShorts,
  highImpactBra,
  encoreBra,
  victoryRobe,
  combatShorts,
];

export const activeCoreProducts = [...activeApparelProducts, ...activeEquipmentProducts];
export const activeVisibleProducts = [...activeCoreProducts, ...activePreorderProducts];

const hiddenPurchasableProducts = [navyHoodie, navyJoggers];
const allPurchasableProducts = [...activeVisibleProducts, ...hiddenPurchasableProducts];

const productAliases = {
  'premium-unisex-crewneck-t-shirt-bella-canvas-3001': 'aura-fight-club-t-shirt',
  'unisex-pullover-hoodie-bella-canvas-3719-navy': 'aura-fight-club-hoodie',
  'aura-fight-club-navy-training-hoodie': 'aura-fight-club-hoodie',
  'unisex-jogging-pants-with-organic-cotton-in-conversion-and-recycled-polyester-sols-jumbo-03810-french-navy': 'aura-fight-club-joggers',
  'aura-fight-club-navy-training-joggers': 'aura-fight-club-joggers',
  'unisex-pullover-hoodie-bella-canvas-3719-black': 'aura-discipline-hoodie',
  'aura-performance-fight-shorts-pre-order': 'aura-fight-club-training-shorts',
  'aura-custom-training-gloves-pre-order': 'aura-custom-training-gloves',
  'white-17oz-stainless-steel-water-bottle': 'aura-steel-water-bottle',
};

const productBySlug = new Map(allPurchasableProducts.map((product) => [product.slug, product]));

export function resolveActiveProductSlug(slug) {
  const key = String(slug || '').toLowerCase();
  return productAliases[key] || key;
}

export function getActiveShopifyProduct(slug) {
  return productBySlug.get(resolveActiveProductSlug(slug)) || null;
}

export const activeShopifyCommerce = {
  'aura-navy-training-set': {
    priceEUR: 110.30,
    sizes: ['Hoodie and jogger sizes confirmed after order'],
    colours: ['French Navy'],
    colour: 'French Navy',
    set: true,
  },
  'aura-fight-club-hoodie': {
    priceEUR: 60,
    sizes: ['S', 'M', 'L'],
    colours: ['French Navy'],
    colour: 'French Navy',
  },
  'aura-fight-club-joggers': {
    priceEUR: 50.30,
    sizes: ['Size confirmed after order'],
    colours: ['French Navy'],
    colour: 'French Navy',
  },
  'aura-fight-club-t-shirt': {
    priceEUR: 30.72,
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'],
    colours: ['Navy', 'Black'],
    colour: 'Navy / Black',
  },
  'premium-unisex-tank-top-black': {
    priceEUR: 24.98,
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
    colours: ['Black'],
    colour: 'Black',
  },
  'premium-unisex-tank-top-white': {
    priceEUR: 25.74,
    sizes: ['XS', 'S', 'M', 'L'],
    colours: ['White'],
    colour: 'White',
  },
  'aura-discipline-hoodie': {
    priceEUR: 50,
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    colours: ['Black'],
    colour: 'Black',
  },
  'organic-unisex-hoodie-sols-stellar-03568-french-navy': {
    priceEUR: 60,
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
    colours: ['French Navy'],
    colour: 'French Navy',
  },
  'heavyweight-letterman-jacket': {
    priceEUR: 70,
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
    colours: ['Black / White'],
    colour: 'Black / White',
  },
  'duffle-bag': {
    priceEUR: 70,
    sizes: ['One Size'],
    colours: ['White'],
    colour: 'White',
  },
  'aura-steel-water-bottle': {
    priceEUR: 30,
    sizes: ['One Size'],
    colours: ['White / Metallic Gold'],
    colour: 'White / Metallic Gold',
  },
  'aura-custom-training-gloves': {
    priceEUR: 169,
    sizes: ['12 oz', '14 oz', '16 oz'],
    colours: ['Black', 'Cream'],
    colour: 'Black or Cream',
    preorder: true,
    leadTime: 'Estimated 5-7 weeks',
    personalisation: true,
  },
  'aura-fight-club-training-shorts': {
    priceEUR: 69,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colours: ['Black', 'Cream'],
    colour: 'Black or Cream',
    preorder: true,
    leadTime: 'Estimated 5-7 weeks',
    personalisation: true,
  },
  'aura-women-s-high-impact-sports-bra-pre-order': {
    priceEUR: 65,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colours: ['Black'],
    colour: 'Black',
    preorder: true,
    leadTime: 'Estimated 5-7 weeks',
  },
  'aura-women-s-encore-sports-bra-pre-order': {
    priceEUR: 59,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colours: ['Black'],
    colour: 'Black',
    preorder: true,
    leadTime: 'Estimated 5-7 weeks',
  },
  'aura-women-s-victory-short-ring-robe-pre-order': {
    priceEUR: 139,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colours: ['Black'],
    colour: 'Black',
    preorder: true,
    leadTime: 'Estimated 5-7 weeks',
    personalisation: true,
  },
  'aura-women-s-combat-boxing-shorts-pre-order': {
    priceEUR: 69,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colours: ['Black'],
    colour: 'Black',
    preorder: true,
    leadTime: 'Estimated 5-7 weeks',
    personalisation: true,
  },
};

export function getActiveShopifyCommerce(slug) {
  return activeShopifyCommerce[resolveActiveProductSlug(slug)] || null;
}
