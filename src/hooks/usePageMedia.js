import { useEffect, useState } from 'react';
import { resolveBrandLogo, resolvePageMedia } from '../data/pageMedia.js';

function subscribeToMediaChanges(callback) {
  if (typeof window === 'undefined') return () => {};

  const handler = () => callback();
  window.addEventListener('storage', handler);
  window.addEventListener('aura-page-media-updated', handler);

  return () => {
    window.removeEventListener('storage', handler);
    window.removeEventListener('aura-page-media-updated', handler);
  };
}

export function usePageHeroMedia(pageKey) {
  const [media, setMedia] = useState(() => resolvePageMedia(pageKey));

  useEffect(() => {
    const update = () => setMedia(resolvePageMedia(pageKey));
    update();
    return subscribeToMediaChanges(update);
  }, [pageKey]);

  return media;
}

export function useBrandLogo() {
  const [logo, setLogo] = useState(() => resolveBrandLogo());

  useEffect(() => {
    const update = () => setLogo(resolveBrandLogo());
    update();
    return subscribeToMediaChanges(update);
  }, []);

  return logo;
}
