export const SECTION_IDS = {
  HOME: 'home',
  ABOUT: 'about',
  PRODUCTS: 'products',
  CONTACT: 'contact',
} as const;

export const ANIMATION = {
  DURATION: {
    MICRO: 150,
    COMPONENT: 300,
    PAGE: 700,
    LOADING: 3000,
  },
  STAGGER: 80,
  THRESHOLD: 0.15,
  ROOT_MARGIN: '-50px 0px',
} as const;

export const BRAND = {
  NAME: 'Navodaya',
  FULL_NAME: 'Navodaya Industries and Care Kits',
  TAGLINE: 'Your Trusted Partner in Progress and Care',
  EMAIL: 'info@navodaya.group',
  PHONE: '+91 XXXXX XXXXX',
  LOCATION: 'India',
} as const;

export const PRODUCTS = [
  { id: 'paper-cups',    name: 'Paper Cups',    icon: '🥤', description: 'Eco-friendly disposable cups for hot and cold beverages. Available in multiple sizes for all occasions.' },
  { id: 'garbage-bags',  name: 'Garbage Bags',  icon: '🗑️', description: 'Heavy-duty waste disposal bags with superior strength. Leak-proof and tear-resistant for industrial use.' },
  { id: 'cable-ties',    name: 'Cable Ties',    icon: '🔗', description: 'Durable nylon cable ties for secure bundling. Heat and UV resistant for indoor and outdoor applications.' },
  { id: 'beard-masks',   name: 'Beard Masks',   icon: '😷', description: 'Hygienic disposable beard covers for food and medical industries. Breathable and comfortable fit.' },
  { id: 'shoe-covers',   name: 'Shoe Covers',   icon: '👟', description: 'Non-slip disposable shoe protectors for clean environments. Waterproof and dust-proof design.' },
  { id: 'latex-gloves',  name: 'Latex Gloves',  icon: '🧤', description: 'Premium quality latex gloves for medical and industrial use. Powder-free with excellent grip.' },
] as const;

export const NAV_LINKS = [
  { label: 'Home',     href: `#${SECTION_IDS.HOME}` },
  { label: 'About',    href: `#${SECTION_IDS.ABOUT}` },
  { label: 'Products', href: `#${SECTION_IDS.PRODUCTS}` },
  { label: 'Contact',  href: `#${SECTION_IDS.CONTACT}` },
] as const;
