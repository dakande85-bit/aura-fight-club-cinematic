// AURA cinematic trailer plans. No footage is fetched, generated or published automatically.
export const TRAILER_VERSION = 1;
export const TRAILER_FORMAT = Object.freeze({ width: 1080, height: 1920, fps: 24, aspectRatio: '9:16' });
export const VISUAL_TYPES = Object.freeze(['licensed_clip', 'real_photo', 'ai_scene', 'reveal']);
export const RIGHTS_TYPES = Object.freeze(['self_owned', 'licensed', 'written_permission', 'original_ai']);
const clean = value => String(value || '').trim();
const shot = (id, name, kind, seconds, instruction, text = '') => ({
  id, name, kind, seconds, direction: instruction, text, fileName: '',
  sourceUrl: '', rights: '', rightsVerified: false, approved: false, aiDisclosure: kind === 'ai_scene'
});
export function makeTrailerPlan(preset = 'fundora') {
  const base = {
    version: TRAILER_VERSION,
    format: { ...TRAILER_FORMAT },
    id: 'aura-' + preset,
    name: '',
    fightStatus: 'hypothetical',
    editorialNote: 'Storyboards are creative concepts, not evidence or confirmed fight announcements.',
    narration: '',
    soundtrack: '',
    narrationFile: '',
    musicFile: '',
    audioRights: '',
    musicRightsVerified: false,
    coverFile: '', coverSource: '', coverRightsVerified: false,
    shots: []
  };
  if (preset === 'commentary') return {
    ...base, id: 'aura-commentary', name: 'Boxing Breakdown — narrator-led',
    shots: [
      shot('intro','Hook','real_photo',5,'Actual fighter photo, clean portrait. No screen-filling captions.'),
      shot('evidence','What changed','licensed_clip',12,'Permitted ringside footage illustrating the precise technical point.'),
      shot('analysis','Tactical evidence','licensed_clip',12,'Show jab, entries and reactions; no invented exchanges.'),
      shot('matchup','Potential opponent','real_photo',10,'Approved photo of the opponent; show the contrast.'),
      shot('question','Closing question','reveal',6,'Single editorial closing image with minimal headline.','WHO SOLVES THE JAB?')
    ]
  };
  return {
    ...base, name: 'The Towering Inferno — Fundora × Boots',
    narration: 'Six foot six, at 154 pounds. Sebastian Fundora is one of boxing’s strangest problems. The jab has changed everything. And if Boots Ennis gets his chance, how does he get past it?',
    shots: [
      shot('hook','The impossible frame','real_photo',3,'Licensed Fundora face-off photo showing his height advantage.'),
      shot('shadow','The silhouette','ai_scene',3,'Original generic towering silhouette, no fabricated actual bout footage.'),
      shot('jab','The jab','licensed_clip',4,'Licensed real Fundora jab footage, not a synthetic punch.'),
      shot('evolution','The improvement','licensed_clip',4,'Authentic technical examples; use only footage that supports narration.'),
      shot('boots','The challenger','real_photo',4,'Licensed Boots Ennis portrait or face-off footage.'),
      shot('reveal','Dream matchup','reveal',6,'Strong approved split fighter cover. Make the hypothetical status explicit.','FUNDORA × ENNIS')
    ]
  };
}
export function totalDuration(plan) {
  return Number((plan?.shots || []).reduce((sum, s) => sum + Number(s.seconds || 0), 0).toFixed(2));
}
export function safeAssetName(fileName) {
  return clean(fileName).split(/[\\/]/).at(-1).replace(/[^a-z0-9._-]/gi, '_').replace(/^\.+/, '').slice(0, 110);
}
export function checkTrailerPlan(plan, availableFiles = new Set()) {
  const errors = [];
  const files = availableFiles instanceof Set ? availableFiles : new Set(availableFiles || []);
  if (!plan || !Array.isArray(plan.shots) || !plan.shots.length) return ['Add at least one scene.'];
  if (!['hypothetical', 'confirmed', 'non_fight'].includes(plan.fightStatus)) errors.push('Set an accurate fight status.');
  if (plan.shots.length > 20) errors.push('Trailers can include at most 20 scenes.');
  if (totalDuration(plan) > 90) errors.push('Duration exceeds the 90-second studio limit.');
  const ids = new Set();
  plan.shots.forEach((s, index) => {
    const label = 'Scene ' + (index + 1) + ' (' + clean(s.name || s.id) + ')';
    if (!VISUAL_TYPES.includes(s.kind)) errors.push(label + ': unsupported visual type.');
    if (!Number.isFinite(Number(s.seconds)) || Number(s.seconds) < 1 || Number(s.seconds) > 12) errors.push(label + ': duration must be 1–12 seconds.');
    if (!clean(s.id) || ids.has(s.id)) errors.push(label + ': duplicate or missing scene ID.');
    ids.add(s.id);
    if (!s.fileName || !files.has(s.fileName)) errors.push(label + ': attach the approved image/video file.');
    if (!RIGHTS_TYPES.includes(s.rights) || !s.rightsVerified) errors.push(label + ': verify permission or original ownership.');
    if (s.kind !== 'ai_scene' && !clean(s.sourceUrl)) errors.push(label + ': record the media source/licence reference.');
    if (s.kind === 'ai_scene' && (s.rights !== 'original_ai' || !s.aiDisclosure)) errors.push(label + ': label original AI visuals as illustrative.');
    if (!s.approved) errors.push(label + ': review visual accuracy before export.');
  });
  if (plan.musicFile && !files.has(plan.musicFile)) errors.push('Music file is missing.');
  if (plan.narrationFile && !files.has(plan.narrationFile)) errors.push('Narration file is missing.');
  if (plan.musicFile && (!clean(plan.audioRights) || !plan.musicRightsVerified)) errors.push('Verify music and sync rights before rendering.');
  if (plan.coverFile && (!files.has(plan.coverFile) || !plan.coverRightsVerified || !clean(plan.coverSource))) errors.push('Verify cover provenance, rights and attached file.');
  return errors;
}
export function exportManifest(plan) {
  return {
    schema: 'aura-cinematic-trailer-v1',
    version: TRAILER_VERSION,
    title: clean(plan.name),
    fight_status: plan.fightStatus,
    duration_seconds: totalDuration(plan),
    format: { ...TRAILER_FORMAT },
    narration: clean(plan.narration),
    narration_file: plan.narrationFile || '',
    music_file: plan.musicFile || '',
    music_rights_reference: clean(plan.audioRights),
    music_rights_verified: Boolean(plan.musicRightsVerified),
    cover_file: plan.coverFile || '',
    cover_source_reference: clean(plan.coverSource),
    cover_rights_verified: Boolean(plan.coverRightsVerified),
    publication_status: 'DRAFT_NOT_PUBLISHED',
    shots: (plan.shots || []).map(s => ({
      id: clean(s.id), name: clean(s.name), kind: s.kind, duration: Number(s.seconds),
      direction: clean(s.direction), overlay_text: clean(s.text),
      file: s.fileName || '', rights: s.rights, source_reference: clean(s.sourceUrl),
      rights_verified: Boolean(s.rightsVerified), approved: Boolean(s.approved),
      ai_illustration: Boolean(s.aiDisclosure)
    }))
  };
}
