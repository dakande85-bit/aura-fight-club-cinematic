import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import JSZip from 'jszip';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { checkTrailerPlan, exportManifest, makeTrailerPlan, safeAssetName, totalDuration, VISUAL_TYPES, RIGHTS_TYPES } from '../lib/trailerStudio.js';
import '../styles/aura-trailer-studio.css';

const TYPE_NAMES = { licensed_clip: 'Real fight clip', real_photo: 'Authentic photograph', ai_scene: 'Illustrative AI cinematic', reveal: 'Final fighter reveal' };
const RIGHTS_NAMES = { self_owned: 'Shot or photographed by Aura', licensed: 'Licensed for social use', written_permission: 'Written reuse permission', original_ai: 'Original generated illustration' };
const TIP = 'Upload only assets you own or have permission to reuse. TV broadcasts, social-media reposts and press photographs are not automatically licensed for another account.';
function saveFile(blob, name) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = name; document.body.append(anchor); anchor.click(); anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}
export default function AdminTrailerStudio() {
  const [plan, setPlan] = useState(() => makeTrailerPlan());
  const [assets, setAssets] = useState({});
  const [assetUrls, setAssetUrls] = useState({});
  const [selectedId, setSelectedId] = useState('hook');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playIndex, setPlayIndex] = useState(0);
  const voiceRef = useRef(null);
  const musicRef = useRef(null);
  const selected = plan.shots.find(x => x.id === selectedId) || plan.shots[0];
  const shownShot = isPlaying ? (plan.shots[playIndex] || plan.shots[0]) : selected;
  const mediaNames = useMemo(() => new Set(Object.values(assets).filter(Boolean).map(x => x.path)), [assets]);
  const renderErrors = useMemo(() => checkTrailerPlan(plan, mediaNames), [plan, mediaNames]);
  const duration = totalDuration(plan);
  useEffect(() => {
    const next = {};
    Object.entries(assets).forEach(([key, asset]) => { if (asset?.file) next[key] = URL.createObjectURL(asset.file); });
    setAssetUrls(next);
    return () => Object.values(next).forEach(url => URL.revokeObjectURL(url));
  }, [assets]);
  useEffect(() => {
    if (!isPlaying) return undefined;
    const shot = plan.shots[playIndex];
    if (!shot) return undefined;
    const handle = window.setTimeout(() => {
      if (playIndex >= plan.shots.length - 1) { setIsPlaying(false); voiceRef.current?.pause(); musicRef.current?.pause(); }
      else setPlayIndex(i => i + 1);
    }, Number(shot.seconds) * 1000);
    return () => window.clearTimeout(handle);
  }, [isPlaying, playIndex, plan.shots]);
  function startPreview() {
    setPlayIndex(0); setIsPlaying(true);
    [voiceRef.current, musicRef.current].forEach(audio => {
      if (!audio) return;
      audio.currentTime = 0;
      audio.play().catch(() => setNotice('Your browser blocked audio autoplay. You can still review the storyboard.'));
    });
  }
  function stopPreview() { setIsPlaying(false); voiceRef.current?.pause(); musicRef.current?.pause(); }
  function updatePlan(key, value) { setPlan(p => ({ ...p, [key]: value })); }
  function updateShot(key, value) {
    setPlan(p => ({ ...p, shots: p.shots.map(s => s.id === selected.id ? { ...s, [key]: value } : s) }));
  }
  function chooseTemplate(which) {
    setPlan(makeTrailerPlan(which));
    setAssets({});
    stopPreview();
    setSelectedId(which === 'commentary' ? 'intro' : 'hook');
    setNotice('Template loaded. Attach and review your own media; nothing was generated or published.');
  }
  function move(index, change) {
    const target = index + change;
    if (target < 0 || target >= plan.shots.length) return;
    setPlan(p => {
      const shots = [...p.shots];
      [shots[index], shots[target]] = [shots[target], shots[index]];
      return { ...p, shots };
    });
  }
  function addShot() {
    const id = 'shot-' + Date.now().toString(36);
    setPlan(p => ({ ...p, shots: [...p.shots, {
      id, name: 'New scene', kind: 'real_photo', seconds: 3, direction: '',
      text: '', fileName: '', sourceUrl: '', rights: '', rightsVerified: false,
      approved: false, aiDisclosure: false
    }] }));
    setSelectedId(id);
  }
  function deleteShot() {
    if (plan.shots.length < 2) { setNotice('Keep at least one scene in the trailer.'); return; }
    const id = selected.id;
    const remaining = plan.shots.filter(s => s.id !== id);
    setPlan(p => ({ ...p, shots: remaining }));
    setAssets(a => { const next = { ...a }; delete next[id]; return next; });
    setSelectedId(remaining[0].id);
  }
  function setMedia(key, e, kind) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > 200 * 1024 * 1024) { setNotice('Individual files must be 200 MB or smaller.'); return; }
    const accepted = kind === 'audio' ? file.type.startsWith('audio/') : kind === 'cover' ? file.type.startsWith('image/') : file.type.startsWith('image/') || file.type.startsWith('video/');
    if (!accepted) { setNotice('Choose a compatible image, video or audio file for this slot.'); return; }
    const path = key === 'narration' ? 'audio/narration-' + safeAssetName(file.name)
      : key === 'music' ? 'audio/music-' + safeAssetName(file.name)
        : key === 'cover' ? 'cover/' + safeAssetName(file.name)
          : 'media/' + safeAssetName(key) + '-' + safeAssetName(file.name);
    setAssets(a => ({ ...a, [key]: { file, path } }));
    if (key === 'narration') updatePlan('narrationFile', path);
    else if (key === 'music') updatePlan('musicFile', path);
    else if (key === 'cover') setPlan(p => ({ ...p, coverFile: path, coverRightsVerified: false }));
    else setPlan(p => ({ ...p, shots: p.shots.map(shot => shot.id === key ? { ...shot, fileName: path, rightsVerified: false, approved: false } : shot) }));
    setNotice('Local asset attached. It remains on this device until you export the pack.');
  }
  function savePlan() {
    const blob = new Blob([JSON.stringify(exportManifest(plan), null, 2)], { type: 'application/json' });
    saveFile(blob, 'aura-trailer-storyboard.json');
    setNotice('Storyboard downloaded. Missing media stays marked as missing.');
  }
  async function exportPack() {
    if (renderErrors.length) { setNotice('Resolve the readiness checklist before exporting a render pack.'); return; }
    setBusy(true); setNotice('');
    try {
      const zip = new JSZip();
      Object.values(assets).forEach(asset => { if (asset?.path) zip.file(asset.path, asset.file); });
      zip.file('manifest.json', JSON.stringify(exportManifest(plan), null, 2));
      zip.file('README.txt', 'AURA cinematic trailer — reviewed local media pack\n\nRender with:\npython3 scripts/render-cinematic-trailer.py path/to/aura-trailer-pack.zip --output trailer.mp4\n\nThe Python renderer uses FFmpeg and Pillow. It does not generate new footage, buy API credits, or post to social networks.\n\nRecheck licences, truthful matchup status and content before any public upload.\n');
      saveFile(await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 1 } }), 'aura-trailer-pack.zip');
      setNotice('Reviewed production pack exported. Run the FFmpeg renderer to create an MP4; nothing has been posted.');
    } catch (error) { setNotice('Could not create the pack: ' + error.message); }
    finally { setBusy(false); }
  }
  const attached = shownShot && assets[shownShot.id];
  const preview = shownShot && assetUrls[shownShot.id];
  return <><Header/><main className="aura-trailer">
    <div className="aura-trailer__top">
      <div><p className="aura-trailer__eyebrow">AURA / FIGHT DESK / CREATIVE STUDIO</p>
        <h1>Cinematic Trailer Studio</h1>
        <p>Build short, tense, shot-led fight promos. This is a private browser-based draft editor: no fake bout footage, no credit spending and no automatic publishing.</p>
      </div>
      <Link to="/admin/social" className="aura-trailer__back">← Back to social desk</Link>
    </div>
    <div className="aura-trailer__toolbar">
      <button onClick={() => chooseTemplate('fundora')} type="button">Cinematic teaser · 24s</button>
      <button onClick={() => chooseTemplate('commentary')} type="button">Boxing breakdown · 45s</button>
      <span>{plan.shots.length} shots · {duration.toFixed(1)}s · 9:16 / 1080 × 1920</span>
    </div>
    <audio ref={voiceRef} src={assetUrls.narration || undefined} preload="auto" />
    <audio ref={musicRef} src={assetUrls.music || undefined} preload="auto" loop />
    <div className="aura-trailer__workspace">
      <section className="aura-trailer__timeline">
        <div className="aura-trailer__section-title"><h2>Shot timeline</h2><button type="button" onClick={addShot}>+ Add shot</button></div>
        <label>Production title<input value={plan.name} onChange={e => updatePlan('name', e.target.value)} /></label>
        <label>Fight status<select value={plan.fightStatus} onChange={e => updatePlan('fightStatus', e.target.value)}>
          <option value="hypothetical">Hypothetical / dream fight — not announced</option>
          <option value="confirmed">Confirmed — independently verified</option>
          <option value="non_fight">Fighter profile / no fight promoted</option>
        </select></label>
        <div className="aura-trailer__shot-list">
          {plan.shots.map((s, i) => <div className={'aura-trailer__shot ' + (s.id === selected?.id ? 'is-selected' : '')} key={s.id}>
            <button type="button" className="aura-trailer__shot-select" onClick={() => setSelectedId(s.id)}>
              <span className="aura-trailer__shot-index">{String(i + 1).padStart(2, '0')}</span>
              <span><strong>{s.name}</strong><small>{TYPE_NAMES[s.kind] || s.kind} · {Number(s.seconds)}s</small></span>
              <span aria-label={s.approved && s.rightsVerified && s.fileName ? 'Ready for check' : 'Needs media/review'}>{s.approved && s.rightsVerified && s.fileName ? '●' : '○'}</span>
            </button>
            <button type="button" aria-label={'Move ' + s.name + ' earlier'} disabled={i === 0} onClick={() => move(i, -1)}>↑</button>
            <button type="button" aria-label={'Move ' + s.name + ' later'} disabled={i === plan.shots.length - 1} onClick={() => move(i, 1)}>↓</button>
          </div>)}
        </div>
        <label>Spoken voiceover script<textarea rows={5} value={plan.narration} onChange={e => updatePlan('narration', e.target.value)} placeholder="Natural, confident boxing commentary..." /></label>
        <label>Narration file (optional MP3/WAV)<input type="file" accept="audio/*" onChange={e => setMedia('narration', e, 'audio')} /></label>
        <label>Licensed soundtrack (optional)<input type="file" accept="audio/*" onChange={e => setMedia('music', e, 'audio')} /></label>
        {plan.musicFile && <><label>Music licence or permission reference<input value={plan.audioRights} onChange={e => updatePlan('audioRights', e.target.value)} placeholder="Licence ID / creator permission" /></label>
          <label className="aura-trailer__check"><input type="checkbox" checked={plan.musicRightsVerified} onChange={e => updatePlan('musicRightsVerified', e.target.checked)} />I verified that this soundtrack can be synchronised and posted commercially</label></>}
        <label>Optional vertical cover (real, cleared image preferred)<input type="file" accept="image/*" onChange={e => setMedia('cover', e, 'cover')} /></label>
        {plan.coverFile && <><label>Cover image source/licence reference<input value={plan.coverSource} onChange={e => updatePlan('coverSource', e.target.value)} placeholder="Photographer / licence / own work reference" /></label>
          <label className="aura-trailer__check"><input type="checkbox" checked={plan.coverRightsVerified} onChange={e => updatePlan('coverRightsVerified', e.target.checked)} />I verified the cover can be used commercially</label></>}
      </section>
      <section className="aura-trailer__editor">
        <div className="aura-trailer__section-title"><h2>Shot preview</h2><button type="button" onClick={isPlaying ? stopPreview : startPreview}>{isPlaying ? '■ Stop' : '▶ Play full storyboard'}</button></div>
        {selected && <><div className="aura-trailer__phone">
          {preview ? attached.file.type.startsWith('video/') ? <video key={preview} src={preview} controls={!isPlaying} autoPlay={isPlaying} muted playsInline /> : <img src={preview} alt={shownShot.name} /> : <div className="aura-trailer__empty"><span>NO VISUAL ATTACHED</span><strong>{shownShot.name}</strong><p>{shownShot.direction}</p></div>}
          {shownShot.kind === 'reveal' && shownShot.text && <div className="aura-trailer__phone-reveal"><strong>{shownShot.text}</strong>{plan.fightStatus === 'hypothetical' && <span>DREAM MATCHUP · NOT ANNOUNCED</span>}</div>}
          {shownShot.kind === 'ai_scene' && <span className="aura-trailer__phone-disclosure">Illustrative scene</span>}
        </div>
        {isPlaying && <p className="aura-trailer__play-status">Playing scene {playIndex + 1} of {plan.shots.length}: {shownShot.name}</p>}
        <div className="aura-trailer__fields">
          <label>Scene name<input value={selected.name} onChange={e => updateShot('name', e.target.value)} /></label>
          <div className="aura-trailer__duo"><label>Visual type<select value={selected.kind} onChange={e => {
            updateShot('kind', e.target.value);
            if (e.target.value === 'ai_scene') updateShot('aiDisclosure', true);
          }}>{VISUAL_TYPES.map(v => <option key={v} value={v}>{TYPE_NAMES[v]}</option>)}</select></label>
            <label>Length · seconds<input type="number" min="1" max="12" step=".5" value={selected.seconds} onChange={e => updateShot('seconds', Number(e.target.value))} /></label></div>
          <label>Director's direction<textarea rows={3} value={selected.direction} onChange={e => updateShot('direction', e.target.value)} /></label>
          {selected.kind === 'reveal' && <label>Reveal headline only<input maxLength={52} value={selected.text} onChange={e => updateShot('text', e.target.value)} /></label>}
          <label>Attach original / cleared media<input type="file" accept="image/*,video/*" onChange={e => setMedia(selected.id, e, 'visual')} /></label>
          <p className="aura-trailer__hint">{TIP}</p>
          <label>Where it came from / licence reference<input value={selected.sourceUrl} onChange={e => updateShot('sourceUrl', e.target.value)} placeholder="Source URL, agreement ID or original shoot reference" /></label>
          <label>Rights classification<select value={selected.rights} onChange={e => updateShot('rights', e.target.value)}>
            <option value="">Not yet verified</option>{RIGHTS_TYPES.map(v => <option key={v} value={v}>{RIGHTS_NAMES[v]}</option>)}
          </select></label>
          <label className="aura-trailer__check"><input type="checkbox" checked={selected.rightsVerified} onChange={e => updateShot('rightsVerified', e.target.checked)} />Media rights personally verified</label>
          {selected.kind === 'ai_scene' && <label className="aura-trailer__check"><input type="checkbox" checked={selected.aiDisclosure} onChange={e => updateShot('aiDisclosure', e.target.checked)} />Original cinematic illustration, not actual fight footage</label>}
          <label className="aura-trailer__check"><input type="checkbox" checked={selected.approved} onChange={e => updateShot('approved', e.target.checked)} />I've reviewed this exact shot for identity, accuracy and crop</label>
          <button type="button" className="aura-trailer__danger" onClick={deleteShot}>Remove selected scene</button>
        </div></>}
      </section>
      <aside className="aura-trailer__export">
        <h2>Export check</h2><p>Each item must have accurate provenance, reviewed rights, approved media and valid timing.</p>
        {renderErrors.length ? <div className="aura-trailer__issues"><strong>{renderErrors.length} items to resolve</strong><ul>{renderErrors.slice(0, 10).map((e, i) => <li key={i}>{e}</li>)}</ul>{renderErrors.length > 10 && <p>And {renderErrors.length - 10} more.</p>}</div> : <p className="aura-trailer__ready">All checks passed — ready to package.</p>}
        <button type="button" onClick={savePlan}>Download shot plan · JSON</button>
        <button type="button" className="aura-trailer__primary" disabled={Boolean(renderErrors.length) || busy} onClick={exportPack}>{busy ? 'Packaging…' : 'Export reviewed media pack · ZIP'}</button>
        <p className="aura-trailer__hint">The reviewed ZIP can be rendered to an MP4 with our local FFmpeg pipeline. Browser preview isn't the final export. Real footage and AI shots must be supplied as approved assets. Paid generation is intentionally disabled.</p>
        <p className="aura-trailer__hint">The final title automatically says DREAM MATCHUP when the bout is hypothetical.</p>
      </aside>
    </div>
    {notice && <p role="status" className="aura-trailer__notice">{notice}</p>}
  </main><Footer/></>;
}
