import { useState } from 'react';
import ProductCard from '../components/ProductCard.jsx';
import ProductDetail from './ProductDetail.jsx';
import { liveProducts } from '../data/products.js';
import '../styles/drop001.css';

export default function Drop001() {
  const [selected, setSelected] = useState(null);

  if (selected) {
    return (
      <ProductDetail
        product={selected}
        onBack={() => setSelected(null)}
      />
    );
  }

  return (
    <div className="d001">
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

      {/* Product grid */}
      <div className="d001__grid">
        {liveProducts.map(product => (
          <ProductCard
            key={product.slug}
            product={product}
            onClick={setSelected}
          />
        ))}
      </div>
    </div>
  );
}
