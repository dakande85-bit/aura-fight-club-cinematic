const DUFFLE_SHOP_PRODUCT = {
  priceEUR: 70,
  sizes: ['One Size'],
  colours: ['White'],
  colour: 'White',
};

const WATER_BOTTLE_SHOP_PRODUCT = {
  priceEUR: 30,
  sizes: ['One Size'],
  colours: ['White / Metallic Gold'],
  colour: 'White / Metallic Gold',
};

function isDuffleSlug(slug) {
  const key = String(slug || '').toLowerCase();
  return key === 'duffle-bag'
    || key === 'aura-fight-club-training-duffle-bag-white'
    || key === 'aura-training-duffle-bag-white'
    || (key.includes('duffle') && key.includes('white'));
}

function isWaterBottleSlug(slug) {
  const key = String(slug || '').toLowerCase();
  return key === 'aura-steel-water-bottle'
    || key === 'white-17oz-stainless-steel-water-bottle'
    || key === 'aura-fight-club-steel-water-bottle-white'
    || key === 'aura-fight-club-17oz-insulated-steel-water-bottle-white'
    || (key.includes('water-bottle') && (key.includes('white') || key.includes('steel')));
}

export const shopProducts = {
  'aura-fight-club-t-shirt': {
    priceEUR: 35,
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'],
    colours: ['Navy', 'Black'],
    colour: 'Navy / Black options',
  },
  'aura-shadow-boxer-t-shirt': {
    priceEUR: 35,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colours: ['Black', 'Cream'],
    colour: 'Black / Cream options',
  },
  'aura-fight-club-hoodie': {
    priceEUR: 70,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colours: ['Black', 'Cream'],
    colour: 'Black / Cream options',
  },
  'aura-discipline-hoodie': {
    priceEUR: 70,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colours: ['Black', 'Cream'],
    colour: 'Black / Cream options',
  },
  'aura-sleeveless-training-hoodie': {
    priceEUR: 58,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colours: ['Black'],
    colour: 'Black',
  },
  'aura-steel-water-bottle': WATER_BOTTLE_SHOP_PRODUCT,
  'white-17oz-stainless-steel-water-bottle': WATER_BOTTLE_SHOP_PRODUCT,
  'aura-fight-club-steel-water-bottle-white': WATER_BOTTLE_SHOP_PRODUCT,
  'aura-fight-club-17oz-insulated-steel-water-bottle-white': WATER_BOTTLE_SHOP_PRODUCT,
  'aura-fight-club-joggers': {
    priceEUR: 60,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colours: ['Black', 'Cream'],
    colour: 'Black / Cream options',
  },
  'aura-training-tank-top': {
    priceEUR: 30,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colours: ['Black', 'Cream'],
    colour: 'Black / Cream options',
  },
  'aura-fight-club-training-shorts': {
    priceEUR: 42,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colours: ['Black', 'Cream'],
    colour: 'Black / Cream options',
  },
  'duffle-bag': DUFFLE_SHOP_PRODUCT,
  'aura-fight-club-training-duffle-bag-white': DUFFLE_SHOP_PRODUCT,
  'aura-training-duffle-bag-white': DUFFLE_SHOP_PRODUCT,
  'aura-custom-training-gloves': {
    priceEUR: 169,
    sizes: ['12 oz', '14 oz', '16 oz'],
    colours: ['Matte Black / Gold', 'Cream / Black'],
    colour: 'Matte Black / Gold or Cream / Black',
    preorder: true,
    leadTime: 'Estimated 5-7 weeks',
    personalisation: true,
  },
  'aura-sleeveless-ring-gown': {
    priceEUR: 139,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colours: ['Black / Gold', 'Cream / Black', 'White / Gold'],
    colour: 'Black / Gold, Cream / Black, or White / Gold',
    preorder: true,
    leadTime: 'Estimated 5-7 weeks',
    personalisation: true,
  },
  'aura-fight-club-bomber-jacket': {
    priceEUR: 119,
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colours: ['Black / Gold', 'Cream / Black'],
    colour: 'Black / Gold or Cream / Black',
    preorder: true,
    leadTime: 'Estimated 5-7 weeks',
    personalisation: false,
  },
  'aura-heavyweight-pullover-hoodie': {
    priceEUR: 95,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colours: ['Black / Gold', 'Cream / Black'],
    colour: 'Black / Gold or Cream / Black',
    preorder: true,
    leadTime: 'Estimated 5-7 weeks',
    personalisation: false,
  },
  'aura-performance-fight-shorts': {
    priceEUR: 69,
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colours: ['Black / Gold', 'Cream / Black'],
    colour: 'Black / Gold or Cream / Black',
    preorder: true,
    leadTime: 'Estimated 5-7 weeks',
    personalisation: true,
  },
};

export function isShopProduct(slug) {
  return Boolean(shopProducts[slug] || isDuffleSlug(slug) || isWaterBottleSlug(slug));
}

export function getShopProduct(slug) {
  if (shopProducts[slug]) return shopProducts[slug];
  if (isDuffleSlug(slug)) return DUFFLE_SHOP_PRODUCT;
  if (isWaterBottleSlug(slug)) return WATER_BOTTLE_SHOP_PRODUCT;
  return null;
}

export function formatPriceEUR(value) {
  if (typeof value !== 'number') return '';
  return `€${value.toFixed(2)}`;
}
