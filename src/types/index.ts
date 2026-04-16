// App-level state
export type AppScreen = 'loading' | 'popup' | 'main' | 'contact';

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
  icon: string;
  description: string;
}

// Navigation
export interface NavLink {
  label: string;
  href: string;
}

// Animation
export interface AnimationState {
  isLoading: boolean;
  showPopup: boolean;
  showContent: boolean;
}
