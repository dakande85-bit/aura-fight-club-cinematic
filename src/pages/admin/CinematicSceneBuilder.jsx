import { useEffect, useMemo, useRef, useState } from 'react';
import JSZip from 'jszip';
import './cinematic-scene-builder.css';
import './cinematic-scene-builder-publish.css';

const DATA_URL = '/admin-cinematic/frames.json';
const PUBLISH_URL = '/api/admin/publish-cinematic-pack';

const TYPE_LABELS = {
  image: 'Image',
  video: 'Video',
  poster: 'Poster',
  frame: 'Frame',
};

const PATH_PREFIX_MAP = [
  ['/assets/', 'public/assets/'],
  ['/campaign/', 'public/campaign/'],
];

function normaliseData(raw) {
  if (!Array.isArray(raw?.pages)) return [];

  return raw.pages.map((page) => ({
    id: page.id,
    label: page.title || page.label || page.id,
    route: page.route || '',
    status: page.status || 'draft',
    scenes: (page.scenes || []).map((scene) => ({
      id: scene.id,
      name: scene.title || scene.name || scene.id,
      type: scene.type || 'imageSequence',
      status: scene.status || 'draft',
      media: (scene.media || []).map((item, index) => ({
        id: item.id || `${scene.id}-${index}`,
        path: item.path,
        label: item.label || item.title || item.id || `Frame ${index + 1}`,
        type: item.type || (item.path?.endsWith('.mp4') ? 'video' : 'image'),
        device: item.device || 'all',
        order: item.order ?? index + 1,
        notes: item.notes || '',
      })),
    })),
  }));
}

function slugify(value) {
  return String(value || 'replacement')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'replacement';
}

function getFileExtension(fileName, fallback = 'png') {
  const clean = String(fileName || '').split('?')[0].split('#')[0];
  const ext = clean.includes('.') ? clean.split('.').pop() : fallback;
  return slugify(ext || fallback).replace(/[^a-z0-9]/g, '') || fallback;
}

function getPathDirectory(path) {
  const clean = String(path || '').split('?')[0].split('#')[0];
  const parts = clean.split('/');
  parts.pop();
  return parts.join('/') || '';
}

function getPathBaseName(path) {
  const clean = String(path || '').split('?')[0].split('#')[0];
  const fileName = clean.split('/').pop() || 'replacement.png';
  const dotIndex = fileName.lastIndexOf('.');
  return dotIndex === -1 ? fileName : fileName.slice(0, dotIndex);
}

function buildSuggestedReplacementPath(currentPath, uploadedFileName) {
  const directory = getPathDirectory(currentPath);
  const baseName = getPathBaseName(currentPath);
  const ext = getFileExtension(uploadedFileName, getFileExtension(currentPath, 'png'));
  return `${directory}/${baseName}__draft-replacement.${ext}`;
}

