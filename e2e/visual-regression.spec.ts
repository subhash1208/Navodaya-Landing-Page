import { test, expect, type Page } from '@playwright/test';
import { PRODUCTS, PRODUCT_CATEGORIES } from '@/constants';

/**
 * Visual regression tests — screenshot key sections at mobile + desktop.
 * These catch layout breaks, missing elements, and styling regressions.
 * Run with: pnpm exec playwright test e2e/visual-regression.spec.ts --update-snapshots=all
 * to regenerate baseline screenshots deliberately.
 *
 * `--update-snapshots` presets to `changed`, not `all` — `changed` rewrites only snapshots
 * whose comparison FAILED, so a design change that lands inside `maxDiffPixelRatio` rewrites
 * nothing and the baseline silently rots. Always pass `=all` when you mean a regeneration.
 *
 * Chromium only — see the `testIgnore` on the `mobile` project in playwright.config.ts.
 *
 * Every assertion in this file runs under `prefers-reduced-motion: reduce` and waits on a
 * condition that is only true once the page has settled. Never add a `waitForTimeout` here:
 * a fixed wait is exactly the race these tests exist to keep out of the baselines.
 */

/**
 * Mirrors `HEADLINE_LINE1` in `src/components/sections/HeroSection.tsx:14`, which is not
 * exported. Used as a web-first wait condition: the headline is typed one character at a
 * time, so "contains the whole string" is the only honest signal that typing has finished.
 */
const HERO_HEADLINE = 'Premium Hygiene & Care';

/**
 * Mirrors `STATS` in `src/components/sections/AboutSection.tsx:27`, which is not exported.
 * These are the values each `CounterStat` settles on — see `waitForStatsToSettle`.
 *
 * The first two are DERIVED, exactly as the component derives them, so a catalogue edit cannot
 * leave this helper waiting forever on text the page no longer renders.
 */
const ABOUT_STATS = [`${PRODUCTS.length}+`, `${PRODUCT_CATEGORIES.length}`, '100%', 'HYD'];

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

/**
 * Block until every `CounterStat` inside `#about` has finished its entry animation.
 *
 * `CounterStat` now carries a `prefers-reduced-motion` guard (`src/components/ui/CounterStat.tsx`),
 * matching `AboutSection.tsx:46`, so under this file's `reducedMotion: 'reduce'` the tiles never
 * tween at all and this helper resolves on its first ten frames. It is kept as a precondition,
 * not as a wait: if that guard ever regresses, the numeric tiles tween 0 → N over 0.8–1.5s and
 * the non-numeric "HYD" tile fades in from `{ opacity: 0, scale: 0.8 }` over 0.6s through inline
 * styles on a rAF loop, which Playwright's `animations: 'disabled'` never touches — it only stops
 * CSS animations and transitions, never a JS-driven one.
 *
 * Each tile carries a static `aria-label` equal to its final value while its `textContent` is
 * what moves, so the label is a stable handle on a moving target.
 *
 * Requiring the terminal state to hold for 10 consecutive frames — rather than simply to be
 * true once — is what closes the start-of-tween race: the server-rendered text is ALREADY the
 * terminal value, so a single-shot check passes before `ScrollTrigger` has fired `onEnter` and
 * reset it to zero. Call this only after `waitForScrollToSettle`, which guarantees the scroll
 * that arms the trigger has already happened.
 *
 * Bounded at 300 frames (~5s), comfortably past the 1.5s longest tween. Budget exhaustion
 * resolves silently on purpose — the `toHaveText` assertions that follow are what report it.
 */
