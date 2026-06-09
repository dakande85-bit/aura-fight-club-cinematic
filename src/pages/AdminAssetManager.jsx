import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';
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

function countFilled(slots) { return slots.filter(s => s?.img_url).length; }
function getStatus(slots) {
  const c = countFilled(slots);
  return c === 7 ? 'complete' : c === 0 ? 'missing' : 'progress';
}
function isCoverImg(src) {
  return src && ['model','campaign','mitts','fighter','uniform','outfit','hover']
    .some(k => src.toLowerCase().includes(k));
}
function defaultBrief(product, slotIdx) {
  const briefs = [
    `Product photography: ${product.name}. Clean dark studio background. Full product visible, centred. No props. Premium boxing lifestyle aesthetic.`,
    `Secondary angle: ${product.name}. Different angle — side, three-quarter, or back. Clean studio. Sharp detail.`,
    `Detail/macro shot: ${product.name}. Focus on the most distinctive design detail — logo, material, construction. Shallow depth of field.`,
    `Model lifestyle: Person wearing/using ${product.name}. Dark boxing gym, atmospheric. AURA Fight Club cinematic aesthetic.`,
    `Lifestyle 1: ${product.name} in training context. Dark gym, ring ropes, atmospheric light. Editorial boxing lifestyle.`,
    `Lifestyle 2: ${product.name} — different lifestyle moment. Pre-training, warm-up, or ringside. Premium boxing culture.`,
    `Campaign/in-use: ${product.name} in action. Training sequence or editorial frame. AURA Fight Club identity — earned, disciplined, cinematic.`,
  ];
  return briefs[slotIdx] || '';
}

