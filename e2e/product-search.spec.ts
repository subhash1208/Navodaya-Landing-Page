import { test, expect, type Locator } from '@playwright/test';
import {
  PRODUCTS,
  PRODUCT_CATEGORIES,
  PRODUCT_COUNT_BY_SUB_CATEGORY,
  SUB_CATEGORY_PARENT,
  productsInCategory,
} from '@/constants';

// The first category tab after "All" — `ProductGrid` builds its tablist as
// `['All Products', ...PRODUCT_CATEGORIES]`, so `tabs.nth(1)` is this one. Derived rather than
// named, so reordering the catalogue's categories cannot silently point this spec at a
// different tab than the one it clicks.
const FIRST_CATEGORY = PRODUCT_CATEGORIES[0];

/**
 * `/products` is server-rendered as of the `products-ssr` change: `ProductGrid` no longer calls
 * `useSearchParams()`, so the catalogue is in the HTML the server sends rather than being painted
 * by the client. That fixes crawlability — and it removes the hydration signal this spec used to
 * rely on.
 *
 * The old `beforeEach` waited for a product card to become visible, which worked only because
 * cards did not exist until React had rendered on the client. They now exist immediately, so that
 * wait proves nothing, while the race it guarded against is unchanged: `fill()` on a *controlled*
 * input (`value={query}`, ProductGrid.tsx) writes to the DOM, and if `onChange` is not attached
 * yet React clobbers the value on its first render.
 *
 * So gate on the thing that is actually true only after hydration: a typed value that survives.
 * Retrying the fill is the honest form — it cannot pass early, and it costs nothing once React is
 * up, unlike a fixed sleep.
 */
async function typeWhenHydrated(input: Locator, value: string): Promise<void> {
  await expect
    .poll(async () => {
      await input.fill(value);
      return input.inputValue();
    })
    .toBe(value);
}

