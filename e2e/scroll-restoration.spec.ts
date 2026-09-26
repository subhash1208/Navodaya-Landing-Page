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
 * Fault B — FIXED. `src/app/globals.css` set `html { scroll-behavior: smooth }` unconditionally,
 * which turned both of the router's scroll writes into animations WebKit never committed. The
 * declaration is gone; see the last describe in this file for the measurements and why it could
 * not be scoped instead.
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
 * Settle on a scroll offset instead of sleeping on one. Lenis drives scroll from rAF and the GSAP
 * curtain in `PageTransition` runs on `/` <-> `/products`, so the offset is genuinely in motion for
 * a few hundred ms after the URL changes even now that the root scroller is no longer animated by
 * CSS. A fixed `waitForTimeout` would be either too short (flaky red) or padded far past what the
 * run needs. 20 identical frames is ~330ms of quiet. Same shape as `waitForGeometryToSettle` in
 * e2e/mobile-nav.spec.ts:53.
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
 * FAULT B — the mobile viewport where the second fault lived, now asserting at full strength on
 * both engines.
 *
 * `src/app/globals.css` set `html { scroll-behavior: smooth }` unconditionally. That turned BOTH
 * of the operations Next's router performs on a client navigation — `htmlElement.scrollTop = 0`
 * and then `domNode.scrollIntoView()` (layout-router.js:221,225) — from instant writes into
 * animated ones. WebKit does not finish that animation: instrumenting the page showed both calls
 * being made with `window.scrollY` still reading the carried-over offset, and the page settling
 * back at the clamped maximum.
 *
 * Measured against a production build at 390x664, `/products` (max scroll 15134) -> `/` (max
 * scroll 9336), identical code in every other respect:
 *
 *   WebKit,   scroll-behavior: smooth  ->  landed 9336   (the defect)
 *   WebKit,   scroll-behavior: auto    ->  landed 0
 *   Chromium, scroll-behavior: smooth  ->  landed 80
 *   Chromium, scroll-behavior: auto    ->  landed 0
 *
 * The declaration was removed rather than scoped, because it cannot be scoped: the router's resets
 * and every `#hash` jump scroll the SAME element (the root scroller), and CSS has no selector that
 * tells one operation from the other. `html:has(:target)` looks like it would, and does not — the
 * header's own About and Contact links are `/#about` and `/#contact`, so a navigation into a hash
 * from another route would match `:target` and re-animate the exact reset this fixes.
 *
 * The accepted cost is that in-page anchors jump instantly, which is already what
 * `prefers-reduced-motion` users get. The describe below pins that they still ARRIVE.
 */
test.describe('Scroll restoration at a mobile viewport', () => {
  test.use({ viewport: { width: 390, height: 664 } });

  test('footer Home link from deep in /products lands at the top of /', async ({ page }) => {
    const deep = await openScrolledNearBottom(page, '/products');

    await page.getByRole('contentinfo').getByRole('link', { name: 'Home', exact: true }).click();
    await expect(page).toHaveURL('/');
    await expect(page.locator('h1')).toBeVisible();

    await expectLandedAtTop(page, '/products', deep);
  });
});

/**
 * Removing `scroll-behavior: smooth` changes how every in-page anchor on the site moves. These
 * cases assert the part that matters — that each one still lands on its target — so the trade the
 * fix above makes is pinned rather than assumed. Instant or smooth is not asserted; arrival is.
 *
 * Without these, a future change could break `/#about`, `/#contact` or the skip link outright and
 * the only failing signal would be a human noticing. `navigation.spec.ts:73` covers the skip link
 * with `toBeAttached()`, which proves the markup exists and nothing about where it goes.
 */
const ANCHOR_TOLERANCE = 120;

async function openHomepageSettled(page: Page) {
  await page.goto('/');
  await page.evaluate(() => sessionStorage.setItem('nv_intro_seen', '1'));
  await page.reload();
  await expect(page.locator('h1')).toBeVisible();
  // Every below-fold section is a bare `dynamic()` import. Clicking an anchor before those chunks
  // land scrolls to an id that either does not exist yet or sits at an offset the arriving chunks
  // then push down — the race already documented in e2e/contact-form.spec.ts:7.
  await page.waitForLoadState('networkidle');
}

/** The anchor target's box is at the top of the viewport once the page stops moving. */
async function expectAnchorAtViewportTop(page: Page, selector: string) {
  await settledScrollY(page);
  const top = await page
    .locator(selector)
    .evaluate((el) => Math.round(el.getBoundingClientRect().top));
  expect(Math.abs(top), `${selector} settled ${top}px from the viewport top`).toBeLessThan(
    ANCHOR_TOLERANCE,
  );
}

test.describe('In-page anchors still arrive', () => {
  // Pinned wide so the header's own nav is on screen under both projects, matching the first
  // describe in this file. The mobile menu's copies of these links belong to mobile-nav.spec.ts.
  test.use({ viewport: { width: 1280, height: 844 } });

  for (const { label, target } of [
    { label: 'About', target: '#about' },
    { label: 'Contact', target: '#contact' },
  ]) {
    test(`header ${label} link lands on ${target}`, async ({ page }) => {
      await openHomepageSettled(page);

      await page.getByRole('banner').getByRole('link', { name: label, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`${target}$`));

      await expectAnchorAtViewportTop(page, target);
    });
  }

  test('skip link lands on #main-content from deep in the page', async ({ page }) => {
    await openHomepageSettled(page);

    // Scroll away first. `#main-content` is at the very top, so activating the skip link from
    // offset 0 would pass without the link doing anything at all.
    await page.evaluate(() =>
      window.scrollTo(0, document.documentElement.scrollHeight - window.innerHeight - 120),
    );
    const deep = await settledScrollY(page);
    expect(deep, 'expected / to be scrollable well past the fold').toBeGreaterThan(500);

    // The link is `position: absolute; clip: rect(0,0,0,0)` until focused, which is exactly how a
    // keyboard user reaches it — focus, then Enter. Playwright's `focus()` does not require
    // visibility, and the component's own `onFocus` reveals it.
    const skipLink = page.locator('a[href="#main-content"]');
    await skipLink.focus();
    await skipLink.press('Enter');

    await expect(page).toHaveURL(/#main-content$/);
    await expectAnchorAtViewportTop(page, '#main-content');
  });
});
