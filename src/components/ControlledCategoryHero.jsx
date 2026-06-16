import PageHero from './PageHero.jsx';
import { usePageHeroMedia } from '../hooks/usePageMedia.js';

const heroCopy = {
  apparel: {
    label: 'AURA APPAREL',
    headline: 'BUILT FOR THE\nUNSEEN ROUNDS',
    copy: 'Training layers for the work nobody sees. Clean, composed, and built around presence before attention.',
    ctas: [
      { label: 'Shop Apparel', to: '/apparel', variant: 'primary' },
      { label: 'Explore Drop 001', to: '/drop-001', variant: 'ghost' },
    ],
  },
  footwear: {
    label: 'AURA FOOTWEAR',
    headline: 'MOVEMENT BEFORE\nIMPACT',
    copy: 'Footwear built around control, rhythm, and the steps nobody studies until they lose the round.',
    ctas: [
      { label: 'Shop Footwear', to: '/footwear', variant: 'primary' },
      { label: 'Explore Drop 001', to: '/drop-001', variant: 'ghost' },
    ],
  },
  equipment: {
    label: 'AURA EQUIPMENT',
    headline: 'TOOLS FOR\nDISCIPLINE',
    copy: 'Training equipment for daily preparation, consistency, and the routine of getting sharper.',
    ctas: [
      { label: 'Shop Equipment', to: '/equipment', variant: 'primary' },
      { label: 'Explore Drop 001', to: '/drop-001', variant: 'ghost' },
    ],
  },
};

export default function ControlledCategoryHero({ category }) {
  const key = String(category || '').toLowerCase();
  const content = heroCopy[key];
  const media = usePageHeroMedia(key);

  if (!content) return null;

  return (
    <PageHero
      {...content}
      image={media.image}
      imagePosition={media.imagePosition}
      imageFit={media.imageFit}
      imageScale={media.imageScale}
      pageMediaKey={key}
      className={'ph--' + key}
    />
  );
}
