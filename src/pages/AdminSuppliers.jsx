import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  Clipboard,
  Eye,
  Factory,
  Mail,
  PackageCheck,
  PenLine,
  Search,
  Send,
  ShieldCheck,
  Truck,
  X,
} from 'lucide-react';
import {
  SUPPLIER_STATUSES,
  SUPPLIER_TYPES,
  buildSupplierEmail,
  seededContactLogs,
  seededProductSpecs,
  seededSuppliers,
  supplierStatusLabels,
} from '../data/supplierCommandData.js';
import { products as catalogueProducts } from '../data/products.js';
import { supabase } from '../lib/supabase.js';
import '../styles/admin-suppliers.css';

const STORAGE_KEY = 'aura_supplier_command_centre_v1';

const navItems = [
  { id: 'overview', label: 'Overview' },
  { id: 'directory', label: 'Suppliers' },
  { id: 'pipeline', label: 'Pipeline' },
  { id: 'specs', label: 'Specs' },
  { id: 'contacts', label: 'Contacts' },
  { id: 'qc', label: 'QC Review' },
  { id: 'production', label: 'Production' },
  { id: 'po', label: 'PO Centre' },
];

const sampleStatusLabels = {
  not_requested: 'Not requested',
  sample_requested: 'Sample requested',
  sample_received: 'Sample received',
  approved: 'Approved',
  rejected: 'Rejected',
};

const productionStatusLabels = {
  spec_draft: 'Spec draft',
  supplier_shortlist: 'Supplier shortlist',
  supplier_contacted: 'Supplier contacted',
  sample_review: 'Sample review',
  production_ready: 'Production ready',
};

const productPipelineOrder = [
  'aura-cream-fight-boots',
  'aura-black-fight-boots',
  'aura-premium-boxing-gloves',
  'aura-heavyweight-oversized-tee',
  'aura-sleeveless-zip-hoodie',
  'aura-tracksuit',
  'aura-sauna-suit',
];

const referenceSlotLabels = ['Main product mockup', 'Model wearing product', 'Detail / angle image'];

const qcCriteria = [
  { id: 'logo_accuracy', label: 'Logo accuracy' },
  { id: 'typography_accuracy', label: 'Typography accuracy' },
  { id: 'colour_accuracy', label: 'Colour accuracy' },
  { id: 'material_accuracy', label: 'Material accuracy' },
  { id: 'shape_accuracy', label: 'Shape accuracy' },
  { id: 'stitching_construction_accuracy', label: 'Stitching / construction accuracy' },
  { id: 'packaging_accuracy', label: 'Packaging accuracy' },
];

const qcDecisions = [
  { id: 'pending', label: 'Pending' },
  { id: 'request_changes', label: 'Request changes' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'approved', label: 'Approved' },
  { id: 'production_ready', label: 'Production ready' },
];

const productionFilters = [
  { id: '', label: 'All products' },
  { id: 'not_contacted', label: 'Not contacted' },
  { id: 'sample_requested', label: 'Sample requested' },
  { id: 'qc_pending', label: 'QC pending' },
  { id: 'request_changes', label: 'Request changes' },
  { id: 'approved', label: 'Approved' },
  { id: 'production_ready', label: 'Production ready' },
];

const productionReadinessLabels = {
  not_started: 'Not started',
  supplier_contacted: 'Supplier contacted',
  sample_in_progress: 'Sample in progress',
  qc_pending: 'QC pending',
  changes_required: 'Changes required',
  approved: 'Approved',
  production_ready: 'Production ready',
};

const purchaseOrderStatuses = [
  { id: 'draft', label: 'Draft' },
  { id: 'sent', label: 'Sent' },
  { id: 'deposit_paid', label: 'Deposit Paid' },
  { id: 'in_production', label: 'In Production' },
  { id: 'shipped', label: 'Shipped' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'completed', label: 'Completed' },
];

const sampleImageSlotLabels = ['Supplier sample 1', 'Supplier sample 2', 'Supplier sample 3'];

const supplierProductSlugMap = {
  'aura-premium-boxing-gloves': 'aura-cream-boxing-gloves',
  'aura-sleeveless-zip-hoodie': 'aura-sleeveless-hoodie',
  'aura-heavyweight-oversized-tee': 'aura-black-fight-club-tee',
  'aura-tracksuit': 'aura-black-track-jacket',
};

function mergeById(seedRows, savedRows = []) {
  const savedById = Object.fromEntries(savedRows.map((row) => [row.id, row]));
  return seedRows.map((seed) => ({ ...seed, ...(savedById[seed.id] || {}) }));
}

function mergeProductSpecs(seedRows, savedRows = []) {
  const savedById = Object.fromEntries(savedRows.map((row) => [row.id, row]));
  return seedRows.map((seed) => {
    const saved = savedById[seed.id] || {};
    return {
      ...saved,
      ...seed,
      status: saved.status || seed.status,
      sample_status: saved.sample_status || seed.sample_status,
      production_status: saved.production_status || seed.production_status,
      reference_image_slots: saved.reference_image_slots || seed.reference_image_slots,
      reference_image_urls: saved.reference_image_urls || seed.reference_image_urls,
    };
  });
}

function readLocalData() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        suppliers: mergeById(seededSuppliers, parsed.suppliers || []),
        products: mergeProductSpecs(seededProductSpecs, parsed.products || []),
        logs: (parsed.logs || seededContactLogs).map(normalizeContactLog),
        qcReviews: parsed.qcReviews || {},
        productionRecords: parsed.productionRecords || {},
        purchaseOrders: (parsed.purchaseOrders || []).map(normalizePurchaseOrder),
        lastSavedLocally: parsed.lastSavedLocally || null,
      };
    }
  } catch {
    // Local storage is best-effort only.
  }
  return {
    suppliers: seededSuppliers,
    products: seededProductSpecs,
    logs: seededContactLogs.map(normalizeContactLog),
    qcReviews: {},
    productionRecords: {},
    purchaseOrders: [],
    lastSavedLocally: null,
  };
}

function writeLocalData(data) {
  const lastSavedLocally = new Date().toISOString();
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, lastSavedLocally }));
  } catch {
    // Ignore quota/private-mode failures.
  }
  return lastSavedLocally;
}

function formatDate(value) {
  if (!value) return 'Never';
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));
}

