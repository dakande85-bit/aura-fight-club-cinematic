import Header from '../components/Header.jsx';
import PageHero from '../components/PageHero.jsx';
import Footer from '../components/Footer.jsx';
import { usePageHeroMedia } from '../hooks/usePageMedia.js';
import { dropOneProducts } from '../data/products.js';
import '../styles/drop001.css';

export default function Drop001() {
  const heroMedia = usePageHeroMedia('drop001');
  const productCountLabel = `${dropOneProducts.length} POD candidates - Men & Women - Waitlist opening`;

  return (
    <div className="d001">
      <Header />

      <PageHero
        label="DROP 001 / MEN & WOMEN"
        headline={'THE FIRST\nUNIFORM'}
        copy="Drop 001 begins with the essentials - everyday AURA pieces built for the hours before the lights. Men's and women's launch products focused on identity, discipline, and clean wearability."
        image={heroMedia.image}
        imagePosition={heroMedia.imagePosition}
        imageFit={heroMedia.imageFit}
        imageScale={heroMedia.imageScale}
        className="ph--drop001"
        ctas={[
          { label: 'Join Waitlist', to: '/fight-club', variant: 'primary' },
          { label: 'Explore Apparel', to: '/apparel', variant: 'ghost' },
        ]}
      />

      <div className="d001__grid-wrap" id="drop-lineup">
        <p className="d001__meta">{productCountLabel}</p>

        <div className="d001__grid d001__grid--confirmed">
          {dropOneProducts.map((product) => (
            <article className="d001-card" key={product.name}>
              <p className="d001-card__eyebrow">{product.category}</p>
              <h2>{product.name}</h2>
              <dl>
                <div>
                  <dt>Audience</dt>
                  <dd>{product.audience}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>{product.status}</dd>
                </div>
                <div>
                  <dt>Fulfilment</dt>
                  <dd>{product.fulfilment}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>

        <section className="d001__note" aria-label="Drop 001 scope">
          <p>Drop 001 only includes T-Shirts, Hoodies, Steel Water Bottles, Joggers, and Tank Tops.</p>
          <p>Footwear, gloves, wraps, sauna suits, fight bags, tracksuits, and other supplier-built gear are reserved for the Drop 002 pipeline until samples are approved.</p>
        </section>
      </div>

      <Footer />
    </div>
  );
}
