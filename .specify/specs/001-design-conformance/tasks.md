---
description: "Task list for SEALED design-system conformance"
---

# Tasks: SEALED Design-System Conformance

**Input**: Design documents from `.specify/specs/001-design-conformance/`

**Prerequisites**: `plan.md` (required), `spec.md` (required for user stories)

**Tests**: No new unit tests are added — this feature swaps existing Tailwind class strings
on already-rendered elements; the existing unit, e2e, and coverage suites are the
regression net, and gate 10 (SSR/no-JS) plus the grep-based acceptance checks from
`spec.md` are the feature-specific verification. This follows the template's "tests are
optional" rule: none were requested in the spec beyond the grep/gate checks already
specified.

**Organization**: Tasks are grouped by user story (radius → shadow → gradient), matching
`spec.md`'s priority order. Two files (`ProductViewer.tsx`, `CounterStat.tsx`) appear in
both US1 and US2 because they each carry one radius violation and one shadow violation on
overlapping lines — those tasks are cross-referenced rather than treated as independent, to
avoid two agents editing the same line in parallel.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 = square-corner conformance, US2 = elevation-token conformance, US3 =
  surface-gradient conformance
- All paths are relative to the repository root

## Phase 1: Setup

- [ ] T001 Confirm the working branch is not `master` or `develop`
      (`git rev-parse --abbrev-ref HEAD`) — per
      `.github/instructions/agentic-workflow.instructions.md`, create a feature/fix branch
      first if it is; otherwise proceed on the current branch.
- [ ] T002 Re-verify all 22 occurrences listed in `spec.md`'s Functional Requirements
      against the current state of each file — line numbers may have drifted since the
      spec was written.
- [ ] T003 [P] Confirm gates 1–5 are green on the current baseline before any edit, so a
      later failure can be attributed to this feature's changes rather than pre-existing
      state.

## Phase 2: Foundational

**Not applicable.** The three stories touch disjoint files (except the two
cross-referenced overlaps noted above, which are handled by sequencing, not by shared
infrastructure) and introduce no new token, component, or abstraction — there is nothing
that must exist before story work can begin.

## Phase 3: User Story 1 - Square-corner conformance (Priority: P1) 🎯 MVP

**Goal**: Zero graduated or arbitrary corner-radius classes remain in `src/`, with every
`rounded-full` occurrence untouched.

**Independent Test**: `grep -rE "rounded-(sm|md|lg|xl|2xl|3xl|\[)" src/` returns zero
matches; a separate `rounded-full` grep count is unchanged from before this story.

### Implementation for User Story 1

- [ ] T004 [P] [US1] Replace `rounded-xl` with a SEALED-conformant class at
      `src/app/products/[slug]/page.tsx:110,125,137,144`
- [ ] T005 [P] [US1] Replace `rounded-xl` with a SEALED-conformant class at
      `src/app/products/[slug]/error.tsx:24,30`
- [ ] T006 [P] [US1] Replace `rounded-xl` with a SEALED-conformant class at
      `src/app/products/error.tsx:23,29`
- [ ] T007 [P] [US1] Replace `rounded-xl` with a SEALED-conformant class at
      `src/app/not-found.tsx:16,22`
- [ ] T008 [P] [US1] Replace `rounded-2xl` with a SEALED-conformant class at
      `src/app/products/loading.tsx:23`
- [ ] T009 [P] [US1] Replace `rounded-[1.25rem]` with a SEALED-conformant class at
      `src/app/products/page.tsx:21`
- [ ] T010 [US1] Replace `rounded-[1.25rem]`, `rounded-2xl`, and `rounded-lg` at
      `src/components/ui/ProductViewer.tsx:22,26,44` — line 26 shares this file with T017
      (shadow migration); make both edits in one pass to avoid a second diff on the same
      line.
- [ ] T011 [US1] Replace `rounded-[14px]` at `src/components/ui/CounterStat.tsx:82` — this
      line also carries the arbitrary shadow fixed in T016; make both edits in one pass.
- [ ] T012 [US1] Run the Independent Test grep and record the zero-match result.

**Checkpoint**: Square-corner conformance is complete and independently verifiable.

---

## Phase 4: User Story 2 - Elevation-token conformance (Priority: P2)

**Goal**: Zero Tailwind-default or arbitrary shadow classes remain in `src/`; every
migrated shadow uses the `e0`–`e5` scale following `ProductCard.tsx:26`'s
rest/hover pattern.

