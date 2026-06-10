import { useMemo, useState } from 'react';

const pages = [
  {
    id: 'homepage',
    title: 'Homepage Scroll Film',
    slug: '/',
    status: 'live',
    description: 'Main cinematic landing page with intro video, shadow boxing, footwork, product reveal and Fight Club close.',
  },
  {
    id: 'campaign',
    title: 'Campaign Page',
    slug: '/campaign',
    status: 'live',
    description: 'Dedicated campaign sequence with jump rope, sparring, heavy bag, floor ball and manifesto close.',
  },
  {
    id: 'fight-club',
    title: 'Fight Club Page',
    slug: '/fight-club',
    status: 'planned',
    description: 'Future cinematic identity page for waitlist, community, membership and story sections.',
  },
];

const scenes = {
  homepage: [
    { id: 'hero', order: 1, type: 'video', label: 'AURA FIGHT CLUB', headline: 'YOUR AURA / IS EARNED.', media: 'intro video', device: 'desktop + mobile', status: 'needs mobile poster review' },
    { id: 'standard', order: 2, type: 'image_sequence', label: 'THE STANDARD', headline: 'THE REAL / FIGHT IS / INTERNAL.', media: 'shadow boxing frames', device: 'desktop + mobile', status: 'live' },
    { id: 'work', order: 3, type: 'image_sequence', label: 'THE WORK', headline: 'SILENCE / DISCIPLINE / PRESENCE.', media: 'handwrap frames', device: 'desktop + mobile', status: 'live' },
    { id: 'footwork', order: 4, type: 'image_sequence', label: 'FOOTWORK', headline: 'FOOTWORK / TIMING / CONTROL.', media: 'skipping frames', device: 'desktop + mobile', status: 'live' },
    { id: 'drop', order: 5, type: 'product_reveal', label: 'DROP 001', headline: 'TOOLS FOR THE WORK NOBODY SEES.', media: 'product/model frames', device: 'desktop + mobile', status: 'review visuals' },
  ],
  campaign: [
    { id: 'campaign-hero', order: 1, type: 'image_sequence', label: 'AURA FIGHT CLUB', headline: 'THE CAMPAIGN / EARNED WHERE NOBODY IS WATCHING.', media: 'jump rope hero frames', device: 'desktop + mobile', status: 'live' },
    { id: 'rhythm', order: 2, type: 'image_sequence', label: 'RHYTHM', headline: 'FOOTWORK / TIMING / CONTROL.', media: 'jump rope sequence', device: 'desktop + mobile', status: 'live' },
    { id: 'pressure', order: 3, type: 'image_sequence', label: 'PRESSURE', headline: 'NOT PANIC / PACE.', media: 'sparring sequence', device: 'desktop + mobile', status: 'needs frame review' },
    { id: 'repetition', order: 4, type: 'image_sequence', label: 'REPETITION', headline: 'POWER IS BUILT ONE ROUND AT A TIME.', media: 'heavy bag sequence', device: 'desktop + mobile', status: 'needs frame review' },
    { id: 'manifesto', order: 5, type: 'image_sequence', label: 'MANIFESTO', headline: 'YOUR AURA IS EARNED.', media: 'closing frames', device: 'desktop + mobile', status: 'live' },
  ],
  'fight-club': [
    { id: 'future-hero', order: 1, type: 'video_or_image_sequence', label: 'FIGHT CLUB', headline: 'MORE THAN A BRAND. A FIGHT IDENTITY.', media: 'to be uploaded', device: 'desktop + mobile', status: 'planned' },
  ],
};

const mediaItems = [
  { id: 'm1', page: 'Homepage', scene: 'Hero', name: 'Intro video', type: 'video', device: 'mobile/desktop', status: 'needs poster control', notes: 'Initial mobile load still needs cleaner backend-controlled poster/fallback.' },
  { id: 'm2', page: 'Homepage', scene: 'Footwork', name: 'Skipping frames', type: 'frames', device: 'mobile/desktop', status: 'approved', notes: 'Usable but should later be replaceable through upload.' },
  { id: 'm3', page: 'Campaign', scene: 'Sparring', name: 'Sparring sequence', type: 'frames', device: 'mobile/desktop', status: 'review', notes: 'Check gloves, hands, realism before long-term use.' },
  { id: 'm4', page: 'Campaign', scene: 'Heavy Bag', name: 'Heavy bag sequence', type: 'frames', device: 'mobile/desktop', status: 'review', notes: 'Reduce weak frames; publish only approved ones.' },
  { id: 'm5', page: 'Future', scene: 'Fight Club', name: 'Membership hero', type: 'video/frames', device: 'mobile/desktop', status: 'needed', notes: 'Upload later once final creative direction is chosen.' },
];

