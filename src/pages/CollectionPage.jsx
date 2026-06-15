import { useNavigate } from 'react-router-dom';
import Header from '../components/Header.jsx';
import ProductCard from '../components/ProductCard.jsx';
import Footer from '../components/Footer.jsx';
import CategoryExtras, { CategoryLineupIntro } from '../components/CategoryExtras.jsx';
import ControlledCategoryHero from '../components/ControlledCategoryHero.jsx';
import { useLiveProducts } from '../hooks/useLiveProducts.js';
import '../styles/collection.css';

export default function CollectionPage({ category, heading, subcopy }) {
  const navigate = useNavigate();
  const { products, loading } = useLiveProducts({ category });
  const safeProducts = products || [];
  const gridClass = safeProducts.length === 1 ? 'col-grid col-grid--single' : 'col-grid';

  return (
    <div className="col-page">
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
        {loading ? (
          <p className="col-meta">Loading...</p>
        ) : safeProducts.length > 0 ? (
          <p className="col-meta">
            {safeProducts.length} {safeProducts.length === 1 ? 'piece' : 'pieces'} · Waitlist open
          </p>
        ) : (
          <p className="col-meta col-meta--empty">New pieces coming soon</p>
        )}
      </div>

      <CategoryLineupIntro category={category} />

      <div className="col-grid-wrap">
        {loading ? (
          <div className="col-loading">Loading collection...</div>
        ) : safeProducts.length > 0 ? (
          <div className={gridClass}>
            {safeProducts.map(p => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        ) : (
          <div className="col-empty">
            <p className="col-empty-label">More pieces coming soon.</p>
            <button className="col-empty-cta" onClick={() => navigate('/drop-001')}>
              View Drop 001
            </button>
          </div>
        )}
      </div>

      <CategoryExtras category={category} />
      <Footer />
    </div>
  );
}
