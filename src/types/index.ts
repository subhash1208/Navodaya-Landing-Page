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

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  productCount: number;
}

// Navigation
export interface NavLink {
  label: string;
  href: string;
}


