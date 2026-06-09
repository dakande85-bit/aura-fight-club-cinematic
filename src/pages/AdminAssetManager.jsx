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

const SLOT_TYPES_BOOTS = [
  'clean_product_shot','hero_product_dark','detail_side_angle',
  'studio_angle','model_full_outfit','lifestyle_ring','campaign_in_use',
];
const SLOT_TYPES_DEFAULT = [
  'clean_product_shot','secondary_angle','detail_shot',
  'model_full_outfit','lifestyle_1','lifestyle_2','campaign_in_use',
];

const BUCKET_MAP = {
  clean_product_shot: 'aura-product-images',
  hero_product_dark:  'aura-product-images',
  detail_side_angle:  'aura-product-images',
  secondary_angle:    'aura-product-images',
  detail_shot:        'aura-product-images',
  studio_angle:       'aura-product-images',
  model_full_outfit:  'aura-model-images',
  lifestyle_ring:     'aura-campaign-images',
  lifestyle_1:        'aura-campaign-images',
  lifestyle_2:        'aura-campaign-images',
  campaign_in_use:    'aura-campaign-images',
};

const STATUS_COLORS = { approved:'#4a7c59', draft:'#7a5e2e', rejected:'#7a3030' };

function countFilled(slots) { return slots.filter(s => s?.img_url).length; }
function getStatus(slots) {
  const c = countFilled(slots);
  return c === 7 ? 'complete' : c === 0 ? 'missing' : 'progress';
}
function isCoverImg(src) {
  return src && ['model','campaign','mitts','fighter','uniform','outfit','hover','lifestyle','ring']
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
    `Campaign/in-use: ${product.name} in action. Training sequence or editorial frame. AURA Fight Club identity.`,
  ];
  return briefs[slotIdx] || '';
}

