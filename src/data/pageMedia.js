import fightClubHeroData from '../assets/generated/fightClubHeroData.js';

export const PAGE_MEDIA_STORAGE_KEY = 'aura:page-media-overrides:v1';

export const pageMediaAssets = [
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
  {
    id: 'fight-club-uploaded-gloves',
    label: 'Fight Club — gloves athlete hero',
    src: fightClubHeroData,
    group: 'Fight Club',
  },
];

export const pageHeroMedia = {
  drop001: {
    label: 'Drop 001',
    assetId: 'drop-jump-rope-04',
    image: '/campaign/jump-rope/jump-rope-04.webp',
    imagePosition: '68% 28%',
    imageFit: 'cover',
  },
  fightClub: {
    label: 'Fight Club',
    assetId: 'fight-club-uploaded-gloves',
    image: fightClubHeroData,
    imagePosition: 'center center',
    imageFit: 'cover',
  },
  apparel: {
    label: 'Apparel',
    assetId: 'drop-jump-rope-07',
    image: '/campaign/jump-rope/jump-rope-07.webp',
    imagePosition: 'center 15%',
    imageFit: 'cover',
  },
  footwear: {
    label: 'Footwear',
    assetId: 'footwear-sparring-09',
    image: '/campaign/sparring/sparring-09.webp',
    imagePosition: 'center 34%',
    imageFit: 'cover',
  },
  equipment: {
    label: 'Equipment',
    assetId: 'equipment-heavy-bag-07',
    image: '/campaign/heavy-bag/heavy-bag-07.webp',
    imagePosition: 'center 30%',
    imageFit: 'cover',
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

export function resolveAsset(assetId) {
  return pageMediaAssets.find(asset => asset.id === assetId) || null;
}

export function resolvePageMedia(pageKey) {
  const base = pageHeroMedia[pageKey] || {};
  const override = getPageMediaOverrides()[pageKey] || {};
  const selectedAsset = resolveAsset(override.assetId || base.assetId);

  return {
    ...base,
    ...override,
    image: selectedAsset?.src || override.image || base.image,
    assetId: selectedAsset?.id || override.assetId || base.assetId,
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
}

export function resetPageMediaOverride(pageKey) {
  if (typeof window === 'undefined') return;
  const current = getPageMediaOverrides();
  delete current[pageKey];
  window.localStorage.setItem(PAGE_MEDIA_STORAGE_KEY, JSON.stringify(current, null, 2));
}
