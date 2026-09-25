// Form
export interface ContactFormData {
  productName: string;
  quantity: string;
  companyName: string;
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
