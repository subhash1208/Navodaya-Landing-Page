import type { ProductItem, CategorySlug, NavLink } from '@/types';
// Value imports as well as the re-exports below: `export … from` creates no local binding, and
// the derived helpers at the foot of this file need to read both arrays.
import { PRODUCT_CATEGORIES } from './categories';
import { PRODUCTS } from './products';

// ─── Brand ───────────────────────────────────────────────────────────────────
export const BRAND = {
  NAME: 'Navodaya',
  FULL_NAME: 'Navodaya Industries & Care Kits',
  TAGLINE: 'Your Trusted Partner in Progress & Care',
  MISSION:
    'To provide high-quality hygiene, housekeeping, protective packaging, and customized care-kit solutions for educational, healthcare, hospitality, and other institutional customers.',
  // Deliberately separate from MISSION: this is the <meta name="description">
  // shown in search results, which Google truncates around ~155-160
  // characters. MISSION is client-approved on-page copy with no such limit —
  // do not derive one from the other.
  SEO_DESCRIPTION:
    'B2B hygiene, housekeeping, protective packaging and custom care-kit supplies for educational, healthcare and hospitality institutions. Based in Hyderabad.',
  EMAIL: 'connect@navodaya.group',
  PHONE: '+91 83286 05812',
  WEBSITE: 'www.navodaya.group',
  LOCATION: 'Hyderabad',
} as const;

// ─── Site ────────────────────────────────────────────────────────────────────
export const SITE_URL = 'https://www.navodaya.group';

// ─── Animation ───────────────────────────────────────────────────────────────
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

// ─── Routes ──────────────────────────────────────────────────────────────────
export const ROUTES = {
  HOME: '/',
  PRODUCTS: '/products',
  PRODUCT: (slug: string) => `/products/${slug}`,
  CONTACT: '/#contact',
  ABOUT: '/#about',
} as const;

// ─── Navigation ──────────────────────────────────────────────────────────────
export const NAV_LINKS: NavLink[] = [
  { label: 'Home', href: ROUTES.HOME },
  { label: 'About', href: ROUTES.ABOUT },
  { label: 'Products', href: ROUTES.PRODUCTS },
  { label: 'Contact', href: ROUTES.CONTACT },
];

// ─── Catalogue ────────────────────────────────────────────────────────────────
// `PRODUCT_CATEGORIES`/`SUB_CATEGORIES` live in `./categories` and `PRODUCTS` in `./products`
// (2400+ generated lines). Re-exported here so every existing `from '@/constants'` import site
// keeps working. The module graph stays acyclic: categories <- products <- index.
export {
  PRODUCT_CATEGORIES,
  SUB_CATEGORIES,
  CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
  CATEGORY_HOTEL_AMENITIES,
  CATEGORY_SPA_SALON,
  CATEGORY_PROTECTIVE_PACKING,
} from './categories';
export { PRODUCTS } from './products';
// ─── Derived catalogue data ───────────────────────────────────────────────────
// Declared after the re-exports above: entries in `./products` reference the category objects by
// object identity at module-evaluation time, so anything derived from PRODUCTS must come last or
// it reads an empty array.

/**
 * Every product listed under a category, including the three whose `secondaryCategory` points
 * here. A shower cap is genuinely both a hotel amenity and a salon consumable; filtering on
 * `category` alone would drop it from one of its two listings, so every count, tab, dropdown and
 * related-products list goes through this one function.
 */
export function productsInCategory(slug: CategorySlug): ProductItem[] {
  return PRODUCTS.filter((p) => p.category.slug === slug || p.secondaryCategory === slug);
}

/** How many products each category holds. Derived, so it can never drift from PRODUCTS. */
export const PRODUCT_COUNT_BY_CATEGORY = Object.fromEntries(
  PRODUCT_CATEGORIES.map((c) => [c.slug, productsInCategory(c.slug).length]),
) as Record<CategorySlug, number>;

/**
 * A unique, human-readable identifier for a product.
 *
 * Product names are unique across the catalogue today, but the category suffix is still what the
 * business reads on an enquiry to know which range it belongs to. The contact form's product
 * dropdown submits this instead of `p.name` as its `<option value>`; the option's visible label
 * can stay `p.name`, since each option already sits under an `<optgroup>` naming the category.
 */
export function productEnquiryLabel(product: ProductItem): string {
  return `${product.name} — ${product.category.name}`;
}

/**
 * The sentence a card or product page shows beneath the name.
 *
 * The client's catalogue carries no product copy — 123 of the 164 products have no `material`
 * either, and 63 take the bare fallback below: 61 have no variants at all, and two
 * (`cleaning-powder`, `tissue-roll-1000-g`) have a single variant, which the `variantCount > 1`
 * guard deliberately does not report. So this composes whatever factual data the product does
 * have rather than rendering an empty paragraph or the string "undefined". Writing real
 * descriptions is a separate, client-facing task; when `description` is populated it wins.
 *
 * Two constraints on the bare-fallback sentence, both learned from real defects:
 *
 * - It must not contain "request a quote" or a close variant. `ProductCard` folds this sentence
 *   into the card link's accessible name, and every page carrying a card also carries the real
 *   "Request a Quote" CTA — two links answering to the same phrase with different destinations
 *   is a WCAG 2.4.4 link-purpose failure, and it broke `e2e/product-quote-prefill.spec.ts` on a
 *   strict-mode locator violation.
 * - It must not name the category. The card already renders the category as its own specimen
 *   header, so a prefix here made the accessible name announce it twice.
 */
export function productSummary(product: ProductItem): string {
  if (product.description) return product.description;

  const facts: string[] = [];
  if (product.material) facts.push(`${product.material} construction.`);

  const variantCount = product.variants?.length ?? 0;
  if (variantCount > 1) facts.push(`Available in ${variantCount} options.`);

  if (facts.length === 0) {
    return 'Available for bulk supply — sizes and pricing on enquiry.';
  }
  return facts.join(' ');
}
