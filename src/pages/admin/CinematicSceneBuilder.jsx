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
        path: item.replacementName ? item.path : item.path,
        draftReplacement: item.replacementName || null,
        posterCandidate: Boolean(item.posterCandidate),
        notes: item.notes || '',
      })),
    },
  };
}

export default function CinematicSceneBuilder() {
  const [pages, setPages] = useState([]);
  const [activePageId, setActivePageId] = useState('homepage');
  const [activeSceneId, setActiveSceneId] = useState(null);
  const [activeMediaId, setActiveMediaId] = useState(null);
  const [error, setError] = useState('');
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
  }

  function selectScene(sceneId) {
    const nextScene = activePage?.scenes?.find((scene) => scene.id === sceneId);
    setActiveSceneId(sceneId);
    setActiveMediaId(nextScene?.media?.[0]?.id || null);
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
      ? { ...item, replacementUrl: localUrl, replacementName: file.name, status: 'draft-replacement' }
      : item));
    event.target.value = '';
  }

  async function copyJson() {
    await navigator.clipboard.writeText(configJson);
  }

  function downloadJson() {
    const blob = new Blob([configJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activePage?.id || 'page'}-${activeScene?.id || 'scene'}-config.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
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
          <Status value="phase-1-preview" />
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
              </dl>

              <div className="scb-detail-actions">
                <input ref={fileInputRef} type="file" accept="image/*" onChange={replaceSelectedFile} hidden />
                <button className="scb-btn primary" onClick={() => fileInputRef.current?.click()}>Select replacement image</button>
                <button className="scb-btn" onClick={() => activeMedia && markPoster(activeMedia.id)}>Toggle poster candidate</button>
              </div>
            </div>
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
