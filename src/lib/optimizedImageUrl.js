const LOCAL_OPTIMIZED_WEBP_PATHS = new Set([
  '/assets/aura-live/products/gloves.png',
  '/assets/aura-live/products/wraps.png',
  '/assets/aura-live/products/gloves-cream.png',
  '/assets/aura-live/products/skipping-rope.png',
  '/assets/aura-live/products/sleeveless-hoodie.png',
  '/assets/aura-live/products/shorts.png',
  '/assets/aura-live/products/mouthguard.png',
  '/assets/aura-live/campaign/campaign-hoodie.png',
  '/assets/aura-live/campaign/campaign-tee.png',
  '/assets/aura-live/campaign/campaign-trackjacket.png',
  '/assets/aura-scroll/05_drop_001_tools_uniform/frame_01_cream_uniform_model.png',
  '/assets/aura-scroll/05_drop_001_tools_uniform/frame_02_gold_skipping_rope_product.png',
  '/assets/aura-scroll/05_drop_001_tools_uniform/frame_03_cream_boots_product.png',
  '/assets/aura-scroll/05_drop_001_tools_uniform/frame_04_back_logo_apparel_model.png',
  '/assets/aura-scroll/05_drop_001_tools_uniform/frame_05_mouthguard_product.png',
  '/assets/aura-scroll/05_drop_001_tools_uniform/frame_06_black_boots_product.png',
  '/assets/aura-scroll/05_drop_001_tools_uniform/frame_07_black_sleeveless_hoodie_product.png',
  '/assets/aura-scroll/05_drop_001_tools_uniform/frame_08_cream_gloves_product.png',
  '/assets/aura-scroll/05_drop_001_tools_uniform/frame_09_cream_full_outfit_model.png',
  '/assets/aura-scroll/05_drop_001_tools_uniform/frame_10_campaign_mitts_hero.png',
  '/assets/category-support/apparel-black-hoodie.png',
  '/assets/category-support/apparel-cream-jacket.png',
  '/assets/category-support/apparel-training-vest.png',
  '/assets/category-support/equipment-gloves-front.png',
  '/assets/category-support/equipment-gloves-grip.png',
  '/assets/category-support/equipment-mouthguard.png',
  '/assets/category-support/footwear-black-high.png',
  '/assets/category-support/footwear-cream-high.png',
  '/assets/category-support/footwear-cream-low.png',
]);

export function optimizedImageUrl(url) {
  if (!url || typeof url !== 'string') return url;
  if (!/\.(png|jpe?g)(\?.*)?$/i.test(url)) return url;

  const [path, query = ''] = url.split('?');
  if (!LOCAL_OPTIMIZED_WEBP_PATHS.has(path)) return url;

  return `${path.replace(/\.(png|jpe?g)$/i, '.webp')}${query ? `?${query}` : ''}`;
}
