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
import { applyProductOverride } from '../data/productOverrides.js';
import { makeDuffleProduct } from '../data/duffleProduct.js';
import { makeWaterBottleProduct } from '../data/waterBottleProduct.js';
import { makeNavyTrainingSetProduct } from '../data/navyTrainingSet.js';
import '../styles/collection.css';

const COMMERCE_EQUIPMENT_PRODUCTS = [
  makeDuffleProduct('duffle-bag'),
  makeWaterBottleProduct('aura-steel-water-bottle'),
];

const COMMERCE_APPAREL_PRODUCTS = [
  makeNavyTrainingSetProduct(),
];

const MADE_TO_ORDER_SLUGS = new Set([
  'aura-sleeveless-training-hoodie',
  'aura-fight-club-training-shorts',
]);

function isSameCommerceProduct(product, curatedProduct) {
  const slug = String(product?.slug || '').toLowerCase();
  const name = String(product?.name || product?.title || '').toLowerCase();

  if (slug === curatedProduct.slug) return true;
  if (curatedProduct.slug === 'duffle-bag') {
    return slug.includes('duffle') || name.includes('duffle bag');
  }
  if (curatedProduct.slug === 'aura-steel-water-bottle') {
    return slug.includes('water-bottle') || name.includes('water bottle');
  }
  if (curatedProduct.slug === 'aura-navy-training-set') {
    return slug.includes('navy-training-set') || name.includes('navy training set');
  }
  return false;
}

function mergeEquipmentProducts(liveProducts = []) {
  const remaining = liveProducts.filter((product) => (
    !COMMERCE_EQUIPMENT_PRODUCTS.some((curatedProduct) => isSameCommerceProduct(product, curatedProduct))
  ));

  return [...COMMERCE_EQUIPMENT_PRODUCTS, ...remaining];
}

function mergeApparelProducts(apparelProducts = []) {
  const remaining = apparelProducts.filter((product) => (
    !MADE_TO_ORDER_SLUGS.has(product.slug)
    && !COMMERCE_APPAREL_PRODUCTS.some((curatedProduct) => isSameCommerceProduct(product, curatedProduct))
  ));

  return [...COMMERCE_APPAREL_PRODUCTS, ...remaining];
}

function getCategoryMeta(category, count) {
  const key = String(category || '').toLowerCase();

  if (key === 'apparel') {
    return `${count} faster-delivery core pieces`;
  }

  if (key === 'footwear') {
    return count > 0 ? `${count} upcoming footwear previews` : 'Upcoming footwear previews';
  }

  if (key === 'equipment') {
    return count > 0 ? `${count} training accessories` : 'Accessories coming soon';
  }

  return count > 0 ? `${count} pieces` : 'New pieces coming soon';
}

export default function CollectionPage({ category, heading, subcopy }) {
  const navigate = useNavigate();
  const { products, loading } = useLiveProducts({ category });
  const { mediaMap } = useAllProductMedia();
  const key = String(category || '').toLowerCase();
  const isLaunchApparel = key === 'apparel';
  const sourceProducts = isLaunchApparel
    ? mergeApparelProducts(dropOneApparelProducts)
    : key === 'equipment'
      ? mergeEquipmentProducts(products || [])
      : (products || []);
  const safeProducts = sourceProducts.map(applyProductOverride);
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
            {getCategoryMeta(category, safeProducts.length)}
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
              isLaunchApparel ? (
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
          <p>Custom gloves, ringwear, fight shorts, and selected outerwear are kept in a separate pre-order collection.</p>
          <button className="col-empty-cta" onClick={() => navigate('/pre-orders')}>Explore Pre-Orders</button>
        </section>
      )}

      <CategoryExtras category={category} />
      <Footer />
    </div>
  );
}
