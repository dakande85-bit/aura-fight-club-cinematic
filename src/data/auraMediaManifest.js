export const homepageMediaEntries = [
  {
    id: 'home-hero-ring',
    label: 'Homepage Hero - Fighter in Ring',
    scene: 'Homepage hero',
    type: 'image',
    source: '/assets/home/home-hero-ring.webp',
    status: 'active',
    production: true,
    role: 'homepageHero',
    notes: 'Production static hero image. Replace this repo asset to change the public homepage for all visitors.'
  },
  {
    id: 'intro-video',
    label: 'Intro Gate Video',
    scene: 'Intro modal',
    type: 'video',
    source: '/assets/aura/intro/aura-fight-club-intro.mp4',
    status: 'active',
    production: true,
    role: 'intro',
    notes: 'Intro gate media. The public homepage itself no longer uses a video or scroll film.'
  },
  {
    id: 'legacy-scroll-film',
    label: 'Legacy Homepage Scroll Film',
    scene: 'Legacy cinematic homepage',
    type: 'video',
    source: '/cinematic',
    status: 'hidden',
    production: true,
    role: 'legacy',
    notes: 'Kept available on /cinematic. Bypassed on the public homepage for now.'
  }
];

export const homepageHeroMedia = homepageMediaEntries.find((entry) => entry.id === 'home-hero-ring');

export const auraAssetReport = {
  generatedAt: '2026-06-16',
  knownFolders: ['public/assets'],
  totals: {
    images: 925,
    videos: 24,
    activeManifestEntries: homepageMediaEntries.filter((entry) => entry.status === 'active').length,
    hiddenManifestEntries: homepageMediaEntries.filter((entry) => entry.status === 'hidden').length
  },
  byFolder: [
    { folder: 'public/assets/home', images: 1, videos: 0 },
    { folder: 'public/assets/aura/intro', images: 0, videos: 1 },
    { folder: 'public/assets/aura/brand', images: 8, videos: 0 },
    { folder: 'public/assets/aura/generated/banners', images: 8, videos: 0 },
    { folder: 'public/assets/aura/generated/product-batches', images: 40, videos: 0 },
    { folder: 'public/assets/aura/models', images: 23, videos: 0 },
    { folder: 'public/assets/aura/_REVIEW_ALL_IMAGES', images: 107, videos: 0 },
    { folder: 'public/assets/aura/Download 2', images: 103, videos: 0 },
    { folder: 'public/assets/aura/New folder', images: 335, videos: 0 },
    { folder: 'public/assets/aura/New folder (2)', images: 65, videos: 0 },
    { folder: 'public/assets/aura/Aura Project', images: 30, videos: 0 },
    { folder: 'public/assets/aura/root and loose files', images: 205, videos: 23 }
  ],
  unassignedExamples: [
    '/assets/aura/ChatGPT Image Jun 16, 2026, 02_14_09 AM.png',
    '/assets/aura/generated/banners/aura-banner-home-internal-fight.png',
    '/assets/aura/models/batch-004/aura-model-023-sweaty-seated-boxer-gym-hero.png'
  ]
};
