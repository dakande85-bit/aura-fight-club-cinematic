import { useState } from 'react';
import '../styles/product-gallery.css';

export default function ProductMediaGallery({ gallery = [], productName = '' }) {
  const [active, setActive] = useState(0);

  if (!gallery.length) return null;

  return (
    <div className="pmg">
      {/* Main image */}
      <div className="pmg__main">
        <img
          key={active}
          src={gallery[active].src}
          alt={gallery[active].alt || productName}
          className="pmg__main-img"
          loading="eager"
          draggable={false}
        />
      </div>

      {/* Thumbnails */}
      {gallery.length > 1 && (
        <div className="pmg__thumbs" role="listbox" aria-label="Product images">
          {gallery.map((item, i) => (
            <button
              key={i}
              className={`pmg__thumb${i === active ? ' pmg__thumb--active' : ''}`}
              onClick={() => setActive(i)}
              aria-label={item.alt || `Image ${i + 1}`}
              aria-selected={i === active}
              role="option"
            >
              <img
                src={item.src}
                alt={item.alt || `Thumbnail ${i + 1}`}
                loading="lazy"
                draggable={false}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
