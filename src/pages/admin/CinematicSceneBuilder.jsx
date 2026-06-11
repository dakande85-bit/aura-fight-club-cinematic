import { useEffect, useMemo, useRef, useState } from 'react';
import './cinematic-scene-builder.css';

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
          type: item.type || item.kind || 'frame',
          device: item.device || 'all',
          status: item.status || scene.status || 'live',
          notes: item.notes || '',
          label: item.label || item.id || `Frame ${index + 1}`,
          posterCandidate: Boolean(item.posterCandidate),
        })),
      })),
    }));
  }

  return Object.entries(raw).map(([id, page]) => ({
    id,
    label: page.label || id,
    route: page.route || '',
    status: page.status || 'draft',
    scenes: (page.scenes || []).map((scene) => ({
      id: scene.id,
      name: scene.name || scene.title || scene.id,
      type: scene.type || 'imageSequence',
      status: scene.status || 'draft',
      media: (scene.media || []).map((item, index) => ({
        id: item.id || `${scene.id}-${index}`,
        path: item.path,
        type: item.type || item.kind || 'frame',
        device: item.device || 'all',
        status: item.status || scene.status || 'live',
        notes: item.notes || '',
        label: item.label || item.id || `Frame ${index + 1}`,
        posterCandidate: Boolean(item.posterCandidate),
      })),
    })),
  }));
}

function Status({ value }) {
  return <span className={`scb-status scb-status--${String(value || 'draft').replaceAll('_', '-')}`}>{value || 'draft'}</span>;
}

function isImage(item) {
  const type = String(item?.type || '').toLowerCase();
  const path = String(item?.replacementUrl || item?.path || '').toLowerCase();
  return type === 'frame' || type === 'poster' || /\.(png|jpe?g|webp|gif|avif)$/i.test(path);
}

function getExtension(filename = '') {
  const clean = filename.split('?')[0].split('#')[0];
  const dot = clean.lastIndexOf('.');
  return dot >= 0 ? clean.slice(dot) : '';
}

function getBaseFilename(path = '') {
  return String(path).split('/').pop() || 'replacement-file';
}

function makeReplacementFilename(originalPath = '', uploadedName = '') {
  const originalName = getBaseFilename(originalPath);
  const originalExt = getExtension(originalName);
  const uploadedExt = getExtension(uploadedName);
  const ext = uploadedExt || originalExt;
  const stem = originalName.replace(originalExt, '') || 'replacement';
  return `${stem}__draft-replacement${ext || '.png'}`;
}

function makeReplacementPath(originalPath = '', uploadedName = '') {
  const filename = makeReplacementFilename(originalPath, uploadedName);
  const folder = String(originalPath).split('/').slice(0, -1).join('/');
  return folder ? `${folder}/${filename}` : filename;
}

function makeSceneConfig(page, scene) {
  if (!scene) return {};
  return {
    page: page?.id,
    scene: {
      id: scene.id,
      name: scene.name,
      type: scene.type,
      status: scene.status,
      media: scene.media.map((item, index) => ({
        id: item.id,
        order: index + 1,
        type: item.type,
        device: item.device,
        status: item.status,
        path: item.path,
        draftReplacement: item.replacementName || null,
        suggestedReplacementPath: item.replacementName ? makeReplacementPath(item.path, item.replacementName) : null,
        posterCandidate: Boolean(item.posterCandidate),
        notes: item.notes || '',
      })),
    },
  };
}

function makeReplacementManifest(page, scene) {
  const replacements = [];

  (scene?.media || []).forEach((item, index) => {
    if (!item.replacementName) return;
    replacements.push({
      page: page?.id,
      pageLabel: page?.label,
      scene: scene?.id,
      sceneName: scene?.name,
      mediaId: item.id,
      mediaLabel: item.label || item.id,
      order: index + 1,
      replace: item.path,
      uploadedFileName: item.replacementName,
      suggestedReplacementPath: makeReplacementPath(item.path, item.replacementName),
      packFilePath: `media/${makeReplacementFilename(item.path, item.replacementName)}`,
      device: item.device,
      type: item.type,
      status: 'draft-replacement',
      readyForPublish: true,
      notes: item.notes || '',
    });
  });

  return {
    brand: 'AURA Fight Club',
    tool: 'Cinematic Scene Builder',
    mode: 'replacement-pack',
    generatedAt: new Date().toISOString(),
    page: page?.id || null,
    scene: scene?.id || null,
    replacementCount: replacements.length,
    replacements,
    packInstructions: [
      'Open replacement-manifest.json first.',
      'Media files are included in the media/ folder.',
      'Commit files using suggestedReplacementPath or replace the original path exactly after approval.',
      'Do not modify live ScrollFilm/CampaignScrollFilm rendering until the replacement pack is approved.',
    ],
  };
}

