import { useState } from 'react';
import '../styles/product-gallery.css';

export default function ProductMediaGallery({ gallery = [], productName = '' }) {
  const [active, setActive] = useState(0);
  if (!gallery.length) return null;

  const activeItem = gallery[active];
  // Use explicit isCover flag from useProductMedia if available,
  // otherwise fall back to filename heuristic for legacy local paths
  const coverMode = activeItem.isCover ??
    ['model','campaign','mitts','fighter','uniform','outfit','hover','lifestyle','ring']
      .some(k => (activeItem.src || '').toLowerCase().includes(k));

  return (
    <div className="pmg">
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
              <img src={item.src} alt="" loading="lazy" draggable={false} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
