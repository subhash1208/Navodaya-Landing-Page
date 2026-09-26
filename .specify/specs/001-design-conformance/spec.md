# Feature Specification: SEALED Design-System Conformance

**Feature Branch**: `001-design-conformance`

**Created**: 2026-09-24

**Status**: Draft

**Input**: User description: "Close the remaining SEALED design-system conformance gaps
left after the palette migration (commit `dc13bc3`) — pre-SEALED corner radii, shadows, and
one surface gradient still in the codebase."

## User Scenarios & Testing *(mandatory)*

The "users" of this feature are the people who read the rendered site and the people who
maintain its code — there is no new end-user-facing capability, only removal of a visual
inconsistency the SEALED migration left behind. Each story is independently gradable by
grepping `src/` for the offending class and confirming the count returns to zero for that
group.

### User Story 1 - Square-corner conformance (Priority: P1)

A site visitor or reviewer sees every card, panel, and error state rendered with the
SEALED system's square corners, with no leftover graduated radius (`rounded-lg`,
`rounded-xl`, `rounded-2xl`, …) or arbitrary bracket radius (`rounded-[...]`) anywhere in
`src/`.

**Why this priority**: Highest occurrence count (16 of 22, across 8 files) and the most
visually obvious inconsistency — softened corners next to the SEALED catalogue's sharp
ones is the clearest tell that a surface was missed.

**Independent Test**: `grep` for `rounded-lg|rounded-xl|rounded-2xl|rounded-3xl|rounded-sm|rounded-md|rounded-\[`
across `src/` returns zero matches, while a separate grep for `rounded-full` returns the
same count as before the change (proving pills/avatars/circular controls were untouched).

**Acceptance Scenarios**:

1. **Given** the product detail page (`src/app/products/[slug]/page.tsx`), **When** it
   renders, **Then** none of its four corner-radius classes (lines 110, 125, 137, 144) use
   a graduated or arbitrary radius.
2. **Given** any of the four route-level error/loading/not-found surfaces
   (`products/[slug]/error.tsx`, `products/error.tsx`, `not-found.tsx`,
   `products/loading.tsx`), **When** rendered, **Then** their corner radii match the
   SEALED scale (square, or `rounded-full` where a circular control is intended).
3. **Given** `ProductViewer.tsx` and `CounterStat.tsx`, **When** rendered, **Then** their
   arbitrary bracket radii (`rounded-[1.25rem]`, `rounded-[14px]`, etc.) are replaced with
   SEALED-conformant values.

---

### User Story 2 - Elevation-token conformance (Priority: P2)

A reviewer inspecting hover states sees every interactive surface using the `e0`–`e5`
elevation scale rather than Tailwind's default `shadow-lg|xl|2xl` or an arbitrary
`shadow-[...]` value, matching the established `ProductCard.tsx` pattern
(`shadow-e0` at rest, `hover:shadow-e1` on interaction).

**Why this priority**: Second-highest occurrence count (5 of 22, across 3 files) and the
mechanism (hairline borders / elevation tokens replacing shadow-and-blur) is the SEALED
system's second-most load-bearing visual rule after monochrome surfaces.

**Independent Test**: `grep` for `shadow-xl|shadow-2xl|shadow-lg|shadow-\[` across `src/`
returns zero matches.

**Acceptance Scenarios**:

1. **Given** `globals.css`'s three `.card-hover*` component classes (lines 63, 71, 79),
   **When** hovered, **Then** each raises elevation via a token in the `e0`–`e5` scale
   instead of a Tailwind default shadow utility.
2. **Given** `CounterStat.tsx:82` and `ProductViewer.tsx:26`, **When** rendered, **Then**
   their arbitrary ink-derived `shadow-[...]` values are replaced with the nearest
   equivalent `e`-scale token.
3. **Given** the `-translate-y-*` lift paired with each `.card-hover*` class, **When** the
   shadow is migrated to a lighter `e`-scale token, **Then** the lift distance has been
   re-considered rather than left at its pre-migration value by default — see the
   Assumptions section; this is a judgement call, not a mechanical substitution.

---

