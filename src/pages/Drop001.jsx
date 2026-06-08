import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard.jsx';
import { liveProducts } from '../data/products.js';
import '../styles/drop001.css';

export default function Drop001() {
  const navigate = useNavigate();

  return (
    <div className="d001">
      {/* Back to homepage */}
      <button className="d001__back" onClick={() => navigate('/')}>
        ← AURA Fight Club
      </button>

      {/* Header */}
      <div className="d001__header">
        <p className="d001__eyebrow">AURA Fight Club</p>
        <h1 className="d001__title">Drop 001</h1>
        <p className="d001__sub">
          The first uniform of AURA Fight Club.<br />
          Tools for the work nobody sees.
        </p>
        <div className="d001__divider" />
        <p className="d001__meta">
          {liveProducts.length} pieces · Waitlist open · Limited run
        </p>
      </div>

      {/* Product grid — cards navigate to /product/:slug */}
      <div className="d001__grid">
        {liveProducts.map(product => (
          <ProductCard
            key={product.slug}
            product={product}
          />
        ))}
      </div>
    </div>
  );
}
