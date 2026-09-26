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

  test('form shows a validation error on empty submit', async ({ page }) => {
    // The form carries `noValidate`, so an empty submit really does reach the server action and
    // really does come back with an error — there is nothing conditional about this. The previous
    // version of this test wrapped every assertion in `if (await submitButton.isVisible())` and
    // waited a flat 500ms, so it passed whether or not the banner ever rendered.
    await page.locator('button[type="submit"]').click();

    // Scoped to the form on purpose. Next injects `<div role="alert" aria-live="assertive"
    // id="__next-route-announcer__">` into every page, so a bare `page.getByRole('alert')`
    // resolves to two elements and throws a strict-mode violation before any assertion runs.
    // Scoping also disambiguates the error banner (ContactSection.tsx:271, inside the <form>
    // opened at :266) from the success panel's own role="alert" at :250, which sits outside it.
    const banner = page.locator('form').getByRole('alert');
    await expect(banner).toBeVisible();
    await expect(banner).toContainText('Product name is required.');
    await expect(page).toHaveURL(/\/#contact/);
  });

  test('a field-level error marks and describes the offending input', async ({ page }) => {
    await page.fill('[name="companyName"]', 'Test Hospital');
    await page.fill('[name="companyEmail"]', 'not-an-email');
    await page.fill('[name="contactPersonName"]', 'Dr. Smith');
    await page.fill('[name="contactPersonNumber"]', '+91 98765 43210');
    await page.fill('[name="quantity"]', '1000 pieces');
    await page.locator('select[name="productName"]').selectOption({ index: 1 });

    await page.locator('button[type="submit"]').click();

    const email = page.locator('[name="companyEmail"]');
    await expect(email).toHaveAttribute('aria-invalid', 'true');
    await expect(email).toHaveAttribute('aria-describedby', 'companyEmail-error');
    await expect(page.locator('#companyEmail-error')).toHaveText('Invalid email address.');
    await expect(email).toBeFocused();
  });

  test('a filled honeypot is answered exactly like a real submission', async ({ page }) => {
    // The honeypot is positioned off-screen and `aria-hidden`, so it is filled the way a naive
    // bot would fill it — by writing to the DOM node — rather than through Playwright's
    // actionability checks. That the server discards it without sending is asserted in
    // src/__tests__/actions/contact.test.ts; what matters here is that a bot cannot tell.
    await page
      .locator('[name="companyWebsite"]')
      .evaluate((el) => ((el as HTMLInputElement).value = 'https://spam.test'));

    await page.fill('[name="companyName"]', 'Spam Co');
    await page.fill('[name="companyEmail"]', 'bot@spam.test');
    await page.fill('[name="contactPersonName"]', 'Bot');
    await page.fill('[name="contactPersonNumber"]', '+91 98765 43210');
    await page.fill('[name="quantity"]', '1000 pieces');
    await page.locator('select[name="productName"]').selectOption({ index: 1 });

    await page.locator('button[type="submit"]').click();

    await expect(page.getByRole('heading', { name: /thank you/i })).toBeVisible({ timeout: 10000 });
  });

  test('form submits successfully with valid data', async ({ page }) => {
    // Unique per run: the server action rate-limits three submissions per email per ten minutes,
    // and this spec runs once per Playwright project against one shared `next start`.
    await page.fill('[name="companyName"]', 'Test Hospital');
    await page.fill('[name="companyEmail"]', `test-${Date.now()}@hospital.com`);
    await page.fill('[name="contactPersonName"]', 'Dr. Smith');
    await page.fill('[name="contactPersonNumber"]', '+91 98765 43210');
    await page.fill('[name="quantity"]', '1000 pieces');
    await page.locator('select[name="productName"]').selectOption({ index: 1 });

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