const statusTone = {
  live: 'good',
  approved: 'good',
  planned: 'neutral',
  review: 'warn',
  needed: 'warn',
  'needs mobile poster review': 'warn',
  'review visuals': 'warn',
  'needs frame review': 'warn',
  'needs poster control': 'warn',
};

function Badge({ children }) {
  const tone = statusTone[children] || 'neutral';
  return <span className={`cinema-badge cinema-badge--${tone}`}>{children}</span>;
}

export default function CinematicAdmin() {
  const [selectedPageId, setSelectedPageId] = useState('homepage');
  const selectedPage = pages.find(page => page.id === selectedPageId) || pages[0];
  const selectedScenes = scenes[selectedPageId] || [];

  const configPreview = useMemo(() => ({
    page: selectedPage.id,
    slug: selectedPage.slug,
    scenes: selectedScenes.map(scene => ({
      id: scene.id,
      order: scene.order,
      type: scene.type,
      label: scene.label,
      headline: scene.headline.split(' / '),
      media: scene.media,
      deviceTargets: scene.device,
      status: scene.status,
    })),
  }), [selectedPage, selectedScenes]);

  return (
    <main className="cinema-admin">
      <section className="cinema-hero">
        <div>
          <p className="cinema-kicker">AURA ADMIN</p>
          <h1>AURA Scene Builder</h1>
          <p>
            Control cinematic pages, scroll-film scenes, videos, frame sequences, posters, text, CTAs and future mobile/desktop swaps from one structured system.
          </p>
        </div>
        <div className="cinema-hero-card">
          <span>Phase 1</span>
          <strong>Structure scaffold</strong>
          <small>Mock data now. Supabase connection later.</small>
        </div>
      </section>

      <section className="cinema-grid cinema-grid--pages">
        {pages.map(page => (
          <button
            key={page.id}
            className={`cinema-page-card${page.id === selectedPageId ? ' cinema-page-card--active' : ''}`}
            onClick={() => setSelectedPageId(page.id)}
            type="button"
          >
            <span>{page.slug}</span>
            <strong>{page.title}</strong>
            <p>{page.description}</p>
            <Badge>{page.status}</Badge>
          </button>
        ))}
      </section>

      <section className="cinema-panel">
        <div className="cinema-panel-head">
          <div>
            <p className="cinema-kicker">Selected page</p>
            <h2>{selectedPage.title}</h2>
          </div>
          <div className="cinema-actions">
            <button type="button">Save draft</button>
            <button type="button" className="cinema-primary">Publish config</button>
          </div>
        </div>

        <div className="cinema-scenes">
          {selectedScenes.map(scene => (
            <article key={scene.id} className="cinema-scene-row">
              <div className="cinema-order">{String(scene.order).padStart(2, '0')}</div>
              <div>
                <p>{scene.label}</p>
                <h3>{scene.headline}</h3>
                <small>{scene.type} · {scene.media}</small>
              </div>
              <div className="cinema-scene-meta">
                <span>{scene.device}</span>
                <Badge>{scene.status}</Badge>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="cinema-two-col">
        <div className="cinema-panel">
          <div className="cinema-panel-head">
            <div>
              <p className="cinema-kicker">Media review</p>
              <h2>Frames, videos and posters</h2>
            </div>
          </div>
          <div className="cinema-media-list">
            {mediaItems.map(item => (
              <article key={item.id} className="cinema-media-row">
                <div>
                  <strong>{item.name}</strong>
                  <span>{item.page} · {item.scene} · {item.type}</span>
                  <p>{item.notes}</p>
                </div>
                <Badge>{item.status}</Badge>
              </article>
            ))}
          </div>
        </div>

        <div className="cinema-panel cinema-config-panel">
          <div className="cinema-panel-head">
            <div>
              <p className="cinema-kicker">Config preview</p>
              <h2>Generated scene JSON</h2>
            </div>
          </div>
          <pre>{JSON.stringify(configPreview, null, 2)}</pre>
        </div>
      </section>
    </main>
  );
}
