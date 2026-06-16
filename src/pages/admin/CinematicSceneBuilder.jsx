import { useMemo, useState } from 'react';
import './cinematic-scene-builder.css';
import './cinematic-scene-builder-publish.css';

const STORAGE_KEY = 'aura:home-frame-overrides:v1';
const BASE = '/assets/aura-scroll';
const MAX_FILE_MB = 18;

const FRAME_CATALOG = [
  ['shadow-boxing', 'Shadow guard raised', '02_shadow_boxing_the_standard/frame_02_shadow_02_guard_raised.png'],
  ['shadow-boxing', 'Shadow jab start', '02_shadow_boxing_the_standard/frame_05_shadow_05_jab_start.png'],
  ['shadow-boxing', 'Shadow jab extension', '02_shadow_boxing_the_standard/frame_06_shadow_06_jab_extension.png'],
  ['shadow-boxing', 'Shadow return guard', '02_shadow_boxing_the_standard/frame_07_shadow_07_return_guard.png'],
  ['shadow-boxing', 'Shadow defensive slip', '02_shadow_boxing_the_standard/frame_08_shadow_08_defensive_slip.png'],
  ['the-work', 'Handwrap start', '03_the_work_handwraps/frame_01_handwrap_start.png'],
  ['the-work', 'Wrap check', '03_the_work_handwraps/frame_03_wrap_check.png'],
  ['the-work', 'Wrap tighten', '03_the_work_handwraps/frame_05_wrap_tighten.png'],
  ['the-work', 'Wrap guard', '03_the_work_handwraps/frame_08_wrap_guard.png'],
  ['the-work', 'Work final', '03_the_work_handwraps/frame_10_work_final.png'],
  ['footwork', 'Skip ready', '04_footwork_skipping/frame_01_skip_ready.png'],
  ['footwork', 'Rope swing low', '04_footwork_skipping/frame_03_rope_swing_low.png'],
  ['footwork', 'Jump midair', '04_footwork_skipping/frame_06_jump_midair.png'],
  ['footwork', 'Jump high', '04_footwork_skipping/frame_08_jump_high.png'],
  ['footwork', 'Skip reset', '04_footwork_skipping/frame_10_skip_reset.png'],
  ['drop-001', 'Cream uniform model', '05_drop_001_tools_uniform/frame_01_cream_uniform_model.png'],
  ['drop-001', 'Cream full outfit model', '05_drop_001_tools_uniform/frame_09_cream_full_outfit_model.png'],
  ['campaign', 'Mitts real 01', '06_campaign_mitts_sequence/frame_01_mitts_real.png'],
  ['campaign', 'Mitts real 02', '06_campaign_mitts_sequence/frame_02_mitts_real.png'],
  ['campaign', 'Mitts real 03', '06_campaign_mitts_sequence/frame_03_mitts_real.png'],
  ['campaign', 'Mitts real 04', '06_campaign_mitts_sequence/frame_04_mitts_real.png'],
  ['campaign', 'Mitts real 05', '06_campaign_mitts_sequence/frame_05_mitts_real.png'],
  ['fight-club', 'Fight club close', '07_fight_club_close/frame_01_fight_club_close.png'],
  ['fight-club', 'Fight club ringside black', '07_fight_club_close/frame_03_fight_club_ringside_black.png'],
  ['fight-club', 'Fight club tracksuit ring', '07_fight_club_close/frame_04_fight_club_tracksuit_ring.png'],
  ['fight-club', 'Fight club female wraps', '07_fight_club_close/frame_05_fight_club_female_wraps.png'],
].map(([scene, label, file], index) => ({ id: `${scene}-${index}`, scene, label, path: `${BASE}/${file}` }));

const SCENES = [
  { id: 'rain-intro', label: 'Rain intro video' },
  { id: 'shadow-boxing', label: 'Shadow boxing' },
  { id: 'the-work', label: 'The work / handwraps' },
  { id: 'footwork', label: 'Footwork' },
  { id: 'drop-001', label: 'Drop 001' },
  { id: 'campaign', label: 'Campaign mitts' },
  { id: 'fight-club', label: 'Fight Club' },
];