test.describe('Product Search & Filter', () => {
  test('server-renders the whole catalogue for crawlers and no-JS visitors', async ({
    request,
  }) => {
    // Raw HTTP: no browser, no JavaScript, no hydration — exactly what a crawler sees. This is
    // the regression guard for the bug the page shipped with, where the server sent ten pulsing
    // skeleton divs and zero product links.
    const html = await (await request.get('/products')).text();

    const hrefs = new Set(html.match(/href="\/products\/[^"]+"/g) ?? []);
    expect(hrefs.size).toBe(PRODUCTS.length);
    expect(html).toContain('type="search"');
    expect(html).not.toContain('aria-busy="true"');
  });

  test.describe('after hydration', () => {
    let searchInput: Locator;

    test.beforeEach(async ({ page }) => {
      await page.goto('/products');
      await page.waitForLoadState('networkidle');

      searchInput = page.locator(
        'input[type="search"], input[placeholder*="search" i], input[placeholder*="Search" i]',
      );

      // Prove interactivity once, here, so each test below can interact without re-racing.
      await typeWhenHydrated(searchInput, 'hydration probe');
      await searchInput.fill('');
      await expect.poll(() => page.locator('a[href^="/products/"]').count()).toBe(PRODUCTS.length);
    });

    test('search input is visible', async () => {
      await expect(searchInput).toBeVisible();
    });

    test('typing in search filters products', async ({ page }) => {
      const productCards = page.locator('a[href^="/products/"]');
      const initialCount = await productCards.count();

      await searchInput.fill('Surgeon');

      // Poll for the filtered count rather than sleeping 300ms and hoping. The old fixed
      // wait was both slower than it needed to be and not actually a guarantee.
      await expect.poll(() => productCards.count()).toBeLessThan(initialCount);
      expect(await productCards.count()).toBeGreaterThan(0);
    });

    test('search with no results shows empty state', async ({ page }) => {
      await searchInput.fill('xyznonexistentproduct123');

      // `toBeVisible()` already auto-waits, so the 300ms sleep that used to sit here bought
      // nothing but wall-clock time.
      const emptyState = page.locator('text=/no.*found|no.*results|no.*products/i');
      await expect(emptyState).toBeVisible();
    });

    test('category tabs filter products', async ({ page }) => {
      // Assert the tabs exist rather than guarding on `if (tabCount > 0)`. ProductGrid
      // renders a real `role="tablist"` with `role="tab"` children, so absence is a failure,
      // not a reason to skip — the old guard let this test pass vacuously, having asserted
      // nothing at all, whenever the grid had not rendered yet.
      const tabs = page.locator('button[role="tab"]');
      await expect(tabs.first()).toBeVisible();
      expect(await tabs.count()).toBeGreaterThan(1);

      // Click the second tab (not "All")
      await tabs.nth(1).click();

      const productCards = page.locator('a[href^="/products/"]');
      // The exact count the tab's own label promises, not a `toBeLessThan(50)` ceiling: the
      // largest category holds 133 of 164 products, so a ceiling that once meant "filtered"
      // either passes vacuously or fails for the wrong reason the moment the catalogue moves.
      await expect
        .poll(() => productCards.count())
        .toBe(productsInCategory(FIRST_CATEGORY.slug).length);
      expect(await productCards.count()).toBeGreaterThan(0);

      // The filter is now part of the URL contract the server reads back.
      await expect.poll(() => new URL(page.url()).searchParams.get('category')).not.toBeNull();
    });

    test('a ?category= URL is filtered by the server, before any JavaScript runs', async ({
      request,
    }) => {
      const html = await (await request.get('/products?category=spa-salon')).text();

      const hrefs = new Set(html.match(/href="\/products\/[^"]+"/g) ?? []);
      expect(hrefs.size).toBe(productsInCategory('spa-salon').length);
      expect(html).toContain('aria-labelledby="tab-spa-salon"');
    });

    /**
     * The only test in the repo that can fail on the `?sub=` boundary bug.
     *
     * `src/__tests__/app/products/page.ssr.test.tsx` asserts the same counts and passed throughout
     * the defect: under Vitest `'use client'` is an inert string, so `SUB_PARAM` was the real
     * `'sub'` there. In a real RSC build it was a `registerClientReference` stub, `params[SUB_PARAM]`
     * was `undefined`, and the server returned all 133 products of the category for every `?sub=`
     * URL — shared links, bookmarks, back-button and crawlers alike. Only HTML from a built server
     * carries that distinction, so only this assertion carries the guarantee.
     *
     * `request` rather than a `javaScriptEnabled: false` page, matching the `?category=` sibling
     * above: it is a raw HTTP GET, so there is no hydration that could repair the markup after the
     * fact and nothing to wait on.
     */
    test('a ?sub= URL is filtered by the server, before any JavaScript runs', async ({
      request,
    }) => {
      const html = await (
        await request.get(`/products?category=${SUB_CATEGORY_PARENT}&sub=air-care`)
      ).text();

      const hrefs = new Set(html.match(/href="\/products\/[^"]+"/g) ?? []);
      expect(hrefs.size).toBe(PRODUCT_COUNT_BY_SUB_CATEGORY['air-care']);
      // Guards the assertion above against passing for the wrong reason: the sub-category slice is
      // a strict subset of the category, so a count check alone would also be satisfied by a
      // catalogue that had shrunk to exactly that size.
      expect(hrefs.size).toBeLessThan(productsInCategory(SUB_CATEGORY_PARENT).length);
      expect(html).toContain(`aria-labelledby="tab-${SUB_CATEGORY_PARENT}"`);
    });

    test('result count updates on filter', async ({ page }) => {
      // The rendered card count IS the result count. The previous version matched
      // text=/\d+.*product|showing.*\d+/i, which hit both the page intro copy
      // ("164 products across…") and a category tab badge ("164 products") — a strict
      // mode violation — and then silently skipped its assertions behind isVisible().
      const productCards = page.locator('a[href^="/products/"]');
      const initialCount = await productCards.count();
      expect(initialCount).toBeGreaterThan(0);

      await searchInput.fill('Gloves');

      await expect.poll(() => productCards.count()).toBeLessThan(initialCount);
    });
  });
});
