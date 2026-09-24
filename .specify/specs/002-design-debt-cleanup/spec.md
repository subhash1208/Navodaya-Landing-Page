# Feature Specification: Design Debt Cleanup

**Feature Branch**: `002-design-debt-cleanup`

**Created**: 2026-09-24

**Status**: Draft

**Input**: User description: "Clear the cleanup backlog `001-design-conformance` explicitly
deferred: dead Tailwind keyframes, dead CSS component classes, unimported components and
their tests, unreferenced image assets, the `surface` colour namespace (with a mandatory
contrast fix), a broken `next/image` test mock, and three orphaned visual-regression
snapshots."

## User Scenarios & Testing *(mandatory)*

The "users" of this feature are the people who read the rendered site and the people who
maintain its code — as with `001`, there is no new end-user-facing capability except the
contrast correction in User Story 1, which is a real accessibility fix. Every other story
is dead-code, dead-asset, or dead-test removal with no rendering change. Each story is
independently gradable by grepping `src/`, `e2e/`, or `public/` for the removed identifier
and confirming the count returns to zero for that group, or by confirming a file no longer
exists.

### User Story 1 - Surface-token retirement with contrast correction (Priority: P1)

A reviewer inspecting `products/loading.tsx`, `products/page.tsx`, and
`products/[slug]/page.tsx` sees every background driven by the bespoke warm `grey` ramp
(`tailwind.config.ts:37-48`) rather than the cool-slate `surface` namespace
(`tailwind.config.ts:30-34`) that has coexisted with it since the SEALED palette migration.
Where the token swap would otherwise ship a WCAG failure, the adjacent text colour is
corrected in the same change.

**Why this priority**: The only story in this feature with a real rendering and
accessibility consequence — every other story is invisible dead-code removal. It is
sequenced first because User Story 1's contrast fix is the one change in this feature that
must be verified by a human eye, not just a grep, and doing it first leaves the largest
review window.

**Independent Test**: `grep -r "surface-" src/ e2e/` returns zero results, `grep -rE
"surface" tailwind.config.ts` returns zero results, and `text-grey-500` does not appear
paired with `bg-grey-100` anywhere in `src/`.

**Acceptance Scenarios**:

1. **Given** `products/loading.tsx:3`, `products/page.tsx:29`, and
   `products/[slug]/page.tsx:54`, **When** they render, **Then** `bg-surface-muted` has
   been replaced with `bg-grey-50` and the surface reads identically to a plain background
   swap — no adjacent text colour needed to change against this tier.
2. **Given** `products/[slug]/page.tsx:110`, **When** it renders, **Then**
   `bg-surface-subtle` has been replaced with `bg-grey-100`, and the box remains visually
   nested inside the `grey-50` section around it — the two tiers stay distinct, they are
   not collapsed into one shade.
3. **Given** `products/[slug]/page.tsx:111` and `:117`, **When** they render against the
   new `bg-grey-100` background, **Then** `text-grey-500` (4.375:1 on `grey-100`, below the
   4.5:1 AA floor) has been replaced with `text-grey-600` (6.72:1).
4. **Given** the `surface` namespace in `tailwind.config.ts:30-34`, **When** the last call
   site is migrated, **Then** the namespace itself (`DEFAULT`, `muted`, `subtle`) is deleted
   from the config rather than left as dead tokens.

---

### User Story 2 - Dead component and hook deletion (Priority: P2)

A contributor reading `src/components/ui/` or `src/hooks/` finds no component or hook that
exists only to be imported by its own test. `PinContainer.tsx`, `MagneticWrapper.tsx`, and
`useMagneticHover.ts` — a 3D pin effect and a magnetic-hover wrapper, both stylistically
incompatible with the SEALED specimen-catalogue aesthetic even before considering that
nothing imports them — are removed together with their tests, and `AGENTS.md`'s
`src/hooks/` example no longer names a hook that no longer exists.

**Why this priority**: Second-highest blast radius in this feature — it is the only story
that also edits a documentation file outside the feature's own component code, and it
carries a real ordering constraint (below) that, done in the wrong order, would leave a
component importing a hook that no longer exists.

**Independent Test**: `grep -rn "PinContainer\|MagneticWrapper\|useMagneticHover" src/
AGENTS.md` returns zero results, and the three files plus their test files no longer exist
on disk.

**Acceptance Scenarios**:

