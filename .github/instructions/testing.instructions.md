---
description: 'Conventions for writing Vitest unit tests and Playwright e2e specs in this repo — file placement, what to assert, what to mock, and coverage expectations.'
applyTo: 'src/__tests__/**,e2e/**,vitest.config.mts,playwright.config.ts'
---

# Testing Standards

## Layout

- Unit tests mirror the source path under `src/__tests__/` — `src/hooks/useTypewriter.ts` → `src/__tests__/hooks/useTypewriter.test.ts`
- E2E specs live in `e2e/*.spec.ts`
- Shared setup is `src/__tests__/setup.ts` (jsdom environment)

## Stack

Vitest + `@testing-library/react` + `@testing-library/dom`, coverage via `@vitest/coverage-v8`. Playwright for e2e.

```
pnpm test           # once
pnpm test:watch     # watch
pnpm test:coverage  # with coverage
pnpm test:e2e       # playwright
```

## What to assert

Test observable behavior — what a user or caller can see. Not internal state, not private helper call counts.

Cover, in this order: happy path → boundaries (empty, zero, one, max) → error paths → async and race conditions → cleanup on unmount.

## What not to do

- Do not mock the thing under test.
- Do not assert on implementation details that a valid refactor would break.
- Do not depend on real network or external services — Playwright specs must be hermetic.
- Do not pad coverage with assertion-free renders. A meaningful 80% beats a hollow 95%.
- Do not use arbitrary `waitForTimeout`. Wait on a condition.

## Timers

Use `vi.useFakeTimers()` for debounce, throttle, typewriter, and animation timing. Always restore in cleanup.

## E2E scope

Playwright covers real user journeys only — navigation, form submission, search flows. Logic already covered by unit tests does not need an e2e spec. Visual regression snapshots live in `e2e/visual-regression.spec.ts-snapshots/`; regenerate deliberately, never blindly.

## Mocking browser storage in jsdom

`vi.spyOn(Storage.prototype, 'getItem')` **does nothing here.** jsdom's `window.sessionStorage` and `window.localStorage` do not delegate through `Storage.prototype`, so the spy is never consulted and the test passes for the wrong reason — a `catch` branch you believe you covered stays unexecuted, and only the coverage report will tell you.

Replace the whole global and restore the descriptor in a `finally`:

```ts
const denied = () => {
  throw new DOMException('access denied');
};
const original = Object.getOwnPropertyDescriptor(window, 'sessionStorage');
Object.defineProperty(window, 'sessionStorage', {
  configurable: true,
  value: { getItem: denied, setItem: denied, removeItem: denied, clear: denied, length: 0 },
});
try {
  /* … */
} finally {
  if (original) Object.defineProperty(window, 'sessionStorage', original);
}
```

Storage throwing rather than returning `null` is a real browser behaviour (locked-down contexts, storage-blocking extensions), not a hypothetical — and in this repo an uncaught throw in `LoadingScreen` leaves the opaque overlay up permanently, i.e. a blank site.

## Playwright locators: `page.click(selector)` takes the FIRST match

It does not fail on ambiguity. It picks match 0 and then waits for **that** element's actionability — so an ambiguous selector can hang for the full 30s on an element that is `display:none` at the current viewport, while the element you meant sits visible beside it.

`a[href="/products"]` matches five links on the homepage. The first is the desktop header nav item, hidden at mobile widths; `navigation.spec.ts` waited out the whole timeout on it.

Prefer role + accessible name. It is stricter than a CSS selector, not looser, and it asserts the thing a user actually perceives:

```ts
await page.getByRole('link', { name: /explore products/i }).click();
```

Also note: Playwright visibility checks a bounding box and `visibility`, and **ignores `opacity: 0`.** A fully transparent element is "visible" to `toBeVisible()`.

## Visual regression on this page is timing-sensitive

Three things conspire, and all three have bitten `visual-regression.spec.ts`:

1. **Setting `nv_intro_seen` after `goto` does nothing to the page already on screen.** The intro overlay stays up for its full 4s. Set the key, then `reload()` — as the `hero section` test does.
2. **Every below-fold section is a `dynamic()` import.** A `#hash` on `goto` fires its scroll before those chunks land, so the anchor settles at an offset that arriving chunks then push down the page. Scroll with `locator.scrollIntoViewIfNeeded()` _after_ `networkidle`, when the layout is final.
3. **An element taller than the viewport is captured by stitching**, and a `position: fixed` header is composited into that stitch wherever the page happens to be sitting. A ~127px difference in final scroll offset moved the header band over the section heading and lit up 6% of the pixels — a pure timing artifact that looks exactly like a styling regression.

Lenis lerps toward its scroll target and is dynamically imported inside an effect, so there is no event meaning "scroll finished". Wait for `window.scrollY` to hold steady for ~10 frames with a bounded frame budget (`waitForScrollToSettle` in that spec).

Before regenerating a baseline, prove the test is _deterministic_ — `--repeat-each=3` under parallel workers. A baseline captured from a racy test bakes the race in. When the fix is real, the diff usually disappears without any regeneration at all.

## Coverage

**≥90% statements, branches, functions and lines — project-wide, not changed-files-only.** Enforced twice: by `vitest.config.mts` and again by `.husky/pre-commit`, which runs `vitest run --coverage` before every commit.

Coverage on untouched files **is** your problem, because the number is global. Adding one untested file drags it down and blocks the commit even when your own diff is fully covered — so run `pnpm test:coverage` before handing off, not just `pnpm test`.

Never lower a threshold in `vitest.config.mts` to go green, and never add a coverage exclusion to make a number pass. `src/components/ui/ProductCategoryGraph.tsx` is the one sanctioned exclusion and it predates this rule.

(An earlier revision of this line said "≥85% on files changed by the current task." That bar never existed anywhere else in the repo, and it loaded precisely when tests were being written — see `.github/CONTROL-PLANE-NOTES.md` §12.16.)
