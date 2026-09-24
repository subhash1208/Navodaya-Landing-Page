---
description: "Task list for test determinism and accessibility scanning"
---

# Tasks: Test Determinism and Accessibility Scanning

**Input**: Design documents from `.specify/specs/003-test-determinism-and-a11y/`

**Prerequisites**: `plan.md` (required), `spec.md` (required for user stories)

**Tests**: This feature IS test infrastructure — every story either edits an existing e2e
spec, regenerates its baselines, or adds a new e2e spec. User Story 1 is the one exception
(a source-code class swap, verified by grep, not a new test). No unit test (`.test.tsx`) is
added or changed by this feature.

**Organization**: Tasks are grouped by user story, in the dependency order `spec.md` and
`plan.md`'s sequencing constraint set: US1 (border fix) → US2 (scaffolding) → US3
(regenerate + inspect) → US4 (tighten tolerance). US5 (axe) has no ordering dependency on
US1–US4 and is listed after them only because Part A is this feature's harder half, not
because US5 must wait.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1–US5 map to `spec.md`'s five user stories, in the same order
- All paths are relative to the repository root

## Phase 1: Setup

- [ ] T001 Confirm the working branch is not `master` or `develop`
      (`git rev-parse --abbrev-ref HEAD`) — per
      `.github/instructions/agentic-workflow.instructions.md`, create a feature/fix branch
      first if it is; otherwise proceed on the current branch. Note: this feature is
      reported as being implemented in parallel with this document's authoring, on
      `feature/subhash` — re-confirm the branch is still correct before any commit.
- [ ] T002 Re-verify every file:line occurrence named in `spec.md` against the current state
      of `e2e/visual-regression.spec.ts` and `src/app/products/[slug]/page.tsx` — this
      feature's Part A work is reported to be in progress concurrently, so line numbers are
      more likely than usual to have already moved.
- [ ] T003 [P] Confirm gates 1–5 are green on the current baseline before any edit, so a
      later failure can be attributed to this feature's changes rather than pre-existing
      state.

## Phase 2: Foundational

**Not applicable.** User Stories 1–4 touch one shared file
(`e2e/visual-regression.spec.ts`) in a strictly ordered sequence — that ordering IS the
foundational constraint, expressed as task dependencies below rather than as a separate
phase. User Story 5 touches disjoint files and introduces no new token, type, or shared
abstraction.

---

## Phase 3: User Story 1 - Invisible border fix (Priority: P1) 🎯 first, blocks US3

**Goal**: The specs-table box border at `src/app/products/[slug]/page.tsx:110` renders
visibly against its own fill.

**Independent Test**: `grep -n "border-grey-100" src/app/products/[slug]/page.tsx` no longer
matches the specs-table box; `border-grey-200` appears there instead.

### Implementation for User Story 1

- [ ] T004 [US1] Replace `border border-grey-100` with `border border-grey-200` in the
      specs-table box's `className` at `src/app/products/[slug]/page.tsx:110`, leaving
      `bg-grey-100` and the rest of the class string unchanged.
- [ ] T005 [US1] Run the Independent Test grep and record the zero-match result; confirm by
      inspection that the sibling cards at `:99` and `:125` already use `border-grey-200`,
      so the fix matches existing convention rather than introducing a new one.

**Checkpoint**: The border fix is in place. **This must land before any task in Phase 5
(US3, regeneration) begins.**

---

## Phase 4: User Story 2 - Determinism scaffolding for the four unscaffolded snapshots (Priority: P1) — blocks US3, US4

**Goal**: All six `toHaveScreenshot` call sites in `e2e/visual-regression.spec.ts` run under
`reducedMotion: 'reduce'` with a condition-based wait on settled state, matching the pattern
already present on the two hero shots.

**Independent Test**: See `spec.md` SC-002 and SC-003 for the verified grep counts.
(Corrected 2026-09-24: this line originally said `grep -c "reducedMotion: 'reduce'"` returns
`6` and `grep -c "waitForTimeout"` returns `0`. The implementation scopes `reducedMotion` once
per `test.describe` block rather than once per test, and `waitForTimeout` appears twice as
comment prose, never as a call — SC-002 and SC-003 carry the authoritative counts and
evidence.)

### Implementation for User Story 2

- [ ] T006 [US2] Add `test.use({ contextOptions: { reducedMotion: 'reduce' } })` scoped to
      the `about section` test (`:88-119`), matching the nesting pattern used for `hero
      section` (`:60-61`).
- [ ] T007 [US2] Add a web-first assertion to `about section` on its own settled condition
      (for example, asserting a stat value or heading is present and stable) before the
      screenshot call — in addition to, not in place of, the existing
      `waitForScrollToSettle` call (`:29-48`), which solves a different, already-diagnosed
      scroll-compositing race and must remain.