1. **Given** `MagneticWrapper.tsx` is the only non-test importer of `useMagneticHover.ts`,
   **When** both are deleted, **Then** `MagneticWrapper.tsx` is deleted first, so at no
   point does a still-present component import an already-deleted hook.
2. **Given** `PinContainer.tsx`, `MagneticWrapper.tsx`, and `useMagneticHover.ts` are each
   imported only by their own test file, **When** each component/hook is deleted, **Then**
   its corresponding test file is deleted in the same change — a test whose subject no
   longer exists is not a test, which is distinct from and does not conflict with this
   repo's standing prohibition on deleting a *failing* test.
3. **Given** `AGENTS.md`'s `src/hooks/` structure example names `useMagneticHover`,
   **When** the hook is deleted, **Then** the example is updated to name a hook that still
   exists (`useTypewriter`) without the deleted one.

---

### User Story 3 - Unreferenced asset removal (Priority: P2)

A contributor browsing `public/` finds no file that nothing in `src/` or `e2e/` resolves a
path to — 8 unused texture images, 3 unused hero images, and the 5 stock `create-next-app`
boilerplate SVGs (`file`, `globe`, `next`, `vercel`, `window`) that predate this project's
own design system — plus the two `README.md` files that document only those deleted
images.

**Why this priority**: Equal blast radius to User Story 2 in file count, but lower risk —
these are static assets with no code path, whereas User Story 2 touches a hook's only
importer and a documentation file. Sequenced together at P2 because both are structural
deletions with no rendering consequence, unlike User Story 1.

**Independent Test**: The 16 named files no longer exist under `public/`; `public/hero/` and
`public/textures/` contain zero files; `public/categories/*.webp` (3 files) is unchanged in
count and content.

**Acceptance Scenarios**:

1. **Given** 8 files under `public/textures/*.webp` and 3 under `public/hero/*.webp`, none
   referenced by any path literal in `src/` or `e2e/`, **When** they are deleted, **Then**
   `public/textures/` and `public/hero/` end this story empty of image files.
2. **Given** `public/file.svg`, `public/globe.svg`, `public/next.svg`, `public/vercel.svg`,
   and `public/window.svg` — `create-next-app` boilerplate, unreferenced since this
   project's own icon system replaced them — **When** deleted, **Then** `public/` no
   longer contains any of the five.
3. **Given** `public/hero/README.md` and `public/textures/README.md` document only the
   images this story deletes, **When** the images are deleted, **Then** both README files
   are deleted with them.
4. **Given** `public/categories/*.webp` (3 files) is reached only through a template-built
   path at `ProductCategoriesSection.tsx:134` (`` src={`/categories/${category.slug}.webp`}
   ``) rather than a literal filename, **When** this story's grep-based audit runs, **Then**
   it explicitly excludes `public/categories/` and its `README.md` from deletion — a
   literal-filename grep cannot see a runtime-assembled path, and treating "not found by
   grep" as "unused" here would delete a live asset.

---

### User Story 4 - Dead Tailwind keyframes removal (Priority: P3)

A contributor reading `tailwind.config.ts`'s `keyframes` and `animation` blocks finds no
entry with zero consumers. `aurora`, `gradientShift`, and `shimmer`
(`tailwind.config.ts:110-132`) were orphaned when `AuroraBackground.tsx` was deleted during
the SEALED palette migration, and nothing in `src/` or `e2e/` uses `animate-aurora`,
`animate-gradient-shift`, or `animate-shimmer`.

**Why this priority**: Tidiness only — Tailwind emits no utility for an unused
`keyframes`/`animation` entry, so this story has zero bundle cost and zero rendering
consequence, the lowest-impact story in this feature alongside User Stories 5–7.

**Independent Test**: `grep -rE "animate-aurora|animate-gradient-shift|animate-shimmer"
src/ e2e/` returns zero results (true both before and after this story — the point is that
the *config* still defines dead entries the codebase never called), and after this story
`tailwind.config.ts` no longer defines the `aurora` or `gradientShift` keyframes/animations,
nor the `shimmer` keyframe.

**Acceptance Scenarios**:

1. **Given** `float`, `fadeUp`, `fadeIn`, and `gradientSweep` all have live consumers,
   **When** the dead entries are removed, **Then** these four keyframes and their
   `animation` entries are left untouched.
