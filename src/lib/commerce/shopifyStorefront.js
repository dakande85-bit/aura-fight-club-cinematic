const SHOP_DOMAIN = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN;
const STOREFRONT_TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN;
const API_VERSION = import.meta.env.VITE_SHOPIFY_STOREFRONT_API_VERSION || '2026-07';

export const isShopifyConfigured = Boolean(SHOP_DOMAIN && STOREFRONT_TOKEN);

async function storefrontRequest(query, variables = {}) {
  if (!isShopifyConfigured) {
    throw new Error('Shopify Storefront API is not configured.');
  }

  const response = await fetch(`https://${SHOP_DOMAIN}/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  const payload = await response.json();
  if (!response.ok || payload.errors?.length) {
    throw new Error(payload.errors?.[0]?.message || 'Shopify request failed.');
  }
  return payload.data;
}

const PRODUCT_FRAGMENT = `
  fragment AuraProduct on Product {
    id
    handle
    title
    description
    productType
    vendor
    availableForSale
    featuredImage { url altText width height }
    images(first: 12) { nodes { url altText width height } }
    variants(first: 100) {
      nodes {
        id
        title
        availableForSale
        quantityAvailable
        selectedOptions { name value }
        price { amount currencyCode }
        image { url altText width height }
      }
    }
  }
`;

export async function getProducts({ first = 24, collectionHandle } = {}) {
  if (collectionHandle) {
    const data = await storefrontRequest(`
      ${PRODUCT_FRAGMENT}
      query ProductsByCollection($handle: String!, $first: Int!) {
        collection(handle: $handle) {
          products(first: $first) { nodes { ...AuraProduct } }
        }
      }
    `, { handle: collectionHandle, first });
    return data.collection?.products?.nodes || [];
  }

  const data = await storefrontRequest(`
    ${PRODUCT_FRAGMENT}
    query Products($first: Int!) {
      products(first: $first) { nodes { ...AuraProduct } }
    }
  `, { first });
  return data.products?.nodes || [];
}

export async function getProductByHandle(handle) {
  const data = await storefrontRequest(`
    ${PRODUCT_FRAGMENT}
    query ProductByHandle($handle: String!) {
      product(handle: $handle) { ...AuraProduct }
    }
  `, { handle });
  return data.product;
}

const CART_FRAGMENT = `
  fragment AuraCart on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount { amount currencyCode }
      totalAmount { amount currencyCode }
    }
    lines(first: 100) {
      nodes {
        id
        quantity
        merchandise {
          ... on ProductVariant {
            id
            title
            availableForSale
            product { id handle title }
            price { amount currencyCode }
            image { url altText width height }
          }
        }
      }
    }
  }
`;

export async function createCart(lines = []) {
  const data = await storefrontRequest(`
    ${CART_FRAGMENT}
    mutation CartCreate($input: CartInput!) {
      cartCreate(input: $input) {
        cart { ...AuraCart }
        userErrors { field message }
      }
    }
  `, { input: { lines } });
  const error = data.cartCreate.userErrors?.[0];
  if (error) throw new Error(error.message);
  return data.cartCreate.cart;
}

export async function getCart(cartId) {
  const data = await storefrontRequest(`
    ${CART_FRAGMENT}
    query Cart($id: ID!) {
      cart(id: $id) { ...AuraCart }
    }
  `, { id: cartId });
  return data.cart;
}

export async function addCartLines(cartId, lines) {
  const data = await storefrontRequest(`
    ${CART_FRAGMENT}
    mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart { ...AuraCart }
        userErrors { field message }
      }
    }
  `, { cartId, lines });
  const error = data.cartLinesAdd.userErrors?.[0];
  if (error) throw new Error(error.message);
  return data.cartLinesAdd.cart;
}

export async function updateCartLines(cartId, lines) {
  const data = await storefrontRequest(`
    ${CART_FRAGMENT}
    mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart { ...AuraCart }
        userErrors { field message }
      }
    }
  `, { cartId, lines });
  const error = data.cartLinesUpdate.userErrors?.[0];
  if (error) throw new Error(error.message);
  return data.cartLinesUpdate.cart;
}

export async function removeCartLines(cartId, lineIds) {
  const data = await storefrontRequest(`
    ${CART_FRAGMENT}
    mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart { ...AuraCart }
        userErrors { field message }
      }
    }
  `, { cartId, lineIds });
  const error = data.cartLinesRemove.userErrors?.[0];
  if (error) throw new Error(error.message);
  return data.cartLinesRemove.cart;
}
