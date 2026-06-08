import { useState } from 'react';
import ProductMediaGallery from '../components/ProductMediaGallery.jsx';
import '../styles/product-detail.css';

export default function ProductDetail({ product, onBack }) {
  const [email, setEmail]       = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!product) {
    return (
      <div className="pd-empty">
        <p>Product not found.</p>
        {onBack && <button className="pd-back" onClick={onBack}>← Back</button>}
      </div>
    );
  }

  const statusLabel = {
    waitlist:  'Waitlist Open',
    available: 'Available Now',
    'sold-out':'Sold Out',
  }[product.status] ?? 'Coming Soon';

  return (
    <div className="pd">
      {/* Back nav */}
      {onBack && (
        <button className="pd-back" onClick={onBack}>
          ← Drop 001
        </button>
      )}

      <div className="pd__inner">
        {/* Left — gallery */}
        <div className="pd__gallery">
          <ProductMediaGallery
            gallery={product.gallery}
            productName={product.name}
          />
        </div>

        {/* Right — info */}
        <div className="pd__info">
          {/* Breadcrumb */}
          <p className="pd__crumb">
            {product.collection} · {product.category}
          </p>

          <h1 className="pd__name">{product.name}</h1>

          <span className="pd__badge">{statusLabel}</span>

          <p className="pd__short">{product.shortDesc}</p>

          {/* Description */}
          <div className="pd__divider" />
          <p className="pd__desc">{product.description}</p>

          {/* Details list */}
          {product.details?.length > 0 && (
            <ul className="pd__details">
              {product.details.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          )}

          <div className="pd__divider" />

          {/* CTA */}
          {product.status === 'waitlist' && (
            <div className="pd__waitlist">
              <p className="pd__waitlist-label">Join the waitlist for Drop 001</p>
              {!submitted ? (
                <div className="pd__form">
                  <input
                    className="pd__email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    aria-label="Email address"
                  />
                  <button
                    className="pd__submit"
                    onClick={() => email && setSubmitted(true)}
                  >
                    Join Waitlist
                  </button>
                </div>
              ) : (
                <p className="pd__confirm">YOU'RE ON THE LIST.</p>
              )}
            </div>
          )}

          {product.status === 'available' && (
            <button className="pd__buy">View Product</button>
          )}
        </div>
      </div>
    </div>
  );
}
