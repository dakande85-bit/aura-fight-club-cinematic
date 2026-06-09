import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/admin.css';

const SLOT_LABELS = [
  'Main product image',
  'Secondary angle',
  'Detail shot',
  'Hover / model image',
  'Lifestyle 1',
  'Lifestyle 2',
  'Extra / campaign / in-use',
];

const SEED = {
  'aura-cream-fight-boots': {
    name: 'AURA Cream Fight Boots', category: 'Footwear',
    notes: 'Cream boots confirmed live. gallery-02 and gallery-03 are dark-studio shots but boots are cream.',
    slots: [
      { img: '/assets/products/aura-cream-fight-boots/card-product.webp',    note: 'Clean product shot' },
      { img: '/assets/products/aura-cream-fight-boots/gallery-02.webp',      note: 'High top detail' },
      { img: '/assets/products/aura-cream-fight-boots/gallery-03.webp',      note: 'Studio angle' },
      { img: '/assets/products/aura-cream-fight-boots/card-hover-model.webp',note: 'Model wearing full outfit' },
      { img: '/assets/products/aura-cream-fight-boots/gallery-04.webp',      note: '' },
      { img: '/assets/products/aura-cream-fight-boots/gallery-05.webp',      note: '' },
      { img: null, note: '' },
    ],
    candidates: [
      { id: 'b1', src: '/assets/products/aura-cream-fight-boots/gallery-01.webp', name: 'boots-product-alt', status: 'keep' },
    ],
  },
  'aura-cream-boxing-gloves': {
    name: 'AURA Cream Boxing Gloves', category: 'Equipment',
    notes: 'Cream gloves confirmed. Mitts shots show cream gloves in use.',
    slots: [
      { img: '/assets/products/aura-cream-boxing-gloves/card-product.webp',    note: 'Main cream gloves' },
      { img: '/assets/products/aura-cream-boxing-gloves/gallery-02.webp',      note: 'Closeup detail' },
      { img: '/assets/products/aura-cream-boxing-gloves/gallery-05.webp',      note: 'Product alt' },
      { img: '/assets/products/aura-cream-boxing-gloves/card-hover-model.webp',note: 'In use on pads (hover)' },
      { img: '/assets/products/aura-cream-boxing-gloves/gallery-03.webp',      note: 'Pad work 1' },
      { img: '/assets/products/aura-cream-boxing-gloves/gallery-04.webp',      note: 'Pad work 2' },
      { img: null, note: '' },
    ],
    candidates: [
      { id: 'g1', src: '/assets/products/aura-cream-boxing-gloves/gallery-01.webp', name: 'gloves-main-alt', status: 'keep' },
    ],
  },
  'aura-sleeveless-hoodie': {
    name: 'AURA Black Sleeveless Hoodie', category: 'Apparel',
    notes: 'Renamed to Black — all images confirmed black colourway. gallery-04 removed (wrong outfit).',
    slots: [
      { img: '/assets/products/aura-sleeveless-hoodie/card-product.webp',    note: 'Black hoodie product' },
      { img: '/assets/products/aura-sleeveless-hoodie/gallery-03.webp',      note: 'Dark studio angle' },
      { img: null, note: '' },
      { img: '/assets/products/aura-sleeveless-hoodie/card-hover-model.webp',note: 'Model wearing (hover)' },
      { img: '/assets/products/aura-sleeveless-hoodie/gallery-02.webp',      note: 'Model front' },
      { img: '/assets/products/aura-sleeveless-hoodie/gallery-05.webp',      note: 'Back detail' },
      { img: null, note: '' },
    ],
    candidates: [
      { id: 'h1', src: '/assets/products/aura-sleeveless-hoodie/gallery-01.webp', name: 'hoodie-product-alt', status: 'keep' },
      { id: 'h2', src: '/assets/products/aura-sleeveless-hoodie/gallery-04.webp', name: 'campaign-fighter (WRONG OUTFIT)', status: 'rejected' },
    ],
  },
  'aura-sauna-suit': {
    name: 'AURA Sauna Suit', category: 'Apparel',
    notes: 'No confirmed sauna suit images. Needs dedicated product + model shoot.',
    slots: Array(7).fill(null).map(() => ({ img: null, note: '' })),
    candidates: [],
  },
  'aura-black-fight-club-tee': {
    name: 'AURA Black Fight Club Tee', category: 'Apparel',
    notes: 'Only 2 unconfirmed images. No hover model shot. Needs front/back/model shoot.',
    slots: Array(7).fill(null).map(() => ({ img: null, note: '' })),
    candidates: [],
  },
};

