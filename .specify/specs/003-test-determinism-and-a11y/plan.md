# Implementation Plan: Test Determinism and Accessibility Scanning

**Branch**: `003-test-determinism-and-a11y` | **Date**: 2026-09-24 | **Spec**:
`.specify/specs/003-test-determinism-and-a11y/spec.md`

**Note**: Filled in by hand, following the `/speckit-plan` template structure, because this
repo's executing agents read `.specify/` files directly rather than through the Spec Kit CLI
— same convention as `001` and `002`.

## Summary

Two independent read-only findings, deferred by `002-design-debt-cleanup`, are closed here:
a five-story visual-regression determinism fix with a strict internal ordering constraint
(User Stories 1–4), and a new accessibility-scanning capability with no ordering constraint
of its own (User Story 5). The determinism work is the harder half — it must be sequenced
correctly or it trades one false signal for another — and the plan below treats that
ordering as the central technical decision, not an implementation detail.

## Technical Context

**Language/Version**: TypeScript (strict), Next.js 16.3.5, React 19

**Primary Dependencies**: Playwright (`toHaveScreenshot`, `contextOptions.reducedMotion`,
web-first assertions) for Part A; `@axe-core/playwright` (new) for Part B.

**Storage**: N/A — no data model, no persisted entity.

**Testing**: Playwright e2e only (gate 7 and, for Part B, a new spec under the same gate).
No unit test is added or changed by this feature — see Testing note in `tasks.md`.

**Target Platform**: Web, deployed to Vercel.

**Project Type**: Single Next.js application — no structural change.

**Performance Goals**: Gate 9 (bundle size) is not expected to move — `@axe-core/playwright`
is a dev dependency used only inside a Playwright spec, never imported by application code,
so it should not enter `.next/static/**/*.js`. This must be measured, not assumed — see
Risks.

**Constraints**: The determinism sequencing constraint (below) is the binding constraint on
Part A. Part B's no-suppression rule (spec FR-012) is the binding constraint on User Story 5.

**Scale/Scope**: 5 user stories touching `e2e/visual-regression.spec.ts` (scaffolding +
tolerance), 6 snapshot PNG files (regenerated), 1 source line
(`src/app/products/[slug]/page.tsx:110`), `package.json`/`pnpm-lock.yaml` (new dependency),
and one new e2e spec file.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|---|---|---|
| I. Server Components by Default | No touched file adds or removes a `'use client'` boundary — `products/[slug]/page.tsx` is a Server Component before and after; the border-class edit is a class-string swap only | PASS |
| II. Ten Quality Gates | All ten required by FR-013; gates 8 and 9 are explicitly in scope because a new dependency is added — see quality-gates.instructions.md's applicability table | PASS, tracked as an execution requirement in tasks.md |
| III. Motion Discipline | Directly served by User Stories 2–4: `reducedMotion` context plus a condition-based wait is exactly the "respect `prefers-reduced-motion`" and "wait on a condition, never a `waitForTimeout`" discipline this principle and `testing.instructions.md` already require of application code, applied here to the tests that verify it | PASS, User Stories 2–4 directly serve this principle |
| IV. Type Safety and Class Composition | The one source-code edit (FR-001) swaps one Tailwind class for another using the same `className` string already in place; no new `any`, no template-string class concatenation | PASS |
| V. SEALED Design System | FR-001 is a contrast/visibility correction consistent with the SEALED hairline-border pattern documented for this principle; User Story 5 is the first mechanical check this repo has ever run against the principle's own admission that "nothing mechanical in this repo verifies contrast" | PASS, User Story 5 directly closes a gap this principle names |

No violations. The one judgement call in this feature — whether a found axe violation gets
fixed or escalated — is resolved by spec FR-012 (never suppressed, always one or the other)
and is not left as an open design decision at the constitution-check stage.

## Project Structure

### Documentation (this feature)

```text
.specify/specs/003-test-determinism-and-a11y/
├── spec.md
├── plan.md              # This file
└── tasks.md             # Phase 2 output
```

No `research.md`, `data-model.md`, `quickstart.md`, or `contracts/` — same reasoning as `001`
and `002`: no data entity, no API contract in scope, and User Story 5's one open technical
question (the exact axe rule-tag set) is resolved by reading the installed package's own
docs during implementation, not by a separate research phase here.

### Source Code (repository root)

