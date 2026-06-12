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
import '../styles/admin-suppliers.css';

const STORAGE_KEY = 'aura_supplier_command_centre_v1';

const navItems = [
  { id: 'pipeline', label: 'Product Pipeline' },
  { id: 'directory', label: 'Directory' },
  { id: 'specs', label: 'Spec Library' },
  { id: 'send', label: 'Send Design' },
  { id: 'samples', label: 'Samples' },
  { id: 'production', label: 'Production' },
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

function mergeById(seedRows, savedRows = []) {
  const savedById = Object.fromEntries(savedRows.map((row) => [row.id, row]));
  return seedRows.map((seed) => ({ ...seed, ...(savedById[seed.id] || {}) }));
}

function readLocalData() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        suppliers: mergeById(seededSuppliers, parsed.suppliers || []),
        products: mergeById(seededProductSpecs, parsed.products || []),
        logs: parsed.logs || seededContactLogs,
        lastSavedLocally: parsed.lastSavedLocally || null,
      };
    }
  } catch {
    // Local storage is best-effort only.
  }
  return {
    suppliers: seededSuppliers,
    products: seededProductSpecs,
    logs: seededContactLogs,
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

function makeLogId() {
  return `log-${Date.now()}-${Math.random().toString(16).slice(2)}`;
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

function SupplierCard({ supplier, logs, onView, onEmail, onSpec, onSample, onApprove, onEdit }) {
  return (
    <article className="sup-card">
      <div className="sup-card__head">
        <div>
          <div className="sup-card__name">{supplier.name}</div>
          <div className="sup-card__meta">{supplier.country} / {supplier.moq}</div>
        </div>
        <Pill tone={supplier.type.toLowerCase()}>{supplier.type}</Pill>
      </div>

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
      <p className="sup-card__best">{supplier.best_for}</p>
      <p className="sup-card__notes">{supplier.notes}</p>

      <div className="sup-card__footer">
        <Pill tone={statusTone(supplier.status)}>{supplierStatusLabels[supplier.status]}</Pill>
        <span>{supplier.sample_available ? 'Sample available' : 'No sample listed'}</span>
        <span>{formatDate(supplier.last_contacted)}</span>
        <span>{logs.length} logs</span>
      </div>

      <div className="sup-actions">
        <button type="button" onClick={() => onView(supplier)}><Eye size={14} />View</button>
        <button type="button" onClick={() => onEdit(supplier)}><PenLine size={14} />Edit</button>
        <button type="button" onClick={() => onEmail(supplier)}><Mail size={14} />Email</button>
        <button type="button" onClick={() => onSpec(supplier)}><PackageCheck size={14} />Add Spec</button>
        <button type="button" onClick={() => onSample(supplier)}><Send size={14} />Sample</button>
        <button type="button" onClick={() => onApprove(supplier)}><Check size={14} />Approve</button>
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
  if (spec.reference_image_slots?.length) return spec.reference_image_slots;
  return (spec.reference_image_urls || []).map((url, index) => ({ label: `Reference ${index + 1}`, url }));
}

function ProductManufacturingCard({ spec, suppliersById, onViewSpec, onSend }) {
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
        {refs.map((ref) => (
          <a href={ref.url} target="_blank" rel="noreferrer" key={`${spec.id}-${ref.label}`}>
            <span>{ref.label}</span>
            <strong>{ref.url}</strong>
          </a>
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
        <span>Manufacturing notes</span>
        <p>{spec.manufacturing_notes}</p>
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
          <h3>Reference image URLs</h3>
          <div className="sup-ref-list">
            {spec.reference_image_urls.map((url) => <a key={url} href={url} target="_blank" rel="noreferrer">{url}</a>)}
          </div>
        </div>
        {fields.map(([label, value]) => (
          <div className="sup-drawer__block" key={label}>
            <h3>{label}</h3>
            <p>{value}</p>
          </div>
        ))}
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

export default function AdminSuppliers() {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [activeSection, setActiveSection] = useState('pipeline');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [selectedSpec, setSelectedSpec] = useState(null);
  const [sendContext, setSendContext] = useState(null);
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(true);
  const [lastSavedLocally, setLastSavedLocally] = useState(null);

  const showToast = useCallback((message) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2400);
  }, []);

  const persistLocal = useCallback((nextSuppliers, nextProducts, nextLogs) => {
    const savedAt = writeLocalData({ suppliers: nextSuppliers, products: nextProducts, logs: nextLogs });
    setLastSavedLocally(savedAt);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    const local = readLocalData();
    window.setTimeout(() => {
      setSuppliers(local.suppliers);
      setProducts(local.products);
      setLogs(local.logs);
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
    const log = {
      id: makeLogId(),
      supplier_id: supplier.id,
      product_spec_id: spec.id,
      contact_type: contactType,
      subject: email.subject,
      body: email.body,
      created_at: new Date().toISOString(),
    };
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

  const renderProductPipeline = () => (
    <>
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
          />
        ))}
      </section>
    </>
  );

  const renderDirectory = () => (
    <section className="sup-card-grid">
      {filteredSuppliers.map((supplier) => (
        <SupplierCard
          key={supplier.id}
          supplier={supplier}
          logs={logsBySupplier[supplier.id] || []}
          onView={setSelectedSupplier}
          onEdit={setSelectedSupplier}
          onEmail={(item) => setSendContext({ supplier: item })}
          onSpec={() => setActiveSection('specs')}
          onSample={requestSample}
          onApprove={markApproved}
        />
      ))}
    </section>
  );

  const renderSpecs = () => (
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

  const renderProduction = () => (
    <section className="sup-panel">
      <div className="sup-section-title">Production Tracker</div>
      <div className="sup-tracker">
        {products.map((spec) => (
          <div className="sup-tracker__row" key={spec.id}>
            <strong>{spec.product_name}</strong>
            <span>{spec.category}</span>
            <span>{suppliersById[spec.preferred_supplier_id]?.name || 'Unassigned'}</span>
            <Pill tone={statusTone(spec.status)}>{supplierStatusLabels[spec.status] || spec.status}</Pill>
            <button type="button" onClick={() => setSelectedSpec(spec)}>Spec</button>
          </div>
        ))}
      </div>
    </section>
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
          {!loading && activeSection === 'pipeline' ? renderProductPipeline() : null}
          {!loading && activeSection === 'directory' ? renderDirectory() : null}
          {!loading && activeSection === 'specs' ? renderSpecs() : null}
          {!loading && activeSection === 'send' ? renderSend() : null}
          {!loading && activeSection === 'samples' ? renderSamples() : null}
          {!loading && activeSection === 'production' ? renderProduction() : null}
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
      {toast ? <div className="sup-toast">{toast}</div> : null}
    </div>
  );
}
