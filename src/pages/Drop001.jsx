import Header from '../components/Header.jsx';
import PageHero from '../components/PageHero.jsx';
import Footer from '../components/Footer.jsx';
import LaunchProductCard from '../components/LaunchProductCard.jsx';
import { usePageHeroMedia } from '../hooks/usePageMedia.js';
import { dropOneProducts } from '../data/products.js';
import '../styles/drop001.css';

export default function Drop001() {
  const heroMedia = usePageHeroMedia('drop001');
  const productCountLabel = `${dropOneProducts.length} faster-delivery core products`;

  return (
    <div className="d001">
      <Header />

      <PageHero
        label="DROP 001 / AURA FIGHT CLUB"
        headline={'TRAIN IN IT.\nLIVE IN IT.\nCARRY IT.'}
        copy="AURA’s core print-on-demand collection for training, recovery, travel, and everyday life. These items are separate from the slower made-to-order pre-order range."
        image={heroMedia.image}
        imagePosition={heroMedia.imagePosition}
        imageFit={heroMedia.imageFit}
        imageScale={heroMedia.imageScale}
        className="ph--drop001"
        ctas={[
          { label: 'Shop Drop 001', to: '#drop-lineup', variant: 'primary', scroll: true },
          { label: 'View Pre-Orders', to: '/pre-orders', variant: 'ghost' },
        ]}
      />

      <div className="d001__grid-wrap" id="drop-lineup">
        <p className="d001__meta">{productCountLabel}</p>
        <h2 className="d001__lineup-title">DROP 001 - CORE COLLECTION</h2>
        <p className="d001__lineup-copy">
          Faster-delivery AURA clothing and accessories fulfilled separately from specialist made-to-order products.
        </p>

        <div className="d001__grid d001__grid--confirmed">
          {dropOneProducts.map((product) => (
            <LaunchProductCard product={product} key={product.slug} />
          ))}
        </div>

        <section className="d001__waitlist" aria-labelledby="drop001-order-title">
          <p className="d001__meta">Two ways to order</p>
          <h2 id="drop001-order-title">CORE DROP OR MADE TO ORDER?</h2>
          <p>Shop Drop 001 for the faster range, or explore specialist products produced individually after payment.</p>
          <a href="/pre-orders">Explore Pre-Orders</a>
        </section>

        <section className="d001__note" aria-label="Drop 001 scope">
          <p>Drop 001 contains the AURA print-on-demand range. It is kept separate so customers can clearly understand the different production and delivery times.</p>
          <p>Gloves, the ring gown, bomber jacket, heavyweight hoodie, and performance fight shorts now live in the dedicated Pre-Order collection.</p>
        </section>
      </div>

      <Footer />
    </div>
  );
}
