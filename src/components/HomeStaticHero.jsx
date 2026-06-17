import Header from './Header.jsx';
import PageHero from './PageHero.jsx';
import { homepageHeroMedia } from '../data/auraMediaManifest.js';

const HERO_IMAGE = homepageHeroMedia.source;

export default function HomeStaticHero() {
  return (
    <div className="home-static" aria-label="AURA Fight Club homepage">
      <Header />
      <PageHero
        label="AURA FIGHT CLUB"
        headline={'YOUR AURA\nIS EARNED.'}
        copy={'The real fight is internal.\nThe opponent is just the mirror.'}
        image={HERO_IMAGE}
        imageFit="contain"
        imagePosition="center center"
        imageAlt="AURA Fight Club model in cream training kit"
        imageWidth="1122"
        imageHeight="1402"
        className="ph--home"
        ctas={[
          { label: 'Explore Drop 001', to: '/drop-001', variant: 'primary' },
          { label: 'Enter Fight Club', to: '/fight-club', variant: 'ghost' },
        ]}
      />
    </div>
  );
}
