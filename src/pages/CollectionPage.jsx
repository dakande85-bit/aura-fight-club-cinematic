import { useNavigate } from 'react-router-dom';
import Header from '../components/Header.jsx';
import ProductCard from '../components/ProductCard.jsx';
import Footer from '../components/Footer.jsx';
import CategoryExtras, { CategoryLineupIntro } from '../components/CategoryExtras.jsx';
import ControlledCategoryHero from '../components/ControlledCategoryHero.jsx';
import { useLiveProducts } from '../hooks/useLiveProducts.js';
import { useAllProductMedia } from '../hooks/useProductMedia.js';
import { dropOneProducts } from '../data/products.js';
import apparelFeatureImage from '../assets/generated/fightClubHeroUserAttachedData.js';
import '../styles/collection.css';

export default function CollectionPage({ category, heading, subcopy }) {
  const navigate = useNavigate();
  const { products, loading } = useLiveProducts({ category });
  const { mediaMap } = useAllProductMedia();
  const key = String(category || '').toLowerCase();
  const isLaunchApparel = key === 'apparel';
  const isFutureCategory = key === 'footwear' || key === 'equipment';
  const dropOneApparel = dropOneProducts.filter((product) => ['T-Shirt', 'Hoodie', 'Joggers', 'Tank Top'].includes(product.category));
  const safeProducts = isLaunchApparel ? dropOneApparel : (products || []);
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
        ) : safeProducts.length > 0 ? (
          <p className="col-meta">
            {isLaunchApparel
              ? `${safeProducts.length} POD candidates - Men & Women - Drop 001`
              : `${safeProducts.length} ${safeProducts.length === 1 ? 'candidate' : 'candidates'} - Drop 002 - Supplier sample required`}
          </p>
        ) : (
          <p className="col-meta col-meta--empty">
            {isFutureCategory ? 'Drop 002 pipeline - Supplier sample required' : 'New pieces coming soon'}
          </p>
        )}
      </div>

      {key === 'apparel' && (
        <section className="col-feature-media" aria-label="AURA apparel editorial image">
          <img src={apparelFeatureImage} alt="AURA Fight Club apparel editorial" />
        </section>
      )}

      <CategoryLineupIntro category={category} />

      <div className="col-grid-wrap">
        {loading && !isLaunchApparel ? (
          <div className="col-loading">Loading collection...</div>
        ) : isLaunchApparel ? (
          <div className="col-grid col-grid--concept">
            {safeProducts.map((product) => (
              <article className="col-concept-card" key={product.name}>
                <p>{product.category}</p>
                <h2>{product.name}</h2>
                <span>{product.audience}</span>
                <small>{product.status}</small>
              </article>
            ))}
          </div>
        ) : safeProducts.length > 0 ? (
          <div className={gridClass}>
            {safeProducts.map((product) => (
              <ProductCard key={product.slug} product={product} media={mediaMap[product.slug]} deferMediaFetch />
            ))}
          </div>
        ) : (
          <div className="col-empty">
            <p className="col-empty-label">More pieces coming soon.</p>
            <button className="col-empty-cta" onClick={() => navigate('/drops')}>
              View Drops
            </button>
          </div>
        )}
      </div>

      {isFutureCategory && (
        <section className="col-pipeline-note" aria-label={`${heading} launch status`}>
          <p>{heading} remains visible as the next phase of AURA, but it is not part of Drop 001.</p>
          <p>These pieces are Drop 002 candidates and stay marked supplier sample required until materials, fit, sizing, and production quality are approved.</p>
        </section>
      )}

      <CategoryExtras category={category} />
      <Footer />
    </div>
  );
}
