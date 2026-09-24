# Feature Specification: Test Determinism and Accessibility Scanning

**Feature Branch**: `003-test-determinism-and-a11y`

**Created**: 2026-09-24

**Status**: Draft

**Input**: User description: "Close the two items `002-design-debt-cleanup` explicitly
deferred: the loose, non-deterministic `maxDiffPixelRatio: 0.05` tolerance on four of six
`e2e/visual-regression.spec.ts` snapshots that let an entire header redesign hide under a
passing gate, and the total absence of an `@axe-core/playwright` accessibility scan."

## User Scenarios & Testing *(mandatory)*

The "users" of this feature are the people who rely on the visual-regression suite to catch
a real styling regression, and the people who rely on gate 7 to say something meaningful
about accessibility conformance rather than nothing at all. Neither user group is served
today: four of six visual-regression snapshots run with no determinism scaffolding at a
tolerance loose enough to hide a full redesign, and no gate anywhere in this repo runs an
automated accessibility check. Every story here restores a guarantee the test suite already
implies it provides but currently does not.

### User Story 1 - Invisible border fix (Priority: P1)

A reviewer inspecting the specs-table box on a product detail page sees a real, visible
border distinguishing it from its `grey-100` fill, rather than a border rendering at 1.00:1
contrast against an identical fill colour.

**Why this priority**: This is the one story in this feature with a real rendering
consequence, and it is a hard prerequisite for User Story 3 — a baseline regenerated before
this fix bakes the invisible border in as "correct," and regenerating twice wastes a review
cycle. Sequenced first for the same reason User Story 1 was first in `002`: it is the one
change that needs a human eye, and doing it first leaves the largest review window.

**Independent Test**: `grep -n "border-grey-100" src/app/products/[slug]/page.tsx` returns
zero results for the specs-table box; `border-grey-200` appears at that call site instead.

**Acceptance Scenarios**:

1. **Given** `src/app/products/[slug]/page.tsx:110` currently reads `bg-grey-100 p-5 mb-8
   border border-grey-100` — identical fill and border, rendering at 1.00:1 — **When** the
   border class is corrected, **Then** it reads `border-grey-200` (`#D4D4D0`, 1.38:1 against
   the `grey-100` fill), matching the sibling cards' border treatment at `:99` and `:125`.
2. **Given** this fix changes pixels inside the region `about-desktop` and
   `product-detail-mobile` screenshot, **When** any snapshot baseline is regenerated later
   in this feature, **Then** this fix has already landed — a baseline regenerated before it
   would need regenerating again.

---

### User Story 2 - Determinism scaffolding for the four unscaffolded snapshots (Priority: P1)

A contributor reading `e2e/visual-regression.spec.ts` finds all six `toHaveScreenshot`
assertions protected the same way the two hero shots already are: motion disabled via
`contextOptions: { reducedMotion: 'reduce' }`, and a condition-based wait on the settled
state in place of `networkidle` alone. Today only `hero section` (`:60-86`) and `hero
section mobile` (`:146-168`) carry this; `about section` (`:88-119`), `products catalogue
page` (`:121-129`), `products page mobile` (`:170-178`), and `product detail page mobile`
(`:180-188`) do not.

**Why this priority**: This is the load-bearing prerequisite for both User Story 3
(regeneration) and User Story 4 (tolerance tightening) — tightening tolerance on an
unscaffolded spec trades a proven false-green for a new false-red, and regenerating a
baseline from a racy capture bakes the race into the file that is then treated as truth.
Sequenced immediately after User Story 1 because both must land before any snapshot file
changes.

