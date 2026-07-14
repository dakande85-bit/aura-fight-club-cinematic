import { useNavigate } from 'react-router-dom';
import Header from '../components/Header.jsx';
import ProductCard from '../components/ProductCard.jsx';
import Footer from '../components/Footer.jsx';
import CategoryExtras, { CategoryLineupIntro } from '../components/CategoryExtras.jsx';
import ControlledCategoryHero from '../components/ControlledCategoryHero.jsx';
import LaunchProductCard from '../components/LaunchProductCard.jsx';
import { useLiveProducts } from '../hooks/useLiveProducts.js';
import { useAllProductMedia } from '../hooks/useProductMedia.js';
import {
  activeApparelProducts,
  activeEquipmentProducts,
} from '../data/activeShopifyProducts.js';
import '../styles/collection.css';

function getCategoryMeta(category, count) {
  const key = String(category || '').toLowerCase();

  if (key === 'apparel') return `${count} active Shopify apparel products`;
  if (key === 'equipment') return `${count} active Shopify training accessories`;
  if (key === 'footwear') {
    return count > 0 ? `${count} upcoming footwear previews` : 'Upcoming footwear previews';
  }
  return count > 0 ? `${count} pieces` : 'New pieces coming soon';
}

export default function CollectionPage({ category, heading, subcopy }) {
  const navigate = useNavigate();
  const { products, loading } = useLiveProducts({ category });
  const { mediaMap } = useAllProductMedia();
  const key = String(category || '').toLowerCase();
  const isActiveCommerceCategory = key === 'apparel' || key === 'equipment';
  const sourceProducts = key === 'apparel'
    ? activeApparelProducts
    : key === 'equipment'
      ? activeEquipmentProducts
      : (products || []);
  const gridClass = sourceProducts.length === 1 ? 'col-grid col-grid--single' : 'col-grid';

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
        {loading && !isActiveCommerceCategory ? (
          <p className="col-meta">Loading...</p>
        ) : (
          <p className={sourceProducts.length > 0 ? 'col-meta' : 'col-meta col-meta--empty'}>
            {getCategoryMeta(category, sourceProducts.length)}
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
        {loading && !isActiveCommerceCategory ? (
          <div className="col-loading">Loading collection...</div>
        ) : sourceProducts.length > 0 ? (
          <div className={isActiveCommerceCategory ? 'col-grid col-grid--concept' : gridClass}>
            {sourceProducts.map((product) => (
              isActiveCommerceCategory ? (
                <LaunchProductCard product={product} key={product.slug} />
              ) : (
                <ProductCard key={product.slug} product={product} media={mediaMap[product.slug]} deferMediaFetch />
              )
            ))}
          </div>
        ) : (
          <div className="col-empty">
            <p className="col-empty-label">More pieces coming soon.</p>
            <button className="col-empty-cta" onClick={() => navigate('/fight-club')}>Join Waitlist</button>
          </div>
        )}
      </div>

      {(key === 'apparel' || key === 'equipment') && (
        <section className="col-empty" aria-label="Made-to-order collection">
          <p className="col-eyebrow">Slower delivery / made to order</p>
          <h2>Looking for specialist fight pieces?</h2>
          <p>Custom gloves, women’s fightwear and selected training pieces are kept in the active pre-order collection.</p>
          <button className="col-empty-cta" onClick={() => navigate('/pre-orders')}>Explore Pre-Orders</button>
        </section>
      )}

      <CategoryExtras category={category} />
      <Footer />
    </div>
  );
}