### User Story 3 - Surface-gradient conformance (Priority: P3)

A visitor scrolling to the contact section sees a solid SEALED surface rather than a
`from-ink to-grey-900` gradient background, while the section's cursor-spotlight effect
(itself a permitted functional gradient) is unchanged.

**Why this priority**: Single occurrence, isolated to one component — lowest effort and
lowest risk, sequenced last because it has no dependency on, and no dependency from, the
other two groups.

**Independent Test**: `grep -r "bg-gradient-" src/` returns zero matches, and
`ContactSection.tsx` still renders its `cursor-spotlight` class and mouse-move handler
unchanged.

**Acceptance Scenarios**:

1. **Given** `ContactSection.tsx:84`, **When** it renders, **Then** `bg-gradient-to-br
   from-ink to-grey-900` has been replaced with a solid SEALED surface class and
   `cursor-spotlight` is preserved verbatim.

---

### Edge Cases

- What happens to `rounded-full` occurrences? They are explicitly **not** in scope and
  must be left untouched — a grep-based acceptance check that does not separately count
  `rounded-full` before and after cannot tell a correct fix from an over-broad one.
- What happens to gradients used as functional effects (edge-fade masks in
  `MarqueeStrip.tsx`, the radial glow/sweep in `LoadingScreen.tsx`, the `cursor-spotlight`
  radial gradient in `globals.css:162`, and `blur(...)` filters inside GSAP/motion
  animations)? They are explicitly out of scope — see Assumptions.
- What happens to the two arbitrary shadows that are already colour-correct (ink-derived
  rgba) but bypass the token scale? They still migrate onto the `e`-scale, because the
  violation is "not on the token scale," not "wrong colour."
- What happens if a corner-radius or shadow occurrence is discovered that is not in the
  tables below? It is out of this feature's scope unless it matches one of the three
  grep patterns above — re-scope through a spec amendment rather than expanding silently
  during implementation.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST render zero graduated (`rounded-sm|md|lg|xl|2xl|3xl`) or
  arbitrary (`rounded-[...]`) corner-radius classes anywhere in `src/`, across all 16
  known occurrences in 8 files: `src/app/products/[slug]/page.tsx` (lines 110, 125, 137,
  144), `src/app/products/[slug]/error.tsx` (24, 30), `src/app/products/error.tsx` (23,
  29), `src/app/not-found.tsx` (16, 22), `src/app/products/loading.tsx` (23),
  `src/app/products/page.tsx` (21), `src/components/ui/ProductViewer.tsx` (22, 26, 44),
  `src/components/ui/CounterStat.tsx` (82).
- **FR-002**: The system MUST leave every `rounded-full` occurrence untouched — pills,
  avatars, and circular controls are not part of this conformance gap.
- **FR-003**: The system MUST render zero `shadow-lg`, `shadow-xl`, `shadow-2xl`, or
  arbitrary `shadow-[...]` classes anywhere in `src/`, across all 5 known occurrences in 3
  files: `src/app/globals.css` (lines 63, 71, 79), `src/components/ui/CounterStat.tsx`
  (82), `src/components/ui/ProductViewer.tsx` (26).
- **FR-004**: Every migrated shadow MUST use a token from the `e0`–`e5` elevation scale
  (`tailwind.config.ts:85-91`), following the rest/hover pattern already established in
  `src/components/ui/ProductCard.tsx:26`.
- **FR-005**: The system MUST render zero `bg-gradient-*` classes used as surface colour
  anywhere in `src/`; the single known occurrence is
  `src/components/sections/ContactSection.tsx:84`.
- **FR-006**: The `cursor-spotlight` class and its mouse-move handler on
  `ContactSection.tsx` MUST be preserved unchanged by the FR-005 fix.
- **FR-007**: The system MUST NOT alter any of the explicitly out-of-scope functional
  gradients or blur filters listed in the Edge Cases section — `MarqueeStrip.tsx` edge
  fades, `LoadingScreen.tsx` glow/sweep, `globals.css:162` spotlight gradient, and
  GSAP/motion `blur(...)` filters in `AboutSection.tsx` and `LoadingScreen.tsx`.
