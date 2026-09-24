---
description: "Task list for design debt cleanup"
---

# Tasks: Design Debt Cleanup

**Input**: Design documents from `.specify/specs/002-design-debt-cleanup/`

**Prerequisites**: `plan.md` (required), `spec.md` (required for user stories)

**Tests**: User Stories 1, 4, 5, 7 add no new unit tests — they are class-string swaps,
a config-block deletion, and asset/snapshot deletions, verified by the grep- and
existence-based independent tests named in `spec.md`. User Story 2 deletes tests alongside
their subjects rather than adding any. User Story 6 fixes an existing test-infrastructure
file and is verified by the unchanged pass count of the existing suite, not a new test.
This follows `001`'s precedent: no new `.test.tsx` is anticipated anywhere in this feature.

**Organization**: Tasks are grouped by user story, in the priority order `spec.md` sets:
US1 (surface tokens + contrast) → US2 (dead components) → US3 (dead assets) → US4 (dead
keyframes) → US5 (dead CSS) → US6 (broken mock) → US7 (orphan snapshots).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1–US7 map to `spec.md`'s seven user stories, in the same order
- All paths are relative to the repository root

## Phase 1: Setup

- [ ] T001 Confirm the working branch is not `master` or `develop`
      (`git rev-parse --abbrev-ref HEAD`) — per
      `.github/instructions/agentic-workflow.instructions.md`, create a feature/fix branch
      first if it is; otherwise proceed on the current branch.
- [ ] T002 Re-verify every file:line occurrence named in `spec.md` against the current
      state of each file — line numbers may have drifted since the three read-only audits
      that produced this spec.
- [ ] T003 [P] Confirm gates 1–5 are green on the current baseline before any edit, so a
      later failure can be attributed to this feature's changes rather than pre-existing
      state.

## Phase 2: Foundational

**Not applicable.** The seven stories touch disjoint files (`ProductCategoriesSection.tsx`
is read-only reference material for US3, not an edit target) and introduce no new token,
component, or shared abstraction — there is nothing that must exist before story work can
begin.

## Phase 3: User Story 1 - Surface-token retirement with contrast correction (Priority: P1) 🎯 MVP

**Goal**: Zero `surface-*` references remain in `src/`, `e2e/`, or `tailwind.config.ts`, and
the one contrast risk the token swap introduces is corrected in the same change.

**Independent Test**: `grep -r "surface-" src/ e2e/` returns zero results, `grep -n
"surface" tailwind.config.ts` returns zero results, and `text-grey-600` (not `grey-500`)
appears at `products/[slug]/page.tsx:111,117`.

### Implementation for User Story 1

- [ ] T004 [P] [US1] Replace `bg-surface-muted` with `bg-grey-50` at
      `src/app/products/loading.tsx:3`.
- [ ] T005 [P] [US1] Replace `bg-surface-muted` with `bg-grey-50` at
      `src/app/products/page.tsx:29`.
- [ ] T006 [US1] Replace `bg-surface-muted` with `bg-grey-50` at
      `src/app/products/[slug]/page.tsx:54`, replace `bg-surface-subtle` with
      `bg-grey-100` at line 110, and replace `text-grey-500` with `text-grey-600` at lines
      111 and 117 — all four edits are in the same file and the last two are the mandatory
      contrast fix (4.375:1 → 6.72:1), so make them in one pass.
- [ ] T007 [US1] Delete the `surface` namespace (`DEFAULT`, `muted`, `subtle`) from
      `tailwind.config.ts:30-34`, after T004–T006 remove its last call sites.
- [ ] T008 [US1] Run the Independent Test grep and record the zero-match result; confirm
      by inspection that `text-grey-500` still appears unchanged wherever it pairs with
      `bg-grey-50` (per FR-004, that pairing already passes at 4.92:1 and is out of scope).

**Checkpoint**: Surface-token conformance is complete, the mandatory contrast fix is in
place, and the `surface` namespace no longer exists.

---

## Phase 4: User Story 2 - Dead component and hook deletion (Priority: P2)

**Goal**: `PinContainer.tsx`, `MagneticWrapper.tsx`, `useMagneticHover.ts`, and their three
tests are deleted, in an order that never leaves a live component importing a deleted hook,
and `AGENTS.md` no longer names the deleted hook.

**Independent Test**: `grep -rn "PinContainer\|MagneticWrapper\|useMagneticHover" src/
AGENTS.md` returns zero results; none of the six files (3 source + 3 test) exists on disk.

