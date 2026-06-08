import { useState } from 'react';
import '../styles/product-gallery.css';

// Heuristic: if src contains these keywords, use cover fit (lifestyle shots)
const COVER_KEYWORDS = ['model', 'campaign', 'mitts', 'fighter', 'hover', 'uniform', 'outfit'];
const isCover = src => COVER_KEYWORDS.some(k => src.toLowerCase().includes(k));

export default function ProductMediaGallery({ gallery = [], productName = '' }) {
  const [active, setActive] = useState(0);
  if (!gallery.length) return null;

  const activeItem = gallery[active];
  const coverMode  = isCover(activeItem.src);

  return (
    <div className="pmg">
      {/* Main image */}
      <div className="pmg__main">
        <img
          key={active}
          src={activeItem.src}
          alt={activeItem.alt || productName}
          className={`pmg__main-img${coverMode ? ' pmg__main-img--cover' : ''}`}
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
                alt=""
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
