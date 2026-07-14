import {
  activeShopifyCommerce,
  getActiveShopifyCommerce,
} from './activeShopifyProducts.js';

const SLEEVELESS_HOODIE_COMMERCE = {
  priceEUR: 59,
  sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  colours: ['Black'],
  colour: 'Black',
  preorder: true,
  leadTime: 'Estimated 5-7 weeks',
  personalisation: false,
};

export const shopProducts = {
  ...activeShopifyCommerce,
  'aura-sleeveless-training-hoodie': SLEEVELESS_HOODIE_COMMERCE,
};

export function isShopProduct(slug) {
  return Boolean(getShopProduct(slug));
}

export function getShopProduct(slug) {
  if (String(slug || '').toLowerCase() === 'aura-sleeveless-training-hoodie') {
    return SLEEVELESS_HOODIE_COMMERCE;
  }
  return getActiveShopifyCommerce(slug);
}

export function formatPriceEUR(value) {
  if (typeof value !== 'number') return '';
  return `€${value.toFixed(2)}`;
}