function emptySettings() {
  return { videoSrc: '', mobileHero: '', replacements: {}, removed: [] };
}

function readSettings() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return {
      ...emptySettings(),
      videoSrc: parsed.videoSrc || '',
      mobileHero: parsed.mobileHero || '',
      replacements: parsed.replacements || {},
      removed: Array.isArray(parsed.removed) ? parsed.removed : [],
    };
  } catch {
    return emptySettings();
  }
}

function saveSettings(settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings, null, 2));
  window.dispatchEvent(new CustomEvent('aura-home-frames-updated'));
  window.AURA_APPLY_HOME_FRAME_OVERRIDES?.();
}

function isVideo(value = '') {
  return String(value).startsWith('data:video/') || /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(String(value));
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function CinematicSceneBuilder() {
  const [settings, setSettings] = useState(() => readSettings());
  const [sceneId, setSceneId] = useState('drop-001');
  const [selectedPath, setSelectedPath] = useState(FRAME_CATALOG.find(f => f.scene === 'drop-001')?.path || FRAME_CATALOG[0].path);
  const [newUrl, setNewUrl] = useState('');
  const [uploadedName, setUploadedName] = useState('');
  const [message, setMessage] = useState('Upload image/video, paste a URL/path, replace frames, hide frames, delete replacements, or update the home video.');

  const sceneFrames = useMemo(() => FRAME_CATALOG.filter(frame => frame.scene === sceneId), [sceneId]);
  const selectedFrame = FRAME_CATALOG.find(frame => frame.path === selectedPath) || sceneFrames[0] || FRAME_CATALOG[0];
  const previewSrc = settings.replacements[selectedFrame.path] || selectedFrame.path;
  const pendingSrc = newUrl.trim();
  const isRemoved = settings.removed.includes(selectedFrame.path);
  const hasReplacement = Boolean(settings.replacements[selectedFrame.path]);

  function updateSetting(next) {
    setSettings(next);
    saveSettings(next);
  }

  function selectScene(id) {
    setSceneId(id);
    const first = FRAME_CATALOG.find(frame => frame.scene === id);
    if (first) setSelectedPath(first.path);
    setNewUrl('');
    setUploadedName('');
  }

  async function handleUpload(event, mediaKind = 'image') {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const fileSizeMb = file.size / (1024 * 1024);
    if (fileSizeMb > MAX_FILE_MB) {
      setMessage(`File is ${fileSizeMb.toFixed(1)}MB. Use a smaller compressed ${mediaKind}. Browser uploads are stored locally.`);
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setNewUrl(dataUrl);
      setUploadedName(`${file.name} · ${fileSizeMb.toFixed(1)}MB`);
      setMessage(`${mediaKind === 'video' ? 'Video' : 'Image'} loaded. Now click the update/replace button to apply it.`);
    } catch {
      setMessage('Upload failed. Try a smaller file or paste a URL/path.');
    }
  }

  function replaceFrame() {
    const value = newUrl.trim();
    if (!value) {
      setMessage('Upload an image/video or paste a URL/site path first.');
      return;
    }
    const next = {
      ...settings,
      replacements: { ...settings.replacements, [selectedFrame.path]: value },
      removed: settings.removed.filter(path => path !== selectedFrame.path),
    };
    updateSetting(next);
    setMessage(`Updated frame: ${selectedFrame.label}. Open/refresh homepage to see it.`);
  }

  function hideFrame() {
    const next = {
      ...settings,
      removed: Array.from(new Set([...settings.removed, selectedFrame.path])),
    };
    updateSetting(next);
    setMessage(`Hidden from homepage rotation: ${selectedFrame.label}.`);
  }

  function deleteReplacement() {
    const replacements = { ...settings.replacements };
    delete replacements[selectedFrame.path];
    const next = { ...settings, replacements };
    updateSetting(next);
    setNewUrl('');
    setUploadedName('');
    setMessage(`Deleted replacement. Original remains ${settings.removed.includes(selectedFrame.path) ? 'hidden' : 'visible'}.`);
  }

  function restoreFrame() {
    const replacements = { ...settings.replacements };
    delete replacements[selectedFrame.path];
    const next = {
      ...settings,
      replacements,
      removed: settings.removed.filter(path => path !== selectedFrame.path),
    };
    updateSetting(next);
    setNewUrl('');
    setUploadedName('');
    setMessage(`Restored and shown: ${selectedFrame.label}.`);
  }

  function saveVideo() {
    const value = newUrl.trim();
    if (!value) {
      setMessage('Upload a video or paste a video URL/path first.');
      return;
    }
    updateSetting({ ...settings, videoSrc: value });
    setMessage('Home intro video source updated. Open/refresh homepage to see it.');
  }

  function deleteVideo() {
    updateSetting({ ...settings, videoSrc: '' });
    setNewUrl('');
    setUploadedName('');
    setMessage('Intro video override deleted. Default video restored.');
  }

  function setMobileHero() {
    const value = newUrl.trim() || previewSrc;
    updateSetting({ ...settings, mobileHero: value });
    setMessage('Mobile homepage hero image updated. Open/refresh homepage on mobile to see it.');
  }

  function deleteMobileHero() {
    updateSetting({ ...settings, mobileHero: '' });
    setMessage('Mobile homepage hero override deleted.');
  }

  function resetAll() {
    updateSetting(emptySettings());
    setNewUrl('');
    setUploadedName('');
    setMessage('All homepage frame, video, hidden, and mobile hero overrides reset.');
  }

  return (
    <div className="scb-shell scb-shell--simple">
      <header className="scb-header">
        <div>
          <p className="scb-kicker">AURA ADMIN</p>
          <h1>Homepage Media Manager</h1>
          <p>Upload image/video files, paste URLs, replace frames, hide frames, delete replacements, update intro video, and set the mobile hero. Saves locally in this browser.</p>
        </div>
        <div className="scb-header__meta">
          <span>{Object.keys(settings.replacements).length} replaced</span>
          <span>{settings.removed.length} hidden</span>
          <span>{settings.videoSrc ? 'Video changed' : 'Default video'}</span>
          <span>{settings.mobileHero ? 'Mobile hero set' : 'Default mobile hero'}</span>
        </div>
      </header>

      <main className="scb-grid">
        <aside className="scb-sidebar">
          <section className="scb-panel">
            <div className="scb-panel__head"><p>1. Choose area</p></div>
            <div className="scb-scene-list">
              {SCENES.map(scene => (
                <button key={scene.id} type="button" className={`scb-scene-card ${scene.id === sceneId ? 'is-active' : ''}`} onClick={() => selectScene(scene.id)}>
                  <span>{scene.label}</span>
                  <small>{scene.id === 'rain-intro' ? 'upload/replace video' : `${FRAME_CATALOG.filter(frame => frame.scene === scene.id).length} frames`}</small>
                </button>
              ))}
            </div>
          </section>
        </aside>

        <section className="scb-workspace">
          {sceneId !== 'rain-intro' ? (
            <>
              <section className="scb-panel scb-hero-panel">
                <div className="scb-panel__head scb-panel__head--spread">
                  <div>
                    <p>2. Choose frame</p>
                    <h2>{SCENES.find(scene => scene.id === sceneId)?.label}</h2>
                  </div>
                  <span className="scb-frame-count">{sceneFrames.length} frames</span>
                </div>
                <div className="scb-frame-strip">
                  {sceneFrames.map(frame => {
                    const replaced = Boolean(settings.replacements[frame.path]);
                    const removed = settings.removed.includes(frame.path);
                    const src = settings.replacements[frame.path] || frame.path;
                    return (
                      <button key={frame.path} type="button" className={`scb-frame-card ${frame.path === selectedFrame.path ? 'is-active' : ''} ${removed ? 'is-removed' : ''}`} onClick={() => setSelectedPath(frame.path)}>
                        {removed && <span className="scb-frame-card__replacement-flag scb-frame-card__replacement-flag--removed">Hidden</span>}
                        {replaced && <span className="scb-frame-card__replacement-flag">Updated</span>}
                        {isVideo(src) ? <video src={src} muted playsInline /> : <img src={src} alt="" />}
                        <span className="scb-frame-card__label">{frame.label}</span>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="scb-detail-grid">
                <section className="scb-panel scb-preview-panel">
                  <div className="scb-panel__head"><p>Preview</p></div>
                  <div className={`scb-preview ${isRemoved ? 'is-removed' : ''}`}>
                    {isVideo(previewSrc) ? <video src={previewSrc} controls muted playsInline /> : <img src={previewSrc} alt="" />}
                    {isRemoved && <div className="scb-simple-banner scb-simple-banner--danger">Hidden from homepage rotation</div>}
                  </div>
                  {pendingSrc && (
                    <div className="scb-upload-preview">
                      <p className="scb-replacement-box__title">Pending upload / URL</p>
                      {isVideo(pendingSrc) ? <video src={pendingSrc} controls muted playsInline /> : <img src={pendingSrc} alt="" />}
                    </div>
                  )}
                </section>

                <section className="scb-panel scb-inspector">
                  <div className="scb-panel__head"><p>3. Upload / replace / hide / delete</p></div>
                  <div className="scb-fields">
                    <label>
                      <span>Selected frame</span>
                      <input value={selectedFrame.label} readOnly />
                    </label>
                    <label>
                      <span>Upload image or video</span>
                      <input type="file" accept="image/*,video/*" onChange={event => handleUpload(event, 'image')} />
                    </label>
                    {uploadedName && <p className="scb-upload-note">Loaded: {uploadedName}</p>}
                    <label>
                      <span>Or paste image/video URL or site path</span>
                      <textarea value={newUrl} onChange={event => setNewUrl(event.target.value)} placeholder="Paste /assets/... path, image URL, video URL, or upload a file above" />
                    </label>
                    <div className="scb-simple-actions">
                      <button type="button" className="scb-primary-action scb-primary-action--gold" onClick={replaceFrame}>Update / replace frame</button>
                      <button type="button" className="scb-danger-action" onClick={hideFrame}>Hide frame</button>
                      <button type="button" onClick={deleteReplacement} disabled={!hasReplacement}>Delete uploaded replacement</button>
                      <button type="button" onClick={restoreFrame}>Restore + show original</button>
                      <button type="button" onClick={setMobileHero}>Use as mobile hero</button>
                      <button type="button" onClick={deleteMobileHero} disabled={!settings.mobileHero}>Delete mobile hero</button>
                      <a className="scb-primary-action" href="/" target="_blank" rel="noreferrer">Open homepage</a>
                    </div>
                  </div>
                </section>
              </section>
            </>
          ) : (
            <section className="scb-panel scb-inspector">
              <div className="scb-panel__head"><p>Intro video</p></div>
              <div className="scb-fields">
                <label>
                  <span>Current video override</span>
                  <textarea value={settings.videoSrc || 'Default intro video'} readOnly />
                </label>
                <label>
                  <span>Upload video</span>
                  <input type="file" accept="video/*" onChange={event => handleUpload(event, 'video')} />
                </label>
                {uploadedName && <p className="scb-upload-note">Loaded: {uploadedName}</p>}
                <label>
                  <span>Or paste video URL or site path</span>
                  <textarea value={newUrl} onChange={event => setNewUrl(event.target.value)} placeholder="Paste video URL, /assets/...mp4 path, or upload a video above" />
                </label>
                {pendingSrc && <div className="scb-upload-preview"><video src={pendingSrc} controls muted playsInline /></div>}
                <div className="scb-simple-actions">
                  <button type="button" className="scb-primary-action scb-primary-action--gold" onClick={saveVideo}>Update home video</button>
                  <button type="button" className="scb-danger-action" onClick={deleteVideo} disabled={!settings.videoSrc}>Delete video override</button>
                  <a className="scb-primary-action" href="/" target="_blank" rel="noreferrer">Open homepage</a>
                </div>
              </div>
            </section>
          )}
        </section>
      </main>

      <footer className="scb-footer">
        <p>{message}</p>
        <p className="scb-muted">Uploads are saved in this browser storage. Use compressed images/videos. For permanent public launch changes, these choices still need committing or backend storage.</p>
        <button type="button" className="scb-danger-action" onClick={resetAll}>Reset all media overrides</button>
      </footer>
    </div>
  );
}