async function waitForStatsToSettle(page: Page, expected: string[]) {
  await page.evaluate(
    (values) =>
      new Promise<void>((resolve) => {
        const settled = () =>
          values.every((v) => {
            const el = document.querySelector(`#about [aria-label="${v}"]`);
            if (!el || el.textContent?.trim() !== v) return false;
            const style = getComputedStyle(el);
            return (
              style.opacity === '1' &&
              (style.transform === 'none' || style.transform === 'matrix(1, 0, 0, 1, 0, 0)')
            );
          });
        let stableFrames = 0;
        let budget = 300;
        const tick = () => {
          stableFrames = settled() ? stableFrames + 1 : 0;
          if (stableFrames >= 10 || budget-- <= 0) resolve();
          else requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }),
    expected,
  );
}

/**
 * Assert the reduced-motion emulation is actually live.
 *
 * The determinism argument for every baseline in this file rests entirely on it, so a future
 * options-merge change fails here — loudly, on the precondition — instead of quietly restoring
 * the race and rewriting a baseline from a mid-animation frame.
 *
 * `reducedMotion` is NOT a top-level test option in Playwright 1.60; it lives under
 * `contextOptions`, per `playwright/types/test.d.ts:7486-7508`. The flat form typechecks as
 * TS2353.
 */
async function expectReducedMotion(page: Page) {
  expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(
    true,
  );
}

test.describe('Visual Regression - Desktop (1280px)', () => {
  test.use({
    viewport: { width: 1280, height: 800 },
    contextOptions: { reducedMotion: 'reduce' },
  });

  test('hero section', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('/');
    // Skip loading screen
    await page.evaluate(() => sessionStorage.setItem('nv_intro_seen', 'true'));
    await page.reload();
    await page.waitForLoadState('networkidle');

    const hero = page.locator('#home, section[aria-label="Hero"]');
    await expectReducedMotion(page);
    // Belt and braces. If the reduced-motion short-circuit in `useTypewriter` ever
    // regresses, this fails loudly on the condition instead of silently screenshotting
    // a mid-type frame. It replaces a fixed 5s wait.
    await expect(hero.getByRole('heading', { level: 1 })).toContainText(HERO_HEADLINE);

    // Element locator: `#home` is captured on its own, so its height is content-driven rather
    // than pinned to the 800px viewport. A one-line text reflow moves a larger share of the
    // frame than it would in a fixed capture, hence the looser budget than the page shots.
    await expect(hero).toHaveScreenshot('hero-desktop.png', {
      maxDiffPixelRatio: 0.02,
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
    await expectReducedMotion(page);

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

    // The scroll above is what arms `CounterStat`'s ScrollTrigger, so the counters are
    // mid-tween by the time the scroll has gone quiet. Wait them out, then assert the
    // terminal values so an incomplete tween fails as an assertion rather than as a diff.
    await waitForStatsToSettle(page, ABOUT_STATS);
    for (const value of ABOUT_STATS) {
      await expect(about.locator(`[aria-label="${value}"]`)).toHaveText(value);
    }

    await expect(about).toHaveScreenshot('about-desktop.png', {
      maxDiffPixelRatio: 0.02,
    });
  });

  test('products catalogue page', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');
    await expectReducedMotion(page);

    // `ProductGrid` calls `useSearchParams()`, which puts the whole catalogue behind a
    // Suspense boundary — none of this markup is server-rendered (`products.html` matches
    // `href="/products/…"` zero times). `networkidle` says the bytes arrived, not that React
    // has rendered them, so wait for the hydrated panel and the resolved tab state instead:
    // until then the `GridSkeleton` fallback is what fills the frame.
    await expect(page.getByRole('tabpanel')).toBeVisible();
    await expect(page.getByRole('tab').first()).toHaveAttribute('aria-selected', 'true');

    await expect(page).toHaveScreenshot('products-page-desktop.png', {
      maxDiffPixelRatio: 0.01,
      fullPage: false,
    });
  });
});

test.describe('Visual Regression - Mobile (375px)', () => {
  test.use({
    viewport: { width: 375, height: 812 },
    contextOptions: { reducedMotion: 'reduce' },
  });

  // `useTypewriter` types `HERO_HEADLINE` at 38ms/char after a 300ms delay, and Playwright's
  // "disable CSS animations" does not stop a `setTimeout`-driven state update. A fixed
  // `waitForTimeout(1000)` therefore landed mid-word at 375px, exactly where `Care` wraps —
  // a one-line vertical shift of the whole page, far beyond `maxDiffPixelRatio`, roughly
  // half the time. Under `prefers-reduced-motion: reduce` the hook short-circuits to the
  // complete text with `showCursor=false` (`src/hooks/useTypewriter.ts:42-50`), so the
  // blinking cursor is out of the frame too, and `HeroSection`'s layout effect returns
  // early and keeps the server-rendered finished state (`HeroSection.tsx:40-47`).
  test('hero section mobile', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => sessionStorage.setItem('nv_intro_seen', 'true'));
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expectReducedMotion(page);
    // Wait on the condition, never the clock — see the desktop hero test.
    await expect(page.locator('#home').getByRole('heading', { level: 1 })).toContainText(
      HERO_HEADLINE,
    );

    await expect(page).toHaveScreenshot('hero-mobile.png', {
      maxDiffPixelRatio: 0.01,
      fullPage: false,
    });
  });

  test('products page mobile', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');
    await expectReducedMotion(page);

    // See the desktop catalogue test — the grid is client-only, so `networkidle` alone
    // screenshots the `GridSkeleton` fallback on a slow render.
    await expect(page.getByRole('tabpanel')).toBeVisible();
    await expect(page.getByRole('tab').first()).toHaveAttribute('aria-selected', 'true');

    await expect(page).toHaveScreenshot('products-mobile.png', {
      maxDiffPixelRatio: 0.01,
      fullPage: false,
    });
  });

  test('product detail page mobile', async ({ page }) => {
    await page.goto('/products/surgeon-cap');
    await page.waitForLoadState('networkidle');
    await expectReducedMotion(page);

    // This route is fully server-rendered — no counters, no typewriter, and `ProductViewer`
    // is a static placeholder whose only motion is a CSS `group-hover` transform the mouse
    // never triggers here. The honest settle signal is therefore just that both halves of
    // the above-fold layout have painted: the `<h1>` on the right, the viewer on the left.
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByText('360° View Coming Soon')).toBeVisible();

    await expect(page).toHaveScreenshot('product-detail-mobile.png', {
      maxDiffPixelRatio: 0.01,
      fullPage: false,
    });
  });
});
