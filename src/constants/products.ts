/**
 * GENERATED FILE — do not edit by hand.
 *
 * Emitted from `dev-tools/catalogue/catalogue-final.json` (164 products, reconciled
 * against the client's spreadsheet) by `dev-tools/catalogue/_emit_ts.py`. Re-run that script
 * rather than editing entries here, or the next regeneration silently discards your change.
 *
 * `slug` is the `id` verbatim: every id is already unique and URL-safe, so a second field would
 * only be a second thing to keep in sync.
 *
 * The JSON's audit keys (`sourceRows`, `sourceNames`, `brandsStripped`, `typoFixes`, `flags`,
 * `notes`) are deliberately NOT emitted — they are spreadsheet provenance, not product data, and
 * would ship to every visitor.
 *
 * No product carries a `description`: the client's catalogue supplies none and writing 164 is a
 * separate task. Render `productSummary()` from `src/constants` instead of the raw field.
 */
import type { ProductItem } from '@/types';
import {
  CATEGORY_HOTEL_AMENITIES,
  CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
  CATEGORY_PROTECTIVE_PACKING,
  CATEGORY_SPA_SALON,
} from './categories';

export const PRODUCTS: ProductItem[] = [
  {
    id: 'surgical-gown',
    name: 'Surgical Gown',
    slug: 'surgical-gown',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'personal-protection',
    material: 'Non-woven',
  },
  {
    id: 'lab-coat-visitor-coat',
    name: 'Lab Coat / Visitor Coat',
    slug: 'lab-coat-visitor-coat',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'personal-protection',
    material: 'Non-woven',
  },
  {
    id: 'surgeon-cap',
    name: 'Surgeon Cap',
    slug: 'surgeon-cap',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'personal-protection',
    material: 'Non-woven',
  },
  {
    id: 'face-mask',
    name: 'Face Mask',
    slug: 'face-mask',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'personal-protection',
  },
  {
    id: 'hospital-bed-sheet',
    name: 'Hospital Bed Sheet',
    slug: 'hospital-bed-sheet',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'disposable-linen',
    material: 'Non-woven',
  },
  {
    id: 'pillow-cover',
    name: 'Pillow Cover',
    slug: 'pillow-cover',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'disposable-linen',
    material: 'Non-woven',
  },
  {
    id: 'trouser',
    name: 'Trouser',
    slug: 'trouser',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'personal-protection',
  },
  {
    id: 'latex-gloves',
    name: 'Latex Gloves',
    slug: 'latex-gloves',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'personal-protection',
  },
  {
    id: 'nitrile-hand-gloves',
    name: 'Nitrile Hand Gloves',
    slug: 'nitrile-hand-gloves',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'personal-protection',
  },
  {
    id: 'hm-plastic-hand-gloves',
    name: 'HM Plastic Hand Gloves',
    slug: 'hm-plastic-hand-gloves',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'personal-protection',
  },
  {
    id: 'shoe-cover',
    name: 'Shoe Cover',
    slug: 'shoe-cover',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'personal-protection',
    variants: [
      {
        label: 'LDPE',
        material: 'LDPE',
      },
      {
        label: 'Non-woven',
        material: 'Non-woven',
      },
    ],
  },
  {
    id: 'apron',
    name: 'Apron',
    slug: 'apron',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'personal-protection',
    material: 'LDPE',
  },
  {
    id: 'hand-sleeves',
    name: 'Hand Sleeves',
    slug: 'hand-sleeves',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'personal-protection',
    material: 'Non-woven',
  },
  {
    id: 'chef-caps',
    name: 'Chef Caps',
    slug: 'chef-caps',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'personal-protection',
    material: 'Non-woven',
  },
  {
    id: 'beard-mask',
    name: 'Beard Mask',
    slug: 'beard-mask',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'personal-protection',
    material: 'Non-woven',
  },
  {
    id: 'air-freshener-concentrate',
    name: 'Air Freshener Concentrate',
    slug: 'air-freshener-concentrate',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'air-care',
    variants: [
      {
        label: '500 ML — Lavender',
        size: '500 ML',
        fragrance: 'Lavender',
      },
      {
        label: '500 ML — Lily',
        size: '500 ML',
        fragrance: 'Lily',
      },
      {
        label: '500 ML — Sandal',
        size: '500 ML',
        fragrance: 'Sandal',
      },
      {
        label: '500 ML — Blossom',
        size: '500 ML',
        fragrance: 'Blossom',
      },
      {
        label: '500 ML — Jasmine',
        size: '500 ML',
        fragrance: 'Jasmine',
      },
      {
        label: '500 ML — Citrus',
        size: '500 ML',
        fragrance: 'Citrus',
      },
      {
        label: '1 L — Lavender',
        size: '1 L',
        fragrance: 'Lavender',
      },
      {
        label: '1 L — Lily',
        size: '1 L',
        fragrance: 'Lily',
      },
      {
        label: '1 L — Sandal',
        size: '1 L',
        fragrance: 'Sandal',
      },
      {
        label: '1 L — Blossom',
        size: '1 L',
        fragrance: 'Blossom',
      },
      {
        label: '1 L — Jasmine',
        size: '1 L',
        fragrance: 'Jasmine',
      },
      {
        label: '1 L — Citrus',
        size: '1 L',
        fragrance: 'Citrus',
      },
      {
        label: '5 L — Lavender',
        size: '5 L',
        fragrance: 'Lavender',
      },
      {
        label: '5 L — Lily',
        size: '5 L',
        fragrance: 'Lily',
      },
      {
        label: '5 L — Sandal',
        size: '5 L',
        fragrance: 'Sandal',
      },
      {
        label: '5 L — Blossom',
        size: '5 L',
        fragrance: 'Blossom',
      },
      {
        label: '5 L — Jasmine',
        size: '5 L',
        fragrance: 'Jasmine',
      },
      {
        label: '5 L — Citrus',
        size: '5 L',
        fragrance: 'Citrus',
      },
    ],
  },
  {
    id: 'carpet-shampoo',
    name: 'Carpet Shampoo',
    slug: 'carpet-shampoo',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'cleaning-chemicals',
  },
  {
    id: 'descaler',
    name: 'Descaler',
    slug: 'descaler',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'cleaning-chemicals',
  },
  {
    id: 'glass-cleaner',
    name: 'Glass Cleaner',
    slug: 'glass-cleaner',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'cleaning-chemicals',
    variants: [
      {
        label: '500 ML',
        size: '500 ML',
      },
      {
        label: '1 L',
        size: '1 L',
      },
      {
        label: '5 L',
        size: '5 L',
      },
    ],
  },
  {
    id: 'oven-and-grill-cleaner',
    name: 'Oven & Grill Cleaner',
    slug: 'oven-and-grill-cleaner',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'cleaning-chemicals',
    variants: [
      {
        label: '500 ML',
        size: '500 ML',
      },
      {
        label: '5 L',
        size: '5 L',
      },
    ],
  },
  {
    id: 'steel-cleaner',
    name: 'Steel Cleaner',
    slug: 'steel-cleaner',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'cleaning-chemicals',
    variants: [
      {
        label: '500 ML',
        size: '500 ML',
      },
      {
        label: '5 L',
        size: '5 L',
      },
    ],
  },
  {
    id: 'dishwash-liquid',
    name: 'Dishwash Liquid',
    slug: 'dishwash-liquid',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'cleaning-chemicals',
    variants: [
      {
        label: '500 ML',
        size: '500 ML',
      },
      {
        label: '1 L',
        size: '1 L',
      },
      {
        label: '5 L',
        size: '5 L',
      },
    ],
  },
  {
    id: 'hand-wash',
    name: 'Hand Wash',
    slug: 'hand-wash',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'cleaning-chemicals',
    variants: [
      {
        label: '500 ML — Peach',
        size: '500 ML',
        fragrance: 'Peach',
      },
      {
        label: '500 ML — Lemon',
        size: '500 ML',
        fragrance: 'Lemon',
      },
      {
        label: '500 ML — Blossom',
        size: '500 ML',
        fragrance: 'Blossom',
      },
      {
        label: '1 L — Peach',
        size: '1 L',
        fragrance: 'Peach',
      },
      {
        label: '1 L — Lemon',
        size: '1 L',
        fragrance: 'Lemon',
      },
      {
        label: '1 L — Blossom',
        size: '1 L',
        fragrance: 'Blossom',
      },
      {
        label: '5 L — Peach',
        size: '5 L',
        fragrance: 'Peach',
      },
      {
        label: '5 L — Lemon',
        size: '5 L',
        fragrance: 'Lemon',
      },
      {
        label: '5 L — Blossom',
        size: '5 L',
        fragrance: 'Blossom',
      },
    ],
  },
  {
    id: 'bathroom-cleaner',
    name: 'Bathroom Cleaner',
    slug: 'bathroom-cleaner',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'cleaning-chemicals',
    variants: [
      {
        label: '500 ML',
        size: '500 ML',
      },
      {
        label: '1 L',
        size: '1 L',
      },
      {
        label: '5 L',
        size: '5 L',
      },
    ],
  },
  {
    id: 'detergent-liquid',
    name: 'Detergent Liquid',
    slug: 'detergent-liquid',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'cleaning-chemicals',
    variants: [
      {
        label: '1 L',
        size: '1 L',
      },
      {
        label: '5 L',
        size: '5 L',
      },
    ],
  },
  {
    id: 'fabric-conditioner',
    name: 'Fabric Conditioner',
    slug: 'fabric-conditioner',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'cleaning-chemicals',
    variants: [
      {
        label: '1 L',
        size: '1 L',
      },
      {
        label: '5 L',
        size: '5 L',
      },
    ],
  },
  {
    id: 'floor-cleaner',
    name: 'Floor Cleaner',
    slug: 'floor-cleaner',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'cleaning-chemicals',
    variants: [
      {
        label: '500 ML — Jasmine',
        size: '500 ML',
        fragrance: 'Jasmine',
      },
      {
        label: '500 ML — Rose',
        size: '500 ML',
        fragrance: 'Rose',
      },
      {
        label: '500 ML — Sandal',
        size: '500 ML',
        fragrance: 'Sandal',
      },
      {
        label: '500 ML — Citrus',
        size: '500 ML',
        fragrance: 'Citrus',
      },
      {
        label: '1 L — Jasmine',
        size: '1 L',
        fragrance: 'Jasmine',
      },
      {
        label: '1 L — Rose',
        size: '1 L',
        fragrance: 'Rose',
      },
      {
        label: '1 L — Sandal',
        size: '1 L',
        fragrance: 'Sandal',
      },
      {
        label: '1 L — Citrus',
        size: '1 L',
        fragrance: 'Citrus',
      },
      {
        label: '5 L — Jasmine',
        size: '5 L',
        fragrance: 'Jasmine',
      },
      {
        label: '5 L — Rose',
        size: '5 L',
        fragrance: 'Rose',
      },
      {
        label: '5 L — Sandal',
        size: '5 L',
        fragrance: 'Sandal',
      },
      {
        label: '5 L — Citrus',
        size: '5 L',
        fragrance: 'Citrus',
      },
    ],
  },
  {
    id: 'hard-surface-cleaner',
    name: 'Hard Surface Cleaner',
    slug: 'hard-surface-cleaner',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'cleaning-chemicals',
    variants: [
      {
        label: '1 L',
        size: '1 L',
      },
      {
        label: '5 L',
        size: '5 L',
      },
    ],
  },
  {
    id: 'toilet-cleaner',
    name: 'Toilet Cleaner',
    slug: 'toilet-cleaner',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'cleaning-chemicals',
    variants: [
      {
        label: '500 ML',
        size: '500 ML',
      },
      {
        label: '1 L',
        size: '1 L',
      },
      {
        label: '5 L',
        size: '5 L',
      },
    ],
  },
  {
    id: 'herbal-deodoriser-phenyl',
    name: 'Herbal Deodoriser (Phenyl)',
    slug: 'herbal-deodoriser-phenyl',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'cleaning-chemicals',
    variants: [
      {
        label: '1 L — Rose',
        size: '1 L',
        fragrance: 'Rose',
      },
      {
        label: '1 L — Jasmine',
        size: '1 L',
        fragrance: 'Jasmine',
      },
      {
        label: '1 L — Lemon',
        size: '1 L',
        fragrance: 'Lemon',
      },
      {
        label: '1 L — Mogra',
        size: '1 L',
        fragrance: 'Mogra',
      },
      {
        label: '1 L — White',
        size: '1 L',
        fragrance: 'White',
      },
      {
        label: '1 L — White SPL',
        size: '1 L',
        fragrance: 'White SPL',
      },
      {
        label: '5 L — Rose',
        size: '5 L',
        fragrance: 'Rose',
      },
      {
        label: '5 L — Jasmine',
        size: '5 L',
        fragrance: 'Jasmine',
      },
      {
        label: '5 L — Lemon',
        size: '5 L',
        fragrance: 'Lemon',
      },
      {
        label: '5 L — Mogra',
        size: '5 L',
        fragrance: 'Mogra',
      },
      {
        label: '5 L — White',
        size: '5 L',
        fragrance: 'White',
      },
      {
        label: '5 L — White SPL',
        size: '5 L',
        fragrance: 'White SPL',
      },
    ],
  },
  {
    id: 'soap-oil',
    name: 'Soap Oil',
    slug: 'soap-oil',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'cleaning-chemicals',
    variants: [
      {
        label: '1 L',
        size: '1 L',
      },
      {
        label: '5 L',
        size: '5 L',
      },
    ],
  },
  {
    id: 'steel-scrubber',
    name: 'Steel Scrubber',
    slug: 'steel-scrubber',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'brushes-scrubbers-cloths',
    material: 'Steel',
    variants: [
      {
        label: '10 g',
        size: '10 g',
      },
      {
        label: '20 g',
        size: '20 g',
      },
    ],
  },
  {
    id: 'mop-set',
    name: 'Cotton Wet Mop',
    slug: 'mop-set',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'mops-brooms-wipers',
    variants: [
      {
        label: 'Red Handle — Screw Socket',
      },
      {
        label: 'Blue Handle — Metal Band',
      },
      {
        label: 'Blue Yarn — Screw Hub',
      },
      {
        label: 'Elephant',
      },
      {
        label: 'Printed Handle — Slim Head',
      },
      {
        label: 'Wide Clamp — Looped Yarn, Heavy Duty',
      },
      {
        label: 'Maroon Handle — Coarse Twist',
      },
      {
        label: 'Blue Handle — Disc Fitting',
      },
      {
        label: 'Blue Handle — Clamp Fitting',
      },
      {
        label: 'Butterfly Jumbo',
      },
      {
        label: 'Eagle',
      },
    ],
  },
  {
    id: 'flat-clamp-mop',
    name: 'Flat Clamp Mop',
    slug: 'flat-clamp-mop',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'mops-brooms-wipers',
  },
  {
    id: 'metal-mop-set-5-ft',
    name: 'Metal-Socket Cotton Mop, 300 g, 5 ft Handle',
    slug: 'metal-mop-set-5-ft',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'mops-brooms-wipers',
    material: 'Metal',
  },
  {
    id: 'broom',
    name: 'Broom',
    slug: 'broom',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'mops-brooms-wipers',
    variants: [
      {
        label: 'Hunter',
      },
      {
        label: 'Blue Bell',
      },
      {
        label: 'XL',
      },
      {
        label: 'Lily',
      },
      {
        label: 'Jumbo',
      },
      {
        label: 'Daisy',
      },
      {
        label: 'Dolly',
      },
    ],
  },
  {
    id: 'dust-pan',
    name: 'Dust Pan',
    slug: 'dust-pan',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'equipment-accessories',
    variants: [
      {
        label: 'Plain',
      },
      {
        label: 'With brush',
      },
    ],
  },
  {
    id: 'garbage-bag-roll',
    name: 'Garbage Bag Roll',
    slug: 'garbage-bag-roll',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'dust-bins-waste',
    variants: [
      {
        label: 'Small',
      },
      {
        label: 'Medium',
      },
      {
        label: 'Large',
      },
      {
        label: 'Extra Large',
      },
      {
        label: 'Jumbo',
      },
    ],
  },
  {
    id: 'long-wiper',
    name: 'Long Wiper',
    slug: 'long-wiper',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'mops-brooms-wipers',
  },
  {
    id: 'bathroom-wiper',
    name: 'Bathroom Wiper',
    slug: 'bathroom-wiper',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'mops-brooms-wipers',
  },
  {
    id: 'kitchen-wiper',
    name: 'Kitchen Wiper',
    slug: 'kitchen-wiper',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'mops-brooms-wipers',
  },
  {
    id: 'glass-wiper',
    name: 'Glass Wiper',
    slug: 'glass-wiper',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'mops-brooms-wipers',
    variants: [
      {
        label: 'Standard',
      },
      {
        label: 'Squeeze type — 35 cm',
      },
    ],
  },
  {
    id: 'wiper-set',
    name: 'Wiper Set',
    slug: 'wiper-set',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'mops-brooms-wipers',
    variants: [
      {
        label: '16 inch',
        size: '16 inch',
      },
      {
        label: '21 inch',
        size: '21 inch',
      },
      {
        label: '24 inch',
        size: '24 inch',
      },
    ],
  },
  {
    id: 'double-rubber-wiper',
    name: 'Double Rubber Wiper',
    slug: 'double-rubber-wiper',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'mops-brooms-wipers',
    material: 'Rubber',
  },
  {
    id: 'cleaning-powder',
    name: 'Cleaning Powder',
    slug: 'cleaning-powder',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'cleaning-chemicals',
    variants: [
      {
        label: '400 g',
        size: '400 g',
      },
    ],
  },
  {
    id: 'urinal-cubes',
    name: 'Urinal Cubes',
    slug: 'urinal-cubes',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'air-care',
    variants: [
      {
        label: '60 g',
        size: '60 g',
      },
      {
        label: '120 g',
        size: '120 g',
      },
      {
        label: '180 g',
        size: '180 g',
      },
    ],
  },
  {
    id: 'urinal-cake',
    name: 'Urinal Cake',
    slug: 'urinal-cake',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'air-care',
  },
  {
    id: 'naphthalene-balls',
    name: 'Naphthalene Balls',
    slug: 'naphthalene-balls',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'air-care',
    variants: [
      {
        label: '90 g — White',
        size: '90 g',
        colour: 'White',
      },
      {
        label: '200 g — White',
        size: '200 g',
        colour: 'White',
      },
      {
        label: '450 g — White',
        size: '450 g',
        colour: 'White',
      },
      {
        label: '900 g — White',
        size: '900 g',
        colour: 'White',
      },
    ],
  },
  {
    id: 'round-brush',
    name: 'Round Brush',
    slug: 'round-brush',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'brushes-scrubbers-cloths',
    variants: [
      {
        label: 'Standard',
      },
      {
        label: 'Big',
      },
    ],
  },
  {
    id: 'hockey-brush',
    name: 'Hockey Brush',
    slug: 'hockey-brush',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'brushes-scrubbers-cloths',
    variants: [
      {
        label: 'Single',
      },
      {
        label: 'Double',
      },
    ],
  },
  {
    id: 'bottle-brush',
    name: 'Bottle Brush',
    slug: 'bottle-brush',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'brushes-scrubbers-cloths',
  },
  {
    id: 'carpet-brush',
    name: 'Carpet Brush',
    slug: 'carpet-brush',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'brushes-scrubbers-cloths',
    variants: [
      {
        label: 'Standard',
      },
      {
        label: 'Wooden, hard bristle',
      },
    ],
  },
  {
    id: 'cobweb-brush',
    name: 'Cobweb Brush',
    slug: 'cobweb-brush',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'brushes-scrubbers-cloths',
    variants: [
      {
        label: 'Ringed',
      },
      {
        label: 'Round',
      },
    ],
  },
  {
    id: 'paint-brush',
    name: 'Paint Brush',
    slug: 'paint-brush',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'brushes-scrubbers-cloths',
    variants: [
      {
        label: '1 inch',
        size: '1 inch',
      },
      {
        label: '2 inch',
        size: '2 inch',
      },
      {
        label: '3 inch',
        size: '3 inch',
      },
      {
        label: '4 inch',
        size: '4 inch',
      },
    ],
  },
  {
    id: 'sink-brush',
    name: 'Sink Brush',
    slug: 'sink-brush',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'brushes-scrubbers-cloths',
  },
  {
    id: 'brush-set-wooden',
    name: 'Brush Set (Wooden)',
    slug: 'brush-set-wooden',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'brushes-scrubbers-cloths',
    material: 'Wood',
  },
  {
    id: 'cloth-brush-iron',
    name: 'Cloth Brush (Iron)',
    slug: 'cloth-brush-iron',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'brushes-scrubbers-cloths',
    material: 'Iron',
  },
  {
    id: 'wc-brush-with-container',
    name: 'WC Brush with Container',
    slug: 'wc-brush-with-container',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'brushes-scrubbers-cloths',
  },
  {
    id: 'green-scrubber',
    name: 'Green Scrubber',
    slug: 'green-scrubber',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'brushes-scrubbers-cloths',
    variants: [
      {
        label: '3 x 4 — Green',
        size: '3 x 4',
        colour: 'Green',
      },
      {
        label: '4 x 6 — Green',
        size: '4 x 6',
        colour: 'Green',
      },
      {
        label: '5-in-1 pack — Green',
        size: '5-in-1 pack',
        colour: 'Green',
      },
      {
        label: '10-in-1 pack — Green',
        size: '10-in-1 pack',
        colour: 'Green',
      },
    ],
  },
  {
    id: 'sponge-with-scrubber',
    name: 'Sponge with Scrubber',
    slug: 'sponge-with-scrubber',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'brushes-scrubbers-cloths',
  },
  {
    id: 'power-scrubber',
    name: 'Power Scrubber',
    slug: 'power-scrubber',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'brushes-scrubbers-cloths',
  },
  {
    id: 'tiles-scrubber',
    name: 'Tiles Scrubber',
    slug: 'tiles-scrubber',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'brushes-scrubbers-cloths',
    variants: [
      {
        label: 'Square',
      },
      {
        label: 'Iron',
      },
    ],
  },
  {
    id: 'nylon-scrubber',
    name: 'Nylon Scrubber',
    slug: 'nylon-scrubber',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'brushes-scrubbers-cloths',
    material: 'Nylon',
    variants: [
      {
        label: '1000',
      },
      {
        label: '2000',
      },
      {
        label: '3000',
      },
    ],
  },
  {
    id: 'check-cloth',
    name: 'Check Cloth',
    slug: 'check-cloth',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'brushes-scrubbers-cloths',
    variants: [
      {
        label: '13 x 23',
        size: '13 x 23',
      },
      {
        label: '16 x 26',
        size: '16 x 26',
      },
      {
        label: '18 x 28',
        size: '18 x 28',
      },
    ],
  },
  {
    id: 'cream-cloth-heavy',
    name: 'Cream Cloth (Heavy)',
    slug: 'cream-cloth-heavy',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'brushes-scrubbers-cloths',
  },
  {
    id: 'glass-cleaning-cloth',
    name: 'Glass Cleaning Cloth',
    slug: 'glass-cleaning-cloth',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'brushes-scrubbers-cloths',
    variants: [
      {
        label: '20 x 20',
        size: '20 x 20',
      },
      {
        label: '23 x 23',
        size: '23 x 23',
      },
    ],
  },
  {
    id: 'microfibre-cloth',
    name: 'Microfibre Cloth',
    slug: 'microfibre-cloth',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'brushes-scrubbers-cloths',
    material: 'Microfibre',
    variants: [
      {
        label: '40 x 40, 600 GSM (2-in-1)',
        size: '40 x 40, 600 GSM',
      },
      {
        label: '40 x 40, 400 GSM',
        size: '40 x 40, 400 GSM',
      },
      {
        label: '40 x 60, 400 GSM',
        size: '40 x 60, 400 GSM',
      },
      {
        label: '40 x 40, 280 GSM — Red',
        size: '40 x 40, 280 GSM',
        colour: 'Red',
      },
      {
        label: '40 x 40, 280 GSM — Blue',
        size: '40 x 40, 280 GSM',
        colour: 'Blue',
      },
      {
        label: '40 x 40, 280 GSM — Green',
        size: '40 x 40, 280 GSM',
        colour: 'Green',
      },
      {
        label: '40 x 40, 280 GSM — Yellow',
        size: '40 x 40, 280 GSM',
        colour: 'Yellow',
      },
    ],
  },
  {
    id: 'mop-cloth-6-yarn-jumbo',
    name: 'Mop Cloth (6 Yarn, Jumbo)',
    slug: 'mop-cloth-6-yarn-jumbo',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'mops-brooms-wipers',
    variants: [
      {
        label: '22 x 22',
        size: '22 x 22',
      },
      {
        label: '30 x 30',
        size: '30 x 30',
      },
    ],
  },
  {
    id: 'yellow-cloth',
    name: 'Yellow Cloth',
    slug: 'yellow-cloth',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'brushes-scrubbers-cloths',
    variants: [
      {
        label: 'Medium — Yellow',
        size: 'Medium',
        colour: 'Yellow',
      },
      {
        label: 'Big — Yellow',
        size: 'Big',
        colour: 'Yellow',
      },
    ],
  },
  {
    id: 'kitchen-wipes',
    name: 'Kitchen Wipes',
    slug: 'kitchen-wipes',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'brushes-scrubbers-cloths',
    variants: [
      {
        label: '3-piece pack',
      },
      {
        label: '5-piece pack',
      },
    ],
  },
  {
    id: 'air-revitaliser',
    name: 'Air Revitaliser',
    slug: 'air-revitaliser',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'air-care',
  },
  {
    id: 'automatic-air-freshener-refill',
    name: 'Automatic Air Freshener Refill',
    slug: 'automatic-air-freshener-refill',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'air-care',
  },
  {
    id: 'caddy-basket',
    name: 'Caddy Basket',
    slug: 'caddy-basket',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'equipment-accessories',
  },
  {
    id: 'caution-sign-board',
    name: 'Caution Sign Board',
    slug: 'caution-sign-board',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'equipment-accessories',
    variants: [
      {
        label: 'CIP',
      },
      {
        label: 'WF',
      },
      {
        label: 'WIP',
      },
    ],
  },
  {
    id: 'floor-scraper-handle',
    name: 'Floor Scraper Handle',
    slug: 'floor-scraper-handle',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'equipment-accessories',
  },
  {
    id: 'glass-applicator-35-cm',
    name: 'Glass Applicator (35 cm)',
    slug: 'glass-applicator-35-cm',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'mops-brooms-wipers',
  },
  {
    id: 'glass-scraper',
    name: 'Glass Scraper',
    slug: 'glass-scraper',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'equipment-accessories',
  },
  {
    id: 'glass-cleaning-kit-box',
    name: 'Glass Cleaning Kit Box',
    slug: 'glass-cleaning-kit-box',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'equipment-accessories',
  },
  {
    id: 'scraper-blade',
    name: 'Scraper Blade',
    slug: 'scraper-blade',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'equipment-accessories',
    variants: [
      {
        label: '4 inch',
        size: '4 inch',
      },
      {
        label: 'Big',
        size: 'Big',
      },
    ],
  },
  {
    id: 'm-fold-tissue-dispenser',
    name: 'M-Fold Tissue Dispenser',
    slug: 'm-fold-tissue-dispenser',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'dispensers-washroom',
    variants: [
      {
        label: 'Small',
      },
      {
        label: 'Big',
      },
    ],
  },
  {
    id: 'mop-holder-abs-5-bracket',
    name: 'Mop Holder (ABS, 5 Bracket)',
    slug: 'mop-holder-abs-5-bracket',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'equipment-accessories',
    material: 'ABS plastic',
  },
  {
    id: 'twin-bucket-portable',
    name: 'Twin Bucket (Portable)',
    slug: 'twin-bucket-portable',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'equipment-accessories',
  },
  {
    id: 'soap-dispenser',
    name: 'Soap Dispenser',
    slug: 'soap-dispenser',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'dispensers-washroom',
    variants: [
      {
        label: '500 ML',
        size: '500 ML',
      },
      {
        label: '600 ML',
        size: '600 ML',
      },
      {
        label: '800 ML',
        size: '800 ML',
      },
      {
        label: '1000 ML',
        size: '1000 ML',
      },
    ],
  },
  {
    id: 'automatic-soap-dispenser',
    name: 'Automatic Soap Dispenser',
    slug: 'automatic-soap-dispenser',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'dispensers-washroom',
  },
  {
    id: 'stainless-steel-soap-dispenser',
    name: 'Stainless Steel Soap Dispenser',
    slug: 'stainless-steel-soap-dispenser',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'dispensers-washroom',
    material: 'Stainless steel',
    variants: [
      {
        label: '500 ML',
        size: '500 ML',
      },
      {
        label: '800 ML',
        size: '800 ML',
      },
      {
        label: '1000 ML',
        size: '1000 ML',
      },
    ],
  },
  {
    id: 'telescopic-pole',
    name: 'Telescopic Pole',
    slug: 'telescopic-pole',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'equipment-accessories',
    variants: [
      {
        label: '4 m',
        size: '4 m',
      },
      {
        label: '6 m',
        size: '6 m',
      },
      {
        label: '9 m',
        size: '9 m',
      },
    ],
  },
  {
    id: 'stainless-steel-tissue-roll-holder',
    name: 'Stainless Steel Tissue Roll Holder',
    slug: 'stainless-steel-tissue-roll-holder',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'dispensers-washroom',
    material: 'Stainless steel',
  },
  {
    id: 'wringer-trolley',
    name: 'Wringer Trolley',
    slug: 'wringer-trolley',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'equipment-accessories',
    variants: [
      {
        label: '20 L — Yellow',
        size: '20 L',
        colour: 'Yellow',
      },
      {
        label: '40 L, double bucket',
        size: '40 L',
      },
      {
        label: '40 L, 3 bucket',
        size: '40 L',
      },
    ],
  },
  {
    id: 'steel-pedal-dust-bin',
    name: 'Steel Pedal Dust Bin',
    slug: 'steel-pedal-dust-bin',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'dust-bins-waste',
    material: 'Steel',
    variants: [
      {
        label: '7 x 10',
        size: '7 x 10',
      },
      {
        label: '8 x 12',
        size: '8 x 12',
      },
      {
        label: '10 x 14',
        size: '10 x 14',
      },
    ],
  },
  {
    id: 'steel-perforated-dust-bin',
    name: 'Steel Perforated Dust Bin',
    slug: 'steel-perforated-dust-bin',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'dust-bins-waste',
    material: 'Steel',
    variants: [
      {
        label: '7 x 10',
        size: '7 x 10',
      },
      {
        label: '8 x 12',
        size: '8 x 12',
      },
      {
        label: '10 x 14',
        size: '10 x 14',
      },
    ],
  },
  {
    id: 'steel-swing-lid-dust-bin',
    name: 'Steel Swing-Lid Dust Bin',
    slug: 'steel-swing-lid-dust-bin',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'dust-bins-waste',
    material: 'Steel',
    variants: [
      {
        label: '12 x 24',
        size: '12 x 24',
      },
      {
        label: '12 x 28',
        size: '12 x 28',
      },
      {
        label: '14 x 28',
        size: '14 x 28',
      },
    ],
  },
  {
    id: 'wheeled-dust-bin',
    name: 'Wheeled Dust Bin',
    slug: 'wheeled-dust-bin',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'dust-bins-waste',
    variants: [
      {
        label: '120 L — Blue',
        size: '120 L',
        colour: 'Blue',
      },
      {
        label: '120 L — Green',
        size: '120 L',
        colour: 'Green',
      },
      {
        label: '120 L — Red',
        size: '120 L',
        colour: 'Red',
      },
      {
        label: '120 L — Yellow',
        size: '120 L',
        colour: 'Yellow',
      },
      {
        label: '240 L — Blue',
        size: '240 L',
        colour: 'Blue',
      },
      {
        label: '240 L — Green',
        size: '240 L',
        colour: 'Green',
      },
      {
        label: '240 L — Red',
        size: '240 L',
        colour: 'Red',
      },
      {
        label: '240 L — Yellow',
        size: '240 L',
        colour: 'Yellow',
      },
    ],
  },
  {
    id: 'pedal-dust-bin',
    name: 'Pedal Dust Bin',
    slug: 'pedal-dust-bin',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'dust-bins-waste',
    variants: [
      {
        label: '15 L — Blue',
        size: '15 L',
        colour: 'Blue',
      },
      {
        label: '15 L — Green',
        size: '15 L',
        colour: 'Green',
      },
      {
        label: '15 L — Red',
        size: '15 L',
        colour: 'Red',
      },
      {
        label: '15 L — Yellow',
        size: '15 L',
        colour: 'Yellow',
      },
      {
        label: '20 L — Blue',
        size: '20 L',
        colour: 'Blue',
      },
      {
        label: '20 L — Green',
        size: '20 L',
        colour: 'Green',
      },
      {
        label: '20 L — Red',
        size: '20 L',
        colour: 'Red',
      },
      {
        label: '20 L — Yellow',
        size: '20 L',
        colour: 'Yellow',
      },
      {
        label: '30 L — Blue',
        size: '30 L',
        colour: 'Blue',
      },
      {
        label: '30 L — Green',
        size: '30 L',
        colour: 'Green',
      },
      {
        label: '30 L — Red',
        size: '30 L',
        colour: 'Red',
      },
      {
        label: '30 L — Yellow',
        size: '30 L',
        colour: 'Yellow',
      },
      {
        label: '45 L — Blue',
        size: '45 L',
        colour: 'Blue',
      },
      {
        label: '45 L — Green',
        size: '45 L',
        colour: 'Green',
      },
      {
        label: '45 L — Red',
        size: '45 L',
        colour: 'Red',
      },
      {
        label: '45 L — Yellow',
        size: '45 L',
        colour: 'Yellow',
      },
      {
        label: 'Small',
      },
      {
        label: 'Medium',
      },
    ],
  },
  {
    id: 'swing-lid-dust-bin',
    name: 'Swing-Lid Dust Bin',
    slug: 'swing-lid-dust-bin',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'dust-bins-waste',
    variants: [
      {
        label: '60 L — Blue',
        size: '60 L',
        colour: 'Blue',
      },
      {
        label: '60 L — Green',
        size: '60 L',
        colour: 'Green',
      },
      {
        label: '60 L — Red',
        size: '60 L',
        colour: 'Red',
      },
      {
        label: '60 L — Yellow',
        size: '60 L',
        colour: 'Yellow',
      },
      {
        label: '30 L',
        size: '30 L',
      },
      {
        label: '60 L (no colour stated)',
        size: '60 L',
      },
    ],
  },
  {
    id: 'plain-dust-bin',
    name: 'Plain Dust Bin',
    slug: 'plain-dust-bin',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'dust-bins-waste',
    variants: [
      {
        label: 'Small',
      },
      {
        label: 'Big',
      },
    ],
  },
  {
    id: 'air-freshener-pocket',
    name: 'Air Freshener Pocket',
    slug: 'air-freshener-pocket',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'air-care',
  },
  {
    id: 'air-freshener-block',
    name: 'Air Freshener Block',
    slug: 'air-freshener-block',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'air-care',
    variants: [
      {
        label: '50 g block',
      },
      {
        label: 'Zipper pouch',
      },
    ],
  },
  {
    id: 'bucket',
    name: 'Bucket',
    slug: 'bucket',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'equipment-accessories',
    variants: [
      {
        label: '3 L',
        size: '3 L',
      },
      {
        label: '5 L',
        size: '5 L',
      },
      {
        label: '8 L',
        size: '8 L',
      },
      {
        label: '11 L',
        size: '11 L',
      },
      {
        label: '13 L',
        size: '13 L',
      },
      {
        label: '16 L',
        size: '16 L',
      },
      {
        label: '18 L',
        size: '18 L',
      },
      {
        label: '20 L',
        size: '20 L',
      },
      {
        label: '25 L',
        size: '25 L',
      },
    ],
  },
  {
    id: 'dry-mop-set',
    name: 'Dry Mop Set',
    slug: 'dry-mop-set',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'mops-brooms-wipers',
    variants: [
      {
        label: '18 inch — Grey',
        size: '18 inch',
        colour: 'Grey',
      },
      {
        label: '21 inch — Grey',
        size: '21 inch',
        colour: 'Grey',
      },
      {
        label: '24 inch — Grey',
        size: '24 inch',
        colour: 'Grey',
      },
    ],
  },
  {
    id: 'dry-mop-refill',
    name: 'Dry Mop Refill',
    slug: 'dry-mop-refill',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'equipment-accessories',
    variants: [
      {
        label: '18 inch — Grey',
        size: '18 inch',
        colour: 'Grey',
      },
      {
        label: '21 inch — Grey',
        size: '21 inch',
        colour: 'Grey',
      },
      {
        label: '24 inch — Grey',
        size: '24 inch',
        colour: 'Grey',
      },
      {
        label: '24 inch — Blue',
        size: '24 inch',
        colour: 'Blue',
      },
    ],
  },
  {
    id: 'dry-mop-frame',
    name: 'Dry Mop Frame',
    slug: 'dry-mop-frame',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'mops-brooms-wipers',
    variants: [
      {
        label: '24 inch — Blue',
        size: '24 inch',
        colour: 'Blue',
      },
      {
        label: 'Microfibre',
      },
    ],
  },
  {
    id: 'feather-duster',
    name: 'Feather Duster',
    slug: 'feather-duster',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'brushes-scrubbers-cloths',
    variants: [
      {
        label: 'With cap',
      },
      {
        label: 'Yellow handle',
        colour: 'Yellow',
      },
    ],
  },
  {
    id: 'floor-machine-pad-17-inch',
    name: 'Floor Machine Pad (17 inch)',
    slug: 'floor-machine-pad-17-inch',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'brushes-scrubbers-cloths',
  },
  {
    id: 'empty-pump-bottle',
    name: 'Empty Pump Bottle',
    slug: 'empty-pump-bottle',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'equipment-accessories',
    material: 'HDPE',
  },
  {
    id: 'toilet-flush-block-2-piece-set',
    name: 'Toilet Flush Block (2 Piece Set)',
    slug: 'toilet-flush-block-2-piece-set',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'air-care',
  },
  {
    id: 'plunger',
    name: 'Plunger',
    slug: 'plunger',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'equipment-accessories',
    variants: [
      {
        label: 'Standard — Black',
        colour: 'Black',
      },
      {
        label: 'Hexa — Black',
        colour: 'Black',
      },
    ],
  },
  {
    id: 'cleaning-acid',
    name: 'Cleaning Acid',
    slug: 'cleaning-acid',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'cleaning-chemicals',
    variants: [
      {
        label: '1 L',
        size: '1 L',
      },
      {
        label: '5 L',
        size: '5 L',
      },
    ],
  },
  {
    id: 'air-freshener-room-spray',
    name: 'Air Freshener Room Spray',
    slug: 'air-freshener-room-spray',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'air-care',
    variants: [
      {
        label: '220 ML — Citrus',
        size: '220 ML',
        fragrance: 'Citrus',
      },
      {
        label: '220 ML — Rose',
        size: '220 ML',
        fragrance: 'Rose',
      },
      {
        label: '220 ML — Bliss',
        size: '220 ML',
        fragrance: 'Bliss',
      },
      {
        label: '220 ML — Breeze',
        size: '220 ML',
        fragrance: 'Breeze',
      },
    ],
  },
  {
    id: 'lobby-dust-pan',
    name: 'Lobby Dust Pan',
    slug: 'lobby-dust-pan',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'equipment-accessories',
  },
  {
    id: 'car-duster-long',
    name: 'Car Duster (Long)',
    slug: 'car-duster-long',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'brushes-scrubbers-cloths',
  },
  {
    id: 'cup-dispenser',
    name: 'Cup Dispenser',
    slug: 'cup-dispenser',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'dispensers-washroom',
    material: 'ABS plastic',
  },
  {
    id: 'touch-soap-dispenser',
    name: 'Touch Soap Dispenser',
    slug: 'touch-soap-dispenser',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'dispensers-washroom',
  },
  {
    id: 'sanitiser',
    name: 'Sanitiser',
    slug: 'sanitiser',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'cleaning-chemicals',
  },
  {
    id: 'broom-refill',
    name: 'Broom Refill',
    slug: 'broom-refill',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'equipment-accessories',
  },
  {
    id: 'automatic-air-freshener-dispenser',
    name: 'Automatic Air Freshener Dispenser',
    slug: 'automatic-air-freshener-dispenser',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'dispensers-washroom',
  },
  {
    id: 'microfibre-wet-and-dry-mop-refill',
    name: 'Microfibre Wet & Dry Mop Refill',
    slug: 'microfibre-wet-and-dry-mop-refill',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'equipment-accessories',
    material: 'Microfibre',
  },
  {
    id: 'kentucky-microfibre-wet-mop-refill',
    name: 'Kentucky Microfibre Wet Mop Refill',
    slug: 'kentucky-microfibre-wet-mop-refill',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'equipment-accessories',
    material: 'Microfibre',
  },
  {
    id: 'coconut-fibre-broom',
    name: 'Coconut Fibre Broom',
    slug: 'coconut-fibre-broom',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'mops-brooms-wipers',
    material: 'Coconut fibre',
  },
  {
    id: 'rubber-hand-gloves',
    name: 'Rubber Hand Gloves',
    slug: 'rubber-hand-gloves',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'personal-protection',
    material: 'Rubber',
  },
  {
    id: 'mug',
    name: 'Mug',
    slug: 'mug',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'equipment-accessories',
    variants: [
      {
        label: '1 L',
        size: '1 L',
      },
      {
        label: '1.5 L',
        size: '1.5 L',
      },
    ],
  },
  {
    id: 'bleaching-powder',
    name: 'Bleaching Powder',
    slug: 'bleaching-powder',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'cleaning-chemicals',
    variants: [
      {
        label: '1 kg',
        size: '1 kg',
      },
      {
        label: '25 kg',
        size: '25 kg',
      },
    ],
  },
  {
    id: 'caustic-soda',
    name: 'Caustic Soda',
    slug: 'caustic-soda',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'cleaning-chemicals',
  },
  {
    id: 'sponge',
    name: 'Sponge',
    slug: 'sponge',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'brushes-scrubbers-cloths',
  },
  {
    id: 'spray-bottle',
    name: 'Spray Bottle',
    slug: 'spray-bottle',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'equipment-accessories',
    variants: [
      {
        label: '500 ML (round)',
        size: '500 ML',
      },
      {
        label: '750 ML (HDPE)',
        size: '750 ML',
      },
      {
        label: '1 L (round)',
        size: '1 L',
      },
    ],
  },
  {
    id: 'tissue-box',
    name: 'Tissue Box',
    slug: 'tissue-box',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'tissues-paper',
  },
  {
    id: 'c-fold-tissue',
    name: 'C-Fold Tissue',
    slug: 'c-fold-tissue',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'tissues-paper',
  },
  {
    id: 'tissue-roll-1000-g',
    name: 'Tissue Roll (1000 g)',
    slug: 'tissue-roll-1000-g',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'tissues-paper',
    variants: [
      {
        label: '1000 g',
        size: '1000 g',
      },
    ],
  },
  {
    id: 'kitchen-tissue-roll',
    name: 'Kitchen Tissue Roll',
    slug: 'kitchen-tissue-roll',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'tissues-paper',
    variants: [
      {
        label: '2-piece pack',
      },
      {
        label: '4-piece pack',
      },
    ],
  },
  {
    id: 'm-fold-tissue',
    name: 'M-Fold Tissue',
    slug: 'm-fold-tissue',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'tissues-paper',
  },
  {
    id: 'tissue-napkin',
    name: 'Tissue Napkin',
    slug: 'tissue-napkin',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'tissues-paper',
  },
  {
    id: 'tissue-roll',
    name: 'Tissue Roll',
    slug: 'tissue-roll',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'tissues-paper',
    variants: [
      {
        label: '250 pulls',
      },
      {
        label: '350 pulls',
      },
    ],
  },
  {
    id: 'urinal-screen',
    name: 'Urinal Screen',
    slug: 'urinal-screen',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'air-care',
  },
  {
    id: 'parking-brush-set-24-inch',
    name: 'Parking Brush Set (24 inch)',
    slug: 'parking-brush-set-24-inch',
    category: CATEGORY_HYGIENE_SAFETY_HOUSEKEEPING,
    subCategory: 'mops-brooms-wipers',
  },
  {
    id: 'jute-slipper',
    name: 'Jute Slipper',
    slug: 'jute-slipper',
    category: CATEGORY_HOTEL_AMENITIES,
    variants: [
      {
        label: 'Closed Toe',
      },
      {
        label: 'Open Toe',
      },
    ],
  },
  {
    id: 'terry-room-slipper',
    name: 'Terry Room Slipper',
    slug: 'terry-room-slipper',
    category: CATEGORY_HOTEL_AMENITIES,
  },
  {
    id: 'non-woven-slipper',
    name: 'Non-woven Slipper',
    slug: 'non-woven-slipper',
    category: CATEGORY_HOTEL_AMENITIES,
    material: 'Non-woven',
  },
  {
    id: 'waffle-room-slipper',
    name: 'Waffle Room Slipper',
    slug: 'waffle-room-slipper',
    category: CATEGORY_HOTEL_AMENITIES,
  },
  {
    id: 'fleece-room-slipper',
    name: 'Fleece Room Slipper',
    slug: 'fleece-room-slipper',
    category: CATEGORY_HOTEL_AMENITIES,
  },
  {
    id: 'dental-kit',
    name: 'Dental Kit',
    slug: 'dental-kit',
    category: CATEGORY_HOTEL_AMENITIES,
  },
  {
    id: 'jute-loofah',
    name: 'Jute Loofah',
    slug: 'jute-loofah',
    category: CATEGORY_HOTEL_AMENITIES,
  },
  {
    id: 'comb',
    name: 'Comb',
    slug: 'comb',
    category: CATEGORY_HOTEL_AMENITIES,
  },
  {
    id: 'shower-cap',
    name: 'Shower Cap',
    slug: 'shower-cap',
    category: CATEGORY_HOTEL_AMENITIES,
    secondaryCategory: 'spa-salon',
  },
  {
    id: 'biodegradable-shower-cap',
    name: 'Biodegradable Shower Cap',
    slug: 'biodegradable-shower-cap',
    category: CATEGORY_HOTEL_AMENITIES,
    secondaryCategory: 'spa-salon',
  },
  {
    id: 'paper-glass',
    name: 'Paper Glass',
    slug: 'paper-glass',
    category: CATEGORY_HOTEL_AMENITIES,
  },
  {
    id: 'bed-sheet',
    name: 'Bed Sheet',
    slug: 'bed-sheet',
    category: CATEGORY_SPA_SALON,
    material: 'Non-woven',
  },
  {
    id: 'cutting-sheet-client-cap',
    name: 'Cutting Sheet / Client Cap',
    slug: 'cutting-sheet-client-cap',
    category: CATEGORY_SPA_SALON,
    material: 'Non-woven',
  },
  {
    id: 'facial-belt',
    name: 'Facial Belt',
    slug: 'facial-belt',
    category: CATEGORY_SPA_SALON,
    material: 'Non-woven',
  },
  {
    id: 'spa-slipper',
    name: 'Spa Slipper',
    slug: 'spa-slipper',
    category: CATEGORY_SPA_SALON,
  },
  {
    id: 'waxing-gown',
    name: 'Waxing Gown',
    slug: 'waxing-gown',
    category: CATEGORY_SPA_SALON,
    material: 'Non-woven',
  },
  {
    id: 'boxer-shorts',
    name: 'Boxer Shorts',
    slug: 'boxer-shorts',
    category: CATEGORY_SPA_SALON,
    material: 'Non-woven',
  },
  {
    id: 'towel',
    name: 'Towel',
    slug: 'towel',
    category: CATEGORY_SPA_SALON,
    material: 'Non-woven',
  },
  {
    id: 'non-woven-tissue',
    name: 'Non-woven Tissue',
    slug: 'non-woven-tissue',
    category: CATEGORY_SPA_SALON,
    material: 'Non-woven',
  },
  {
    id: 'self-apron',
    name: 'Self Apron',
    slug: 'self-apron',
    category: CATEGORY_SPA_SALON,
    material: 'Non-woven',
  },
  {
    id: 'cradle-cover',
    name: 'Cradle Cover',
    slug: 'cradle-cover',
    category: CATEGORY_SPA_SALON,
    material: 'Non-woven',
  },
  {
    id: 'wrap-up-bra',
    name: 'Wrap Up Bra',
    slug: 'wrap-up-bra',
    category: CATEGORY_SPA_SALON,
    material: 'Fabric',
  },
  {
    id: 'unisex-brief',
    name: 'Unisex Brief',
    slug: 'unisex-brief',
    category: CATEGORY_SPA_SALON,
    material: 'Non-woven',
  },
  {
    id: 'bouffant-cap',
    name: 'Bouffant Cap',
    slug: 'bouffant-cap',
    category: CATEGORY_SPA_SALON,
    material: 'Non-woven',
  },
  {
    id: 'garbage-bags',
    name: 'Garbage Bags',
    slug: 'garbage-bags',
    category: CATEGORY_PROTECTIVE_PACKING,
    secondaryCategory: 'hotel-amenities',
  },
  {
    id: 'epe-foam-roll',
    name: 'EPE Foam Roll',
    slug: 'epe-foam-roll',
    category: CATEGORY_PROTECTIVE_PACKING,
  },
  {
    id: 'ldpe-rolls',
    name: 'LDPE Rolls',
    slug: 'ldpe-rolls',
    category: CATEGORY_PROTECTIVE_PACKING,
  },
  {
    id: 'shrink-film',
    name: 'Shrink Film',
    slug: 'shrink-film',
    category: CATEGORY_PROTECTIVE_PACKING,
  },
  {
    id: 'ldpe-bags',
    name: 'LDPE Bags',
    slug: 'ldpe-bags',
    category: CATEGORY_PROTECTIVE_PACKING,
  },
  {
    id: 'bubble-wrap',
    name: 'Bubble Wrap',
    slug: 'bubble-wrap',
    category: CATEGORY_PROTECTIVE_PACKING,
  },
  {
    id: 'stretch-film',
    name: 'Stretch Film',
    slug: 'stretch-film',
    category: CATEGORY_PROTECTIVE_PACKING,
  },
];
