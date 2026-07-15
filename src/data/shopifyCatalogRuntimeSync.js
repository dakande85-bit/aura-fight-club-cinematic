import {
  activeApparelProducts,
  activeShopifyCommerce,
} from './activeShopifyProducts.js';

const BLACK_TANK_SLUG = 'premium-unisex-tank-top-black';
const BLACK_TANK_IMAGE = 'https://cdn.shopify.com/s/files/1/1029/3339/7846/files/950f8b5e-39e6-43f5-8a61-076fc30349a0.webp?v=1784073397';

const blackTank = activeApparelProducts.find((product) => product.slug === BLACK_TANK_SLUG);

if (blackTank) {
  const gallery = [
    {
      src: BLACK_TANK_IMAGE,
      alt: 'AURA Fight Club Training Tank in black, current Shopify product view',
    },
  ];

  Object.assign(blackTank, {
    image: BLACK_TANK_IMAGE,
    primaryImage: BLACK_TANK_IMAGE,
    hoverImage: null,
    imageAlt: 'AURA Fight Club Training Tank in black',
    hoverImageAlt: undefined,
    imageStatus: 'Current Shopify product image live',
    mockupNeeded: false,
    details: ['Black', 'Unisex', 'Sizes XS-L'],
    gallery,
    galleryImages: gallery.map((item) => item.src),
  });
}

if (activeShopifyCommerce[BLACK_TANK_SLUG]) {
  activeShopifyCommerce[BLACK_TANK_SLUG].sizes = ['XS', 'S', 'M', 'L'];
}
