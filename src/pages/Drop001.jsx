import Header from '../components/Header.jsx';
import PageHero from '../components/PageHero.jsx';
import ProductCard from '../components/ProductCard.jsx';
import Footer from '../components/Footer.jsx';
import { useLiveProducts } from '../hooks/useLiveProducts.js';
import '../styles/drop001.css';

export default function Drop001() {
  const { products, loading } = useLiveProducts({ collection: 'Drop 001' });
  const productCountLabel = products.length + ' ' + (products.length === 1 ? 'piece' : 'pieces') + ' · Waitlist open · Limited run';

  return (
    <div className="d001">
      <Header />

      <PageHero
        label="DROP 001"
        headline={'THE FIRST\nUNIFORM'}
        copy="The first AURA release establishes the training uniform: apparel, footwear, and equipment built around discipline, rhythm, and presence."
        image="/campaign/jump-rope/jump-rope-04.webp"
        imagePosition="68% 28%"
        className="ph--drop001"
        ctas={[
          { label: 'Shop Drop 001', to: '#drop-lineup', variant: 'primary', scroll: true },
          { label: 'Explore Apparel', to: '/apparel', variant: 'ghost' },
        ]}
      />

      <div className="d001__grid-wrap" id="drop-lineup">
        <p className="d001__meta">
          {loading ? 'Loading...' : productCountLabel}
        </p>

        {loading ? (
          <div className="d001__loading">Loading collection...</div>
        ) : products.length > 0 ? (
          <div className="d001__grid">
            {products.map(p => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        ) : (
          <div className="d001__empty">
            <p>Collection coming soon.</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
