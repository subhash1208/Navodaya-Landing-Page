# Navodaya Landing Page Constitution

## Core Principles

### I. Server Components by Default

`'use client'` is added only when a component needs state, effects, browser APIs, or event
handlers, and the boundary is pushed as low in the tree as possible — a client boundary
high in the tree drags its whole subtree into the client bundle. Server-only modules and
secrets are never imported into a client component.

Source of truth: `AGENTS.md` → "Non-negotiables"; Next.js-specific detail in
`.github/instructions/nextjs.instructions.md`.

### II. Ten Quality Gates Are the Sole Authority on Correctness (NON-NEGOTIABLE)

No change is considered done until format, lint, types, unit tests, coverage, build, e2e,
dependency audit, bundle size, and SSR/no-JS all pass, in that order — stop at the first
failure, because a later gate's output is meaningless if an earlier one failed. A gate
counts as passed **only when its literal output appears in the transcript**; an asserted
green with no matching verbatim output is RED by default. Coverage is **≥90%, project-wide,
not changed-files-only** — a new untested file or an uncovered branch in an existing file
can block a commit even when the diff itself is fully covered.

It is never acceptable to skip, delete, or loosen a failing test to get green; to lower a
coverage threshold or add a coverage exclusion to make a number pass; or to use
`--no-verify` to bypass `.husky/pre-commit`. Applicability is part of a gate's definition,
not a licence to duck it — a diff that cannot move what a gate measures may rule that gate
out explicitly, but silence is not the same as ruling it out.

Full gate table, commands, pass criteria, and recorded baselines (bundle size, build
warnings): `.github/instructions/quality-gates.instructions.md`.

### III. Motion Discipline

Every new animation checks `prefers-reduced-motion` first, before any other work in the
effect, and returns early. GSAP timelines and ScrollTrigger instances are killed in effect
cleanup — leaked timelines are this repo's most common bug class, and because GSAP is
imported dynamically (`await import('gsap')`), cleanup alone is insufficient: a
cancellation flag checked immediately after the last `await` is required to prevent a
context from being created against an already-unmounted component.

A component that gates, wraps, or conditionally returns page content — a loading screen,
an auth wall, a feature flag, a reveal animation — carries two additional obligations that
nothing in gates 1–9 catches automatically: the returned fragment's shape must stay fixed
across branches (React reconciles fragment children by position, and a shape change
remounts the subtree, silently destroying in-progress user input), and `motion` must never
serialise an `initial` prop into the server-rendered HTML. Both were learned from real
defects in `LoadingScreen.tsx`, detailed in the quality-gates file under "Two rules for any
component that wraps page content." Verification is gate 10: confirm what the server
actually sends with JavaScript disabled, not the post-hydration jsdom render.

### IV. Type Safety and Class Composition

No `any`. Shared types live in `src/types/`. A dynamic import is not an exemption — GSAP's
ambient types resolve without a static import. Classes are composed with `cn()` from
`src/utils/cn.ts`; template-string concatenation is not used for conditional classes.

### V. The SEALED Design System

The visual language is a near-monochrome specimen-catalogue aesthetic, and every rule below
is a binding constraint, not a preference:

- **Surfaces** are `ink` (#0A0B0D) and `paper` (#FAFAF8), with a warm `grey` 50–900 ramp
  (`tailwind.config.ts:37-48`). This ramp is **not** Tailwind's `stone`/`zinc`/`slate` —
  computing contrast against an assumed Tailwind ramp gives answers wrong by roughly 2
  points of contrast ratio.
- **Hairline 1px borders replace shadows, blur, and glass.** Elevation is expressed through
  the `e0`–`e5` scale (`tailwind.config.ts:85-91`), where `e0` is literally `none`. The
  house pattern is `shadow-e0` at rest, `hover:shadow-e1` on interaction — see
  `src/components/ui/ProductCard.tsx:26`.
- **No gradients as surface colour.** Gradients survive only as functional effects: edge
  fade masks, motion sweeps, cursor spotlights. A gradient used as a section or card
  background is a violation regardless of which colours it blends.
- **Square corners.** `rounded-full` remains legitimate for pills, avatars, and circular
  controls. The graduated `rounded-sm|md|lg|xl|2xl|3xl` scale and arbitrary bracket radii
  (`rounded-[...]`) do not belong in this system.
- **The two-accent surface split is load-bearing accessibility, not taste.** `brand.blue`
  (#085898) is for **light** surfaces only — 7.03:1 on paper, but 2.68:1 on ink, a WCAG AA
  failure. `brand.cyan` (#08B8F8) is for **dark** surfaces only — 8.65:1 on ink, but 2.18:1
  on paper, also a failure. Any new colour pairing must be checked against WCAG AA (4.5:1
  normal text, 3:1 large text and UI boundaries) before it ships.
- **Nothing mechanical in this repo verifies contrast.** Gates returning identical numbers
  before and after a colour change proves the edit did not break the build — it is not
  evidence the colours are right. Contrast is checked by hand or not at all, and a change
  touching colour must say explicitly that this check was done.

## Technology Constraints

- **Stack**: Next.js 16, React 19, TypeScript, Tailwind, GSAP / Motion / Lenis, Vitest +
  Playwright. This is not the Next.js in most training data — read
  `node_modules/next/dist/docs/` or query `context7` before writing code against an API
  from memory.
- **Package manager is pnpm, exclusively.** Never `npm` or `npx` — `npm install` creates a
  competing `package-lock.json` and a flat `node_modules`, breaking pnpm's linked store.
- **Structure**: `src/app/` (routes, layouts, server actions), `src/components/`
  (`layout/`, `sections/`, `ui/`), `src/hooks/`, `src/constants/`, `src/utils/`,
  `src/__tests__/` (mirrors `src/` paths, never co-located), `e2e/` (Playwright).

## Development Workflow

Non-trivial work runs through the agent pipeline defined in `AGENTS.md` and
`.github/instructions/agentic-workflow.instructions.md`:
`planner → researcher ×N (parallel) → implementer (code + tests) → reviewer ⇄ fix loop (max
5 rounds) → memory-updater → commit`. The reviewer owns gates 6–10 and the GREEN/RED
verdict; it never fixes what it finds. Review round 5 without a green verdict is an
escalation to the human, not a sixth round.

A GREEN pipeline commits its own work locally, in Conventional Commits format
(`CONTRIBUTING.md`), staged file-by-file — never `git add -A` — and never onto `master` or
`develop` directly. Pushing is the one human-approval gate in this repo
(`permissions.ask`, scoped to `git push` only); everything upstream of it runs
autonomously and must not be slowed down with additional confirmation steps.

## Governance

This constitution consolidates rules that already govern this repository — it does not
introduce new ones. Its source material is `AGENTS.md` and
`.github/instructions/quality-gates.instructions.md`; where either is amended, this file is
amended in the same change so the two never diverge. `.github/` is the single source of
truth for agent- and process-level rules; `.claude/` is generated by `pnpm agents:sync` and
is overwritten on every run — never edit it by hand.

Any Spec Kit artifact (spec, plan, tasks) that conflicts with a principle here is wrong,
not the constitution — resolve the artifact, or amend this document explicitly with the
reason recorded in the amendment history below. Complexity that violates a principle
(e.g., a coverage exclusion, a new colour pairing outside the two-accent split, a shadow
outside the `e0`–`e5` scale) must be justified in the plan's Complexity Tracking section or
rejected.

**Version**: 1.0.0 | **Ratified**: 2026-09-24 | **Last Amended**: 2026-09-24
