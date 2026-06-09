import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard.jsx';
import { useLiveProducts } from '../hooks/useLiveProducts.js';
import '../styles/drop001.css';

export default function Drop001() {
  const navigate = useNavigate();
  const { products, loading } = useLiveProducts({ collection: 'Drop 001' });

  return (
    <div className="d001">
      {/* Hero band */}
      <div className="d001__hero">
        <button className="d001__back" onClick={() => navigate('/')}>
          ← AURA Fight Club
        </button>
        <p className="d001__eyebrow">AURA Fight Club</p>
        <h1 className="d001__title">Drop 001</h1>
        <p className="d001__sub">
          The first uniform of AURA Fight Club.<br />
          Tools for the work nobody sees.
        </p>
        <div className="d001__chrome" />
        <p className="d001__meta">
          {loading
            ? 'Loading…'
            : `${products.length} ${products.length === 1 ? 'piece' : 'pieces'} · Waitlist open · Limited run`
          }
        </p>
      </div>

      {/* Grid — sourced from Supabase, controlled by /admin */}
      <div className="d001__grid-wrap">
        {loading ? (
          <div className="d001__loading">Loading collection…</div>
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
    </div>
  );
}
