import { test, expect } from '@playwright/test';

test.describe('Product Search & Filter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');
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
    await searchInput.fill('Surgeon');

    // Wait for filter to apply
    await page.waitForTimeout(300);

    // Should show filtered results containing "Surgeon"
    const productCards = page.locator('a[href^="/products/"]');
    const count = await productCards.count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThan(50); // Should be filtered, not all products
  });

  test('search with no results shows empty state', async ({ page }) => {
    const searchInput = page.locator(
      'input[type="search"], input[placeholder*="search" i], input[placeholder*="Search" i]',
    );
    await searchInput.fill('xyznonexistentproduct123');

    await page.waitForTimeout(300);

    // Should show empty state or zero results
    const emptyState = page.locator('text=/no.*found|no.*results|no.*products/i');
    await expect(emptyState).toBeVisible();
  });

  test('category tabs filter products', async ({ page }) => {
    // Find category tab buttons
    const tabs = page.locator(
      'button[role="tab"], [data-category], button:has-text("Hygiene"), button:has-text("Hotel"), button:has-text("Spa")',
    );
    const tabCount = await tabs.count();

    if (tabCount > 0) {
      // Click second tab (not "All")
      const secondTab = tabs.nth(1);
      await secondTab.click();
      await page.waitForTimeout(300);

      // Products should be filtered
      const productCards = page.locator('a[href^="/products/"]');
      const count = await productCards.count();
      expect(count).toBeGreaterThan(0);
      expect(count).toBeLessThan(50);
    }
  });

  test('result count updates on filter', async ({ page }) => {
    // Look for a result count indicator
    const resultCount = page.locator('text=/\\d+.*product|showing.*\\d+/i');
    if (await resultCount.isVisible()) {
      const initialText = await resultCount.textContent();

      // Apply a search filter
      const searchInput = page.locator(
        'input[type="search"], input[placeholder*="search" i], input[placeholder*="Search" i]',
      );
      await searchInput.fill('Gloves');
      await page.waitForTimeout(300);

      // Count should change
      const filteredText = await resultCount.textContent();
      expect(filteredText).not.toBe(initialText);
    }
  });
});
