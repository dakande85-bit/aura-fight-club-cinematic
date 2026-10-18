/**
 * Footage reference helpers. Public YouTube URLs are embeddable research references,
 * NOT downloadable bytes. Only uploaded or CORS-authorised direct media can be rendered.
 */
const VIDEO_ID = /^[\w-]{11}$/;
const DIRECT_VIDEO = /\.(mp4|mov|m4v|webm)(?:$|\?)/i;
export function parseTime(value) {
  const input = String(value ?? '').trim().toLowerCase();
  if (!input) return 0;
  if (/^\d+(?:\.\d+)?$/.test(input)) return Math.max(0, Number(input));
  if (/^\d{1,2}:\d{2}(?::\d{2}(?:\.\d+)?)?$/.test(input)) {
    return input.split(':').reduce((total, p) => total * 60 + Number(p), 0);
  }
  if (/^(?:(?:\d+)h)?(?:(?:\d+)m)?(?:(?:\d+(?:\.\d+)?)s)?$/.test(input) && /\d/.test(input)) {
    const match = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+(?:\.\d+)?)s)?$/.exec(input);
    return Number(match[1] || 0) * 3600 + Number(match[2] || 0) * 60 + Number(match[3] || 0);
  }
  return null;
}
export function parseFootageUrl(value) {
  let url;
  try { url = new URL(String(value || '').trim()); } catch { return { kind: 'invalid', error: 'Paste a full HTTPS video link.' }; }
  if (url.protocol !== 'https:') return { kind: 'invalid', error: 'Only HTTPS video links are accepted.' };
  const host = url.hostname.toLowerCase();
  const yt = host === 'youtube.com' || host === 'www.youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com';
  const short = host === 'youtu.be' || host === 'www.youtu.be';
  if (yt || short) {
    let id = '';
    if (short) id = url.pathname.split('/')[1] || '';
    else if (url.pathname === '/watch') id = url.searchParams.get('v') || '';
    else if (/^\/(shorts|live|embed)\//.test(url.pathname)) id = url.pathname.split('/')[2] || '';
    if (!VIDEO_ID.test(id)) return { kind: 'invalid', error: 'That YouTube URL does not contain a valid video ID.' };
    const start = parseTime(url.searchParams.get('t') || url.searchParams.get('start') || '0');
    return { kind: 'youtube', videoId: id, url: 'https://www.youtube.com/watch?v=' + id, start: start === null ? 0 : start };
  }
  if (DIRECT_VIDEO.test(url.pathname)) {
    return { kind: 'direct', url: url.toString(), start: 0 };
  }
  return { kind: 'invalid', error: 'Use a YouTube link or a direct HTTPS MP4, MOV, M4V or WebM file URL.' };
}
export function youtubeEmbedLink(videoId, start = 0, end = 0) {
  if (!VIDEO_ID.test(String(videoId || ''))) return '';
  const begin = Math.max(0, Math.floor(Number(start) || 0));
  const finish = Math.floor(Number(end) || 0);
  const params = new URLSearchParams({ start: String(begin), rel: '0' });
  if (finish > begin) params.set('end', String(finish)); // YouTube end is absolute video time.
  return 'https://www.youtube-nocookie.com/embed/' + videoId + '?' + params;
}
export function validFootageRange(start, end) {
  const a = Number(start), b = Number(end);
  return Number.isFinite(a) && Number.isFinite(b) && a >= 0 && b > a && b - a <= 180;
}
