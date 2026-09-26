# Hero specimen plate

`cup-three-quarter.webp` — a branded paper cup at a three-quarter angle, 3072 × 3072.
Generated with Google AI Studio (Gemini), September 2026, natively at 1024 × 1024 and
upscaled 3x with Upscayl (Ultramix Balanced; Ultrasharp over-sharpens the two-line
wordmark and is unsuitable for this file). Re-encoded as WebP q85 (sharp, effort 6);
the PNG master is kept outside the repo.

**It is live.** `src/components/sections/HeroSection.tsx` loads it as the hero's specimen
plate via the literal path `/hero/cup-three-quarter.webp`. This README exists for the same
reason `public/categories/README.md` does: the whole of `public/hero/` was deleted on
2026-09-24 as unreferenced, and restoring one file from that sweep without saying why it
came back invites the next sweep to remove it again.

Its two siblings from that deletion — `cup-front.webp` (140496 B) and `cup-rim-seam.webp`
(217856 B) — were deliberately **not** restored. They remain in git history at `dbb526f`.
The hero shows one plate, not three; shipping an asset nothing references is what got all
three deleted in the first place.
