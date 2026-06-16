import fightClubHeroLocked from '../assets/generated/fightClubHeroLockedSmall.js';
import drop001HeroLocked from '../assets/generated/drop001HeroLockedSmall.js';
import auraUploadedLogo from '../assets/brand/auraUploadedLogoData.js';

// v5 ignores failed admin/local crop experiments and locks approved page hero media.
export const PAGE_MEDIA_STORAGE_KEY = 'aura:page-media-overrides:v5-locked-hero-assets';
export const BRAND_LOGO_STORAGE_KEY = 'aura:brand-logo-override:v1';

export const defaultBrandLogo = auraUploadedLogo;

export const pageMediaAssets = [
  {
    id: 'drop-001-locked-hero',
    label: 'Drop 001 — approved full hero canvas',
    src: drop001HeroLocked,
    group: 'Locked Heroes',
  },
  {
    id: 'fight-club-locked-hero',
    label: 'Fight Club — approved full hero canvas',
    src: fightClubHeroLocked,
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
    src: '/assets/aura-scroll/05_drop_001_tools_uniform/frame_01_cream_uniform_model.png',
    group: 'Scroll Film / Drop',
  },
  {
    id: 'scroll-drop-frame-09',
    label: 'Scroll Film Drop 001 — full outfit model',
    src: '/assets/aura-scroll/05_drop_001_tools_uniform/frame_09_cream_full_outfit_model.png',
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
    src: '/assets/aura-scroll/07_fight_club_close/frame_04_fight_club_tracksuit_ring.png',
    group: 'Scroll Film / Fight Club',
  },
  {
    id: 'footwear-sparring-09',
    label: 'Sparring 09 — Footwork hero',
    src: '/campaign/sparring/sparring-09.webp',
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
    assetId: 'drop-001-locked-hero',
    image: drop001HeroLocked,
    imagePosition: 'center center',
  },
  fightClub: {
    label: 'Fight Club',
    pagePath: '/fight-club',
    assetId: 'fight-club-locked-hero',
    image: fightClubHeroLocked,
    imagePosition: 'center center',
  },
  apparel: {
    label: 'Apparel',
    pagePath: '/apparel',
    assetId: 'drop-jump-rope-07',
    image: '/campaign/jump-rope/jump-rope-07.webp',
    imagePosition: 'center center',
  },
  footwear: {
    label: 'Footwear',
    pagePath: '/footwear',
    assetId: 'footwear-sparring-09',
    image: '/campaign/sparring/sparring-09.webp',
    imagePosition: 'center center',
  },
  equipment: {
    label: 'Equipment',
    pagePath: '/equipment',
    assetId: 'equipment-heavy-bag-07',
    image: '/campaign/heavy-bag/heavy-bag-07.webp',
    imagePosition: 'center center',
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
