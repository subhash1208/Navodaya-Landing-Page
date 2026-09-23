import { test, expect } from '@playwright/test';

test.describe('Product Search & Filter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    // `/products` renders its grid entirely on the CLIENT. `ProductGrid` calls
    // `useSearchParams()` (src/components/ui/ProductGrid.tsx:15), which puts it behind a
    // Suspense boundary — so the prerendered HTML contains zero product links and no search
    // box at all. Verified: `.next/server/app/products.html` matches `href="/products/…"`
    // 0 times and `type="search"` 0 times.
    //
    // `networkidle` only means the network went quiet; it says nothing about React having
    // hydrated and committed. Reading a count before that legitimately returns 0, and
    // `fill()` on the search box writes straight to the DOM of a *controlled* input
    // (`value={query}`, ProductGrid.tsx:76) whose `onChange` is not attached yet — React
    // never learns about the keystroke and clobbers the value on its first render.
    //
    // A visible product card is the honest hydration signal: the cards only exist once the
    // client has rendered. This flake cost a full gate-7 run — the spec passed in isolation
    // in 1.9s and failed under seven parallel workers.
    await expect(page.locator('a[href^="/products/"]').first()).toBeVisible();
  });

  test('search input is visible', async ({ page }) => {
    const searchInput = page.locator(
      'input[type="search"], input[placeholder*="search" i], input[placeholder*="Search" i]',
    );
    await expect(searchInput).toBeVisible();
  });

  test('typing in search filters products', async ({ page }) => {
    const searchInput = page.locator(
      'input[type="search"], input[placeholder*="search" i], input[placeholder*="Search" i]',
    );
    const productCards = page.locator('a[href^="/products/"]');
    const initialCount = await productCards.count();

    await searchInput.fill('Surgeon');

    // Poll for the filtered count rather than sleeping 300ms and hoping. The old fixed
    // wait was both slower than it needed to be and not actually a guarantee.
    await expect.poll(() => productCards.count()).toBeLessThan(initialCount);
    expect(await productCards.count()).toBeGreaterThan(0);
  });

  test('search with no results shows empty state', async ({ page }) => {
    const searchInput = page.locator(
      'input[type="search"], input[placeholder*="search" i], input[placeholder*="Search" i]',
    );
    await searchInput.fill('xyznonexistentproduct123');

    // `toBeVisible()` already auto-waits, so the 300ms sleep that used to sit here bought
    // nothing but wall-clock time.
    const emptyState = page.locator('text=/no.*found|no.*results|no.*products/i');
    await expect(emptyState).toBeVisible();
  });

  test('category tabs filter products', async ({ page }) => {
    // Assert the tabs exist rather than guarding on `if (tabCount > 0)`. ProductGrid
    // renders a real `role="tablist"` with `role="tab"` children (ProductGrid.tsx:102,107),
    // so absence is a failure, not a reason to skip — the old guard let this test pass
    // vacuously, having asserted nothing at all, whenever the grid had not rendered yet.
    const tabs = page.locator('button[role="tab"]');
    await expect(tabs.first()).toBeVisible();
    expect(await tabs.count()).toBeGreaterThan(1);

    // Click the second tab (not "All")
    await tabs.nth(1).click();

    const productCards = page.locator('a[href^="/products/"]');
    await expect.poll(() => productCards.count()).toBeLessThan(50);
    expect(await productCards.count()).toBeGreaterThan(0);
  });

  test('result count updates on filter', async ({ page }) => {
    // The rendered card count IS the result count. The previous version matched
    // text=/\d+.*product|showing.*\d+/i, which hit both the page intro copy
    // ("50+ products across…") and a category tab badge ("50 products") — a strict
    // mode violation — and then silently skipped its assertions behind isVisible().
    const productCards = page.locator('a[href^="/products/"]');
    const initialCount = await productCards.count();
    expect(initialCount).toBeGreaterThan(0);

    const searchInput = page.locator(
      'input[type="search"], input[placeholder*="search" i], input[placeholder*="Search" i]',
    );
    await searchInput.fill('Gloves');

    await expect.poll(() => productCards.count()).toBeLessThan(initialCount);
  });
});
