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
export interface ProductItem {
  id: string;
  name: string;
  category: ProductCategory;
  material?: string;
  description: string;
  slug: string;
}

/** The catalogue's three fixed categories. Widening this forces every rule map to be updated. */
export type CategorySlug = 'hygiene-safety' | 'hotel-amenities' | 'spa-salon';

export interface ProductCategory {
  id: string;
  name: string;
  slug: CategorySlug;
  description: string;
  icon: string;
}

// Navigation
export interface NavLink {
  label: string;
  href: string;
}