function publicPathToRepoPath(publicPath) {
  for (const [publicPrefix, repoPrefix] of PATH_PREFIX_MAP) {
    if (publicPath.startsWith(publicPrefix)) {
      return publicPath.replace(publicPrefix, repoPrefix);
    }
  }
  return publicPath.replace(/^\//, 'public/');
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

function revokePreviewUrl(url) {
  if (url && url.startsWith('blob:')) URL.revokeObjectURL(url);
}

function buildReplacementPayload({ selectedPage, selectedScene, selectedMedia, replacement }) {
  if (!selectedPage || !selectedScene || !selectedMedia || !replacement) return null;

  const packFileName = `${slugify(selectedMedia.id)}-${slugify(replacement.fileName)}`;
  const packFilePath = `media/${packFileName}`;

  return {
    manifest: {
      brand: 'AURA Fight Club',
      tool: 'Cinematic Scene Builder',
      mode: 'replacement-manifest',
      generatedAt: new Date().toISOString(),
      page: selectedPage.id,
      scene: selectedScene.id,
      replacementCount: 1,
      replacements: [
        {
          page: selectedPage.id,
          pageLabel: selectedPage.label,
          scene: selectedScene.id,
          sceneName: selectedScene.name,
          mediaId: selectedMedia.id,
          mediaLabel: selectedMedia.label,
          order: selectedMedia.order,
          replace: selectedMedia.path,
          uploadedFileName: replacement.fileName,
          suggestedReplacementPath: replacement.suggestedReplacementPath,
          repoPath: publicPathToRepoPath(replacement.suggestedReplacementPath),
          packFilePath,
          device: selectedMedia.device,
          type: selectedMedia.type,
          status: 'draft-replacement',
          readyForPublish: true,
          notes: selectedMedia.notes || '',
        },
      ],
      publishInstructions: [
        'Review the replacement visually in /admin/cinematic.',
        'This pack publishes media files only.',
        'ScrollFilm.jsx and CampaignScrollFilm.jsx are not modified automatically.',
      ],
    },
    packFilePath,
  };
}

async function buildReplacementZip(payload, file) {
  const zip = new JSZip();
  zip.file('replacement-manifest.json', JSON.stringify(payload.manifest, null, 2));
  zip.file(payload.packFilePath, file);
  return zip.generateAsync({ type: 'blob' });
}

export default function CinematicSceneBuilder() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPageId, setSelectedPageId] = useState('');
  const [selectedSceneId, setSelectedSceneId] = useState('');
  const [selectedMediaId, setSelectedMediaId] = useState('');
  const [replacement, setReplacement] = useState(null);
  const [publishState, setPublishState] = useState({ status: 'idle', message: '' });
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        setLoading(true);
        const response = await fetch(DATA_URL, { cache: 'no-store' });
        if (!response.ok) throw new Error(`Could not load ${DATA_URL}`);
        const json = await response.json();
        const normalised = normaliseData(json);
        if (!active) return;
        setPages(normalised);
        setSelectedPageId(normalised[0]?.id || '');
        setSelectedSceneId(normalised[0]?.scenes?.[0]?.id || '');
        setSelectedMediaId(normalised[0]?.scenes?.[0]?.media?.[0]?.id || '');
      } catch (err) {
        if (!active) return;
        setError(err.message || 'Could not load scene data');
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();

    return () => {
      active = false;
      revokePreviewUrl(replacement?.previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedPage = useMemo(
    () => pages.find((page) => page.id === selectedPageId),
    [pages, selectedPageId]
  );

  const selectedScene = useMemo(
    () => selectedPage?.scenes.find((scene) => scene.id === selectedSceneId),
    [selectedPage, selectedSceneId]
  );

  const selectedMedia = useMemo(
    () => selectedScene?.media.find((item) => item.id === selectedMediaId),
    [selectedScene, selectedMediaId]
  );

  const replacementPayload = useMemo(
    () => buildReplacementPayload({ selectedPage, selectedScene, selectedMedia, replacement }),
    [selectedPage, selectedScene, selectedMedia, replacement]
  );

  const previewSource = replacement?.previewUrl || selectedMedia?.path || '';

  function selectPage(page) {
    setSelectedPageId(page.id);
    setSelectedSceneId(page.scenes?.[0]?.id || '');
    setSelectedMediaId(page.scenes?.[0]?.media?.[0]?.id || '');
    clearReplacement();
  }

  function selectScene(scene) {
    setSelectedSceneId(scene.id);
    setSelectedMediaId(scene.media?.[0]?.id || '');
    clearReplacement();
  }

  function selectMedia(mediaId) {
    setSelectedMediaId(mediaId);
    clearReplacement();
  }

  function clearReplacement() {
    setReplacement((current) => {
      revokePreviewUrl(current?.previewUrl);
      return null;
    });
    setPublishState({ status: 'idle', message: '' });
  }

  function handleReplacementFile(event) {
    const file = event.target.files?.[0];
    if (!file || !selectedMedia) return;

    const previewUrl = URL.createObjectURL(file);
    const suggestedReplacementPath = buildSuggestedReplacementPath(selectedMedia.path, file.name);

    setReplacement((current) => {
      revokePreviewUrl(current?.previewUrl);
      return {
        file,
        fileName: file.name,
        previewUrl,
        suggestedReplacementPath,
        repoPath: publicPathToRepoPath(suggestedReplacementPath),
      };
    });

    setPublishState({ status: 'ready', message: 'Replacement ready. Review the preview, then publish.' });
    event.target.value = '';
  }

  async function handleDownloadBackupPack() {
    if (!replacementPayload || !replacement?.file) return;

    try {
      setPublishState({ status: 'building', message: 'Building backup pack…' });
      const blob = await buildReplacementZip(replacementPayload, replacement.file);
      const stamp = new Date().toISOString().replace(/[:.]/g, '-');
      downloadBlob(blob, `aura-replacement-backup-${selectedPageId || 'page'}-${selectedSceneId || 'scene'}-${stamp}.zip`);
      setPublishState({ status: 'ready', message: 'Backup ZIP downloaded. You can still publish directly below.' });
    } catch (err) {
      setPublishState({ status: 'error', message: err.message || 'Could not build backup pack.' });
    }
  }

  async function handleDirectPublish() {
    if (!replacementPayload || !replacement?.file) {
      setPublishState({ status: 'error', message: 'Select a replacement image first.' });
      return;
    }

    try {
      setPublishState({ status: 'uploading', message: 'Publishing replacement to GitHub…' });
      const zipBlob = await buildReplacementZip(replacementPayload, replacement.file);
      const formData = new FormData();
      formData.append('pack', zipBlob, 'aura-replacement-pack.zip');

      const response = await fetch(PUBLISH_URL, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.success === false) {
        throw new Error(
          result.errors?.join('\n') || result.error || `Publish failed with HTTP ${response.status}`
        );
      }

      setPublishState({
        status: 'success',
        message: 'Replacement image published to GitHub. Vercel will redeploy from the new commit.',
        result,
      });
    } catch (err) {
      setPublishState({ status: 'error', message: err.message || 'Could not publish replacement.' });
    }
  }

  if (loading) {
    return (
      <div className="scb-shell">
        <div className="scb-loading">Loading AURA cinematic scenes…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="scb-shell">
        <div className="scb-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="scb-shell scb-shell--simple">
      <header className="scb-header">
        <div>
          <p className="scb-kicker">AURA ADMIN</p>
          <h1>Cinematic Scene Builder</h1>
          <p>Simple mode: choose a frame, preview a replacement, then publish it.</p>
        </div>
        <div className="scb-header__meta">
          <span>{pages.length} pages</span>
          <span>{replacement ? '1 draft replacement' : 'No replacement selected'}</span>
        </div>
      </header>

      <main className="scb-grid">
        <aside className="scb-sidebar">
          <section className="scb-panel">
            <div className="scb-panel__head">
              <p>1. Choose page</p>
            </div>
            <div className="scb-page-list">
              {pages.map((page) => (
                <button
                  key={page.id}
                  type="button"
                  className={`scb-page-card ${page.id === selectedPageId ? 'is-active' : ''}`}
                  onClick={() => selectPage(page)}
                >
                  <span>{page.label}</span>
                  <small>{page.route || page.id}</small>
                </button>
              ))}
            </div>
          </section>

          <section className="scb-panel">
            <div className="scb-panel__head">
              <p>2. Choose scene</p>
            </div>
            <div className="scb-scene-list">
              {selectedPage?.scenes.map((scene) => (
                <button
                  key={scene.id}
                  type="button"
                  className={`scb-scene-card ${scene.id === selectedSceneId ? 'is-active' : ''}`}
                  onClick={() => selectScene(scene)}
                >
                  <span>{scene.name}</span>
                  <small>{scene.media.length} media</small>
                </button>
              ))}
            </div>
          </section>
        </aside>

        <section className="scb-workspace">
          <section className="scb-panel scb-hero-panel">
            <div className="scb-panel__head scb-panel__head--spread">
              <div>
                <p>3. Choose frame</p>
                <h2>{selectedScene?.name || 'No scene selected'}</h2>
              </div>
            </div>

            <div className="scb-frame-strip">
              {selectedScene?.media.map((item) => {
                const isSelected = item.id === selectedMediaId;
                const src = isSelected && replacement ? replacement.previewUrl : item.path;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`scb-frame-card ${isSelected ? 'is-active' : ''}`}
                    onClick={() => selectMedia(item.id)}
                  >
                    <span className="scb-frame-card__order">{item.order}</span>
                    {isSelected && replacement && <span className="scb-frame-card__replacement-flag">Draft</span>}
                    {item.type === 'video' ? <video src={src} muted playsInline /> : <img src={src} alt="" />}
                    <span className="scb-frame-card__label">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="scb-detail-grid">
            <section className="scb-panel scb-preview-panel">
              <div className="scb-panel__head">
                <p>Preview</p>
              </div>
              {selectedMedia ? (
                <div className="scb-preview">
                  {selectedMedia.type === 'video' ? (
                    <video src={previewSource} controls muted />
                  ) : (
                    <img src={previewSource} alt="" />
                  )}
                  {replacement && <div className="scb-simple-banner">Draft replacement: {replacement.fileName}</div>}
                </div>
              ) : (
                <div className="scb-empty">Select a frame</div>
              )}
            </section>

            <section className="scb-panel scb-inspector">
              <div className="scb-panel__head">
                <p>4. Replace + publish</p>
              </div>

              {selectedMedia ? (
                <div className="scb-fields">
                  <label>
                    <span>Selected frame</span>
                    <input value={selectedMedia.label} readOnly />
                  </label>

                  <label>
                    <span>Current path</span>
                    <textarea value={selectedMedia.path || ''} readOnly />
                  </label>

                  <div className="scb-field-row">
                    <label>
                      <span>Type</span>
                      <input value={TYPE_LABELS[selectedMedia.type] || selectedMedia.type} readOnly />
                    </label>
                    <label>
                      <span>Device</span>
                      <input value={selectedMedia.device} readOnly />
                    </label>
                  </div>

                  {replacement && (
                    <div className="scb-replacement-box scb-replacement-box--simple">
                      <p className="scb-replacement-box__title">Replacement ready</p>
                      <dl>
                        <dt>File</dt>
                        <dd>{replacement.fileName}</dd>
                        <dt>Will publish to</dt>
                        <dd>{replacement.suggestedReplacementPath}</dd>
                      </dl>
                    </div>
                  )}

                  <div className="scb-simple-actions">
                    <button type="button" className="scb-primary-action" onClick={() => fileInputRef.current?.click()}>
                      {replacement ? 'Change replacement image' : 'Select replacement image'}
                    </button>
                    <button
                      type="button"
                      className="scb-primary-action scb-primary-action--gold"
                      onClick={handleDirectPublish}
                      disabled={!replacement || publishState.status === 'uploading'}
                    >
                      {publishState.status === 'uploading' ? 'Publishing…' : 'Publish replacement'}
                    </button>
                    {replacement && (
                      <button type="button" onClick={clearReplacement}>
                        Clear
                      </button>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    className="scb-hidden-input"
                    onChange={handleReplacementFile}
                  />

                  <div className={`scb-publish-status scb-publish-status--${publishState.status}`}>
                    <p className="scb-publish-status__title">
                      {publishState.status === 'idle' && 'Waiting'}
                      {publishState.status === 'ready' && 'Ready'}
                      {publishState.status === 'building' && 'Building'}
                      {publishState.status === 'uploading' && 'Publishing'}
                      {publishState.status === 'success' && 'Published'}
                      {publishState.status === 'error' && 'Error'}
                    </p>
                    <p>{publishState.message || 'Select a replacement image, check preview, then publish.'}</p>
                    {publishState.result?.commitSha && <p>Commit: {publishState.result.commitSha}</p>}
                    {publishState.result?.filesWritten?.length > 0 && (
                      <ul className="scb-file-list">
                        {publishState.result.filesWritten.map((file) => (
                          <li key={file}>{file}</li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <button type="button" className="scb-advanced-toggle" onClick={() => setAdvancedOpen((value) => !value)}>
                    {advancedOpen ? 'Hide advanced options' : 'Advanced options'}
                  </button>

                  {advancedOpen && (
                    <div className="scb-advanced-box">
                      <p>
                        Backup pack is only for manual recovery. Normal workflow is now direct publish.
                      </p>
                      <button type="button" onClick={handleDownloadBackupPack} disabled={!replacement}>
                        Download backup ZIP
                      </button>
                      {replacementPayload && <pre>{JSON.stringify(replacementPayload.manifest, null, 2)}</pre>}
                    </div>
                  )}
                </div>
              ) : (
                <div className="scb-empty">Select a frame</div>
              )}
            </section>
          </section>
        </section>
      </main>

      <footer className="scb-footer">
        <p>
          Simple mode publishes media files only. It does not modify ScrollFilm.jsx or CampaignScrollFilm.jsx yet.
        </p>
      </footer>
    </div>
  );
}
