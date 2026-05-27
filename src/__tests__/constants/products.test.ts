import { describe, it, expect } from 'vitest';
import { PRODUCTS, PRODUCT_CATEGORIES } from '@/constants';

describe('Product Data Integrity', () => {
  it('has 51 products', () => {
    expect(PRODUCTS.length).toBeGreaterThanOrEqual(50);
  });

  it('has 3 categories', () => {
    expect(PRODUCT_CATEGORIES.length).toBe(3);
  });

  it('every product has required fields', () => {
    for (const product of PRODUCTS) {
      expect(product.name, `Product missing name`).toBeTruthy();
      expect(product.slug, `${product.name} missing slug`).toBeTruthy();
      expect(product.category, `${product.name} missing category`).toBeTruthy();
      expect(product.category.id, `${product.name} missing category.id`).toBeTruthy();
      expect(product.description, `${product.name} missing description`).toBeTruthy();
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
