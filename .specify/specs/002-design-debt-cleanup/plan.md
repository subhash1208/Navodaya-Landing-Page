# Implementation Plan: Design Debt Cleanup

**Branch**: `002-design-debt-cleanup` | **Date**: 2026-09-24 | **Spec**: `.specify/specs/002-design-debt-cleanup/spec.md`

**Note**: This template is filled in by hand, following the `/speckit-plan` template
structure, because this repo's executing agents (`planner`/`implementer`/`reviewer`) read
`.specify/` files directly rather than through the Spec Kit CLI commands — same convention
as `001-design-conformance/plan.md`.

## Summary

Seven independent read-only-audit findings, deferred by `001-design-conformance`, are
closed here: one colour-token migration with a mandatory contrast fix (User Story 1), two
dead-code deletions with an ordering constraint and a documentation update (User Story 2),
one unreferenced-asset deletion with a retained-asset near-miss (User Story 3), and four
pure-tidiness removals with no rendering consequence (User Stories 4–7). Unlike `001`, this
feature's technical approach is not a single class of edit — it mixes a token swap, file
deletions, a config edit, and a test-mock fix — so each story is verified by its own
grep-based or existence-based independent test, with the full ten-gate suite run once at
the end over the whole feature.

## Technical Context

**Language/Version**: TypeScript (strict), Next.js 16.3.5, React 19

**Primary Dependencies**: Tailwind (config-level token deletion, class-level swaps — no new
plugin, no new token); Vitest/Testing Library (test-file deletions and the `next/image`
mock fix); Playwright (snapshot file deletions)

**Storage**: N/A — no data model, no persisted entity

**Testing**: Vitest + Testing Library (unit, gates 1–5), Playwright (e2e, gates 7 and 10)

**Target Platform**: Web, deployed to Vercel

**Project Type**: Single Next.js application (`src/app/`, `src/components/`) — not a
web+backend split

**Performance Goals**: Net bundle-size direction is not predictable in advance and must be
measured, not assumed — see Risks below. The `tailwind.config.ts` keyframe/animation
deletions (User Story 4) and the `.card-hover*` CSS deletions (User Story 5) have zero
bundle cost either way, since Tailwind never emitted a utility for classes with no
consumer; the asset deletions (User Story 3) remove `.webp` files, which gate 9 does not
measure at all (it scopes to `.next/static/**/*.js`). The one component that touches JS
bundle size at all is the deleted `useMagneticHover.ts`/`MagneticWrapper.tsx` pair (User
Story 2), which removes runtime code rather than a class string.

**Constraints**: `MagneticWrapper.tsx` must be deleted before `useMagneticHover.ts` (FR-007);
`public/categories/` must not be touched (FR-011); the `grey-500`→`grey-600` contrast fix
must be scoped only to the `grey-100` pairing, not applied where `grey-500` already passes
on `grey-50` (FR-004); the four existing local `next/image` mock overrides must not be
deduplicated when the global mock is fixed (User Story 6); project-wide coverage must not
drop below 90%.

**Scale/Scope**: 7 user stories, roughly 25 files touched (3 page files, 1 Tailwind config,
1 globals.css, 3 component/hook files + 3 test files, 16 asset files + 2 READMEs, 1 test
setup file, 3 snapshot files, 1 `AGENTS.md` edit) — the widest file count of any feature in
this repo's Spec Kit history so far, entirely because it is a backlog of unrelated small
findings rather than one cohesive change.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|---|---|---|
| I. Server Components by Default | No touched file adds or removes a `'use client'` boundary — the three page files are Server Components before and after; deleted files carried no client boundary this feature depends on | PASS |
| II. Ten Quality Gates | All ten are required by FR-016; gate 10 is not obviously triggered by this diff (see Risks — none of the touched files wrap page content), but is run regardless since `src/**` is touched and applicability is evaluated at review time, not assumed here | PASS, tracked as an execution requirement in tasks.md |
| III. Motion Discipline | No GSAP/ScrollTrigger/`prefers-reduced-motion` code is touched — the deleted `useMagneticHover.ts` used neither; the deleted keyframes/CSS were pure Tailwind/CSS with no JS animation logic | PASS (not applicable to this diff) |
| IV. Type Safety and Class Composition | Every changed class string uses the same composition the surrounding file already uses; no new `any` is introduced; the `next/image` mock fix (User Story 6) returns a typed element rather than a raw props object, which is a type-safety improvement, not a regression | PASS |
| V. SEALED Design System | User Story 1 completes the SEALED palette migration's deferred item (retiring the cool-slate `surface` namespace in favour of the warm `grey` ramp); User Story 2 removes two components already noted as stylistically incompatible with SEALED (a 3D pin, a magnetic-hover wrapper) independent of their being unimported | PASS, User Stories 1 and 2 directly serve this principle |

No violations. The only judgement call in this feature — whether the `grey-500`→`grey-600`
contrast fix should also touch `grey-500` on `grey-50` — is resolved by FR-004 (no, that
pairing already passes at 4.92:1) and is recorded as a requirement, not left as an open
design decision.

## Project Structure

### Documentation (this feature)

```text
.specify/specs/002-design-debt-cleanup/
├── plan.md              # This file
└── tasks.md             # Phase 2 output
```

No `research.md`, `data-model.md`, `quickstart.md`, or `contracts/` are produced — same
reasoning as `001`: no unresolved technical unknown, no data entity, no API contract in
scope for any of the seven stories.

### Source Code (repository root)

This is the existing single Next.js project — no new directories. Files this feature
touches or deletes:

