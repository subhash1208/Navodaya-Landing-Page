// Form
export interface ContactFormData {
  productName: string;
  quantity: string;
  companyName: string;
  /** Optional on the form, so this is `''` when the visitor gave no address. Never absent: the
   *  key must stay present for `ContactFieldName` and the server's `FIELD_LIMITS` record. */
  companyEmail: string;
  contactPersonName: string;
  contactPersonDesignation: string;
  contactPersonNumber: string;
  message: string;
}

// Products

/**
 * One purchasable option of a product — a model, a pack size, a colour, a fragrance, or a
 * material.
 *
 * `label` is the pre-composed human-readable form (e.g. `'500 ML — Lavender'`); the other keys
 * are the dimensions that label was built from. Two of them are the selection axes the product
 * page renders, and the rest are present only when the source catalogue recorded them.
 *
 * The UI derives its two rows from exactly two fields, so populate accordingly:
 * primary axis = `model`; secondary axis = `colour ?? fragrance`; and the colours offered for a
 * selected model are the distinct `colour` values across the variants sharing that `model`.
 */
export interface ProductVariant {
  /** Pre-composed display string. Never derived from the fields below — it is the source of truth. */
  label: string;
  /**
   * Primary selection axis — the model, fitting, capacity or size the buyer picks first.
   *
   * REQUIRED, not optional, and that is the whole point: the product page's primary selector row
   * must never be empty, so there is no such thing as a variant with nothing to pick. Where the
   * source named no model at all, this is the `label` verbatim — `Elephant` is stored as
   * `model: 'Elephant'` with no `colour`, which the UI renders as a one-chip row with no colour
   * row beneath it. Populated by `dev-tools/catalogue/_models.py`; never hand-written.
   */
  model: string;
  /**
   * Secondary selection axis, narrowed by the selected `model`. Absent when the source named no
   * colour, so a model with no colours correctly offers no colour choice rather than an empty row.
   * Only ever a literal colour the source recorded — a finish (`Printed`) or a shape word (`Wide`)
   * is never promoted into this field.
   */
  colour?: string;
  size?: string;
  fragrance?: string;
  material?: string;
  /**
   * Per-variant photograph under `public/`. Currently absent on every variant — no per-variant
   * photos exist yet — so the UI must render a named placeholder whenever it is missing. The key
   * is declared now so real photographs drop in later without a second schema change.
   */
  image?: string;
}

/**
 * An independent axis of choice for a product whose options are NOT a fixed list of
 * discrete models — e.g. a cleaning concentrate sold in 3 sizes and 6 fragrances.
 *
 * Deliberately distinct from `variants`. A product carries one or the other, never both:
 * `variants` is a closed list of real SKUs the supplier named, whereas axes are independent
 * dimensions whose combinations the source never asserted as stocked. Multiplying axes into
 * `variants` is exactly the fabrication this type exists to prevent.
 */
export interface ProductOptionAxis {
  /** Display name of the dimension, e.g. 'Size', 'Fragrance', 'Colour', 'Material'. */
  name: string;
  /** The values offered on this axis, in source order. Never empty. */
  values: string[];
}

export interface ProductItem {
  id: string;
  name: string;
  category: ProductCategory;
  /** Only `hygiene-safety-housekeeping` products carry one — it is the only category subdivided. */
  subCategory?: SubCategorySlug;
  /**
   * A second category this product must also be listed under. Three products are genuinely sold
   * into two markets (a shower cap is both a hotel amenity and a salon consumable), so anything
   * that filters or counts by category has to consult this key as well as `category` — otherwise
   * those products silently vanish from one of their two listings.
   */
  secondaryCategory?: CategorySlug;
  material?: string;
  /** Absent for most products. Never length 0; occasionally length 1. Always access safely. */
  variants?: ProductVariant[];
  /**
   * Independent option dimensions, for products whose source listed two or more attribute
   * lists separately rather than naming discrete SKUs. Mutually exclusive with `variants`.
   */
  optionAxes?: ProductOptionAxis[];
  /**
   * Optional: the client's catalogue supplies no product copy, and inventing 164 descriptions is a
   * separate client-facing task. Render `productSummary()` rather than this field directly.
   */
  description?: string;
  /**
   * Path to the product photograph under `public/`, e.g. `/products/mop-set.webp`. Populated for
   * the photographed subset only — most of the catalogue has no approved photo yet — so every
   * consumer must keep the typographic placeholder as its fallback.
   */
  image?: string;
  slug: string;
}

/** The catalogue's four fixed categories. Widening this forces every rule map to be updated. */
export type CategorySlug =
  | 'hygiene-safety-housekeeping'
  | 'hotel-amenities'
  | 'spa-salon'
  | 'protective-packing';

/** Subdivisions of `hygiene-safety-housekeeping`, the only category large enough to need them. */
export type SubCategorySlug =
  | 'personal-protection'
  | 'disposable-linen'
  | 'air-care'
  | 'cleaning-chemicals'
  | 'brushes-scrubbers-cloths'
  | 'mops-brooms-wipers'
  | 'equipment-accessories'
  | 'dust-bins-waste'
  | 'dispensers-washroom'
  | 'tissues-paper';

export interface ProductCategory {
  id: string;
  name: string;
  slug: CategorySlug;
  description: string;
  /**
   * Public path of the category's specimen plate photograph. Optional: `protective-packing` has
   * no plate yet, and its card falls back to a typographic tile of the same aspect ratio.
   */
  plate?: string;
}

export interface SubCategory {
  slug: SubCategorySlug;
  name: string;
  description: string;
}

// Navigation
export interface NavLink {
  label: string;
  href: string;
}
