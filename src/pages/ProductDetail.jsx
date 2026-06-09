import { useState } from 'react';
import { useProductMedia } from '../hooks/useProductMedia.js';
import ProductMediaGallery from '../components/ProductMediaGallery.jsx';
import '../styles/product-detail.css';

export default function ProductDetail({ product, onBack }) {
  const [email,     setEmail]     = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { media, loading } = useProductMedia(product?.slug);

  if (!product) {
    return (
      <div className="pd-empty">
        <p>Product not found.</p>
        {onBack && <button className="pd-back" onClick={onBack}>← Drop 001</button>}
      </div>
    );
  }

  // Supabase gallery takes priority; fall back to local product data
  const gallery = media?.gallery?.length
    ? media.gallery
    : product.gallery;

  const statusLabel = {
    waitlist:   'Waitlist Open',
    available:  'Available Now',
    'sold-out': 'Sold Out',
  }[product.status] ?? 'Coming Soon';

  return (
    <div className="pd">
      <nav className="pd-nav">
        {onBack && <button className="pd-back" onClick={onBack}>← Drop 001</button>}
        <span className="pd-nav-logo">AURA</span>
      </nav>
      <div className="pd__inner">
        <div className="pd__gallery-col">
          {loading
            ? <div className="pd__gallery-loading">Loading…</div>
            : <ProductMediaGallery gallery={gallery} productName={product.name} />
          }
        </div>
        <div className="pd__info">
          <p className="pd__crumb">{product.collection} · {product.category}</p>
          <h1 className="pd__name">{product.name}</h1>
          <span className="pd__badge">{statusLabel}</span>
          <p className="pd__short">{product.shortDesc}</p>
          <div className="pd__divider" />
          <p className="pd__desc">{product.description}</p>
          {product.details?.length > 0 && (
            <ul className="pd__details">
              {product.details.map((d, i) => <li key={i}>{d}</li>)}
            </ul>
          )}
          <div className="pd__divider" />
          {product.status === 'waitlist' && (
            <div className="pd__waitlist">
              <p className="pd__waitlist-label">Join the waitlist — Drop 001</p>
              {!submitted ? (
                <div className="pd__form">
                  <input className="pd__email" type="email" placeholder="Enter your email"
                    value={email} onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && email && setSubmitted(true)}
                    aria-label="Email address" />
                  <button className="pd__submit" onClick={() => email && setSubmitted(true)}>
                    Join Waitlist
                  </button>
                </div>
              ) : <p className="pd__confirm">YOU'RE ON THE LIST.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
