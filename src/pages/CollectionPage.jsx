import { useNavigate } from 'react-router-dom';
import Header from '../components/Header.jsx';
import ProductCard from '../components/ProductCard.jsx';
import Footer from '../components/Footer.jsx';
import CategoryExtras, { CategoryLineupIntro } from '../components/CategoryExtras.jsx';
import ControlledCategoryHero from '../components/ControlledCategoryHero.jsx';
import LaunchProductCard from '../components/LaunchProductCard.jsx';
import { useLiveProducts } from '../hooks/useLiveProducts.js';
import { useAllProductMedia } from '../hooks/useProductMedia.js';
import { dropOneApparelProducts } from '../data/products.js';
import { preorderProducts } from '../data/preorderProducts.js';
import '../styles/collection.css';

function getCategoryMeta(category, count, preorderCount) {
  const key = String(category || '').toLowerCase();

  if (key === 'apparel') {
    return `${count} pieces - ${preorderCount} made-to-order pre-orders`;
  }

  if (key === 'footwear') {
    return count > 0 ? `${count} upcoming footwear previews` : 'Upcoming footwear previews';
  }

  if (key === 'equipment') {
    return preorderCount > 0
      ? `${count} accessories - ${preorderCount} available for pre-order`
      : count > 0 ? `${count} accessory previews` : 'Accessories coming soon';
  }

  return count > 0 ? `${count} pieces` : 'New pieces coming soon';
}

export default function CollectionPage({ category, heading, subcopy }) {
  const navigate = useNavigate();
  const { products, loading } = useLiveProducts({ category });
  const { mediaMap } = useAllProductMedia();
  const key = String(category || '').toLowerCase();
  const isLaunchApparel = key === 'apparel';
  const preorderForCategory = preorderProducts.filter((product) =>
    String(product.department || '').toLowerCase() === key
  );
  const baseProducts = isLaunchApparel ? dropOneApparelProducts : (products || []);
  const safeProducts = [...baseProducts, ...preorderForCategory];
  const gridClass = safeProducts.length === 1 ? 'col-grid col-grid--single' : 'col-grid';

  return (
    <div className={'col-page col-page--' + key}>
      <Header />
      <ControlledCategoryHero category={category} />

      <div className="col-header-block">
        <button className="col-back" onClick={() => navigate('/')}>
          Back to AURA Fight Club
        </button>
        <p className="col-eyebrow">AURA Fight Club</p>
        <h1 className="col-title">{heading}</h1>
        <p className="col-sub">{subcopy}</p>
        <div className="col-divider" />
        {loading && !isLaunchApparel ? (
          <p className="col-meta">Loading...</p>
        ) : (
          <p className={safeProducts.length > 0 ? 'col-meta' : 'col-meta col-meta--empty'}>
            {getCategoryMeta(category, safeProducts.length, preorderForCategory.length)}
          </p>
        )}
      </div>

      {key === 'apparel' && (
        <section className="col-feature-media" aria-label="AURA apparel editorial image">
          <img src="/assets/category-support/apparel-cream-jacket.webp" alt="AURA apparel training-to-lifestyle editorial" loading="lazy" decoding="async" />
        </section>
      )}

      <CategoryLineupIntro category={category} />

      <div className="col-grid-wrap">
        {loading && !isLaunchApparel ? (
          <div className="col-loading">Loading collection...</div>
        ) : safeProducts.length > 0 ? (
          <div className={isLaunchApparel ? 'col-grid col-grid--concept' : gridClass}>
            {safeProducts.map((product) => (
              isLaunchApparel || product.status === 'preorder' ? (
                <LaunchProductCard product={product} key={product.slug} />
              ) : (
                <ProductCard key={product.slug} product={product} media={mediaMap[product.slug]} deferMediaFetch />
              )
            ))}
          </div>
        ) : (
          <div className="col-empty">
            <p className="col-empty-label">More pieces coming soon.</p>
            <button className="col-empty-cta" onClick={() => navigate('/fight-club')}>
              Join Waitlist
            </button>
          </div>
        )}
      </div>

      <CategoryExtras category={category} />
      <Footer />
    </div>
  );
}
