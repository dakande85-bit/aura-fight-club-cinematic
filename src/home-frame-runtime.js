const HOME_FRAME_STORAGE_KEY = 'aura:home-frame-overrides:v1';
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
].map(([scene, label, file]) => ({ scene, label, path: `${BASE}/${file}` }));

function isHomePath() {
  const path = window.location.pathname || '/';
  return path === '/' || path === '/launch' || path === '/cinematic';
}

function readSettings() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(HOME_FRAME_STORAGE_KEY) || '{}');
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

function toPath(value) {
  if (!value) return '';
  try { return new URL(value, window.location.origin).pathname; }
  catch { return String(value).split('?')[0]; }
}

function fallbackFor(path, settings) {
  const item = FRAME_CATALOG.find(frame => frame.path === path);
  const fallback = item && FRAME_CATALOG.find(frame => frame.scene === item.scene && frame.path !== path && !settings.removed.includes(frame.path));
  return fallback?.path || path;
}

function resolveFrame(path, settings) {
  const cleanPath = toPath(path);
  if (settings.replacements[cleanPath]) return settings.replacements[cleanPath];
  if (settings.removed.includes(cleanPath)) return fallbackFor(cleanPath, settings);
  return path;
}

function applyHomeFrameOverrides() {
  if (!isHomePath()) return;
  const settings = readSettings();

  if (settings.videoSrc) {
    document.querySelectorAll('.sf-video').forEach(video => {
      if (video.getAttribute('src') !== settings.videoSrc) {
        video.setAttribute('src', settings.videoSrc);
        video.load?.();
      }
    });
  }

  document.querySelectorAll('.sf-image').forEach(img => {
    const current = img.getAttribute('src') || img.currentSrc || '';
    const currentPath = toPath(current);
    const currentResolved = toPath(img.dataset.auraFrameResolved || '');
    let original = img.dataset.auraFrameOriginal || '';

    if (!original || currentPath !== currentResolved) {
      original = currentPath;
      img.dataset.auraFrameOriginal = original;
    }

    const next = resolveFrame(original, settings);
    if (next && next !== current) {
      img.dataset.auraFrameResolved = next;
      img.setAttribute('src', next);
    }
  });

  const hero = document.querySelector('.aura-home-mobile-hero-img');
  if (hero) {
    const defaultHero = `${BASE}/05_drop_001_tools_uniform/frame_09_cream_full_outfit_model.png`;
    const next = settings.mobileHero || settings.replacements[defaultHero] || '';
    if (next && hero.getAttribute('src') !== next) hero.setAttribute('src', next);
  }
}

if (typeof window !== 'undefined') {
  window.AURA_HOME_FRAME_STORAGE_KEY = HOME_FRAME_STORAGE_KEY;
  window.AURA_HOME_FRAME_CATALOG = FRAME_CATALOG;
  window.AURA_APPLY_HOME_FRAME_OVERRIDES = applyHomeFrameOverrides;
  window.addEventListener('DOMContentLoaded', applyHomeFrameOverrides);
  window.addEventListener('storage', applyHomeFrameOverrides);
  window.addEventListener('aura-home-frames-updated', applyHomeFrameOverrides);
  window.addEventListener('popstate', () => setTimeout(applyHomeFrameOverrides, 80));
  setInterval(applyHomeFrameOverrides, 350);
  new MutationObserver(applyHomeFrameOverrides).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['src'] });
}