export default function AdminAssetManager() {
  const navigate = useNavigate();
  const [products,    setProducts]    = useState([]);
  const [slots,       setSlots]       = useState({});      // { slug: [slot0..6] }
  const [candidates,  setCandidates]  = useState({});      // { slug: [...] }
  const [briefs,      setBriefs]      = useState({});      // { slug: { slotIdx: text } }
  const [loading,     setLoading]     = useState(true);
  const [activeSlug,  setActiveSlug]  = useState(null);
  const [activeTab,   setActiveTab]   = useState('slots');
  const [promptSlot,  setPromptSlot]  = useState(0);
  const [promptText,  setPromptText]  = useState('');
  const [promptLoading, setPromptLoading] = useState(false);
  const [assigningSlot, setAssigningSlot] = useState(null);
  const [assignUrl,   setAssignUrl]   = useState('');
  const [saving,      setSaving]      = useState(false);
  const [toast,       setToast]       = useState('');
  const assignRef = useRef(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2200); };

  // ── LOAD ALL DATA ────────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    setLoading(true);
    const [{ data: prods }, { data: allSlots }, { data: allCands }, { data: allBriefs }] =
      await Promise.all([
        supabase.from('aura_products').select('*').order('name'),
        supabase.from('aura_slots').select('*').order('slot_index'),
        supabase.from('aura_candidates').select('*').order('created_at'),
        supabase.from('aura_briefs').select('*'),
      ]);

    setProducts(prods || []);

    // Index slots by slug → array[7]
    const slotsMap = {};
    (prods || []).forEach(p => {
      slotsMap[p.slug] = Array(7).fill(null).map((_, i) => ({ slot_index: i, img_url: null, note: '' }));
    });
    (allSlots || []).forEach(s => {
      if (slotsMap[s.product_slug]) slotsMap[s.product_slug][s.slot_index] = s;
    });
    setSlots(slotsMap);

    // Index candidates by slug
    const candsMap = {};
    (allCands || []).forEach(c => {
      if (!candsMap[c.product_slug]) candsMap[c.product_slug] = [];
      candsMap[c.product_slug].push(c);
    });
    setCandidates(candsMap);

    // Index briefs by slug → { slotIndex: text }
    const briefsMap = {};
    (allBriefs || []).forEach(b => {
      if (!briefsMap[b.product_slug]) briefsMap[b.product_slug] = {};
      briefsMap[b.product_slug][b.slot_index] = b.brief_text;
    });
    setBriefs(briefsMap);

    if (prods?.length && !activeSlug) setActiveSlug(prods[0].slug);
    setLoading(false);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  useEffect(() => {
    if (activeSlug) {
      const product = products.find(p => p.slug === activeSlug);
      if (product) setPromptText(briefs[activeSlug]?.[promptSlot] || defaultBrief(product, promptSlot));
    }
  }, [promptSlot, activeSlug, products, briefs]);

  // ── SLOT OPS ─────────────────────────────────────────────────────────
  const assignSlot = async (slotIdx, url) => {
    if (!url?.trim()) return;
    setSaving(true);
    const existing = slots[activeSlug]?.[slotIdx];
    if (existing?.id) {
      await supabase.from('aura_slots').update({ img_url: url.trim(), note: existing.note || '' }).eq('id', existing.id);
    } else {
      await supabase.from('aura_slots').upsert({ product_slug: activeSlug, slot_index: slotIdx, img_url: url.trim(), note: '' }, { onConflict: 'product_slug,slot_index' });
    }
    await updateProductStatus(activeSlug);
    setAssigningSlot(null); setAssignUrl('');
    await loadAll(); setSaving(false); showToast('Slot saved');
  };

  const clearSlot = async (slotIdx) => {
    setSaving(true);
    const existing = slots[activeSlug]?.[slotIdx];
    if (existing?.id) {
      await supabase.from('aura_slots').update({ img_url: null }).eq('id', existing.id);
    }
    await updateProductStatus(activeSlug);
    await loadAll(); setSaving(false); showToast('Slot cleared');
  };

  const updateSlotNote = async (slotIdx, note) => {
    const existing = slots[activeSlug]?.[slotIdx];
    if (existing?.id) {
      await supabase.from('aura_slots').update({ note }).eq('id', existing.id);
    }
    setSlots(prev => {
      const next = { ...prev };
      next[activeSlug] = [...(next[activeSlug] || [])];
      next[activeSlug][slotIdx] = { ...next[activeSlug][slotIdx], note };
      return next;
    });
  };

  const updateProductStatus = async (slug) => {
    const { data: s } = await supabase.from('aura_slots').select('img_url').eq('product_slug', slug);
    const filled = (s || []).filter(r => r.img_url).length;
    const status = filled === 7 ? 'complete' : filled === 0 ? 'missing' : 'progress';
    await supabase.from('aura_products').update({ status }).eq('slug', slug);
  };

  // ── CANDIDATE OPS ─────────────────────────────────────────────────────
  const addCandidate = async (src, name) => {
    if (!src?.trim()) return;
    setSaving(true);
    await supabase.from('aura_candidates').insert({ product_slug: activeSlug, src: src.trim(), name: name || src.split('/').pop(), status: 'keep' });
    await loadAll(); setSaving(false); showToast('Candidate added');
  };

  const setCandStatus = async (id, status) => {
    await supabase.from('aura_candidates').update({ status }).eq('id', id);
    setCandidates(prev => {
      const next = { ...prev };
      next[activeSlug] = next[activeSlug].map(c => c.id === id ? { ...c, status } : c);
      return next;
    });
  };

  const removeCandidate = async (id) => {
    await supabase.from('aura_candidates').delete().eq('id', id);
    setCandidates(prev => ({ ...prev, [activeSlug]: prev[activeSlug].filter(c => c.id !== id) }));
    showToast('Removed');
  };

  const assignCandToSlot = async (cand, slotIdx) => {
    await assignSlot(slotIdx, cand.src);
    await setCandStatus(cand.id, 'approved');
  };

  // ── NOTES ──────────────────────────────────────────────────────────────
  const saveProductNotes = async (notes) => {
    await supabase.from('aura_products').update({ notes }).eq('slug', activeSlug);
    setProducts(prev => prev.map(p => p.slug === activeSlug ? { ...p, notes } : p));
  };

  // ── BRIEF GEN ──────────────────────────────────────────────────────────
  const saveBrief = async (slotIdx, text) => {
    await supabase.from('aura_briefs').upsert({ product_slug: activeSlug, slot_index: slotIdx, brief_text: text }, { onConflict: 'product_slug,slot_index' });
    setBriefs(prev => ({ ...prev, [activeSlug]: { ...(prev[activeSlug] || {}), [slotIdx]: text } }));
  };

  const generateBrief = async () => {
    const product = products.find(p => p.slug === activeSlug);
    if (!product) return;
    setPromptLoading(true);
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514', max_tokens: 250,
          messages: [{ role: 'user', content: `Write a precise image brief for: ${product.name}, Slot ${promptSlot+1} — ${SLOT_LABELS[promptSlot]}. Brand: AURA Fight Club — cinematic, dark, premium boxing lifestyle. Under 100 words. No preamble.` }]
        })
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || defaultBrief(product, promptSlot);
      setPromptText(text);
      await saveBrief(promptSlot, text);
      showToast('Brief saved');
    } catch { setPromptText(defaultBrief(product, promptSlot)); }
    setPromptLoading(false);
  };

  // ── RENDER ─────────────────────────────────────────────────────────────
  if (loading) return <div className="adm-loading">Loading from Supabase…</div>;

  const product      = products.find(p => p.slug === activeSlug);
  const productSlots = slots[activeSlug] || Array(7).fill({ slot_index: 0, img_url: null, note: '' });
  const productCands = candidates[activeSlug] || [];
  const filled       = countFilled(productSlots);
  const status       = product?.status || getStatus(productSlots);

  return (
    <div className="adm">
      {/* Toast */}
      {toast && <div className="adm-toast">{toast}</div>}

      {/* SIDEBAR */}
      <aside className="adm-sidebar">
        <div className="adm-sidebar-head">
          <div className="adm-logo">AURA</div>
          <div className="adm-logo-sub">Asset Manager · Supabase</div>
          <button className="adm-back-btn" onClick={() => navigate('/')}>← Site</button>
        </div>
        <nav className="adm-product-list">
          {products.map(p => {
            const s = slots[p.slug] || [];
            const c = countFilled(s);
            const st = p.status || getStatus(s);
            return (
              <button key={p.slug}
                className={`adm-product-item${p.slug === activeSlug ? ' active' : ''}`}
                onClick={() => { setActiveSlug(p.slug); setActiveTab('slots'); setAssigningSlot(null); }}>
                <div className="adm-pi-name">{p.name}</div>
                <div className={`adm-pi-status adm-pi-status--${st}`}>
                  {st === 'complete' ? '✓ COMPLETE 7/7' : st === 'missing' ? '⚠ MISSING' : `IN PROGRESS ${c}/7`}
                </div>
                <div className="adm-pi-cat">{p.category}</div>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* MAIN */}
      <div className="adm-main">
        <header className="adm-header">
          <div>
            <h1 className="adm-title">{product?.name || '—'}</h1>
            <div className="adm-header-meta">
              <span className={`adm-badge adm-badge--${status}`}>
                {status === 'complete' ? '✓ Complete 7/7' : status === 'missing' ? '⚠ Missing Assets' : `In Progress ${filled}/7`}
              </span>
              <span className="adm-cat-label">{product?.category} · {product?.collection}</span>
              {saving && <span className="adm-saving">Saving…</span>}
            </div>
          </div>
          <div className="adm-tabs">
            {['slots','candidates','briefs'].map(t => (
              <button key={t} className={`adm-tab${activeTab===t?' active':''}`}
                onClick={() => { setActiveTab(t); setAssigningSlot(null); }}>
                {t === 'slots' ? 'Slots (7)' : t === 'candidates' ? `Candidates (${productCands.length})` : 'Briefs'}
              </button>
            ))}
          </div>
        </header>

        <div className="adm-body">

          {/* ── SLOTS ── */}
          {activeTab === 'slots' && (
            <div>
              <div className="adm-section-head">{filled}/7 slots filled — changes save instantly to Supabase</div>

              {assigningSlot !== null && (
                <div className="adm-assign-modal">
                  <div className="adm-assign-inner">
                    <div className="adm-assign-title">Slot {assigningSlot+1}: {SLOT_LABELS[assigningSlot]}</div>
                    <div className="adm-assign-row">
                      <input ref={assignRef} className="adm-input" type="text" autoFocus
                        placeholder="/assets/products/... or full URL"
                        value={assignUrl} onChange={e => setAssignUrl(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && assignSlot(assigningSlot, assignUrl)} />
                      <button className="adm-btn adm-btn--gold" onClick={() => assignSlot(assigningSlot, assignUrl)}>Assign</button>
                      <button className="adm-btn" onClick={() => { setAssigningSlot(null); setAssignUrl(''); }}>Cancel</button>
                    </div>
                    {productCands.filter(c => c.status !== 'rejected').length > 0 && <>
                      <div className="adm-assign-sub">Or pick from candidates</div>
                      <div className="adm-cand-pick-list">
                        {productCands.filter(c => c.status !== 'rejected').map(c => (
                          <div key={c.id} className="adm-cand-pick" onClick={() => assignSlot(assigningSlot, c.src)}>
                            <img src={c.src} alt="" onError={e => e.target.style.opacity = 0.2} />
                            <span>{c.name}</span>
                          </div>
                        ))}
                      </div>
                    </>}
                  </div>
                </div>
              )}

              <div className="adm-slots-grid">
                {productSlots.map((slot, i) => (
                  <div key={i} className={`adm-slot${slot?.img_url ? ' adm-slot--filled' : ' adm-slot--empty'}`}>
                    <div className="adm-slot-label">
                      <span>{SLOT_LABELS[i]}</span>
                      <span className="adm-slot-num">{i+1}</span>
                    </div>
                    <div className="adm-slot-img">
                      {slot?.img_url
                        ? <img src={slot.img_url} alt="" className={isCoverImg(slot.img_url)?'cover':''}
                            onError={e => { e.target.style.opacity=0.2; }} />
                        : <div className="adm-slot-empty" onClick={() => setAssigningSlot(i)}>
                            <span className="adm-slot-plus">+</span>
                            <span className="adm-slot-empty-label">Assign</span>
                          </div>
                      }
                    </div>
                    {slot?.img_url && (
                      <div className="adm-slot-actions">
                        <button className="adm-btn-xs adm-btn-xs--gold" onClick={() => { setAssignUrl(slot.img_url); setAssigningSlot(i); }}>Replace</button>
                        <button className="adm-btn-xs adm-btn-xs--red" onClick={() => clearSlot(i)}>Remove</button>
                      </div>
                    )}
                    <input className="adm-slot-note" type="text" placeholder="Note…"
                      defaultValue={slot?.note || ''}
                      onBlur={e => updateSlotNote(i, e.target.value)} />
                  </div>
                ))}
              </div>

              <div className="adm-section-head" style={{marginTop:24}}>Product Notes</div>
              <textarea className="adm-textarea" defaultValue={product?.notes || ''}
                onBlur={e => saveProductNotes(e.target.value)}
                placeholder="Internal notes about this product's media…" />
            </div>
          )}

          {/* ── CANDIDATES ── */}
          {activeTab === 'candidates' && (
            <div>
              <div className="adm-add-cand">
                <div className="adm-section-head">Add candidate image</div>
                <div className="adm-add-cand-row">
                  <input id="candUrl"  className="adm-input" type="text" placeholder="/assets/... or URL" />
                  <input id="candName" className="adm-input adm-input--sm" type="text" placeholder="Label" />
                  <button className="adm-btn adm-btn--gold" onClick={() => {
                    const url  = document.getElementById('candUrl').value.trim();
                    const name = document.getElementById('candName').value.trim();
                    if (!url) return;
                    addCandidate(url, name);
                    document.getElementById('candUrl').value = '';
                    document.getElementById('candName').value = '';
                  }}>Add</button>
                </div>
              </div>
              {productCands.length === 0
                ? <div className="adm-empty">No candidates yet — add an image URL above</div>
                : <div className="adm-cands-grid">
                    {productCands.map(c => (
                      <div key={c.id} className="adm-cand">
                        <div className="adm-cand-img-wrap">
                          <img src={c.src} alt="" onError={e => e.target.style.opacity=0.2} />
                          <span className={`adm-cand-badge adm-cand-badge--${c.status||'keep'}`}>{c.status||'keep'}</span>
                          <div className="adm-cand-overlay">
                            {SLOT_LABELS.map((_,si) => (
                              <button key={si} className="adm-cand-slot-btn" onClick={() => assignCandToSlot(c, si)}>
                                Slot {si+1}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="adm-cand-name">{c.name}</div>
                        <div className="adm-cand-actions">
                          <button className="adm-btn-xs adm-btn-xs--green" onClick={() => setCandStatus(c.id,'approved')}>✓</button>
                          <button className="adm-btn-xs adm-btn-xs--amber" onClick={() => setCandStatus(c.id,'maybe')}>?</button>
                          <button className="adm-btn-xs adm-btn-xs--red"   onClick={() => setCandStatus(c.id,'rejected')}>✕</button>
                          <button className="adm-btn-xs" style={{marginLeft:'auto'}} onClick={() => removeCandidate(c.id)}>Del</button>
                        </div>
                      </div>
                    ))}
                  </div>
              }
            </div>
          )}

          {/* ── BRIEFS ── */}
          {activeTab === 'briefs' && (
            <div>
              <div className="adm-section-head">Image Brief Generator — briefs saved to Supabase</div>
              <div className="adm-brief-grid">
                {SLOT_LABELS.map((label, i) => (
                  <button key={i} className={`adm-brief-slot${promptSlot===i?' active':''}`}
                    onClick={() => { setPromptSlot(i); setPromptText(briefs[activeSlug]?.[i] || defaultBrief(product, i)); }}>
                    <div className="adm-brief-slot-num">Slot {i+1}</div>
                    <div className="adm-brief-slot-label">{label}</div>
                    <div className={`adm-brief-slot-status ${productSlots[i]?.img_url ? 'filled' : 'missing'}`}>
                      {productSlots[i]?.img_url ? '✓ Filled' : '⚠ Missing'}
                    </div>
                  </button>
                ))}
              </div>
              <div className="adm-section-head" style={{marginTop:16}}>Slot {promptSlot+1} — {SLOT_LABELS[promptSlot]}</div>
              <textarea className="adm-textarea adm-textarea--brief" value={promptText}
                onChange={e => setPromptText(e.target.value)}
                onBlur={e => saveBrief(promptSlot, e.target.value)} />
              <button className="adm-gen-btn" onClick={generateBrief} disabled={promptLoading}>
                {promptLoading ? 'Generating…' : 'Generate with AI →'}
              </button>
              {countFilled(productSlots) === 7
                ? <div className="adm-complete-msg">All 7 slots filled ✓</div>
                : productSlots.map((s,i) => !s?.img_url && (
                    <div key={i} className="adm-brief-item">
                      <div className="adm-brief-item-head">Slot {i+1} — {SLOT_LABELS[i]}</div>
                      <div className="adm-brief-item-body">{briefs[activeSlug]?.[i] || defaultBrief(product, i)}</div>
                    </div>
                  ))
              }
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
