import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard.jsx';
import { liveProducts } from '../data/products.js';
import '../styles/collection.css';

export default function CollectionPage({ category, heading, subcopy }) {
  const navigate  = useNavigate();
  const products  = liveProducts.filter(p => p.category === category);

  return (
    <div className="col-page">
      <button className="col-back" onClick={() => navigate('/')}>
        ← AURA Fight Club
      </button>

      <div className="col-header">
        <p className="col-eyebrow">AURA Fight Club</p>
        <h1 className="col-title">{heading}</h1>
        <p className="col-sub">{subcopy}</p>
        <div className="col-divider" />
        {products.length > 0 ? (
          <p className="col-meta">{products.length} {products.length === 1 ? 'piece' : 'pieces'} · Waitlist open</p>
        ) : (
          <p className="col-meta col-meta--empty">New pieces coming in Drop 001</p>
        )}
      </div>

      {products.length > 0 ? (
        <div className="col-grid">
          {products.map(p => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      ) : (
        <div className="col-empty">
          <p className="col-empty-label">More pieces coming soon.</p>
          <button className="col-empty-cta" onClick={() => navigate('/drop-001')}>
            View Drop 001 →
          </button>
        </div>
      )}
    </div>
  );
}