const STORAGE_KEY = 'aura-asset-manager-v1';

function countFilled(slots) {
  return slots.filter(s => s && s.img).length;
}
function getStatus(slots) {
  const c = countFilled(slots);
  if (c === 7) return 'complete';
  if (c === 0) return 'missing';
  return 'progress';
}
function isCoverImg(src) {
  if (!src) return false;
  return ['model','campaign','mitts','fighter','uniform','outfit','hover'].some(k => src.toLowerCase().includes(k));
}
function defaultBrief(product, slotIdx) {
  const briefs = [
    `Product photography: ${product.name}. Clean dark studio background. Full product visible, centred. No props. Professional product shot. Premium boxing lifestyle aesthetic.`,
    `Secondary angle: ${product.name}. Different angle — side, three-quarter, or back. Clean studio. Sharp detail. Dark premium feel.`,
    `Detail/macro shot: ${product.name}. Focus on the most distinctive design detail — logo, material texture, construction. Shallow depth of field. Premium quality.`,
    `Model lifestyle: Person wearing/using ${product.name}. Dark boxing gym, atmospheric. Product clearly visible in natural use. AURA Fight Club cinematic aesthetic.`,
    `Lifestyle 1: ${product.name} in training context. Dark gym, ring ropes, atmospheric light. Editorial boxing lifestyle. No text overlays.`,
    `Lifestyle 2: ${product.name} — different lifestyle moment. Pre-training, warm-up, or ringside. Premium boxing culture.`,
    `Campaign/in-use: ${product.name} in action or campaign context. Training sequence or editorial frame. AURA Fight Club identity — earned, disciplined, cinematic.`,
  ];
  return briefs[slotIdx] || `Image brief for ${product.name} — ${SLOT_LABELS[slotIdx]}`;
}

