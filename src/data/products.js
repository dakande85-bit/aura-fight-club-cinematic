/**
 * AURA Fight Club — Product Data
 * ──────────────────────────────
 * mediaStatus: 'live' = approved asset exists, safe to show
 *              'missing' = no approved asset, do not render live
 */

const PRODUCTS = '/assets/aura-live/products';
const SCROLL   = '/assets/aura-scroll/05_drop_001_tools_uniform';
const CAMPAIGN = '/assets/aura-scroll/06_campaign_mitts_sequence';
const HERO     = '/assets/aura-live/hero';
const LIVE_CAM = '/assets/aura-live/campaign';

export const products = [
  {
    slug:        'aura-cream-fight-boots',
    name:        'AURA Cream Fight Boots',
    category:    'Footwear',
    collection:  'Drop 001',
    status:      'waitlist',
    mediaStatus: 'live',
    shortDesc:   'Lightweight training boot built for movement, grip, and presence.',
    description: 'The AURA Cream Fight Boot is the first footwear release from Drop 001. Designed for the gym floor and the pavement. Lightweight construction, non-slip sole, ankle support — engineered for boxing footwork and worn for the aesthetic.',
    details: [
      'Cream leather upper',
      'AURA logo at tongue and heel',
      'Non-slip rubber sole',
      'Reinforced ankle collar',
      'Available in sizes UK 6–12',
    ],
    image:      `${SCROLL}/frame_03_cream_boots_product.png`,
    hoverImage: `${SCROLL}/frame_01_cream_uniform_model.png`,
    gallery: [
      { src: `${SCROLL}/frame_03_cream_boots_product.png`,     alt: 'AURA Cream Fight Boots — product' },
      { src: `${SCROLL}/frame_01_cream_uniform_model.png`,     alt: 'AURA Cream Fight Boots — full outfit' },
      { src: `${SCROLL}/frame_09_cream_full_outfit_model.png`, alt: 'AURA Cream Fight Boots — full look' },
    ],
  },
  {
    slug:        'aura-cream-boxing-gloves',
    name:        'AURA Cream Boxing Gloves',
    category:    'Equipment',
    collection:  'Drop 001',
    status:      'waitlist',
    mediaStatus: 'live',
    shortDesc:   'Premium cream leather gloves. 12oz and 16oz. Built for the work.',
    description: 'The AURA Cream Boxing Gloves are the centrepiece of Drop 001. Triple-layer foam padding, full-grain cream leather, chrome AURA detailing. Built for bag work, pads, and presence.',
    details: [
      'Full-grain cream leather',
      'Triple-layer foam padding',
      'Chrome AURA wordmark',
      'Hook-and-loop wrist closure',
      'Available in 12oz and 16oz',
    ],
    image:      `${PRODUCTS}/gloves-cream.png`,
    hoverImage: `${CAMPAIGN}/frame_01_mitts_real.png`,
    gallery: [
      { src: `${PRODUCTS}/gloves-cream.png`,        alt: 'AURA Cream Boxing Gloves — product' },
      { src: `${PRODUCTS}/gloves-closeup.png`,      alt: 'AURA Cream Boxing Gloves — detail' },
      { src: `${CAMPAIGN}/frame_01_mitts_real.png`, alt: 'AURA Cream Boxing Gloves — in use' },
      { src: `${CAMPAIGN}/frame_03_mitts_real.png`, alt: 'AURA Cream Boxing Gloves — pad work' },
    ],
  },
  {
    slug:        'aura-sleeveless-hoodie',
    name:        'AURA Sleeveless Hoodie',
    category:    'Apparel',
    collection:  'Drop 001',
    status:      'waitlist',
    mediaStatus: 'live',
    shortDesc:   'Cream heavyweight cotton. Cut for the gym. Worn for the culture.',
    description: 'The AURA Sleeveless Hoodie is Drop 001\'s apparel anchor. Heavyweight cream cotton fleece, dropped armhole, kangaroo pocket, tonal AURA logo. Made to be worn over wraps, under a punchbag, and everywhere in between.',
    details: [
      '100% heavyweight cotton fleece',
      'Tonal AURA embroidered chest logo',
      'Dropped armhole for full range of motion',
      'Kangaroo pocket',
      'Available in S, M, L, XL, XXL',
    ],
    image:      `${PRODUCTS}/sleeveless-hoodie.png`,
    hoverImage: `${HERO}/model-sleeveless-cream.png`,
    gallery: [
      { src: `${PRODUCTS}/sleeveless-hoodie.png`,  alt: 'AURA Sleeveless Hoodie — product' },
      { src: `${HERO}/model-sleeveless-cream.png`, alt: 'AURA Sleeveless Hoodie — model front' },
      { src: `${HERO}/model-hoodie-dark.png`,      alt: 'AURA Sleeveless Hoodie — dark studio' },
      { src: `${LIVE_CAM}/campaign-fighter.png`,   alt: 'AURA Sleeveless Hoodie — campaign' },
    ],
  },
];

export const liveProducts = products.filter(p => p.mediaStatus === 'live');
export function getProduct(slug) {
  return products.find(p => p.slug === slug) ?? null;
}
