---
name: gsap-framer-scroll-animation
description: >-
  This skill should be used whenever the user wants to build scroll animations, scroll effects,
  parallax, scroll-triggered reveals, pinned sections, horizontal scroll, text animations,
  or any motion tied to scroll position — in vanilla JS, React, or Next.js.
  Covers GSAP ScrollTrigger (pinning, scrubbing, snapping, timelines, horizontal scroll,
  ScrollSmoother, matchMedia) and Framer Motion / Motion v12 (useScroll, useTransform,
  useSpring, whileInView, variants). It applies even when the user only says
  "animate on scroll", "fade in as I scroll", "make it scroll like Apple",
  "parallax effect", "sticky section", "scroll progress bar", or "entrance animation".
  Also triggers for Copilot prompt patterns for GSAP or Framer Motion code generation.
metadata:
  author: 'Utkarsh Patrikar'
  author_url: 'https://github.com/utkarsh232005'
---

# GSAP & Framer Motion — Scroll Animations Skill

Production-grade scroll animations with GitHub Copilot prompts, ready-to-use code recipes, and deep API references.

## Repo overrides — these win over anything below, including `references/*.md`

- **Never run `npm install` or `npx`.** This repo is pnpm-only; `npm install` would create a competing lockfile and break the linked store. `gsap@^3.15.0`, `motion@^12.38.0`, and `lenis@^1.3.23` are **already installed** — no install step is needed for any recipe here. If a new plugin is genuinely required, use `pnpm add`.
- **`@gsap/react` is NOT installed, and must not be added.** Every `useGSAP` recipe below and in `references/gsap.md` is dead in this repo — the import fails gate 3 with TS2307, and `pnpm add @gsap/react` is scope creep the reviewer will flag. The repo pattern is `gsap.context()` inside `useEffect` with `ctx.revert()` in cleanup: see `src/components/sections/AboutSection.tsx:69` and `src/components/ui/CounterStat.tsx:32`. Wherever the text below says "never plain `useEffect`", it is wrong here.
- **Always kill timelines and ScrollTrigger instances in effect cleanup.** Leaked timelines are this repo's most common bug. Prefer `gsap.context()` / `ctx.revert()`.
- **Respect `prefers-reduced-motion` on every animation** — non-negotiable, even when a recipe below omits it.
- **Import from `motion/react`**, not `framer-motion`.
- Animation code is client-side: `'use client'`, pushed as low in the tree as possible.
- Compose classes with `cn()` from `src/utils/cn.ts`.
- The `premium-frontend-ui` skill is **not installed** and is not available. Every cross-reference to it below has been removed; if one reappears from an upstream merge, delete it rather than acting on it.

## Quick Library Selector

| Need                                          | Use                     |
| --------------------------------------------- | ----------------------- |
| Vanilla JS, Webflow, Vue                      | **GSAP**                |
| Pinning, horizontal scroll, complex timelines | **GSAP**                |
| React / Next.js, declarative style            | **Framer Motion**       |
| whileInView entrance animations               | **Framer Motion**       |
| Both in same Next.js app                      | See notes in references |

Read the relevant reference file for full recipes and Copilot prompts:

- **GSAP** → `references/gsap.md` — ScrollTrigger API, all recipes, React integration
- **Framer Motion** → `references/framer.md` — useScroll, useTransform, all recipes

## Imports (both packages are already installed)

### GSAP

```js
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger); // MUST call before any ScrollTrigger usage
```

### Motion (v12)

```js
import { motion, useScroll, useTransform, useSpring } from 'motion/react';
```

There is no install step. An earlier revision of this section opened with `npm install gsap` under
the heading "Setup (Always Do First)" — `npm` is denied by `permissions.json` in this repo and would
break the pnpm store. Nothing here needs installing; `framer-motion` is the legacy package name and
is not what this repo uses.

## Workflow

1. Interpret the user's intent to identify if GSAP or Framer Motion is the best fit.
2. Read the relevant reference document in `references/` for detailed APIs and patterns.
3. Use what is installed — `gsap`, `motion`, `lenis`. Do not propose a new package; that is scope creep, and `@gsap/react` in particular is absent by decision.
4. Implement the scaffold for the animation structure, adhering to the requested format (React components, hook requirements, or vanilla JS).
5. Apply the correct tools (scrolling vs in-view elements) ensuring accessibility options are present and hooks don't cause infinite re-renders.

## The 5 Most Common Scroll Patterns

Quick reference — full recipes with Copilot prompts are in the reference files.

### 1. Fade-in on enter (GSAP)

```js
gsap.from('.card', {
  opacity: 0,
  y: 50,
  stagger: 0.15,
  duration: 0.8,
  scrollTrigger: { trigger: '.card', start: 'top 85%' },
});
```

### 2. Fade-in on enter (Framer Motion)

```jsx
<motion.div
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: '-80px' }}
  transition={{ duration: 0.6 }}
/>
```

### 3. Scrub / scroll-linked (GSAP)

```js
gsap.to('.hero-img', {
  scale: 1.3,
  opacity: 0,
  ease: 'none',
  scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
});
```

### 4. Scroll-linked (Framer Motion)

```jsx
const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
const y = useTransform(scrollYProgress, [0, 1], [0, -100]);
return <motion.div style={{ y }} />;
```

### 5. Pinned timeline (GSAP)

```js
const tl = gsap.timeline({
  scrollTrigger: { trigger: '.section', pin: true, scrub: 1, start: 'top top', end: '+=200%' },
});
tl.from('.title', { opacity: 0, y: 60 }).from('.img', { scale: 0.85 });
```

## Critical Rules (Apply Always)

- **GSAP**: always call `gsap.registerPlugin(ScrollTrigger)` before using it
- **GSAP scrub**: always use `ease: 'none'` — easing feels wrong when scrub is active
- **GSAP React**: `@gsap/react` is not installed here — use `gsap.context()` inside `useEffect` and call `ctx.revert()` in the cleanup, which is what auto-cleans the ScrollTriggers
- **GSAP debug**: add `markers: true` during development; remove before production
- **Framer**: `useTransform` output must go into `style` prop of a `motion.*` element, not a plain div
- **Framer Next.js**: always add `'use client'` at top of any file using motion hooks
- **Both**: animate only `transform` and `opacity` — avoid `width`, `height`, `box-shadow`
- **Accessibility**: always check `prefers-reduced-motion` — see each reference file for patterns
- **Restraint**: animation should enhance, never overwhelm — short durations, one focal motion per viewport, no competing easings

## Copilot Prompting Tips

- Give Copilot the full selector, base image, and scroll range upfront — vague prompts produce vague code
- For GSAP, always specify: selector, start/end strings, whether you want scrub or toggleActions
- For Framer, always specify: which hook (useScroll vs whileInView), offset values, what to transform
- Paste the exact error message when asking `/fix` — Copilot fixes are dramatically better with real errors
- Use `@workspace` scope in Copilot Chat so it reads your existing component structure

## Reference Files

| File                   | Contents                                                                                                                                                                                                                                     |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `references/gsap.md`   | Full ScrollTrigger API reference, 10 recipes, Lenis, matchMedia, accessibility. Its React section is written around `useGSAP` / `@gsap/react`, which is **not installed here** — translate those recipes to `gsap.context()` in `useEffect`. |
| `references/framer.md` | Full useScroll / useTransform API, 8 recipes, variants, Motion v12 notes, Next.js tips                                                                                                                                                       |
