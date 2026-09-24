# Category art

Abstract category artwork for the three catalogue categories.
Generated with Google AI Studio (Gemini), September 2026.

Stored as `hygiene-safety.webp`, `hotel-amenities.webp` and `spa-salon.webp`,
all 2784 × 3456 (portrait). Native generation size was 928 × 1152; all three
were upscaled with Upscayl (Ultrasharp, 3x) and stored as WebP q85 — see
`public/textures/README.md` for the full pipeline and the storage-format
decision.

Filenames match the `CategorySlug` union in `src/types/index.ts`
(`hygiene-safety` | `hotel-amenities` | `spa-salon`), so a component can derive
the path from the slug. Renaming one requires changing the union too.