```text
src/app/products/[slug]/
└── page.tsx                                  # US1: border-grey-100 -> border-grey-200,
                                                #      line 110 — must land before regeneration

e2e/
├── visual-regression.spec.ts                  # US2: add reducedMotion + web-first waits to
│                                               #      4 tests (about, products-page-desktop,
│                                               #      products-mobile, product-detail-mobile)
│                                               #      US4: maxDiffPixelRatio 0.05 -> 0.02,
│                                               #      all 6 call sites
├── visual-regression.spec.ts-snapshots/
│   ├── hero-desktop-chromium-win32.png            # US3: regenerate
│   ├── hero-mobile-chromium-win32.png             # US3: regenerate
│   ├── about-desktop-chromium-win32.png           # US3: regenerate + inspect (was stale)
│   ├── products-page-desktop-chromium-win32.png   # US3: regenerate
│   ├── products-mobile-chromium-win32.png         # US3: regenerate
│   └── product-detail-mobile-chromium-win32.png   # US3: regenerate
└── accessibility.spec.ts                      # US5: NEW — axe scan, name subject to
                                                #      implementation (matches this repo's
                                                #      `e2e/*.spec.ts` convention)

package.json                                   # US5: add @axe-core/playwright (dev dep)
pnpm-lock.yaml                                 # US5: regenerated by the dependency add
```

**Structure Decision**: No structural change. Every Part A edit is inside an existing spec
file or an existing snapshot directory; Part B adds one new spec file following the existing
`e2e/*.spec.ts` convention and one new dev dependency.

## The sequencing constraint

This is the central technical decision in this feature, stated once here so `tasks.md` can
enforce it as task ordering rather than prose:

```text
US1 (border fix) → US2 (scaffolding) → US3 (regenerate + inspect) → US4 (tighten tolerance)
```

**Why this order and no other:**

- **US1 before US3**: the border fix changes pixels inside two of the six captured regions.
  Regenerating before it lands means regenerating again after.
- **US2 before US3**: reduced motion legitimately changes what four of the six baselines
  capture (a settled headline or scroll position instead of a mid-motion frame). Regenerating
  before scaffolding lands bakes the old race into the new baseline file.
- **US3 before US4**: a snapshot is truth once written. Tightening tolerance against a
  baseline that has not been regenerated under the new scaffolding compares a determinstic
  capture against a race-affected reference, which fails for the wrong reason.
- **US4 last, never first**: tightening tolerance on a still-racy spec (skipping US2/US3)
  trades a proven false-green (the current 5% hiding a header redesign) for a new false-red
  (a deterministic-looking test that still fails intermittently because the underlying
  capture is not actually deterministic). Only completing US1–US3 first makes the tight end
  of US4 safe.

**User Story 5 has no position in this chain.** It touches none of the same files and may
run before, during, or after US1–US4 without consequence.

## Risks

- **The two-sided tolerance risk is the reason this feature exists, and it cuts both ways
  during implementation, not just before it.** Too loose (the current `0.05`) hides a real
  regression, as `about-desktop` already demonstrated. Too tight, applied to a spec that is
  still racy, manufactures a false red that costs a review round to diagnose as "the test,
  not the code." The sequencing constraint above is the only thing that makes the tight end
  safe — an implementer who tightens tolerance opportunistically alongside scaffolding,
  rather than strictly after regeneration and inspection, reintroduces this risk even while
  believing they are fixing it.
- **A regenerated baseline is not self-certifying.** `--update-snapshots` (in either preset)
  exiting 0 proves the capture matched itself, not that the capture is correct — this is
  exactly how the current `about-desktop` baseline went stale under the loose tolerance in
  the first place. FR-006 makes visual inspection a named requirement rather than an implied
  courtesy, specifically to prevent this feature from repeating the failure mode it exists
  to fix.
- **Extending `reducedMotion` to `about section` risks interacting with the scroll-settling
  fix already in place there (`waitForScrollToSettle`, `:29-48`).** Reduced motion and Lenis
  scroll-lerping are different mechanisms — disabling one should not disable the other — but
  this has not been exercised together in this codebase before. Verify both waits still fire
  and the test still passes deterministically after both are present, not just that neither
  throws.
- **The axe rollout risk is scope creep disguised as thoroughness.** A first scan of a
  five-page, image-light, largely-semantic site is likely to surface at most a handful of
  findings, plausibly the near-threshold `grey-500`/`grey-50` contrast pairing already
  flagged in this repo's memory graph. The correct response to any finding is FR-012's binary
  choice — fix it, or escalate it by name — never a rule suppression, an `axe.exclude()` on
  the offending selector, or a lowered rule severity to reach a green run. A suppressed
  finding is indistinguishable from a real pass in every gate that runs after it, which is
  the same failure shape as a coverage exclusion or a loosened threshold, both of which this
  repo already forbids elsewhere.
- **Gates 8 and 9 have real content for the first time in three features, and gate 7 runs
  twice in this feature's lifecycle (once to regenerate, once to verify) — the "stale build /
  reused server" risk in `quality-gates.instructions.md` applies to both runs independently.**
  Confirm port 3000 is free and the `[WebServer] $ next build` marker appears before trusting
  either run, not just the final one.
- **Bundle-size direction (gate 9) should be flat, but this must be measured.** A dev
  dependency used only inside a Playwright spec has no import path into application code, so
  it should not enter `.next/static/**/*.js` at all — but "should not" is the same class of
  assumption `002`'s plan flagged for its own bundle-affecting deletion, and it is resolved
  the same way here: run gate 9 and record the number, not the expectation.

## Complexity Tracking

*No entries — the Constitution Check above found no violations requiring justification.*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|---------------------------------------|
| — | — | — |
</content>
