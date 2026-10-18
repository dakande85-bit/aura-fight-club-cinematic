import { useEffect, useMemo, useState } from 'react';
import { parseFootageUrl, validFootageRange, youtubeEmbedLink } from '../lib/footageLinks.js';

/** Reference source videos first. Actual exported video bytes come only from attached source media. */
export default function FootageLinkPanel({ shot, onChange, onImported }) {
  const [entry, setEntry] = useState(shot.referenceUrl || '');
  const [error, setError] = useState('');
  const [importing, setImporting] = useState(false);
  useEffect(() => { setEntry(shot.referenceUrl || ''); setError(''); }, [shot.id, shot.referenceUrl]);
  const reference = useMemo(() => shot.referenceUrl ? parseFootageUrl(shot.referenceUrl) : null, [shot.referenceUrl]);
  function attach() {
    const parsed = parseFootageUrl(entry);
    if (parsed.kind === 'invalid') { setError(parsed.error); return; }
    const start = Number(parsed.start || 0);
    onChange({
      referenceUrl: parsed.url,
      referenceStartSeconds: start,
      referenceEndSeconds: start + Math.max(1, Number(shot.seconds || 4)),
      trimStartSeconds: start,
      sourceUrl: shot.sourceUrl || parsed.url
    });
    setError('');
  }
  async function importDirect() {
    if (reference?.kind !== 'direct') return;
    setImporting(true); setError('');
    try {
      const response = await fetch(reference.url, { mode: 'cors', credentials: 'omit' });
      if (!response.ok) throw Error('Source host responded with HTTP ' + response.status);
      if (Number(response.headers.get('content-length') || 0) > 200 * 1024 * 1024) throw Error('Video is larger than 200 MB.');
      const blob = await response.blob();
      if (!blob.size || blob.size > 200 * 1024 * 1024) throw Error('Video is empty or larger than 200 MB.');
      const ext = new URL(reference.url).pathname.split('.').pop().toLowerCase();
      const mime = blob.type || (ext === 'webm' ? 'video/webm' : 'video/mp4');
      const file = new File([blob], 'remote-footage.' + ext, { type: mime });
      onImported(file, reference.url);
    } catch (e) {
      setError('Could not import that source file: ' + e.message + '. The file host may block browser downloads. You can still attach a local copy you are authorised to use.');
    } finally { setImporting(false); }
  }
  const start = Number(shot.referenceStartSeconds || 0);
  const end = Number(shot.referenceEndSeconds || 0);
  return <div className="aura-trailer__footage-link">
    <h3>Find footage by URL</h3>
    <p>Paste a YouTube video or direct MP4 link. You can choose and preview your section immediately, with no upload, API key or generation credits.</p>
    <label>Video link<input type="url" value={entry} placeholder="https://www.youtube.com/watch?v=…" onChange={e => setEntry(e.target.value)} /></label>
    <button type="button" onClick={attach}>Preview video link</button>
    {error && <p role="alert" className="aura-trailer__link-error">{error}</p>}
    {reference && reference.kind !== 'invalid' && <>
      <div className="aura-trailer__duo">
        <label>Start at (seconds)<input type="number" min="0" max="36000" step=".5" value={start}
          onChange={e => onChange({ referenceStartSeconds: Math.max(0, Number(e.target.value)), trimStartSeconds: Math.max(0, Number(e.target.value)) })} /></label>
        <label>End at (seconds)<input type="number" min="0" max="36000" step=".5" value={end}
          onChange={e => onChange({ referenceEndSeconds: Math.max(0, Number(e.target.value)) })} /></label>
      </div>
      {!validFootageRange(start, end) && <p role="alert">The end must be after the start; select up to 180 seconds.</p>}
      {reference.kind === 'youtube' ? <>
        <div className="aura-trailer__youtube"><iframe key={reference.videoId + '/' + start + '/' + end}
          title={'YouTube footage: ' + shot.name} src={youtubeEmbedLink(reference.videoId, start, end)} allowFullScreen
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" /></div>
        <p className="aura-trailer__hint">This is the official YouTube player. It previews the section; it does not supply an MP4 to the renderer. Attach a reusable source file separately to export the clip.</p>
      </> : <>
        <video key={reference.url + '/' + start} className="aura-trailer__direct-preview" controls playsInline preload="metadata" src={reference.url + '#t=' + start + ',' + end} />
        <button type="button" onClick={importDirect} disabled={importing}>{importing ? 'Importing…' : 'Import directly from this approved media URL'}</button>
        <p className="aura-trailer__hint">Direct HTTPS media must allow CORS to import. You can also upload the file yourself.</p>
      </>}
      <a href={reference.url} target="_blank" rel="noopener noreferrer">Open the original video ↗</a>
    </>}
  </div>;
}