- [ ] T008 [P] [US2] Add `test.use({ contextOptions: { reducedMotion: 'reduce' } })` and a
      web-first settled-state assertion to `products catalogue page` (`:121-129`) — parallel
      with T006–T007 and T009–T012, different test in the same file, no shared state.
- [ ] T009 [P] [US2] Add `test.use({ contextOptions: { reducedMotion: 'reduce' } })` and a
      web-first settled-state assertion to `products page mobile` (`:170-178`) — parallel
      with the above.
- [ ] T010 [P] [US2] Add `test.use({ contextOptions: { reducedMotion: 'reduce' } })` and a
      web-first settled-state assertion to `product detail page mobile` (`:180-188`) —
      parallel with the above.
- [ ] T011 [US2] Run the Independent Test greps and record both zero/six results. Run
      `e2e/visual-regression.spec.ts` once at this point expecting FAILURES, not passes — the
      baselines have not been regenerated yet (that is Phase 5) and the new scaffolding is
      expected to change what several of them capture. A failure here is not a defect; a
      crash, timeout, or `waitForTimeout` sighting is.

**Checkpoint**: All six snapshot assertions carry identical determinism scaffolding.
Baselines are now expected to be stale by design — do not treat Phase 4's red run as a
regression to fix; it is the reason Phase 5 exists.

---

## Phase 5: User Story 3 - Baseline regeneration with mandatory visual inspection (Priority: P1) — depends on US1 + US2, blocks US4

**Goal**: All six baselines are regenerated under the combined effect of the border fix and
the new scaffolding, and each is visually confirmed correct before acceptance.

**Independent Test**: All six files under `e2e/visual-regression.spec.ts-snapshots/` are
regenerated in one pass; `about-desktop` is visually confirmed to show the SEALED flat header
and the `51+`/`3`/`100%`/`HYD` stats that `AboutSection.tsx:27-32` actually defines, not the
pre-SEALED navy pill header. (Corrected 2026-09-24: `44+`/`86%` never existed in the source —
see `spec.md` FR-007.)

### Implementation for User Story 3

- [ ] T012 [US3] **Depends on T004–T005 (US1) and T006–T011 (US2) being complete.** Run
      `pnpm exec playwright test e2e/visual-regression.spec.ts --update-snapshots=all` — the
      explicit `all` preset, not the default `changed` preset, which rewrites only failing
      comparisons and would leave most of these six files untouched.
- [ ] T013 [US3] Visually open and inspect `about-desktop-chromium-win32.png` specifically.
      Confirm: SEALED flat-paper header with a square ink button (not the pre-SEALED navy
      pill header with a blue rounded "Get a Quote"); the `51+`/`3`/`100%`/`HYD` stats that
      `AboutSection.tsx:27-32` actually defines (corrected 2026-09-24 — `44+`/`86%` never
      existed in the source; see `spec.md` FR-007); no `AboutSection` text caught
      mid-animation; square corners and hairline borders throughout. Do not accept on
      exit-code alone.
- [ ] T014 [US3] Visually open and inspect the remaining five regenerated baselines
      (`hero-desktop`, `hero-mobile`, `products-page-desktop`, `products-mobile`,
      `product-detail-mobile`) against the same standard of scrutiny: no mid-animation frame,
      no layout break, content consistent with the current site.
- [ ] T015 [US3] If any baseline in T013 or T014 fails visual inspection, fix the underlying
      scaffolding or wait condition (return to Phase 4) and regenerate again — do not accept
      a visually-wrong baseline to avoid re-running Phase 4.

**Checkpoint**: All six baselines are regenerated and visually confirmed correct.
`about-desktop` in particular no longer shows stale pre-SEALED content.

---

## Phase 6: User Story 4 - Tolerance tightening (Priority: P2) — depends on US3

**Goal**: `maxDiffPixelRatio` is tightened below `0.05` at every call site, and two
consecutive runs pass with no code change between them.

**Independent Test**: See `spec.md` SC-005 for the verified per-site values; two consecutive
runs both pass. (Corrected 2026-09-24: this line originally said `grep -c
"maxDiffPixelRatio: 0.02"` returns `6`. The implementation split by shot type — `0.02` × 2,
`0.01` × 4 — which is tighter everywhere it differs from a uniform `0.02`, not looser.)

### Implementation for User Story 4

- [ ] T016 [US4] **Depends on T012–T015 (US3) being complete.** Tighten `maxDiffPixelRatio`
      below `0.05` at all six call sites in `e2e/visual-regression.spec.ts` — per SC-005,
      `0.02` on the two element-locator shots (`hero-desktop`, `about-desktop`) and `0.01` on
      the four fixed-viewport shots (`products-page-desktop`, `hero-mobile`,
      `products-mobile`, `product-detail-mobile`), not a single uniform value.