function makeCrcTable() {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    table[n] = c >>> 0;
  }
  return table;
}

const CRC_TABLE = makeCrcTable();

function crc32(bytes) {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i += 1) crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function u16(value) {
  const bytes = new Uint8Array(2);
  const view = new DataView(bytes.buffer);
  view.setUint16(0, value, true);
  return bytes;
}

function u32(value) {
  const bytes = new Uint8Array(4);
  const view = new DataView(bytes.buffer);
  view.setUint32(0, value >>> 0, true);
  return bytes;
}

function concatParts(parts) {
  return new Blob(parts, { type: 'application/zip' });
}

async function makeZipBlob(entries) {
  const encoder = new TextEncoder();
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBytes = encoder.encode(entry.name);
    const data = entry.data instanceof Uint8Array ? entry.data : new Uint8Array(await entry.data.arrayBuffer());
    const crc = crc32(data);
    const localHeader = [
      u32(0x04034b50), u16(20), u16(0), u16(0), u16(0), u16(0), u32(crc), u32(data.length), u32(data.length), u16(nameBytes.length), u16(0), nameBytes,
    ];
    const localSize = localHeader.reduce((sum, part) => sum + part.length, 0) + data.length;
    localParts.push(...localHeader, data);

    centralParts.push(
      u32(0x02014b50), u16(20), u16(20), u16(0), u16(0), u16(0), u16(0), u32(crc), u32(data.length), u32(data.length),
      u16(nameBytes.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(offset), nameBytes,
    );
    offset += localSize;
  }

  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const end = [u32(0x06054b50), u16(0), u16(0), u16(entries.length), u16(entries.length), u32(centralSize), u32(offset), u16(0)];
  return concatParts([...localParts, ...centralParts, ...end]);
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function CinematicSceneBuilder() {
  const [pages, setPages] = useState([]);
  const [activePageId, setActivePageId] = useState('homepage');
  const [activeSceneId, setActiveSceneId] = useState(null);
  const [activeMediaId, setActiveMediaId] = useState(null);
  const [error, setError] = useState('');
  const [packStatus, setPackStatus] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    fetch('/admin-cinematic/frames.json', { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) throw new Error(`Unable to load frames.json (${res.status})`);
        return res.json();
      })
      .then((raw) => {
        if (!mounted) return;
        const data = normaliseData(raw);
        setPages(data);
        const firstPage = data.find((p) => p.id === 'homepage') || data[0];
        const firstScene = firstPage?.scenes?.[0];
        const firstMedia = firstScene?.media?.[0];
        setActivePageId(firstPage?.id || 'homepage');
        setActiveSceneId(firstScene?.id || null);
        setActiveMediaId(firstMedia?.id || null);
      })
      .catch((err) => setError(err.message));
    return () => { mounted = false; };
  }, []);

  const activePage = pages.find((page) => page.id === activePageId) || pages[0];
  const activeScene = activePage?.scenes?.find((scene) => scene.id === activeSceneId) || activePage?.scenes?.[0];
  const activeMedia = activeScene?.media?.find((item) => item.id === activeMediaId) || activeScene?.media?.[0];

  const configJson = useMemo(() => JSON.stringify(makeSceneConfig(activePage, activeScene), null, 2), [activePage, activeScene]);
  const replacementManifest = useMemo(() => makeReplacementManifest(activePage, activeScene), [activePage, activeScene]);
  const replacementManifestJson = useMemo(() => JSON.stringify(replacementManifest, null, 2), [replacementManifest]);
  const hasReplacements = replacementManifest.replacementCount > 0;

  function updateSceneMedia(updater) {
    if (!activePage || !activeScene) return;
    setPages((currentPages) => currentPages.map((page) => {
      if (page.id !== activePage.id) return page;
      return {
        ...page,
        scenes: page.scenes.map((scene) => {
          if (scene.id !== activeScene.id) return scene;
          return { ...scene, media: updater(scene.media) };
        }),
      };
    }));
  }

  function selectPage(pageId) {
    const nextPage = pages.find((page) => page.id === pageId);
    const nextScene = nextPage?.scenes?.[0];
    const nextMedia = nextScene?.media?.[0];
    setActivePageId(pageId);
    setActiveSceneId(nextScene?.id || null);
    setActiveMediaId(nextMedia?.id || null);
    setPackStatus('');
  }

  function selectScene(sceneId) {
    const nextScene = activePage?.scenes?.find((scene) => scene.id === sceneId);
    setActiveSceneId(sceneId);
    setActiveMediaId(nextScene?.media?.[0]?.id || null);
    setPackStatus('');
  }

  function moveMedia(mediaId, direction) {
    updateSceneMedia((media) => {
      const index = media.findIndex((item) => item.id === mediaId);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= media.length) return media;
      const next = [...media];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function toggleHidden(mediaId) {
    updateSceneMedia((media) => media.map((item) => item.id === mediaId
      ? { ...item, status: item.status === 'hidden' ? 'draft' : 'hidden' }
      : item));
  }

  function markPoster(mediaId) {
    updateSceneMedia((media) => media.map((item) => ({ ...item, posterCandidate: item.id === mediaId ? !item.posterCandidate : item.posterCandidate })));
  }

  function replaceSelectedFile(event) {
    const file = event.target.files?.[0];
    if (!file || !activeMedia) return;
    const localUrl = URL.createObjectURL(file);
    updateSceneMedia((media) => media.map((item) => item.id === activeMedia.id
      ? { ...item, replacementUrl: localUrl, replacementName: file.name, replacementFile: file, status: 'draft-replacement' }
      : item));
    setPackStatus('Replacement staged. Export the pack when ready.');
    event.target.value = '';
  }

  async function copyJson() {
    await navigator.clipboard.writeText(configJson);
  }

  async function copyReplacementManifest() {
    await navigator.clipboard.writeText(replacementManifestJson);
  }

  function downloadJson() {
    downloadBlob(new Blob([configJson], { type: 'application/json' }), `${activePage?.id || 'page'}-${activeScene?.id || 'scene'}-config.json`);
  }

  function downloadReplacementManifest() {
    downloadBlob(new Blob([replacementManifestJson], { type: 'application/json' }), `${activePage?.id || 'page'}-${activeScene?.id || 'scene'}-replacement-manifest.json`);
  }

  async function downloadReplacementPack() {
    if (!activeScene || !hasReplacements) return;
    const entries = [
      { name: 'replacement-manifest.json', data: new TextEncoder().encode(replacementManifestJson) },
    ];

    activeScene.media.forEach((item) => {
      if (!item.replacementFile || !item.replacementName) return;
      entries.push({
        name: `media/${makeReplacementFilename(item.path, item.replacementName)}`,
        data: item.replacementFile,
      });
    });

    if (entries.length === 1) {
      setPackStatus('No replacement media files are still available in this browser session. Select the image again, then export.');
      return;
    }

    setPackStatus('Building replacement ZIP...');
    const zipBlob = await makeZipBlob(entries);
    downloadBlob(zipBlob, `${activePage?.id || 'page'}-${activeScene?.id || 'scene'}-replacement-pack.zip`);
    setPackStatus('Replacement ZIP downloaded. Upload that ZIP for publishing.');
  }

  if (error) {
    return (
      <main className="scb-page scb-page--center">
        <section className="scb-error">
          <p className="scb-eyebrow">AURA SCENE BUILDER</p>
          <h1>Frame inventory failed to load</h1>
          <p>{error}</p>
          <p className="scb-muted">Expected file: <code>/admin-cinematic/frames.json</code></p>
        </section>
      </main>
    );
  }

  if (!pages.length) {
    return <main className="scb-page scb-page--center"><p>Loading AURA Scene Builder...</p></main>;
  }

  return (
    <main className="scb-page">
      <header className="scb-header">
        <div>
          <p className="scb-eyebrow">AURA ADMIN / CINEMATIC SYSTEM</p>
          <h1>AURA Scene Builder</h1>
          <p>View current frames, test local replacements, reorder scenes, mark poster candidates, and export scene config.</p>
        </div>
        <div className="scb-header-card">
          <Status value="phase-2-replacement-pack" />
          <span>No live media is changed from this page yet.</span>
        </div>
      </header>

      <nav className="scb-tabs" aria-label="Cinematic pages">
        {pages.map((page) => (
          <button key={page.id} className={page.id === activePage?.id ? 'active' : ''} onClick={() => selectPage(page.id)}>
            <span>{page.label}</span>
            <small>{page.scenes.length} scenes</small>
          </button>
        ))}
      </nav>

      <section className="scb-grid">
        <aside className="scb-panel scb-sidebar">
          <div className="scb-panel-title">Scenes</div>
          {activePage?.scenes.map((scene) => (
            <button key={scene.id} className={`scb-scene-btn ${scene.id === activeScene?.id ? 'active' : ''}`} onClick={() => selectScene(scene.id)}>
              <strong>{scene.name}</strong>
              <span>{scene.type} · {scene.media.length} media</span>
              <Status value={scene.status} />
            </button>
          ))}
        </aside>

        <section className="scb-main">
          <div className="scb-section-head">
            <div>
              <p className="scb-eyebrow">Selected scene</p>
              <h2>{activeScene?.name}</h2>
            </div>
            <span className="scb-route">{activePage?.route || activePage?.id}</span>
          </div>

          <div className="scb-frame-strip">
            {activeScene?.media.map((item, index) => (
              <article key={item.id} className={`scb-frame-card ${item.id === activeMedia?.id ? 'active' : ''} ${item.status === 'hidden' ? 'hidden' : ''}`}>
                <button className="scb-thumb" onClick={() => setActiveMediaId(item.id)}>
                  {isImage(item) ? <img src={item.replacementUrl || item.path} alt={item.label || item.id} /> : <span className="scb-video-icon">VIDEO</span>}
                  {item.posterCandidate && <em>POSTER</em>}
                  {item.replacementName && <em className="scb-draft-flag">DRAFT</em>}
                </button>
                <div className="scb-frame-meta">
                  <strong>{String(index + 1).padStart(2, '0')}</strong>
                  <span>{item.type}</span>
                </div>
                <div className="scb-frame-actions">
                  <button onClick={() => moveMedia(item.id, -1)} disabled={index === 0}>←</button>
                  <button onClick={() => moveMedia(item.id, 1)} disabled={index === activeScene.media.length - 1}>→</button>
                  <button onClick={() => toggleHidden(item.id)}>{item.status === 'hidden' ? 'Show' : 'Hide'}</button>
                </div>
              </article>
            ))}
          </div>

          <section className="scb-inspector">
            <div className="scb-preview">
              {activeMedia && isImage(activeMedia) ? <img src={activeMedia.replacementUrl || activeMedia.path} alt={activeMedia.label || activeMedia.id} /> : <div className="scb-video-preview">Video / folder preview placeholder</div>}
              {activeMedia?.replacementName && <div className="scb-banner">Draft replacement: {activeMedia.replacementName}</div>}
            </div>

            <div className="scb-details">
              <p className="scb-eyebrow">Media inspector</p>
              <h3>{activeMedia?.label || activeMedia?.id}</h3>
              <dl>
                <dt>Path</dt><dd><code>{activeMedia?.path}</code></dd>
                <dt>Type</dt><dd>{activeMedia?.type}</dd>
                <dt>Device</dt><dd>{activeMedia?.device}</dd>
                <dt>Status</dt><dd><Status value={activeMedia?.status} /></dd>
                <dt>Notes</dt><dd>{activeMedia?.notes || <span className="scb-muted">No notes</span>}</dd>
                {activeMedia?.replacementName && (
                  <>
                    <dt>Replacement file</dt><dd><code>{activeMedia.replacementName}</code></dd>
                    <dt>Suggested path</dt><dd><code>{makeReplacementPath(activeMedia.path, activeMedia.replacementName)}</code></dd>
                    <dt>Pack path</dt><dd><code>media/{makeReplacementFilename(activeMedia.path, activeMedia.replacementName)}</code></dd>
                    <dt>Publish status</dt><dd><Status value="ready-for-publish" /></dd>
                  </>
                )}
              </dl>

              <div className="scb-detail-actions">
                <input ref={fileInputRef} type="file" accept="image/*" onChange={replaceSelectedFile} hidden />
                <button className="scb-btn primary" onClick={() => fileInputRef.current?.click()}>Select replacement image</button>
                <button className="scb-btn" onClick={() => activeMedia && markPoster(activeMedia.id)}>Toggle poster candidate</button>
              </div>
            </div>
          </section>

          <section className="scb-replacement-panel">
            <div className="scb-config-head">
              <div>
                <p className="scb-eyebrow">Draft replacement pack</p>
                <h2>Manifest + Media ZIP</h2>
              </div>
              <div>
                <button className="scb-btn" onClick={copyReplacementManifest} disabled={!hasReplacements}>Copy Manifest</button>
                <button className="scb-btn" onClick={downloadReplacementManifest} disabled={!hasReplacements}>Download Manifest</button>
                <button className="scb-btn primary" onClick={downloadReplacementPack} disabled={!hasReplacements}>Export Replacement Pack .ZIP</button>
              </div>
            </div>
            {hasReplacements ? (
              <>
                <div className="scb-replacement-summary">
                  <strong>{replacementManifest.replacementCount}</strong>
                  <span>draft replacement{replacementManifest.replacementCount === 1 ? '' : 's'} ready for review/publish. ZIP includes manifest + replacement media.</span>
                </div>
                {packStatus && <div className="scb-pack-status">{packStatus}</div>}
                <pre><code>{replacementManifestJson}</code></pre>
              </>
            ) : (
              <div className="scb-empty-replacements">
                Select a frame, choose “Select replacement image”, then export one replacement ZIP containing the manifest and image files.
              </div>
            )}
          </section>

          <section className="scb-config">
            <div className="scb-config-head">
              <div>
                <p className="scb-eyebrow">Generated config</p>
                <h2>Scene JSON</h2>
              </div>
              <div>
                <button className="scb-btn" onClick={copyJson}>Copy JSON</button>
                <button className="scb-btn primary" onClick={downloadJson}>Download JSON</button>
              </div>
            </div>
            <pre><code>{configJson}</code></pre>
          </section>
        </section>
      </section>
    </main>
  );
}