2. **Given** the `shimmer` keyframe has no corresponding `animation` entry at all (there is
   no `animate-shimmer` utility to begin with — only the keyframe definition is dead),
   **When** it is removed, **Then** only the keyframe is deleted; no `animation` entry
   needs deleting alongside it, unlike `aurora` and `gradientShift`, which have both.

---

### User Story 5 - Dead CSS component classes removal (Priority: P3)

A contributor reading `src/app/globals.css`'s `@layer components` block finds no class with
zero consumers. `.card-hover`, `.card-hover-category`, and `.card-hover-feature`
(`globals.css:58-80`) have zero consumers in `src/` or `e2e/` — the irony worth recording is
that `001-design-conformance` correctly migrated their shadows onto the `e0`–`e5` elevation
scale, and the result rendered nothing, because nothing was applying the classes.

**Why this priority**: Same tidiness class as User Story 4 — zero consumers means zero
rendering consequence either way.

**Independent Test**: `grep -rn "card-hover\b\|card-hover-category\|card-hover-feature"
src/ e2e/` returns zero results, and `globals.css`'s `@layer components` block no longer
defines any of the three classes.

**Acceptance Scenarios**:

1. **Given** the three classes are defined together in one `@layer components` block with
   no other class interleaved, **When** they are removed, **Then** the block containing
   them is deleted in full rather than left as an empty `@layer components {}`.

---

### User Story 6 - Broken `next/image` test mock fix (Priority: P3)

A contributor reading `src/__tests__/setup.ts:26-30` finds the global `next/image` mock
returning a valid renderable element rather than raw props (`(props) => { return props; }`,
which is not a React element and only fails to throw because every current
`next/image`-consuming test carries its own working local override that takes precedence).

**Why this priority**: A latent bug with zero present blast radius — all four consumers
already work around it — so fixing it has no observable effect on any existing test today.
It is prioritised above User Story 7 only because it is a correctness fix rather than a
pure asset-hygiene one.

**Independent Test**: `src/__tests__/setup.ts`'s `next/image` mock renders to a DOM node
when used directly (not shadowed by a local override), and all four existing local
overrides in files that consume `next/image` are unchanged — this story does not
deduplicate them, since doing so would widen this story's blast radius for no gain.

**Acceptance Scenarios**:

1. **Given** the global mock is fixed to return an actual element (for example an `<img>`
   built from the forwarded props), **When** the full unit suite runs, **Then** all four
   existing local overrides continue to take precedence in their own files exactly as
   before, and no test's assertions change.

---

### User Story 7 - Orphan visual-regression snapshot removal (Priority: P4)

A contributor reading `e2e/visual-regression.spec.ts-snapshots/` finds no baseline image
that no assertion can ever regenerate. `hero-mobile-mobile-win32.png`,
`products-mobile-mobile-win32.png`, and `products-page-desktop-mobile-win32.png` are orphans
under the `<name>-<project>-<platform>.png` convention, because
`playwright.config.ts:20-28` gives the `mobile` project `testIgnore:
'**/visual-regression.spec.ts'` — no test in that project ever runs to produce a
`-mobile-` snapshot.

**Why this priority**: Lowest-risk, most isolated story in this feature — three image files
with no code reference of any kind, orphaned by a project-scope config change made for an
unrelated reason (avoiding duplicate engine-variance baselines, per the comment at
`playwright.config.ts:23-26`).

**Independent Test**: The three named files no longer exist under
`e2e/visual-regression.spec.ts-snapshots/`, and `pnpm test:e2e` still passes with the same
five `-chromium-win32.png` baselines it already used.

**Acceptance Scenarios**:

1. **Given** the three orphan files predate the `mobile` project's `testIgnore` setting,
   **When** they are deleted, **Then** no Playwright project attempts to compare against
   them, because none ever could.

---

### Edge Cases

- What happens to `public/categories/*.webp`? Explicitly **retained** — see User Story 3,
  Acceptance Scenario 4. This is the one place in this feature where "not found by a
  literal-filename grep" does not mean "unused," and it is the general lesson worth
  recording: static analysis cannot prove a runtime-assembled asset path is dead.
- What happens if `next/image`'s fixed mock changes any existing assertion once it is no
  longer shadowed everywhere? It should not — see User Story 6's Independent Test — but if
  it does, that is new information about a previously-masked defect and is out of this
  feature's scope to fix; report it rather than silently patching the newly-exposed test.