- [ ] T017 [US4] Run `pnpm exec playwright test e2e/visual-regression.spec.ts` (no
      `--update-snapshots`) twice in immediate succession with no intervening code change.
      Record both results; both must report all six tests passing. A single pass is not
      sufficient evidence of determinism.

**Checkpoint**: Tolerance is tightened and proven stable across two consecutive runs. Part A
is complete.

---

## Phase 7: User Story 5 - Accessibility scanning with `@axe-core/playwright` (Priority: P2)

**Goal**: An automated accessibility scan runs in this repo for the first time, against at
least the three routes already exercised by `e2e/visual-regression.spec.ts`, with zero
violations or every violation named as an explicit escalated finding.

**Independent Test**: `@axe-core/playwright` appears in `package.json`'s dev dependencies; a
new e2e spec runs an axe scan and asserts on its results.

**Note**: Independent of Phases 3–6 — no shared file, no ordering dependency. May run in
parallel with any or all of them.

### Implementation for User Story 5

- [ ] T018 [P] [US5] Add `@axe-core/playwright` to `package.json`'s dev dependencies and
      install it (regenerating `pnpm-lock.yaml`) — per this repo's standing rule, verify the
      current API (`resolve-library-id` / `query-docs` against context7, or the package's own
      installed docs) before writing the spec below rather than assuming an API shape from
      memory.
- [ ] T019 [US5] **Depends on T018.** Create a new e2e spec (e.g.
      `e2e/accessibility.spec.ts`) that runs an axe scan against `/`, `/products`, and a
      product detail route, and asserts zero violations at the standard WCAG 2 A/AA rule
      set — verified against the installed package's API, not assumed.
- [ ] T020 [US5] Run the new spec. If it reports zero violations, record the passing result.
      If it reports any violation, either fix it in the same change or record it explicitly
      as an escalated finding requiring a design decision — per spec FR-012, a rule
      suppression, an excluded selector, or a lowered severity used to reach zero violations
      is never an acceptable resolution and must not appear in the diff.

**Checkpoint**: An automated accessibility gate exists and either reports clean or has every
finding named, never silenced.

---

## Phase 8: Gates and Handoff

**Purpose**: Prove the change is correct by the repo's actual authority — the ten quality
gates — and close out the pipeline per `agentic-workflow.instructions.md`.

- [ ] T021 Gate 1 — `pnpm format:check`, zero diffs, output pasted verbatim.
- [ ] T022 Gate 2 — `pnpm lint`, zero errors, output pasted verbatim.
- [ ] T023 Gate 3 — `pnpm exec tsc --noEmit`, zero errors, output pasted verbatim.
- [ ] T024 Gate 4 — `pnpm test`, all passing, output pasted verbatim — this feature adds no
      unit test, so this gate's count should be unchanged from the pre-feature baseline.
- [ ] T025 Gate 5 — `pnpm test:coverage`, ≥90% project-wide on all four metrics, output
      pasted verbatim — no source file gains or loses lines of application logic in this
      feature (US1 is a single class-string swap), so this number is expected to hold flat;
      confirm rather than assume.
- [ ] T026 Gate 6 — `pnpm build`; compare its stripped-ANSI warning count against the
      recorded zero-warning baseline in `.github/instructions/quality-gates.instructions.md`.
- [ ] T027 Gate 7 — confirm port 3000 is free, then `pnpm test:e2e`, all passing, output
      pasted verbatim; confirm the `[WebServer] $ next build` marker appears exactly once;
      this run must include both the tightened visual-regression spec (US4) and the new
      accessibility spec (US5).
- [ ] T028 Gate 8 — `pnpm audit --prod --audit-level=high`, exits 0, output pasted verbatim
      — this is the first feature since `002` where a real dependency change is present in
      the diff, per `plan.md`'s Risks section.
