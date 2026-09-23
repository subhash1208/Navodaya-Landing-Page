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
  Do NOT use it for motion that is not tied to scroll position — a hover state, a modal
  or page transition, a loading spinner, or a typewriter effect. "text animations" and
  "entrance animation" appear above only in their scroll-triggered sense; arrived at any
  other way they are ordinary component work, and this repo already has
  src/hooks/useTypewriter.ts and useMagneticHover.ts for two of them.
metadata:
  author: 'Utkarsh Patrikar'
  author_url: 'https://github.com/utkarsh232005'
---

# GSAP & Framer Motion — Scroll Animations Skill

Production-grade scroll animations with GitHub Copilot prompts, ready-to-use code recipes, and deep API references.

## Repo overrides — these win over anything below, including `references/*.md`

- **Never run `npm install` or `npx`.** This repo is pnpm-only; `npm install` would create a competing lockfile and break the linked store. `gsap@^3.15.0`, `motion@^12.38.0`, and `lenis@^1.3.23` are **already installed** — no install step is needed for any recipe here. If a new plugin is genuinely required, use `pnpm add`.
- **`@gsap/react` is NOT installed, and must not be added.** Every `useGSAP` recipe below and in `references/gsap.md` is dead in this repo — the import fails gate 3 with TS2307, and `pnpm add @gsap/react` is scope creep the reviewer will flag. The repo pattern is `gsap.context()` inside `useEffect` with `ctx.revert()` in cleanup: see `src/components/sections/AboutSection.tsx:69` and `src/components/sections/WhyUsSection.tsx:70`. Wherever the text below says "never plain `useEffect`", it is wrong here.

  There is a **second** repo pattern, and it is not a variant of the first: `src/components/ui/CounterStat.tsx:32` holds a `ScrollTrigger.create(...)` handle directly and kills that handle in cleanup, with no context involved. An earlier revision of this line cited that file as an example of the `gsap.context()` pattern — so anyone opening it to copy the pattern found a different one. Reach for the context form when a subtree has several animations to own together; reach for the bare handle when there is exactly one trigger.

- **Always kill timelines and ScrollTrigger instances in effect cleanup — and know that cleanup alone does not stop the leak.** Leaked timelines are this repo's most common bug, and the reason they survive a correct-looking cleanup is that every GSAP import here is dynamic. `await import('gsap')` puts an `await` between the effect starting and `gsap.context()` existing; unmount inside that window and React runs your cleanup **first**, while `ctx` is still `null`. `ctx?.revert()` no-ops, the context is then built against a dead component, and nothing reports it.

  Set a `destroyed` flag in cleanup and check it immediately after the last `await`:

  ```tsx
  let destroyed = false;
  let ctx: gsap.Context | null = null;
  async function init() {
    const { gsap } = await import('gsap');
    if (destroyed) return; // ← without this, the context outlives the component
    ctx = gsap.context(() => {
      /* animations, targeting refs */
    });
  }
  void init();
  return () => {
    destroyed = true;
    ctx?.revert();
  };
  ```

  Six components already carry the flag — `AboutSection`, `WhyUsSection`, `ProductCategoriesSection`, `CounterStat`, `LenisProvider`, `LoadingScreen`. Match it rather than inventing a variant, and type the handle `gsap.Context`, never `any` — GSAP's types are an ambient global that resolve with no import. **This override states the guard instead of linking it on purpose:** the full rule lives in `.github/instructions/react-components.instructions.md`, which is `applyTo`-scoped and so loads only once a matching file is open, whereas this skill fires on intent ("animate on scroll") — frequently before any component file is in context at all.

- **Respect `prefers-reduced-motion` on every animation** — non-negotiable, even when a recipe below omits it.
- **Import from `motion/react`**, not `framer-motion`.
- **Never let a `motion.*` element SSR an `initial` prop when it holds page content.** `motion` serialises `initial` into inline styles during server render, so `initial={{ opacity: 0 }}` ships literal `style="opacity:0"` in the HTML — invisible before hydration, and invisible permanently if JS never runs. That is precisely the defect gate 10 exists to catch. **Recipe 2 below is written the forbidden way upstream and has been corrected here.** The primitive is `initial={false}` with a state-driven `animate`, wound back to hidden in a layout effect before first paint; the full pattern is in `.github/instructions/quality-gates.instructions.md` under "Never let `motion` SSR an `initial` prop".
- **Never gate content behind a `mounted` flag.** `const [mounted, setMounted] = useState(false); … if (!mounted) return null` guarantees the server sends an empty tree. This repo has already shipped that bug once — `LoadingScreen` server-rendered a homepage with no `<h1>` and no links while all nine gates were green. `references/framer.md` offers exactly this snippet under the words **"SSR-safe"**, which is the opposite of what it is; that section has been corrected, and if it returns from an upstream merge, delete it.
- **The GSAP recipes below target document-global string selectors — this repo does not.** Every animation in `src/` passes a ref (`AboutSection.tsx:69`, `WhyUsSection.tsx:70`). `gsap.from('.card', …)` matches every `.card` in the document, so a component rendered twice has each mount animate both instances, and the second mount re-runs the first one's entrance. Pass refs, or give the context a scope — `gsap.context(fn, scopeRef)`, where the **second argument** is what confines selector lookups to that subtree. The recipes below omit it because they are written for vanilla JS pages with one of each element.
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

**Upstream writes this as `initial={{ opacity: 0, y: 40 }}`. Do not copy that form for anything a visitor needs to read** — see the repo overrides above. `initial` is serialised into the server HTML, so the element ships at `opacity:0` and stays there if hydration never happens.

For content, animate **transform only** and leave opacity alone. The element is legible in the server HTML, merely offset, and the motion still reads as an entrance:

```jsx
<motion.div
  initial={{ y: 40 }}
  whileInView={{ y: 0 }}
  viewport={{ once: true, margin: '-80px' }}
  transition={{ duration: 0.6 }}
/>
```

The opacity form is fine for genuinely decorative elements — a glow, a divider, a background flourish — where an invisible no-JS render costs the visitor nothing. Decide which one you have before choosing; "it's below the fold" is not the test, because a crawler has no fold.

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
