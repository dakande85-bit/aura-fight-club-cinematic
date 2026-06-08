import { liveAssets } from './liveAssets.js';

export const products = [
  {
    slug: 'aura-gloves',
    name: 'AURA Training Gloves',
    category: 'Equipment',
    image: liveAssets.products.gloves,
    hoverImage: liveAssets.products.glovesCloseup,
    status: 'waitlist',
  },
  {
    slug: 'aura-sleeveless-hoodie',
    name: 'AURA Sleeveless Hoodie',
    category: 'Apparel',
    image: liveAssets.products.sleevelessHoodie,
    hoverImage: liveAssets.hero.model,
    status: 'waitlist',
  },
  {
    slug: 'aura-hand-wraps',
    name: 'AURA Hand Wraps',
    category: 'Equipment',
    image: liveAssets.products.wraps,
    hoverImage: null,
    status: 'waitlist',
  },
  {
    slug: 'aura-shorts',
    name: 'AURA Training Shorts',
    category: 'Apparel',
    image: liveAssets.products.shorts,
    hoverImage: null,
    status: 'waitlist',
  },
  {
    slug: 'aura-mouthguard',
    name: 'AURA Mouthguard',
    category: 'Equipment',
    image: liveAssets.products.mouthguard,
    hoverImage: null,
    status: 'waitlist',
  },
  {
    slug: 'aura-skipping-rope',
    name: 'AURA Skipping Rope',
    category: 'Equipment',
    image: liveAssets.products.skippingRope,
    hoverImage: null,
    status: 'waitlist',
  },
].filter(p => p.image !== null);
