# Implementation Plan: SEALED Design-System Conformance

**Branch**: `001-design-conformance` | **Date**: 2026-09-24 | **Spec**: `.specify/specs/001-design-conformance/spec.md`

**Input**: Feature specification from `.specify/specs/001-design-conformance/spec.md`

**Note**: This template is filled in by hand, following the `/speckit-plan` template
structure, because this repo's executing agents (`planner`/`implementer`/`reviewer`) read
`.specify/` files directly rather than through the Spec Kit CLI commands.

## Summary

Eleven files carry 22 leftover pre-SEALED classes — 16 graduated/arbitrary corner radii, 5
default-scale or arbitrary shadows, 1 surface gradient — that survived the SEALED palette
migration (`dc13bc3`). The technical approach is a direct class substitution per occurrence
(no new tokens, no new components), grouped into three independently-shippable stories by
violation type (radius → shadow → gradient), each verified by a grep-based acceptance check
plus the full ten-gate suite, run once at the end since all three groups touch a shared,
already-passing baseline.

## Technical Context

**Language/Version**: TypeScript (strict), Next.js 16.3.5, React 19

**Primary Dependencies**: Tailwind (class-level changes only — no new plugin, no new
token); GSAP / Motion / Lenis are present in touched files' surrounding code but are not
themselves modified by this feature

**Storage**: N/A — no data model, no persisted entity

**Testing**: Vitest + Testing Library (unit, gates 1–5), Playwright (e2e, gates 7 and 10)

**Target Platform**: Web, deployed to Vercel

**Project Type**: Single Next.js application (`src/app/`, `src/components/`) — not a
web+backend split

**Performance Goals**: No bundle-size regression beyond noise — this is a class-name swap,
not new runtime code, so the gate 9 baseline (309.6 KB gzipped, recorded 2026-09-24 in
`.github/instructions/quality-gates.instructions.md`) is expected to move by low
single-digit bytes at most, from changed string literals, not by a percentage point

**Constraints**: Must not touch any `rounded-full` occurrence; must not touch any of the
explicitly out-of-scope functional gradients/blurs (FR-007); must not touch already-correct
`shadow-e0`/`e1` usages (FR-008); project-wide coverage must not drop below 90%; gate 10
must pass because `LoadingScreen`/`PageTransition` wrap page content and several touched
files sit under routes those components wrap

**Scale/Scope**: 22 known occurrences across 11 files, 3 conformance groups, 0 new files
expected other than regenerated visual-regression snapshot baselines

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|---|---|---|
| I. Server Components by Default | No touched file adds or removes a `'use client'` boundary — all changes are class-string edits inside existing components | PASS |
| II. Ten Quality Gates | All ten are required by FR-009; gate 10 explicitly called out because touched files are adjacent to `LoadingScreen`/`PageTransition` wrappers | PASS, tracked as an execution requirement in tasks.md |
| III. Motion Discipline | No GSAP/ScrollTrigger/`prefers-reduced-motion` code is touched by this feature — shadows and radii are static Tailwind classes, not animated properties | PASS (not applicable to this diff) |
| IV. Type Safety and Class Composition | Every changed class string is composed the same way it already is today (`cn()` where the surrounding component already uses it, static className strings otherwise) — no new `any`, no template-string concatenation introduced | PASS |
| V. SEALED Design System | This feature *is* the enforcement of principle V — closing the radius, shadow, and gradient gaps it defines | PASS, this is the feature's purpose |

No violations. Re-check after Phase 1: the only design decision requiring judgement is the
`-translate-y-*` lift distance paired with each migrated shadow (spec Assumptions) — this
is a value choice within an already-compliant token, not a constitutional violation, and is
recorded as a decision in tasks.md rather than in Complexity Tracking below.

## Project Structure

### Documentation (this feature)

```text
.specify/specs/001-design-conformance/
├── plan.md              # This file
└── tasks.md             # Phase 2 output
```

No `research.md`, `data-model.md`, `quickstart.md`, or `contracts/` are produced — there is
no unresolved technical unknown (Phase 0 research), no data entity (Phase 1 data-model),
and no API contract in scope. Each is omitted deliberately rather than left as an empty
placeholder.

### Source Code (repository root)

This is the existing single Next.js project — no new directories. Files this feature
touches:

```text
src/app/
├── not-found.tsx                    # radius: lines 16, 22
├── products/
│   ├── page.tsx                     # radius: line 21
│   ├── loading.tsx                  # radius: line 23
│   ├── error.tsx                    # radius: lines 23, 29
│   └── [slug]/
│       ├── page.tsx                 # radius: lines 110, 125, 137, 144
│       └── error.tsx                # radius: lines 24, 30
└── globals.css                      # shadow: lines 63, 71, 79

src/components/
├── ui/
│   ├── ProductViewer.tsx            # radius: lines 22, 26, 44; shadow: line 26
│   └── CounterStat.tsx              # radius: line 82; shadow: line 82
└── sections/
    └── ContactSection.tsx           # gradient: line 84

e2e/visual-regression.spec.ts-snapshots/
├── hero-desktop-chromium-win32.png            # expected to regenerate
├── hero-mobile-chromium-win32.png             # expected to regenerate
├── product-detail-mobile-chromium-win32.png   # expected to regenerate
├── products-mobile-chromium-win32.png         # expected to regenerate
└── products-page-desktop-chromium-win32.png   # expected to regenerate
```

**Structure Decision**: No structural change. This feature is a targeted class-string
conformance pass over 8 existing route/component files plus one shared stylesheet, with
snapshot regeneration as a downstream consequence rather than a goal in itself.

## Complexity Tracking

*No entries — the Constitution Check above found no violations requiring justification.*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |
