# Category art

Abstract category artwork for the three catalogue categories.
Generated with Google AI Studio (Gemini), September 2026.

Stored as `hygiene-safety.webp`, `hotel-amenities.webp` and `spa-salon.webp`,
all 2784 × 3456 (portrait). Native generation size was 928 × 1152; all three
were upscaled 3x with Upscayl (Ultrasharp model; output PNG, compression 0,
Double Upscayl off) and re-encoded as WebP at quality 85 (sharp effort 6).
next/image re-optimises every asset at build time regardless of source
format, so a PNG master in the repo would buy nothing that survives the
build — the Upscayl PNG masters are kept outside the repo instead.

`public/textures/` and `public/hero/` were removed on 2026-09-24 as
unreferenced; their absence is deliberate, not a broken link.

These three files are loaded via a runtime-assembled path —
``src={`/categories/${category.slug}.webp`}`` in
`src/components/sections/ProductCategoriesSection.tsx:134` — not a literal
filename, so a plain-text search for a filename will not find the
reference. Check that path before assuming any of the three is unused.

Filenames match the `CategorySlug` union in `src/types/index.ts`
(`hygiene-safety` | `hotel-amenities` | `spa-salon`), so a component can derive
the path from the slug. Renaming one requires changing the union too.
