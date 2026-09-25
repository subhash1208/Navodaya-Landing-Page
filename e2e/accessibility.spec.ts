import AxeBuilder from '@axe-core/playwright';
import { test, expect, type Page } from '@playwright/test';

/**
 * Derived, not imported. `axe-core` is a transitive dependency of `@axe-core/playwright`, so
 * under pnpm's linked store it is not resolvable from this file — `import type { AxeResults }
 * from 'axe-core'` fails typecheck with TS2307. Reading the shapes back off the builder's own
 * return type keeps them exact without adding a dependency this spec does not otherwise use.
 */
type ScanResults = Awaited<ReturnType<AxeBuilder['analyze']>>;
type Violation = ScanResults['violations'][number];

/**
 * Automated accessibility scan — axe-core via @axe-core/playwright.
 *
 * Tagged to WCAG 2.0/2.1 level A and AA only (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`).
 * axe's remaining rules are "best practice" advice that no WCAG success criterion requires,
 * and folding them in here would make this spec fail on opinions rather than on the standard
 * the rest of this work is measured against.
 *
 * Automated checks catch a minority of real accessibility defects. A green run here is a
 * floor, not a certificate.
 *
 * No rule is escalated and nothing is allowlisted — this spec asserts a plain zero. The three
 * `color-contrast` pairs that were previously escalated by pinned per-route node count
 * (7 / 50 / 4) were fixed at source: `grey-300` and `grey-400` raised to `grey-500` on light
 * grounds, `grey-500` lowered to `grey-400` on ink. If a rule fails here, fix it or escalate
 * it to a human; never add it to an exception list to turn a red run green.
 */

const WCAG_A_AA = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

/**
 * Run under `prefers-reduced-motion: reduce`, for the same reason `visual-regression.spec.ts`
 * does: axe reads computed styles and the accessibility tree at one instant, and this page is
 * full of JS-driven entry animations that Playwright's CSS-animation freeze does not stop. A
 * mid-tween `opacity: 0.3` is a contrast result that depends on machine speed.
 */
test.use({ contextOptions: { reducedMotion: 'reduce' } });

function scan(page: Page): Promise<ScanResults> {
  return new AxeBuilder({ page }).withTags(WCAG_A_AA).analyze();
}

/** Compact enough to read in a terminal — a raw axe violation diff runs to thousands of lines. */
function summarise(violations: Violation[]) {
  return violations.map((v) => ({
    id: v.id,
    impact: v.impact,
    targets: v.nodes.map((n) => n.target.join(' ')),
  }));
}

async function expectNoViolations(page: Page) {
  const results = await scan(page);
  expect(summarise(results.violations)).toEqual([]);
}

test.describe('Accessibility (WCAG 2.0/2.1 A + AA)', () => {
  test('homepage has no violations', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('/');
    // `LoadingScreen` mounts only on this route (`src/app/page.tsx:20`) and still paints an
    // opaque overlay for 600ms under reduced motion (`REDUCED_DURATION`). It reads
    // `nv_intro_seen` once, on mount, so setting the key without reloading is a no-op on the
    // page already on screen.
    await page.evaluate(() => sessionStorage.setItem('nv_intro_seen', '1'));
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    await expectNoViolations(page);
  });

  test('products catalogue has no violations', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');
    // `ProductGrid` calls `useSearchParams()`, so the catalogue sits behind a Suspense
    // boundary and `networkidle` only means the bytes arrived. Scanning before the panel
    // hydrates would audit the `GridSkeleton` fallback instead of the grid.
    await expect(page.getByRole('tabpanel')).toBeVisible();

    await expectNoViolations(page);
  });

  test('product detail page has no violations', async ({ page }) => {
    await page.goto('/products/surgeon-cap');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    await expectNoViolations(page);
  });

  test('not-found page has no violations', async ({ page }) => {
    // There is no `/404` route. `src/app/not-found.tsx` is the root not-found boundary, which
    // Next.js renders for *any* unmatched URL app-wide and serves with an HTTP 404 status —
    // `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/not-found.md:133`.
    // So the trigger is any path the router cannot match. `page.goto` resolves normally on a 404
    // (it rejects only on network-level failures), and the status assertion is what proves the
    // boundary actually rendered rather than a real page or a redirect to one.
    const response = await page.goto('/this-route-does-not-exist');
    expect(response?.status()).toBe(404);
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    await expectNoViolations(page);
  });
});
