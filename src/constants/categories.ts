import type { ProductCategory, SubCategory } from '@/types';

/**
 * The four top-level categories, each exported by name as well as through the array.
 *
 * `PRODUCTS` binds these **by object identity** (`src/constants/products.ts`), so every consumer
 * comparing `product.category === CATEGORY_X` or `product.category.id === c.id` depends on there
 * being exactly one object per category. Importing the named constants rather than indexing the
 * array is what keeps the generated product module free of `PRODUCT_CATEGORIES[0]`-style index
 * access, which `strict` would otherwise force a non-null assertion on.
 */
export const CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING: ProductCategory = {
  id: 'hygiene-safety-housekeeping',
  name: 'Hygiene, Safety & Housekeeping',
  slug: 'hygiene-safety-housekeeping',
  description:
    'Protective wear, cleaning chemicals, housekeeping tools, washroom dispensers and waste handling for hospitals, industry and facilities.',
  // Deliberately the existing `hygiene-safety.webp` asset rather than a file renamed to match the
  // widened slug: the photograph is unchanged, so renaming it would only churn the public folder.
  plate: '/categories/hygiene-safety.webp',
};

export const CATEGORY_HOTEL_AMENITIES: ProductCategory = {
  id: 'hotel-amenities',
  name: 'Hotel Slippers & Guest Amenities',
  slug: 'hotel-amenities',
  description:
    'Premium guest amenities and room essentials for hotels, resorts, and hospitality businesses.',
  plate: '/categories/hotel-amenities.webp',
};

export const CATEGORY_SPA_SALON: ProductCategory = {
  id: 'spa-salon',
  name: 'Disposable Spa & Salon',
  slug: 'spa-salon',
  description:
    'Hygienic disposable essentials for spas, salons, beauty parlours, and wellness centres.',
  plate: '/categories/spa-salon.webp',
};

export const CATEGORY_PROTECTIVE_PACKING: ProductCategory = {
  id: 'protective-packing',
  name: 'Protective Packing',
  slug: 'protective-packing',
  description:
    'Films, foams, wraps and liners that protect goods in storage and transit. No specimen plate has been photographed yet, so this category renders a typographic tile.',
  // `plate` deliberately omitted — no photograph exists. See ProductCategoriesSection.tsx.
};

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
  CATEGORY_HOTEL_AMENITIES,
  CATEGORY_SPA_SALON,
  CATEGORY_PROTECTIVE_PACKING,
];

/**
 * Subdivisions of `hygiene-safety-housekeeping` — the only category large enough to need them
 * (133 of the catalogue's 164 products). Descriptions are deliberately one factual clause each;
 * marketing copy for the catalogue is a separate, client-facing task.
 */
export const SUB_CATEGORIES: SubCategory[] = [
  {
    slug: 'personal-protection',
    name: 'Personal Protection',
    description: 'Gowns, masks, gloves and single-use protective wear.',
  },
  {
    slug: 'disposable-linen',
    name: 'Disposable Linen',
    description: 'Single-use bedsheets and linen covers.',
  },
  {
    slug: 'air-care',
    name: 'Air Care',
    description: 'Air fresheners, concentrates and their dispensers.',
  },
  {
    slug: 'cleaning-chemicals',
    name: 'Cleaning Chemicals',
    description: 'Detergents, disinfectants and cleaning compounds.',
  },
  {
    slug: 'brushes-scrubbers-cloths',
    name: 'Brushes, Scrubbers & Cloths',
    description: 'Hand brushes, scrubbing pads and cleaning cloths.',
  },
  {
    slug: 'mops-brooms-wipers',
    name: 'Mops, Brooms & Wipers',
    description: 'Mops, brooms and floor wipers with their refills.',
  },
  {
    slug: 'equipment-accessories',
    name: 'Equipment & Accessories',
    description: 'Trolleys, buckets, handles and housekeeping equipment.',
  },
  {
    slug: 'dust-bins-waste',
    name: 'Dust Bins & Waste',
    description: 'Bins, liners and waste-handling equipment.',
  },
  {
    slug: 'dispensers-washroom',
    name: 'Dispensers & Washroom',
    description: 'Soap, sanitiser and tissue dispensers for washrooms.',
  },
  {
    slug: 'tissues-paper',
    name: 'Tissues & Paper',
    description: 'Tissue rolls, napkins and paper hand towels.',
  },
];
