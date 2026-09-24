import AxeBuilder from '@axe-core/playwright';
import { test, expect, type Page, type TestInfo } from '@playwright/test';

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
 */

const WCAG_A_AA = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

/**
 * ────────────────────────────────────────────────────────────────────────────────────────
 * READ THIS BEFORE ASSUMING A GREEN RUN MEANS ZERO VIOLATIONS.
 *
 * `color-contrast` IS CURRENTLY VIOLATED ON ALL THREE ROUTES AND IS NOT FIXED. It is
 * ESCALATED to the site owner, not suppressed, because every instance is a SEALED palette
 * value and choosing a different one is a design decision this spec has no authority to make.
 * Three distinct pairs, measured 2026-09-24 against `next@16.3.5`:
 *
 *   grey-300 #B0B0AA on paper #FAFAF8 — 2.08:1  (needs 4.5:1) — hero + section index numerals
 *   grey-400 #8A8A83 on paper #FAFAF8 — 3.32:1  (needs 4.5:1) — product specimen codes
 *   grey-500 #6B6B64 on ink   #0A0B0D — 3.66:1  (needs 4.5:1) — hero stat strip labels
 *
 * Until the owner picks replacement values, this spec asserts the strictly weaker — but
 * honest — claim that `color-contrast` is the ONLY rule still outstanding, AND that it is
 * outstanding on EXACTLY the number of elements measured below — no fewer, no more. A blanket
 * "any amount of color-contrast is fine" allowlist would let a brand-new low-contrast element,
 * anywhere on the page, pass silently forever. Pinning the count closes that hole: a new
 * violation changes the count and fails the run, and so does the owner fixing one of the
 * existing three pairs (a stale expectation should fail loudly, not rot silently).
 *
 * Counts, re-measured twice on 2026-09-24 (identical both times, chromium + mobile projects):
 *
 *   `/`                        — 7  nodes (hero index numerals + "why" card labels + stat strip)
 *   `/products`                — 50 nodes (one product-code label per catalogue row — the
 *                                 catalogue has 50 SKUs; this count moves with the catalogue
 *                                 size, which is expected and correct)
 *   `/products/surgeon-cap`    — 4  nodes (related-product code labels on the detail page)
 *
 * A per-route COUNT was chosen over a per-route TARGET-SELECTOR allowlist: `/products`' 50
 * targets are one `a[href$="<slug>"] > ... > .text-grey-400...` per catalogue row, so a fixed
 * selector list would be a 50-entry copy of the product catalogue that needs hand-editing on
 * every SKU add/remove/reorder for no extra safety over a count — the count already fails the
 * run the moment the number of affected rows changes, which is the actual signal that matters.
 *
 * Every escalated violation is also attached to the test report on each run, so the exact
 * targets stay inspectable rather than sinking into a passing tick.
 *
 * DO NOT add a rule to this list to make a red run go green. A violation is either fixed or
 * escalated to a human, and escalation means the human has been told.
 * ────────────────────────────────────────────────────────────────────────────────────────
 */
const ESCALATED_RULES: readonly string[] = ['color-contrast'];

/** Expected `color-contrast` node count per route — see the block comment above. */
const ESCALATED_COLOR_CONTRAST_COUNTS: Readonly<Record<string, number>> = {
  '/': 7,
  '/products': 50,
  '/products/surgeon-cap': 4,
};

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

async function expectOnlyEscalatedViolations(page: Page, testInfo: TestInfo, route: string) {
  const results = await scan(page);
  const escalated = results.violations.filter((v) => ESCALATED_RULES.includes(v.id));
  const outstanding = results.violations.filter((v) => !ESCALATED_RULES.includes(v.id));

  if (escalated.length > 0) {
    await testInfo.attach('escalated-violations-awaiting-owner-decision', {
      body: JSON.stringify(summarise(escalated), null, 2),
      contentType: 'application/json',
    });
  }

  expect(summarise(outstanding)).toEqual([]);

  const contrast = results.violations.find((v) => v.id === 'color-contrast');
  const contrastNodeCount = contrast ? contrast.nodes.length : 0;
  expect(contrastNodeCount).toBe(ESCALATED_COLOR_CONTRAST_COUNTS[route]);
}

test.describe('Accessibility (WCAG 2.0/2.1 A + AA)', () => {
  test('homepage has no unescalated violations', async ({ page }, testInfo) => {
    test.setTimeout(60000);
    await page.goto('/');
    // `LoadingScreen` mounts only on this route (`src/app/page.tsx:20`) and still paints an
    // opaque overlay for 800ms under reduced motion. It reads `nv_intro_seen` once, on mount,
    // so setting the key without reloading is a no-op on the page already on screen.
    await page.evaluate(() => sessionStorage.setItem('nv_intro_seen', '1'));
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    await expectOnlyEscalatedViolations(page, testInfo, '/');
  });

  test('products catalogue has no unescalated violations', async ({ page }, testInfo) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');
    // `ProductGrid` calls `useSearchParams()`, so the catalogue sits behind a Suspense
    // boundary and `networkidle` only means the bytes arrived. Scanning before the panel
    // hydrates would audit the `GridSkeleton` fallback instead of the grid.
    await expect(page.getByRole('tabpanel')).toBeVisible();

    await expectOnlyEscalatedViolations(page, testInfo, '/products');
  });

  test('product detail page has no unescalated violations', async ({ page }, testInfo) => {
    await page.goto('/products/surgeon-cap');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    await expectOnlyEscalatedViolations(page, testInfo, '/products/surgeon-cap');
  });
});
