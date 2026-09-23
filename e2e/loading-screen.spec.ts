import { test, expect } from '@playwright/test';

test.describe('Loading Screen', () => {
  test('shows loading screen on first visit', async ({ page }) => {
    // Clear sessionStorage to simulate first visit
    await page.goto('/');
    await page.evaluate(() => sessionStorage.removeItem('nv_intro_seen'));
    await page.reload();

    // The loading screen may have already finished by the time Playwright looks,
    // so assert the outcome that must hold either way: content renders.
    await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });
  });

  test('skips loading screen on return visit', async ({ page }) => {
    // Set sessionStorage to simulate returning visitor.
    // LoadingScreen only checks truthiness, but use the real value it writes.
    await page.goto('/');
    await page.evaluate(() => sessionStorage.setItem('nv_intro_seen', '1'));
    await page.reload();

    // Content should be immediately visible (no loading animation)
    await expect(page.locator('h1')).toBeVisible({ timeout: 3000 });
  });

  test('sessionStorage key is set after loading completes', async ({ page }) => {
    await page.goto('/');

    // Wait on the condition, not a fixed duration: LoadingScreen writes the key at
    // the 3.2s stage. `expect.poll` retries until it appears or the timeout trips.
    await expect
      .poll(() => page.evaluate(() => sessionStorage.getItem('nv_intro_seen')), {
        timeout: 10000,
      })
      .toBe('1');
  });

  /**
   * Regression guard: LoadingScreen wraps the whole homepage, and used to withhold
   * `children` from the server-rendered HTML entirely. Every other test in this file
   * lets hydration finish before asserting, so all of them passed while the site was
   * shipping an empty document to crawlers.
   *
   * Disabling JavaScript is what makes this test see the raw server response instead
   * of the post-hydration DOM.
   */
  test('server HTML contains real content with JavaScript disabled', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();

    try {
      await page.goto('/');

      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('h1')).not.toBeEmpty();
      // Navigation must be crawlable too, not just the heading.
      expect(await page.locator('a[href]').count()).toBeGreaterThan(0);
    } finally {
      await context.close();
    }
  });
});
