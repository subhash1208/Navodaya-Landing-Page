import { test, expect, type Page } from '@playwright/test';
import { PRODUCTS, PRODUCT_CATEGORIES, productEnquiryLabel } from '@/constants';

/**
 * Block until the page's scroll position has held steady for ten consecutive frames.
 * Copied from e2e/contact-form.spec.ts:15 — Lenis lerps toward its target with no DOM
 * event marking "scroll finished", so polling for a stationary `scrollY` is the only
 * honest signal that a hard-loaded `#contact` anchor has actually settled.
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

// Derived from the real catalogue rather than hand-typed, so a slug or label change
// anywhere in `src/constants/index.ts` is caught here instead of silently drifting.
const surgeonCap = PRODUCTS.find((p) => p.slug === 'surgeon-cap')!;
// Three products carry a `secondaryCategory` and therefore appear under two `<optgroup>`
// headings in the contact form's dropdown, while submitting ONE value naming their PRIMARY
// category. `shower-cap` is hotel-amenities first, spa-salon second — so the two labels below
// differ only in their category half, which is exactly what the slug has to transport.
const dualCategory = PRODUCTS.find((p) => p.slug === 'shower-cap')!;
const secondaryCategory = PRODUCT_CATEGORIES.find(
  (c) => c.slug === dualCategory.secondaryCategory,
)!;

test.describe('Product Quote Prefill', () => {
  // Same lever as e2e/contact-form.spec.ts:52 — the homepage's own layout animation
  // (typewriter re-wrap, GSAP reveals) is irrelevant to this flow and only adds flake.
  test.use({ contextOptions: { reducedMotion: 'reduce' } });

  test('clicking Request a Quote from a product page pre-selects that product', async ({
    page,
  }) => {
    await page.goto(`/products/${surgeonCap.slug}`);
    // Set BEFORE navigating to `/`, not after. `LoadingScreen` (mounted inside
    // src/app/page.tsx) reads this key once on mount, and this is the first time this
    // session visits `/` — sessionStorage is per-origin, so it already applies when Home
    // mounts via the client-side navigation below. No reload needed, unlike the hard-load
    // tests further down, because the overlay never gets a chance to start.
    await page.evaluate(() => sessionStorage.setItem('nv_intro_seen', '1'));

    // The actual CTA, not page.goto() — a direct goto would prove nothing about the real
    // soft-navigation path the reviewer verified by hand and this spec exists to replace.
    await page.getByRole('link', { name: /request a quote/i }).click();

    await expect(page).toHaveURL(new RegExp(`\\?product=${surgeonCap.slug}#contact$`));
    // The contact section is a dynamic() chunk (src/app/page.tsx), so it can take longer
    // than the default 5s to arrive after a fresh client-side navigation.
    await expect(page.locator('#productName')).toHaveValue(productEnquiryLabel(surgeonCap), {
      timeout: 15000,
    });
  });

  test('a dual-category product pre-selects under its primary category', async ({ page }) => {
    await page.goto(`/products/${dualCategory.slug}`);
    await page.evaluate(() => sessionStorage.setItem('nv_intro_seen', '1'));

    await page.getByRole('link', { name: /request a quote/i }).click();

    const select = page.locator('#productName');
    await expect(select).toHaveValue(productEnquiryLabel(dualCategory), { timeout: 15000 });
    // The same product is listed under its secondary category too, but that listing is not a
    // separate option value — if it were, the business would receive two labels for one item.
    await expect(select).not.toHaveValue(`${dualCategory.name} — ${secondaryCategory.name}`);
  });

  test('a hard load of the quote URL pre-selects the product and lands on contact', async ({
    page,
  }) => {
    await page.goto(`/?product=${surgeonCap.slug}#contact`);
    // Dismiss the intro deterministically — same pattern as e2e/contact-form.spec.ts:54-68.
    // The key must be set AND the page reloaded: it is read once on mount, and setting it
    // against an intro already running does nothing.
    await page.evaluate(() => sessionStorage.setItem('nv_intro_seen', '1'));
    await page.reload();
    await page.waitForSelector('#contact', { state: 'visible' });
    await page.waitForLoadState('networkidle');
    await page.locator('#contact').scrollIntoViewIfNeeded();
    await waitForScrollToSettle(page);

    await expect(page.locator('#contact')).toBeInViewport();
    await expect(page.locator('#productName')).toHaveValue(productEnquiryLabel(surgeonCap));
  });

  test('an unknown slug leaves the product select blank with no error', async ({ page }) => {
    await page.goto('/?product=does-not-exist#contact');
    await page.evaluate(() => sessionStorage.setItem('nv_intro_seen', '1'));
    await page.reload();
    await page.waitForSelector('#contact', { state: 'visible' });
    await page.waitForLoadState('networkidle');
    await page.locator('#contact').scrollIntoViewIfNeeded();
    await waitForScrollToSettle(page);

    await expect(page.locator('#productName')).toHaveValue('');
  });
});