- **FR-008**: The system MUST NOT alter `shadow-e0`/`shadow-e1` usages that are already on
  the token scale (`AboutSection.tsx:244`, `ProductCategoriesSection.tsx:124`,
  `ProductCard.tsx:26`).
- **FR-009**: All ten quality gates defined in
  `.github/instructions/quality-gates.instructions.md` MUST pass, with literal command
  output present in the implementation transcript, including gate 10 (SSR/no-JS) because
  `LoadingScreen` and `PageTransition` both wrap page content and are adjacent to files
  this feature touches.
- **FR-010**: Project-wide test coverage MUST remain **≥90%** across statements, branches,
  functions, and lines after the change.
- **FR-011**: Gate 7 (E2E) MUST confirm exactly one `[WebServer] $ next build` marker in
  its output, proving Playwright built fresh rather than reusing a stale server on port
  3000.

*No requirement in this feature needed a `[NEEDS CLARIFICATION]` marker — every occurrence
was located and verified by file:line before this spec was written; the one open judgement
call (translate-y lift distance) is recorded as an Assumption below, not a clarification
gap, because the plan is expected to make and document that call rather than escalate it.*

### Key Entities

Not applicable — this is a class-name and CSS-token conformance feature with no data model,
no persisted entity, and no schema change.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: `grep -rE "rounded-(sm|md|lg|xl|2xl|3xl|\[)" src/` (excluding `rounded-full`
  matches) returns zero results.
- **SC-002**: `grep -rE "shadow-(lg|xl|2xl|\[)" src/` returns zero results.
- **SC-003**: `grep -r "bg-gradient-" src/` returns zero results.
- **SC-004**: All ten quality gates report green with verbatim output captured in the
  transcript, and project-wide coverage is ≥90%.
- **SC-005**: Of the five visual-regression baselines expected to change
  (`hero-desktop`, `hero-mobile`, `product-detail-mobile`, `products-mobile`,
  `products-page-desktop`), each regenerated snapshot has been visually reviewed by a
  human or reviewer agent before being accepted — a baseline is truth once written, so an
  un-reviewed regeneration can silently bake in an unintended change.

## Assumptions

- The file:line occurrences enumerated in this spec were verified at the time of writing
  (2026-09-24) but must be re-confirmed immediately before each edit — the codebase may
  have moved between spec authoring and implementation.
- The `-translate-y-*` lift distance paired with each `.card-hover*` shadow migration is a
  **judgement call, not a specified value** — SEALED is visually restrained, and a smaller
  lift may read better paired with a lighter `e1`/`e2` token than the current
  `-translate-y-1.5|2` values inherited from the pre-SEALED shadows. The plan must record
  the chosen values and the reasoning, not just apply a 1:1 token swap.
- Five visual-regression snapshot baselines will legitimately change as a result of this
  feature (`hero-desktop`, `hero-mobile`, `product-detail-mobile`, `products-mobile`,
  `products-page-desktop`) and regenerating them is in scope — but each regenerated
  baseline requires a human or reviewer eyeball pass, not blind acceptance.
- The following known gaps are deliberately **deferred, out of scope for this feature**,
  and require no task in this feature's plan: `surface.muted`/`surface.subtle` still using
  cool slate values inconsistent with the warm grey ramp; `ContactSection.tsx:177`'s red
  error state having no `feedback.error` design token; dead Tailwind keyframes
  (`shimmer`, `gradientShift`, `aurora`, `tailwind.config.ts` roughly lines 110–132) with
  zero references; 8 unused texture `.webp` files and 3 orphaned `*-mobile-win32.png`
  snapshots; the broken global `next/image` mock at `src/__tests__/setup.ts:26-30`; the
  absence of an axe-core e2e accessibility spec; unimported `PinContainer.tsx` and
  `MagneticWrapper.tsx`; and placeholder testimonial content naming specific real-sounding
  people and companies, which is a content risk for the client rather than a build task.
- No new colour, token, or component is introduced by this feature — every fix maps an
  existing pre-SEALED class onto an already-defined SEALED token.
