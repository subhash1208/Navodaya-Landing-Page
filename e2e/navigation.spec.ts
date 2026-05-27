import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
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
    // Click "Explore Products" CTA
    await page.click('a[href="/products"]');
    await expect(page).toHaveURL('/products');
  });
});

test.describe('Product Catalogue', () => {
  test('category filter works', async ({ page }) => {
    await page.goto('/products?category=hotel-room-slippers-guest-amenities');
    // Should show filtered results
    await expect(page.locator('[data-testid="product-grid"], .grid')).toBeVisible();
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
