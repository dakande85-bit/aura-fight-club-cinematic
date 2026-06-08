import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard.jsx';
import { liveProducts } from '../data/products.js';
import '../styles/drop001.css';

export default function Drop001() {
  const navigate = useNavigate();

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
          {liveProducts.length} pieces · Waitlist open · Limited run
        </p>
      </div>

      {/* Grid — only liveProducts (mediaStatus === 'live') */}
      <div className="d001__grid-wrap">
        <div className="d001__grid">
          {liveProducts.map(p => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