export default function AdminAssetManager() {
  const navigate = useNavigate();
  const [products,    setProducts]    = useState([]);
  const [slots,       setSlots]       = useState({});
  const [media,       setMedia]       = useState({});    // { slug: [aura_media rows] }
  const [candidates,  setCandidates]  = useState({});
  const [briefs,      setBriefs]      = useState({});
  const [loading,     setLoading]     = useState(true);
  const [activeSlug,  setActiveSlug]  = useState(null);
  const [activeTab,   setActiveTab]   = useState('slots');
  const [promptSlot,  setPromptSlot]  = useState(0);
  const [promptText,  setPromptText]  = useState('');
  const [promptLoading,setPromptLoading]=useState(false);
  const [assigningSlot,setAssigningSlot]=useState(null);
  const [assignUrl,   setAssignUrl]   = useState('');
  const [saving,      setSaving]      = useState(false);
  const [uploading,   setUploading]   = useState(null); // slotIdx being uploaded
  const [toast,       setToast]       = useState('');
  const [preview,     setPreview]     = useState(null); // full-screen preview URL
  const fileInputRef  = useRef(null);
  const uploadSlotRef = useRef(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2400); };

  const loadAll = useCallback(async () => {
    setLoading(true);
    const [{ data: prods }, { data: allSlots }, { data: allMedia },
           { data: allCands }, { data: allBriefs }] = await Promise.all([
      supabase.from('aura_products').select('*').order('name'),
      supabase.from('aura_slots').select('*').order('slot_index'),
      supabase.from('aura_media').select('*').order('sort_order'),
      supabase.from('aura_candidates').select('*').order('created_at'),
      supabase.from('aura_briefs').select('*'),
    ]);

    setProducts(prods || []);

    const slotsMap = {};
    (prods || []).forEach(p => {
      slotsMap[p.slug] = Array(7).fill(null).map((_, i) => ({ slot_index: i, img_url: null, note: '', slot_type: '' }));
    });
    (allSlots || []).forEach(s => { if (slotsMap[s.product_slug]) slotsMap[s.product_slug][s.slot_index] = s; });
    setSlots(slotsMap);

    const mediaMap = {};
    (allMedia || []).forEach(m => {
      if (!mediaMap[m.product_slug]) mediaMap[m.product_slug] = [];
      mediaMap[m.product_slug].push(m);
    });
    setMedia(mediaMap);

    const candsMap = {};
    (allCands || []).forEach(c => { if (!candsMap[c.product_slug]) candsMap[c.product_slug] = []; candsMap[c.product_slug].push(c); });
    setCandidates(candsMap);

    const briefsMap = {};
    (allBriefs || []).forEach(b => { if (!briefsMap[b.product_slug]) briefsMap[b.product_slug] = {}; briefsMap[b.product_slug][b.slot_index] = b.brief_text; });
    setBriefs(briefsMap);

    if (prods?.length && !activeSlug) setActiveSlug(prods[0].slug);
    setLoading(false);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  useEffect(() => {
    if (activeSlug && products.length) {
      const p = products.find(p => p.slug === activeSlug);
      if (p) setPromptText(briefs[activeSlug]?.[promptSlot] || defaultBrief(p, promptSlot));
    }
  }, [promptSlot, activeSlug, products, briefs]);

  const updateProductStatus = async (slug) => {
    const { data: s } = await supabase.from('aura_slots').select('img_url').eq('product_slug', slug);
    const filled = (s||[]).filter(r=>r.img_url).length;
    const status = filled===7?'complete':filled===0?'missing':'progress';
    await supabase.from('aura_products').update({ status }).eq('slug', slug);
  };

  // ── FILE UPLOAD ─────────────────────────────────────────────────────────
  const handleFileUpload = async (slotIdx, file) => {
    if (!file) return;
    setUploading(slotIdx);
    setSaving(true);

    const productSlots = slots[activeSlug] || [];
    const slot = productSlots[slotIdx];
    const slotType = slot?.slot_type || (activeSlug === 'aura-cream-fight-boots' ? SLOT_TYPES_BOOTS : SLOT_TYPES_DEFAULT)[slotIdx];
    const bucket = BUCKET_MAP[slotType] || 'aura-product-images';

    // Clean filename
    const ext  = file.name.split('.').pop().toLowerCase();
    const path = `${activeSlug}/slot-${slotIdx}-${slotType}-${Date.now()}.${ext}`;

    const { error: uploadErr } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
    if (uploadErr) { showToast('Upload failed: ' + uploadErr.message); setSaving(false); setUploading(null); return; }

    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);

    // Update aura_slots
    if (slot?.id) {
      await supabase.from('aura_slots').update({ img_url: publicUrl, note: slot.note || '' }).eq('id', slot.id);
    } else {
      await supabase.from('aura_slots').upsert({ product_slug: activeSlug, slot_index: slotIdx, img_url: publicUrl, note: '', slot_type: slotType }, { onConflict: 'product_slug,slot_index' });
    }

    // Upsert aura_media row
    const existingMedia = media[activeSlug]?.find(m => m.slot_index === slotIdx);
    if (existingMedia) {
      await supabase.from('aura_media').update({ file_url: publicUrl, storage_path: path, storage_bucket: bucket, status: 'approved', updated_at: new Date().toISOString() }).eq('id', existingMedia.id);
    } else {
      await supabase.from('aura_media').insert({ product_slug: activeSlug, slot_index: slotIdx, slot_type: slotType, file_url: publicUrl, storage_path: path, storage_bucket: bucket, file_type: 'image', status: 'approved', sort_order: slotIdx });
    }

    await updateProductStatus(activeSlug);
    await loadAll();
    setSaving(false); setUploading(null);
    showToast('Image uploaded & approved ✓');
  };

  // ── ASSIGN URL ──────────────────────────────────────────────────────────
  const assignSlot = async (slotIdx, url) => {
    if (!url?.trim()) return;
    setSaving(true);
    const productSlots = slots[activeSlug] || [];
    const slot = productSlots[slotIdx];
    const slotType = slot?.slot_type || SLOT_TYPES_DEFAULT[slotIdx];

    if (slot?.id) {
      await supabase.from('aura_slots').update({ img_url: url.trim() }).eq('id', slot.id);
    } else {
      await supabase.from('aura_slots').upsert({ product_slug: activeSlug, slot_index: slotIdx, img_url: url.trim(), note: '', slot_type: slotType }, { onConflict: 'product_slug,slot_index' });
    }

    // Upsert media row
    const existingMedia = media[activeSlug]?.find(m => m.slot_index === slotIdx);
    if (existingMedia) {
      await supabase.from('aura_media').update({ file_url: url.trim(), status: 'approved' }).eq('id', existingMedia.id);
    } else {
      await supabase.from('aura_media').insert({ product_slug: activeSlug, slot_index: slotIdx, slot_type: slotType, file_url: url.trim(), file_type: 'image', status: 'approved', sort_order: slotIdx });
    }

    await updateProductStatus(activeSlug);
    setAssigningSlot(null); setAssignUrl('');
    await loadAll(); setSaving(false); showToast('Slot saved');
  };

  const clearSlot = async (slotIdx) => {
    setSaving(true);
    const slot = slots[activeSlug]?.[slotIdx];
    if (slot?.id) await supabase.from('aura_slots').update({ img_url: null }).eq('id', slot.id);
    const mrow = media[activeSlug]?.find(m => m.slot_index === slotIdx);
    if (mrow) await supabase.from('aura_media').update({ status: 'rejected' }).eq('id', mrow.id);
    await updateProductStatus(activeSlug);
    await loadAll(); setSaving(false); showToast('Slot cleared');
  };

  const setMediaStatus = async (slotIdx, status) => {
    const mrow = media[activeSlug]?.find(m => m.slot_index === slotIdx);
    if (!mrow) return;
    await supabase.from('aura_media').update({ status }).eq('id', mrow.id);
    await loadAll(); showToast(`Marked ${status}`);
  };

  const updateSlotNote = async (slotIdx, note) => {
    const slot = slots[activeSlug]?.[slotIdx];
    if (slot?.id) await supabase.from('aura_slots').update({ note }).eq('id', slot.id);
  };

  // ── CANDIDATES ──────────────────────────────────────────────────────────
  const addCandidate = async (src, name) => {
    if (!src?.trim()) return;
    setSaving(true);
    await supabase.from('aura_candidates').insert({ product_slug: activeSlug, src: src.trim(), name: name||src.split('/').pop(), status:'keep' });
    await loadAll(); setSaving(false); showToast('Candidate added');
  };

  const setCandStatus = async (id, status) => {
    await supabase.from('aura_candidates').update({ status }).eq('id', id);
    setCandidates(prev => ({ ...prev, [activeSlug]: prev[activeSlug].map(c => c.id===id?{...c,status}:c) }));
  };

  const removeCandidate = async (id) => {
    await supabase.from('aura_candidates').delete().eq('id', id);
    setCandidates(prev => ({ ...prev, [activeSlug]: prev[activeSlug].filter(c => c.id!==id) }));
    showToast('Removed');
  };

  const assignCandToSlot = async (cand, slotIdx) => {
    await assignSlot(slotIdx, cand.src);
    await setCandStatus(cand.id, 'approved');
  };

  const saveProductNotes = async (notes) => {
    await supabase.from('aura_products').update({ notes }).eq('slug', activeSlug);
    setProducts(prev => prev.map(p => p.slug===activeSlug?{...p,notes}:p));
  };

  // ── BRIEFS ──────────────────────────────────────────────────────────────
  const saveBrief = async (slotIdx, text) => {
    await supabase.from('aura_briefs').upsert({ product_slug: activeSlug, slot_index: slotIdx, brief_text: text }, { onConflict: 'product_slug,slot_index' });
    setBriefs(prev => ({ ...prev, [activeSlug]: { ...(prev[activeSlug]||{}), [slotIdx]: text } }));
  };

  const generateBrief = async () => {
    const product = products.find(p => p.slug===activeSlug);
    if (!product) return;
    setPromptLoading(true);
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ model:'claude-sonnet-4-20250514', max_tokens:250, messages:[{ role:'user', content:`Write a precise image brief for: ${product.name}, Slot ${promptSlot+1} — ${SLOT_LABELS[promptSlot]}. Brand: AURA Fight Club — cinematic, dark, premium boxing lifestyle. Under 100 words. No preamble.` }] })
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || defaultBrief(product, promptSlot);
      setPromptText(text);
      await saveBrief(promptSlot, text);
      showToast('Brief saved');
    } catch { setPromptText(defaultBrief(products.find(p=>p.slug===activeSlug), promptSlot)); }
    setPromptLoading(false);
  };

  if (loading) return <div className="adm-loading">Loading…</div>;

  const product      = products.find(p => p.slug===activeSlug);
  const productSlots = slots[activeSlug] || Array(7).fill(null).map((_,i)=>({slot_index:i,img_url:null,note:'',slot_type:''}));
  const productMedia = media[activeSlug] || [];
  const productCands = candidates[activeSlug] || [];
  const filled       = countFilled(productSlots);
  const status       = product?.status || getStatus(productSlots);

  const getMediaRow = (slotIdx) => productMedia.find(m => m.slot_index === slotIdx);

  return (
    <div className="adm">
      {toast && <div className="adm-toast">{toast}</div>}
      {preview && (
        <div className="adm-preview-overlay" onClick={() => setPreview(null)}>
          <img src={preview} alt="Preview" className="adm-preview-img" />
          <div className="adm-preview-close">✕ Close</div>
        </div>
      )}

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept="image/*" style={{display:'none'}}
        onChange={e => { const f = e.target.files?.[0]; if (f && uploadSlotRef.current !== null) handleFileUpload(uploadSlotRef.current, f); e.target.value=''; }} />

      {/* SIDEBAR */}
      <aside className="adm-sidebar">
        <div className="adm-sidebar-head">
          <div className="adm-logo">AURA</div>
          <div className="adm-logo-sub">Asset Manager · Supabase</div>
          <button className="adm-back-btn" onClick={() => navigate('/')}>← Site</button>
        </div>
        <nav className="adm-product-list">
          {products.map(p => {
            const s  = slots[p.slug] || [];
            const c  = countFilled(s);
            const st = p.status || getStatus(s);
            return (
              <button key={p.slug} className={`adm-product-item${p.slug===activeSlug?' active':''}`}
                onClick={() => { setActiveSlug(p.slug); setActiveTab('slots'); setAssigningSlot(null); }}>
                <div className="adm-pi-name">{p.name}</div>
                <div className={`adm-pi-status adm-pi-status--${st}`}>
                  {st==='complete'?'✓ COMPLETE 7/7':st==='missing'?'⚠ MISSING':`IN PROGRESS ${c}/7`}
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
                {status==='complete'?'✓ Complete 7/7':status==='missing'?'⚠ Missing Assets':`In Progress ${filled}/7`}
              </span>
              <span className="adm-cat-label">{product?.category} · {product?.collection}</span>
              {saving && <span className="adm-saving">Saving…</span>}
            </div>
          </div>
          <div className="adm-tabs">
            {['slots','candidates','briefs'].map(t => (
              <button key={t} className={`adm-tab${activeTab===t?' active':''}`}
                onClick={() => { setActiveTab(t); setAssigningSlot(null); }}>
                {t==='slots'?'Slots (7)':t==='candidates'?`Candidates (${productCands.length})`:'Briefs'}
              </button>
            ))}
          </div>
        </header>

        <div className="adm-body">

          {/* ── SLOTS TAB ── */}
          {activeTab === 'slots' && (
            <div>
              <div className="adm-section-head">{filled}/7 slots · Upload or assign URLs · Changes sync to website instantly</div>

              {assigningSlot !== null && (
                <div className="adm-assign-modal">
                  <div className="adm-assign-inner">
                    <div className="adm-assign-title">Slot {assigningSlot+1}: {SLOT_LABELS[assigningSlot]}</div>
                    <div className="adm-assign-row">
                      <input className="adm-input" type="text" autoFocus
                        placeholder="/assets/... or https://..."
                        value={assignUrl} onChange={e=>setAssignUrl(e.target.value)}
                        onKeyDown={e=>e.key==='Enter'&&assignSlot(assigningSlot,assignUrl)} />
                      <button className="adm-btn adm-btn--gold" onClick={()=>assignSlot(assigningSlot,assignUrl)}>Assign URL</button>
                      <button className="adm-btn" onClick={()=>{setAssigningSlot(null);setAssignUrl('');}}>Cancel</button>
                    </div>
                    {productCands.filter(c=>c.status!=='rejected').length > 0 && <>
                      <div className="adm-assign-sub">Or pick from candidates</div>
                      <div className="adm-cand-pick-list">
                        {productCands.filter(c=>c.status!=='rejected').map(c=>(
                          <div key={c.id} className="adm-cand-pick" onClick={()=>assignSlot(assigningSlot,c.src)}>
                            <img src={c.src} alt="" onError={e=>e.target.style.opacity=0.2}/>
                            <span>{c.name}</span>
                          </div>
                        ))}
                      </div>
                    </>}
                  </div>
                </div>
              )}

              <div className="adm-slots-grid">
                {productSlots.map((slot, i) => {
                  const mrow   = getMediaRow(i);
                  const imgUrl = slot?.img_url;
                  const mStatus= mrow?.status || (imgUrl ? 'approved' : 'draft');

                  return (
                    <div key={i} className={`adm-slot${imgUrl?' adm-slot--filled':' adm-slot--empty'}`}>
                      <div className="adm-slot-label">
                        <span>{SLOT_LABELS[i]}</span>
                        <span className="adm-slot-num">{i+1}</span>
                      </div>
                      {/* Slot type label */}
                      <div className="adm-slot-type">{slot?.slot_type || '—'}</div>

                      <div className="adm-slot-img">
                        {imgUrl
                          ? <>
                              <img src={imgUrl} alt=""
                                className={isCoverImg(imgUrl)?'cover':''}
                                onError={e=>e.target.style.opacity=0.2}
                                onClick={()=>setPreview(imgUrl)}
                                style={{cursor:'zoom-in'}}/>
                              {/* Media status badge */}
                              <span className="adm-media-status-badge" style={{background: STATUS_COLORS[mStatus]+'22', borderColor: STATUS_COLORS[mStatus]+'66', color: STATUS_COLORS[mStatus]}}>
                                {mStatus}
                              </span>
                            </>
                          : <div className="adm-slot-empty" onClick={()=>setAssigningSlot(i)}>
                              <span className="adm-slot-plus">+</span>
                              <span className="adm-slot-empty-label">Assign</span>
                            </div>
                        }
                        {uploading === i && <div className="adm-slot-uploading">Uploading…</div>}
                      </div>

                      {/* Actions */}
                      <div className="adm-slot-actions">
                        {/* Upload button */}
                        <button className="adm-btn-xs adm-btn-xs--gold"
                          onClick={() => { uploadSlotRef.current = i; fileInputRef.current?.click(); }}>
                          ↑ Upload
                        </button>
                        {imgUrl && <>
                          <button className="adm-btn-xs" onClick={()=>setAssigningSlot(i)}>URL</button>
                          <button className="adm-btn-xs adm-btn-xs--red" onClick={()=>clearSlot(i)}>✕</button>
                        </>}
                      </div>

                      {/* Approve / Draft / Reject */}
                      {imgUrl && (
                        <div className="adm-slot-status-row">
                          {['approved','draft','rejected'].map(s => (
                            <button key={s}
                              className={`adm-status-btn${mStatus===s?' adm-status-btn--active':''}`}
                              style={mStatus===s?{borderColor:STATUS_COLORS[s],color:STATUS_COLORS[s]}:{}}
                              onClick={()=>setMediaStatus(i,s)}>
                              {s}
                            </button>
                          ))}
                        </div>
                      )}

                      <input className="adm-slot-note" type="text" placeholder="Note…"
                        defaultValue={slot?.note||''}
                        onBlur={e=>updateSlotNote(i,e.target.value)} />
                    </div>
                  );
                })}
              </div>

              <div className="adm-section-head" style={{marginTop:24}}>Product Notes</div>
              <textarea className="adm-textarea" defaultValue={product?.notes||''}
                onBlur={e=>saveProductNotes(e.target.value)}
                placeholder="Internal notes…" />
            </div>
          )}

          {/* ── CANDIDATES TAB ── */}
          {activeTab === 'candidates' && (
            <div>
              <div className="adm-add-cand">
                <div className="adm-section-head">Add candidate image</div>
                <div className="adm-add-cand-row">
                  <input id="candUrl"  className="adm-input" type="text" placeholder="/assets/... or URL"/>
                  <input id="candName" className="adm-input adm-input--sm" type="text" placeholder="Label"/>
                  <button className="adm-btn adm-btn--gold" onClick={()=>{
                    const url=document.getElementById('candUrl').value.trim();
                    const name=document.getElementById('candName').value.trim();
                    if(!url)return; addCandidate(url,name);
                    document.getElementById('candUrl').value='';
                    document.getElementById('candName').value='';
                  }}>Add</button>
                </div>
              </div>
              {productCands.length===0
                ? <div className="adm-empty">No candidates yet</div>
                : <div className="adm-cands-grid">
                    {productCands.map(c=>(
                      <div key={c.id} className="adm-cand">
                        <div className="adm-cand-img-wrap">
                          <img src={c.src} alt="" onError={e=>e.target.style.opacity=0.2} onClick={()=>setPreview(c.src)} style={{cursor:'zoom-in'}}/>
                          <span className={`adm-cand-badge adm-cand-badge--${c.status||'keep'}`}>{c.status||'keep'}</span>
                          <div className="adm-cand-overlay">
                            {SLOT_LABELS.map((_,si)=>(
                              <button key={si} className="adm-cand-slot-btn" onClick={()=>assignCandToSlot(c,si)}>
                                Slot {si+1}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="adm-cand-name">{c.name}</div>
                        <div className="adm-cand-actions">
                          <button className="adm-btn-xs adm-btn-xs--green" onClick={()=>setCandStatus(c.id,'approved')}>✓</button>
                          <button className="adm-btn-xs adm-btn-xs--amber" onClick={()=>setCandStatus(c.id,'maybe')}>?</button>
                          <button className="adm-btn-xs adm-btn-xs--red"   onClick={()=>setCandStatus(c.id,'rejected')}>✕</button>
                          <button className="adm-btn-xs" style={{marginLeft:'auto'}} onClick={()=>removeCandidate(c.id)}>Del</button>
                        </div>
                      </div>
                    ))}
                  </div>
              }
            </div>
          )}

          {/* ── BRIEFS TAB ── */}
          {activeTab === 'briefs' && (
            <div>
              <div className="adm-section-head">Image Brief Generator — saved to Supabase</div>
              <div className="adm-brief-grid">
                {SLOT_LABELS.map((label,i)=>(
                  <button key={i} className={`adm-brief-slot${promptSlot===i?' active':''}`}
                    onClick={()=>{ setPromptSlot(i); setPromptText(briefs[activeSlug]?.[i]||defaultBrief(product,i)); }}>
                    <div className="adm-brief-slot-num">Slot {i+1}</div>
                    <div className="adm-brief-slot-label">{label}</div>
                    <div className={`adm-brief-slot-status ${productSlots[i]?.img_url?'filled':'missing'}`}>
                      {productSlots[i]?.img_url?'✓ Filled':'⚠ Missing'}
                    </div>
                  </button>
                ))}
              </div>
              <div className="adm-section-head" style={{marginTop:16}}>Slot {promptSlot+1} — {SLOT_LABELS[promptSlot]}</div>
              <textarea className="adm-textarea adm-textarea--brief" value={promptText}
                onChange={e=>setPromptText(e.target.value)}
                onBlur={e=>saveBrief(promptSlot,e.target.value)}/>
              <button className="adm-gen-btn" onClick={generateBrief} disabled={promptLoading}>
                {promptLoading?'Generating…':'Generate with AI →'}
              </button>
              {countFilled(productSlots)===7
                ? <div className="adm-complete-msg">All 7 slots filled ✓</div>
                : productSlots.map((s,i)=>!s?.img_url&&(
                    <div key={i} className="adm-brief-item">
                      <div className="adm-brief-item-head">Slot {i+1} — {SLOT_LABELS[i]}</div>
                      <div className="adm-brief-item-body">{briefs[activeSlug]?.[i]||defaultBrief(product,i)}</div>
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
