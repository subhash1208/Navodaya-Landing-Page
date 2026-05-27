import { test, expect } from '@playwright/test';

/**
 * Visual regression tests — screenshot key sections at mobile + desktop.
 * These catch layout breaks, missing elements, and styling regressions.
 * Run with: npx playwright test e2e/visual-regression.spec.ts --update-snapshots
 * to generate baseline screenshots on first run.
 */

test.describe('Visual Regression - Desktop (1280px)', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('hero section', async ({ page }) => {
    test.setTimeout(60000); // Hero has typewriter + canvas init
    await page.goto('/');
    // Skip loading screen
    await page.evaluate(() => sessionStorage.setItem('nv_intro_seen', 'true'));
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000); // Wait for typewriter + canvas graph to fully initialize

    const hero = page.locator('#home, section[aria-label="Hero"]');
    await expect(hero).toHaveScreenshot('hero-desktop.png', {
      maxDiffPixelRatio: 0.05,
    });
  });

  test('about section', async ({ page }) => {
    await page.goto('/#about');
    await page.evaluate(() => sessionStorage.setItem('nv_intro_seen', 'true'));
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Wait for scroll animations

    const about = page.locator('#about');
    await expect(about).toHaveScreenshot('about-desktop.png', {
      maxDiffPixelRatio: 0.05,
    });
  });

  test('products catalogue page', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('products-page-desktop.png', {
      maxDiffPixelRatio: 0.05,
      fullPage: false,
    });
  });
});

test.describe('Visual Regression - Mobile (375px)', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('hero section mobile', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => sessionStorage.setItem('nv_intro_seen', 'true'));
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot('hero-mobile.png', {
      maxDiffPixelRatio: 0.05,
      fullPage: false,
    });
  });

  test('products page mobile', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('products-mobile.png', {
      maxDiffPixelRatio: 0.05,
      fullPage: false,
    });
  });

  test('product detail page mobile', async ({ page }) => {
    await page.goto('/products/surgeon-cap');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('product-detail-mobile.png', {
      maxDiffPixelRatio: 0.05,
      fullPage: false,
    });
  });
});
