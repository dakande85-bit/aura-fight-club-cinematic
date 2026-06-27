import Header from './Header.jsx';
import PageHero from './PageHero.jsx';
import HomepageExtras from './HomepageExtras.jsx';
import Footer from './Footer.jsx';
import { homepageHeroMedia } from '../data/auraMediaManifest.js';

const HERO_IMAGE = homepageHeroMedia.source;

export default function HomeStaticHero({ showHeader = true, headingLevel = 'h1' }) {
  const showFullHome = showHeader && headingLevel === 'h1';

  return (
    <div className="home-static" aria-label="AURA Fight Club homepage">
      {showHeader && <Header />}
      <PageHero
        label="AURA FIGHT CLUB"
        headline={'TRAIN IN IT.\nLIVE IN IT.\nCARRY IT.'}
        copy={'Minimal fight-lifestyle clothing built for training, movement, and everyday presence.'}
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
          { label: 'Who We Are', to: '/who-we-are', variant: 'ghost' },
        ]}
      />
      {showFullHome && <HomepageExtras />}
      {showFullHome && <Footer />}
    </div>
  );
}