### Implementation for User Story 2

- [ ] T009 [P] [US2] Delete `src/components/ui/PinContainer.tsx` and its test
      `src/__tests__/components/ui/PinContainer.test.tsx` together — independent of the
      MagneticWrapper/useMagneticHover pair below, safe to run in parallel with T010–T011.
- [ ] T010 [US2] Delete `src/components/ui/MagneticWrapper.tsx` and its test
      `src/__tests__/components/ui/MagneticWrapper.test.tsx` together — **must complete
      before T011**, since this component is `useMagneticHover.ts`'s only non-test
      importer.
- [ ] T011 [US2] Delete `src/hooks/useMagneticHover.ts` and its test
      `src/__tests__/hooks/useMagneticHover.test.ts` together — **depends on T010**.
- [ ] T012 [P] [US2] Update `AGENTS.md`'s `src/hooks/` structure-table example to name a
      hook that still exists (`useTypewriter`) in place of the deleted `useMagneticHover` —
      independent of T009–T011, safe to run in parallel.
- [ ] T013 [US2] Run the Independent Test grep and record the zero-match result.

**Checkpoint**: Dead component/hook removal is complete; no build error was introduced by
deletion order; documentation matches the codebase.

---

## Phase 5: User Story 3 - Unreferenced asset removal (Priority: P2)

**Goal**: 16 unreferenced files and 2 README.md files documenting only them are deleted
from `public/`, while `public/categories/` (3 `.webp` files + `README.md`) is explicitly
untouched.

**Independent Test**: `public/textures/` and `public/hero/` contain zero files; the 5
boilerplate SVGs no longer exist in `public/`; `public/categories/` still contains exactly
3 `.webp` files plus its `README.md`, unchanged from before this story.

### Implementation for User Story 3

- [ ] T014 [P] [US3] Delete all 8 files under `public/textures/*.webp` and
      `public/textures/README.md`.
- [ ] T015 [P] [US3] Delete all 3 files under `public/hero/*.webp` and
      `public/hero/README.md`.
- [ ] T016 [P] [US3] Delete `public/file.svg`, `public/globe.svg`, `public/next.svg`,
      `public/vercel.svg`, `public/window.svg`.
- [ ] T017 [US3] Confirm `public/categories/*.webp` (3 files) and
      `public/categories/README.md` are untouched, and re-confirm the template-built
      reference at `src/components/sections/ProductCategoriesSection.tsx:134` still reads
      `` src={`/categories/${category.slug}.webp`} `` — this is the check that prevents
      the near-miss described in `plan.md`'s Risks section from becoming an actual
      deletion.
- [ ] T018 [US3] Run the Independent Test and record the result: zero files in
      `public/textures/` and `public/hero/`, zero of the 5 boilerplate SVGs remaining, and
      exactly 3 files plus `README.md` still present in `public/categories/`.

**Checkpoint**: Unreferenced asset removal is complete; the retained category assets are
verified present, not merely assumed safe.

---

## Phase 6: User Story 4 - Dead Tailwind keyframes removal (Priority: P3)

**Goal**: `aurora` and `gradientShift` (keyframes + animation entries) and the `shimmer`
keyframe are deleted from `tailwind.config.ts:110-132`; `float`, `fadeUp`, `fadeIn`, and
`gradientSweep` and their animation entries are untouched.

**Independent Test**: `grep -rE "animate-aurora|animate-gradient-shift|animate-shimmer|
aurora:|gradientShift:|shimmer:" tailwind.config.ts` returns zero results.

### Implementation for User Story 4

- [ ] T019 [US4] Delete the `aurora` and `gradientShift` keyframes and their corresponding
      `animation` entries (`aurora: 'aurora 60s linear infinite'`,
      `'gradient-shift': 'gradientShift 3s ease infinite'`), and the `shimmer` keyframe
      (which has no `animation` entry to delete alongside it), from
      `tailwind.config.ts:110-132` — leave `float`, `fadeUp`, `fadeIn`, `gradientSweep`,
      and their animation entries untouched.
- [ ] T020 [US4] Run the Independent Test grep and record the zero-match result.

**Checkpoint**: Dead keyframe removal is complete; no live animation was touched.

---

## Phase 7: User Story 5 - Dead CSS component classes removal (Priority: P3)

**Goal**: `.card-hover`, `.card-hover-category`, and `.card-hover-feature` are deleted from
`src/app/globals.css`'s `@layer components` block.

