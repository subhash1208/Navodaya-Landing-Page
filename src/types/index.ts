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

export interface AnimationState {
  isLoading: boolean;
  showPopup: boolean;
  showContent: boolean;
}