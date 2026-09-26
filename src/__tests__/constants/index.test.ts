import { describe, it, expect } from 'vitest';
import {
  PRODUCTS,
  PRODUCT_CATEGORIES,
  PRODUCT_COUNT_BY_CATEGORY,
  productEnquiryLabel,
} from '@/constants';

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

  it('has exactly two known duplicate names and no others', () => {
    // These two pairs are deliberate — the same product exists in two categories.
    // `productEnquiryLabel` is what disambiguates them for the contact form; a THIRD
    // duplicate name must not appear unnoticed, hence the exact-match assertion.
    expect(duplicates(PRODUCTS.map((p) => p.name))).toEqual([
      'Biodegradable Shower Cap',
      'Disposable Bouffant Cap',
    ]);
  });

  it('gives every product a unique enquiry label', () => {
    expect(duplicates(PRODUCTS.map(productEnquiryLabel))).toEqual([]);
  });

  it('builds the enquiry label from the product name and its category name', () => {
    const product = PRODUCTS[0];
    expect(productEnquiryLabel(product)).toBe(`${product.name} — ${product.category.name}`);
  });

  it('points every product at one of the three category objects by identity', () => {
    for (const product of PRODUCTS) {
      expect(
        PRODUCT_CATEGORIES.includes(product.category),
        `${product.id} references a category object that is not in PRODUCT_CATEGORIES`,
      ).toBe(true);
    }
  });

  it('gives every product an id, name, slug and description', () => {
    // `material` is optional (src/types/index.ts) and is deliberately not asserted.
    for (const product of PRODUCTS) {
      const label = product.id || product.slug || product.name || '<unidentifiable product>';
      expect(product.id, `${label} is missing id`).toBeTruthy();
      expect(product.name, `${label} is missing name`).toBeTruthy();
      expect(product.slug, `${label} is missing slug`).toBeTruthy();
      expect(product.description, `${label} is missing description`).toBeTruthy();
    }
  });

  it('derives a per-category count that matches the products in that category', () => {
    for (const category of PRODUCT_CATEGORIES) {
      const actual = PRODUCTS.filter((p) => p.category === category).map((p) => p.id);
      expect(
        PRODUCT_COUNT_BY_CATEGORY[category.slug],
        `${category.slug} count disagrees with its products: ${actual.join(', ')}`,
      ).toBe(actual.length);
    }
  });

  it('sums the derived per-category counts to the size of the catalogue', () => {
    const sum = PRODUCT_CATEGORIES.reduce((n, c) => n + PRODUCT_COUNT_BY_CATEGORY[c.slug], 0);
    const uncategorised = PRODUCTS.filter((p) => !PRODUCT_CATEGORIES.includes(p.category)).map(
      (p) => p.id,
    );
    expect(uncategorised).toEqual([]);
    expect(sum).toBe(PRODUCTS.length);
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
