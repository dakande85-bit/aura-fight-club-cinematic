import fightClubHeroUserAttached from '../assets/generated/fightClubHeroUserAttachedData.js';

// v7 locks the user-attached Fight Club hero and uses a reliable public Drop 001 image.
export const PAGE_MEDIA_STORAGE_KEY = 'aura:page-media-overrides:v7-attached-fight-hero';
export const BRAND_LOGO_STORAGE_KEY = 'aura:brand-logo-override:v1';

export const defaultBrandLogo = '/assets/brand/aura-fight-club-logo-attached.png';

const DROP001_RELIABLE_HERO = '/assets/aura-scroll/05_drop_001_tools_uniform/frame_09_cream_full_outfit_model.webp';

export const pageMediaAssets = [
  {
    id: 'drop-001-reliable-hero',
    label: 'Drop 001 — reliable product hero',
    src: DROP001_RELIABLE_HERO,
    group: 'Locked Heroes',
  },
  {
    id: 'fight-club-attached-hero',
    label: 'Fight Club — user attached white kit hero',
    src: fightClubHeroUserAttached,
    group: 'Locked Heroes',
  },
  {
    id: 'drop-jump-rope-04',
    label: 'Jump Rope 04 — Drop training hero',
    src: '/campaign/jump-rope/jump-rope-04.webp',
    group: 'Drop 001',
  },
  {
    id: 'drop-jump-rope-07',
    label: 'Jump Rope 07 — Apparel/training hero',
    src: '/campaign/jump-rope/jump-rope-07.webp',
    group: 'Training',
  },
  {
    id: 'scroll-drop-frame-01',
    label: 'Scroll Film Drop 001 — cream uniform model',
    src: '/assets/aura-scroll/05_drop_001_tools_uniform/frame_01_cream_uniform_model.webp',
    group: 'Scroll Film / Drop',
  },
  {
    id: 'scroll-drop-frame-09',
    label: 'Scroll Film Drop 001 — full outfit model',
    src: '/assets/aura-scroll/05_drop_001_tools_uniform/frame_09_cream_full_outfit_model.webp',
    group: 'Scroll Film / Drop',
  },
  {
    id: 'scroll-fight-frame-01',
    label: 'Scroll Film Fight Club — close frame',
    src: '/assets/aura-scroll/07_fight_club_close/frame_01_fight_club_close.png',
    group: 'Scroll Film / Fight Club',
  },
  {
    id: 'scroll-fight-ringside-black',
    label: 'Scroll Film Fight Club — ringside black',
    src: '/assets/aura-scroll/07_fight_club_close/frame_03_fight_club_ringside_black.png',
    group: 'Scroll Film / Fight Club',
  },
  {
    id: 'scroll-fight-tracksuit-ring',
    label: 'Scroll Film Fight Club — tracksuit ring',
    src: '/assets/aura-scroll/07_fight_club_close/frame_04_fight_club_tracksuit_ring.webp',
    group: 'Scroll Film / Fight Club',
  },
  {
    id: 'footwear-sparring-09',
    label: 'Sparring 09 — Footwork hero',
    src: '/campaign/sparring/sparring-09.webp',
    group: 'Footwear',
  },
  {
    id: 'footwork-jump-midair',
    label: 'Footwork sequence - jump and boots hero',
    src: '/assets/aura-scroll/04_footwork_skipping/frame_06_jump_midair.webp',
    group: 'Footwear',
  },
  {
    id: 'equipment-heavy-bag-07',
    label: 'Heavy Bag 07 — Equipment hero',
    src: '/campaign/heavy-bag/heavy-bag-07.webp',
    group: 'Equipment',
  },
];

export const pageHeroMedia = {
  drop001: {
    label: 'Drop 001',
    pagePath: '/drop-001',
    assetId: 'drop-001-reliable-hero',
    image: DROP001_RELIABLE_HERO,
    imagePosition: 'center center',
    imageFit: 'contain',
  },
  fightClub: {
    label: 'Fight Club',
    pagePath: '/fight-club',
    assetId: 'scroll-fight-tracksuit-ring',
    image: '/assets/aura-scroll/07_fight_club_close/frame_04_fight_club_tracksuit_ring.webp',
    imagePosition: 'center center',
    imageFit: 'contain',
  },
  apparel: {
    label: 'Apparel',
    pagePath: '/apparel',
    assetId: 'drop-jump-rope-07',
    image: '/campaign/jump-rope/jump-rope-07.webp',
    imagePosition: 'center center',
    imageFit: 'contain',
  },
  footwear: {
    label: 'Footwear',
    pagePath: '/footwear',
    assetId: 'footwear-sparring-09',
    image: '/campaign/sparring/sparring-09.webp',
    imagePosition: 'center center',
    imageFit: 'contain',
  },
  equipment: {
    label: 'Equipment',
    pagePath: '/equipment',
    assetId: 'equipment-heavy-bag-07',
    image: '/campaign/heavy-bag/heavy-bag-07.webp',
    imagePosition: 'center center',
    imageFit: 'contain',
  },
};

export function getPageMediaOverrides() {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(window.localStorage.getItem(PAGE_MEDIA_STORAGE_KEY) || '{}') || {};
  } catch {
    return {};
  }
}

export function getBrandLogoOverride() {
  if (typeof window === 'undefined') return '';
  try {
    return window.localStorage.getItem(BRAND_LOGO_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

export function resolveAsset(assetId) {
  return pageMediaAssets.find(asset => asset.id === assetId) || null;
}

export function resolvePageMedia(pageKey) {
  const base = pageHeroMedia[pageKey] || {};
  const override = getPageMediaOverrides()[pageKey] || {};
  const selectedAsset = resolveAsset(override.assetId || base.assetId);
  const customImage = override.image && String(override.image).trim();

  return {
    ...base,
    ...override,
    image: customImage || selectedAsset?.src || base.image,
    assetId: selectedAsset?.id || override.assetId || base.assetId,
    imagePosition: override.imagePosition || base.imagePosition || 'center center',
    imageFit: override.imageFit || base.imageFit || 'contain',
    imageScale: override.imageScale || base.imageScale || 1,
  };
}

export function savePageMediaOverride(pageKey, values) {
  if (typeof window === 'undefined') return;
  const current = getPageMediaOverrides();
  const next = {
    ...current,
    [pageKey]: {
      ...(current[pageKey] || {}),
      ...values,
    },
  };
  window.localStorage.setItem(PAGE_MEDIA_STORAGE_KEY, JSON.stringify(next, null, 2));
  window.dispatchEvent(new CustomEvent('aura-page-media-updated'));
}

export function resetPageMediaOverride(pageKey) {
  if (typeof window === 'undefined') return;
  const current = getPageMediaOverrides();
  delete current[pageKey];
  window.localStorage.setItem(PAGE_MEDIA_STORAGE_KEY, JSON.stringify(current, null, 2));
  window.dispatchEvent(new CustomEvent('aura-page-media-updated'));
}

export function saveBrandLogoOverride(value) {
  if (typeof window === 'undefined') return;
  if (value) {
    window.localStorage.setItem(BRAND_LOGO_STORAGE_KEY, value);
  } else {
    window.localStorage.removeItem(BRAND_LOGO_STORAGE_KEY);
  }
  window.dispatchEvent(new CustomEvent('aura-page-media-updated'));
}

export function resolveBrandLogo() {
  return defaultBrandLogo;
}
