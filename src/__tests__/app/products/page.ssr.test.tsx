import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import ProductsPage from '@/app/products/page';
import {
  PRODUCTS,
  PRODUCT_CATEGORIES,
  SUB_CATEGORIES,
  SUB_CATEGORY_PARENT,
  productsInCategory,
  productsInSubCategory,
} from '@/constants';

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

/**
 * Anchor hrefs only, with the leading `<a ` trimmed back off.
 *
 * These tests are about the links a crawler follows, so the match is scoped to the anchor. A bare
 * /href="\/products\/[^"]+"/ is NOT equivalent, and the difference is not hypothetical: it returns
 * 42 extra entries here, one per photographed product, inflating every count in this file.
 *
 * The cause is a test-environment artifact, and it is worth naming precisely so nobody "fixes" it
 * in the wrong place. React 19's server renderer hoists a `<link rel="preload" as="image" href=…>`
 * for any `<img>` it renders WITHOUT `loading="lazy"` — verified directly against react 19.2.4:
 * `renderToStaticMarkup(<img src="/products/x.webp" sizes="90vw" />)` emits the link, and the same
 * element with `loading="lazy"` emits no link at all. `src/__tests__/setup.ts:27-31` mocks
 * `next/image` to a bare `React.createElement('img', props)`, which forwards only the props
 * `ProductCard` passes and so drops the `loading="lazy"` the real component defaults to. Production
 * is unaffected: the real `next/image` ships `loading="lazy"`, and the built `/products` HTML
 * contains zero `href="/products/*.webp"`.
 */
function catalogueHrefs(html: string): Set<string> {
  return new Set((html.match(/<a href="\/products\/[^"]+"/g) ?? []).map((m) => m.slice(3)));
}

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

    const hrefs = catalogueHrefs(html);
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

      // `productsInCategory`, not a bare `p.category.slug ===`: a product carrying a
      // `secondaryCategory` belongs to two listings, and asserting on `category` alone would
      // demand it be EXCLUDED from the very listing it is supposed to appear in.
      const expected = productsInCategory(slug);
      const excluded = PRODUCTS.filter((p) => !expected.includes(p));
      expect(expected.length).toBeGreaterThan(0);

      const hrefs = catalogueHrefs(html);
      expect(hrefs.size).toBe(expected.length);
      expected.forEach((p) => expect(hrefs.has(`href="/products/${p.slug}"`)).toBe(true));
      excluded.forEach((p) => expect(hrefs.has(`href="/products/${p.slug}"`)).toBe(false));

      expect(html).toContain(`aria-labelledby="tab-${slug}"`);
    },
  );

  it('falls back to the full catalogue for an unknown ?category=', async () => {
    const html = await renderPage({ category: 'not-a-real-category' });

    const hrefs = catalogueHrefs(html);
    expect(hrefs.size).toBe(PRODUCTS.length);
    expect(html).toContain('aria-labelledby="tab-all"');
    expect(html).not.toContain('No products found');
  });

  it('falls back to the full catalogue for a repeated ?category= (array value)', async () => {
    const html = await renderPage({ category: ['hygiene-safety-housekeeping', 'spa-salon'] });

    const hrefs = catalogueHrefs(html);
    expect(hrefs.size).toBe(PRODUCTS.length);
    expect(html).toContain('aria-labelledby="tab-all"');
  });

  it('server-renders the page heading and breadcrumb', async () => {
    const html = await renderPage({});

    expect(html).toMatch(/<h1[^>]*>Product Catalogue<\/h1>/);
    expect(html).toContain('href="/"');
  });
});

