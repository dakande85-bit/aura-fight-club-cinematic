const WAITLIST_KEY = 'aura_waitlist_entries';

function readEntries() {
  if (typeof window === 'undefined') return [];
  try {
    const stored = window.localStorage.getItem(WAITLIST_KEY) || '[]';
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveEntries(entries) {
  window.localStorage.setItem(WAITLIST_KEY, JSON.stringify(entries));
  window.dispatchEvent(new CustomEvent('aura-waitlist-updated'));
}

function cleanEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function hasBasicEmailShape(value) {
  const email = cleanEmail(value);
  return email.includes('@') && email.includes('.') && email.length >= 6;
}

export function getWaitlistEntries() {
  return readEntries();
}

export function addWaitlistEntry({ email, source = 'unknown', product = '', notes = '' }) {
  const cleanedEmail = cleanEmail(email);
  const entries = readEntries();

  if (!hasBasicEmailShape(cleanedEmail)) {
    return { ok: false, reason: 'invalid-email', entries };
  }

  const now = new Date().toISOString();
  const existingIndex = entries.findIndex((entry) => entry.email === cleanedEmail);
  const previous = existingIndex >= 0 ? entries[existingIndex] : null;

  const nextEntry = {
    id: previous?.id || `wl_${Date.now()}`,
    email: cleanedEmail,
    source,
    product,
    notes,
    firstCapturedAt: previous?.firstCapturedAt || now,
    lastCapturedAt: now,
    captureCount: (previous?.captureCount || 0) + 1,
    status: 'local-captured',
  };

  const nextEntries = existingIndex >= 0
    ? entries.map((entry, index) => (index === existingIndex ? nextEntry : entry))
    : [nextEntry, ...entries];

  saveEntries(nextEntries);

  return {
    ok: true,
    duplicate: existingIndex >= 0,
    entry: nextEntry,
    entries: nextEntries,
  };
}

export function clearWaitlistEntries() {
  saveEntries([]);
}

export function exportWaitlistCsv() {
  const entries = readEntries();
  const headers = ['email', 'source', 'product', 'firstCapturedAt', 'lastCapturedAt', 'captureCount', 'status'];
  const rows = entries.map((entry) => [
    entry.email,
    entry.source || '',
    entry.product || '',
    entry.firstCapturedAt || '',
    entry.lastCapturedAt || '',
    String(entry.captureCount || 1),
    entry.status || '',
  ]);

  const table = [headers, ...rows];
  return table.map((row) => row.join(',')).join('\n');
}

export { WAITLIST_KEY };
