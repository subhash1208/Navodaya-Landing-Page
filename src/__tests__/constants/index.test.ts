import { describe, it, expect } from 'vitest';
import {
  PRODUCTS,
  PRODUCT_CATEGORIES,
  PRODUCT_COUNT_BY_CATEGORY,
  PRODUCT_COUNT_BY_SUB_CATEGORY,
  SUB_CATEGORIES,
  SUB_CATEGORY_PARENT,
  productEnquiryLabel,
  productsInCategory,
  productsInSubCategory,
  productSummary,
} from '@/constants';
import type { CategorySlug } from '@/types';

/** Values that appear more than once, so a failure can name the offenders. */
function duplicates(values: string[]): string[] {
  const seen = new Set<string>();
  const repeated = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) repeated.add(value);
    seen.add(value);
  }
  return [...repeated].sort();
}

describe('catalogue invariants', () => {
  it('has a unique id for every product', () => {
    expect(duplicates(PRODUCTS.map((p) => p.id))).toEqual([]);
  });

  it('has a unique slug for every product', () => {
    expect(duplicates(PRODUCTS.map((p) => p.slug))).toEqual([]);
  });

  it('has no duplicate product names', () => {
    // The two deliberate duplicate pairs this assertion used to allow are gone: the client's
    // real catalogue lists a dual-market product ONCE, with a `secondaryCategory`, rather than
    // twice under two ids. `productEnquiryLabel` still carries the category so the business can
    // place an enquiry, but it is no longer load-bearing for disambiguation.
    expect(duplicates(PRODUCTS.map((p) => p.name))).toEqual([]);
  });

  it('gives every product a unique enquiry label', () => {
    expect(duplicates(PRODUCTS.map(productEnquiryLabel))).toEqual([]);
  });

  it('builds the enquiry label from the product name and its category name', () => {
    const product = PRODUCTS[0];
    expect(productEnquiryLabel(product)).toBe(`${product.name} — ${product.category.name}`);
  });

  it('points every product at one of the four category objects by identity', () => {
    for (const product of PRODUCTS) {
      expect(
        PRODUCT_CATEGORIES.includes(product.category),
        `${product.id} references a category object that is not in PRODUCT_CATEGORIES`,
      ).toBe(true);
    }
  });

  it('gives every product an id, name, slug and a displayable summary', () => {
    // `material`, `variants`, `description` and `image` are all optional (src/types/index.ts).
    // What has to hold is that SOMETHING renders in the card's copy slot — `productSummary`
    // composes it, and an empty return there would ship a blank paragraph on 164 cards.
    for (const product of PRODUCTS) {
      const label = product.id || product.slug || product.name || '<unidentifiable product>';
      expect(product.id, `${label} is missing id`).toBeTruthy();
      expect(product.name, `${label} is missing name`).toBeTruthy();
      expect(product.slug, `${label} is missing slug`).toBeTruthy();
      expect(productSummary(product), `${label} has no displayable summary`).toBeTruthy();
      expect(productSummary(product), `${label} summary leaked undefined`).not.toContain(
        'undefined',
      );
    }
  });

  it('subdivides only the hygiene category, and only into known sub-categories', () => {
    const known = new Set(SUB_CATEGORIES.map((s) => s.slug));
    for (const product of PRODUCTS) {
      if (product.subCategory === undefined) continue;
      expect(
        product.category.slug,
        `${product.id} carries a subCategory but is not a hygiene product`,
      ).toBe('hygiene-safety-housekeeping');
      expect(known.has(product.subCategory), `${product.id} has an unknown subCategory`).toBe(true);
    }
  });

  it('gives every hygiene product a sub-category, and uses every sub-category it declares', () => {
    // Both directions, because each failure is a different bug: a hygiene product with no
    // sub-category would fall out of any future sub-category UX, and a declared sub-category
    // with no products would render an empty section.
    const hygiene = PRODUCTS.filter((p) => p.category.slug === 'hygiene-safety-housekeeping');
    expect(hygiene.filter((p) => p.subCategory === undefined).map((p) => p.id)).toEqual([]);

    const used = new Set(PRODUCTS.map((p) => p.subCategory));
    expect(SUB_CATEGORIES.filter((s) => !used.has(s.slug)).map((s) => s.slug)).toEqual([]);
  });

  it('gives every sub-category a unique slug, a name and a description', () => {
    expect(duplicates(SUB_CATEGORIES.map((s) => s.slug))).toEqual([]);
    for (const sub of SUB_CATEGORIES) {
      expect(sub.name, `${sub.slug} is missing a name`).toBeTruthy();
      expect(sub.description, `${sub.slug} is missing a description`).toBeTruthy();
    }
  });

  it('names the subdivided category rather than leaving it hand-typed at each use site', () => {
    expect(SUB_CATEGORY_PARENT).toBe('hygiene-safety-housekeeping');
    expect(PRODUCT_CATEGORIES.some((c) => c.slug === SUB_CATEGORY_PARENT)).toBe(true);
  });

  it('agrees between the derived sub-category counts and the products themselves', () => {
    for (const sub of SUB_CATEGORIES) {
      const actual = productsInSubCategory(sub.slug).map((p) => p.id);
      expect(
        PRODUCT_COUNT_BY_SUB_CATEGORY[sub.slug],
        `${sub.slug} count disagrees with its products: ${actual.join(', ')}`,
      ).toBe(actual.length);
      expect(
        PRODUCT_COUNT_BY_SUB_CATEGORY[sub.slug],
        `${sub.slug} has no products`,
      ).toBeGreaterThan(0);
    }
  });

  it('sums the sub-category counts to exactly the subdivided category', () => {
    // No `secondaryCategory` equivalent on this axis — a product carries at most one
    // sub-category — so unlike the per-category sum above, this one must match exactly.
    const sum = SUB_CATEGORIES.reduce((n, s) => n + PRODUCT_COUNT_BY_SUB_CATEGORY[s.slug], 0);
    expect(sum).toBe(PRODUCTS.filter((p) => p.category.slug === SUB_CATEGORY_PARENT).length);
  });

  it('returns only products of the requested sub-category', () => {
    for (const sub of SUB_CATEGORIES) {
      const wrong = productsInSubCategory(sub.slug).filter((p) => p.subCategory !== sub.slug);
      expect(wrong.map((p) => p.id)).toEqual([]);
    }
  });

  it('gives every category a plate, or omits the key entirely — never an empty string', () => {
    // An empty string is falsy, so it would take the typographic-tile branch anyway; forbidding
    // it keeps "not photographed yet" expressed one way only.
    for (const category of PRODUCT_CATEGORIES) {
      expect(category.plate, `${category.slug} has an empty plate path`).not.toBe('');
      if (category.plate !== undefined) {
        expect(category.plate.startsWith('/')).toBe(true);
      }
    }
    expect(PRODUCT_CATEGORIES.filter((c) => c.plate === undefined).map((c) => c.slug)).toEqual([
      'protective-packing',
    ]);
  });

  it('prefers a real description over the composed summary when one exists', () => {
    // No product in the client's catalogue has copy today, so this branch of `productSummary`
    // is unreachable from the data and needs an explicit case.
    const base = PRODUCTS[0];
    expect(base.description).toBeUndefined();
    expect(productSummary({ ...base, description: 'Hand-written copy.' })).toBe(
      'Hand-written copy.',
    );
  });

  it('keeps the bare-fallback sentence clear of the CTA phrase and the category name', () => {
    // Both halves guard a real accessibility defect, not a style preference. `ProductCard` folds
    // this sentence into the card link's accessible name, so reusing the "Request a Quote" verb
    // phrase gave a product card and the page's real CTA the same accessible name (WCAG 2.4.4),
    // and naming the category here repeated the card's own category header.
    const bare = PRODUCTS.filter(
      (p) => !p.description && !p.material && (p.variants?.length ?? 0) <= 1,
    );
    expect(bare.length).toBeGreaterThan(0);
    for (const product of bare) {
      const summary = productSummary(product);
      expect(summary, `${product.slug} reuses the CTA phrase`).not.toMatch(/request a quote/i);
      expect(summary, `${product.slug} repeats its category name`).not.toContain(
        product.category.name,
      );
    }
    expect(productSummary(bare[0])).toBe(
      'Available for bulk supply — sizes and pricing on enquiry.',
    );
  });

  it('lists a dual-category product under both of its categories', () => {
    const dual = PRODUCTS.filter((p) => p.secondaryCategory !== undefined);
    expect(dual.length).toBeGreaterThan(0);
    for (const product of dual) {
      const secondary = product.secondaryCategory as CategorySlug;
      expect(secondary).not.toBe(product.category.slug);
      expect(productsInCategory(product.category.slug)).toContain(product);
      // The whole point of the field: it must also appear in the OTHER category's listing.
      expect(productsInCategory(secondary)).toContain(product);
    }
  });

  it('derives a per-category count that matches the products in that category', () => {
    for (const category of PRODUCT_CATEGORIES) {
      // `productsInCategory`, not `p.category === category`: the count beside each tab has to
      // match the grid the tab shows, and the grid includes `secondaryCategory` products.
      const actual = productsInCategory(category.slug).map((p) => p.id);
      expect(
        PRODUCT_COUNT_BY_CATEGORY[category.slug],
        `${category.slug} count disagrees with its products: ${actual.join(', ')}`,
      ).toBe(actual.length);
    }
  });

  it('sums the derived per-category counts to the catalogue plus its dual listings', () => {
    const sum = PRODUCT_CATEGORIES.reduce((n, c) => n + PRODUCT_COUNT_BY_CATEGORY[c.slug], 0);
    const uncategorised = PRODUCTS.filter((p) => !PRODUCT_CATEGORIES.includes(p.category)).map(
      (p) => p.id,
    );
    const dualListed = PRODUCTS.filter((p) => p.secondaryCategory !== undefined).length;
    expect(uncategorised).toEqual([]);
    // Deliberately NOT `PRODUCTS.length`: a product with a `secondaryCategory` is counted by
    // both of its categories, because it is shown in both of their listings.
    expect(sum).toBe(PRODUCTS.length + dualListed);
  });

  it('gives every category at least one product', () => {
    for (const category of PRODUCT_CATEGORIES) {
      expect(
        PRODUCT_COUNT_BY_CATEGORY[category.slug],
        `category "${category.slug}" has no products`,
      ).toBeGreaterThan(0);
    }
  });
});
