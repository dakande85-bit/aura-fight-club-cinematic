import { useMemo, useState } from 'react';
import './cinematic-scene-builder.css';
import './cinematic-scene-builder-publish.css';

const STORAGE_KEY = 'aura:home-frame-overrides:v1';
const BASE = '/assets/aura-scroll';

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

function readSettings() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return {
      videoSrc: parsed.videoSrc || '',
      mobileHero: parsed.mobileHero || '',
      replacements: parsed.replacements || {},
      removed: Array.isArray(parsed.removed) ? parsed.removed : [],
    };
  } catch {
    return { videoSrc: '', mobileHero: '', replacements: {}, removed: [] };
  }
}

function saveSettings(settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings, null, 2));
  window.dispatchEvent(new CustomEvent('aura-home-frames-updated'));
  window.AURA_APPLY_HOME_FRAME_OVERRIDES?.();
}

export default function CinematicSceneBuilder() {
  const [settings, setSettings] = useState(() => readSettings());
  const [sceneId, setSceneId] = useState('drop-001');
  const [selectedPath, setSelectedPath] = useState(FRAME_CATALOG.find(f => f.scene === 'drop-001')?.path || FRAME_CATALOG[0].path);
  const [newUrl, setNewUrl] = useState('');
  const [message, setMessage] = useState('Changes save to this browser and affect the homepage after refresh/opening it.');

  const sceneFrames = useMemo(() => FRAME_CATALOG.filter(frame => frame.scene === sceneId), [sceneId]);
  const selectedFrame = FRAME_CATALOG.find(frame => frame.path === selectedPath) || sceneFrames[0] || FRAME_CATALOG[0];
  const previewSrc = settings.replacements[selectedFrame.path] || selectedFrame.path;
  const isRemoved = settings.removed.includes(selectedFrame.path);

  function updateSetting(next) {
    setSettings(next);
    saveSettings(next);
  }

  function selectScene(id) {
    setSceneId(id);
    const first = FRAME_CATALOG.find(frame => frame.scene === id);
    if (first) setSelectedPath(first.path);
    setNewUrl('');
  }

  function replaceFrame() {
    const value = newUrl.trim();
    if (!value) {
      setMessage('Paste an image URL or site path first. Example: /assets/aura-scroll/.../frame.png');
      return;
    }
    const next = {
      ...settings,
      replacements: { ...settings.replacements, [selectedFrame.path]: value },
      removed: settings.removed.filter(path => path !== selectedFrame.path),
    };
    updateSetting(next);
    setMessage(`Replaced: ${selectedFrame.label}. Open/refresh homepage to see it.`);
  }

  function removeFrame() {
    const next = {
      ...settings,
      removed: Array.from(new Set([...settings.removed, selectedFrame.path])),
    };
    updateSetting(next);
    setMessage(`Removed from homepage rotation: ${selectedFrame.label}.`);
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
    setMessage(`Restored: ${selectedFrame.label}.`);
  }

  function saveVideo() {
    updateSetting({ ...settings, videoSrc: newUrl.trim() });
    setMessage('Home intro video source saved. Open/refresh homepage to see it.');
  }

  function setMobileHero() {
    const value = newUrl.trim() || previewSrc;
    updateSetting({ ...settings, mobileHero: value });
    setMessage('Mobile homepage hero image saved. Open/refresh homepage on mobile to see it.');
  }

  function resetAll() {
    const empty = { videoSrc: '', mobileHero: '', replacements: {}, removed: [] };
    updateSetting(empty);
    setNewUrl('');
    setMessage('All homepage frame overrides reset.');
  }

  return (
    <div className="scb-shell scb-shell--simple">
      <header className="scb-header">
        <div>
          <p className="scb-kicker">AURA ADMIN</p>
          <h1>Homepage Frames</h1>
          <p>This panel now changes the homepage frames in this browser. Replace, remove, restore, set mobile hero, or change intro video.</p>
        </div>
        <div className="scb-header__meta">
          <span>{Object.keys(settings.replacements).length} replaced</span>
          <span>{settings.removed.length} removed</span>
          <span>{settings.mobileHero ? 'Mobile hero set' : 'Default mobile hero'}</span>
        </div>
      </header>

      <main className="scb-grid">
        <aside className="scb-sidebar">
          <section className="scb-panel">
            <div className="scb-panel__head"><p>1. Choose scene</p></div>
            <div className="scb-scene-list">
              {SCENES.map(scene => (
                <button key={scene.id} type="button" className={`scb-scene-card ${scene.id === sceneId ? 'is-active' : ''}`} onClick={() => selectScene(scene.id)}>
                  <span>{scene.label}</span>
                  <small>{scene.id === 'rain-intro' ? 'video source' : `${FRAME_CATALOG.filter(frame => frame.scene === scene.id).length} frames`}</small>
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
                    return (
                      <button key={frame.path} type="button" className={`scb-frame-card ${frame.path === selectedFrame.path ? 'is-active' : ''} ${removed ? 'is-removed' : ''}`} onClick={() => setSelectedPath(frame.path)}>
                        {removed && <span className="scb-frame-card__replacement-flag scb-frame-card__replacement-flag--removed">Removed</span>}
                        {replaced && <span className="scb-frame-card__replacement-flag">Replaced</span>}
                        <img src={settings.replacements[frame.path] || frame.path} alt="" />
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
                    <img src={previewSrc} alt="" />
                    {isRemoved && <div className="scb-simple-banner scb-simple-banner--danger">Removed from homepage rotation</div>}
                  </div>
                </section>

                <section className="scb-panel scb-inspector">
                  <div className="scb-panel__head"><p>3. Replace / remove / save</p></div>
                  <div className="scb-fields">
                    <label>
                      <span>Selected frame</span>
                      <input value={selectedFrame.label} readOnly />
                    </label>
                    <label>
                      <span>Original path</span>
                      <textarea value={selectedFrame.path} readOnly />
                    </label>
                    <label>
                      <span>New image URL or site path</span>
                      <textarea value={newUrl} onChange={event => setNewUrl(event.target.value)} placeholder="Paste /assets/... image path or uploaded image URL" />
                    </label>
                    <div className="scb-simple-actions">
                      <button type="button" className="scb-primary-action scb-primary-action--gold" onClick={replaceFrame}>Replace frame</button>
                      <button type="button" className="scb-danger-action" onClick={removeFrame}>Remove frame</button>
                      <button type="button" onClick={restoreFrame}>Restore frame</button>
                      <button type="button" onClick={setMobileHero}>Use as mobile hero</button>
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
                  <span>Current override</span>
                  <textarea value={settings.videoSrc || 'Default intro video'} readOnly />
                </label>
                <label>
                  <span>New video URL or site path</span>
                  <textarea value={newUrl} onChange={event => setNewUrl(event.target.value)} placeholder="Paste video URL or /assets/...mp4 path" />
                </label>
                <div className="scb-simple-actions">
                  <button type="button" className="scb-primary-action scb-primary-action--gold" onClick={saveVideo}>Save intro video</button>
                  <a className="scb-primary-action" href="/" target="_blank" rel="noreferrer">Open homepage</a>
                </div>
              </div>
            </section>
          )}
        </section>
      </main>

      <footer className="scb-footer">
        <p>{message}</p>
        <button type="button" className="scb-danger-action" onClick={resetAll}>Reset all homepage frame overrides</button>
      </footer>
    </div>
  );
}