**Independent Test**: `grep -rE "shadow-(lg|xl|2xl|\[)" src/` returns zero matches.

### Implementation for User Story 2

- [ ] T013 [P] [US2] Migrate `.card-hover:hover` (`src/app/globals.css:63`) off
      `shadow-xl` onto an `e`-scale token; decide and record the paired
      `-translate-y-*` distance (currently `-translate-y-1.5`) rather than carrying it
      over unexamined — see spec Assumptions.
- [ ] T014 [P] [US2] Migrate `.card-hover-category:hover` (`src/app/globals.css:71`) off
      `shadow-2xl` onto an `e`-scale token; same translate-y decision as T013, recorded
      independently since this class currently lifts further (`-translate-y-2`).
- [ ] T015 [P] [US2] Migrate `.card-hover-feature:hover` (`src/app/globals.css:79`) off
      `shadow-lg` onto an `e`-scale token; `-translate-y-1` and `bg-paper` are unaffected
      unless the token decision calls for revisiting them too.
- [ ] T016 [US2] Migrate the arbitrary `shadow-[0_2px_8px_rgba(10,11,13,0.06)]` at
      `src/components/ui/CounterStat.tsx:82` onto the nearest `e`-scale token — combine
      with T011 in one edit pass (same line).
- [ ] T017 [US2] Migrate the arbitrary `shadow-[0_8px_32px_rgba(10,11,13,0.12)]` at
      `src/components/ui/ProductViewer.tsx:26` onto the nearest `e`-scale token — combine
      with T010 in one edit pass (same line).
- [ ] T018 [US2] Run the Independent Test grep and record the zero-match result.

**Checkpoint**: Elevation-token conformance is complete and independently verifiable;
square corners (US1) still hold.

---

## Phase 5: User Story 3 - Surface-gradient conformance (Priority: P3)

**Goal**: The one remaining surface gradient is replaced with a solid SEALED surface, with
`cursor-spotlight` preserved.

**Independent Test**: `grep -r "bg-gradient-" src/` returns zero matches, and
`ContactSection.tsx` still renders `cursor-spotlight` and its mouse-move handler.

### Implementation for User Story 3

- [ ] T019 [US3] Replace `bg-gradient-to-br from-ink to-grey-900` with a solid SEALED
      surface class at `src/components/sections/ContactSection.tsx:84`, preserving
      `cursor-spotlight` and the `onMouseMove={handleMouseMove}` handler unchanged.
- [ ] T020 [US3] Run the Independent Test grep and confirm `cursor-spotlight` is still
      present.

**Checkpoint**: All three conformance groups are complete; `spec.md`'s SC-001 through
SC-003 all hold simultaneously.

---

## Phase 6: Gates, Snapshots, and Handoff

**Purpose**: Prove the change is correct by the repo's actual authority — the ten quality
gates — and close out the pipeline per `agentic-workflow.instructions.md`.

- [ ] T021 Gate 1 — `pnpm format:check`, zero diffs, output pasted verbatim.
- [ ] T022 Gate 2 — `pnpm lint`, zero errors, output pasted verbatim.
- [ ] T023 Gate 3 — `pnpm exec tsc --noEmit`, zero errors, output pasted verbatim.
- [ ] T024 Gate 4 — `pnpm test`, all passing, output pasted verbatim.
- [ ] T025 Gate 5 — `pnpm test:coverage`, ≥90% project-wide on all four metrics, output
      pasted verbatim.
- [ ] T026 Gate 6 — `pnpm build`; compare its stripped-ANSI warning count against the
      recorded zero-warning baseline in `.github/instructions/quality-gates.instructions.md`
      (`next@16.3.5`, 2026-09-24); any non-zero count is new and owned by this feature.
- [ ] T027 Confirm port 3000 is free, then regenerate the five expected
      visual-regression snapshots (`hero-desktop`, `hero-mobile`,
      `product-detail-mobile`, `products-mobile`, `products-page-desktop`) and visually
      review each diff before accepting — per spec SC-005, an un-reviewed snapshot is not
      an acceptable substitute for a reviewed one.
- [ ] T028 Gate 7 — `pnpm test:e2e`, all passing, output pasted verbatim; confirm the
      `[WebServer] $ next build` marker appears exactly once (FR-011).
