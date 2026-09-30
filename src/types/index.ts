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
 * One purchasable option of a product — a pack size, a colour, a fragrance, or a material.
 *
 * `label` is the only guaranteed key and is the pre-composed human-readable form (e.g.
 * `'500 ML — Lavender'`); the other four are the dimensions that label was built from and are
 * present only when the source catalogue recorded them.
 */
export interface ProductVariant {
  label: string;
  size?: string;
  colour?: string;
  fragrance?: string;
  material?: string;
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
   * Optional: the client's catalogue supplies no product copy, and inventing 164 descriptions is a
   * separate client-facing task. Render `productSummary()` rather than this field directly.
   */
  description?: string;
  /** Reserved for the photo-extraction stage. Unpopulated today, so cards must render a placeholder. */
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
