import {
  activeShopifyCommerce,
  getActiveShopifyCommerce,
} from './activeShopifyProducts.js';

export const shopProducts = activeShopifyCommerce;

export function isShopProduct(slug) {
  return Boolean(getActiveShopifyCommerce(slug));
}

export function getShopProduct(slug) {
  return getActiveShopifyCommerce(slug);
}

export function formatPriceEUR(value) {
  if (typeof value !== 'number') return '';
  return `€${value.toFixed(2)}`;
}