**Independent Test**: See SC-002 and SC-003 for the verified grep counts and why this story's
scaffolding does not produce one occurrence per test. (Corrected 2026-09-24: this line
originally assumed one `reducedMotion: 'reduce'` nesting per previously-unscaffolded test —
`4` new occurrences — and zero `waitForTimeout` hits. The implementation instead scopes
`reducedMotion` once per `test.describe` block, and `waitForTimeout` appears twice as comment
prose, never as a call. SC-002 and SC-003 carry the authoritative counts and evidence; this
story's requirement — all six tests inheriting the scaffolding — still holds.)

**Acceptance Scenarios**:

1. **Given** `about section`, `products catalogue page`, `products page mobile`, and
   `product detail page mobile` currently run under default motion with only
   `page.waitForLoadState('networkidle')`, **When** scaffolding is added, **Then** each is
   nested under (or given) a `test.use({ contextOptions: { reducedMotion: 'reduce' } })`
   matching the pattern already present on `hero section` (`:61`) and `hero section mobile`
   (`:147`).
2. **Given** `reducedMotion` disables CSS animation but does not freeze `setTimeout`-driven
   JS state — the root cause already diagnosed for the hero shots, where `useTypewriter`'s
   40ms/char typing outlived a fixed wait — **When** scaffolding is added to the four
   remaining specs, **Then** each gets a web-first assertion on its own settled condition
   (an element becoming visible, a heading containing its final text, or an equivalent
   condition-based wait), never a `waitForTimeout`.
3. **Given** `about section` already has `waitForScrollToSettle` (`:29-48`) to solve a
   different, already-fixed timing bug (header compositing into a stitched screenshot at an
   unsettled scroll offset), **When** `reducedMotion` scaffolding is added to it, **Then**
   the existing scroll-settling wait is left in place — the two fixes solve different races
   and neither substitutes for the other.

---

### User Story 3 - Baseline regeneration with mandatory visual inspection (Priority: P1)

A contributor regenerating any of the six visual-regression baselines does not treat a
`0` exit code from `--update-snapshots` as proof the new baseline is correct. Each
regenerated image is opened and compared against a named acceptance description before it is
accepted.

**Why this priority**: A snapshot is truth once written — every future run of this spec
compares against whatever is committed here, correct or not. This is precisely how
`about-desktop-chromium-win32.png` drifted an entire SEALED header redesign out of date
while returning green: `--update-snapshots` presets to `changed`, which rewrites only
failing comparisons, so a design change small enough to stay under 5% tolerance passes and
rewrites nothing. Sequenced after User Stories 1 and 2 because it must capture their
combined effect, and before User Story 4 because tightened tolerance needs a baseline
captured under the new scaffolding, not the old race.

**Independent Test**: All six snapshot files under
`e2e/visual-regression.spec.ts-snapshots/` are regenerated in one pass, each is visually
opened before acceptance, and the `about-desktop` result specifically matches the acceptance
description below rather than being accepted on exit-code alone.

**Acceptance Scenarios**:

1. **Given** User Stories 1 and 2 are complete, **When** all six baselines are regenerated
   with `--update-snapshots=all` (not the default `changed` preset, which rewrites only
   failing comparisons and would leave most of these six untouched), **Then** every one of
   the six files under `e2e/visual-regression.spec.ts-snapshots/` is rewritten.
2. **Given** the regenerated `about-desktop-chromium-win32.png`, **When** it is visually
   inspected, **Then** it shows the SEALED flat-paper header with a square ink button (not
   the pre-SEALED navy pill header with a blue rounded "Get a Quote"), the `51+`/`3`/`100%`/
   `HYD` stats that `STATS` in `AboutSection.tsx:27-32` actually defines, no `AboutSection`
   text caught mid-animation, and square corners with hairline borders throughout the
   captured region. (Corrected 2026-09-24: `44+`/`86%` never existed in the source — see the
   note under FR-007.)
3. **Given** the regenerated `hero-desktop`, `hero-mobile`, `products-page-desktop`,
   `products-mobile`, and `product-detail-mobile` baselines, **When** each is visually
   inspected, **Then** none shows a mid-animation frame, a layout break, or content that
   contradicts the current site — the same standard of scrutiny applied to `about-desktop`,
   not a lower one because the other five were not known to be stale.
4. **Given** a regenerated baseline fails this visual inspection, **When** that happens,
   **Then** it is not accepted as-is — the underlying scaffolding or wait condition is fixed
   and the baseline is regenerated again, exactly as User Story 2 intends.

---

### User Story 4 - Tolerance tightening (Priority: P2)

A contributor reading `e2e/visual-regression.spec.ts` finds every `toHaveScreenshot` call
tightened below `0.05` — a tolerance tight enough that a real design change of the size that
hid under the old value would now fail the gate. (Corrected 2026-09-24: this originally said
all six land at a single `0.02`. The implementation split by shot type instead — see SC-005
for the verified per-site values, which are tighter than this requirement everywhere they
differ from it, not looser.)

**Why this priority**: This is the story that actually closes the defect this feature exists
to fix, but it is the one story in this feature that is unsafe to do first. 5% of a
1280×800 frame is 51,200 px and of 375×812 is ~15,225 px — tolerance this loose is what let
a header redesign hide. But tightening a loose tolerance on a still-racy spec trades a
proven false-green for a new false-red; only User Stories 2 and 3 make the tight end safe.

**Independent Test**: See SC-005 for the verified per-site `maxDiffPixelRatio` counts; two
consecutive full runs of `pnpm exec playwright test e2e/visual-regression.spec.ts` (no
`--update-snapshots`) both report all six passing.

**Acceptance Scenarios**:

1. **Given** User Stories 1–3 are complete, **When** each `maxDiffPixelRatio: 0.05` is
   tightened, **Then** all six call sites are changed — none is left at `0.05`. (Corrected
   2026-09-24: this originally required every site land at `0.02`; the implementation split
   `0.02` on the two element-locator shots and `0.01` on the four fixed-viewport shots — see
   SC-005. Do not flatten these back to a single value to match the old wording.)
2. **Given** the tightened tolerance, **When** the spec is run twice in immediate succession
   with no code change between runs, **Then** both runs report all six snapshots passing —
   demonstrating the scaffolding removed the non-determinism rather than the tolerance
   change merely getting lucky once.

---

### User Story 5 - Accessibility scanning with `@axe-core/playwright` (Priority: P2)

A contributor running the e2e suite gets an automated signal on WCAG conformance for the
first time in this repo's history, rather than relying entirely on the by-hand contrast
checks recorded in `.github/instructions/quality-gates.instructions.md` and in this repo's
memory graph.

**Why this priority**: Independent of Part A — it touches no file User Stories 1–4 touch —
so it carries no ordering constraint with them and may run in parallel. Prioritised behind
the visual-regression work only because it is new capability rather than a fix to an
existing false-green, matching the same reasoning `002` used to defer it in the first place.

**Independent Test**: `@axe-core/playwright` appears in `package.json`'s dependency block; a
new Playwright spec exists that runs an axe scan and asserts on its results; running that
spec produces either zero violations or a set of violations each explicitly recorded as an
escalated finding, never a suppressed rule.

**Acceptance Scenarios**:

1. **Given** `@axe-core/playwright` is absent from both dependency blocks in `package.json`
   today, **When** it is added, **Then** it is added as a dev dependency, consistent with
   `@playwright/test`'s existing placement — it is a test-time tool, not a runtime one, and
   must not enter the production bundle gate 9 measures.
2. **Given** a new accessibility e2e spec scanning at least the routes already exercised by
   `e2e/visual-regression.spec.ts` (`/`, `/products`, a product detail page), **When** it
   runs, **Then** it asserts zero violations at the standard WCAG 2 A/AA rule set, verified
   against the installed `@axe-core/playwright` API rather than assumed from memory (per
   this repo's standing rule to verify library APIs before writing code against them).
3. **Given** a scan surfaces a real violation — the SEALED ramp's `grey-500` on `grey-50` at
   4.92:1 is a plausible near-threshold candidate, per the constitution's own note that nothing
   mechanical in this repo currently verifies contrast — **When** that happens, **Then** the
   violation is either fixed in the same change or explicitly recorded as an escalated
   finding requiring a design decision. Suppressing or disabling the rule to reach zero
   violations is not an acceptable resolution under any circumstance.

---

### Edge Cases

- What happens if a regenerated baseline for one of the four newly-scaffolded specs looks
  meaningfully different from its old, unscaffolded self — not because of a real design
  change, but because reduced motion legitimately changes what is on screen at capture time
  (a settled headline instead of a mid-type frame, a settled scroll position instead of a
  racy one)? This is expected and is why baseline regeneration (User Story 3) is sequenced
  as its own step between scaffolding (User Story 2) and tightening (User Story 4), rather
  than assumed to be a no-op.
- What happens if the axe scan cannot reach zero violations without a colour or markup
  change this feature did not anticipate? It is recorded as an escalated finding per User
  Story 5's Acceptance Scenario 3 — not silently patched, and not suppressed to force green.
- What happens if a story in this feature is done out of the stated order (for example,
  tolerance tightened before scaffolding lands)? This is the two-sided risk this feature
  exists to avoid: too loose a tolerance hides real drift, too tight a tolerance on a racy
  spec manufactures false reds, and only completing User Stories 1–3 first makes the tight
  end of User Story 4 safe. Out-of-order execution is not a variant to be tolerated; it is a
  defect in following this spec.
- What happens to the other deferred items from `002` not named here — the `feedback.error`
  token consistency gap, the `text-display-2` token, the WebGL hero wave? They remain out of
  scope; this feature closes only the two items named in its Input above.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST replace `border-grey-100` with `border-grey-200` in the
  specs-table box at `src/app/products/[slug]/page.tsx:110`, and this change MUST land
  before any snapshot baseline in this feature is regenerated.
- **FR-002**: The system MUST extend `test.use({ contextOptions: { reducedMotion: 'reduce'
  } })` to the `about section`, `products catalogue page`, `products page mobile`, and
  `product detail page mobile` tests in `e2e/visual-regression.spec.ts`, matching the
  scaffolding already present on `hero section` and `hero section mobile`.
- **FR-003**: For each test named in FR-002, the system MUST add a condition-based
  ("web-first") assertion on that test's own settled state before its screenshot call, in
  place of relying on `page.waitForLoadState('networkidle')` alone. The spec file MUST
  contain zero `waitForTimeout` **call sites** after this feature — comments that mention the
  method name in prose (a header warning, a historical-defect note) are not call sites and
  are exempt; see SC-003.
- **FR-004**: `about section`'s existing `waitForScrollToSettle` scroll-stability wait
  (`:29-48`) MUST remain in place — FR-002 and FR-003 add scaffolding to this test, they do
  not remove or replace what already fixes a different, already-diagnosed race.
- **FR-005**: All six snapshot baselines (`hero-desktop`, `hero-mobile`, `about-desktop`,
  `products-page-desktop`, `products-mobile`, `product-detail-mobile`) MUST be regenerated
  with `--update-snapshots=all` — not the default `changed` preset, which rewrites only
  comparisons that fail and would leave most of these six files untouched — and MUST NOT be
  regenerated until FR-001 through FR-004 are complete.
- **FR-006**: Every regenerated baseline MUST be visually inspected before acceptance; a
  `0` exit code from the regeneration run is not sufficient acceptance evidence on its own.
- **FR-007**: The regenerated `about-desktop` baseline specifically MUST show the SEALED
  flat-paper header with a square ink button, the `STATS` values `AboutSection.tsx:27-32`
  actually defines (`51+`, `3`, `100%`, `HYD`), no text caught mid-animation, and square
  corners with hairline borders — not the pre-SEALED navy pill header or blue rounded button
  it shows today.

  **Corrected 2026-09-24**: an earlier revision of this requirement demanded stat values
  `44+`/`86%` and named `51+`/`100%` as stale content drift. That was backwards.
  `AboutSection.tsx:27-32` has always defined `STATS` as `51+`/`3`/`100%`/`HYD` — `44+`/`86%`
  never existed in the source — and `ABOUT_STATS` in `e2e/visual-regression.spec.ts:31`
  already mirrors the real values correctly. The old baseline's only genuine staleness was
  its header chrome (navy pill header, blue rounded "Get a Quote" → the SEALED flat-paper
  header with a square black button), which this feature's regeneration fixed. **Do not
  revert the stat values to chase the earlier wording** — the implementation matching the
  source is correct.
- **FR-008**: `maxDiffPixelRatio` MUST be tightened below `0.05` at every `toHaveScreenshot`
  call site in `e2e/visual-regression.spec.ts`, and this change MUST NOT be made until FR-001
  through FR-007 are complete.

  **Corrected 2026-09-24**: this requirement originally demanded a single uniform `0.02` at
  all six sites. The implementation split by shot type instead — `0.02` on the two
  element-locator shots (`hero-desktop`, `about-desktop`, which capture content-driven height
  rather than a fixed viewport) and `0.01` on the four fixed-viewport shots
  (`products-page-desktop`, `hero-mobile`, `products-mobile`, `product-detail-mobile`) — see
  SC-005 for the verified per-site values. This is tighter than the original requirement
  everywhere it differs, not looser. Do not flatten it back to a uniform `0.02` to match the
  old wording.
- **FR-009**: Two consecutive full runs of `e2e/visual-regression.spec.ts` (no
  `--update-snapshots`) MUST both pass, at the tightened tolerance, with no intervening code
  change — demonstrating determinism rather than a single lucky pass.
- **FR-010**: `@axe-core/playwright` MUST be added to `package.json` as a dev dependency.
- **FR-011**: A new Playwright e2e spec MUST run an automated accessibility scan using
  `@axe-core/playwright` against, at minimum, the routes already exercised by
  `e2e/visual-regression.spec.ts` (`/`, `/products`, a product detail route), and MUST
  assert on the scan's results rather than merely executing it.
- **FR-012**: Any violation the scan in FR-011 surfaces MUST be either fixed in the same
  change or explicitly recorded as an escalated finding requiring a design decision.
  Suppressing, disabling, or excluding a rule solely to reach zero reported violations is
  NOT an acceptable resolution under this feature.
- **FR-013**: All ten quality gates defined in
  `.github/instructions/quality-gates.instructions.md` MUST pass, with literal command
  output present in the implementation transcript. Gates 8 and 9 are explicitly in scope
  for this feature because it adds a new dependency — per that file's applicability table,
  a `package.json`/`pnpm-lock.yaml` change can move all ten gates, "8 and 9 especially."
- **FR-014**: Project-wide test coverage MUST remain **≥90%** across statements, branches,
  functions, and lines after this feature's changes, measured rather than assumed.

*No requirement in this feature needed a `[NEEDS CLARIFICATION]` marker for the visual-
regression stories (User Stories 1–4) — every occurrence is located and verified by
file:line in this document. User Story 5's exact axe rule-tag set and exact scanned-route
list are recorded as open questions in Assumptions below, since they depend on the installed
`@axe-core/playwright` API and are properly a plan/implementation decision, not a spec-level
fact this document can verify without reading that package.*

### Key Entities

Not applicable — this feature adds test scaffolding, tightens an existing tolerance,
corrects one CSS class, and adds one new accessibility test spec. There is no new or changed
data model, persisted entity, or schema.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: `grep -n "border-grey-100" src/app/products/[slug]/page.tsx` no longer matches
  the specs-table box; `border-grey-200` appears there instead.

  **Note added 2026-09-24**: this grep is not self-certifying on exit code or match count
  alone — it still returns one match after the fix, an unrelated decorative hairline at
  `src/app/products/[slug]/page.tsx:56` (`bg-paper border-b border-grey-100`, the page
  header's bottom border), not the specs-table box at `:110`. A verifier who reads only "1
  match" will misread this as a failure. Confirm the match is at `:56`, not `:110` — or use a
  pattern anchored on the box's other classes, e.g.
  `grep -n "bg-grey-100 p-5 mb-8" src/app/products/[slug]/page.tsx`.
- **SC-002**: `grep -c "reducedMotion: 'reduce'" e2e/visual-regression.spec.ts` returns `3`,
  not `6`.

  **Corrected 2026-09-24**: the original criterion assumed one `test.use({ contextOptions: {
  reducedMotion: 'reduce' } } })` nesting per test (six total). The implementation instead
  scopes it once per `test.describe` block — `:134` for the desktop block, `:225` for the
  mobile block — plus one mention inside a doc comment (`:68`): three string occurrences that
  cover all six tests, not six. The real evidence that every test inherits the scaffolding is
  not this grep count but the `expectReducedMotion(page)` precondition helper (`:125-129`),
  which all six tests call and which fails loudly if the scaffolding is ever lost. Verify that
  assertion passes in all six tests, not the raw grep count.
- **SC-003**: `grep -c "waitForTimeout" e2e/visual-regression.spec.ts` returns `2`, not `0`.

  **Corrected 2026-09-24**: both hits are comment prose, not call sites — a header warning at
  `:16` ("Never add a `waitForTimeout` here") and a historical-defect note at `:230`
  describing the exact race this feature fixed. Both are deliberate and stay; the correct
  criterion is zero *call sites*. Verify with
  `grep -nE '(await|page)\s*\.?\s*waitForTimeout\s*\(' e2e/visual-regression.spec.ts`, which
  exits 1 (no match) on this file — that pattern is what distinguishes an actual call from a
  comment that only mentions the method name.
- **SC-004**: All six files under `e2e/visual-regression.spec.ts-snapshots/` have been
  regenerated after FR-001 through FR-004 land, and each has been visually confirmed against
  its acceptance description — `about-desktop` specifically confirmed to show the SEALED flat
  header and the `51+`/`3`/`100%`/`HYD` stats `AboutSection.tsx:27-32` actually defines, not
  the pre-SEALED navy pill header.

  (Corrected 2026-09-24 — see the note under FR-007: the `44+`/`86%` figures this criterion
  originally named never existed in the source and were never stale content to replace.)
- **SC-005**: `maxDiffPixelRatio: 0.02` × **2** (the two element-locator shots,
  `hero-desktop` at `:156` and `about-desktop` at `:198`); `maxDiffPixelRatio: 0.01` × **4**
  (the four fixed-viewport shots — `products-page-desktop` at `:216`, `hero-mobile` at
  `:248`, `products-mobile` at `:264`, `product-detail-mobile` at `:282`);
  `maxDiffPixelRatio: 0.05` × **0**.

  **Corrected 2026-09-24**: the original criterion assumed a single uniform `0.02` at all six
  call sites (`grep -c "maxDiffPixelRatio: 0.02"` returning `6`). The implementation went
  tighter and split by shot type instead — `grep -c "maxDiffPixelRatio: 0.02"` now correctly
  returns `2`, and `grep -c "maxDiffPixelRatio: 0.01"` returns `4`; `0.05` still correctly
  returns `0`. This exceeds the original requirement, not merely satisfies it.
- **SC-006**: Two consecutive runs of `pnpm exec playwright test
  e2e/visual-regression.spec.ts` (no `--update-snapshots`) both report all six tests
  passing.
- **SC-007**: `package.json` lists `@axe-core/playwright` as a dev dependency; a new e2e
  accessibility spec exists and its run is reported (zero violations, or every violation
  named as an explicit escalated finding — never a suppressed rule).
- **SC-008**: All ten quality gates report green with verbatim output captured in the
  implementation transcript, and project-wide coverage is ≥90% on all four metrics.

### Resolved Outcomes

Recorded 2026-09-24, after implementation reached VERDICT: GREEN on all ten quality gates.

- `@axe-core/playwright@4.13.0` added to `package.json` as a devDependency (MPL-2.0). It is
  dev-only, verified absent from `.next/static`; gate 9 moved only +9 B, attributable to a
  class-string change rather than a new runtime import.
- `e2e/accessibility.spec.ts` scans `/`, `/products`, and `/products/surgeon-cap` at WCAG
  2.0/2.1 A + AA, on both the `chromium` and `mobile` Playwright projects — 6 tests total.
- One violation was **fixed**: axe `nested-interactive` (WCAG 2.1 A, 4.1.2) —
  `HeroSection.tsx`'s `sr-only` product nav was a child of the `role="button"` graph wrapper
  with 50 focusable descendants; it is now a sibling carrying `sr-only hidden md:block`. Tab
  order is unchanged.
- Three violations were **escalated to the owner, not fixed** — all WCAG 1.4.3 AA, all on
  `aria-hidden="true"` decorative numerals and specimen codes, independently re-measured
  against the bespoke warm ramp at `tailwind.config.ts:34-45`: grey-300 `#B0B0AA` on paper
  `#FAFAF8` = **2.085:1**; grey-400 `#8A8A83` on paper = **3.324:1**; grey-500 `#6B6B64` on
  ink `#0A0B0D` = **3.66:1**; all need 4.5:1. `aria-hidden` removes them from assistive tech
  but does **not** discharge 1.4.3 — they remain fully visible to low-vision sighted users.
  Picking replacement values is a design decision reserved to the owner, per FR-012's
  no-suppression rule.
- `CounterStat.tsx` was the last animated component in the repo missing a
  `prefers-reduced-motion` guard; it now has one as the first statement in its effect,
  matching `AboutSection.tsx:46`.

## Assumptions

- The four file:line occurrences and the six `maxDiffPixelRatio` call sites cited in this
  spec reflect the state of `e2e/visual-regression.spec.ts` and
  `src/app/products/[slug]/page.tsx` as read during spec authoring; per this repo's standing
  practice, they must be re-confirmed immediately before each edit, since the codebase may
  move between spec authoring and implementation — and is expected to, since implementation
  of Part A runs in parallel with this document's authoring.
- The exact axe rule-tag set (`wcag2a`, `wcag2aa`, or a repo-specific subset) and the exact
  list of scanned routes beyond the three named in FR-011 are **open questions**, not fixed
  by this spec — they depend on the installed `@axe-core/playwright` API and are a plan- or
  implementation-level decision, verified against that package's own docs rather than
  assumed from memory.
- Extending `reducedMotion` scaffolding to `about section`, `products catalogue page`,
  `products page mobile`, and `product detail page mobile` is assumed to change what each
  baseline captures (per the Edge Cases entry above) but not to introduce a new race —
  each test's own settled-state assertion (FR-003) is what makes that assumption safe to
  rely on rather than merely hoped for.
- Whether the axe scan can reach zero violations without a further colour or markup change
  is not assumed either way — the SEALED ramp's `grey-500`-on-`grey-50` pairing at 4.92:1 is
  named as a plausible near-threshold candidate, not a predicted finding, and FR-012's
  no-suppression rule is what this feature relies on if a real violation does surface.
- No new visual-regression snapshot file, route, or component coverage is added by this
  feature — the scope is scaffolding, tolerance, one CSS class, and the new axe spec, not an
  expansion of what `e2e/visual-regression.spec.ts` currently photographs.
</content>
