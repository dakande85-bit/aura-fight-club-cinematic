import { useEffect, useMemo, useState } from 'react';
import { Eye, EyeOff, RotateCcw, Trash2, Upload } from 'lucide-react';
import { auraAssetReport, homepageMediaEntries } from '../data/auraMediaManifest.js';

const PREVIEW_KEY = 'aura:cinematic-preview-overrides';
const HERO_PREVIEW_KEY = 'aura:cinematic-preview-hero-id';

const isVideo = (entry) => entry.type === 'video';

function readPreviewState() {
  try {
    return JSON.parse(window.localStorage.getItem(PREVIEW_KEY) || '{}');
  } catch {
    return {};
  }
}

export default function AdminCinematic() {
  const [selectedId, setSelectedId] = useState(homepageMediaEntries[0]?.id ?? '');
  const [previewOverrides, setPreviewOverrides] = useState(() => readPreviewState());
  const [heroPreviewId, setHeroPreviewId] = useState(() => window.localStorage.getItem(HERO_PREVIEW_KEY) || 'home-hero-ring');
  const [pasteValue, setPasteValue] = useState('');
  const [uploadNotice, setUploadNotice] = useState('');

  useEffect(() => {
    window.localStorage.setItem(PREVIEW_KEY, JSON.stringify(previewOverrides));
  }, [previewOverrides]);

  useEffect(() => {
    window.localStorage.setItem(HERO_PREVIEW_KEY, heroPreviewId);
  }, [heroPreviewId]);

  const rows = useMemo(
    () => homepageMediaEntries.map((entry) => ({ ...entry, ...(previewOverrides[entry.id] ?? {}) })),
    [previewOverrides]
  );
  const selected = rows.find((entry) => entry.id === selectedId) ?? rows[0];

  const updateSelected = (patch) => {
    if (!selected) return;
    setPreviewOverrides((current) => ({
      ...current,
      [selected.id]: {
        ...(current[selected.id] ?? {}),
        ...patch,
        previewOnly: true
      }
    }));
  };

  const replaceWithPath = () => {
    if (!pasteValue.trim()) return;
    updateSelected({ source: pasteValue.trim(), label: `${selected.label} preview`, status: 'active' });
    setPasteValue('');
    setUploadNotice('Browser preview only. This does not update production for visitors.');
  };

  const handleUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    updateSelected({
      source: objectUrl,
      type: file.type.startsWith('video/') ? 'video' : 'image',
      label: `${selected.label} local upload preview`,
      status: 'active',
      localUploadName: file.name
    });
    setUploadNotice('Local upload preview only. Add this file to the repo or connect storage for permanence.');
    event.target.value = '';
  };

  const toggleHidden = () => {
    updateSelected({ status: selected.status === 'hidden' ? 'active' : 'hidden' });
  };

  const deleteReplacement = () => {
    if (!selected) return;
    setPreviewOverrides((current) => {
      const next = { ...current };
      delete next[selected.id];
      return next;
    });
    setUploadNotice('Preview replacement deleted. Production source restored in this browser.');
  };

  const restoreDefault = () => {
    deleteReplacement();
    if (selected?.role === 'homepageHero') {
      setHeroPreviewId('home-hero-ring');
    }
  };

  const setAsHomepageHero = () => {
    if (!selected) return;
    setHeroPreviewId(selected.id);
    setUploadNotice('Homepage hero selection saved as browser preview only. Production still reads the repo manifest.');
  };

  return (
    <main className="admin-cinematic">
      <header className="admin-cinematic-hero">
        <div>
          <p>Backend Media Manager</p>
          <h1>Cinematic Media Control</h1>
          <span>Production assets are controlled by the repo manifest. Browser uploads and pasted paths are preview-only until real storage is connected.</span>
        </div>
        <a href="/">Open homepage</a>
      </header>

      <section className="admin-status-grid">
        <StatusCard label="Image assets found" value={auraAssetReport.totals.images} />
        <StatusCard label="Video assets found" value={auraAssetReport.totals.videos} />
        <StatusCard label="Active manifest entries" value={auraAssetReport.totals.activeManifestEntries} />
        <StatusCard label="Hidden manifest entries" value={auraAssetReport.totals.hiddenManifestEntries} />
      </section>

      <section className="admin-cinematic-layout">
        <div className="admin-media-list">
          <div className="admin-panel-heading">
            <div>
              <p>Homepage / cinematic media</p>
              <h2>Manifest entries</h2>
            </div>
            <span>{rows.length} entries</span>
          </div>

          <div className="admin-media-table">
            {rows.map((entry) => (
              <button
                type="button"
                key={entry.id}
                className={entry.id === selectedId ? 'admin-media-row is-selected' : 'admin-media-row'}
                onClick={() => setSelectedId(entry.id)}
              >
                <Preview entry={entry} />
                <span>
                  <strong>{entry.label}</strong>
                  <em>{entry.id}</em>
                </span>
                <b>{entry.type}</b>
                <i className={entry.status === 'hidden' ? 'is-hidden' : ''}>{entry.status}</i>
                <small>{entry.previewOnly ? 'Browser preview only' : 'Production asset'}</small>
              </button>
            ))}
          </div>
        </div>

        <aside className="admin-media-editor">
          <div className="admin-panel-heading">
            <div>
              <p>Selected media</p>
              <h2>{selected?.label}</h2>
            </div>
          </div>

          {selected && (
            <>
              <Preview entry={selected} large />
              <dl className="admin-media-meta">
                <div><dt>ID</dt><dd>{selected.id}</dd></div>
                <div><dt>Scene</dt><dd>{selected.scene}</dd></div>
                <div><dt>Type</dt><dd>{selected.type}</dd></div>
                <div><dt>Source</dt><dd>{selected.source}</dd></div>
                <div><dt>Persistence</dt><dd>{selected.previewOnly ? 'Browser preview only' : 'Production asset'}</dd></div>
              </dl>

              <label className="admin-paste-control">
                <span>Paste URL or repo path</span>
                <input
                  value={pasteValue}
                  onChange={(event) => setPasteValue(event.target.value)}
                  placeholder="/assets/aura/example.webp"
                />
              </label>
              <button className="admin-action-primary" type="button" onClick={replaceWithPath}>Replace selected media with path</button>

              <label className="admin-upload-control">
                <Upload size={18} />
                Upload image/video for browser preview
                <input type="file" accept="image/*,video/*" onChange={handleUpload} />
              </label>

              <div className="admin-action-grid">
                <button type="button" onClick={toggleHidden}>{selected.status === 'hidden' ? <Eye size={16} /> : <EyeOff size={16} />} Hide/show</button>
                <button type="button" onClick={deleteReplacement}><Trash2 size={16} /> Delete replacement</button>
                <button type="button" onClick={restoreDefault}><RotateCcw size={16} /> Restore default</button>
                <button type="button" onClick={setAsHomepageHero}>Set as homepage hero</button>
              </div>

              <div className="admin-warning">
                <strong>Needs storage backend for permanent upload.</strong>
                <span>Local uploads and pasted paths do not update the public production source for all visitors. Connect Supabase Storage, R2, or Cloudinary to make upload/replace/delete permanent.</span>
              </div>
              {uploadNotice && <p className="admin-notice">{uploadNotice}</p>}
            </>
          )}
        </aside>
      </section>

      <section className="admin-asset-report">
        <div className="admin-panel-heading">
          <div>
            <p>Asset report</p>
            <h2>Known public asset folders</h2>
          </div>
          <span>Generated {auraAssetReport.generatedAt} / Preview hero: {heroPreviewId}</span>
        </div>
        <div className="asset-folder-grid">
          {auraAssetReport.byFolder.map((folder) => (
            <article key={folder.folder}>
              <strong>{folder.folder}</strong>
              <span>{folder.images} images / {folder.videos} videos</span>
            </article>
          ))}
        </div>
        <div className="admin-orphans">
          <h3>Unassigned examples</h3>
          {auraAssetReport.unassignedExamples.map((asset) => (
            <code key={asset}>{asset}</code>
          ))}
        </div>
      </section>
    </main>
  );
}

function StatusCard({ label, value }) {
  return (
    <article>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function Preview({ entry, large = false }) {
  return (
    <div className={large ? 'admin-preview is-large' : 'admin-preview'}>
      {isVideo(entry) ? (
        <video src={entry.source} muted playsInline controls={large} />
      ) : (
        <img src={entry.source} alt="" />
      )}
    </div>
  );
}