**Independent Test**: `grep -n "card-hover" src/app/globals.css` returns zero results.

### Implementation for User Story 5

- [ ] T021 [US5] Delete the `.card-hover`, `.card-hover-category`, and
      `.card-hover-feature` rule blocks at `src/app/globals.css:58-80`, in full — including
      the `@layer components { ... }` wrapper if these three classes are its only content
      after deletion.
- [ ] T022 [US5] Run the Independent Test grep and record the zero-match result.

**Checkpoint**: Dead CSS removal is complete.

---

## Phase 8: User Story 6 - Broken `next/image` test mock fix (Priority: P3)

**Goal**: The global `next/image` mock at `src/__tests__/setup.ts:26-30` returns a
renderable element instead of a raw props object, with no change to any test's outcome.

**Independent Test**: The full unit suite (gate 4) reports the same `Tests N passed (N)`
count before and after this story's edit; all four existing local `next/image` mock
overrides remain present and unchanged, not deduplicated.

### Implementation for User Story 6

- [ ] T023 [US6] Fix the `next/image` mock at `src/__tests__/setup.ts:26-30` to return a
      renderable element (for example an `<img>` built from the forwarded props) instead
      of the raw props object the current `(props) => { return props; }` returns.
- [ ] T024 [US6] Run `pnpm test` before and after T023 and compare the literal passed-test
      count — per `plan.md`'s Risk note, this is the same "believed inert, verify anyway"
      discipline gate 10 exists for, applied here at the unit-test level.
- [ ] T025 [US6] Confirm the four existing local `next/image` mock overrides (identified in
      `spec.md`) are unchanged — this story does not deduplicate them.

**Checkpoint**: The test-mock fix is in place and proven inert against the current suite.

---

## Phase 9: User Story 7 - Orphan visual-regression snapshot removal (Priority: P4)

**Goal**: The three orphan `-mobile-win32.png` snapshots are deleted; the five active
`-chromium-win32.png` baselines are untouched.

**Independent Test**: The three named files no longer exist under
`e2e/visual-regression.spec.ts-snapshots/`; gate 7 still passes using only the five
`-chromium-win32.png` baselines.

### Implementation for User Story 7

- [ ] T026 [US7] Delete `hero-mobile-mobile-win32.png`,
      `products-mobile-mobile-win32.png`, and `products-page-desktop-mobile-win32.png`
      from `e2e/visual-regression.spec.ts-snapshots/`.
- [ ] T027 [US7] Confirm the five `-chromium-win32.png` baselines are unchanged and
      present.

**Checkpoint**: Orphan snapshot removal is complete; all seven user stories' checkpoints
now hold simultaneously.

---

## Phase 10: Gates and Handoff

**Purpose**: Prove the change is correct by the repo's actual authority — the ten quality
gates — and close out the pipeline per `agentic-workflow.instructions.md`.

- [ ] T028 Gate 1 — `pnpm format:check`, zero diffs, output pasted verbatim.
- [ ] T029 Gate 2 — `pnpm lint`, zero errors, output pasted verbatim.
- [ ] T030 Gate 3 — `pnpm exec tsc --noEmit`, zero errors, output pasted verbatim — this is
      where a wrong-order deletion in User Story 2 (T010 before T011) would surface, if it
      had happened.
- [ ] T031 Gate 4 — `pnpm test`, all passing, output pasted verbatim; cross-check against
      T024's before/after count from User Story 6.
- [ ] T032 Gate 5 — `pnpm test:coverage`, ≥90% project-wide on all four metrics, output
      pasted verbatim; this is the number that resolves the coverage-arithmetic risk
      `plan.md` flags for User Story 2 — do not assume its direction, read it.
- [ ] T033 Gate 6 — `pnpm build`; compare its stripped-ANSI warning count against the
      recorded zero-warning baseline in `.github/instructions/quality-gates.instructions.md`
      (`next@16.3.5`, 2026-09-24); any non-zero count is new and owned by this feature.
- [ ] T034 Gate 7 — confirm port 3000 is free, then `pnpm test:e2e`, all passing, output
      pasted verbatim; confirm the `[WebServer] $ next build` marker appears exactly once;
      confirm the three US7 deletions did not remove a baseline any remaining test still
      needs.
- [ ] T035 Gate 8 — `pnpm audit --prod --audit-level=high`, exits 0, output pasted
      verbatim.
