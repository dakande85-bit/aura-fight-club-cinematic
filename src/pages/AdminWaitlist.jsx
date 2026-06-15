import { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { clearWaitlistEntries, exportWaitlistCsv, getWaitlistEntries } from '../lib/waitlistStore.js';
import '../styles/admin-waitlist.css';

function downloadTextFile(content, fileName, type = 'text/csv') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export default function AdminWaitlist() {
  const [entries, setEntries] = useState(() => getWaitlistEntries());

  useEffect(() => {
    const refresh = () => setEntries(getWaitlistEntries());
    window.addEventListener('storage', refresh);
    window.addEventListener('aura-waitlist-updated', refresh);
    refresh();
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('aura-waitlist-updated', refresh);
    };
  }, []);

  const stats = useMemo(() => {
    const sources = new Set(entries.map((entry) => entry.source).filter(Boolean));
    const latest = entries[0]?.lastCapturedAt || null;
    return { total: entries.length, sources: sources.size, latest };
  }, [entries]);

  function exportCsv() {
    const csv = exportWaitlistCsv();
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    downloadTextFile(csv, `aura-waitlist-${stamp}.csv`);
  }

  function clearEntries() {
    clearWaitlistEntries();
    setEntries([]);
  }

  return (
    <div className="awl-page">
      <Header />
      <main className="awl-shell">
        <section className="awl-hero">
          <p className="awl-kicker">AURA Admin</p>
          <h1>Waitlist control</h1>
          <p>This is a temporary local waitlist control page for launch testing. Entries captured here are browser-local until we connect the final backend.</p>
          <div className="awl-actions">
            <a href="/">Landing page</a>
            <a href="/fight-club">Fight Club</a>
            <button type="button" onClick={exportCsv} disabled={!entries.length}>Export CSV</button>
            <button type="button" onClick={clearEntries} disabled={!entries.length}>Clear local entries</button>
          </div>
        </section>

        <section className="awl-stats" aria-label="Waitlist stats">
          <div><strong>{stats.total}</strong><span>Local entries</span></div>
          <div><strong>{stats.sources}</strong><span>Capture sources</span></div>
          <div><strong>{stats.latest ? new Date(stats.latest).toLocaleDateString() : '—'}</strong><span>Latest capture</span></div>
        </section>

        <section className="awl-panel">
          <div className="awl-panel__head">
            <div>
              <p className="awl-kicker">Captured entries</p>
              <h2>Local browser list</h2>
            </div>
            <p>Production requirement: replace this with Klaviyo, Mailchimp, Supabase, or another backend before launch traffic.</p>
          </div>

          {entries.length === 0 ? (
            <div className="awl-empty">No local waitlist entries captured in this browser yet.</div>
          ) : (
            <div className="awl-table-wrap">
              <table className="awl-table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Source</th>
                    <th>Product</th>
                    <th>Captures</th>
                    <th>Last captured</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry.id}>
                      <td>{entry.email}</td>
                      <td>{entry.source || '—'}</td>
                      <td>{entry.product || '—'}</td>
                      <td>{entry.captureCount || 1}</td>
                      <td>{entry.lastCapturedAt ? new Date(entry.lastCapturedAt).toLocaleString() : '—'}</td>
                      <td>{entry.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
