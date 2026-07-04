export const shopProducts = {
  'aura-fight-club-t-shirt': {
    priceEUR: 35,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colour: 'Black / Cream options',
  },
  'aura-shadow-boxer-t-shirt': {
    priceEUR: 35,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colour: 'Black / Cream options',
  },
  'aura-fight-club-hoodie': {
    priceEUR: 70,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colour: 'Black / Cream options',
  },
  'aura-discipline-hoodie': {
    priceEUR: 70,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colour: 'Black / Cream options',
  },
  'aura-sleeveless-training-hoodie': {
    priceEUR: 58,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colour: 'Black',
  },
  'aura-steel-water-bottle': {
    priceEUR: 28,
    sizes: ['One Size'],
    colour: 'Steel / Black',
  },
  'aura-fight-club-joggers': {
    priceEUR: 60,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colour: 'Black / Cream options',
  },
  'aura-training-tank-top': {
    priceEUR: 30,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colour: 'Black / Cream options',
  },
  'aura-fight-club-training-shorts': {
    priceEUR: 42,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colour: 'Black / Cream options',
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
