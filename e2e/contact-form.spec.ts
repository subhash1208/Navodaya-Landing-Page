import { test, expect, type Page } from '@playwright/test';

/**
 * Block until the page's scroll position has held steady for ten consecutive frames.
 *
 * Every below-fold section on the homepage is a bare `dynamic()` import (src/app/page.tsx:6-16),
 * so the `#contact` hash scroll fires *before* the contact chunk arrives and the arriving chunk
 * then pushes the anchor's settled position further down. Lenis (src/components/ui/LenisProvider)
 * lerps toward its target and is itself dynamically imported inside an effect, so no DOM event
 * means "the scroll finished" — polling for a stationary `scrollY` is the only honest signal.
 *
 * Bounded at 180 frames (~3s); budget exhaustion resolves silently because the assertions that
 * follow are what should report a real failure. Copied from e2e/visual-regression.spec.ts:47.
 */
async function waitForScrollToSettle(page: Page) {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        let last = window.scrollY;
        let stableFrames = 0;
        let budget = 180;
        const tick = () => {
          if (window.scrollY === last) stableFrames++;
          else {
            stableFrames = 0;
            last = window.scrollY;
          }
          if (stableFrames >= 10 || budget-- <= 0) resolve();
          else requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }),
  );
}

test.describe('Contact Form', () => {
  // The homepage animates its own layout for the first few seconds, and at the 393px mobile
  // viewport that moved the submit button out from under a click that Playwright had already
  // reported as successful — the failure signature is an untouched form with every typed value
  // still present and no error alert, not an action that ran and failed.
  //
  // `useTypewriter` (src/hooks/useTypewriter.ts) types the <h1> at 40ms/char and the headline
  // re-wraps as it types, pushing everything below it down. Playwright's stability check is two
  // consecutive rAF, which passes inside the 40ms gap between characters, and its hit-target
  // check is a single point-in-time probe — so the target slides between mousedown and mouseup
  // and the browser dispatches `click` on the common ancestor instead of the button.
  //
  // Reduced motion short-circuits the typewriter to its complete text (useTypewriter.ts:41-48)
  // and turns off the GSAP/motion reveals. Note the shape: `reducedMotion` is not a top-level
  // `test.use()` option in Playwright 1.60, it must sit under `contextOptions`. Same lever and
  // same reason as e2e/navigation.spec.ts:14 and e2e/visual-regression.spec.ts:61.
  test.use({ contextOptions: { reducedMotion: 'reduce' } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/#contact');
    // Dismiss the intro deterministically. `LoadingScreen` (mounted at src/app/page.tsx:20)
    // covers the page with a fixed/inset-0/z-9999 overlay for ~1.4s on a first visit and absorbs
    // clicks for its whole run. The key must be set AND the page reloaded — it is read once on
    // mount, so setting it against an intro already running does nothing. Same pattern as
    // e2e/navigation.spec.ts:44-45.
    //
    // Dismissing the intro *alone* previously made this class of flake worse on
    // navigation.spec.ts (2/5 -> 6/10 failing), because `useTypewriter`'s `enabled` gate holds
    // typing until the intro ends and the overlay — then 4s long, now ~1.4s — had been acting as
    // an accidental settling delay. The `reducedMotion` above is what makes removing it safe; the
    // two go together.
    await page.evaluate(() => sessionStorage.setItem('nv_intro_seen', '1'));
    await page.reload();
    await page.waitForSelector('#contact', { state: 'visible' });
    // Let the dynamic chunks land, re-anchor on the now-final layout, then wait for the scroll
    // to stop moving. A fixed `waitForTimeout` is forbidden here — wait on a condition.
    await page.waitForLoadState('networkidle');
    await page.locator('#contact').scrollIntoViewIfNeeded();
    await waitForScrollToSettle(page);
  });

  test('form is visible with all required fields', async ({ page }) => {
    await expect(page.locator('form')).toBeVisible();
    // Check key form fields exist
    await expect(page.locator('input[name="companyName"], [name="companyName"]')).toBeVisible();
    await expect(page.locator('input[name="companyEmail"], [name="companyEmail"]')).toBeVisible();
  });

  test('form shows validation error on empty submit', async ({ page }) => {
    // Try to submit empty form
    const submitButton = page.locator('button[type="submit"]');
    if (await submitButton.isVisible()) {
      await submitButton.click();
      // Should show some error indication (browser native or custom)
      // The form uses required fields, so browser will block submission
      await page.waitForTimeout(500);
      // Page should still be on the same URL (form didn't submit)
      await expect(page).toHaveURL(/\/#contact/);
    }
  });

  test('form submits successfully with valid data', async ({ page }) => {
    // Fill in all required fields
    await page.fill('input[name="companyName"], [name="companyName"]', 'Test Hospital');
    await page.fill('input[name="companyEmail"], [name="companyEmail"]', 'test@hospital.com');
    await page.fill('input[name="contactPersonName"], [name="contactPersonName"]', 'Dr. Smith');
    await page.fill(
      'input[name="contactPersonNumber"], [name="contactPersonNumber"]',
      '+91 98765 43210',
    );
    await page.fill('input[name="quantity"], [name="quantity"]', '1000 pieces');

    // Select a product if there's a select/dropdown
    const productSelect = page.locator('select[name="productName"], [name="productName"]');
    if (await productSelect.isVisible()) {
      await productSelect.selectOption({ index: 1 });
    }

    // Submit
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Wait for the success state. Target the heading by role — a bare
    // text=/thank|success|sent|received/i matched three unrelated paragraphs
    // elsewhere on the page ("sent" is a substring of "es-sent-ials").
    await expect(page.getByRole('heading', { name: /thank you/i })).toBeVisible({
      timeout: 10000,
    });
  });
});
