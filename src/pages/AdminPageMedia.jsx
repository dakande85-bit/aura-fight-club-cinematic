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
const fitOptions = [
  { value: 'contain', label: 'Full image / no crop' },
  { value: 'cover', label: 'Fill hero / crop allowed' },
];
const MAX_UPLOAD_SIZE = 1800;
const UPLOAD_QUALITY = 0.82;

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

function clampScale(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 1;
  return Math.min(2, Math.max(0.55, parsed));
}

async function prepareImageFile(file, { preserveOriginal = false } = {}) {
  if (!file) throw new Error('No file selected');
  if (!file.type.startsWith('image/')) throw new Error('Please select an image file');

  const originalDataUrl = await readFileAsDataUrl(file);

  if (preserveOriginal || file.type === 'image/svg+xml') {
    return originalDataUrl;
  }

  const image = await loadImage(originalDataUrl);
  const scale = Math.min(1, MAX_UPLOAD_SIZE / Math.max(image.naturalWidth || image.width, image.naturalHeight || image.height));
  const width = Math.max(1, Math.round((image.naturalWidth || image.width) * scale));
  const height = Math.max(1, Math.round((image.naturalHeight || image.height) * scale));

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
  const activeFit = activeMedia.imageFit === 'cover' ? 'cover' : 'contain';
  const activeScale = clampScale(activeMedia.imageScale);

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
    setUploadMessage('Page reset to default media.');
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
      updatePage({ assetId: '', image: dataUrl, imageFit: 'contain', imagePosition: 'center center', imageScale: 1 });
      setUploadMessage(`Hero image uploaded in full-image/no-crop mode for ${activeBase.label}: ${file.name}`);
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
          <p>Simple controls only: choose an image, choose full image or fill hero, then adjust zoom and focal point.</p>
          <p className="apm__warning">Preset crop buttons were removed because they were unreliable. Use the manual controls below.</p>
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
          <p>Blank uses the bundled uploaded logo. Paste a public path or select an image for local preview.</p>
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

          <div className="apm__grid">
            <div className="apm__field">
              <label htmlFor="asset-select">Saved image</label>
              <select
                id="asset-select"
                value={activeMedia.assetId || ''}
                onChange={event => {
                  const asset = resolveAsset(event.target.value);
                  updatePage({ assetId: event.target.value, image: asset ? '' : activeMedia.image, imageScale: 1, imagePosition: 'center center' });
                }}
              >
                <option value="">Custom image</option>
                {pageMediaAssets.map(asset => (
                  <option key={asset.id} value={asset.id}>{asset.group} - {asset.label}</option>
                ))}
              </select>
            </div>

            <div className="apm__field">
              <label htmlFor="image-fit">Image layout</label>
              <select id="image-fit" value={activeFit} onChange={event => updatePage({ imageFit: event.target.value, imageScale: 1 })}>
                {fitOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </div>

            <div className="apm__field">
              <label htmlFor="image-position">Focal point</label>
              <input
                id="image-position"
                value={activeMedia.imagePosition || 'center center'}
                placeholder="Examples: center center, 60% center, center top"
                onChange={event => updatePage({ imagePosition: event.target.value })}
              />
            </div>

            <div className="apm__field">
              <label htmlFor="image-scale">Image zoom / size: {Math.round(activeScale * 100)}%</label>
              <input
                id="image-scale"
                type="range"
                min="0.55"
                max="2"
                step="0.05"
                value={activeScale}
                onChange={event => updatePage({ imageScale: Number(event.target.value) })}
              />
              <small className="apm__hint">100% shows the normal image. More than 100% intentionally zooms/crops.</small>
            </div>

            <div className="apm__field apm__field--full">
              <label htmlFor="custom-image">Custom image path or uploaded image</label>
              <input id="custom-image" value={activeAsset ? '' : activeMedia.image || ''} onChange={event => updatePage({ assetId: '', image: event.target.value, imageScale: 1 })} placeholder="/assets/... or uploaded data image" />
              <div className="apm__upload-row">
                <label className="apm__file-label" htmlFor={`hero-upload-${activePage}`}>Upload New Image</label>
                <input key={activePage} id={`hero-upload-${activePage}`} type="file" accept="image/*" className="apm__real-file" onChange={handleHeroUpload} />
                <button type="button" onClick={() => updatePage({ assetId: '', image: '', imageFit: 'contain', imagePosition: 'center center', imageScale: 1 })}>Clear Custom Image</button>
              </div>
            </div>
          </div>

          <div className={`apm__preview apm__preview--${activeFit}`}>
            {activeFit === 'contain' && <img className="apm__preview-backdrop" src={activeMedia.image} alt="" aria-hidden="true" />}
            <img
              className="apm__preview-image"
              src={activeMedia.image}
              alt="Selected hero preview"
              style={{ objectFit: activeFit, objectPosition: activeMedia.imagePosition, '--apm-preview-scale': activeScale }}
            />
            <div className="apm__preview-copy">
              <span>{activeBase.label}</span>
              <strong>{activeFit === 'contain' ? 'Full image / no crop' : 'Fill hero / crop allowed'}</strong>
              <em>{activeMedia.imagePosition}</em>
              <em>{Math.round(activeScale * 100)}%</em>
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