export default function AdminAssetManager() {
  const navigate = useNavigate();
  const [state, setState]           = useState(null);
  const [activeSlug, setActiveSlug] = useState(null);
  const [activeTab, setActiveTab]   = useState('slots');
  const [promptSlot, setPromptSlot] = useState(0);
  const [promptText, setPromptText] = useState('');
  const [promptLoading, setPromptLoading] = useState(false);
  const [assigningSlot, setAssigningSlot] = useState(null);
  const [assignUrl, setAssignUrl]   = useState('');
  const assignInputRef = useRef(null);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge — add any new seed products
        const merged = { ...JSON.parse(JSON.stringify(SEED)) };
        for (const slug in parsed) {
          if (merged[slug]) merged[slug] = parsed[slug];
        }
        setState(merged);
        setActiveSlug(Object.keys(merged)[0]);
      } else {
        const initial = JSON.parse(JSON.stringify(SEED));
        setState(initial);
        setActiveSlug(Object.keys(initial)[0]);
      }
    } catch {
      const initial = JSON.parse(JSON.stringify(SEED));
      setState(initial);
      setActiveSlug(Object.keys(initial)[0]);
    }
  }, []);

  const save = (newState) => {
    setState(newState);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(newState)); } catch {}
  };

  const update = (updater) => {
    setState(prev => {
      const next = { ...prev };
      next[activeSlug] = { ...next[activeSlug] };
      updater(next);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  useEffect(() => {
    if (activeSlug && state) {
      setPromptText(defaultBrief(state[activeSlug], promptSlot));
    }
  }, [promptSlot, activeSlug]);

  if (!state || !activeSlug) {
    return <div className="adm-loading">Loading...</div>;
  }

  const product = state[activeSlug];
  const slots   = product.slots;
  const filled  = countFilled(slots);
  const status  = getStatus(slots);

  const handleGenerateBrief = async () => {
    setPromptLoading(true);
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 300,
          messages: [{
            role: 'user',
            content: `Write a precise image brief for: ${product.name}, Slot ${promptSlot+1} — ${SLOT_LABELS[promptSlot]}. Brand: AURA Fight Club — cinematic, dark, premium boxing lifestyle. Under 100 words. No preamble.`
          }]
        })
      });
      const data = await res.json();
      setPromptText(data.content?.[0]?.text || defaultBrief(product, promptSlot));
    } catch {
      setPromptText(defaultBrief(product, promptSlot));
    }
    setPromptLoading(false);
  };

  const doAssign = (slotIdx, url) => {
    if (!url?.trim()) return;
    update(s => {
      s[activeSlug].slots[slotIdx] = { img: url.trim(), note: s[activeSlug].slots[slotIdx]?.note || '' };
    });
    setAssigningSlot(null);
    setAssignUrl('');
  };

  const assignCandToSlot = (candIdx, slotIdx) => {
    const src = product.candidates[candIdx]?.src;
    if (!src) return;
    update(s => {
      s[activeSlug].slots[slotIdx] = { img: src, note: s[activeSlug].candidates[candIdx]?.name || '' };
      s[activeSlug].candidates[candIdx].status = 'approved';
    });
  };

  return (
    <div className="adm">
      {/* SIDEBAR */}
      <aside className="adm-sidebar">
        <div className="adm-sidebar-head">
          <div className="adm-logo">AURA</div>
          <div className="adm-logo-sub">Asset Manager</div>
          <button className="adm-back-btn" onClick={() => navigate('/')}>← Site</button>
        </div>
        <nav className="adm-product-list">
          {Object.entries(state).map(([slug, p]) => {
            const c = countFilled(p.slots);
            const st = getStatus(p.slots);
            return (
              <button
                key={slug}
                className={`adm-product-item${slug === activeSlug ? ' active' : ''}`}
                onClick={() => { setActiveSlug(slug); setActiveTab('slots'); setAssigningSlot(null); }}
              >
                <div className="adm-pi-name">{p.name}</div>
                <div className={`adm-pi-status adm-pi-status--${st}`}>
                  {st === 'complete' ? '✓ COMPLETE 7/7' : st === 'missing' ? '⚠ MISSING ASSETS' : `IN PROGRESS ${c}/7`}
                </div>
                <div className="adm-pi-cat">{p.category}</div>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* MAIN */}
      <div className="adm-main">
        {/* Header */}
        <header className="adm-header">
          <div>
            <h1 className="adm-title">{product.name}</h1>
            <div className="adm-header-meta">
              <span className={`adm-badge adm-badge--${status}`}>
                {status === 'complete' ? '✓ Complete 7/7' : status === 'missing' ? '⚠ Missing Assets' : `In Progress ${filled}/7`}
              </span>
              <span className="adm-cat-label">{product.category} · Drop 001</span>
            </div>
          </div>
          <div className="adm-tabs">
            {['slots','candidates','briefs'].map(t => (
              <button key={t} className={`adm-tab${activeTab===t?' active':''}`}
                onClick={() => { setActiveTab(t); setAssigningSlot(null); }}>
                {t === 'slots' ? `Slots (7)` : t === 'candidates' ? `Candidates (${product.candidates.length})` : 'Briefs'}
              </button>
            ))}
          </div>
        </header>

        {/* Body */}
        <div className="adm-body">

          {/* ── SLOTS TAB ── */}
          {activeTab === 'slots' && (
            <div>
              <div className="adm-section-head">{filled}/7 slots filled</div>

              {/* Assign modal overlay */}
              {assigningSlot !== null && (
                <div className="adm-assign-modal">
                  <div className="adm-assign-inner">
                    <div className="adm-assign-title">Assign to Slot {assigningSlot+1}: {SLOT_LABELS[assigningSlot]}</div>
                    <div className="adm-assign-row">
                      <input
                        ref={assignInputRef}
                        className="adm-input"
                        type="text"
                        placeholder="/assets/products/... or full URL"
                        value={assignUrl}
                        onChange={e => setAssignUrl(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && doAssign(assigningSlot, assignUrl)}
                        autoFocus
                      />
                      <button className="adm-btn adm-btn--gold" onClick={() => doAssign(assigningSlot, assignUrl)}>Assign</button>
                      <button className="adm-btn" onClick={() => { setAssigningSlot(null); setAssignUrl(''); }}>Cancel</button>
                    </div>
                    {product.candidates.filter(c => c.status !== 'rejected').length > 0 && (
                      <div>
                        <div className="adm-assign-sub">Or pick from candidates:</div>
                        <div className="adm-cand-pick-list">
                          {product.candidates.filter(c => c.status !== 'rejected').map((c, ci) => (
                            <div key={c.id} className="adm-cand-pick" onClick={() => doAssign(assigningSlot, c.src)}>
                              <img src={c.src} alt="" onError={e => e.target.style.opacity = 0.3} />
                              <span>{c.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="adm-slots-grid">
                {slots.map((slot, i) => (
                  <div key={i} className={`adm-slot${slot.img ? ' adm-slot--filled' : ' adm-slot--empty'}`}>
                    <div className="adm-slot-label">
                      <span>{SLOT_LABELS[i]}</span>
                      <span className="adm-slot-num">{i + 1}</span>
                    </div>
                    <div className="adm-slot-img">
                      {slot.img ? (
                        <img
                          src={slot.img} alt=""
                          className={isCoverImg(slot.img) ? 'cover' : ''}
                          onError={e => { e.target.style.opacity = 0.25; e.target.alt = 'Not found'; }}
                        />
                      ) : (
                        <div className="adm-slot-empty" onClick={() => setAssigningSlot(i)}>
                          <span className="adm-slot-plus">+</span>
                          <span className="adm-slot-empty-label">Assign image</span>
                        </div>
                      )}
                    </div>
                    {slot.img && (
                      <div className="adm-slot-actions">
                        <button className="adm-btn-xs adm-btn-xs--gold" onClick={() => { setAssignUrl(slot.img); setAssigningSlot(i); }}>Replace</button>
                        <button className="adm-btn-xs adm-btn-xs--red" onClick={() => update(s => { s[activeSlug].slots[i] = { img: null, note: '' }; })}>Remove</button>
                      </div>
                    )}
                    <input
                      className="adm-slot-note"
                      type="text"
                      placeholder="Note..."
                      value={slot.note || ''}
                      onChange={e => update(s => { s[activeSlug].slots[i].note = e.target.value; })}
                    />
                  </div>
                ))}
              </div>

              <div className="adm-section-head" style={{ marginTop: 24 }}>Product Notes</div>
              <textarea
                className="adm-textarea"
                placeholder="Internal notes..."
                value={product.notes || ''}
                onChange={e => update(s => { s[activeSlug].notes = e.target.value; })}
              />
            </div>
          )}

          {/* ── CANDIDATES TAB ── */}
          {activeTab === 'candidates' && (
            <div>
              <div className="adm-add-cand">
                <div className="adm-section-head">Add candidate image</div>
                <div className="adm-add-cand-row">
                  <input id="candUrl" className="adm-input" type="text" placeholder="/assets/... or URL" />
                  <input id="candName" className="adm-input adm-input--sm" type="text" placeholder="Label" />
                  <button className="adm-btn adm-btn--gold" onClick={() => {
                    const url  = document.getElementById('candUrl').value.trim();
                    const name = document.getElementById('candName').value.trim();
                    if (!url) return;
                    update(s => {
                      s[activeSlug].candidates.push({ id: Date.now() + '', src: url, name: name || url.split('/').pop(), status: 'keep' });
                    });
                    document.getElementById('candUrl').value = '';
                    document.getElementById('candName').value = '';
                  }}>Add</button>
                </div>
              </div>

              {product.candidates.length === 0 ? (
                <div className="adm-empty">No candidates yet — add an image URL above</div>
              ) : (
                <div className="adm-cands-grid">
                  {product.candidates.map((c, ci) => (
                    <div key={c.id} className="adm-cand">
                      <div className="adm-cand-img-wrap">
                        <img src={c.src} alt="" onError={e => e.target.style.opacity = 0.2} />
                        <span className={`adm-cand-badge adm-cand-badge--${c.status || 'keep'}`}>{c.status || 'keep'}</span>
                        {/* Hover overlay for slot assignment */}
                        <div className="adm-cand-overlay">
                          {SLOT_LABELS.map((_, si) => (
                            <button key={si} className="adm-cand-slot-btn" onClick={() => assignCandToSlot(ci, si)}>
                              Slot {si + 1}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="adm-cand-name">{c.name}</div>
                      <div className="adm-cand-actions">
                        <button className="adm-btn-xs adm-btn-xs--green" onClick={() => update(s => { s[activeSlug].candidates[ci].status = 'approved'; })}>✓ Keep</button>
                        <button className="adm-btn-xs adm-btn-xs--amber" onClick={() => update(s => { s[activeSlug].candidates[ci].status = 'maybe'; })}>? Maybe</button>
                        <button className="adm-btn-xs adm-btn-xs--red"   onClick={() => update(s => { s[activeSlug].candidates[ci].status = 'rejected'; })}>✕ Reject</button>
                        <button className="adm-btn-xs" style={{marginLeft:'auto'}} onClick={() => update(s => { s[activeSlug].candidates.splice(ci, 1); })}>Del</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── BRIEFS TAB ── */}
          {activeTab === 'briefs' && (
            <div>
              <div className="adm-section-head">Image Brief Generator</div>
              <div className="adm-brief-grid">
                {SLOT_LABELS.map((label, i) => (
                  <button key={i} className={`adm-brief-slot${promptSlot === i ? ' active' : ''}`}
                    onClick={() => { setPromptSlot(i); setPromptText(defaultBrief(product, i)); }}>
                    <div className="adm-brief-slot-num">Slot {i + 1}</div>
                    <div className="adm-brief-slot-label">{label}</div>
                    <div className={`adm-brief-slot-status${slots[i]?.img ? ' filled' : ' missing'}`}>
                      {slots[i]?.img ? '✓ Filled' : '⚠ Missing'}
                    </div>
                  </button>
                ))}
              </div>
              <div className="adm-section-head" style={{ marginTop: 20 }}>
                Brief — Slot {promptSlot + 1}: {SLOT_LABELS[promptSlot]}
              </div>
              <textarea
                className="adm-textarea adm-textarea--brief"
                value={promptText}
                onChange={e => setPromptText(e.target.value)}
                placeholder="Brief will appear here..."
              />
              <button className="adm-gen-btn" onClick={handleGenerateBrief} disabled={promptLoading}>
                {promptLoading ? 'Generating…' : 'Generate with AI →'}
              </button>

              {slots.filter(s => !s.img).length === 0 ? (
                <div className="adm-complete-msg">All 7 slots filled — product media complete ✓</div>
              ) : (
                <div>
                  <div className="adm-section-head" style={{ marginTop: 24 }}>All missing slot briefs</div>
                  {slots.map((s, i) => !s.img && (
                    <div key={i} className="adm-brief-item">
                      <div className="adm-brief-item-head">Slot {i + 1} — {SLOT_LABELS[i]}</div>
                      <div className="adm-brief-item-body">{defaultBrief(product, i)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
