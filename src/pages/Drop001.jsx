import Header from '../components/Header.jsx';
import PageHero from '../components/PageHero.jsx';
import Footer from '../components/Footer.jsx';
import LaunchProductCard from '../components/LaunchProductCard.jsx';
import { usePageHeroMedia } from '../hooks/usePageMedia.js';
import { dropOneProducts } from '../data/products.js';
import '../styles/drop001.css';

export default function Drop001() {
  const heroMedia = usePageHeroMedia('drop001');
  const productCountLabel = `${dropOneProducts.length} pieces - clothing and accessories - waitlist opening`;

  return (
    <div className="d001">
      <Header />

      <PageHero
        label="DROP 001 / AURA FIGHT CLUB"
        headline={'TRAIN IN IT.\nLIVE IN IT.\nCARRY IT.'}
        copy="The first AURA release focuses on comfortable training-to-lifestyle essentials: T-shirts, hoodies, joggers, tank tops, and a steel water bottle. Pieces made for the gym, recovery, travel, and everyday life."
        image={heroMedia.image}
        imagePosition={heroMedia.imagePosition}
        imageFit={heroMedia.imageFit}
        imageScale={heroMedia.imageScale}
        className="ph--drop001"
        ctas={[
          { label: 'Join Waitlist', to: '/fight-club', variant: 'primary' },
          { label: 'View Apparel', to: '/apparel', variant: 'ghost' },
        ]}
      />

      <div className="d001__grid-wrap" id="drop-lineup">
        <p className="d001__meta">{productCountLabel}</p>
        <h2 className="d001__lineup-title">DROP 001 - EVERYDAY TRAINING LAYERS</h2>
        <p className="d001__lineup-copy">
          AURA starts with wearable essentials before expanding into footwear and accessories. The focus is comfort, clean fit, and a strong club identity you can carry through the whole day.
        </p>

        <div className="d001__grid d001__grid--confirmed">
          {dropOneProducts.map((product) => (
            <LaunchProductCard product={product} key={product.slug} />
          ))}
        </div>

        <section className="d001__waitlist" aria-labelledby="drop001-waitlist-title">
          <p className="d001__meta">Early Access</p>
          <h2 id="drop001-waitlist-title">JOIN THE DROP LIST.</h2>
          <p>Be first in line when Drop 001 opens for early access.</p>
          <a href="/fight-club">Join Waitlist</a>
        </section>

        <section className="d001__note" aria-label="Drop 001 scope">
          <p>Drop 001 focuses on T-shirts, hoodies, joggers, tank tops, and a steel water bottle.</p>
          <p>Footwear and wider accessories come after the first clothing release.</p>
        </section>
      </div>

      <Footer />
    </div>
  );
}
