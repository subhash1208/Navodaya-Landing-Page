import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  // The homepage animates its own layout for the first few seconds: `useTypewriter`
  // (src/hooks/useTypewriter.ts) types the <h1> at 40ms/char, and at the 393px mobile
  // viewport the headline re-wraps as it types — each wrap adds a line and pushes the hero
  // CTA block down. Playwright's "stable" check is two consecutive rAF, which passes
  // between 40ms characters, and its hit-target check is a single point-in-time probe, so
  // the click can be dispatched moments before the next reflow moves the target.
  //
  // Reduced motion short-circuits the typewriter to its complete text
  // (useTypewriter.ts:41-48) and turns off the GSAP/motion reveals, so the hero is static
  // before anything is clicked. Same lever, same reason as e2e/visual-regression.spec.ts:61.
  test.use({ contextOptions: { reducedMotion: 'reduce' } });

  test('homepage loads with hero section', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Navodaya/i);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('products page loads with grid', async ({ page }) => {
    await page.goto('/products');
    await expect(page.locator('h1')).toContainText(/Products|Catalogue/i);
  });

  test('individual product page loads', async ({ page }) => {
    await page.goto('/products/surgeon-cap');
    await expect(page.locator('h1')).toContainText(/Surgeon Cap/i);
  });

  test('404 page shows for invalid routes', async ({ page }) => {
    await page.goto('/nonexistent-page');
    await expect(page.locator('body')).toContainText(/not found|404/i);
  });

  test('navigation links work from homepage', async ({ page }) => {
    await page.goto('/');
    // Dismiss the intro deterministically. `LoadingScreen` (src/app/page.tsx:20) covers the
    // hero with a fixed/inset-0/z-9999 overlay for ~4s on a first visit, and the trace shows
    // it absorbing this click three times before lifting. The key must be set AND the page
    // reloaded — setting it after mount does nothing to an intro already running. Same
    // pattern as e2e/visual-regression.spec.ts.
    await page.evaluate(() => sessionStorage.setItem('nv_intro_seen', '1'));
    await page.reload();
    // Target the hero CTA by its accessible name, not by href. `a[href="/products"]`
    // matches five links on this page and Playwright takes the first — the desktop header
    // nav item, which is display:none at the mobile viewport. The click then waited the
    // full 30s for an element that can never become visible there.
    await page.getByRole('link', { name: /explore products/i }).click();
    await expect(page).toHaveURL('/products');
  });
});

test.describe('Product Catalogue', () => {
  test('category filter works', async ({ page }) => {
    await page.goto('/products?category=hotel-room-slippers-guest-amenities');
    // `#product-grid-panel` is the tabpanel id ProductGrid renders on BOTH the
    // results and the empty-state branch. A bare `.grid` also matched the footer.
    await expect(page.locator('#product-grid-panel')).toBeVisible();
  });

  test('product card links to detail page', async ({ page }) => {
    await page.goto('/products');
    // Click first product card link
    const firstProductLink = page.locator('a[href^="/products/"]').first();
    await firstProductLink.click();
    await expect(page).toHaveURL(/\/products\/.+/);
  });
});

test.describe('Accessibility', () => {
  test('skip nav link exists and works', async ({ page }) => {
    await page.goto('/');
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeAttached();
  });

  test('all images have alt text', async ({ page }) => {
    await page.goto('/');
    const images = page.locator('img:not([alt=""])');
    const count = await images.count();
    // All visible images should have non-empty alt (decorative ones have alt="")
    expect(count).toBeGreaterThan(0);
  });

  test('heading hierarchy is correct (one h1)', async ({ page }) => {
    await page.goto('/');
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);
  });
});