function formatDateTime(value) {
  if (!value) return 'Not saved in this browser yet';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function statusTone(status) {
  if (status === 'approved' || status === 'production_ready') return 'green';
  if (status === 'rejected') return 'red';
  if (status === 'sample_requested' || status === 'sample_received' || status === 'sample_review' || status === 'supplier_shortlist') return 'amber';
  if (status === 'contacted' || status === 'supplier_contacted') return 'silver';
  return 'muted';
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function slugify(value = '') {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function inferProductSlug(spec) {
  return supplierProductSlugMap[spec.id] || spec.product_slug || spec.slug || spec.id;
}

function productSearchTerms(spec) {
  const slug = inferProductSlug(spec);
  const normalizedName = slugify(spec.product_name || '');
  const terms = new Set([
    slug,
    spec.id,
    normalizedName,
    normalizedName.replace('premium-boxing-gloves', 'cream-boxing-gloves'),
    normalizedName.replace('sleeveless-zip-hoodie', 'sleeveless-hoodie'),
    normalizedName.replace('heavyweight-oversized-tee', 'black-fight-club-tee'),
  ].filter(Boolean));
  return [...terms];
}

function assetUrlFromRow(row) {
  return row?.file_url || row?.img_url || row?.src || row?.image || row?.url || '';
}

function assetNameFromRow(row, fallback = 'Asset image') {
  return row?.name || row?.slot_type || row?.alt || row?.note || row?.file_name || fallback;
}

function createAssetCandidate(row, source, productMeta = {}) {
  const url = assetUrlFromRow(row);
  if (!url || String(url).endsWith('.json')) return null;
  const productSlug = row.product_slug || productMeta.slug || '';
  return {
    id: `${source}-${productSlug || 'asset'}-${row.id || row.slot_index || row.sort_order || slugify(url)}`,
    url,
    name: assetNameFromRow(row, source),
    productSlug,
    productName: productMeta.name || row.product_name || productSlug || 'Unassigned product',
    category: productMeta.category || row.category || '',
    source,
    slotIndex: row.slot_index,
    status: row.status || row.media_status || '',
  };
}

function scoreAssetForSpec(asset, spec) {
  const terms = productSearchTerms(spec);
  const haystack = [
    asset.productSlug,
    asset.productName,
    asset.category,
    asset.name,
    asset.url,
  ].join(' ').toLowerCase();
  let score = 0;
  terms.forEach((term) => {
    if (term && haystack.includes(term.toLowerCase())) score += 4;
  });
  if (asset.category && spec.category && asset.category.toLowerCase() === spec.category.toLowerCase()) score += 2;
  if (asset.status === 'approved') score += 1;
  return score;
}

async function loadAssetManagerCandidates() {
  const assetsByUrl = new Map();
  const addAsset = (asset) => {
    if (!asset?.url) return;
    if (!assetsByUrl.has(asset.url)) assetsByUrl.set(asset.url, asset);
  };

  const productMeta = {};
  catalogueProducts.forEach((product) => {
    productMeta[product.slug] = { slug: product.slug, name: product.name, category: product.category };
    addAsset(createAssetCandidate({ product_slug: product.slug, img_url: product.image, slot_index: 0, slot_type: 'card product' }, 'catalogue', product));
    addAsset(createAssetCandidate({ product_slug: product.slug, img_url: product.hoverImage, slot_index: 1, slot_type: 'hover/model' }, 'catalogue', product));
    (product.gallery || []).forEach((image, index) => {
      addAsset(createAssetCandidate({ product_slug: product.slug, src: image.src, name: image.alt, slot_index: index + 2 }, 'catalogue', product));
    });
  });

  try {
    const [productsResult, slotsResult, mediaResult, candidatesResult] = await Promise.allSettled([
      supabase.from('aura_products').select('slug,name,category'),
      supabase.from('aura_slots').select('id,product_slug,slot_index,slot_type,img_url,note'),
      supabase.from('aura_media').select('id,product_slug,slot_index,slot_type,file_url,status,sort_order'),
      supabase.from('aura_candidates').select('id,product_slug,src,name,status,created_at'),
    ]);

    if (productsResult.status === 'fulfilled') {
      (productsResult.value.data || []).forEach((product) => {
        productMeta[product.slug] = { slug: product.slug, name: product.name, category: product.category };
      });
    }

    if (slotsResult.status === 'fulfilled') {
      (slotsResult.value.data || []).forEach((slot) => addAsset(createAssetCandidate(slot, 'slot', productMeta[slot.product_slug])));
    }
    if (mediaResult.status === 'fulfilled') {
      (mediaResult.value.data || []).forEach((media) => addAsset(createAssetCandidate(media, 'media', productMeta[media.product_slug])));
    }
    if (candidatesResult.status === 'fulfilled') {
      (candidatesResult.value.data || []).forEach((candidate) => addAsset(createAssetCandidate(candidate, 'candidate', productMeta[candidate.product_slug])));
    }
  } catch {
    // Asset Manager data is optional for this local fallback admin surface.
  }

  return [...assetsByUrl.values()];
}

function makeLogId() {
  return `log-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function makePurchaseOrderId() {
  return `po-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeContactLog(log) {
  return {
    id: log.id || makeLogId(),
    supplier_id: log.supplier_id || '',
    product_spec_id: log.product_spec_id || '',
    contact_type: log.contact_type || 'email',
    date_contacted: log.date_contacted || (log.created_at ? log.created_at.slice(0, 10) : todayIso()),
    contact_method: log.contact_method || 'Email',
    subject: log.subject || '',
    supplier_response: log.supplier_response || '',
    quoted_sample_cost: log.quoted_sample_cost || '',
    moq_quoted: log.moq_quoted || '',
    bulk_unit_price_quoted: log.bulk_unit_price_quoted || '',
    lead_time_quoted: log.lead_time_quoted || '',
    shipping_quote: log.shipping_quote || '',
    sample_invoice_status: log.sample_invoice_status || 'not_requested',
    sample_paid_status: log.sample_paid_status || 'not_paid',
    sample_received_status: log.sample_received_status || 'not_received',
    decision: log.decision || 'pending',
    follow_up_date: log.follow_up_date || '',
    notes: log.notes || '',
    body: log.body || '',
    created_at: log.created_at || new Date().toISOString(),
  };
}

function parseMoney(value) {
  const parsed = Number(String(value || '').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatMoney(value) {
  return `GBP ${Number(value || 0).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function normalizePurchaseOrder(order = {}) {
  const quantity = Math.max(0, Number(order.quantity) || 0);
  const unitCost = Math.max(0, parseMoney(order.unit_cost));
  const totalCost = quantity * unitCost;
  const depositPaid = Math.max(0, parseMoney(order.deposit_paid));
  return {
    id: order.id || makePurchaseOrderId(),
    po_number: order.po_number || `AURA-PO-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`,
    product_spec_id: order.product_spec_id || '',
    supplier_id: order.supplier_id || '',
    quantity,
    unit_cost: order.unit_cost ?? '',
    total_cost: totalCost,
    deposit_paid: order.deposit_paid ?? '',
    balance_due: Math.max(0, totalCost - depositPaid),
    production_start_date: order.production_start_date || '',
    estimated_completion_date: order.estimated_completion_date || '',
    shipping_method: order.shipping_method || '',
    tracking_number: order.tracking_number || '',
    expected_arrival_date: order.expected_arrival_date || '',
    status: order.status || 'draft',
    created_at: order.created_at || new Date().toISOString(),
    updated_at: order.updated_at || new Date().toISOString(),
  };
}

function createPurchaseOrder(product, supplier) {
  return normalizePurchaseOrder({
    id: makePurchaseOrderId(),
    product_spec_id: product?.id || '',
    supplier_id: supplier?.id || product?.preferred_supplier_id || '',
    quantity: product?.target_moq ? Number(String(product.target_moq).replace(/[^0-9]/g, '')) || 0 : 0,
    unit_cost: product?.target_price || '',
    status: 'draft',
    created_at: new Date().toISOString(),
  });
}

function createBlankContactLog(supplierId = '', productSpecId = '') {
  return normalizeContactLog({
    id: makeLogId(),
    supplier_id: supplierId,
    product_spec_id: productSpecId,
    contact_type: 'manual',
    contact_method: 'Email',
    created_at: new Date().toISOString(),
  });
}

function createBlankQcReview(productId) {
  return {
    product_id: productId,
    sample_images: sampleImageSlotLabels.map((label) => ({ label, url: '' })),
    sample_video_url: '',
    scores: Object.fromEntries(qcCriteria.map((criterion) => [criterion.id, 5])),
    decision: 'pending',
    notes: '',
    updated_at: new Date().toISOString(),
  };
}

function normalizeQcReview(productId, review = {}) {
  const blank = createBlankQcReview(productId);
  const sampleImages = review.sample_images?.length ? review.sample_images : blank.sample_images;
  return {
    ...blank,
    ...review,
    product_id: productId,
    sample_images: sampleImageSlotLabels.map((label, index) => ({
      label,
      url: sampleImages[index]?.url || '',
    })),
    scores: {
      ...blank.scores,
      ...(review.scores || {}),
    },
    decision: review.decision || blank.decision,
    notes: review.notes || '',
    sample_video_url: review.sample_video_url || '',
  };
}

function normalizeQcReviews(products, savedReviews = {}) {
  return Object.fromEntries(products.map((product) => [
    product.id,
    normalizeQcReview(product.id, savedReviews[product.id]),
  ]));
}

function calculateQcScore(review) {
  const values = qcCriteria.map((criterion) => Number(review.scores?.[criterion.id] || 0)).filter((score) => score > 0);
  if (!values.length) return 0;
  return Math.round((values.reduce((sum, score) => sum + score, 0) / values.length) * 10) / 10;
}

function latestLogForProduct(logs, productId) {
  return logs
    .filter((log) => log.product_spec_id === productId)
    .sort((a, b) => String(b.date_contacted || b.created_at).localeCompare(String(a.date_contacted || a.created_at)))[0] || null;
}

function logsForProduct(logs, productId) {
  return logs.filter((log) => log.product_spec_id === productId);
}

function inferContactStatus(productLogs) {
  if (!productLogs.length) return 'not_contacted';
  if (productLogs.some((log) => log.supplier_response?.trim())) return 'supplier_responded';
  return 'contacted';
}

function inferSampleStatus(product, productLogs) {
  if (productLogs.some((log) => log.sample_received_status === 'received')) return 'sample_received';
  if (productLogs.some((log) => ['pending', 'paid'].includes(log.sample_paid_status) || log.contact_type === 'sample_request')) return 'sample_requested';
  return product.sample_status || 'not_requested';
}

function inferProductionReadiness(product, qcDecision, sampleStatus, contactStatus) {
  if (product.production_status === 'production_ready' || qcDecision === 'production_ready') return 'production_ready';
  if (qcDecision === 'approved') return 'approved';
  if (qcDecision === 'request_changes' || qcDecision === 'rejected') return 'changes_required';
  if (sampleStatus === 'sample_received') return 'qc_pending';
  if (sampleStatus === 'sample_requested') return 'sample_in_progress';
  if (contactStatus !== 'not_contacted') return 'supplier_contacted';
  return 'not_started';
}

function calculateReadinessScore({ contactStatus, sampleStatus, qcScore, qcDecision, readinessStatus }) {
  let score = 0;
  if (contactStatus !== 'not_contacted') score += 15;
  if (contactStatus === 'supplier_responded') score += 10;
  if (sampleStatus === 'sample_requested') score += 15;
  if (sampleStatus === 'sample_received') score += 25;
  if (qcScore) score += Math.round(qcScore * 3);
  if (qcDecision === 'approved') score += 15;
  if (qcDecision === 'production_ready') score += 25;
  if (readinessStatus === 'production_ready') score += 15;
  if (readinessStatus === 'changes_required') score = Math.min(score, 64);
  return Math.min(100, score);
}

function readinessTone(status) {
  if (status === 'production_ready' || status === 'approved') return 'green';
  if (status === 'changes_required') return 'red';
  if (['sample_in_progress', 'qc_pending'].includes(status)) return 'amber';
  if (status === 'supplier_contacted') return 'silver';
  return 'muted';
}

function productApprovedForPurchaseOrder(product, review, productionRecord = {}) {
  return ['approved', 'production_ready'].includes(review?.decision)
    || ['approved', 'production_ready'].includes(productionRecord.readiness_status)
    || product.production_status === 'production_ready';
}

function purchaseOrderTone(status) {
  if (['delivered', 'completed'].includes(status)) return 'green';
  if (['deposit_paid', 'in_production', 'shipped'].includes(status)) return 'amber';
  if (status === 'sent') return 'silver';
  return 'muted';
}

function Pill({ children, tone = 'muted' }) {
  return <span className={`sup-pill sup-pill--${tone}`}>{children}</span>;
}

function IconButton({ title, children, onClick, href }) {
  const className = 'sup-icon-btn';
  if (href) {
    return (
      <a className={className} href={href} title={title} aria-label={title}>
        {children}
      </a>
    );
  }
  return (
    <button className={className} type="button" title={title} aria-label={title} onClick={onClick}>
      {children}
    </button>
  );
}

function StatCard({ label, value, detail, icon: Icon }) {
  return (
    <div className="sup-stat">
      <div className="sup-stat__icon"><Icon size={18} /></div>
      <div>
        <div className="sup-stat__value">{value}</div>
        <div className="sup-stat__label">{label}</div>
        <div className="sup-stat__detail">{detail}</div>
      </div>
    </div>
  );
}

function BackendStatusPanel({ supplierCount, productCount, logCount, lastSavedLocally }) {
  return (
    <section className="sup-status-panel">
      <div>
        <span>Data source</span>
        <strong>Local fallback</strong>
        <small>Supabase optional for live review</small>
      </div>
      <div>
        <span>Supplier count</span>
        <strong>{supplierCount}</strong>
        <small>Directory records</small>
      </div>
      <div>
        <span>Product spec count</span>
        <strong>{productCount}</strong>
        <small>Manufacturing specs</small>
      </div>
      <div>
        <span>Contact log count</span>
        <strong>{logCount}</strong>
        <small>Email/sample activity</small>
      </div>
      <div>
        <span>Last saved locally</span>
        <strong>{formatDateTime(lastSavedLocally)}</strong>
        <small>Stored in this browser</small>
      </div>
    </section>
  );
}

function SectionHeading({ eyebrow, title, copy, actions = null }) {
  return (
    <div className="sup-section-heading">
      <div>
        {eyebrow ? <span>{eyebrow}</span> : null}
        <h2>{title}</h2>
        {copy ? <p>{copy}</p> : null}
      </div>
      {actions ? <div className="sup-section-heading__actions">{actions}</div> : null}
    </div>
  );
}

function SupplierCard({ supplier, logs, viewMode, onView, onEmail, onSpec, onSample, onApprove, onEdit, onDelete }) {
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <article className={`sup-card sup-card--supplier sup-card--${viewMode}`}>
      <div className="sup-card__head">
        <div>
          <div className="sup-card__name">{supplier.name}</div>
          <div className="sup-card__meta">{supplier.country} / {supplier.moq}</div>
        </div>
        <Pill tone={supplier.type.toLowerCase()}>{supplier.type}</Pill>
      </div>

      <div className="sup-supplier-summary">
        <div>
          <span>Best for</span>
          <strong>{supplier.best_for}</strong>
        </div>
        <div>
          <span>Status</span>
          <Pill tone={statusTone(supplier.status)}>{supplierStatusLabels[supplier.status]}</Pill>
        </div>
        <div>
          <span>Contact logs</span>
          <strong>{logs.length}</strong>
        </div>
      </div>

      {viewMode === 'detailed' ? (
        <>
          <div className="sup-card__line">
            <span>Website</span>
            <a href={supplier.website} target="_blank" rel="noreferrer">{supplier.website.replace(/^https?:\/\//, '')}</a>
          </div>
          <div className="sup-card__line">
            <span>Email</span>
            <strong>{supplier.contact_email}</strong>
          </div>
          <div className="sup-tags">
            {supplier.product_categories.map((category) => <span key={category}>{category}</span>)}
          </div>
          <p className="sup-card__notes">{supplier.notes}</p>
          <div className="sup-card__footer">
            <span>{supplier.sample_available ? 'Sample available' : 'No sample listed'}</span>
            <span>{formatDate(supplier.last_contacted)}</span>
          </div>
        </>
      ) : null}

      <div className="sup-actions">
        <button type="button" onClick={() => onView(supplier)}><Eye size={14} />View</button>
        <button type="button" onClick={() => onEmail(supplier)}><Mail size={14} />Email</button>
        <div className="sup-more">
          <button type="button" onClick={() => setMoreOpen((open) => !open)}>More</button>
          {moreOpen ? (
            <div className="sup-more__menu">
              <button type="button" onClick={() => onEdit(supplier)}><PenLine size={14} />Edit</button>
              <button type="button" onClick={() => onSpec(supplier)}><PackageCheck size={14} />Add Spec</button>
              <button type="button" onClick={() => onSample(supplier)}><Send size={14} />Sample</button>
              <button type="button" onClick={() => onApprove(supplier)}><Check size={14} />Approve</button>
              <button type="button" onClick={() => onDelete(supplier)}><X size={14} />Delete</button>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function ProductSpecCard({ spec, suppliersById, onView, onSend }) {
  const preferred = suppliersById[spec.preferred_supplier_id]?.name || 'Unassigned';
  const backup = getBackupSupplierNames(spec, suppliersById).join(', ') || 'Unassigned';

  return (
    <article className="sup-spec-card">
      <div className="sup-spec-card__top">
        <div>
          <div className="sup-spec-card__name">{spec.product_name}</div>
          <div className="sup-card__meta">{spec.category} / {spec.target_moq} / {spec.target_price}</div>
        </div>
        <Pill tone={statusTone(spec.status)}>{supplierStatusLabels[spec.status] || spec.status}</Pill>
      </div>
      <div className="sup-spec-grid">
        <div><span>Supplier type</span><strong>{spec.supplier_type_needed}</strong></div>
        <div><span>Preferred</span><strong>{preferred}</strong></div>
        <div><span>Backup</span><strong>{backup}</strong></div>
        <div><span>Colourway</span><strong>{spec.colourway}</strong></div>
      </div>
      <p className="sup-card__notes">{spec.manufacturing_notes}</p>
      <div className="sup-actions">
        <button type="button" onClick={() => onView(spec)}><Eye size={14} />Spec</button>
        <button type="button" onClick={() => onSend(spec)}><Send size={14} />Send to Supplier</button>
      </div>
    </article>
  );
}

function getBackupSupplierNames(spec, suppliersById) {
  const ids = spec.backup_supplier_ids?.length ? spec.backup_supplier_ids : [spec.backup_supplier_id].filter(Boolean);
  return ids.map((id) => suppliersById[id]?.name).filter(Boolean);
}

function getReferenceSlots(spec) {
  const source = spec.reference_image_slots?.length
    ? spec.reference_image_slots
    : (spec.reference_image_urls || []).map((url, index) => ({ label: referenceSlotLabels[index] || `Reference ${index + 1}`, url }));

  return referenceSlotLabels.map((label, index) => ({
    label,
    url: source[index]?.url || '',
  }));
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function ReferenceSlotEditor({ productId, slot, index, onUpdate, onChooseAsset }) {
  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    onUpdate(productId, index, dataUrl);
    event.target.value = '';
  };

  return (
    <div className="sup-reference-slot">
      <div className="sup-reference-slot__thumb">
        {slot.url ? <img src={slot.url} alt={`${slot.label} reference`} /> : <span>No image</span>}
      </div>
      <label>
        <span>{slot.label}</span>
        <input type="url" value={slot.url || ''} onChange={(event) => onUpdate(productId, index, event.target.value)} placeholder="Paste image URL" />
      </label>
      <div className="sup-reference-slot__actions">
        {slot.url ? <a href={slot.url} target="_blank" rel="noreferrer">Open</a> : <span>Waiting</span>}
        <button type="button" onClick={() => onChooseAsset(productId, index)}>Choose from Assets</button>
        <label>
          Upload
          <input type="file" accept="image/*" onChange={handleFile} />
        </label>
      </div>
    </div>
  );
}

function AssetPickerModal({ spec, slotIndex, assets, loading, onClose, onSelect }) {
  const [query, setQuery] = useState('');
  const scoredAssets = useMemo(() => {
    if (!spec) return [];
    return assets
      .map((asset) => ({ ...asset, matchScore: scoreAssetForSpec(asset, spec) }))
      .sort((a, b) => b.matchScore - a.matchScore || a.productName.localeCompare(b.productName) || a.name.localeCompare(b.name));
  }, [assets, spec]);

  const filteredAssets = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return scoredAssets;
    return scoredAssets.filter((asset) => [
      asset.productName,
      asset.productSlug,
      asset.category,
      asset.name,
      asset.source,
      asset.url,
    ].join(' ').toLowerCase().includes(needle));
  }, [query, scoredAssets]);

  if (!spec) return null;
  const matchedCount = scoredAssets.filter((asset) => asset.matchScore > 0).length;

  return (
    <div className="sup-modal">
      <div className="sup-modal__panel sup-asset-picker">
        <div className="sup-modal__head">
          <div>
            <div className="sup-drawer__eyebrow">Choose from Admin Asset Manager</div>
            <h2>{referenceSlotLabels[slotIndex]} / {spec.product_name}</h2>
          </div>
          <IconButton title="Close" onClick={onClose}><X size={18} /></IconButton>
        </div>
        <div className="sup-asset-picker__toolbar">
          <label className="sup-search">
            <Search size={15} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search assets, products, categories" />
          </label>
          <span>{loading ? 'Loading assets...' : `${matchedCount} matched / ${assets.length} available`}</span>
        </div>
        <div className="sup-asset-grid">
          {filteredAssets.map((asset) => (
            <button
              type="button"
              className={`sup-asset-option${asset.matchScore > 0 ? ' sup-asset-option--matched' : ''}`}
              key={asset.id}
              onClick={() => onSelect(asset.url)}
            >
              <span className="sup-asset-option__image">
                <img src={asset.url} alt={asset.name} />
              </span>
              <strong>{asset.name}</strong>
              <small>{asset.productName}</small>
              <span>{asset.category || 'Uncategorised'} / {asset.source}</span>
            </button>
          ))}
          {!loading && filteredAssets.length === 0 ? (
            <div className="sup-empty">No matching asset images found. Paste URL and upload still work for this slot.</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ReferenceSlotPreview({ slot }) {
  return (
    <div className="sup-reference-slot sup-reference-slot--preview">
      <div className="sup-reference-slot__thumb">
        {slot.url ? <img src={slot.url} alt={`${slot.label} reference`} /> : <span>No image</span>}
      </div>
      <span>{slot.label}</span>
      <strong>{slot.url || 'No image URL saved'}</strong>
    </div>
  );
}

function ProductManufacturingCard({ spec, suppliersById, onViewSpec, onSend, onReferenceUpdate, onChooseAsset }) {
  const preferred = suppliersById[spec.preferred_supplier_id]?.name || 'Unassigned';
  const backups = getBackupSupplierNames(spec, suppliersById);
  const refs = getReferenceSlots(spec);
  const productStatus = supplierStatusLabels[spec.status] || spec.status;
  const sampleStatus = sampleStatusLabels[spec.sample_status] || spec.sample_status || 'Not requested';
  const productionStatus = productionStatusLabels[spec.production_status] || spec.production_status || 'Spec draft';

  return (
    <article className="sup-product-card">
      <div className="sup-product-card__top">
        <div>
          <div className="sup-product-card__eyebrow">{spec.category} / {spec.supplier_type_needed}</div>
          <h2>{spec.product_name}</h2>
        </div>
        <div className="sup-product-card__badges">
          <Pill tone={statusTone(spec.status)}>{productStatus}</Pill>
          <Pill tone={statusTone(spec.sample_status)}>{sampleStatus}</Pill>
          <Pill tone={statusTone(spec.production_status)}>{productionStatus}</Pill>
        </div>
      </div>

      <div className="sup-manufacturing-flow">
        <span>AURA Product</span>
        <span>Reference Images</span>
        <span>Manufacturing Spec</span>
        <span>Preferred Supplier</span>
        <span>Backup Suppliers</span>
        <span>Send Email</span>
        <span>Sample Status</span>
        <span>Production Status</span>
      </div>

      <div className="sup-reference-slots">
        {refs.map((ref, index) => (
          <ReferenceSlotEditor
            key={`${spec.id}-${ref.label}`}
            productId={spec.id}
            slot={ref}
            index={index}
            onUpdate={onReferenceUpdate}
            onChooseAsset={onChooseAsset}
          />
        ))}
      </div>

      <div className="sup-product-spec-grid">
        <div><span>Preferred supplier</span><strong>{preferred}</strong></div>
        <div><span>Backup suppliers</span><strong>{backups.join(', ') || 'Unassigned'}</strong></div>
        <div><span>Material</span><strong>{spec.material}</strong></div>
        <div><span>Colourway</span><strong>{spec.colourway}</strong></div>
        <div><span>Logo placement</span><strong>{spec.logo_placement}</strong></div>
        <div><span>Target / MOQ</span><strong>{spec.target_price} / {spec.target_moq}</strong></div>
      </div>

      <div className="sup-product-card__notes">
        <span>Supplier-ready spec</span>
        <p>{spec.spec_summary}</p>
      </div>

      <div className="sup-product-card__notes">
        <span>Manufacturing notes</span>
        <p>{spec.manufacturing_notes}</p>
      </div>

      <div className="sup-product-intel">
        <div>
          <span>Quality risks</span>
          <ul>
            {(spec.quality_risks || []).map((risk) => <li key={risk}>{risk}</li>)}
          </ul>
        </div>
        <div>
          <span>Supplier questions</span>
          <ul>
            {(spec.supplier_questions || []).map((question) => <li key={question}>{question}</li>)}
          </ul>
        </div>
      </div>

      <div className="sup-actions">
        <button type="button" onClick={() => onViewSpec(spec)}><Eye size={14} />Open Spec</button>
        <button type="button" onClick={() => onSend(spec)}><Send size={14} />Send to Supplier</button>
      </div>
    </article>
  );
}

function SupplierDrawer({ supplier, logs, onClose, onUpdateStatus, onCopyEmail }) {
  if (!supplier) return null;

  return (
    <aside className="sup-drawer">
      <div className="sup-drawer__head">
        <div>
          <div className="sup-drawer__eyebrow">Supplier detail</div>
          <h2>{supplier.name}</h2>
        </div>
        <IconButton title="Close" onClick={onClose}><X size={18} /></IconButton>
      </div>
      <div className="sup-drawer__body">
        <div className="sup-drawer__badges">
          <Pill tone={supplier.type.toLowerCase()}>{supplier.type}</Pill>
          <Pill tone={statusTone(supplier.status)}>{supplierStatusLabels[supplier.status]}</Pill>
        </div>
        <dl className="sup-detail-list">
          <div><dt>Website</dt><dd><a href={supplier.website} target="_blank" rel="noreferrer">{supplier.website}</a></dd></div>
          <div><dt>Email</dt><dd>{supplier.contact_email}</dd></div>
          <div><dt>Country</dt><dd>{supplier.country}</dd></div>
          <div><dt>MOQ</dt><dd>{supplier.moq}</dd></div>
          <div><dt>Sample available</dt><dd>{supplier.sample_available ? 'Yes' : 'No'}</dd></div>
          <div><dt>Last contacted</dt><dd>{formatDate(supplier.last_contacted)}</dd></div>
        </dl>
        <div className="sup-drawer__block">
          <h3>Product categories</h3>
          <div className="sup-tags">
            {supplier.product_categories.map((category) => <span key={category}>{category}</span>)}
          </div>
        </div>
        <div className="sup-drawer__block">
          <h3>Best for</h3>
          <p>{supplier.best_for}</p>
        </div>
        <div className="sup-drawer__block">
          <h3>Notes</h3>
          <p>{supplier.notes}</p>
        </div>
        <div className="sup-drawer__block">
          <h3>Status control</h3>
          <div className="sup-status-grid">
            {SUPPLIER_STATUSES.map((status) => (
              <button
                className={supplier.status === status ? 'active' : ''}
                type="button"
                key={status}
                onClick={() => onUpdateStatus(supplier, status)}
              >
                {supplierStatusLabels[status]}
              </button>
            ))}
          </div>
        </div>
        <div className="sup-drawer__block">
          <h3>Contact history</h3>
          <div className="sup-log-list">
            {logs.length ? logs.map((log) => (
              <div className="sup-log" key={log.id}>
                <div className="sup-log__top">
                  <strong>{log.subject || log.contact_type}</strong>
                  <span>{formatDate(log.created_at)}</span>
                </div>
                <p>{log.body}</p>
              </div>
            )) : <div className="sup-empty">No supplier contact logged yet.</div>}
          </div>
        </div>
        <div className="sup-drawer__actions">
          <button type="button" onClick={() => onCopyEmail(supplier.contact_email)}><Clipboard size={14} />Copy email</button>
          <a href={`mailto:${supplier.contact_email}`}><Mail size={14} />Open email client</a>
        </div>
      </div>
    </aside>
  );
}

function SpecDrawer({ spec, suppliersById, onClose, onSend }) {
  if (!spec) return null;
  const refs = getReferenceSlots(spec);
  const fields = [
    ['Material', spec.material],
    ['Fabric weight / GSM', spec.fabric_weight_gsm],
    ['Colourway', spec.colourway],
    ['Logo placement', spec.logo_placement],
    ['Typography notes', spec.typography_notes],
    ['Hardware', spec.hardware],
    ['Sole / padding / stitching', spec.sole_padding_stitching],
    ['Finish', spec.finish],
    ['Sizing', spec.sizing],
    ['Packaging', spec.packaging],
    ['Accuracy notes', spec.accuracy_notes],
    ['Manufacturing notes', spec.manufacturing_notes],
  ];

  return (
    <aside className="sup-drawer">
      <div className="sup-drawer__head">
        <div>
          <div className="sup-drawer__eyebrow">Product spec</div>
          <h2>{spec.product_name}</h2>
        </div>
        <IconButton title="Close" onClick={onClose}><X size={18} /></IconButton>
      </div>
      <div className="sup-drawer__body">
          <div className="sup-spec-grid sup-spec-grid--drawer">
          <div><span>Category</span><strong>{spec.category}</strong></div>
          <div><span>Supplier type</span><strong>{spec.supplier_type_needed}</strong></div>
          <div><span>Preferred</span><strong>{suppliersById[spec.preferred_supplier_id]?.name || 'Unassigned'}</strong></div>
          <div><span>Backup</span><strong>{getBackupSupplierNames(spec, suppliersById).join(', ') || 'Unassigned'}</strong></div>
          <div><span>Target price</span><strong>{spec.target_price}</strong></div>
          <div><span>Target MOQ</span><strong>{spec.target_moq}</strong></div>
        </div>
        <div className="sup-drawer__block">
          <h3>Reference image slots</h3>
          <div className="sup-reference-slots sup-reference-slots--drawer">
            {refs.map((slot) => <ReferenceSlotPreview key={`${spec.id}-drawer-${slot.label}`} slot={slot} />)}
          </div>
        </div>
        <div className="sup-drawer__block">
          <h3>Supplier-ready spec</h3>
          <p>{spec.spec_summary}</p>
        </div>
        {fields.map(([label, value]) => (
          <div className="sup-drawer__block" key={label}>
            <h3>{label}</h3>
            <p>{value}</p>
          </div>
        ))}
        <div className="sup-drawer__block">
          <h3>Quality risks</h3>
          <ul className="sup-drawer-list">
            {(spec.quality_risks || []).map((risk) => <li key={risk}>{risk}</li>)}
          </ul>
        </div>
        <div className="sup-drawer__block">
          <h3>Supplier questions</h3>
          <ul className="sup-drawer-list">
            {(spec.supplier_questions || []).map((question) => <li key={question}>{question}</li>)}
          </ul>
        </div>
        <div className="sup-drawer__actions">
          <button type="button" onClick={() => onSend(spec)}><Send size={14} />Send to Supplier</button>
        </div>
      </div>
    </aside>
  );
}

function SendDesignModal({ suppliers, specs, initialSupplier, initialSpec, onClose, onSaveLog, onCopy }) {
  const [supplierId, setSupplierId] = useState(initialSupplier?.id || initialSpec?.preferred_supplier_id || suppliers[0]?.id || '');
  const [specId, setSpecId] = useState(initialSpec?.id || specs[0]?.id || '');
  const supplier = suppliers.find((item) => item.id === supplierId);
  const spec = specs.find((item) => item.id === specId);
  const email = supplier && spec ? buildSupplierEmail(supplier, spec) : { subject: '', body: '' };
  const mailto = supplier ? `mailto:${supplier.contact_email}?subject=${encodeURIComponent(email.subject)}&body=${encodeURIComponent(email.body)}` : '';

  return (
    <div className="sup-modal">
      <div className="sup-modal__panel">
        <div className="sup-modal__head">
          <div>
            <div className="sup-drawer__eyebrow">Send design to supplier</div>
            <h2>Manufacturing email workflow</h2>
          </div>
          <IconButton title="Close" onClick={onClose}><X size={18} /></IconButton>
        </div>
        <div className="sup-modal__grid">
          <label>
            <span>Supplier</span>
            <select value={supplierId} onChange={(event) => setSupplierId(event.target.value)}>
              {suppliers.map((item) => <option key={item.id} value={item.id}>{item.name} / {item.type}</option>)}
            </select>
          </label>
          <label>
            <span>Product spec</span>
            <select value={specId} onChange={(event) => setSpecId(event.target.value)}>
              {specs.map((item) => <option key={item.id} value={item.id}>{item.product_name}</option>)}
            </select>
          </label>
        </div>
        <label className="sup-email-field">
          <span>Generated subject</span>
          <input value={email.subject} readOnly />
        </label>
        <label className="sup-email-field">
          <span>Generated email body</span>
          <textarea value={email.body} readOnly />
        </label>
        <div className="sup-modal__actions">
          <button type="button" onClick={() => onCopy(`${email.subject}\n\n${email.body}`)}><Clipboard size={14} />Copy Email</button>
          <a href={mailto}><Mail size={14} />Open Email Client</a>
          <button type="button" onClick={() => onSaveLog(supplier, spec, email)}><ShieldCheck size={14} />Save Contact Log</button>
        </div>
      </div>
    </div>
  );
}

function SupplierContactTracker({ logs, suppliers, products, onAdd, onUpdate, onDelete }) {
  const suppliersById = Object.fromEntries(suppliers.map((supplier) => [supplier.id, supplier]));
  const productsById = Object.fromEntries(products.map((product) => [product.id, product]));
  const sortedLogs = [...logs].sort((a, b) => String(b.date_contacted || b.created_at).localeCompare(String(a.date_contacted || a.created_at)));

  const set = (id, field, value) => onUpdate(id, { [field]: value });

  return (
    <section className="sup-panel">
      <div className="sup-contact-head">
        <div>
          <div className="sup-section-title">Supplier Contact Tracker</div>
          <p>Track supplier outreach, responses, quotes, sample payments, delivery status, and approval decisions for each AURA product.</p>
        </div>
        <button type="button" onClick={onAdd}>Add Contact</button>
      </div>

      <div className="sup-contact-list">
        {sortedLogs.map((log) => (
          <article className="sup-contact-card" key={log.id}>
            <div className="sup-contact-card__top">
              <div>
                <strong>{suppliersById[log.supplier_id]?.name || 'Unassigned supplier'}</strong>
                <span>{productsById[log.product_spec_id]?.product_name || 'Unassigned product'}</span>
              </div>
              <button type="button" onClick={() => onDelete(log.id)}>Delete</button>
            </div>

            <div className="sup-contact-grid">
              <label>
                <span>Date contacted</span>
                <input type="date" value={log.date_contacted || ''} onChange={(event) => set(log.id, 'date_contacted', event.target.value)} />
              </label>
              <label>
                <span>Contact method</span>
                <select value={log.contact_method || 'Email'} onChange={(event) => set(log.id, 'contact_method', event.target.value)}>
                  {['Email', 'Contact form', 'Instagram', 'WhatsApp', 'Phone', 'Other'].map((method) => <option key={method}>{method}</option>)}
                </select>
              </label>
              <label>
                <span>Supplier</span>
                <select value={log.supplier_id || ''} onChange={(event) => set(log.id, 'supplier_id', event.target.value)}>
                  <option value="">Select supplier</option>
                  {suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}
                </select>
              </label>
              <label>
                <span>Product</span>
                <select value={log.product_spec_id || ''} onChange={(event) => set(log.id, 'product_spec_id', event.target.value)}>
                  <option value="">Select product</option>
                  {products.map((product) => <option key={product.id} value={product.id}>{product.product_name}</option>)}
                </select>
              </label>
              <label className="sup-contact-grid__wide">
                <span>Email subject</span>
                <input value={log.subject || ''} onChange={(event) => set(log.id, 'subject', event.target.value)} placeholder="Subject sent to supplier" />
              </label>
              <label className="sup-contact-grid__wide">
                <span>Supplier response</span>
                <textarea value={log.supplier_response || ''} onChange={(event) => set(log.id, 'supplier_response', event.target.value)} placeholder="Paste or summarise supplier response" />
              </label>
              <label>
                <span>Quoted sample cost</span>
                <input value={log.quoted_sample_cost || ''} onChange={(event) => set(log.id, 'quoted_sample_cost', event.target.value)} placeholder="e.g. GBP 85" />
              </label>
              <label>
                <span>MOQ quoted</span>
                <input value={log.moq_quoted || ''} onChange={(event) => set(log.id, 'moq_quoted', event.target.value)} placeholder="e.g. 100 units" />
              </label>
              <label>
                <span>Bulk unit price quoted</span>
                <input value={log.bulk_unit_price_quoted || ''} onChange={(event) => set(log.id, 'bulk_unit_price_quoted', event.target.value)} placeholder="e.g. GBP 12.50" />
              </label>
              <label>
                <span>Lead time quoted</span>
                <input value={log.lead_time_quoted || ''} onChange={(event) => set(log.id, 'lead_time_quoted', event.target.value)} placeholder="e.g. 14 days sample / 45 days bulk" />
              </label>
              <label>
                <span>Shipping quote</span>
                <input value={log.shipping_quote || ''} onChange={(event) => set(log.id, 'shipping_quote', event.target.value)} placeholder="Shipping cost / method" />
              </label>
              <label>
                <span>Sample invoice status</span>
                <select value={log.sample_invoice_status || 'not_requested'} onChange={(event) => set(log.id, 'sample_invoice_status', event.target.value)}>
                  {['not_requested', 'requested', 'received', 'approved', 'rejected'].map((status) => <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>)}
                </select>
              </label>
              <label>
                <span>Sample paid status</span>
                <select value={log.sample_paid_status || 'not_paid'} onChange={(event) => set(log.id, 'sample_paid_status', event.target.value)}>
                  {['not_paid', 'pending', 'paid', 'refunded'].map((status) => <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>)}
                </select>
              </label>
              <label>
                <span>Sample received status</span>
                <select value={log.sample_received_status || 'not_received'} onChange={(event) => set(log.id, 'sample_received_status', event.target.value)}>
                  {['not_received', 'in_transit', 'received', 'needs_revision'].map((status) => <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>)}
                </select>
              </label>
              <label>
                <span>Approve / reject decision</span>
                <select value={log.decision || 'pending'} onChange={(event) => set(log.id, 'decision', event.target.value)}>
                  {['pending', 'approved', 'rejected', 'pending_revision', 'backup_only'].map((status) => <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>)}
                </select>
              </label>
              <label>
                <span>Follow-up date</span>
                <input type="date" value={log.follow_up_date || ''} onChange={(event) => set(log.id, 'follow_up_date', event.target.value)} />
              </label>
              <label className="sup-contact-grid__wide">
                <span>Notes</span>
                <textarea value={log.notes || ''} onChange={(event) => set(log.id, 'notes', event.target.value)} placeholder="Internal notes, risks, next action" />
              </label>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function QcSampleReviewCentre({ products, reviews, onUpdate }) {
  const setReviewPatch = (productId, patch) => {
    const current = normalizeQcReview(productId, reviews[productId]);
    onUpdate(productId, { ...current, ...patch, updated_at: new Date().toISOString() });
  };

  const setScore = (productId, criterionId, value) => {
    const current = normalizeQcReview(productId, reviews[productId]);
    const score = Math.min(10, Math.max(1, Number(value) || 1));
    setReviewPatch(productId, {
      scores: {
        ...current.scores,
        [criterionId]: score,
      },
    });
  };

  const setSampleImage = (productId, index, url) => {
    const current = normalizeQcReview(productId, reviews[productId]);
    const nextImages = current.sample_images.map((image, imageIndex) => (
      imageIndex === index ? { ...image, url } : image
    ));
    setReviewPatch(productId, { sample_images: nextImages });
  };

  const handleSampleUpload = async (productId, index, event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    setSampleImage(productId, index, dataUrl);
    event.target.value = '';
  };

  return (
    <section className="sup-qc-centre">
      <div className="sup-pipeline-hero">
        <div>
          <div className="sup-section-title">QC Sample Review Centre</div>
          <p>Compare supplier samples against original AURA references, score manufacturing accuracy, and decide whether each product moves toward production.</p>
        </div>
        <div className="sup-pipeline-hero__stats">
          <StatCard label="Products reviewed" value={products.length} detail="QC records in localStorage" icon={ShieldCheck} />
          <StatCard label="Approved" value={products.filter((product) => reviews[product.id]?.decision === 'approved').length} detail="Cleared sample direction" icon={Check} />
          <StatCard label="Production ready" value={products.filter((product) => reviews[product.id]?.decision === 'production_ready').length} detail="Ready for bulk route" icon={Factory} />
        </div>
      </div>

      {products.map((product) => {
        const review = normalizeQcReview(product.id, reviews[product.id]);
        const referenceSlots = getReferenceSlots(product);
        const overallScore = calculateQcScore(review);

        return (
          <article className="sup-qc-card" key={product.id}>
            <div className="sup-qc-card__head">
              <div>
                <div className="sup-product-card__eyebrow">{product.category} / {product.supplier_type_needed}</div>
                <h2>{product.product_name}</h2>
              </div>
              <div className="sup-qc-score">
                <span>Overall QC</span>
                <strong>{overallScore}/10</strong>
              </div>
            </div>

            <div className="sup-qc-media-grid">
              <div>
                <h3>Original reference images</h3>
                <div className="sup-reference-slots sup-reference-slots--qc">
                  {referenceSlots.map((slot) => <ReferenceSlotPreview key={`${product.id}-qc-ref-${slot.label}`} slot={slot} />)}
                </div>
              </div>
              <div>
                <h3>Supplier sample images</h3>
                <div className="sup-reference-slots sup-reference-slots--qc">
                  {review.sample_images.map((slot, index) => (
                    <div className="sup-reference-slot" key={`${product.id}-sample-${slot.label}`}>
                      <div className="sup-reference-slot__thumb">
                        {slot.url ? <img src={slot.url} alt={`${product.product_name} supplier sample ${index + 1}`} /> : <span>No sample</span>}
                      </div>
                      <label>
                        <span>{slot.label}</span>
                        <input type="url" value={slot.url || ''} onChange={(event) => setSampleImage(product.id, index, event.target.value)} placeholder="Paste sample image URL" />
                      </label>
                      <div className="sup-reference-slot__actions">
                        {slot.url ? <a href={slot.url} target="_blank" rel="noreferrer">Open</a> : <span>Waiting</span>}
                        <label>
                          Upload
                          <input type="file" accept="image/*" onChange={(event) => handleSampleUpload(product.id, index, event)} />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="sup-qc-controls">
              <label className="sup-qc-video">
                <span>Sample video URL</span>
                <input value={review.sample_video_url} onChange={(event) => setReviewPatch(product.id, { sample_video_url: event.target.value })} placeholder="Paste supplier sample video URL" />
              </label>
              <label>
                <span>Decision</span>
                <select value={review.decision} onChange={(event) => setReviewPatch(product.id, { decision: event.target.value })}>
                  {qcDecisions.map((decision) => <option key={decision.id} value={decision.id}>{decision.label}</option>)}
                </select>
              </label>
            </div>

            <div className="sup-qc-checklist">
              {qcCriteria.map((criterion) => (
                <label key={criterion.id}>
                  <span>{criterion.label}</span>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={review.scores[criterion.id]}
                    onChange={(event) => setScore(product.id, criterion.id, event.target.value)}
                  />
                </label>
              ))}
            </div>

            <label className="sup-qc-notes">
              <span>QC notes</span>
              <textarea value={review.notes} onChange={(event) => setReviewPatch(product.id, { notes: event.target.value })} placeholder="Fit, logo, material, colour, construction, packaging, requested changes" />
            </label>
          </article>
        );
      })}
    </section>
  );
}

function ProductionDashboard({ products, suppliersById, logs, reviews, productionRecords, onUpdate }) {
  const [filter, setFilter] = useState('');

  const rows = useMemo(() => products.map((product) => {
    const productLogs = logsForProduct(logs, product.id);
    const latestLog = latestLogForProduct(logs, product.id);
    const review = normalizeQcReview(product.id, reviews[product.id]);
    const qcScore = calculateQcScore(review);
    const contactStatus = inferContactStatus(productLogs);
    const sampleStatus = inferSampleStatus(product, productLogs);
    const inferredReadiness = inferProductionReadiness(product, review.decision, sampleStatus, contactStatus);
    const record = productionRecords[product.id] || {};
    const readinessStatus = record.readiness_status || inferredReadiness;
    const readinessScore = calculateReadinessScore({
      contactStatus,
      sampleStatus,
      qcScore,
      qcDecision: review.decision,
      readinessStatus,
    });

    return {
      product,
      productLogs,
      latestLog,
      review,
      record,
      contactStatus,
      sampleStatus,
      qcScore,
      qcDecision: review.decision,
      readinessStatus,
      readinessScore,
      preferredSupplier: suppliersById[product.preferred_supplier_id],
      backupSuppliers: (product.backup_supplier_ids || []).map((id) => suppliersById[id]).filter(Boolean),
      nextAction: record.next_action || latestLog?.notes || product.next_action || '',
      followUpDate: record.follow_up_date || latestLog?.follow_up_date || '',
      notes: record.notes || '',
    };
  }), [logs, productionRecords, products, reviews, suppliersById]);

  const filteredRows = rows.filter((row) => {
    if (!filter) return true;
    if (filter === 'not_contacted') return row.contactStatus === 'not_contacted';
    if (filter === 'sample_requested') return row.sampleStatus === 'sample_requested';
    if (filter === 'qc_pending') return row.qcDecision === 'pending' || row.readinessStatus === 'qc_pending';
    if (filter === 'request_changes') return row.qcDecision === 'request_changes' || row.readinessStatus === 'changes_required';
    if (filter === 'approved') return row.qcDecision === 'approved' || row.readinessStatus === 'approved';
    if (filter === 'production_ready') return row.qcDecision === 'production_ready' || row.readinessStatus === 'production_ready';
    return true;
  });

  const setProductionField = (productId, key, value) => {
    onUpdate(productId, { [key]: value });
  };

  return (
    <section className="sup-production">
      <div className="sup-pipeline-hero">
        <div>
          <div className="sup-section-title">Production Dashboard</div>
          <p>Roll up supplier contact, sample status, QC decisions, and production readiness for every AURA product route.</p>
        </div>
        <div className="sup-pipeline-hero__stats">
          <StatCard label="Products tracked" value={rows.length} detail="Pipeline products" icon={Factory} />
          <StatCard label="Approved" value={rows.filter((row) => row.qcDecision === 'approved').length} detail="QC approved" icon={Check} />
          <StatCard label="Production ready" value={rows.filter((row) => row.readinessStatus === 'production_ready').length} detail="Ready status" icon={Truck} />
        </div>
      </div>

      <div className="sup-production-filters">
        {productionFilters.map((item) => (
          <button
            className={filter === item.id ? 'active' : ''}
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="sup-production-list">
        {filteredRows.map((row) => (
          <article className="sup-production-card" key={row.product.id}>
            <div className="sup-production-card__head">
              <div>
                <div className="sup-product-card__eyebrow">{row.product.category} / {row.product.supplier_type_needed}</div>
                <h2>{row.product.product_name}</h2>
              </div>
              <div className="sup-readiness-score">
                <span>Readiness</span>
                <strong>{row.readinessScore}%</strong>
              </div>
            </div>

            <div className="sup-production-grid">
              <div>
                <span>Preferred supplier</span>
                <strong>{row.preferredSupplier?.name || 'Unassigned'}</strong>
              </div>
              <div>
                <span>Backup suppliers</span>
                <strong>{row.backupSuppliers.map((supplier) => supplier.name).join(', ') || 'None assigned'}</strong>
              </div>
              <div>
                <span>Contact status</span>
                <Pill tone={statusTone(row.contactStatus)}>{row.contactStatus.replaceAll('_', ' ')}</Pill>
              </div>
              <div>
                <span>Sample status</span>
                <Pill tone={statusTone(row.sampleStatus)}>{sampleStatusLabels[row.sampleStatus] || row.sampleStatus.replaceAll('_', ' ')}</Pill>
              </div>
              <div>
                <span>QC score</span>
                <strong>{row.qcScore}/10</strong>
              </div>
              <div>
                <span>QC decision</span>
                <Pill tone={statusTone(row.qcDecision)}>{row.qcDecision.replaceAll('_', ' ')}</Pill>
              </div>
            </div>

            <div className="sup-production-edit">
              <label>
                <span>Production readiness status</span>
                <select value={row.readinessStatus} onChange={(event) => setProductionField(row.product.id, 'readiness_status', event.target.value)}>
                  {Object.entries(productionReadinessLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>Status badge</span>
                <Pill tone={readinessTone(row.readinessStatus)}>{productionReadinessLabels[row.readinessStatus] || row.readinessStatus}</Pill>
              </label>
              <label>
                <span>Next action</span>
                <input value={row.nextAction} onChange={(event) => setProductionField(row.product.id, 'next_action', event.target.value)} placeholder="e.g. Chase quote, pay sample invoice, review QC changes" />
              </label>
              <label>
                <span>Follow-up date</span>
                <input type="date" value={row.followUpDate} onChange={(event) => setProductionField(row.product.id, 'follow_up_date', event.target.value)} />
              </label>
              <label className="sup-production-edit__wide">
                <span>Production notes</span>
                <textarea value={row.notes} onChange={(event) => setProductionField(row.product.id, 'notes', event.target.value)} placeholder="Production risks, supplier constraints, approvals, costing, timing" />
              </label>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function PurchaseOrderCentre({ products, suppliersById, reviews, productionRecords, purchaseOrders, onCreate, onUpdate }) {
  const productsById = useMemo(
    () => Object.fromEntries(products.map((product) => [product.id, product])),
    [products],
  );

  const approvedProducts = useMemo(() => products.filter((product) => (
    productApprovedForPurchaseOrder(product, normalizeQcReview(product.id, reviews[product.id]), productionRecords[product.id])
  )), [products, productionRecords, reviews]);

  const totals = useMemo(() => purchaseOrders.reduce((acc, rawOrder) => {
    const order = normalizePurchaseOrder(rawOrder);
    acc.totalProductionValue += order.total_cost;
    acc.outstandingBalance += order.balance_due;
    acc.unitsOrdered += order.quantity;
    if (['delivered', 'completed'].includes(order.status)) acc.unitsDelivered += order.quantity;
    return acc;
  }, {
    totalProductionValue: 0,
    outstandingBalance: 0,
    unitsOrdered: 0,
    unitsDelivered: 0,
  }), [purchaseOrders]);

  const ordersByProduct = useMemo(() => purchaseOrders.reduce((acc, order) => {
    if (!acc[order.product_spec_id]) acc[order.product_spec_id] = [];
    acc[order.product_spec_id].push(order);
    return acc;
  }, {}), [purchaseOrders]);

  const setOrderField = (orderId, key, value) => {
    onUpdate(orderId, { [key]: value });
  };

  return (
    <section className="sup-po-centre">
      <div className="sup-pipeline-hero">
        <div>
          <div className="sup-section-title">Purchase Order Centre</div>
          <p>Create and track purchase orders for approved AURA products, from draft PO through deposit, production, shipping, delivery, and completion.</p>
        </div>
        <div className="sup-pipeline-hero__stats">
          <StatCard label="Total Production Value" value={formatMoney(totals.totalProductionValue)} detail="Across active POs" icon={Factory} />
          <StatCard label="Outstanding Balance" value={formatMoney(totals.outstandingBalance)} detail="Balance due" icon={PackageCheck} />
          <StatCard label="Units Ordered" value={totals.unitsOrdered} detail={`${totals.unitsDelivered} delivered`} icon={Truck} />
        </div>
      </div>

      <section className="sup-po-approved">
        <div className="sup-section-title">Approved Products</div>
        {approvedProducts.length ? (
          <div className="sup-po-approved__grid">
            {approvedProducts.map((product) => {
              const supplier = suppliersById[product.preferred_supplier_id];
              const productOrders = ordersByProduct[product.id] || [];
              return (
                <article key={product.id}>
                  <div>
                    <span>{product.category}</span>
                    <strong>{product.product_name}</strong>
                    <small>{supplier?.name || 'Preferred supplier unassigned'} / {productOrders.length} PO{productOrders.length === 1 ? '' : 's'}</small>
                  </div>
                  <button type="button" onClick={() => onCreate(product, supplier)}>
                    Create Purchase Order
                  </button>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="sup-empty">No products are approved for purchase orders yet. Approve QC or mark production readiness first.</div>
        )}
      </section>

      <section className="sup-po-list">
        <div className="sup-section-title">Purchase Orders</div>
        {purchaseOrders.length ? purchaseOrders.map((rawOrder) => {
          const order = normalizePurchaseOrder(rawOrder);
          const product = productsById[order.product_spec_id];
          const supplier = suppliersById[order.supplier_id];
          return (
            <article className="sup-po-card" key={order.id}>
              <div className="sup-po-card__head">
                <div>
                  <span>PO Number</span>
                  <h2>{order.po_number}</h2>
                  <p>{product?.product_name || 'Product unassigned'} / {supplier?.name || 'Supplier unassigned'}</p>
                </div>
                <Pill tone={purchaseOrderTone(order.status)}>
                  {purchaseOrderStatuses.find((status) => status.id === order.status)?.label || order.status}
                </Pill>
              </div>

              <div className="sup-po-grid">
                <label>
                  <span>PO Number</span>
                  <input value={order.po_number} onChange={(event) => setOrderField(order.id, 'po_number', event.target.value)} />
                </label>
                <label>
                  <span>Product</span>
                  <select value={order.product_spec_id} onChange={(event) => setOrderField(order.id, 'product_spec_id', event.target.value)}>
                    <option value="">Select product</option>
                    {approvedProducts.map((item) => <option key={item.id} value={item.id}>{item.product_name}</option>)}
                  </select>
                </label>
                <label>
                  <span>Supplier</span>
                  <select value={order.supplier_id} onChange={(event) => setOrderField(order.id, 'supplier_id', event.target.value)}>
                    <option value="">Select supplier</option>
                    {Object.values(suppliersById).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                  </select>
                </label>
                <label>
                  <span>Quantity</span>
                  <input type="number" min="0" value={order.quantity} onChange={(event) => setOrderField(order.id, 'quantity', event.target.value)} />
                </label>
                <label>
                  <span>Unit Cost</span>
                  <input value={order.unit_cost} onChange={(event) => setOrderField(order.id, 'unit_cost', event.target.value)} placeholder="e.g. GBP 42" />
                </label>
                <label>
                  <span>Total Cost</span>
                  <strong>{formatMoney(order.total_cost)}</strong>
                </label>
                <label>
                  <span>Deposit Paid</span>
                  <input value={order.deposit_paid} onChange={(event) => setOrderField(order.id, 'deposit_paid', event.target.value)} placeholder="e.g. GBP 500" />
                </label>
                <label>
                  <span>Balance Due</span>
                  <strong>{formatMoney(order.balance_due)}</strong>
                </label>
                <label>
                  <span>Production Start Date</span>
                  <input type="date" value={order.production_start_date} onChange={(event) => setOrderField(order.id, 'production_start_date', event.target.value)} />
                </label>
                <label>
                  <span>Estimated Completion Date</span>
                  <input type="date" value={order.estimated_completion_date} onChange={(event) => setOrderField(order.id, 'estimated_completion_date', event.target.value)} />
                </label>
                <label>
                  <span>Shipping Method</span>
                  <input value={order.shipping_method} onChange={(event) => setOrderField(order.id, 'shipping_method', event.target.value)} placeholder="Air, sea, courier" />
                </label>
                <label>
                  <span>Tracking Number</span>
                  <input value={order.tracking_number} onChange={(event) => setOrderField(order.id, 'tracking_number', event.target.value)} />
                </label>
                <label>
                  <span>Expected Arrival Date</span>
                  <input type="date" value={order.expected_arrival_date} onChange={(event) => setOrderField(order.id, 'expected_arrival_date', event.target.value)} />
                </label>
                <label>
                  <span>Status</span>
                  <select value={order.status} onChange={(event) => setOrderField(order.id, 'status', event.target.value)}>
                    {purchaseOrderStatuses.map((status) => <option key={status.id} value={status.id}>{status.label}</option>)}
                  </select>
                </label>
              </div>
            </article>
          );
        }) : (
          <div className="sup-empty">No purchase orders created yet.</div>
        )}
      </section>
    </section>
  );
}

export default function AdminSuppliers() {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [qcReviews, setQcReviews] = useState({});
  const [productionRecords, setProductionRecords] = useState({});
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [activeSection, setActiveSection] = useState('overview');
  const [viewMode, setViewMode] = useState('compact');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [selectedSpec, setSelectedSpec] = useState(null);
  const [sendContext, setSendContext] = useState(null);
  const [assetPicker, setAssetPicker] = useState(null);
  const [assetCandidates, setAssetCandidates] = useState([]);
  const [assetCandidatesLoading, setAssetCandidatesLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(true);
  const [lastSavedLocally, setLastSavedLocally] = useState(null);

  const showToast = useCallback((message) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2400);
  }, []);

  const persistLocal = useCallback((nextSuppliers, nextProducts, nextLogs, nextQcReviews = qcReviews, nextProductionRecords = productionRecords, nextPurchaseOrders = purchaseOrders) => {
    const savedAt = writeLocalData({
      suppliers: nextSuppliers,
      products: nextProducts,
      logs: nextLogs,
      qcReviews: nextQcReviews,
      productionRecords: nextProductionRecords,
      purchaseOrders: nextPurchaseOrders,
    });
    setLastSavedLocally(savedAt);
  }, [productionRecords, purchaseOrders, qcReviews]);

  const loadData = useCallback(async () => {
    setLoading(true);
    const local = readLocalData();
    window.setTimeout(() => {
      setSuppliers(local.suppliers);
      setProducts(local.products);
      setLogs(local.logs);
      setQcReviews(normalizeQcReviews(local.products, local.qcReviews));
      setProductionRecords(local.productionRecords || {});
      setPurchaseOrders(local.purchaseOrders || []);
      setLastSavedLocally(local.lastSavedLocally);
      setLoading(false);
    }, 0);
  }, []);

  useEffect(() => {
    const loadTimer = window.setTimeout(() => {
      void loadData();
    }, 0);
    return () => window.clearTimeout(loadTimer);
  }, [loadData]);

  useEffect(() => {
    let alive = true;
    loadAssetManagerCandidates()
      .then((assets) => {
        if (alive) setAssetCandidates(assets);
      })
      .catch(() => {
        if (alive) setAssetCandidates([]);
      })
      .finally(() => {
        if (alive) setAssetCandidatesLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const suppliersById = useMemo(
    () => Object.fromEntries(suppliers.map((supplier) => [supplier.id, supplier])),
    [suppliers],
  );

  const pipelineProducts = useMemo(() => {
    const order = Object.fromEntries(productPipelineOrder.map((id, index) => [id, index]));
    return [...products].sort((a, b) => (order[a.id] ?? 999) - (order[b.id] ?? 999));
  }, [products]);

  const logsBySupplier = useMemo(() => {
    return logs.reduce((acc, log) => {
      if (!acc[log.supplier_id]) acc[log.supplier_id] = [];
      acc[log.supplier_id].push(log);
      return acc;
    }, {});
  }, [logs]);

  const filteredSuppliers = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return suppliers.filter((supplier) => {
      const haystack = [
        supplier.name,
        supplier.country,
        supplier.contact_email,
        supplier.best_for,
        supplier.notes,
        ...supplier.product_categories,
      ].join(' ').toLowerCase();
      return (!needle || haystack.includes(needle))
        && (!typeFilter || supplier.type === typeFilter)
        && (!statusFilter || supplier.status === statusFilter);
    });
  }, [search, statusFilter, suppliers, typeFilter]);

  const updateSupplierStatus = async (supplier, status) => {
    const updated = { ...supplier, status, last_contacted: status === 'contacted' ? todayIso() : supplier.last_contacted };
    const nextSuppliers = suppliers.map((item) => (item.id === supplier.id ? updated : item));
    setSuppliers(nextSuppliers);
    setSelectedSupplier(updated);
    persistLocal(nextSuppliers, products, logs);
    showToast('Supplier status updated');
  };

  const saveContactLog = async (supplier, spec, email, contactType = 'email') => {
    if (!supplier || !spec) return;
    const log = normalizeContactLog({
      id: makeLogId(),
      supplier_id: supplier.id,
      product_spec_id: spec.id,
      contact_type: contactType,
      contact_method: 'Email',
      date_contacted: todayIso(),
      subject: email.subject,
      supplier_response: '',
      quoted_sample_cost: '',
      moq_quoted: '',
      bulk_unit_price_quoted: '',
      lead_time_quoted: '',
      shipping_quote: '',
      sample_invoice_status: 'not_requested',
      sample_paid_status: 'not_paid',
      sample_received_status: 'not_received',
      decision: 'pending',
      follow_up_date: '',
      notes: contactType === 'sample_request' ? 'Sample request logged from supplier directory action.' : 'Generated supplier email saved from Send Design workflow.',
      body: email.body,
      created_at: new Date().toISOString(),
    });
    const nextLogs = [log, ...logs];
    const nextSuppliers = suppliers.map((item) => (
      item.id === supplier.id ? { ...item, status: item.status === 'not_contacted' ? 'contacted' : item.status, last_contacted: todayIso() } : item
    ));
    setLogs(nextLogs);
    setSuppliers(nextSuppliers);
    persistLocal(nextSuppliers, products, nextLogs);
    showToast('Contact attempt saved');
  };

  const copyText = async (text) => {
    await navigator.clipboard.writeText(text);
    showToast('Copied to clipboard');
  };

  const requestSample = async (supplier) => {
    await updateSupplierStatus(supplier, 'sample_requested');
    const spec = products.find((product) => product.preferred_supplier_id === supplier.id) || products[0];
    if (spec) {
      const email = {
        subject: `AURA sample request - ${supplier.name}`,
        body: `Sample request logged for ${supplier.name}. Product target: ${spec.product_name}.`,
      };
      await saveContactLog(supplier, spec, email, 'sample_request');
    }
  };

  const markApproved = (supplier) => updateSupplierStatus(supplier, 'approved');

  const addContactRecord = () => {
    const nextLogs = [createBlankContactLog(suppliers[0]?.id || '', products[0]?.id || ''), ...logs];
    setLogs(nextLogs);
    persistLocal(suppliers, products, nextLogs);
    showToast('Contact record added');
  };

  const updateContactRecord = (id, patch) => {
    const nextLogs = logs.map((log) => (
      log.id === id ? normalizeContactLog({ ...log, ...patch }) : log
    ));
    setLogs(nextLogs);
    persistLocal(suppliers, products, nextLogs);
  };

  const deleteContactRecord = (id) => {
    const nextLogs = logs.filter((log) => log.id !== id);
    setLogs(nextLogs);
    persistLocal(suppliers, products, nextLogs);
    showToast('Contact record deleted');
  };

  const deleteSupplier = (supplier) => {
    const nextSuppliers = suppliers.filter((item) => item.id !== supplier.id);
    const nextLogs = logs.filter((log) => log.supplier_id !== supplier.id);
    setSuppliers(nextSuppliers);
    setLogs(nextLogs);
    if (selectedSupplier?.id === supplier.id) setSelectedSupplier(null);
    persistLocal(nextSuppliers, products, nextLogs);
    showToast('Supplier deleted');
  };

  const updateReferenceSlot = (productId, slotIndex, url) => {
    const nextProducts = products.map((product) => {
      if (product.id !== productId) return product;
      const currentSlots = getReferenceSlots(product);
      const nextSlots = currentSlots.map((slot, index) => (
        index === slotIndex ? { ...slot, url } : slot
      ));
      return {
        ...product,
        reference_image_slots: nextSlots,
        reference_image_urls: nextSlots.map((slot) => slot.url).filter(Boolean),
      };
    });
    setProducts(nextProducts);
    const nextSelectedSpec = selectedSpec?.id === productId
      ? nextProducts.find((product) => product.id === productId) || selectedSpec
      : selectedSpec;
    if (nextSelectedSpec !== selectedSpec) setSelectedSpec(nextSelectedSpec);
    persistLocal(suppliers, nextProducts, logs);
    showToast('Reference image saved');
  };

  const openAssetPicker = (productId, slotIndex) => {
    const spec = products.find((product) => product.id === productId);
    if (!spec) return;
    setAssetPicker({ productId, slotIndex });
  };

  const selectAssetForReferenceSlot = (url) => {
    if (!assetPicker) return;
    updateReferenceSlot(assetPicker.productId, assetPicker.slotIndex, url);
    setAssetPicker(null);
    showToast('Asset reference selected');
  };

  const updateQcReview = (productId, nextReview) => {
    const nextQcReviews = {
      ...qcReviews,
      [productId]: normalizeQcReview(productId, nextReview),
    };
    setQcReviews(nextQcReviews);
    persistLocal(suppliers, products, logs, nextQcReviews);
    showToast('QC review saved');
  };

  const updateProductionRecord = (productId, patch) => {
    const nextProductionRecords = {
      ...productionRecords,
      [productId]: {
        ...(productionRecords[productId] || {}),
        ...patch,
        updated_at: new Date().toISOString(),
      },
    };
    setProductionRecords(nextProductionRecords);
    persistLocal(suppliers, products, logs, qcReviews, nextProductionRecords);
  };

  const createPurchaseOrderRecord = (product, supplier) => {
    const nextPurchaseOrders = [createPurchaseOrder(product, supplier), ...purchaseOrders];
    setPurchaseOrders(nextPurchaseOrders);
    persistLocal(suppliers, products, logs, qcReviews, productionRecords, nextPurchaseOrders);
    showToast('Purchase order created');
  };

  const updatePurchaseOrderRecord = (orderId, patch) => {
    const nextPurchaseOrders = purchaseOrders.map((order) => (
      order.id === orderId ? normalizePurchaseOrder({ ...order, ...patch, updated_at: new Date().toISOString() }) : order
    ));
    setPurchaseOrders(nextPurchaseOrders);
    persistLocal(suppliers, products, logs, qcReviews, productionRecords, nextPurchaseOrders);
  };

  const renderOverview = () => {
    const approvedCount = Object.values(qcReviews).filter((review) => ['approved', 'production_ready'].includes(review.decision)).length;
    const poValue = purchaseOrders.reduce((sum, order) => sum + normalizePurchaseOrder(order).total_cost, 0);

    return (
      <section className="sup-overview">
        <SectionHeading
          eyebrow="Overview"
          title="Supplier Command Overview"
          copy="A cleaner snapshot of supplier readiness, manufacturing status, QC progress, and purchase orders."
        />
        <div className="sup-stats">
          <StatCard label="Suppliers" value={suppliers.length} detail="Directory records" icon={Factory} />
          <StatCard label="Pipeline Products" value={pipelineProducts.length} detail="AURA products in build" icon={PackageCheck} />
          <StatCard label="QC Approved" value={approvedCount} detail="Approved or production ready" icon={ShieldCheck} />
          <StatCard label="PO Value" value={formatMoney(poValue)} detail="Total production value" icon={Truck} />
        </div>
        <div className="sup-overview-actions">
          <button type="button" onClick={() => setActiveSection('directory')}>Open Suppliers</button>
          <button type="button" onClick={() => setActiveSection('pipeline')}>Review Pipeline</button>
          <button type="button" onClick={() => setActiveSection('send')}>Send Design</button>
          <button type="button" onClick={() => setActiveSection('samples')}>Sample Tracker</button>
          <button type="button" onClick={() => setActiveSection('po')}>Open PO Centre</button>
        </div>
      </section>
    );
  };

  const renderProductPipeline = () => (
    <>
      <SectionHeading
        eyebrow="Manufacturing"
        title="Manufacturing Pipeline"
        copy="AURA Product to reference imagery, production spec, supplier route, sample status, and production readiness."
      />
      <section className="sup-pipeline-hero">
        <div>
          <div className="sup-section-title">Product Manufacturing Pipeline</div>
          <p>AURA Product to reference imagery, production spec, supplier route, sample status, and production readiness.</p>
        </div>
        <div className="sup-pipeline-hero__stats">
          <StatCard label="Products in build" value={pipelineProducts.length} detail="Manufacturing specs tracked" icon={Factory} />
          <StatCard label="Samples active" value={pipelineProducts.filter((product) => ['sample_requested', 'sample_received'].includes(product.sample_status)).length} detail="Requested or received" icon={PackageCheck} />
          <StatCard label="Ready routes" value={pipelineProducts.filter((product) => product.production_status === 'production_ready').length} detail="Cleared for production" icon={Truck} />
        </div>
      </section>
      <section className="sup-product-pipeline">
        {pipelineProducts.map((spec) => (
          <ProductManufacturingCard
            key={spec.id}
            spec={spec}
            suppliersById={suppliersById}
            onViewSpec={setSelectedSpec}
            onSend={(item) => setSendContext({ spec: item })}
            onReferenceUpdate={updateReferenceSlot}
            onChooseAsset={openAssetPicker}
          />
        ))}
      </section>
    </>
  );

  const renderDirectory = () => (
    <>
      <SectionHeading
        eyebrow="Directory"
        title="Supplier Directory"
        copy="Browse suppliers with cleaner primary actions. Switch to detailed view when you need full notes, links, and category context."
        actions={(
          <div className="sup-view-toggle" aria-label="Supplier card view">
            {['compact', 'detailed'].map((mode) => (
              <button
                className={viewMode === mode ? 'active' : ''}
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
              >
                {mode === 'compact' ? 'Compact' : 'Detailed'}
              </button>
            ))}
          </div>
        )}
      />
      <section className={`sup-card-grid sup-card-grid--suppliers sup-card-grid--${viewMode}`}>
        {filteredSuppliers.map((supplier) => (
          <SupplierCard
            key={supplier.id}
            supplier={supplier}
            logs={logsBySupplier[supplier.id] || []}
            viewMode={viewMode}
            onView={setSelectedSupplier}
            onEdit={setSelectedSupplier}
            onEmail={(item) => setSendContext({ supplier: item })}
            onSpec={() => setActiveSection('specs')}
            onSample={requestSample}
            onApprove={markApproved}
            onDelete={deleteSupplier}
          />
        ))}
      </section>
    </>
  );

  const renderSpecs = () => (
    <>
      <SectionHeading
        eyebrow="Specs"
        title="Product Spec Library"
        copy="Manufacturing specs, preferred suppliers, backup suppliers, and supplier-ready send actions."
      />
      <section className="sup-card-grid sup-card-grid--specs">
        {products.map((spec) => (
          <ProductSpecCard
            key={spec.id}
            spec={spec}
            suppliersById={suppliersById}
            onView={setSelectedSpec}
            onSend={(item) => setSendContext({ spec: item })}
          />
        ))}
      </section>
    </>
  );

  const renderSend = () => (
    <section className="sup-panel sup-send-panel">
      <div>
        <div className="sup-section-title">Send Design to Supplier</div>
        <p>Select a supplier and product spec, then generate a production-ready email with material, colour, logo, typography, finish, sizing, accuracy notes, and reference URLs.</p>
      </div>
      <button type="button" onClick={() => setSendContext({})}><Send size={16} />Launch workflow</button>
    </section>
  );

  const renderContacts = () => (
    <>
      <SectionHeading
        eyebrow="Outreach"
        title="Contact Tracker"
        copy="Supplier outreach, responses, quotes, sample invoices, payment status, and follow-up dates."
      />
      <SupplierContactTracker
        logs={logs}
        suppliers={suppliers}
        products={products}
        onAdd={addContactRecord}
        onUpdate={updateContactRecord}
        onDelete={deleteContactRecord}
      />
    </>
  );

  const renderSamples = () => (
    <section className="sup-panel">
      <div className="sup-section-title">Sample Tracker</div>
      <div className="sup-tracker">
        {suppliers
          .filter((supplier) => ['sample_requested', 'sample_received', 'approved', 'rejected'].includes(supplier.status))
          .map((supplier) => (
            <div className="sup-tracker__row" key={supplier.id}>
              <strong>{supplier.name}</strong>
              <span>{supplier.type}</span>
              <span>{supplier.best_for}</span>
              <Pill tone={statusTone(supplier.status)}>{supplierStatusLabels[supplier.status]}</Pill>
              <button type="button" onClick={() => setSelectedSupplier(supplier)}>Review</button>
            </div>
          ))}
      </div>
    </section>
  );

  const renderQc = () => (
    <>
      <SectionHeading
        eyebrow="Sample QC"
        title="QC Review"
        copy="Score sample accuracy, record supplier media, and decide whether each product moves toward production."
      />
      <QcSampleReviewCentre
        products={pipelineProducts}
        reviews={qcReviews}
        onUpdate={updateQcReview}
      />
    </>
  );

  const renderProduction = () => (
    <>
      <SectionHeading
        eyebrow="Production"
        title="Production Dashboard"
        copy="Readiness, next actions, supplier status, QC status, and production notes in one place."
      />
      <ProductionDashboard
        products={pipelineProducts}
        suppliersById={suppliersById}
        logs={logs}
        reviews={qcReviews}
        productionRecords={productionRecords}
        onUpdate={updateProductionRecord}
      />
    </>
  );

  const renderPurchaseOrders = () => (
    <>
      <SectionHeading
        eyebrow="Purchase Orders"
        title="Purchase Orders"
        copy="Create and track approved-product POs from draft through delivery and completion."
      />
      <PurchaseOrderCentre
        products={pipelineProducts}
        suppliersById={suppliersById}
        reviews={qcReviews}
        productionRecords={productionRecords}
        purchaseOrders={purchaseOrders}
        onCreate={createPurchaseOrderRecord}
        onUpdate={updatePurchaseOrderRecord}
      />
    </>
  );

  return (
    <div className="sup-admin">
      <aside className="sup-sidebar">
        <div className="sup-brand">
          <button type="button" onClick={() => navigate('/admin')}><ArrowLeft size={14} />Admin</button>
          <div className="sup-brand__name">AURA</div>
          <div className="sup-brand__sub">Supplier Command Centre</div>
        </div>
        <nav>
          {navItems.map((item) => (
            <button
              className={activeSection === item.id ? 'active' : ''}
              key={item.id}
              type="button"
              onClick={() => setActiveSection(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
            <div className="sup-storage-note">
          <span>Local workspace</span>
          <small>LocalStorage manufacturing command data</small>
        </div>
      </aside>

      <main className="sup-main">
        <header className="sup-header">
          <div>
            <div className="sup-kicker">Backend production system</div>
            <h1>Admin Supplier Command Centre</h1>
          </div>
          <div className="sup-filters">
            <label className="sup-search">
              <Search size={15} />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search suppliers, notes, categories" />
            </label>
            <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
              <option value="">All types</option>
              {SUPPLIER_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="">All statuses</option>
              {SUPPLIER_STATUSES.map((status) => <option key={status} value={status}>{supplierStatusLabels[status]}</option>)}
            </select>
          </div>
        </header>

        <div className="sup-content">
          {loading ? <div className="sup-empty">Loading supplier command data...</div> : null}
          {!loading ? (
            <BackendStatusPanel
              supplierCount={suppliers.length}
              productCount={products.length}
              logCount={logs.length}
              lastSavedLocally={lastSavedLocally}
            />
          ) : null}
          {!loading && activeSection === 'overview' ? renderOverview() : null}
          {!loading && activeSection === 'pipeline' ? renderProductPipeline() : null}
          {!loading && activeSection === 'directory' ? renderDirectory() : null}
          {!loading && activeSection === 'specs' ? renderSpecs() : null}
          {!loading && activeSection === 'send' ? renderSend() : null}
          {!loading && activeSection === 'contacts' ? renderContacts() : null}
          {!loading && activeSection === 'samples' ? renderSamples() : null}
          {!loading && activeSection === 'qc' ? renderQc() : null}
          {!loading && activeSection === 'production' ? renderProduction() : null}
          {!loading && activeSection === 'po' ? renderPurchaseOrders() : null}
        </div>
      </main>

      <SupplierDrawer
        supplier={selectedSupplier}
        logs={selectedSupplier ? logsBySupplier[selectedSupplier.id] || [] : []}
        onClose={() => setSelectedSupplier(null)}
        onUpdateStatus={updateSupplierStatus}
        onCopyEmail={copyText}
      />
      <SpecDrawer
        spec={selectedSpec}
        suppliersById={suppliersById}
        onClose={() => setSelectedSpec(null)}
        onSend={(spec) => setSendContext({ spec })}
      />
      {sendContext ? (
        <SendDesignModal
          suppliers={suppliers}
          specs={products}
          initialSupplier={sendContext.supplier}
          initialSpec={sendContext.spec}
          onClose={() => setSendContext(null)}
          onCopy={copyText}
          onSaveLog={async (supplier, spec, email) => {
            await saveContactLog(supplier, spec, email);
            setSendContext(null);
          }}
        />
      ) : null}
      {assetPicker ? (
        <AssetPickerModal
          spec={products.find((product) => product.id === assetPicker.productId)}
          slotIndex={assetPicker.slotIndex}
          assets={assetCandidates}
          loading={assetCandidatesLoading}
          onClose={() => setAssetPicker(null)}
          onSelect={selectAssetForReferenceSlot}
        />
      ) : null}
      {toast ? <div className="sup-toast">{toast}</div> : null}
    </div>
  );
}
