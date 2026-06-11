import { useState, useEffect, useMemo, useRef } from 'react';
import JSZip from 'jszip';
import './cinematic-scene-builder.css';
import './cinematic-scene-builder-publish.css';

// ─────────────────────────────────────────────────────────────────────────────
// AURA — Cinematic Scene Builder (Admin)
//
// Phase 1: local/mock-data preview, reordering, hide/show, poster flags,
//          per-scene JSON config preview (copy/download).
// Phase 2 (this update): export a "Replacement Pack" ZIP for any media item
//          with a draft-replacement, and publish that pack to GitHub via
//          /api/admin/publish-cinematic-pack — which commits the media
//          file(s) only. ScrollFilm.jsx / CampaignScrollFilm.jsx are never
//          read or modified by this page or its publish endpoint.
// ─────────────────────────────────────────────────────────────────────────────

const DATA_URL = '/admin-cinematic/frames.json';
const PUBLISH_URL = '/api/admin/publish-cinematic-pack';

const PAGE_STATUS_LABELS = {
  live: 'Live',
  draft: 'Draft',
  missing: 'Missing',
  review: 'Review',
};

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
  if (!raw) return [];

  if (Array.isArray(raw.pages)) {
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
          hidden: Boolean(item.hidden),
          isPoster: Boolean(item.isPoster),
          replacement: item.replacement || null,
          notes: item.notes || '',
        })),
      })),
    }));
  }

  return [];
}

