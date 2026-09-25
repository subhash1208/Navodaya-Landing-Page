import type { CategorySlug } from '@/types';

/**
 * Category colours are identifiers, not decoration — a 2px rule only, keyed by slug.
 *
 * `satisfies Record<CategorySlug, string>` is the point of this module: three hand-maintained
 * copies of this map previously returned `undefined` for an unrecognised slug, so a fourth
 * category would have rendered a rule `<span>` with no background instead of failing. Adding a
 * slug to `CategorySlug` without adding it here is now a compile error.
 */
export const CATEGORY_RULE = {
  'hygiene-safety': 'bg-category-hygiene',
  'hotel-amenities': 'bg-category-hotel',
  'spa-salon': 'bg-category-spa',
} satisfies Record<CategorySlug, string>;
