import { useMemo, useState } from 'react';
import {
  defaultBrandLogo,
  getBrandLogoOverride,
  pageHeroMedia,
  pageMediaAssets,
  resetPageMediaOverride,
  resolveAsset,
  resolvePageMedia,
  saveBrandLogoOverride,
  savePageMediaOverride,
} from '../data/pageMedia.js';
import '../styles/admin-page-media.css';

const pageOrder = ['drop001', 'fightClub', 'apparel', 'footwear', 'equipment'];
const fitOptions = ['cover', 'contain'];
const positionPresets = ['center center', 'center 20%', 'center 30%', 'right center', '70% center', '68% 28%', '72% 18%'];

export default function AdminPageMedia() {
  const [version, setVersion] = useState(0);
  const [activePage, setActivePage] = useState('drop001');
  const [logoOverride, setLogoOverride] = useState(() => getBrandLogoOverride());
  const activeMedia = useMemo(() => resolvePageMedia(activePage), [activePage, version]);
  const activeBase = pageHeroMedia[activePage];
  const activeAsset = resolveAsset(activeMedia.assetId);

  const refresh = () => setVersion(value => value + 1);
  const updatePage = values => {
    savePageMediaOverride(activePage, values);
    refresh();
  };
  const resetPage = () => {
    resetPageMediaOverride(activePage);
    refresh();
  };
  const updateLogo = value => {
    setLogoOverride(value);
    saveBrandLogoOverride(value);
    refresh();
  };

  return (
    <main className="apm">
      <section className="apm__header">
        <div>
          <p className="apm__eyebrow">AURA ADMIN</p>
          <h1>Page Media Control</h1>
          <p>Select hero images, logo source, image fit, and crop position from one place.</p>
        </div>
        <div className="apm__links">
          <a href="/admin">Asset Manager</a>
          <a href="/admin/suppliers">Suppliers</a>
          <a href="/">Open Site</a>
        </div>
      </section>

      <section className="apm__logo-panel">
        <div>
          <p className="apm__eyebrow">Brand Logo</p>
          <h2>Header logo</h2>
          <p>Blank uses the bundled uploaded logo. Paste a public path to override.</p>
        </div>
        <div className="apm__logo-preview">
          <img src={logoOverride || defaultBrandLogo} alt="AURA Fight Club logo preview" />
        </div>
        <div className="apm__field apm__field--full">
          <label htmlFor="logo-source">Logo override</label>
          <input
            id="logo-source"
            value={logoOverride}
            placeholder="Leave blank for uploaded logo asset"
            onChange={event => updateLogo(event.target.value)}
          />
          <button type="button" onClick={() => updateLogo('')}>Reset Logo</button>
        </div>
      </section>

      <section className="apm__body">
        <aside className="apm__tabs" aria-label="Pages">
          {pageOrder.map(pageKey => {
            const page = pageHeroMedia[pageKey];
            return (
              <button
                key={pageKey}
                type="button"
                className={activePage === pageKey ? 'active' : ''}
                onClick={() => setActivePage(pageKey)}
              >
                <span>{page.label}</span>
                <small>{page.pagePath}</small>
              </button>
            );
          })}
        </aside>

        <section className="apm__editor">
          <div className="apm__editor-head">
            <div>
              <p className="apm__eyebrow">Page Hero</p>
              <h2>{activeBase.label}</h2>
              <p>{activeBase.pagePath}</p>
            </div>
            <div className="apm__actions">
              <a href={activeBase.pagePath}>Open Page</a>
              <button type="button" onClick={resetPage}>Reset Page</button>
            </div>
          </div>

          <div className="apm__grid">
            <div className="apm__field">
              <label htmlFor="asset-select">Asset preset</label>
              <select
                id="asset-select"
                value={activeMedia.assetId || ''}
                onChange={event => {
                  const asset = resolveAsset(event.target.value);
                  updatePage({ assetId: event.target.value, image: asset ? '' : activeMedia.image });
                }}
              >
                <option value="">Custom image</option>
                {pageMediaAssets.map(asset => (
                  <option key={asset.id} value={asset.id}>{asset.group} - {asset.label}</option>
                ))}
              </select>
            </div>

            <div className="apm__field">
              <label htmlFor="image-fit">Image fit</label>
              <select id="image-fit" value={activeMedia.imageFit || 'cover'} onChange={event => updatePage({ imageFit: event.target.value })}>
                {fitOptions.map(option => <option key={option} value={option}>{option}</option>)}
              </select>
            </div>

            <div className="apm__field">
              <label htmlFor="image-position">Object position</label>
              <input id="image-position" value={activeMedia.imagePosition || ''} onChange={event => updatePage({ imagePosition: event.target.value })} />
            </div>

            <div className="apm__field">
              <label htmlFor="position-preset">Position preset</label>
              <select id="position-preset" value="" onChange={event => event.target.value && updatePage({ imagePosition: event.target.value })}>
                <option value="">Choose preset</option>
                {positionPresets.map(option => <option key={option} value={option}>{option}</option>)}
              </select>
            </div>

            <div className="apm__field apm__field--full">
              <label htmlFor="custom-image">Custom image path</label>
              <input id="custom-image" value={activeAsset ? '' : activeMedia.image || ''} onChange={event => updatePage({ assetId: '', image: event.target.value })} placeholder="/assets/..." />
            </div>
          </div>

          <div className="apm__preview">
            <img src={activeMedia.image} alt="Selected hero preview" style={{ objectFit: activeMedia.imageFit, objectPosition: activeMedia.imagePosition }} />
            <div className="apm__preview-copy">
              <span>{activeBase.label}</span>
              <strong>{activeMedia.imageFit}</strong>
              <em>{activeMedia.imagePosition}</em>
            </div>
          </div>

          <div className="apm__current">
            <strong>Current image:</strong>
            <code>{activeMedia.image}</code>
          </div>
        </section>
      </section>
    </main>
  );
}
