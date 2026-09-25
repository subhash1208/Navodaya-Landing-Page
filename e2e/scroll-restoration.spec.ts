import { test, expect, type Page } from '@playwright/test';

/**
 * Client navigation must land the visitor at the TOP of the destination, whatever offset they
 * were at on the page they left.
 *
 * TWO faults produce the same symptom here, and the second was hidden behind the first.
 *
 * Fault A — FIXED. `src/components/ui/LoadingScreen.tsx` gated the homepage behind a
 * `display: contents` wrapper, the only element child of `<main>` on `/`. A box-less element
 * measures as an all-zero `getBoundingClientRect()`, which Next's `shouldSkipElement`
 * (node_modules/next/dist/client/components/layout-router.js:67-83) reads as "hidden"; the walk
 * that follows hits `nextElementSibling === null` and returns having scrolled NOTHING at all
 * (:179-192). The browser simply clamped the previous route's offset to the new page's height.
 * Instrumenting `window.scrollTo`, `documentElement.scrollTop` and `scrollIntoView` recorded
 * ZERO calls of any kind on the failing navigation. Every case below covers this.
 *
 * Fault B — NOT fixed, deliberately; see the last test in this file.
 *
 * Nothing in gates 1-6 or 8-10 can see either one. They are cross-document-lifecycle behaviours
 * of a real browser, and every other e2e spec in this tree navigates from offset 0, where "did
 * not scroll at all" and "scrolled correctly" are indistinguishable.
 */

/**
 * A correct landing is 80, not 0, and the difference is structural rather than slop.
 * `<main id="main-content" className="pt-20">` (src/app/layout.tsx) offsets its content box by
 * 80px to clear the fixed header, and Next finishes with `domNode.scrollIntoView()`
 * (layout-router.js:225), which aligns that box's top with the viewport top. So the settled
 * offset is the padding — or 0 on the runs where Next's earlier `documentElement.scrollTop = 0`
 * commits first and its follow-up check short-circuits.
 *
 * Both are "at the top"; the defect produced 761-4507 at this viewport. The threshold sits above
 * 80 rather than at the `< 50` a first reading of the symptom suggests, because `/ -> /products`
 * has always landed at 80 and a tighter bar would fail on a perfectly healthy navigation.
 */
const TOP_THRESHOLD = 100;

/**
 * Settle on a scroll offset instead of sleeping on one. Lenis drives scroll from rAF, the GSAP
 * curtain in `PageTransition` runs on `/` <-> `/products`, and `globals.css:23` puts
 * `scroll-behavior: smooth` on `html`, so the offset is genuinely in motion for a few hundred ms
 * after the URL changes. A fixed `waitForTimeout` would be either too short (flaky red) or padded
 * far past what the run needs. 20 identical frames is ~330ms of quiet. Same shape as
 * `waitForGeometryToSettle` in e2e/mobile-nav.spec.ts:53.
 *
 * The frame budget is a fallback, not a pass condition: if it expires we return the current
 * offset and let the assertion that follows report the real number.
 */
async function settledScrollY(page: Page): Promise<number> {
  return page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        let previous = -1;
        let stableFrames = 0;
        let budget = 360;
        const tick = () => {
          const y = Math.round(window.scrollY);
          if (y === previous) stableFrames++;
          else {
            stableFrames = 0;
            previous = y;
          }
          if (stableFrames >= 20 || budget-- <= 0) {
            resolve(y);
            return;
          }
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }),
  );
}

/**
 * Open `path` with the intro already dismissed, then drive the window to within 120px of the
 * bottom and wait for it to hold there.
 *
 * 120px short of the maximum, rather than the maximum itself, and that margin is load-bearing
 * rather than caution. At absolute max scroll on a 390px-wide viewport the footer's Quick Links
 * sit at viewport y=8 — underneath the 80px fixed header — so `document.elementFromPoint` at the
 * link's centre returns the header's logo image and Playwright's hit-target check never resolves
 * to the link. That is a tap-target geometry problem, not a scroll-restoration one, and mixing it
 * in made the failure look like an engine difference. The margin removes it: the link clears the
 * header, the click is unambiguous, and the offset carried into the navigation is still thousands
 * of pixels.
 *
 * The `nv_intro_seen` set + reload is the established pattern (e2e/navigation.spec.ts:44) and does
 * two jobs: it stops the 1.4s `LoadingScreen` overlay absorbing the click, and because
 * sessionStorage is per-origin it also keeps the intro from replaying on arrival at `/`.
 */
async function openScrolledNearBottom(page: Page, path: string): Promise<number> {
  await page.goto(path);
  await page.evaluate(() => sessionStorage.setItem('nv_intro_seen', '1'));
  await page.reload();
  await expect(page.locator('h1')).toBeVisible();

  await page.evaluate(() =>
    window.scrollTo(0, document.documentElement.scrollHeight - window.innerHeight - 120),
  );
  const deep = await settledScrollY(page);

  // Guard the premise, not just the conclusion. If the page were short enough that "deep" and
  // "the top" were the same offset, every assertion below would pass while proving nothing.
  expect(deep, `expected ${path} to be scrollable well past the fold`).toBeGreaterThan(500);
  return deep;
}