- [ ] T036 Gate 9 — measure gzipped `.next/static` per the command in
      `quality-gates.instructions.md`; record the new total and delta against the
      recorded baseline in that file, in the same commit as the change — direction is not
      assumed, per `plan.md`'s Risks section.
- [ ] T037 Gate 10 — `pnpm exec playwright test e2e/loading-screen.spec.ts`; server HTML
      contains the page's `<h1>` and its links, output pasted verbatim.
- [ ] T038 Commit the change in Conventional Commits format (e.g.
      `chore(cleanup): close design-debt backlog deferred by 001`), staged file-by-file,
      on the current feature branch — never `git add -A`, never onto `master`/`develop`
      directly.
- [ ] T039 Hand off durable facts to a `memory-updater` stage: the new gate 9 bundle
      baseline, the gate 6 warning-count re-confirmation, the coverage delta measured in
      T032 (and which direction it moved), and the retained-`public/categories/` near-miss
      as a generalisable audit lesson.

**Checkpoint**: All ten gates green with verbatim output, change committed locally.
Pushing remains the human's call (`permissions.ask`, `git push` only).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Explicitly not applicable — does not block anything.
- **User Stories (Phases 3–9)**: All may start after Setup — the seven stories touch
  disjoint files with one internal ordering constraint (US2's T010→T011) and no
  cross-story file collisions.
- **Gates and Handoff (Phase 10)**: Depends on all seven user stories being complete — run
  once for the whole feature, per this repo's batching rule ("group cohesive work into a
  single stage, review once at the end"), same precedent as `001`.

### Within Each User Story

- T004–T006 (US1) touch three different files and are parallel except T006, which bundles
  four edits in one file.
- T009 (US2) is independent of T010→T011 (US2's same-story ordering constraint) and of
  T012 (the `AGENTS.md` edit) — all three may run in parallel with each other.
- T014–T016 (US3) touch three disjoint asset directories and are parallel.
- Each story's verification task (T008, T013, T018, T020, T022, T025, T027) runs after
  that story's edits are complete.

### Parallel Opportunities

- T004, T005 can run in parallel with each other and with T009, T012, T014, T015, T016,
  T019, T021, T023 — all are disjoint files across different stories.
- T010 must complete before T011 (same story, ordering constraint) — not parallel with
  each other, but the pair is parallel with every other story's tasks.
- US4 (T019–T020), US5 (T021–T022), US6 (T023–T025), and US7 (T026–T027) are each fully
  independent of every other story, since none shares a file with any other.

---

## Parallel Example: Across Stories

```bash
# Disjoint files across five different stories, safe to hand to parallel implementer
# stages or do in one batch:
Task: "Replace bg-surface-muted at src/app/products/loading.tsx:3"                 # US1
Task: "Delete PinContainer.tsx + its test"                                          # US2
Task: "Delete public/textures/*.webp + README.md"                                   # US3
Task: "Delete aurora/gradientShift/shimmer from tailwind.config.ts"                  # US4
Task: "Delete .card-hover* from globals.css"                                         # US5
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Skip Phase 2 (not applicable).
3. Complete Phase 3: User Story 1 — the one story with a real rendering and accessibility
   consequence.
4. **STOP and VALIDATE**: run the US1 grep independent test and eyeball the contrast fix
   at `products/[slug]/page.tsx:111,117` — do not run the full gate suite yet, since the
   remaining six stories will touch more files before the single end-of-feature gate pass.

### Incremental Delivery

Per this repo's workflow and `001`'s precedent, all seven stories are cohesive enough to
batch into a single implementer stage followed by a single reviewer pass (Phase 10) — they
are dead-code/dead-asset/token-migration findings from the same three audits, not
independent enough in risk profile to warrant seven separate review rounds. The MVP-first
sequencing above is for validation checkpoints during implementation, not for seven
separate ship/review cycles.

---

## Notes

- [P] tasks touch different files with no dependencies on each other.
- T010→T011 is the only ordering constraint in this feature; every other pair of tasks is
  safe to parallelize.
- T017 (confirm `public/categories/` untouched) is not optional busywork — it is the check
  that turns the near-miss described in `plan.md`'s Risks section from a hoped-for outcome
  into a verified one.
- Re-verify every file:line in T002 before editing — the spec's occurrences were correct
  when the three audits ran, but the codebase may have moved since.
- Stop at each story's checkpoint to confirm its independent test before moving to the
  next.
