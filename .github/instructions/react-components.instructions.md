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

- Respect `prefers-reduced-motion` on every new animation.
- Kill GSAP timelines and remove ScrollTrigger instances in the effect cleanup. Leaked timelines are the most common bug class here.
- Animate `transform` and `opacity`. Avoid animating layout-triggering properties.

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
- Type props explicitly; do not rely on inference across module boundaries.