```text
src/app/
├── globals.css                       # US5: delete .card-hover* block, lines 58-80
└── products/
    ├── loading.tsx                    # US1: bg-surface-muted → bg-grey-50, line 3
    ├── page.tsx                       # US1: bg-surface-muted → bg-grey-50, line 29
    └── [slug]/
        └── page.tsx                   # US1: bg-surface-muted → bg-grey-50 (line 54),
                                        #      bg-surface-subtle → bg-grey-100 (line 110),
                                        #      text-grey-500 → text-grey-600 (lines 111, 117)

src/components/
├── ui/
│   ├── PinContainer.tsx              # US2: DELETE
│   └── MagneticWrapper.tsx           # US2: DELETE (before the hook, below)
└── sections/
    └── ProductCategoriesSection.tsx   # US3: read-only reference point (line 134),
                                        #      not edited — proves public/categories/ is live

src/hooks/
└── useMagneticHover.ts               # US2: DELETE (after MagneticWrapper.tsx)

src/__tests__/
├── components/ui/PinContainer.test.tsx        # US2: DELETE
├── components/ui/MagneticWrapper.test.tsx      # US2: DELETE
├── hooks/useMagneticHover.test.ts              # US2: DELETE
└── setup.ts                                    # US6: fix next/image mock, lines 26-30

tailwind.config.ts                    # US1: delete `surface` namespace, lines 30-34
                                       # US4: delete aurora/gradientShift keyframes +
                                       #      animation entries, and the shimmer keyframe,
                                       #      lines 110-132

AGENTS.md                             # US2: remove useMagneticHover from src/hooks/ example

public/
├── textures/*.webp (8 files) + README.md   # US3: DELETE
├── hero/*.webp (3 files) + README.md       # US3: DELETE
├── file.svg, globe.svg, next.svg,
│   vercel.svg, window.svg                  # US3: DELETE
└── categories/*.webp (3 files) + README.md # US3: NOT TOUCHED — retained, see Risks

e2e/visual-regression.spec.ts-snapshots/
├── hero-mobile-mobile-win32.png              # US7: DELETE (orphan)
├── products-mobile-mobile-win32.png          # US7: DELETE (orphan)
└── products-page-desktop-mobile-win32.png    # US7: DELETE (orphan)
```

**Structure Decision**: No structural change. Every edit is a deletion, a class-string
swap, a config-block removal, or a test-mock fix inside the existing project layout.

## Risks

- **The retained-asset near-miss is the highest-value lesson in this feature, not just a
  boundary to respect.** `public/categories/*.webp` is reached only through
  `` src={`/categories/${category.slug}.webp`} `` at `ProductCategoriesSection.tsx:134` — a
  runtime-assembled path. A literal-filename or literal-directory grep across `src/` for
  `categories/` would find this line (the template literal contains the substring), but a
  naive audit that greps for the *specific filenames* (`hygiene-safety.webp`,
  `hotel-amenities.webp`, `spa-salon.webp`) would not, because those strings never appear
  as literals anywhere in source. The general lesson, consistent with
  `design-token-migration-audit-gaps` findings from `001`: static analysis cannot prove a
  runtime-assembled asset path is dead, and "not found by grep" is not synonymous with
  "unused." User Story 3's independent test is written to check the directory and template
  literal, not the individual filenames, for exactly this reason.
- **Coverage direction is not obvious in advance.** User Story 2 deletes three source files
  and their three test files together. This moves both the coverage numerator (fewer
  covered lines, since the deleted files' tests were presumably passing and covering their
  own subject) and the denominator (fewer total lines to cover) in the same direction at
  once. Whether the global percentage rises, falls, or holds flat depends on how those
  files' coverage compared to the project average before deletion — it must be measured
  with `pnpm test:coverage` (gate 5) after the deletion, not assumed to hold because "the
  test went with its subject."
- **The `next/image` mock fix (User Story 6) is a correctness fix with a latent-bug
  history.** Every current consumer already shadows the broken global mock with a working
  local override, so fixing the global mock should change no test's behaviour today — but
  this is exactly the shape of assumption that produced `LoadingScreen`'s empty
  server-rendered homepage (see "Why gate 10 exists" in the quality-gates file): a change
  believed to be inert because nothing currently exercises the broken path. The mitigation
  is the same one that file prescribes — run the full unit suite (gate 4) and confirm the
  literal `Tests N passed (N)` count is unchanged before and after this story's edit, not
  just that it exits zero.
- **Bundle-size direction (gate 9) is likewise not obvious in advance for User Story 2.**
  Deleting `useMagneticHover.ts` and `MagneticWrapper.tsx` removes real runtime JS from
  whatever chunk imported it, which should move the gzipped total down — but by how much
  depends on whether that code was already tree-shaken out as dead (unimported) code by
  the bundler before this feature even started. Measure gate 9 per the command in
  `.github/instructions/quality-gates.instructions.md` and record the new total and delta
  against the recorded baseline in that file, in the same commit as the change — the same
  discipline `001` used for its own bundle delta.
- **Deletion order is a correctness constraint, not a style preference, for User Story 2.**
  Deleting `useMagneticHover.ts` before `MagneticWrapper.tsx` would leave, for the span of
  the edit, a component file importing a hook module that no longer exists — a build/type
  error (gate 3) rather than a silent defect, but one that costs a wasted gate run to
  discover if the order is reversed. Doing the component first, then the hook, avoids it
  entirely.

## Complexity Tracking

*No entries — the Constitution Check above found no violations requiring justification.*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|---------------------------------------|
| — | — | — |
