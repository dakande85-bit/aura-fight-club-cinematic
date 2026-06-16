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
const MAX_UPLOAD_SIZE = 2400;
const UPLOAD_QUALITY = 0.86;

const focusOptions = [
  { label: 'Top left', value: 'left top' },
  { label: 'Top', value: 'center top' },
  { label: 'Top right', value: 'right top' },
  { label: 'Left', value: 'left center' },
  { label: 'Centre', value: 'center center' },
  { label: 'Right', value: 'right center' },
  { label: 'Bottom left', value: 'left bottom' },
  { label: 'Bottom', value: 'center bottom' },
  { label: 'Bottom right', value: 'right bottom' },
];

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Could not read image file'));
    reader.readAsDataURL(file);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Could not load selected image'));
    image.src = src;
  });
}

async function prepareImageFile(file, { preserveOriginal = false } = {}) {
  if (!file) throw new Error('No file selected');
  if (!file.type.startsWith('image/')) throw new Error('Please select an image file');

  const originalDataUrl = await readFileAsDataUrl(file);

  if (preserveOriginal || file.type === 'image/svg+xml') {
    return originalDataUrl;
  }

  const image = await loadImage(originalDataUrl);
  const naturalWidth = image.naturalWidth || image.width;
  const naturalHeight = image.naturalHeight || image.height;
  const scale = Math.min(1, MAX_UPLOAD_SIZE / Math.max(naturalWidth, naturalHeight));
  const width = Math.max(1, Math.round(naturalWidth * scale));
  const height = Math.max(1, Math.round(naturalHeight * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) return originalDataUrl;
  context.drawImage(image, 0, 0, width, height);

  return canvas.toDataURL('image/webp', UPLOAD_QUALITY);
}

export default function AdminPageMedia() {
  const [version, setVersion] = useState(0);
  const [activePage, setActivePage] = useState('drop001');
  const [logoOverride, setLogoOverride] = useState(() => getBrandLogoOverride());
  const [uploadMessage, setUploadMessage] = useState('');
  const activeMedia = useMemo(() => resolvePageMedia(activePage), [activePage, version]);
  const activeBase = pageHeroMedia[activePage];
  const activeAsset = resolveAsset(activeMedia.assetId);
  const selectedFocus = activeMedia.imagePosition || 'center center';

  const refresh = () => setVersion(value => value + 1);

  const updatePage = values => {
    try {
      savePageMediaOverride(activePage, values);
      refresh();
    } catch (error) {
      setUploadMessage('Save failed. Try a smaller image or use a public image path.');
    }
  };

  const resetPage = () => {
    resetPageMediaOverride(activePage);
    setUploadMessage('Page reset to default media and centre crop.');
    refresh();
  };

  const updateLogo = value => {
    try {
      setLogoOverride(value);
      saveBrandLogoOverride(value);
      refresh();
    } catch (error) {
      setUploadMessage('Logo save failed. Try a smaller image or use a public image path.');
    }
  };

  async function handleLogoUpload(event) {
    const file = event.target.files?.[0];
    try {
      const dataUrl = await prepareImageFile(file, { preserveOriginal: true });
      updateLogo(dataUrl);
      setUploadMessage(`Logo uploaded for local preview: ${file.name}`);
    } catch (error) {
      setUploadMessage(error.message || 'Logo upload failed.');
    } finally {
      event.target.value = '';
    }
  }

  async function handleHeroUpload(event) {
    const file = event.target.files?.[0];
    try {
      const dataUrl = await prepareImageFile(file);
      updatePage({ assetId: '', image: dataUrl, imagePosition: 'center center' });
      setUploadMessage(`Hero image uploaded for ${activeBase.label}: ${file.name}`);
    } catch (error) {
      setUploadMessage(error.message || 'Hero image upload failed.');
    } finally {
      event.target.value = '';
    }
  }

  return (
    <main className="apm">
      <section className="apm__header">
        <div>
          <p className="apm__eyebrow">AURA ADMIN</p>
          <h1>Page Media Control</h1>
          <p>Clean hero media system: one image source, one crop model, one focal point. No zoom hacks, no contain mode, no preset conflicts.</p>
          <p className="apm__warning">Best practice: use a wide 16:9 or 21:9 hero image around 2400px wide. The crop window below matches the real hero behaviour.</p>
        </div>
        <div className="apm__links">
          <a href="/admin/launch">Launch</a>
          <a href="/admin">Asset Manager</a>
          <a href="/admin/suppliers">Suppliers</a>
          <a href="/">Open Site</a>
        </div>
      </section>

      {uploadMessage && <div className="apm__notice">{uploadMessage}</div>}

      <section className="apm__logo-panel">
        <div>
          <p className="apm__eyebrow">Brand Logo</p>
          <h2>Header logo</h2>
          <p>Blank uses the bundled brand logo. Paste a public path or upload an image for local preview.</p>
        </div>
        <div className="apm__logo-preview">
          <img src={logoOverride || defaultBrandLogo} alt="AURA Fight Club logo preview" />
        </div>
        <div className="apm__field apm__field--full">
          <label htmlFor="logo-source">Logo override</label>
          <input
            id="logo-source"
            value={logoOverride}
            placeholder="Leave blank for bundled logo asset"
            onChange={event => updateLogo(event.target.value)}
          />
          <div className="apm__upload-row">
            <label className="apm__file-label" htmlFor="logo-upload">Upload Logo</label>
            <input id="logo-upload" type="file" accept="image/*" className="apm__real-file" onChange={handleLogoUpload} />
            <button type="button" onClick={() => updateLogo('')}>Reset Logo</button>
          </div>
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

          <div className="apm__preview" aria-label="Hero crop preview">
            <img
              className="apm__preview-image"
              src={activeMedia.image}
              alt="Selected hero crop preview"
              style={{ objectPosition: selectedFocus }}
            />
            <div className="apm__preview-copy">
              <span>{activeBase.label}</span>
              <strong>Cover crop</strong>
              <em>{selectedFocus}</em>
            </div>
          </div>

          <div className="apm__grid">
            <div className="apm__field">
              <label htmlFor="asset-select">Saved image</label>
              <select
                id="asset-select"
                value={activeMedia.assetId || ''}
                onChange={event => {
                  const asset = resolveAsset(event.target.value);
                  updatePage({ assetId: event.target.value, image: asset ? '' : activeMedia.image, imagePosition: 'center center' });
                }}
              >
                <option value="">Custom image</option>
                {pageMediaAssets.map(asset => (
                  <option key={asset.id} value={asset.id}>{asset.group} - {asset.label}</option>
                ))}
              </select>
            </div>

            <div className="apm__field">
              <label>Focal point</label>
              <div className="apm__focus-grid" role="group" aria-label="Hero focal point">
                {focusOptions.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    className={selectedFocus === option.value ? 'active' : ''}
                    onClick={() => updatePage({ imagePosition: option.value })}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="apm__field apm__field--full">
              <label htmlFor="image-position">Manual focal point</label>
              <input
                id="image-position"
                value={selectedFocus}
                placeholder="Examples: center center, 60% center, center top"
                onChange={event => updatePage({ imagePosition: event.target.value })}
              />
              <small className="apm__hint">This is standard CSS object-position. Use values such as center center, right center, 65% center, center top.</small>
            </div>

            <div className="apm__field apm__field--full">
              <label htmlFor="custom-image">Custom image path or uploaded image</label>
              <input id="custom-image" value={activeAsset ? '' : activeMedia.image || ''} onChange={event => updatePage({ assetId: '', image: event.target.value })} placeholder="/assets/... or uploaded data image" />
              <div className="apm__upload-row">
                <label className="apm__file-label" htmlFor={`hero-upload-${activePage}`}>Upload New Image</label>
                <input key={activePage} id={`hero-upload-${activePage}`} type="file" accept="image/*" className="apm__real-file" onChange={handleHeroUpload} />
                <button type="button" onClick={() => updatePage({ assetId: '', image: '', imagePosition: 'center center' })}>Clear Custom Image</button>
              </div>
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
