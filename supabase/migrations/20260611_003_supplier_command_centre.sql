-- ============================================================
-- Migration 003: Supplier Command Centre
-- Applied: 2026-06-11
-- ============================================================

CREATE TABLE IF NOT EXISTS suppliers (
  id                 TEXT PRIMARY KEY,
  name               TEXT NOT NULL,
  type               TEXT NOT NULL CHECK (type IN ('POD','OEM','LOCAL','PACKAGING','ACCESSORIES')),
  website            TEXT DEFAULT '',
  contact_email      TEXT DEFAULT '',
  country            TEXT DEFAULT '',
  product_categories JSONB DEFAULT '[]',
  moq                TEXT DEFAULT '',
  sample_available   BOOLEAN DEFAULT false,
  best_for           TEXT DEFAULT '',
  notes              TEXT DEFAULT '',
  status             TEXT NOT NULL DEFAULT 'not_contacted'
    CHECK (status IN ('not_contacted','contacted','sample_requested','sample_received','approved','rejected','production_ready')),
  last_contacted     DATE,
  created_at         TIMESTAMPTZ DEFAULT now(),
  updated_at         TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS supplier_products (
  id                    TEXT PRIMARY KEY,
  product_name          TEXT NOT NULL,
  category              TEXT NOT NULL,
  supplier_type_needed  TEXT NOT NULL CHECK (supplier_type_needed IN ('POD','OEM','LOCAL','PACKAGING','ACCESSORIES')),
  preferred_supplier_id TEXT REFERENCES suppliers(id) ON DELETE SET NULL,
  backup_supplier_id    TEXT REFERENCES suppliers(id) ON DELETE SET NULL,
  reference_image_urls  JSONB DEFAULT '[]',
  material              TEXT DEFAULT '',
  fabric_weight_gsm     TEXT DEFAULT '',
  colourway             TEXT DEFAULT '',
  logo_placement        TEXT DEFAULT '',
  typography_notes      TEXT DEFAULT '',
  hardware              TEXT DEFAULT '',
  sole_padding_stitching TEXT DEFAULT '',
  finish                TEXT DEFAULT '',
  sizing                TEXT DEFAULT '',
  packaging             TEXT DEFAULT '',
  accuracy_notes        TEXT DEFAULT '',
  manufacturing_notes   TEXT DEFAULT '',
  target_price          TEXT DEFAULT '',
  target_moq            TEXT DEFAULT '',
  status                TEXT NOT NULL DEFAULT 'not_contacted',
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS supplier_contact_logs (
  id              TEXT PRIMARY KEY,
  supplier_id     TEXT NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  product_spec_id TEXT REFERENCES supplier_products(id) ON DELETE SET NULL,
  contact_type    TEXT NOT NULL DEFAULT 'email',
  subject         TEXT DEFAULT '',
  body            TEXT DEFAULT '',
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE OR REPLACE TRIGGER trg_suppliers_updated
  BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE OR REPLACE TRIGGER trg_supplier_products_updated
  BEFORE UPDATE ON supplier_products FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_suppliers_status ON suppliers(status);
CREATE INDEX IF NOT EXISTS idx_suppliers_type ON suppliers(type);
CREATE INDEX IF NOT EXISTS idx_supplier_products_status ON supplier_products(status);
CREATE INDEX IF NOT EXISTS idx_supplier_contact_logs_supplier ON supplier_contact_logs(supplier_id);

ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_contact_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all_suppliers" ON suppliers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_supplier_products" ON supplier_products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_supplier_contact_logs" ON supplier_contact_logs FOR ALL USING (true) WITH CHECK (true);

INSERT INTO suppliers
  (id, name, type, website, contact_email, country, product_categories, moq, sample_available, best_for, notes, status, last_contacted)
VALUES
  ('infinitude-fight','Infinitude Fight','OEM','https://infinitudefight.com','sales@infinitudefight.com','Pakistan','["Boxing Gloves","Fightwear","Accessories"]','50-100 units',true,'Premium boxing gloves and fightwear sampling','Strong fit for custom gloves, wraps, and technical fight equipment. Request leather, lining, padding stack, and wrist closure details.','sample_requested','2026-06-04'),
  ('rakhra-international','Rakhra International','OEM','https://rakhrainternational.com','info@rakhrainternational.com','Pakistan','["Boxing Gloves","Protective Gear","Fightwear"]','100 units',true,'Gloves, pads, and custom combat sports manufacturing','Useful OEM comparison supplier for gloves and protective equipment. Confirm logo tooling costs and PU versus leather options.','contacted','2026-06-02'),
  ('unida-sports','Unida Sports','OEM','https://unidasports.com','info@unidasports.com','Pakistan','["Boxing Gloves","Training Gear","Apparel"]','50-150 units',true,'Boxing gloves and gym-ready fight club equipment','Ask for foam density, palm ventilation options, and minimums for cream colourways.','not_contacted',null),
  ('goated-pro','Goated Pro','OEM','https://goatedpro.com','info@goatedpro.com','Pakistan','["Boxing Gloves","Fight Boots","MMA Gear"]','100 units',true,'Combat sports silhouettes and fight boot exploration','Potential for gloves and boots. Confirm ability to match AURA cream/black restraint without loud contrast panels.','not_contacted',null),
  ('lasani-sports','Lasani Sports','OEM','https://lasanisports.com','sales@lasanisports.com','Pakistan','["Boxing Gloves","Sportswear","Bags"]','100 units',true,'OEM backup across fight gear and sportswear','Good backup for gloves and accessories. Ask for current export references and sample lead time.','not_contacted',null),
  ('walknice','WalkNice','OEM','https://walknice.com','info@walknice.com','China','["Footwear","Fight Boots","Sneaker Components"]','300-500 pairs',true,'Fight boot sole, upper, and outsole development','Use for the cream and black fight boot program. Confirm last development, outsole moulding, lace loops, and ankle support.','sample_received','2026-06-05'),
  ('portugal-textile','Portugal Textile','LOCAL','https://portugaltextile.com','hello@portugaltextile.com','Portugal','["Apparel","Hoodies","Tracksuits","Tees"]','50-100 units',true,'European small-batch premium apparel','Good local route for heavyweight tees, sleeveless hoodies, tracksuits, and premium QC.','approved','2026-06-06'),
  ('groovecolor','Groovecolor','POD','https://groovecolor.com','support@groovecolor.com','Portugal','["POD Apparel","Print","Sampling"]','1 unit',true,'Fast apparel print tests and colour proofing','Use to validate graphics, typography scale, and cream/black print contrast before OEM production.','contacted','2026-06-01'),
  ('mth-sports','MTH Sports','ACCESSORIES','https://mthsports.com','sales@mthsports.com','Pakistan','["Accessories","Skipping Ropes","Mouthguards","Wraps"]','100 units',true,'AURA accessories and fight club kit add-ons','Ask for wraps, skipping rope handles, mouthguard case options, and packaging compatibility.','not_contacted',null),
  ('printful','Printful','POD','https://www.printful.com','support@printful.com','Global','["POD Apparel","Print","Fulfilment"]','1 unit',true,'POD validation and ecommerce fulfilment tests','Use for low-risk tee and hoodie concept checks. Not final for premium cut-and-sew silhouettes.','production_ready','2026-05-29'),
  ('gelato','Gelato','POD','https://www.gelato.com','support@gelato.com','Global','["POD Apparel","Print","Fulfilment"]','1 unit',true,'EU print routing and fast market tests','Useful POD comparison for EU customer delivery and early brand validation.','not_contacted',null),
  ('printify','Printify','POD','https://printify.com','merchantsupport@printify.com','Global','["POD Apparel","Print","Fulfilment"]','1 unit',true,'POD supplier network comparisons','Use to compare blank garments, fulfilment geography, and print quality for basic merch tests.','not_contacted',null)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  website = EXCLUDED.website,
  contact_email = EXCLUDED.contact_email,
  country = EXCLUDED.country,
  product_categories = EXCLUDED.product_categories,
  moq = EXCLUDED.moq,
  sample_available = EXCLUDED.sample_available,
  best_for = EXCLUDED.best_for,
  notes = EXCLUDED.notes;

INSERT INTO supplier_products
  (id, product_name, category, supplier_type_needed, preferred_supplier_id, backup_supplier_id, reference_image_urls, material, fabric_weight_gsm, colourway, logo_placement, typography_notes, hardware, sole_padding_stitching, finish, sizing, packaging, accuracy_notes, manufacturing_notes, target_price, target_moq, status)
VALUES
  ('aura-premium-boxing-gloves','AURA Premium Boxing Gloves','Equipment','OEM','infinitude-fight','rakhra-international','["/assets/products/aura-cream-boxing-gloves/card-product.webp","/assets/products/aura-cream-boxing-gloves/gallery-03.webp"]','Premium matte leather or high-grade microfiber leather with soft-touch lining','N/A','Warm cream body, off-white palm, muted black detail option','Debossed or tonal AURA wrist mark, small outer glove wordmark','Minimal uppercase AURA wordmark, no oversized sponsor-style typography','Wide wrist strap, low-glare hook and loop, reinforced pull tab','Layered latex/EVA foam, firm knuckle protection, clean double stitching','Matte, premium, restrained, no glossy synthetic sheen','10oz, 12oz, 14oz, 16oz','Black rigid box or drawstring bag with off-white AURA mark','Must feel premium and quiet, not like generic bright boxing equipment','Request foam stack breakdown, sample leather swatches, stitch test photos, and wrist closure options','GBP 28-38 landed','100 pairs','sample_requested'),
  ('aura-cream-fight-boots','AURA Cream Fight Boots','Footwear','OEM','walknice','goated-pro','["/assets/products/aura-cream-fight-boots/card-product.webp","/assets/products/aura-cream-fight-boots/gallery-01.webp"]','Lightweight synthetic leather and breathable mesh upper','N/A','Cream upper, off-white sole, muted silver hardware accents','Small side AURA wordmark, tonal heel tab mark','Technical but understated, no aggressive contrast typography','Flat laces, reinforced lace loops, ankle collar support','Thin grippy boxing outsole, pivot-friendly tread, cushioned insole','Matte cream with clean edge paint and precise panels','UK 5-12','Black boot box with cream tissue wrap and size sticker','Must look like a fight boot, not a lifestyle sneaker','Request outsole mould options, weight per boot, ankle collar sample, and flex test notes','GBP 35-48 landed','300 pairs','sample_received'),
  ('aura-black-fight-boots','AURA Black Fight Boots','Footwear','OEM','walknice','goated-pro','["/assets/aura-scroll/05_drop_001_tools_uniform/frame_06_black_boots_product.png"]','Black synthetic leather, breathable mesh, padded ankle collar','N/A','Deep black with muted charcoal and off-white micro branding','Tonal AURA side mark and small heel tab','Subtle, technical, premium fight club restraint','Black flat laces, reinforced eyelets, heel pull tab','Low-profile boxing outsole, reinforced sidewall stitching','Matte black, no high-gloss panels','UK 5-12','Black boot box, off-white internal label, dust bag optional','Should be sharp under ring lights but still minimalist','Share cream boot last if approved; confirm black material match and sole compound','GBP 35-48 landed','300 pairs','not_contacted'),
  ('aura-heavyweight-oversized-tee','AURA Heavyweight Oversized Tee','Apparel','LOCAL','portugal-textile','printful','["/assets/aura-live/campaign/campaign-tee.png"]','Heavyweight cotton jersey, enzyme washed','240-280 GSM','Washed black, cream, off-white','Small chest wordmark, optional large back fight club mark','Editorial spacing, clean uppercase, no distressed fonts','N/A','Double-needle hems, reinforced collar rib','Soft washed handfeel with structured drape','XS-XXL oversized fit','Folded in matte recyclable polybag or kraft wrap with sticker','Fit must feel heavyweight and premium, not basic merch','Request size spec, shrinkage test, neck rib recovery, and print method options','GBP 9-14 landed','100 units','approved'),
  ('aura-sleeveless-zip-hoodie','AURA Sleeveless Zip Hoodie','Apparel','LOCAL','portugal-textile','groovecolor','["/assets/products/aura-sleeveless-hoodie/card-product.webp","/assets/products/aura-sleeveless-hoodie/gallery-02.webp"]','Heavy cotton fleece or brushed loopback','380-450 GSM','Black, cream lining option','Small chest AURA mark, back neck mark, tonal zipper pull detail','Minimal wordmark only; garment silhouette should carry the design','Two-way black metal zipper, drawcord tips optional','Clean armhole binding, reinforced pocket seams','Premium matte fleece, structured hood, cropped athletic shape','XS-XXL','Folded tissue wrap, black garment bag optional','Must look training-luxury, not a cut-off hoodie','Request prototype photos on body, zipper sample, and hood structure details','GBP 18-28 landed','100 units','contacted'),
  ('aura-tracksuit','AURA Tracksuit','Apparel','LOCAL','portugal-textile','lasani-sports','["/assets/aura-live/campaign/campaign-trackjacket.png","/assets/aura-scroll/07_fight_club_close/frame_04_fight_club_tracksuit_ring.png"]','Double-knit performance jersey or premium interlock','300-360 GSM','Black with off-white piping option','Small chest mark, thigh mark, back collar label','Fight club restraint; avoid football tracksuit styling','Zip jacket, zipped pockets, elasticated waistband, drawcord','Panel seams must be clean and symmetrical','Matte technical finish, quiet luxury training uniform','XS-XXL, regular athletic fit','Set bag with size and colour sticker','Top and bottom must match black shade exactly','Request full size spec, fabric photos, zipper options, and set MOQ','GBP 30-45 landed','100 sets','not_contacted'),
  ('aura-sauna-suit','AURA Sauna Suit','Apparel','OEM','lasani-sports','unida-sports','["/assets/products/aura-sauna-suit/manifest.json"]','Sweat-enhancing coated polyester or technical nylon','120-180 GSM','Black shell, muted silver internal print option','Small chest mark, sleeve mark, pant thigh mark','Technical training language only, no loud slogans','Elastic cuffs, adjustable waist, lightweight zip','Sealed or reinforced seams for sweat sessions','Matte crinkle technical finish, no plastic shine if possible','XS-XXL','Reusable zip pouch with care card','Must feel intentional and athletic, not disposable sauna wear','Request fabric coating spec, care testing, seam strength, and breathability limitations','GBP 16-26 landed','100 units','not_contacted')
ON CONFLICT (id) DO UPDATE SET
  product_name = EXCLUDED.product_name,
  category = EXCLUDED.category,
  supplier_type_needed = EXCLUDED.supplier_type_needed,
  preferred_supplier_id = EXCLUDED.preferred_supplier_id,
  backup_supplier_id = EXCLUDED.backup_supplier_id,
  reference_image_urls = EXCLUDED.reference_image_urls,
  material = EXCLUDED.material,
  fabric_weight_gsm = EXCLUDED.fabric_weight_gsm,
  colourway = EXCLUDED.colourway,
  logo_placement = EXCLUDED.logo_placement,
  typography_notes = EXCLUDED.typography_notes,
  hardware = EXCLUDED.hardware,
  sole_padding_stitching = EXCLUDED.sole_padding_stitching,
  finish = EXCLUDED.finish,
  sizing = EXCLUDED.sizing,
  packaging = EXCLUDED.packaging,
  accuracy_notes = EXCLUDED.accuracy_notes,
  manufacturing_notes = EXCLUDED.manufacturing_notes,
  target_price = EXCLUDED.target_price,
  target_moq = EXCLUDED.target_moq;

INSERT INTO supplier_contact_logs
  (id, supplier_id, product_spec_id, contact_type, subject, body, created_at)
VALUES
  ('log-infinitude-gloves-sample','infinitude-fight','aura-premium-boxing-gloves','sample_request','AURA Premium Boxing Gloves - sample request','Requested glove sample pricing, foam stack details, material swatches, and wrist closure options.','2026-06-04T10:30:00.000Z'),
  ('log-walknice-boots-followup','walknice','aura-cream-fight-boots','sample_received','AURA Cream Fight Boots - sample review','Logged first sample as received. Need outsole grip notes, colour correction, and ankle support improvements.','2026-06-05T14:15:00.000Z')
ON CONFLICT (id) DO NOTHING;
