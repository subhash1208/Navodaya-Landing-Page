import { describe, it, expect } from 'vitest';
import { PRODUCTS, PRODUCT_CATEGORIES, productSummary } from '@/constants';

describe('Product Data Integrity', () => {
  it('has the client catalogue in full', () => {
    // Exact, not `>=`: this is the reconciled count from the client's spreadsheet
    // (dev-tools/catalogue/catalogue-final.json), so a drift in either direction is a
    // regeneration bug rather than a product launch.
    expect(PRODUCTS.length).toBe(164);
  });

  it('has 4 categories', () => {
    expect(PRODUCT_CATEGORIES.length).toBe(4);
  });

  it('every product has required fields', () => {
    for (const product of PRODUCTS) {
      expect(product.name, `Product missing name`).toBeTruthy();
      expect(product.slug, `${product.name} missing slug`).toBeTruthy();
      expect(product.category, `${product.name} missing category`).toBeTruthy();
      expect(product.category.id, `${product.name} missing category.id`).toBeTruthy();
      // `description` is deliberately NOT asserted: the client's catalogue supplies no product
      // copy, so every product is currently without one and `productSummary()` composes the
      // displayed sentence from the data that does exist.
      expect(productSummary(product), `${product.name} has no displayable summary`).toBeTruthy();
    }
  });

  it('every product slug is unique', () => {
    const slugs = PRODUCTS.map((p) => p.slug);
    const uniqueSlugs = new Set(slugs);
    expect(uniqueSlugs.size).toBe(slugs.length);
  });

  it('every product slug is URL-safe', () => {
    for (const product of PRODUCTS) {
      expect(product.slug).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it('every product belongs to a valid category', () => {
    const categoryIds = new Set(PRODUCT_CATEGORIES.map((c) => c.id));
    for (const product of PRODUCTS) {
      expect(
        categoryIds.has(product.category.id),
        `${product.name} has invalid category ID: ${product.category.id}`,
      ).toBe(true);
    }
  });

  it('every category has at least one product', () => {
    for (const category of PRODUCT_CATEGORIES) {
      const count = PRODUCTS.filter((p) => p.category.id === category.id).length;
      expect(count, `Category "${category.name}" has no products`).toBeGreaterThan(0);
    }
  });

  it('every category has required fields', () => {
    for (const category of PRODUCT_CATEGORIES) {
      expect(category.name, 'Category missing name').toBeTruthy();
      expect(category.slug, `${category.name} missing slug`).toBeTruthy();
      expect(category.id, `${category.name} missing id`).toBeTruthy();
    }
  });
});

// The photo-extraction pipeline produced 54 candidate images; a full-resolution visual audit
// approved 42 and rejected 12. These tests lock that audit's outcome into the data layer, because
// the rejection reason is a client requirement rather than a matter of taste.
describe('Product photographs', () => {
  const photographed = PRODUCTS.filter((p) => p.image);

  it('carries a photograph on exactly the 42 approved products', () => {
    // Exact, not `>=`: 42 is the approved count. A higher number means an unapproved photo was
    // wired in; a lower one means the emitter dropped the key.
    expect(photographed.length).toBe(42);
  });

  it('points every photograph at its own product slug under /products', () => {
    for (const product of photographed) {
      expect(product.image, `${product.name} has a mismatched image path`).toBe(
        `/products/${product.slug}.webp`,
      );
      expect(product.slug, `${product.name} slug diverges from id`).toBe(product.id);
    }
  });

  it('never ships a photograph for a slug the audit rejected', () => {
    // These 12 candidates carry third-party supplier branding or are mis-mapped. The client's
    // binding requirement is that supplier branding never appears in a product image, so a photo
    // reappearing on any of these is a client-requirement violation, not a cosmetic regression.
    const REJECTED = [
      'long-wiper',
      'double-rubber-wiper',
      'brush-set-wooden',
      'tiles-scrubber',
      'cobweb-brush',
      'sink-brush',
      'dry-mop-refill',
      'glass-cleaning-kit-box',
      'steel-swing-lid-dust-bin',
      'bucket',
      'pedal-dust-bin',
      'dust-pan',
    ];
    for (const slug of REJECTED) {
      const product = PRODUCTS.find((p) => p.slug === slug);
      expect(product, `rejected slug "${slug}" is not in the catalogue at all`).toBeTruthy();
      expect(product?.image, `rejected photograph shipped for "${slug}"`).toBeUndefined();
    }
  });
});
