import Header from '../components/Header.jsx';
import PageHero from '../components/PageHero.jsx';
import ProductCard from '../components/ProductCard.jsx';
import Footer from '../components/Footer.jsx';
import { useLiveProducts } from '../hooks/useLiveProducts.js';
import { usePageHeroMedia } from '../hooks/usePageMedia.js';
import '../styles/drop001.css';

export default function Drop001() {
  const { products, loading } = useLiveProducts({ collection: 'Drop 001' });
  const heroMedia = usePageHeroMedia('drop001');
  const safeProducts = products || [];
  const productCountLabel = safeProducts.length + ' ' + (safeProducts.length === 1 ? 'piece' : 'pieces') + ' · Waitlist open · Limited run';

  return (
    <div className="d001">
      <Header />

      <PageHero
        label="DROP 001"
        headline={'THE FIRST\nUNIFORM'}
        copy="The first AURA release establishes the training uniform: apparel, footwear, and equipment built around discipline, rhythm, and presence."
        image={heroMedia.image}
        imagePosition={heroMedia.imagePosition}
        imageFit={heroMedia.imageFit}
        imageScale={heroMedia.imageScale}
        className="ph--drop001"
        ctas={[
          { label: 'Shop Drop 001', to: '/drop-001', variant: 'primary' },
          { label: 'Explore Apparel', to: '/apparel', variant: 'ghost' },
        ]}
      />

      <div className="d001__grid-wrap" id="drop-lineup">
        <p className="d001__meta">
          {loading ? 'Loading...' : productCountLabel}
        </p>

        {loading ? (
          <div className="d001__loading">Loading collection...</div>
        ) : safeProducts.length > 0 ? (
          <div className="d001__grid">
            {safeProducts.map(p => (
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
