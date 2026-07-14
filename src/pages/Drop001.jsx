import Header from '../components/Header.jsx';
import PageHero from '../components/PageHero.jsx';
import Footer from '../components/Footer.jsx';
import LaunchProductCard from '../components/LaunchProductCard.jsx';
import { usePageHeroMedia } from '../hooks/usePageMedia.js';
import { dropOneProducts } from '../data/products.js';
import { preorderProducts } from '../data/preorderProducts.js';
import '../styles/drop001.css';

export default function Drop001() {
  const heroMedia = usePageHeroMedia('drop001');
  const productCountLabel = `${dropOneProducts.length} core products plus ${preorderProducts.length} made-to-order pre-orders`;

  return (
    <div className="d001">
      <Header />

      <PageHero
        label="DROP 001 / AURA FIGHT CLUB"
        headline={'TRAIN IN IT.\nLIVE IN IT.\nCARRY IT.'}
        copy="The first AURA release combines everyday training apparel with a made-to-order pre-order collection. Customers confirm the product first; production begins only after payment and specifications are approved."
        image={heroMedia.image}
        imagePosition={heroMedia.imagePosition}
        imageFit={heroMedia.imageFit}
        imageScale={heroMedia.imageScale}
        className="ph--drop001"
        ctas={[
          { label: 'Shop Drop 001', to: '#drop-lineup', variant: 'primary', scroll: true },
          { label: 'View Cart', to: '/cart', variant: 'ghost' },
        ]}
      />

      <div className="d001__grid-wrap" id="drop-lineup">
        <p className="d001__meta">{productCountLabel}</p>
        <h2 className="d001__lineup-title">DROP 001 - CORE COLLECTION</h2>
        <p className="d001__lineup-copy">
          AURA starts with an everyday training uniform for the gym, recovery, travel, and daily life.
        </p>

        <div className="d001__grid d001__grid--confirmed">
          {dropOneProducts.map((product) => (
            <LaunchProductCard product={product} key={product.slug} />
          ))}
        </div>

        <h2 className="d001__lineup-title">MADE-TO-ORDER PRE-ORDERS</h2>
        <p className="d001__lineup-copy">
          No stock is held. Select your size, colour, and personalisation; production begins after full payment and final confirmation. Estimated delivery is 5-7 weeks.
        </p>

        <div className="d001__grid d001__grid--confirmed">
          {preorderProducts.map((product) => (
            <LaunchProductCard product={product} key={product.slug} />
          ))}
        </div>

        <section className="d001__waitlist" aria-labelledby="drop001-order-title">
          <p className="d001__meta">Checkout</p>
          <h2 id="drop001-order-title">READY TO ORDER?</h2>
          <p>Review your selected AURA products and submit the order or pre-order request.</p>
          <a href="/cart">View Cart</a>
        </section>

        <section className="d001__note" aria-label="Drop 001 scope">
          <p>Core AURA products remain available to order. The ring gown, bomber jacket, heavyweight hoodie, performance fight shorts, and custom training gloves are made-to-order pre-orders.</p>
          <p>Shipping is confirmed separately, and supplier production starts only after customer payment has cleared.</p>
        </section>
      </div>

      <Footer />
    </div>
  );
}