async function expectLandedAtTop(page: Page, from: string, deep: number) {
  const landed = await settledScrollY(page);
  expect(landed, `left ${from} at ${deep}, landed at ${landed}`).toBeLessThan(TOP_THRESHOLD);
}

/**
 * The viewport is pinned so these run identically under both projects. The engine is the variable
 * worth having here — Blink and WebKit disagree about the fault the final test covers — and the
 * mobile project's own 390px width brings in the footer geometry described above, which belongs to
 * `mobile-nav.spec.ts`, not to this file.
 */
test.describe('Scroll restoration on client navigation', () => {
  test.use({ viewport: { width: 1280, height: 844 } });

  test('footer Home link from deep in /products lands at the top of /', async ({ page }) => {
    const deep = await openScrolledNearBottom(page, '/products');

    await page.getByRole('contentinfo').getByRole('link', { name: 'Home', exact: true }).click();
    await expect(page).toHaveURL('/');
    await expect(page.locator('h1')).toBeVisible();

    await expectLandedAtTop(page, '/products', deep);
  });

  test('footer Home link from deep in a product page lands at the top of /', async ({ page }) => {
    const deep = await openScrolledNearBottom(page, '/products/surgeon-cap');

    await page.getByRole('contentinfo').getByRole('link', { name: 'Home', exact: true }).click();
    await expect(page).toHaveURL('/');
    await expect(page.locator('h1')).toBeVisible();

    await expectLandedAtTop(page, '/products/surgeon-cap', deep);
  });

  /**
   * The scope matrix put fault A on the DESTINATION, not the link: every route into `/` was broken
   * and every route out of it was fine. Asserting only the footer would let a future change
   * re-break the homepage while this file stayed green, so the header path is covered too — a
   * different component, the same destination.
   */
  test('header Home link from deep in /products lands at the top of /', async ({ page }) => {
    const deep = await openScrolledNearBottom(page, '/products');

    await page.getByRole('banner').getByRole('link', { name: 'Home', exact: true }).click();
    await expect(page).toHaveURL('/');
    await expect(page.locator('h1')).toBeVisible();

    await expectLandedAtTop(page, '/products', deep);
  });

  /**
   * The direction that already worked, pinned so the fix cannot be "corrected" into breaking it.
   * `/products` has a plain block box as its first child of `<main>`, which is what the homepage
   * now also has.
   */
  test('footer product link from deep in / lands at the top of /products', async ({ page }) => {
    const deep = await openScrolledNearBottom(page, '/');

    await page
      .getByRole('contentinfo')
      .getByRole('link', { name: /view all products/i })
      .click();
    await expect(page).toHaveURL('/products');
    await expect(page.locator('h1')).toBeVisible();

    await expectLandedAtTop(page, '/', deep);
  });
});

/**
 * FAULT B — KNOWN DEFECT, deliberately left failing rather than relaxed to match the code.
 * Same idiom, and the same reasoning, as `mobile-nav.spec.ts:394`.
 *
 * `src/app/globals.css:23` sets `html { scroll-behavior: smooth }` unconditionally. That turns
 * BOTH of the operations Next's router performs on a client navigation — `htmlElement.scrollTop =
 * 0` and then `domNode.scrollIntoView()` (layout-router.js:221,225) — from instant writes into
 * animated ones. WebKit does not finish that animation: instrumenting the page shows both calls
 * being made with `window.scrollY` still reading the carried-over offset, and the page settling
 * back at the clamped maximum.
 *
 * Measured against a production build at 390x664, `/products` (max scroll 15134) -> `/` (max
 * scroll 9336), identical code in every other respect:
 *
 *   WebKit,   scroll-behavior: smooth  ->  landed 9336   (this assertion's failure)
 *   WebKit,   scroll-behavior: auto    ->  landed 0
 *   Chromium, scroll-behavior: smooth  ->  landed 80
 *   Chromium, scroll-behavior: auto    ->  landed 0
 *
 * So it is Safari-only, it is one declaration, and removing that declaration fixes it outright —
 * but the declaration is site-wide and also governs every `#hash` jump (`/#about`, `/#contact`,
 * "Skip to content"), which would become instant. That is a visible, whole-site behaviour change,
 * and `src/app/globals.css` is outside this change's blast radius. It is a decision for a human
 * rather than a fix to slip in beside an unrelated one.
 *
 * Fault A had to be fixed first regardless: until it was, the router issued no scroll call at all,
 * so there was nothing for `scroll-behavior` to animate and this fault could not be seen.
 *
 * Chromium is unaffected and asserts normally. When `globals.css:23` is addressed, the WebKit run
 * goes red with "expected to fail but passed", forcing this annotation off rather than letting it
 * rot.
 */
test.describe('Scroll restoration at a mobile viewport', () => {
  test.use({ viewport: { width: 390, height: 664 } });

  test('footer Home link from deep in /products lands at the top of /', async ({
    page,
    browserName,
  }) => {
    test.fail(
      browserName === 'webkit',
      "globals.css:23 `scroll-behavior: smooth` — WebKit abandons the router's scroll reset",
    );
    const deep = await openScrolledNearBottom(page, '/products');

    await page.getByRole('contentinfo').getByRole('link', { name: 'Home', exact: true }).click();
    await expect(page).toHaveURL('/');
    await expect(page.locator('h1')).toBeVisible();

    await expectLandedAtTop(page, '/products', deep);
  });
});