/**
 * `?sub=` has to be resolved on the server for exactly the reason `?category=` is: a shared or
 * crawled sub-category link must arrive already filtered in the HTML, not after hydration.
 *
 * The invalid cases all resolve to the unfiltered category rather than an empty grid — including
 * the one specific to this axis, a real sub-category slug paired with a category that is not the
 * one it subdivides.
 *
 * **What this block does and does not prove.** It proves `resolveSubCategory`'s branches — every
 * valid slug, and all four rejected inputs — and it proves the page composes the resulting prop
 * into filtered markup. It does **not** prove the production server does the same, and it once
 * reported exactly the opposite of the truth: all ten `it.each` cases passed while `pnpm start`
 * returned the whole 133-product category for every one of them. Vitest treats `'use client'` as an
 * inert string literal, so the `SUB_PARAM` this file reads is a real `'sub'`; under a real RSC
 * build it was a client-reference stub and `params[SUB_PARAM]` was `undefined`. No test running in
 * this module graph can ever see that class of bug.
 *
 * The evidence for the server's actual output is therefore the sibling e2e assertion, `a ?sub= URL
 * is filtered by the server, before any JavaScript runs` in `e2e/product-search.spec.ts`, which
 * fetches the built server's HTML over HTTP. Keep the two together: this one localises a
 * resolution bug in milliseconds, that one is the only thing that can fail on a boundary bug.
 */
describe('ProductsPage sub-category server rendering', () => {
  it.each(SUB_CATEGORIES.map((s) => s.slug))(
    'server-renders exactly the %s products for ?sub=',
    async (slug) => {
      const html = await renderPage({ category: SUB_CATEGORY_PARENT, sub: slug });

      const expected = productsInSubCategory(slug);
      expect(expected.length).toBeGreaterThan(0);

      const hrefs = catalogueHrefs(html);
      expect(hrefs.size).toBe(expected.length);
      expected.forEach((p) => expect(hrefs.has(`href="/products/${p.slug}"`)).toBe(true));
    },
  );

  it('server-renders the refinement row as a group, never as a second tablist', async () => {
    const html = await renderPage({ category: SUB_CATEGORY_PARENT });

    expect(html).toContain('aria-label="Refine by sub-category"');
    expect(html).toContain('role="group"');
    expect(html.match(/role="tablist"/g)).toHaveLength(1);
    SUB_CATEGORIES.forEach((s) => expect(html).toContain(escapeHtml(s.name)));
  });

  it('omits the refinement row for every category that is not subdivided', async () => {
    for (const category of PRODUCT_CATEGORIES.filter((c) => c.slug !== SUB_CATEGORY_PARENT)) {
      const html = await renderPage({ category: category.slug });
      expect(html).not.toContain('aria-label="Refine by sub-category"');
    }

    expect(await renderPage({})).not.toContain('aria-label="Refine by sub-category"');
  });

  it('ignores an unknown ?sub= and renders the whole category', async () => {
    const html = await renderPage({ category: SUB_CATEGORY_PARENT, sub: 'not-a-real-subcategory' });

    const hrefs = catalogueHrefs(html);
    expect(hrefs.size).toBe(productsInCategory(SUB_CATEGORY_PARENT).length);
    expect(html).not.toContain('No products found');
  });

  it('ignores a ?sub= paired with a category that does not subdivide', async () => {
    // A real slug, but `air-care` is a subdivision of hygiene, not of spa-salon. Honouring the
    // pairing would render a guaranteed-empty grid off a hand-edited address bar.
    const html = await renderPage({ category: 'spa-salon', sub: 'air-care' });

    const hrefs = catalogueHrefs(html);
    expect(hrefs.size).toBe(productsInCategory('spa-salon').length);
    expect(html).toContain('aria-labelledby="tab-spa-salon"');
    expect(html).not.toContain('aria-label="Refine by sub-category"');
  });

  it('ignores a ?sub= with no ?category= at all', async () => {
    const html = await renderPage({ sub: 'air-care' });

    const hrefs = catalogueHrefs(html);
    expect(hrefs.size).toBe(PRODUCTS.length);
    expect(html).toContain('aria-labelledby="tab-all"');
  });

  it('ignores a repeated ?sub= (array value)', async () => {
    const html = await renderPage({
      category: SUB_CATEGORY_PARENT,
      sub: ['air-care', 'tissues-paper'],
    });

    const hrefs = catalogueHrefs(html);
    expect(hrefs.size).toBe(productsInCategory(SUB_CATEGORY_PARENT).length);
  });
});
