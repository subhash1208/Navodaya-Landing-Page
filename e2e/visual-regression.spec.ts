import { test, expect, type Page } from '@playwright/test';

/**
 * Visual regression tests — screenshot key sections at mobile + desktop.
 * These catch layout breaks, missing elements, and styling regressions.
 * Run with: pnpm exec playwright test e2e/visual-regression.spec.ts --update-snapshots
 * to generate baseline screenshots on first run.
 *
 * Chromium only — see the `testIgnore` on the `mobile` project in playwright.config.ts.
 */

/**
 * Mirrors `HEADLINE_LINE1` in `src/components/sections/HeroSection.tsx:14`, which is not
 * exported. Used as a web-first wait condition: the headline is typed one character at a
 * time, so "contains the whole string" is the only honest signal that typing has finished.
 */
const HERO_HEADLINE = 'Premium Hygiene & Care';

/**
 * Block until `window.scrollY` has held the same value for 10 consecutive frames.
 *
 * Lenis lerps toward a target rather than jumping, and is dynamically imported inside an
 * effect, so there is no load event, transition end, or single scroll event that means
 * "finished". The only honest signal is the value going quiet.
 *
 * Bounded at 180 frames (~3s) so a page that never settles fails as a screenshot diff
 * with a visible cause, rather than hanging until the test timeout.
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

test.describe('Visual Regression - Desktop (1280px)', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  // Nested so `reducedMotion` applies to the hero shot ONLY. The about and products
  // baselines in this file were captured under the default `no-preference` and must not
  // move. See the comment on the mobile hero test for why reduced motion is required.
  //
  // `reducedMotion` is NOT a top-level test option in Playwright 1.60 — it lives under
  // `contextOptions`, per `playwright/types/test.d.ts:7486-7508`. The flat form typechecks
  // as TS2353.
  test.describe('hero', () => {
    test.use({ contextOptions: { reducedMotion: 'reduce' } });

    test('hero section', async ({ page }) => {
      test.setTimeout(60000);
      await page.goto('/');
      // Skip loading screen
      await page.evaluate(() => sessionStorage.setItem('nv_intro_seen', 'true'));
      await page.reload();
      await page.waitForLoadState('networkidle');

      const hero = page.locator('#home, section[aria-label="Hero"]');
      // The determinism argument rests entirely on the emulation being live. Assert it,
      // so a future options-merge change fails here instead of quietly restoring the race.
      expect(
        await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches),
      ).toBe(true);
      // Belt and braces. If the reduced-motion short-circuit in `useTypewriter` ever
      // regresses, this fails loudly on the condition instead of silently screenshotting
      // a mid-type frame. It replaces a fixed 5s wait.
      await expect(hero.getByRole('heading', { level: 1 })).toContainText(HERO_HEADLINE);

      await expect(hero).toHaveScreenshot('hero-desktop.png', {
        maxDiffPixelRatio: 0.05,
      });
    });
  });

  test('about section', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('/');
    // Set the intro key and RELOAD, exactly as the hero test above does. The old version
    // navigated straight to `/#about` and set the key afterwards without reloading, which
    // does nothing to the page already on screen — the opaque intro overlay stayed up for
    // its full 4s while the test waited only 2s, so what got captured depended on machine
    // speed.
    await page.evaluate(() => sessionStorage.setItem('nv_intro_seen', 'true'));
    await page.reload();
    await page.waitForLoadState('networkidle');

    const about = page.locator('#about');
    // Scroll with the element, not with a `#about` hash on `goto`. Every section below the
    // fold on this page is a `dynamic()` import, so at the moment a hash navigation fires
    // its scroll, those chunks have not yet loaded and `#about` either does not exist or
    // sits at an offset that the arriving chunks then push down the page. The anchor scroll
    // therefore lands somewhere that is no longer the top of the section.
    //
    // That offset is what broke this test. `#about` is taller than the viewport, so
    // Playwright stitches the element shot by scrolling, and the `position: fixed` header
    // is composited into the stitch wherever the page happens to be sitting. A ~127px
    // difference in final scroll offset moved the header band down into the "About
    // Navodaya" heading and lit up 6% of the pixels. Scrolling after `networkidle` — once
    // every chunk has landed and the layout is final — pins it.
    await about.scrollIntoViewIfNeeded();
    await waitForScrollToSettle(page);

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

  // Nested so `reducedMotion` applies to the hero shot ONLY — the two products baselines
  // below were captured under the default `no-preference` and must not move.
  //
  // `useTypewriter` types `HERO_HEADLINE` at 38ms/char after a 300ms delay, and Playwright's
  // "disable CSS animations" does not stop a `setTimeout`-driven state update. A fixed
  // `waitForTimeout(1000)` therefore landed mid-word at 375px, exactly where `Care` wraps —
  // a one-line vertical shift of the whole page, far beyond `maxDiffPixelRatio`, roughly
  // half the time. Under `prefers-reduced-motion: reduce` the hook short-circuits to the
  // complete text with `showCursor=false` (`src/hooks/useTypewriter.ts:42-50`), so the
  // blinking cursor is out of the frame too, and `HeroSection`'s layout effect returns
  // early and keeps the server-rendered finished state (`HeroSection.tsx:40-47`).
  test.describe('hero', () => {
    test.use({ contextOptions: { reducedMotion: 'reduce' } });

    test('hero section mobile', async ({ page }) => {
      await page.goto('/');
      await page.evaluate(() => sessionStorage.setItem('nv_intro_seen', 'true'));
      await page.reload();
      await page.waitForLoadState('networkidle');
      // See the desktop hero test — the emulation is the precondition, so assert it.
      expect(
        await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches),
      ).toBe(true);
      // Wait on the condition, never the clock — see the desktop hero test.
      await expect(page.locator('#home').getByRole('heading', { level: 1 })).toContainText(
        HERO_HEADLINE,
      );

      await expect(page).toHaveScreenshot('hero-mobile.png', {
        maxDiffPixelRatio: 0.05,
        fullPage: false,
      });
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
