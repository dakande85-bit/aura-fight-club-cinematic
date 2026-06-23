import Header from './Header.jsx';
import PageHero from './PageHero.jsx';
import { homepageHeroMedia } from '../data/auraMediaManifest.js';

const HERO_IMAGE = homepageHeroMedia.source;

export default function HomeStaticHero({ showHeader = true, headingLevel = 'h1' }) {
  return (
    <div className="home-static" aria-label="AURA Fight Club homepage">
      {showHeader && <Header />}
      <PageHero
        label="AURA FIGHT CLUB"
        headline={'TRAIN IN IT.\nLIVE IN IT.\nCARRY IT.'}
        copy={'Minimal fight-lifestyle clothing built for training, movement, and everyday presence. Designed to fit clean, feel comfortable, and bring out the frame without shouting for attention.'}
        image={HERO_IMAGE}
        imageFit="contain"
        imagePosition="center center"
        imageAlt="AURA Fight Club model in cream training kit"
        imageWidth="1122"
        imageHeight="1402"
        className="ph--home"
        headingLevel={headingLevel}
        ctas={[
          { label: 'Explore Drop 001', to: '/drop-001', variant: 'primary' },
          { label: 'Join Drop List', to: '/fight-club', variant: 'ghost' },
        ]}
      />
    </div>
  );
}
