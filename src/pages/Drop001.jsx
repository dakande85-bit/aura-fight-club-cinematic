import Header from '../components/Header.jsx';
import PageHero from '../components/PageHero.jsx';
import Footer from '../components/Footer.jsx';
import LaunchProductCard from '../components/LaunchProductCard.jsx';
import { usePageHeroMedia } from '../hooks/usePageMedia.js';
import { dropOneProducts } from '../data/products.js';
import '../styles/drop001.css';

export default function Drop001() {
  const heroMedia = usePageHeroMedia('drop001');
  const productCountLabel = `${dropOneProducts.length} pieces - available to order`;

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
          { label: 'Shop Drop 001', to: '#drop-lineup', variant: 'primary', scroll: true },
          { label: 'View Cart', to: '/cart', variant: 'ghost' },
        ]}
      />

      <div className="d001__grid-wrap" id="drop-lineup">
        <p className="d001__meta">{productCountLabel}</p>
        <h2 className="d001__lineup-title">DROP 001 - EVERYDAY TRAINING LAYERS</h2>
        <p className="d001__lineup-copy">
          AURA starts with wearable essentials before expanding into footwear and accessories. Choose a product below and add it to your cart.
        </p>

        <div className="d001__grid d001__grid--confirmed">
          {dropOneProducts.map((product) => (
            <LaunchProductCard product={product} key={product.slug} />
          ))}
        </div>

        <section className="d001__waitlist" aria-labelledby="drop001-order-title">
          <p className="d001__meta">Checkout</p>
          <h2 id="drop001-order-title">READY TO ORDER?</h2>
          <p>Review your selected Drop 001 pieces and send the order request.</p>
          <a href="/cart">View Cart</a>
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
