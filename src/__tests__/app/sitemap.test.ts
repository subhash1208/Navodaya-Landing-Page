import { describe, it, expect } from 'vitest';
import sitemap from '@/app/sitemap';
import { PRODUCTS, ROUTES, SITE_URL } from '@/constants';

const ORIGIN = new URL(SITE_URL).origin;

describe('sitemap', () => {
  it('lists the home page, the catalogue page and every product', () => {
    expect(sitemap()).toHaveLength(PRODUCTS.length + 2);
  });

  it('emits absolute URLs on the metadataBase origin', () => {
    for (const entry of sitemap()) {
      expect(entry.url.startsWith(`${ORIGIN}/`)).toBe(true);
      expect(new URL(entry.url).origin).toBe(ORIGIN);
    }
  });

  it('includes the home and products routes', () => {
    const urls = sitemap().map((entry) => entry.url);
    expect(urls).toContain(`${ORIGIN}${ROUTES.HOME}`);
    expect(urls).toContain(`${ORIGIN}${ROUTES.PRODUCTS}`);
  });

  it('includes every product slug exactly once', () => {
    const urls = sitemap().map((entry) => entry.url);
    for (const product of PRODUCTS) {
      const expected = `${ORIGIN}${ROUTES.PRODUCT(product.slug)}`;
      expect(urls.filter((url) => url === expected)).toHaveLength(1);
    }
  });

  it('contains no fragment URLs', () => {
    for (const entry of sitemap()) {
      expect(entry.url).not.toContain('#');
    }
  });

  it('omits lastModified so entries do not restamp on every deploy', () => {
    for (const entry of sitemap()) {
      expect(entry.lastModified).toBeUndefined();
    }
  });
});
