import { test, expect, type Locator, type Page } from '@playwright/test';

/**
 * Mobile navigation — the primary user path on a landing page whose traffic is mostly mobile,
 * and until this spec the only one with no real-browser coverage at all.
 *
 * The unit specs cannot reach any of it: jsdom 29 does not implement `inert`'s focus containment,
 * has no layout engine to measure a hit area with, and never applies `overflow: hidden` to a
 * viewport it does not have. Focus containment, scroll locking and tap-target geometry are
 * therefore only observable here.
 *
 * Runs under the `chromium` project at a pinned 390x844 viewport rather than under `mobile`.
 * The `mobile` project is WebKit (iPhone 14), which gates Tab focus on links behind a platform
 * "full keyboard access" preference Playwright does not set — the containment tests below would
 * measure that preference rather than `useFocusTrap`. playwright.config.ts carries the matching
 * `testIgnore`.
 */
test.describe('Mobile navigation', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    // Same lever and same reason as e2e/navigation.spec.ts:14 — reduced motion turns off the
    // GSAP/motion reveals on the product grid so the layout under measurement is static. Note
    // the shape: `reducedMotion` is not a top-level test.use() option in Playwright 1.60.
    contextOptions: { reducedMotion: 'reduce' },
  });

  // `/products` rather than `/`, deliberately. `LoadingScreen` is mounted only on the homepage
  // (src/app/page.tsx:20) and covers everything with a fixed/inset-0/z-9999 overlay for ~1.4s on
  // a first visit; the header and footer under test are in the shared layout, so starting here
  // removes the intro from the picture entirely instead of working around it.
  test.beforeEach(async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');
  });

  const toggle = (page: Page) => page.getByRole('button', { name: /open menu|close menu/i });
  const menu = (page: Page) => page.locator('#mobile-nav');

  /**
   * Block until every element matching `selector` has held an identical bounding box for ten
   * consecutive frames.
   *
   * The mobile menu is a `motion.nav` animating `height: 0 -> auto` over 350ms, and each link
   * sits inside a `motion.div` animating `rotateX: 90 -> 0` on a staggered 500ms tween — so a
   * box read too early is a rotated, effectively zero-height projection of the real one. Motion
   * emits no "all animations finished" event that crosses into Playwright, so polling for a
   * stationary geometry is the only honest signal. A flat `waitForTimeout` is forbidden here.
   *
   * Bounded at 180 frames (~3s); budget exhaustion resolves silently because the assertions that
   * follow are what should report a real failure. Same shape as `waitForScrollToSettle` in
   * e2e/contact-form.spec.ts:15.
   */
  async function waitForGeometryToSettle(page: Page, selector: string) {
    await page.evaluate(
      (sel) =>
        new Promise<void>((resolve) => {
          let previous = '';
          let stableFrames = 0;
          let budget = 180;
          const tick = () => {
            const snapshot = Array.from(document.querySelectorAll(sel))
              .map((el) => {
                const r = el.getBoundingClientRect();
                return `${r.x},${r.y},${r.width},${r.height}`;
              })
              .join('|');
            if (snapshot === previous) stableFrames++;
            else {
              stableFrames = 0;
              previous = snapshot;
            }
            if (stableFrames >= 10 || budget-- <= 0) resolve();
            else requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }),
      selector,
    );
  }

  interface HitArea {
    label: string;
    top: number;
    bottom: number;
    left: number;
    right: number;
    /** True when the measured area came from an absolutely-positioned `::before`, not the box. */
    fromPseudo: boolean;
  }

  /**
   * The area that actually receives a tap, which is frequently NOT `boundingBox()`.
   *
   * Header and footer links grow their tap targets with an invisible, out-of-flow
   * `::before` (Header.tsx:99, Footer.tsx:41) so that the visible text and spacing stay
   * pixel-identical. `boundingBox()` reports the text box and misses that entirely, so the
   * pseudo-element's own inset is read off the computed style and applied to the box.
   *
   * Note Tailwind 3.4 requires an explicit `content-['']` for a `before:` variant to render at
   * all — a pseudo with `content: none` is not a hit area, so it is reported as absent rather
   * than silently measured as zero.
   */
  async function hitAreas(target: Locator): Promise<HitArea[]> {
    return target.evaluateAll((els) =>
      els.map((el) => {
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el, '::before');
        const label = (el.textContent ?? '').trim() || '(unlabelled)';
        const renders = cs.content !== 'none' && cs.position === 'absolute';
        if (!renders) {
          return {
            label,
            top: r.top,
            bottom: r.bottom,
            left: r.left,
            right: r.right,
            fromPseudo: false,
          };
        }
        const num = (v: string) => {
          const n = parseFloat(v);
          return Number.isNaN(n) ? 0 : n;
        };
        // `inset-y-[-5px]` resolves to top: -5px AND bottom: -5px, which grows the box
        // outward in both directions — hence `+ top` but `- bottom`.
        return {
          label,
          top: r.top + num(cs.top),
          bottom: r.bottom - num(cs.bottom),
          left: r.left + num(cs.left),
          right: r.right - num(cs.right),
          fromPseudo: true,
        };
      }),
    );
  }

  test('the hamburger opens the nav and reveals every link', async ({ page }) => {
    const button = toggle(page);
    await expect(button).toBeVisible();
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await expect(menu(page)).toBeHidden();

    await button.click();

    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await expect(button).toHaveAccessibleName(/close menu/i);
    const nav = menu(page);
    await expect(nav).toBeVisible();
    for (const label of ['Home', 'About', 'Products', 'Contact']) {
      await expect(nav.getByRole('link', { name: label, exact: true })).toBeVisible();
    }
    await expect(nav.getByRole('link', { name: /get a quote/i })).toBeVisible();
  });

  test('Tab is trapped inside the open menu', async ({ page }) => {
    await toggle(page).click();
    await expect(menu(page)).toBeVisible();

    // Five focusable descendants (four nav links + the quote CTA). Tabbing nine times walks
    // past the end of that list twice over, so anything that leaks focus out of the container
    // — a missing wrap at the last element, or the trap never attaching — shows up here.
    const focusIsInsideMenu = () =>
      page.evaluate(() => !!document.activeElement?.closest('#mobile-nav'));

    for (let i = 1; i <= 9; i++) {
      await page.keyboard.press('Tab');
      expect(await focusIsInsideMenu(), `focus after ${i} Tab press(es)`).toBe(true);
    }

    // And backwards, which wraps at the opposite end through a different branch of the trap.
    for (let i = 1; i <= 7; i++) {
      await page.keyboard.press('Shift+Tab');
      expect(await focusIsInsideMenu(), `focus after ${i} Shift+Tab press(es)`).toBe(true);
    }
  });

  test('Escape closes the menu and returns focus to the toggle', async ({ page }) => {
    const button = toggle(page);
    await button.click();
    await expect(menu(page)).toBeVisible();
    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => !!document.activeElement?.closest('#mobile-nav'))).toBe(true);

    await page.keyboard.press('Escape');

    await expect(menu(page)).toBeHidden();
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await expect(button).toBeFocused();
  });

  test('body scroll is locked while the menu is open and released on close', async ({ page }) => {
    const bodyOverflow = () => page.evaluate(() => getComputedStyle(document.body).overflow);
    expect(await bodyOverflow()).not.toBe('hidden');

    await toggle(page).click();
    await expect(menu(page)).toBeVisible();
    // Computed style, not a class name — a class that no rule matches would read as locked.
    await expect.poll(bodyOverflow).toBe('hidden');

    await page.keyboard.press('Escape');
    await expect(menu(page)).toBeHidden();
    // The cleanup is keyed on `mobileOpen` alone (Header.tsx:42-49) so it runs on every close
    // path, including unmount — `overflow: hidden` must never be stranded on the body.
    await expect.poll(bodyOverflow).not.toBe('hidden');
  });

  /**
   * KNOWN DEFECT, deliberately left failing rather than weakened or deleted.
   *
   * The assertion above proves the style is applied; this one proves it has no effect. Per CSS
   * Overflow §3.3 the viewport's overflow is taken from `<body>` ONLY when `<html>`'s computed
   * overflow is `visible` — and `src/app/globals.css:25` sets `html { overflow-x: hidden }`, so
   * the root is already non-visible and `body { overflow: hidden }` is never propagated. The
   * scroll lock in `Header.tsx:42-49` is therefore inert: measured here, `window.scrollTo(0, 800)`
   * with the menu open moved the page to 800 instead of 0.
   *
   * The fix belongs on `html` (or on a `position: fixed` body with scroll-position restore), and
   * both files are outside this change's blast radius. `test.fail()` keeps the assertion at full
   * strength and keeps the defect visible in every run; when it is fixed this test goes red with
   * "expected to fail but passed", which forces the annotation off rather than letting it rot.
   */
  test('scrolling is actually prevented while the menu is open', async ({ page }) => {
    test.fail(
      true,
      'html{overflow-x:hidden} (globals.css:25) blocks body overflow propagation to the viewport',
    );
    await toggle(page).click();
    await expect(menu(page)).toBeVisible();
    await expect
      .poll(() => page.evaluate(() => getComputedStyle(document.body).overflow))
      .toBe('hidden');

    await page.evaluate(() => window.scrollTo(0, 800));

    expect(await page.evaluate(() => window.scrollY)).toBe(0);
  });

  test('a nav link closes the menu and navigates', async ({ page }) => {
    await toggle(page).click();
    const nav = menu(page);
    await expect(nav).toBeVisible();

    await nav.getByRole('link', { name: 'Home', exact: true }).click();

    await expect(page).toHaveURL('/');
    await expect(menu(page)).toBeHidden();
    await expect(toggle(page)).toHaveAttribute('aria-expanded', 'false');
  });

  /**
   * The regression this pair exists for: a uniform `before:inset-[-14px]` against a 10px `gap`
   * made neighbouring invisible hit areas overlap by 18px, so a tap near a boundary activated
   * the wrong link. Nothing in jsdom, axe-core or a screenshot diff can see it — the visible
   * pixels are identical either way.
   */
  test('open-menu nav links have non-overlapping 44px tap targets', async ({ page }) => {
    await toggle(page).click();
    await expect(menu(page)).toBeVisible();
    await waitForGeometryToSettle(page, '#mobile-nav a');

    const areas = await hitAreas(menu(page).locator('a'));
    expect(areas.length).toBe(5);

    for (const a of areas) {
      expect(Math.round(a.right - a.left), `"${a.label}" tap target width`).toBeGreaterThanOrEqual(
        44,
      );
      expect(Math.round(a.bottom - a.top), `"${a.label}" tap target height`).toBeGreaterThanOrEqual(
        44,
      );
    }

    for (let i = 1; i < areas.length; i++) {
      const above = areas[i - 1];
      const below = areas[i];
      expect(
        above.bottom,
        `"${above.label}" tap target must not reach into "${below.label}"`,
      ).toBeLessThanOrEqual(below.top + 0.5);
    }
  });

  test('footer quick links have non-overlapping tap targets', async ({ page }) => {
    // Scoped by its own heading, not by position. `footer ul:first-of-type` looks right and is
    // not: `:first-of-type` is evaluated per parent, so it matched the first <ul> in EVERY footer
    // column. `.last()` picks the innermost of the nested <div>s that contain the heading.
    const quickLinks = page
      .locator('footer div', { has: page.getByRole('heading', { name: /quick links/i }) })
      .last()
      .locator('ul a');
    await page.locator('footer').scrollIntoViewIfNeeded();
    await waitForGeometryToSettle(page, 'footer a');

    const areas = await hitAreas(quickLinks);
    expect(areas.map((a) => a.label)).toEqual(['Home', 'About', 'Products', 'Contact']);
    // If the `content-['']` is ever dropped the pseudo stops rendering and the generous insets
    // silently stop applying, leaving a bare 13px text box as the tap target.
    for (const a of areas) expect(a.fromPseudo, `"${a.label}" ::before renders`).toBe(true);

    for (let i = 1; i < areas.length; i++) {
      const above = areas[i - 1];
      const below = areas[i];
      expect(
        above.bottom,
        `"${above.label}" tap target must not reach into "${below.label}"`,
      ).toBeLessThanOrEqual(below.top + 0.5);
    }

    // Cross-check the geometry above against the browser's own hit testing, which is what a
    // real thumb meets. A point one pixel inside each side of the shared boundary must resolve
    // to the link on that side; an overlap resolves both probes to the later-painted sibling.
    const first = areas[0];
    const second = areas[1];
    const probe = (y: number) =>
      page.evaluate(
        ([x, py]) => {
          const el = document.elementFromPoint(x, py);
          return (el?.closest('a')?.textContent ?? '').trim();
        },
        [Math.round((first.left + first.right) / 2), y] as [number, number],
      );
    expect(await probe(Math.round(first.bottom) - 1)).toBe(first.label);
    expect(await probe(Math.round(second.top) + 1)).toBe(second.label);
  });

  /**
   * KNOWN DEFECT, deliberately left failing rather than relaxed to match the code.
   *
   * Measured here: the Quick Links hit areas are 27 CSS px tall (13px text box plus the
   * `before:inset-y-[-5px]` on each side). Width passes comfortably. That clears WCAG 2.5.8
   * Target Size (Minimum, AA, 24x24) but misses 2.5.5 Target Size (AAA, 44x44), which is the
   * bar the header's mobile menu already meets.
   *
   * It cannot be fixed by widening the inset: the vertical inset is capped at half the stacked
   * `gap-2.5` (Footer.tsx:36) precisely so neighbouring hit areas stop meeting instead of
   * overlapping — the regression the test above exists for. Reaching 44px needs the gap itself
   * to grow, which is a visible layout change to a file outside this change's blast radius.
   *
   * `test.fail()` keeps the assertion at full strength and the shortfall visible in every run;
   * when the spacing is fixed this goes red with "expected to fail but passed", forcing the
   * annotation off rather than letting it rot.
   */
  test('footer quick links meet the 44px WCAG 2.5.5 target size', async ({ page }) => {
    test.fail(true, 'measured 27px tall — gap-2.5 caps the inset at -5px (Footer.tsx:36,41)');
    const quickLinks = page
      .locator('footer div', { has: page.getByRole('heading', { name: /quick links/i }) })
      .last()
      .locator('ul a');
    await page.locator('footer').scrollIntoViewIfNeeded();
    await waitForGeometryToSettle(page, 'footer a');

    for (const a of await hitAreas(quickLinks)) {
      expect(Math.round(a.right - a.left), `"${a.label}" tap target width`).toBeGreaterThanOrEqual(
        44,
      );
      expect(Math.round(a.bottom - a.top), `"${a.label}" tap target height`).toBeGreaterThanOrEqual(
        44,
      );
    }
  });
});
