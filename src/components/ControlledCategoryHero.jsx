import PageHero from './PageHero.jsx';
import { usePageHeroMedia } from '../hooks/usePageMedia.js';

const heroCopy = {
  apparel: {
    label: 'AURA APPAREL',
    headline: 'TRAIN IN IT.\nLIVE IN IT.',
    copy: 'Comfortable fight-inspired layers for training, recovery, travel, and everyday wear. Built to move well and look clean outside the gym.',
    ctas: [
      { label: 'View Apparel', to: '#apparel-lineup', variant: 'primary' },
      { label: 'Explore Drop 001', to: '/drop-001', variant: 'ghost' },
    ],
  },
  footwear: {
    label: 'AURA FOOTWEAR',
    headline: 'MOVE THROUGH\nEVERY ROUND.',
    copy: 'Fight-coded footwear concepts for footwork, travel, and daily movement. Coming after the first clothing drop.',
    ctas: [
      { label: 'Join Waitlist', to: '/fight-club', variant: 'primary' },
      { label: 'View Drop 001', to: '/drop-001', variant: 'ghost' },
    ],
  },
  equipment: {
    label: 'AURA ACCESSORIES',
    headline: 'CARRY THE\nFIGHT THEME.',
    copy: 'Training accessories for the daily routine: bottles, wraps, gloves, bags, and the small pieces that complete the AURA uniform.',
    ctas: [
      { label: 'Join Waitlist', to: '/fight-club', variant: 'primary' },
      { label: 'View Drop 001', to: '/drop-001', variant: 'ghost' },
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
