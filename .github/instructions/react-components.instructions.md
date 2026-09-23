---
description: 'Standards for React components and hooks in this Next.js 16 / React 19 project — server vs client components, animation conventions with GSAP and Motion, styling with Tailwind and cn().'
applyTo: 'src/components/**,src/hooks/**,src/app/**/*.tsx'
---

# React & Next.js Component Standards

## This is Next.js 16 — verify before you write

APIs, conventions, and file structure differ from training data. Read the relevant guide in `node_modules/next/dist/docs/` before using any Next.js API. Heed deprecation notices.

## Server vs client

- Server components are the default. Do not add `'use client'` unless the component needs state, effects, browser APIs, or event handlers.
- Push `'use client'` as far down the tree as possible — a client boundary high in the tree drags its whole subtree into the bundle.
- Never import server-only modules or read secrets from a client component.

## Styling

- Tailwind utilities only. Compose conditional classes with `cn()` from `src/utils/cn.ts` — never template-string concatenation.
- Design tokens live in `tailwind.config.ts` and `src/constants/`. Do not hardcode colors, spacing, or timing values that already exist as tokens.

## Animation

This project ships GSAP, Motion, and Lenis. Use what is already there — a new animation dependency needs explicit justification.

- Respect `prefers-reduced-motion` on every new animation. Check it **first**, before any other work in the effect, and return early — `src/components/sections/AboutSection.tsx:52`.
- Kill GSAP timelines and remove ScrollTrigger instances in the effect cleanup. Leaked timelines are the most common bug class here.
- **Cleanup alone does not prevent the leak, because this repo imports GSAP dynamically.** The established pattern awaits `import('gsap')` inside an async function in the effect, which puts an `await` between the effect starting and `gsap.context()` existing. Unmount during that window and React runs your cleanup _first_: `ctx` is still `null`, `ctx?.revert()` no-ops, and the context is then created against a dead component and never reverted. Nothing reports it.

  Guard the resumption with a cancellation flag, checked immediately after the last `await` and set in cleanup:

  ```tsx
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let destroyed = false;
    let ctx: gsap.Context | null = null;

    async function init() {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);
      if (destroyed) return; // ← the guard. Without it the context outlives the component.

      ctx = gsap.context(() => {
        /* animations, targeting refs */
      });
    }
    void init();

    return () => {
      destroyed = true;
      ctx?.revert();
    };
  }, []);
  ```

  Six components already carry this flag — `AboutSection`, `WhyUsSection`, `ProductCategoriesSection`, `CounterStat`, `LenisProvider`, `LoadingScreen`. Match it rather than inventing a variant.

- Target **refs**, not string selectors. `gsap.to('.card', …)` queries the whole document, so a component rendered twice animates both instances from each mount. If you must use selector strings, pass a scope: `gsap.context(fn, scopeRef)` — the second argument confines lookups to that subtree.
- Animate `transform` and `opacity`. Avoid animating layout-triggering properties. **One exception on `opacity`:** never ship it as a server-rendered starting value on content — see the wrapper rules below.

## Components that wrap page content

If a component gates, wraps, or conditionally returns the page's content — a loading screen, an auth wall, a feature flag, a reveal animation — two extra rules apply, and **neither is caught by lint, types, tests or coverage**. Both were learned from real defects in `LoadingScreen.tsx`:

1. **Keep the returned fragment's shape fixed.** React reconciles fragment children by position, so returning `[<Overlay/>, children]` from one branch and `[children]` from another slides `children` onto a different index and remounts the entire subtree — silently erasing anything a visitor had typed. Use one return with stable slots that may hold `null`.
2. **Never let `motion` SSR an `initial` prop, and never gate content on a `mounted` flag.** Both ship an empty or invisible server render.

Full explanation, the failure each one produced, and how to test for them is in `.github/instructions/quality-gates.instructions.md` under "Two rules for any component that wraps page content". Verify with JavaScript disabled — check what the server actually sends, not the post-hydration jsdom render.

## Hooks

- Mirror the existing shape in `src/hooks/` — see `useTypewriter.ts` and `useMagneticHover.ts`.
- Every effect that subscribes, observes, or schedules must return a cleanup function.
- Dependency arrays must be complete and honest. Do not silence the lint rule.

## Accessibility

- Interactive elements are `button` or `a` — not `div` with `onClick`.
- Every image needs meaningful `alt`, or `alt=""` if decorative.
- Every input needs an associated label.
- Visible focus states on everything reachable by keyboard.
- External links: `rel="noopener noreferrer"`.

## Types

- No `any`. Shared types belong in `src/types/`.
- **A dynamic import is not a reason to reach for `any`.** GSAP ships its types as an ambient global namespace (`node_modules/gsap/types/gsap-core.d.ts`), so `gsap.Context`, `gsap.core.Timeline` and friends resolve **with no import at all** — including in a file that only ever loads `gsap` via `await import('gsap')`. Declare `let ctx: gsap.Context | null = null`, not `let ctx: any`. Four components still hold a GSAP handle as `any` behind an `// eslint-disable-next-line @typescript-eslint/no-explicit-any` — `ctx` in `AboutSection` and `WhyUsSection`, `trigger` in `CounterStat`, `gsapRef` in `LenisProvider`. They predate this note; do not copy them.
- Type props explicitly; do not rely on inference across module boundaries.
