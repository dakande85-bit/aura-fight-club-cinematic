export const shopProducts = {
  'aura-fight-club-t-shirt': {
    priceEUR: 35,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colours: ['Black', 'Cream'],
    colour: 'Black / Cream options',
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
  'aura-steel-water-bottle': {
    priceEUR: 28,
    sizes: ['One Size'],
    colours: ['Steel / Black'],
    colour: 'Steel / Black',
  },
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
  return Boolean(shopProducts[slug]);
}

export function getShopProduct(slug) {
  return shopProducts[slug] || null;
}

export function formatPriceEUR(value) {
  if (typeof value !== 'number') return '';
  return `€${value.toFixed(2)}`;
}