- [ ] T029 Gate 9 — measure gzipped `.next/static` per the command in
      `quality-gates.instructions.md`; record the new total and delta against the recorded
      baseline in that file. Expected flat (per `plan.md`'s Risks section — `@axe-core/
      playwright` is a dev dependency with no application import path), but this must be
      measured, not assumed.
- [ ] T030 Gate 10 — `pnpm exec playwright test e2e/loading-screen.spec.ts`; server HTML
      contains the page's `<h1>` and its links, output pasted verbatim.
- [ ] T031 Commit the change in Conventional Commits format (e.g. `test(e2e): tighten visual-
      regression determinism and add axe accessibility scan`), staged file-by-file, on the
      current feature branch — never `git add -A`, never onto `master`/`develop` directly.
- [ ] T032 Hand off durable facts to a `memory-updater` stage: the new gate 9 bundle
      baseline (with the axe dependency's measured delta, flat or otherwise), the gate 6
      warning-count re-confirmation, whether US5's axe scan reported zero violations or named
      escalated findings, and the resolution of the `about-desktop` staleness this feature
      was written to fix.

**Checkpoint**: All ten gates green with verbatim output, change committed locally. Pushing
remains the human's call (`permissions.ask`, `git push` only).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Explicitly not applicable.
- **US1 (Phase 3)**: Depends on Setup. Blocks US3.
- **US2 (Phase 4)**: Depends on Setup. Independent of US1 in principle (different lines of
  the same file), but both must complete before US3 — see below.
- **US3 (Phase 5)**: Depends on **both** US1 (Phase 3) and US2 (Phase 4) being complete.
  Blocks US4.
- **US4 (Phase 6)**: Depends on US3 (Phase 5) being complete. This is the strictest
  dependency in this feature — tightening tolerance before regeneration reintroduces the
  two-sided risk `plan.md` names.
- **US5 (Phase 7)**: Depends only on Setup. No dependency on US1–US4 and no task in US1–US4
  depends on it — may run fully in parallel with Phases 3–6.
- **Gates and Handoff (Phase 8)**: Depends on all five user stories being complete — run
  once for the whole feature, per this repo's batching rule.

### Within Each User Story

- T004–T005 (US1): sequential, single file, single edit.
- T006–T010 (US2): T006–T007 (about section) touch the same test and are sequential with
  each other; T008, T009, T010 are each a different test in the same file and may run in
  parallel with T006–T007 and with each other.
- T012–T015 (US3): strictly sequential — regenerate, then inspect the flagged file, then
  inspect the rest, then loop back on any failure.
- T016–T017 (US4): sequential — change the value, then prove it twice.
- T018–T020 (US5): sequential within the story (install → write spec → run and resolve
  findings), but the whole story is parallel with Phases 3–6.

### Parallel Opportunities

- T008, T009, T010 can run in parallel with each other and with T006–T007 — four disjoint
  tests in one file, no shared state between them.
- The entirety of Phase 7 (T018–T020) can run in parallel with the entirety of Phases 3–6 —
  no shared file, no ordering dependency in either direction.
- Nothing in Phase 5 or Phase 6 can be parallelized against its own predecessor phase — both
  dependencies (US3 on US1+US2, US4 on US3) are strict, not merely conventional.

---

## Parallel Example: Across Stories

```bash
# Disjoint work streams, safe to hand to parallel implementer stages:
Task: "Fix border-grey-100 -> border-grey-200 at products/[slug]/page.tsx:110"        # US1
Task: "Add reducedMotion scaffolding to the four unscaffolded visual-regression tests"  # US2
Task: "Add @axe-core/playwright and a new accessibility e2e spec"                       # US5
# NOT safe to parallelize against the above: US3 (needs US1+US2 done) and US4 (needs US3 done)
```

---

## Implementation Strategy

### MVP First (Part A Only)

1. Complete Phase 1: Setup.
2. Skip Phase 2 (not applicable).
3. Complete Phases 3–6 in strict order (US1 → US2 → US3 → US4) — this is Part A, the harder
   half, and the one with a real correctness consequence if sequenced wrong.
4. **STOP and VALIDATE**: confirm two consecutive `pnpm exec playwright test
   e2e/visual-regression.spec.ts` runs both pass before moving on — do not run the full gate
   suite yet, since Phase 7 (US5) will touch `package.json` and `pnpm-lock.yaml` before the
   single end-of-feature gate pass.

### Incremental Delivery

Phase 7 (US5) may be developed at any point relative to Phases 3–6, including fully in
parallel by a second implementer stage, since it shares no file and no ordering dependency.
Per this repo's batching rule, both halves converge on a single Phase 8 gate pass rather than
two separate review rounds — the two halves are cohesive enough (both close deferred items
from the same prior feature) to warrant one review, not independently risky enough to
warrant two.

---

## Notes

- [P] tasks touch different files or disjoint sections of the same file with no dependency
  on each other.
- The **only** hard sequencing constraint in Phases 3–6 is US1+US2 → US3 → US4 — reversing
  any part of it reintroduces the two-sided risk this feature exists to close. Phase 7 has no
  such constraint and is the one place in this feature safe to fully parallelize against
  everything else.
- Re-verify every file:line in T002 before editing — this feature's Part A is reported to be
  under active parallel implementation, so drift is more likely here than in a typical
  feature.
- Stop at each phase's checkpoint to confirm its independent test before moving to the next
  — this matters more than usual in Phase 4→5→6, where the checkpoints are what prevent an
  out-of-order tolerance change.
</content>
