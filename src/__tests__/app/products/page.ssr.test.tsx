import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import ProductsPage from '@/app/products/page';
import { PRODUCTS, PRODUCT_CATEGORIES } from '@/constants';

/**
 * Server-rendering regression tests for the product catalogue.
 *
 * The bug these exist for: `ProductGrid` called `useSearchParams()`, and per
 * `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/use-search-params.md:82`
 * that "will cause the Client Component tree up to the closest Suspense boundary to be
 * client-side rendered". `/products` therefore shipped nothing but ten pulsing skeleton divs —
 * no product name, no card, no `/products/<slug>` link — to crawlers and to anyone without JS,
 * while every unit test passed because jsdom only ever observes post-hydration DOM.
 *
 * `renderToStaticMarkup` never runs effects, so it observes the true server branch. These
 * assertions are the only ones in the suite that can fail if the CSR bailout ever returns.
 *
 * `next/link` is mocked to a bare anchor because it is a framework boundary, not the subject —
 * the `href` is what a crawler follows and the mock preserves it verbatim. `lucide-react` is
 * deliberately NOT mocked: it server-renders fine, and a mock would only add a way to be wrong.
 */

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: Record<string, unknown>) => (
    <a href={href as string} {...props}>
      {children as React.ReactNode}
    </a>
  ),
}));

/** Product copy reaches the HTML entity-escaped; compare like for like. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function renderPage(searchParams: Record<string, string | string[] | undefined>) {
  return renderToStaticMarkup(await ProductsPage({ searchParams: Promise.resolve(searchParams) }));
}

describe('ProductsPage server rendering', () => {
  it(`server-renders all ${PRODUCTS.length} product names for a bare /products`, async () => {
    const html = await renderPage({});

    const missing = PRODUCTS.filter((p) => !html.includes(escapeHtml(p.name))).map((p) => p.name);
    expect(missing).toEqual([]);
  });

  it('server-renders one catalogue link per product', async () => {
    const html = await renderPage({});

    const hrefs = new Set(html.match(/href="\/products\/[^"]+"/g) ?? []);
    expect(hrefs.size).toBe(PRODUCTS.length);
    PRODUCTS.forEach((p) => expect(hrefs.has(`href="/products/${p.slug}"`)).toBe(true));
  });

  it('server-renders the search field and category tabs, not a loading skeleton', async () => {
    const html = await renderPage({});

    expect(html).toContain('type="search"');
    expect(html).toContain('role="tablist"');
    expect(html).not.toContain('aria-busy="true"');
    expect(html).not.toContain('animate-pulse');
  });

  it.each(PRODUCT_CATEGORIES.map((c) => c.slug))(
    'server-renders exactly the %s catalogue for ?category=',
    async (slug) => {
      const html = await renderPage({ category: slug });

      const expected = PRODUCTS.filter((p) => p.category.slug === slug);
      const excluded = PRODUCTS.filter((p) => p.category.slug !== slug);
      expect(expected.length).toBeGreaterThan(0);

      const hrefs = new Set(html.match(/href="\/products\/[^"]+"/g) ?? []);
      expect(hrefs.size).toBe(expected.length);
      expected.forEach((p) => expect(hrefs.has(`href="/products/${p.slug}"`)).toBe(true));
      excluded.forEach((p) => expect(hrefs.has(`href="/products/${p.slug}"`)).toBe(false));

      expect(html).toContain(`aria-labelledby="tab-${slug}"`);
    },
  );

  it('falls back to the full catalogue for an unknown ?category=', async () => {
    const html = await renderPage({ category: 'not-a-real-category' });

    const hrefs = new Set(html.match(/href="\/products\/[^"]+"/g) ?? []);
    expect(hrefs.size).toBe(PRODUCTS.length);
    expect(html).toContain('aria-labelledby="tab-all"');
    expect(html).not.toContain('No products found');
  });

  it('falls back to the full catalogue for a repeated ?category= (array value)', async () => {
    const html = await renderPage({ category: ['hygiene-safety', 'spa-salon'] });

    const hrefs = new Set(html.match(/href="\/products\/[^"]+"/g) ?? []);
    expect(hrefs.size).toBe(PRODUCTS.length);
    expect(html).toContain('aria-labelledby="tab-all"');
  });

  it('server-renders the page heading and breadcrumb', async () => {
    const html = await renderPage({});

    expect(html).toMatch(/<h1[^>]*>Product Catalogue<\/h1>/);
    expect(html).toContain('href="/"');
  });
});