function slugifyFilePart(value) {
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
  return slugifyFilePart(ext || fallback).replace(/[^a-z0-9]/g, '') || fallback;
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
  if (dotIndex === -1) return fileName;
  return fileName.slice(0, dotIndex);
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

function buildPackFileName(replacement) {
  const mediaId = slugifyFilePart(replacement.mediaId || replacement.mediaLabel || 'media');
  const sourceName = slugifyFilePart(replacement.uploadedFileName || replacement.suggestedReplacementPath || 'replacement.png');
  return `${mediaId}-${sourceName}`;
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

function downloadText(content, fileName, type = 'application/json') {
  downloadBlob(new Blob([content], { type }), fileName);
}

function revokePreviewUrl(url) {
  if (url && url.startsWith('blob:')) URL.revokeObjectURL(url);
}

function buildManifest({ pages, selectedPageId, selectedSceneId }) {
  const selectedPage = pages.find((page) => page.id === selectedPageId);
  const selectedScene = selectedPage?.scenes.find((scene) => scene.id === selectedSceneId);
  const allReplacements = [];

  pages.forEach((page) => {
    page.scenes.forEach((scene) => {
      scene.media.forEach((item) => {
        if (!item.replacement) return;
        const replacement = {
          page: page.id,
          pageLabel: page.label,
          scene: scene.id,
          sceneName: scene.name,
          mediaId: item.id,
          mediaLabel: item.label,
          order: item.order,
          replace: item.path,
          uploadedFileName: item.replacement.fileName,
          suggestedReplacementPath: item.replacement.suggestedReplacementPath,
          repoPath: publicPathToRepoPath(item.replacement.suggestedReplacementPath),
          packFilePath: item.replacement.packFilePath,
          device: item.device,
          type: item.type,
          status: item.replacement.status || 'draft-replacement',
          readyForPublish: item.replacement.readyForPublish === true,
          notes: item.notes || '',
        };
        allReplacements.push(replacement);
      });
    });
  });

  return {
    brand: 'AURA Fight Club',
    tool: 'Cinematic Scene Builder',
    mode: 'replacement-manifest',
    generatedAt: new Date().toISOString(),
    page: selectedPage?.id || 'all',
    scene: selectedScene?.id || 'all',
    replacementCount: allReplacements.length,
    replacements: allReplacements,
    publishInstructions: [
      'Review every replacement visually in /admin/cinematic.',
      'Export the replacement pack ZIP and publish it through /api/admin/publish-cinematic-pack.',
      'The serverless endpoint commits media files only.',
      'ScrollFilm.jsx and CampaignScrollFilm.jsx are not modified automatically.',
    ],
  };
}

export default function CinematicSceneBuilder() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPageId, setSelectedPageId] = useState('');
  const [selectedSceneId, setSelectedSceneId] = useState('');
  const [selectedMediaId, setSelectedMediaId] = useState('');
  const [copyState, setCopyState] = useState('');
  const [packState, setPackState] = useState('idle');
  const [publishState, setPublishState] = useState({ status: 'idle', message: '' });
  const [pendingUploadName, setPendingUploadName] = useState('');
  const fileInputRef = useRef(null);
  const publishInputRef = useRef(null);

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
      pages.forEach((page) => {
        page.scenes.forEach((scene) => {
          scene.media.forEach((item) => revokePreviewUrl(item.replacement?.previewUrl));
        });
      });
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

  const currentConfig = useMemo(() => {
    if (!selectedScene) return null;
    return {
      page: selectedPage?.id,
      route: selectedPage?.route,
      scene: selectedScene.id,
      sceneName: selectedScene.name,
      status: selectedScene.status,
      media: selectedScene.media.map((item) => ({
        id: item.id,
        label: item.label,
        path: item.replacement?.previewUrl || item.path,
        originalPath: item.path,
        suggestedReplacementPath: item.replacement?.suggestedReplacementPath || null,
        hidden: item.hidden,
        isPoster: item.isPoster,
        order: item.order,
        type: item.type,
        device: item.device,
        status: item.replacement?.status || null,
        readyForPublish: item.replacement?.readyForPublish || false,
      })),
    };
  }, [selectedPage, selectedScene]);

  const manifest = useMemo(
    () => buildManifest({ pages, selectedPageId, selectedSceneId }),
    [pages, selectedPageId, selectedSceneId]
  );

  const pendingReplacements = manifest.replacements;

  function updateMedia(mutator) {
    setPages((current) =>
      current.map((page) => {
        if (page.id !== selectedPageId) return page;
        return {
          ...page,
          scenes: page.scenes.map((scene) => {
            if (scene.id !== selectedSceneId) return scene;
            return {
              ...scene,
              media: scene.media.map((item) => {
                if (item.id !== selectedMediaId) return item;
                return mutator(item);
              }),
            };
          }),
        };
      })
    );
  }

  function updateReplacementReady(mediaId, readyForPublish) {
    setPages((current) =>
      current.map((page) => ({
        ...page,
        scenes: page.scenes.map((scene) => ({
          ...scene,
          media: scene.media.map((item) => {
            if (item.id !== mediaId || !item.replacement) return item;
            return {
              ...item,
              replacement: {
                ...item.replacement,
                readyForPublish,
              },
            };
          }),
        })),
      }))
    );
  }

  function moveSelectedMedia(direction) {
    if (!selectedScene) return;

    setPages((current) =>
      current.map((page) => {
        if (page.id !== selectedPageId) return page;
        return {
          ...page,
          scenes: page.scenes.map((scene) => {
            if (scene.id !== selectedSceneId) return scene;

            const currentIndex = scene.media.findIndex((item) => item.id === selectedMediaId);
            const targetIndex = currentIndex + direction;
            if (currentIndex === -1 || targetIndex < 0 || targetIndex >= scene.media.length) return scene;

            const media = [...scene.media];
            const [moved] = media.splice(currentIndex, 1);
            media.splice(targetIndex, 0, moved);

            return {
              ...scene,
              media: media.map((item, index) => ({ ...item, order: index + 1 })),
            };
          }),
        };
      })
    );
  }

  function handleToggleHidden() {
    updateMedia((item) => ({ ...item, hidden: !item.hidden }));
  }

  function handleTogglePoster() {
    updateMedia((item) => ({ ...item, isPoster: !item.isPoster }));
  }

  function handleClearReplacement() {
    updateMedia((item) => {
      revokePreviewUrl(item.replacement?.previewUrl);
      return { ...item, replacement: null };
    });
  }

  function handleReplacementFile(event) {
    const file = event.target.files?.[0];
    if (!file || !selectedMedia) return;

    const previewUrl = URL.createObjectURL(file);
    const suggestedReplacementPath = buildSuggestedReplacementPath(selectedMedia.path, file.name);
    const mediaId = selectedMedia.id;
    const packFileName = `${slugifyFilePart(mediaId)}-${slugifyFilePart(file.name)}`;

    updateMedia((item) => {
      revokePreviewUrl(item.replacement?.previewUrl);
      return {
        ...item,
        replacement: {
          file,
          fileName: file.name,
          previewUrl,
          suggestedReplacementPath,
          repoPath: publicPathToRepoPath(suggestedReplacementPath),
          packFilePath: `media/${packFileName}`,
          status: 'draft-replacement',
          readyForPublish: true,
          createdAt: new Date().toISOString(),
        },
      };
    });

    event.target.value = '';
  }

  async function handleCopyConfig() {
    if (!currentConfig) return;
    await navigator.clipboard.writeText(JSON.stringify(currentConfig, null, 2));
    setCopyState('Scene JSON copied');
    setTimeout(() => setCopyState(''), 1800);
  }

  async function handleCopyManifest() {
    await navigator.clipboard.writeText(JSON.stringify(manifest, null, 2));
    setCopyState('Manifest copied');
    setTimeout(() => setCopyState(''), 1800);
  }

  function handleDownloadManifest() {
    const fileName = `${selectedPageId || 'aura'}-${selectedSceneId || 'scene'}-replacement-manifest.json`;
    downloadText(JSON.stringify(manifest, null, 2), fileName);
  }

  function handleDownloadSceneJson() {
    if (!currentConfig) return;
    const fileName = `${selectedPageId || 'aura'}-${selectedSceneId || 'scene'}-scene-config.json`;
    downloadText(JSON.stringify(currentConfig, null, 2), fileName);
  }

  async function handleExportPack() {
    if (!pendingReplacements.length) return;

    try {
      setPackState('building');
      const zip = new JSZip();
      const replacementsForPack = [];

      for (const replacement of pendingReplacements) {
        const sourceItem = pages
          .find((page) => page.id === replacement.page)
          ?.scenes.find((scene) => scene.id === replacement.scene)
          ?.media.find((item) => item.id === replacement.mediaId);

        const file = sourceItem?.replacement?.file;
        if (!file) {
          throw new Error(`Missing local file for ${replacement.mediaLabel || replacement.mediaId}`);
        }

        const packFilePath = sourceItem.replacement.packFilePath || `media/${buildPackFileName(replacement)}`;
        zip.file(packFilePath, file);
        replacementsForPack.push({ ...replacement, packFilePath });
      }

      const packManifest = {
        ...manifest,
        generatedAt: new Date().toISOString(),
        replacementCount: replacementsForPack.length,
        replacements: replacementsForPack,
      };

      zip.file('replacement-manifest.json', JSON.stringify(packManifest, null, 2));
      const blob = await zip.generateAsync({ type: 'blob' });
      const stamp = new Date().toISOString().replace(/[:.]/g, '-');
      downloadBlob(blob, `aura-replacement-pack-${selectedPageId || 'all'}-${selectedSceneId || 'all'}-${stamp}.zip`);
      setPackState('ready');
      setTimeout(() => setPackState('idle'), 2200);
    } catch (err) {
      setPackState('error');
      setPublishState({ status: 'error', message: err.message || 'Could not export pack' });
    }
  }

  async function handlePublishPack(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setPendingUploadName(file.name);
    setPublishState({ status: 'uploading', message: 'Publishing replacement pack to GitHub…' });

    try {
      const formData = new FormData();
      formData.append('pack', file);

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
        message: 'Replacement media files published successfully.',
        result,
      });
    } catch (err) {
      setPublishState({
        status: 'error',
        message: err.message || 'Could not publish replacement pack',
      });
    } finally {
      event.target.value = '';
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
    <div className="scb-shell">
      <header className="scb-header">
        <div>
          <p className="scb-kicker">AURA ADMIN</p>
          <h1>Cinematic Scene Builder</h1>
          <p>
            Manage campaign/homepage scroll frames, preview replacements, export
            replacement packs, and publish approved media files into GitHub.
          </p>
        </div>
        <div className="scb-header__meta">
          <span>{pages.length} pages</span>
          <span>{pendingReplacements.length} replacements</span>
        </div>
      </header>

      <main className="scb-grid">
        <aside className="scb-sidebar">
          <section className="scb-panel">
            <div className="scb-panel__head">
              <p>Pages</p>
            </div>
            <div className="scb-page-list">
              {pages.map((page) => (
                <button
                  key={page.id}
                  type="button"
                  className={`scb-page-card ${page.id === selectedPageId ? 'is-active' : ''}`}
                  onClick={() => {
                    setSelectedPageId(page.id);
                    setSelectedSceneId(page.scenes?.[0]?.id || '');
                    setSelectedMediaId(page.scenes?.[0]?.media?.[0]?.id || '');
                  }}
                >
                  <span>{page.label}</span>
                  <small>{PAGE_STATUS_LABELS[page.status] || page.status}</small>
                </button>
              ))}
            </div>
          </section>

          <section className="scb-panel">
            <div className="scb-panel__head">
              <p>Scenes</p>
            </div>
            <div className="scb-scene-list">
              {selectedPage?.scenes.map((scene) => (
                <button
                  key={scene.id}
                  type="button"
                  className={`scb-scene-card ${scene.id === selectedSceneId ? 'is-active' : ''}`}
                  onClick={() => {
                    setSelectedSceneId(scene.id);
                    setSelectedMediaId(scene.media?.[0]?.id || '');
                  }}
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
                <p>Selected scene</p>
                <h2>{selectedScene?.name || 'No scene selected'}</h2>
              </div>
              <div className="scb-actions">
                <button type="button" onClick={handleCopyConfig} disabled={!currentConfig}>
                  Copy Scene JSON
                </button>
                <button type="button" onClick={handleDownloadSceneJson} disabled={!currentConfig}>
                  Download Scene JSON
                </button>
              </div>
            </div>

            {copyState && <div className="scb-toast">{copyState}</div>}

            <div className="scb-frame-strip">
              {selectedScene?.media.map((item) => {
                const src = item.replacement?.previewUrl || item.path;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`scb-frame-card ${item.id === selectedMediaId ? 'is-active' : ''} ${
                      item.hidden ? 'is-hidden' : ''
                    }`}
                    onClick={() => setSelectedMediaId(item.id)}
                  >
                    <span className="scb-frame-card__order">{item.order}</span>
                    {item.replacement && (
                      <span className="scb-frame-card__replacement-flag">Replacement</span>
                    )}
                    {item.type === 'video' ? (
                      <video src={src} muted playsInline />
                    ) : (
                      <img src={src} alt="" />
                    )}
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
                    <video src={selectedMedia.replacement?.previewUrl || selectedMedia.path} controls muted />
                  ) : (
                    <img src={selectedMedia.replacement?.previewUrl || selectedMedia.path} alt="" />
                  )}
                </div>
              ) : (
                <div className="scb-empty">Select a frame</div>
              )}
            </section>

            <section className="scb-panel scb-inspector">
              <div className="scb-panel__head">
                <p>Inspector</p>
              </div>

              {selectedMedia ? (
                <div className="scb-fields">
                  <label>
                    <span>Label</span>
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

                  {selectedMedia.replacement && (
                    <div className="scb-replacement-box">
                      <p className="scb-replacement-box__title">Draft replacement</p>
                      <dl>
                        <dt>Uploaded file</dt>
                        <dd>{selectedMedia.replacement.fileName}</dd>
                        <dt>Suggested public path</dt>
                        <dd>{selectedMedia.replacement.suggestedReplacementPath}</dd>
                        <dt>Repo path</dt>
                        <dd>{selectedMedia.replacement.repoPath}</dd>
                        <dt>Pack file</dt>
                        <dd>{selectedMedia.replacement.packFilePath}</dd>
                      </dl>
                    </div>
                  )}

                  <div className="scb-actions scb-actions--wrap">
                    <button type="button" onClick={() => fileInputRef.current?.click()}>
                      Select replacement image
                    </button>
                    <button type="button" onClick={handleClearReplacement} disabled={!selectedMedia.replacement}>
                      Clear replacement
                    </button>
                    <button type="button" onClick={handleToggleHidden}>
                      {selectedMedia.hidden ? 'Show frame' : 'Hide frame'}
                    </button>
                    <button type="button" onClick={handleTogglePoster}>
                      {selectedMedia.isPoster ? 'Unset poster' : 'Mark poster'}
                    </button>
                    <button type="button" onClick={() => moveSelectedMedia(-1)}>
                      Move left
                    </button>
                    <button type="button" onClick={() => moveSelectedMedia(1)}>
                      Move right
                    </button>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    className="scb-hidden-input"
                    onChange={handleReplacementFile}
                  />
                </div>
              ) : (
                <div className="scb-empty">No media selected</div>
              )}
            </section>
          </section>

          <section className="scb-panel">
            <div className="scb-panel__head scb-panel__head--spread">
              <div>
                <p>Scene config preview</p>
                <h2>Current JSON</h2>
              </div>
            </div>
            <pre className="scb-code">{JSON.stringify(currentConfig, null, 2)}</pre>
          </section>

          <section className="scb-panel">
            <div className="scb-panel__head scb-panel__head--spread">
              <div>
                <p>Export replacement pack</p>
                <h2>Draft replacements</h2>
              </div>
              <div className="scb-actions">
                <button type="button" onClick={handleCopyManifest} disabled={!pendingReplacements.length}>
                  Copy Manifest
                </button>
                <button type="button" onClick={handleDownloadManifest} disabled={!pendingReplacements.length}>
                  Download Manifest
                </button>
                <button type="button" onClick={handleExportPack} disabled={!pendingReplacements.length || packState === 'building'}>
                  {packState === 'building' ? 'Building pack…' : 'Export pack (.zip)'}
                </button>
              </div>
            </div>

            {pendingReplacements.length ? (
              <ul className="scb-pending-list">
                {pendingReplacements.map((replacement) => (
                  <li key={`${replacement.page}-${replacement.scene}-${replacement.mediaId}`} className="scb-pending-item">
                    <div className="scb-pending-item__main">
                      <span className="scb-pending-item__label">
                        {replacement.pageLabel} / {replacement.sceneName} / {replacement.mediaLabel}
                      </span>
                      <span className="scb-pending-item__path">{replacement.suggestedReplacementPath}</span>
                    </div>
                    <label className="scb-toggle">
                      <input
                        type="checkbox"
                        checked={replacement.readyForPublish}
                        onChange={(event) => updateReplacementReady(replacement.mediaId, event.target.checked)}
                      />
                      Ready
                    </label>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="scb-empty scb-empty--inline">
                Select a media item and choose a replacement image to build a pack.
              </div>
            )}

            {packState === 'ready' && <div className="scb-toast">Replacement pack downloaded</div>}
          </section>

          <section className="scb-panel">
            <div className="scb-panel__head scb-panel__head--spread">
              <div>
                <p>Publish replacement pack</p>
                <h2>Commit media files to GitHub</h2>
              </div>
              <div className="scb-actions">
                <button
                  type="button"
                  onClick={() => publishInputRef.current?.click()}
                  disabled={publishState.status === 'uploading'}
                >
                  {publishState.status === 'uploading' ? 'Publishing…' : 'Select pack & publish'}
                </button>
              </div>
            </div>

            <p className="scb-publish__notice">
              Publishes media files only. Does not modify ScrollFilm.jsx or CampaignScrollFilm.jsx.
              Requires GITHUB_TOKEN in Vercel environment variables.
            </p>

            <input
              ref={publishInputRef}
              type="file"
              accept=".zip,application/zip,application/x-zip-compressed"
              className="scb-hidden-input"
              onChange={handlePublishPack}
            />

            <div className={`scb-publish-status scb-publish-status--${publishState.status}`}>
              <p className="scb-publish-status__title">
                {publishState.status === 'idle' && 'Waiting for replacement pack'}
                {publishState.status === 'uploading' && 'Publishing'}
                {publishState.status === 'success' && 'Published'}
                {publishState.status === 'error' && 'Publish error'}
              </p>
              <p>{publishState.message || 'Choose a ZIP exported from this page.'}</p>
              {pendingUploadName && <p>Selected pack: {pendingUploadName}</p>}
              {publishState.result?.commitSha && <p>Commit: {publishState.result.commitSha}</p>}
              {publishState.result?.filesWritten?.length > 0 && (
                <ul className="scb-file-list">
                  {publishState.result.filesWritten.map((file) => (
                    <li key={file}>{file}</li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </section>
      </main>

      <footer className="scb-footer">
        <p>
          Local edits, JSON export, and pack export are session-only. Publish
          writes media files to GitHub in a single commit. No live media,
          routes, products, or ScrollFilm/CampaignScrollFilm scene arrays are
          modified automatically by this page.
        </p>
      </footer>
    </div>
  );
}