- What happens to the `grey-50`/`grey-100` distinction once both former `surface` tiers
  point at the warm ramp? They must stay two different shades — `grey-50` is a section
  background, `grey-100` a box nested inside it — collapsing them to one shade is not part
  of this story's scope and would remove a visual hierarchy cue.
- What happens if a dead-code or dead-asset occurrence is found during implementation that
  is not named in this spec? It is out of this feature's scope — re-scope through a spec
  amendment rather than expanding silently, matching `001`'s precedent.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST render `bg-grey-50` in place of `bg-surface-muted` at all
  three known call sites: `src/app/products/loading.tsx:3`,
  `src/app/products/page.tsx:29`, `src/app/products/[slug]/page.tsx:54`.
- **FR-002**: The system MUST render `bg-grey-100` in place of `bg-surface-subtle` at the
  one known call site: `src/app/products/[slug]/page.tsx:110`.
- **FR-003**: The system MUST render `text-grey-600` in place of `text-grey-500` at
  `src/app/products/[slug]/page.tsx:111` and `:117` — the contrast correction required by
  the `grey-100` background introduced by FR-002 (4.375:1 with `grey-500`, 6.72:1 with
  `grey-600`).
- **FR-004**: The system MUST NOT alter `text-grey-500` where it pairs with `bg-grey-50`
  (4.92:1, already AA-compliant) — the contrast fix in FR-003 is scoped to the `grey-100`
  pairing only.
- **FR-005**: The `surface` colour namespace (`DEFAULT`, `muted`, `subtle`) MUST be deleted
  from `tailwind.config.ts` once FR-001 and FR-002 remove its last call sites.
- **FR-006**: `src/components/ui/PinContainer.tsx`, `src/components/ui/MagneticWrapper.tsx`,
  and `src/hooks/useMagneticHover.ts` MUST be deleted, together with each file's own test.
- **FR-007**: `MagneticWrapper.tsx` MUST be deleted before `useMagneticHover.ts` — it is the
  hook's only non-test importer, and deleting in the reverse order would leave a still-
  present component importing an already-deleted hook.
- **FR-008**: `AGENTS.md`'s `src/hooks/` structure-table example MUST no longer name
  `useMagneticHover` once FR-006 deletes it.
- **FR-009**: The system MUST delete 16 unreferenced files from `public/`: 8
  `public/textures/*.webp`, 3 `public/hero/*.webp`, and 5 `create-next-app` boilerplate
  SVGs (`file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`).
- **FR-010**: The system MUST delete `public/hero/README.md` and
  `public/textures/README.md` alongside the images they document, in the same change as
  FR-009.
- **FR-011**: The system MUST NOT delete any file under `public/categories/` — three
  `.webp` files and their `README.md` are reached via the template-built path at
  `ProductCategoriesSection.tsx:134` and are live.
- **FR-012**: The `aurora` and `gradientShift` keyframes and their `animation` entries, and
  the `shimmer` keyframe, MUST be deleted from `tailwind.config.ts:110-132`, while `float`,
  `fadeUp`, `fadeIn`, and `gradientSweep` and their `animation` entries remain untouched.
- **FR-013**: The `.card-hover`, `.card-hover-category`, and `.card-hover-feature` classes
  MUST be deleted from `src/app/globals.css:58-80`'s `@layer components` block.
- **FR-014**: The `next/image` mock at `src/__tests__/setup.ts:26-30` MUST return a
  renderable element rather than a raw props object, without altering the behaviour of any
  test that currently shadows it with a local override.
- **FR-015**: `hero-mobile-mobile-win32.png`, `products-mobile-mobile-win32.png`, and
  `products-page-desktop-mobile-win32.png` MUST be deleted from
  `e2e/visual-regression.spec.ts-snapshots/`.
- **FR-016**: All ten quality gates defined in
  `.github/instructions/quality-gates.instructions.md` MUST pass, with literal command
  output present in the implementation transcript.
