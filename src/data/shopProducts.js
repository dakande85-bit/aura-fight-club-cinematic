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

const NAVY_TRAINING_SET_SHOP_PRODUCT = {
  priceEUR: 110.30,
  sizes: ['Hoodie and jogger sizes confirmed after order'],
  colours: ['French Navy'],
  colour: 'French Navy',
  set: true,
  setPieces: ['AURA Fight Club Navy Training Hoodie', 'AURA Fight Club Navy Training Joggers'],
};

const NAVY_TRAINING_HOODIE_SHOP_PRODUCT = {
  priceEUR: 60,
  sizes: ['S', 'M', 'L'],
  colours: ['French Navy'],
  colour: 'French Navy',
};

const NAVY_TRAINING_JOGGERS_SHOP_PRODUCT = {
  priceEUR: 50.30,
  sizes: ['Size confirmed after order'],
  colours: ['French Navy'],
  colour: 'French Navy',
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

function isNavyTrainingSetSlug(slug) {
  return String(slug || '').toLowerCase() === 'aura-navy-training-set';
}

function isNavyTrainingHoodieSlug(slug) {
  const key = String(slug || '').toLowerCase();
  return key === 'aura-fight-club-hoodie'
    || key === 'aura-fight-club-navy-training-hoodie'
    || key === 'unisex-pullover-hoodie-bella-canvas-3719-navy';
}

function isNavyTrainingJoggersSlug(slug) {
  const key = String(slug || '').toLowerCase();
  return key === 'aura-fight-club-joggers'
    || key === 'aura-fight-club-navy-training-joggers'
    || key === 'unisex-jogging-pants-with-organic-cotton-in-conversion-and-recycled-polyester-sols-jumbo-03810-french-navy';
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
  'aura-navy-training-set': NAVY_TRAINING_SET_SHOP_PRODUCT,
  'aura-fight-club-hoodie': NAVY_TRAINING_HOODIE_SHOP_PRODUCT,
  'aura-fight-club-navy-training-hoodie': NAVY_TRAINING_HOODIE_SHOP_PRODUCT,
  'unisex-pullover-hoodie-bella-canvas-3719-navy': NAVY_TRAINING_HOODIE_SHOP_PRODUCT,
  'aura-discipline-hoodie': {
    priceEUR: 50,
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    colours: ['Black'],
    colour: 'Black',
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
  'aura-fight-club-joggers': NAVY_TRAINING_JOGGERS_SHOP_PRODUCT,
  'aura-fight-club-navy-training-joggers': NAVY_TRAINING_JOGGERS_SHOP_PRODUCT,
  'unisex-jogging-pants-with-organic-cotton-in-conversion-and-recycled-polyester-sols-jumbo-03810-french-navy': NAVY_TRAINING_JOGGERS_SHOP_PRODUCT,
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
  return Boolean(
    shopProducts[slug]
    || isDuffleSlug(slug)
    || isWaterBottleSlug(slug)
    || isNavyTrainingSetSlug(slug)
    || isNavyTrainingHoodieSlug(slug)
    || isNavyTrainingJoggersSlug(slug)
  );
}

export function getShopProduct(slug) {
  if (shopProducts[slug]) return shopProducts[slug];
  if (isDuffleSlug(slug)) return DUFFLE_SHOP_PRODUCT;
  if (isWaterBottleSlug(slug)) return WATER_BOTTLE_SHOP_PRODUCT;
  if (isNavyTrainingSetSlug(slug)) return NAVY_TRAINING_SET_SHOP_PRODUCT;
  if (isNavyTrainingHoodieSlug(slug)) return NAVY_TRAINING_HOODIE_SHOP_PRODUCT;
  if (isNavyTrainingJoggersSlug(slug)) return NAVY_TRAINING_JOGGERS_SHOP_PRODUCT;
  return null;
}

export function formatPriceEUR(value) {
  if (typeof value !== 'number') return '';
  return `€${value.toFixed(2)}`;
}
