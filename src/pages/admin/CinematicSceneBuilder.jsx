import { useEffect, useMemo, useRef, useState } from 'react';
import JSZip from 'jszip';
import './cinematic-scene-builder.css';
import './cinematic-scene-builder-publish.css';

const DATA_URL = '/admin-cinematic/frames.json';
const PUBLISH_URL = '/api/admin/publish-cinematic-pack';
const REMOVED_FRAMES_KEY = 'aura:cinematic:removed-frame-ids';

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
        type: item.type || item.kind || (item.path?.endsWith('.mp4') ? 'video' : 'image'),
        device: item.device || 'all',
        order: item.order ?? item.frameOrder ?? index + 1,
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

function downloadJson(data, fileName) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  downloadBlob(blob, fileName);
}

function revokePreviewUrl(url) {
  if (url && url.startsWith('blob:')) URL.revokeObjectURL(url);
}

function readRemovedFrameIds() {
  try {
    const parsed = JSON.parse(localStorage.getItem(REMOVED_FRAMES_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function frameKey(pageId, sceneId, mediaId) {
  return `${pageId}::${sceneId}::${mediaId}`;
}

function buildReplacementPayload({ selectedPage, selectedScene, selectedMedia, replacement }) {
  if (!selectedPage || !selectedScene || !selectedMedia || !replacement) return null;

  const packFileName = `${slugify(selectedMedia.id)}-${slugify(replacement.fileName)}`;
  const packFilePath = `media/${packFileName}`;
  const livePath = selectedMedia.path;

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
          replace: livePath,
          uploadedFileName: replacement.fileName,
          suggestedReplacementPath: livePath,
          repoPath: publicPathToRepoPath(livePath),
          packFilePath,
          device: selectedMedia.device,
          type: selectedMedia.type,
          status: 'ready-for-live-overwrite',
          readyForPublish: true,
          notes: selectedMedia.notes || '',
        },
      ],
      publishInstructions: [
        'This pack overwrites the selected live frame path in place.',
        'No *_draft-replacement orphan file should be created.',
        'After Vercel redeploys, refresh the live page to see the updated frame.',
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
  const [removedFrameIds, setRemovedFrameIds] = useState(() => readRemovedFrameIds());
  const [showRemoved, setShowRemoved] = useState(true);
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
    };
  }, []);

  useEffect(() => () => revokePreviewUrl(replacement?.previewUrl), [replacement?.previewUrl]);

  useEffect(() => {
    localStorage.setItem(REMOVED_FRAMES_KEY, JSON.stringify(removedFrameIds));
  }, [removedFrameIds]);

  const removedFrameSet = useMemo(() => new Set(removedFrameIds), [removedFrameIds]);

  const selectedPage = useMemo(
    () => pages.find((page) => page.id === selectedPageId),
    [pages, selectedPageId]
  );

  const selectedScene = useMemo(
    () => selectedPage?.scenes.find((scene) => scene.id === selectedSceneId),
    [selectedPage, selectedSceneId]
  );

  const selectedSceneMedia = useMemo(() => {
    if (!selectedPage || !selectedScene) return [];
    return selectedScene.media.map((item) => ({
      ...item,
      frameKey: frameKey(selectedPage.id, selectedScene.id, item.id),
      isRemoved: removedFrameSet.has(frameKey(selectedPage.id, selectedScene.id, item.id)),
    }));
  }, [selectedPage, selectedScene, removedFrameSet]);

  const visibleSceneMedia = useMemo(
    () => selectedSceneMedia.filter((item) => !item.isRemoved),
    [selectedSceneMedia]
  );

  const selectedMedia = useMemo(
    () => selectedSceneMedia.find((item) => item.id === selectedMediaId),
    [selectedSceneMedia, selectedMediaId]
  );

  const selectedMediaIsRemoved = Boolean(selectedMedia?.isRemoved);

  useEffect(() => {
    if (!selectedSceneMedia.length) return;
    if (!selectedMedia || selectedMedia.isRemoved) {
      setSelectedMediaId(visibleSceneMedia[0]?.id || selectedSceneMedia[0]?.id || '');
    }
  }, [selectedSceneMedia, visibleSceneMedia, selectedMedia]);

  const removedFrames = useMemo(() => {
    return pages.flatMap((page) => page.scenes.flatMap((scene) => scene.media
      .filter((item) => removedFrameSet.has(frameKey(page.id, scene.id, item.id)))
      .map((item) => ({ ...item, pageId: page.id, pageLabel: page.label, sceneId: scene.id, sceneName: scene.name, frameKey: frameKey(page.id, scene.id, item.id) }))));
  }, [pages, removedFrameSet]);

  const replacementPayload = useMemo(
    () => buildReplacementPayload({ selectedPage, selectedScene, selectedMedia, replacement }),
    [selectedPage, selectedScene, selectedMedia, replacement]
  );

  const previewSource = replacement?.previewUrl || selectedMedia?.path || '';

  function clearReplacement() {
    setReplacement((current) => {
      revokePreviewUrl(current?.previewUrl);
      return null;
    });
    setPublishState({ status: 'idle', message: '' });
  }

  function selectPage(page) {
    setSelectedPageId(page.id);
    const nextScene = page.scenes?.[0];
    setSelectedSceneId(nextScene?.id || '');
    const nextMedia = nextScene?.media?.find((item) => !removedFrameSet.has(frameKey(page.id, nextScene.id, item.id))) || nextScene?.media?.[0];
    setSelectedMediaId(nextMedia?.id || '');
    clearReplacement();
  }

  function selectScene(scene) {
    setSelectedSceneId(scene.id);
    const nextMedia = scene.media?.find((item) => !removedFrameSet.has(frameKey(selectedPageId, scene.id, item.id))) || scene.media?.[0];
    setSelectedMediaId(nextMedia?.id || '');
    clearReplacement();
  }

  function selectMedia(mediaId) {
    setSelectedMediaId(mediaId);
    clearReplacement();
  }

  function handleReplacementFile(event) {
    const file = event.target.files?.[0];
    if (!file || !selectedMedia || selectedMediaIsRemoved) return;

    const previewUrl = URL.createObjectURL(file);
    const livePath = selectedMedia.path;

    setReplacement((current) => {
      revokePreviewUrl(current?.previewUrl);
      return {
        file,
        fileName: file.name,
        previewUrl,
        suggestedReplacementPath: livePath,
        repoPath: publicPathToRepoPath(livePath),
      };
    });

    setPublishState({
      status: 'ready',
      message: 'Replacement ready. This will overwrite the selected live frame path in place.',
    });
    event.target.value = '';
  }

  function removeSelectedFrame() {
    if (!selectedPage || !selectedScene || !selectedMedia || selectedMediaIsRemoved) return;
    const key = frameKey(selectedPage.id, selectedScene.id, selectedMedia.id);
    setRemovedFrameIds((current) => Array.from(new Set([...current, key])));
    clearReplacement();
    const nextMedia = visibleSceneMedia.find((item) => item.id !== selectedMedia.id) || selectedSceneMedia.find((item) => item.id !== selectedMedia.id);
    setSelectedMediaId(nextMedia?.id || '');
    setPublishState({ status: 'ready', message: 'Frame removed from this editor view. Export the removal manifest when ready to apply the cleanup permanently.' });
  }

  function restoreFrame(key) {
    setRemovedFrameIds((current) => current.filter((item) => item !== key));
    setPublishState({ status: 'ready', message: 'Frame restored to the editor view.' });
  }

  function resetRemovedFrames() {
    setRemovedFrameIds([]);
    setPublishState({ status: 'ready', message: 'All removed frames restored.' });
  }

  function exportRemovalManifest() {
    const manifest = {
      brand: 'AURA Fight Club',
      tool: 'Cinematic Scene Builder',
      mode: 'frame-removal-manifest',
      generatedAt: new Date().toISOString(),
      removedCount: removedFrames.length,
      removedFrames: removedFrames.map((item) => ({
        page: item.pageId,
        pageLabel: item.pageLabel,
        scene: item.sceneId,
        sceneName: item.sceneName,
        mediaId: item.id,
        mediaLabel: item.label,
        order: item.order,
        path: item.path,
        repoPath: publicPathToRepoPath(item.path || ''),
        frameKey: item.frameKey,
        notes: item.notes || '',
      })),
      instructions: [
        'Use this manifest as the source of truth for a permanent cleanup commit.',
        'Remove these media entries from public/admin-cinematic/frames.json and the matching live scene arrays/components.',
        'Do not delete source image files unless the asset is unused elsewhere.',
      ],
    };
    downloadJson(manifest, `aura-frame-removal-manifest-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
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

      const response = await fetch(PUBLISH_URL, { method: 'POST', body: formData });
      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.success === false) {
        throw new Error(result.errors?.join('\n') || result.error || `Publish failed with HTTP ${response.status}`);
      }

      setPublishState({
        status: 'success',
        message: 'Replacement image published to the live frame path. Vercel will redeploy from the new commit.',
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
          <p>Choose a frame, preview a replacement, remove weak frames, then publish or export a cleanup manifest.</p>
        </div>
        <div className="scb-header__meta">
          <span>{pages.length} pages</span>
          <span>{removedFrames.length} frames marked removed</span>
          <span>{replacement ? '1 live overwrite ready' : 'No replacement selected'}</span>
        </div>
      </header>

      <main className="scb-grid">
        <aside className="scb-sidebar">
          <section className="scb-panel">
            <div className="scb-panel__head"><p>1. Choose page</p></div>
            <div className="scb-page-list">
              {pages.map((page) => (
                <button key={page.id} type="button" className={`scb-page-card ${page.id === selectedPageId ? 'is-active' : ''}`} onClick={() => selectPage(page)}>
                  <span>{page.label}</span>
                  <small>{page.route || page.id}</small>
                </button>
              ))}
            </div>
          </section>

          <section className="scb-panel">
            <div className="scb-panel__head"><p>2. Choose scene</p></div>
            <div className="scb-scene-list">
              {selectedPage?.scenes.map((scene) => {
                const total = scene.media.length;
                const removed = scene.media.filter((item) => removedFrameSet.has(frameKey(selectedPage.id, scene.id, item.id))).length;
                return (
                  <button key={scene.id} type="button" className={`scb-scene-card ${scene.id === selectedSceneId ? 'is-active' : ''}`} onClick={() => selectScene(scene)}>
                    <span>{scene.name}</span>
                    <small>{total - removed}/{total} visible</small>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="scb-panel scb-remove-panel">
            <div className="scb-panel__head scb-panel__head--spread">
              <p>Removed frames</p>
              <button type="button" className="scb-text-button" onClick={() => setShowRemoved((value) => !value)}>{showRemoved ? 'Hide' : 'Show'}</button>
            </div>
            {showRemoved && (
              <div className="scb-removed-list">
                {removedFrames.length === 0 ? (
                  <p className="scb-muted">No frames removed.</p>
                ) : (
                  removedFrames.map((item) => (
                    <div key={item.frameKey} className="scb-removed-item">
                      <span>{item.label}</span>
                      <small>{item.pageLabel} / {item.sceneName}</small>
                      <button type="button" onClick={() => restoreFrame(item.frameKey)}>Restore</button>
                    </div>
                  ))
                )}
                <div className="scb-simple-actions scb-simple-actions--stacked">
                  <button type="button" onClick={exportRemovalManifest} disabled={!removedFrames.length}>Export removal manifest</button>
                  <button type="button" onClick={resetRemovedFrames} disabled={!removedFrames.length}>Restore all</button>
                </div>
              </div>
            )}
          </section>
        </aside>

        <section className="scb-workspace">
          <section className="scb-panel scb-hero-panel">
            <div className="scb-panel__head scb-panel__head--spread">
              <div>
                <p>3. Choose frame</p>
                <h2>{selectedScene?.name || 'No scene selected'}</h2>
              </div>
              <span className="scb-frame-count">{visibleSceneMedia.length}/{selectedSceneMedia.length} active</span>
            </div>

            <div className="scb-frame-strip">
              {selectedSceneMedia.map((item) => {
                const isSelected = item.id === selectedMediaId;
                const src = isSelected && replacement ? replacement.previewUrl : item.path;
                return (
                  <button key={item.id} type="button" className={`scb-frame-card ${isSelected ? 'is-active' : ''} ${item.isRemoved ? 'is-removed' : ''}`} onClick={() => selectMedia(item.id)}>
                    <span className="scb-frame-card__order">{item.order}</span>
                    {item.isRemoved && <span className="scb-frame-card__replacement-flag scb-frame-card__replacement-flag--removed">Removed</span>}
                    {isSelected && replacement && <span className="scb-frame-card__replacement-flag">Live overwrite</span>}
                    {item.type === 'video' ? <video src={src} muted playsInline /> : <img src={src} alt="" />}
                    <span className="scb-frame-card__label">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="scb-detail-grid">
            <section className="scb-panel scb-preview-panel">
              <div className="scb-panel__head"><p>Preview</p></div>
              {selectedMedia ? (
                <div className={`scb-preview ${selectedMediaIsRemoved ? 'is-removed' : ''}`}>
                  {selectedMedia.type === 'video' ? <video src={previewSource} controls muted /> : <img src={previewSource} alt="" />}
                  {selectedMediaIsRemoved && <div className="scb-simple-banner scb-simple-banner--danger">Removed from working set</div>}
                  {replacement && <div className="scb-simple-banner">Replacement: {replacement.fileName}</div>}
                </div>
              ) : (
                <div className="scb-empty">Select a frame</div>
              )}
            </section>

            <section className="scb-panel scb-inspector">
              <div className="scb-panel__head"><p>4. Replace / remove / publish</p></div>

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
                        <dt>Will overwrite live path</dt>
                        <dd>{replacement.suggestedReplacementPath}</dd>
                      </dl>
                    </div>
                  )}

                  <div className="scb-simple-actions">
                    <button type="button" className="scb-primary-action" onClick={() => fileInputRef.current?.click()} disabled={selectedMediaIsRemoved}>
                      {replacement ? 'Change replacement image' : 'Select replacement image'}
                    </button>
                    <button type="button" className="scb-primary-action scb-primary-action--gold" onClick={handleDirectPublish} disabled={!replacement || publishState.status === 'uploading' || selectedMediaIsRemoved}>
                      {publishState.status === 'uploading' ? 'Publishing…' : 'Publish replacement'}
                    </button>
                    <button type="button" className="scb-danger-action" onClick={removeSelectedFrame} disabled={selectedMediaIsRemoved}>Remove frame</button>
                    {selectedMediaIsRemoved && <button type="button" onClick={() => restoreFrame(selectedMedia.frameKey)}>Restore frame</button>}
                    {replacement && <button type="button" onClick={clearReplacement}>Clear</button>}
                  </div>

                  <input ref={fileInputRef} type="file" accept="image/*,video/*" className="scb-hidden-input" onChange={handleReplacementFile} />

                  <div className={`scb-publish-status scb-publish-status--${publishState.status}`}>
                    <p className="scb-publish-status__title">
                      {publishState.status === 'idle' && 'Waiting'}
                      {publishState.status === 'ready' && 'Ready'}
                      {publishState.status === 'building' && 'Building'}
                      {publishState.status === 'uploading' && 'Publishing'}
                      {publishState.status === 'success' && 'Published'}
                      {publishState.status === 'error' && 'Error'}
                    </p>
                    <p>{publishState.message || 'Select a replacement image, remove weak frames, or export a cleanup manifest.'}</p>
                    {publishState.result?.commitSha && <p>Commit: {publishState.result.commitSha}</p>}
                    {publishState.result?.filesWritten?.length > 0 && (
                      <ul className="scb-file-list">
                        {publishState.result.filesWritten.map((file) => <li key={file}>{file}</li>)}
                      </ul>
                    )}
                  </div>

                  <button type="button" className="scb-advanced-toggle" onClick={() => setAdvancedOpen((value) => !value)}>
                    {advancedOpen ? 'Hide advanced options' : 'Advanced options'}
                  </button>

                  {advancedOpen && (
                    <div className="scb-advanced-box">
                      <p>Backup pack is only for manual recovery. Normal workflow is direct live-path overwrite.</p>
                      <button type="button" onClick={handleDownloadBackupPack} disabled={!replacement}>Download backup ZIP</button>
                      <button type="button" onClick={exportRemovalManifest} disabled={!removedFrames.length}>Download removal manifest</button>
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
        <p>Simple mode overwrites selected live frame paths. Removed frames are saved locally and exported as a cleanup manifest before permanent commit.</p>
      </footer>
    </div>
  );
}