- [ ] T029 Gate 8 — `pnpm audit --prod --audit-level=high`, exits 0, output pasted
      verbatim.
- [ ] T030 Gate 9 — measure gzipped `.next/static` per the command in
      `quality-gates.instructions.md`; record the new total and delta against the
      309.6 KB / 317082 B baseline in the same commit as the change, in that file.
- [ ] T031 Gate 10 — `pnpm exec playwright test e2e/loading-screen.spec.ts`; server HTML
      contains the page's `<h1>` and its links, output pasted verbatim.
- [ ] T032 Commit the change in Conventional Commits format (e.g.
      `refactor(sealed): close remaining corner-radius, shadow and gradient gaps`),
      staged file-by-file, on the current feature branch — never `git add -A`, never onto
      `master`/`develop` directly.
- [ ] T033 Hand off durable facts to a `memory-updater` stage: the new gate 9 bundle
      baseline, the gate 6 warning-count re-confirmation, and the `-translate-y-*`
      decisions recorded in T013–T015.

**Checkpoint**: All ten gates green with verbatim output, five snapshots reviewed and
accepted, change committed locally. Pushing remains the human's call
(`permissions.ask`, `git push` only).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Explicitly not applicable — does not block anything.
- **User Stories (Phases 3–5)**: All may start after Setup. US1 and US2 share two files
  (`ProductViewer.tsx`, `CounterStat.tsx`) at the exact lines noted in T010/T011/T016/T017
  — those four tasks are sequenced as same-file edit pairs, not run in parallel with each
  other. US3 is fully independent of US1 and US2.
- **Gates, Snapshots, and Handoff (Phase 6)**: Depends on all three user stories being
  complete — the gate suite and snapshot regeneration are a single pass over the whole
  feature, not per-story, since the reviewer runs gates 6–10 once at the end per this
  repo's batching rule ("group cohesive work into a single stage, review once at the
  end").

### Within Each User Story

- T004–T009 and T013–T015 are each independently parallel within their story (disjoint
  files).
- T010/T011 (radius) and T016/T017 (shadow) are same-file pairs — do the radius and
  shadow edit on each of those two files together, then verify.
- Each story's verification task (T012, T018, T020) runs after that story's edits are
  complete.

### Parallel Opportunities

- All of T004–T009 can run in parallel — six disjoint files, one violation each.
- T013–T015 can run in parallel — three disjoint rules inside one file
  (`globals.css`), touching different class blocks.
- US3 (T019–T020) can run in parallel with all of US1 and US2, since
  `ContactSection.tsx` is touched nowhere else in this feature.

---

## Parallel Example: User Story 1

```bash
# Six disjoint files, safe to hand to parallel implementer stages or do in one batch:
Task: "Replace rounded-xl at src/app/products/[slug]/page.tsx:110,125,137,144"
Task: "Replace rounded-xl at src/app/products/[slug]/error.tsx:24,30"
Task: "Replace rounded-xl at src/app/products/error.tsx:23,29"
Task: "Replace rounded-xl at src/app/not-found.tsx:16,22"
Task: "Replace rounded-2xl at src/app/products/loading.tsx:23"
Task: "Replace rounded-[1.25rem] at src/app/products/page.tsx:21"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Skip Phase 2 (not applicable).
3. Complete Phase 3: User Story 1.
4. **STOP and VALIDATE**: run the US1 grep independent test — do not run the full gate
   suite yet, since US2 and US3 will touch more files before the single end-of-feature
   gate pass (per this repo's batching rule, gates run once for the whole feature, not
   once per story).

### Incremental Delivery

Per this repo's workflow, all three stories are cohesive enough to batch into a single
implementer stage followed by a single reviewer pass (Phase 6) — they are not independent
enough in risk profile to warrant three separate review rounds for 22 total occurrences.
The MVP-first sequencing above is for validation checkpoints during implementation, not for
three separate ship/review cycles.

---

## Notes

- [P] tasks touch different files with no dependencies on each other.
- T010/T011/T016/T017 are the only same-file collisions in this feature; every other pair
  of tasks is safe to parallelize.
- This feature's "tests" are the grep-based independent tests named per story, plus the
  existing gate suite — no new `.test.tsx` file is anticipated, per `spec.md`'s
  requirements.
- Re-verify every file:line in T002 before editing — the spec's occurrences were correct
  when written but the codebase may have moved since.
- Stop at each story's checkpoint to confirm its grep result before moving to the next.