- **FR-017**: Project-wide test coverage MUST remain **≥90%** across statements, branches,
  functions, and lines after the change — deleting source files and their tests together
  moves both the numerator and the denominator, so this is not assumed to hold by
  construction and must be measured (see plan.md's coverage-arithmetic risk).

*No requirement in this feature needed a `[NEEDS CLARIFICATION]` marker — every occurrence
was located and verified by file:line by the three read-only audits this spec is built
from.*

### Key Entities

Not applicable — this is a dead-code, dead-asset, and dead-test removal feature plus one
token-migration-with-contrast-fix; there is no new or changed data model, persisted entity,
or schema.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: `grep -r "surface-" src/ e2e/` returns zero results, and `grep -n "surface"
  tailwind.config.ts` returns zero results.
- **SC-002**: `text-grey-600` (not `text-grey-500`) appears at
  `src/app/products/[slug]/page.tsx:111` and `:117`.
- **SC-003**: `grep -rniE "useMagneticHover|PinContainer|MagneticWrapper" --include="*.ts"
  --include="*.tsx" --include="*.md" src/ e2e/ .github/ README.md AGENTS.md CONTRIBUTING.md`
  returns zero results — the sweep spans every doc that names a hook or component, not just
  `src/` and `AGENTS.md`, so a reference dangling in an auto-loaded agent rule file or the
  README fails the criterion — and none of the three source files or their three test files
  exists on disk.
- **SC-004**: `public/textures/` and `public/hero/` contain zero files; `public/`'s five
  boilerplate SVGs (`file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`) no
  longer exist; `public/categories/` still contains exactly 3 `.webp` files plus its
  `README.md`, unchanged.
- **SC-005**: `grep -rE "animate-aurora|animate-gradient-shift|animate-shimmer|aurora:|
  gradientShift:|shimmer:" tailwind.config.ts` returns zero results.
- **SC-006**: `grep -n "card-hover" src/app/globals.css` returns zero results.
- **SC-007**: All ten quality gates report green with verbatim output captured in the
  transcript, and project-wide coverage is ≥90% on all four metrics.
- **SC-008**: The three named orphan snapshot files no longer exist under
  `e2e/visual-regression.spec.ts-snapshots/`, and gate 7 still passes using only the five
  `-chromium-win32.png` baselines already in use.

## Assumptions

- The file:line occurrences enumerated in this spec were established by three independent
  read-only audits and treated as given; per this repo's standing practice (see `001`), they
  must be re-confirmed immediately before each edit, since the codebase may have moved
  between spec authoring and implementation.
- Deleting a source file and its own test together does not guarantee coverage holds
  steady — it moves both the numerator (fewer covered lines) and the denominator (fewer
  total lines), and the net direction is not obvious in advance. This must be measured with
  `pnpm test:coverage`, not assumed.
- The following are explicitly deferred, out of scope for this feature, and require no task
  in this feature's plan:
  - **An `@axe-core/playwright` accessibility spec.** This is a real capability build
    needing its own implement-review cycle, not a cleanup task — a first scan may surface
    findings that require design decisions, which do not belong bundled into a cleanup
    pass. Markup signals suggest a largely clean baseline (single `<main
    id="main-content">` landmark, labelled form controls, sequential headings, a
    correctly `aria-hidden` decorative canvas), with possible near-threshold contrast
    findings the scan itself would need to surface.
  - **Tightening `maxDiffPixelRatio: 0.05`.** Only the two hero shots carry determinism
    scaffolding (`reducedMotion: 'reduce'` plus web-first waits); the other four run under
    default motion with only `networkidle`. Tightening the tolerance without first
    extending that scaffolding to all six snapshots would trade a proven false-green for a
    new false-red. If ever undertaken, determinism scaffolding comes first, tolerance
    tightening second.
  - **`about-desktop-chromium-win32.png` is stale.** It shows a pre-SEALED navy pill
    header and stat values (`51+`/`100%`) that no longer match the current site
    (`44+`/`86%`), and the capture appears to catch `AboutSection` mid-animation. It has
    hidden under the 5% tolerance rather than failing outright. Regenerating it needs a
    deliberate reduced-motion capture plus a content-drift review, not a blind
    regeneration alongside this feature's other snapshot changes.
  - **A `feedback.error` design token.** `ContactSection.tsx:177` is the only coloured
    feedback state on the site; it already passes contrast (11.16:1 text / 5.84:1 border)
    and is conveyed by icon, text, `role="alert"`, and `aria-live` — not colour alone. A
    token serving exactly one call site is over-engineering. This is recorded as a
    consistency gap, explicitly **not** an accessibility defect — conflating those two
    severities is itself a failure mode worth naming, and this feature does not repeat it.
- No new colour, token, or component is introduced by this feature — every change either
  deletes an already-dead identifier or maps an existing call site onto an
  already-defined SEALED token (`grey-50`, `grey-100`, `grey-600`).
