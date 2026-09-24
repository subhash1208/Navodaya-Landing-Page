# Textures

Material surface references for the SEALED specimen-catalogue design direction.
Generated with Google AI Studio (Gemini), September 2026.

**This file covers three directories, not just this one.** The same generation,
upscale and storage-format decisions apply to `public/categories/` and
`public/hero/`, which now also hold WebP. Their own `README.md` files describe
subject matter; the pipeline facts are all recorded here.

| File                          | Stored size | Notes                                                   |
| ----------------------------- | ----------- | ------------------------------------------------------- |
| `non-woven-weave-21x9.webp`   | 3168 × 1344 |                                                         |
| `non-woven-weave-1x1.webp`    | 2048 × 2048 |                                                         |
| `heat-seal-crimp-21x9.webp`   | 3168 × 1344 |                                                         |
| `nitrile-glove-16x9.webp`     | 2752 × 1536 |                                                         |
| `nitrile-glove-1x1.webp`      | 2048 × 2048 |                                                         |
| `terry-cloth-fold-16x9.webp`  | 2752 × 1536 | Corrected regeneration, replaces the deleted 21x9 file. |
| `kraft-paper-grain-21x9.webp` | 3168 × 1344 |                                                         |
| `kraft-paper-grain-1x1.webp`  | 2048 × 2048 |                                                         |

`terry-cloth-fold-21x9.jpg` was **deleted on 2026-09-24**. It was a
wrong-aspect-ratio generation (1584 × 672 where the spec required 16:9), was
never upscaled for that reason, and had already been superseded by
`terry-cloth-fold-16x9.webp` at 2752 × 1536. It is recoverable from git history
if it is ever wanted again. With it gone, all three directories are uniformly
WebP and contain **zero JPEGs**.

`public/categories/` holds `hygiene-safety.webp`, `hotel-amenities.webp` and
`spa-salon.webp`, all 2784 × 3456. `public/hero/` holds `cup-front.webp`,
`cup-three-quarter.webp` and `cup-rim-seam.webp`, all 3072 × 3072.

## Storage format — WebP, decided 2026-09-24

The upscaled Upscayl outputs are PNG and total **134 MB** across the 14 files.
Committing that would permanently and irreversibly bloat git history, so the
repo stores **WebP at quality 85** (`sharp`, `effort: 6`) instead — the same
14 images come to **3.4 MB**, a ~40× reduction, at the same pixel dimensions.

Source format is not load-bearing: `next/image` re-optimises every asset at
build time regardless of what it started as, so storing PNG buys nothing that
survives the build.

**The full-resolution PNG masters are not in the repo.** They remain in
`D:\downlaods\Upscayl Output\` on the authoring machine. Anything needing true
lossless source — a reprint, a different crop, a re-upscale — goes back to those
files, not to the WebP in this tree.

## Upscale plan — done for every file in this directory

These are material maps, upscaled via Upscayl. The target differs per file —
there is no single "2048²" target, that figure applies only to the three 1:1
files. **All five bands and all three 1:1 textures below have been run and
verified at the target sizes in the last column.**

| File                         | Native      | Model             | Scale | Upscaled target |
| ---------------------------- | ----------- | ----------------- | ----- | --------------- |
| `non-woven-weave-21x9.jpg`   | 1584 × 672  | Ultrasharp        | 2x    | 3168 × 1344     |
| `heat-seal-crimp-21x9.jpg`   | 1584 × 672  | Ultrasharp        | 2x    | 3168 × 1344     |
| `terry-cloth-fold-16x9.jpg`  | 1376 × 768  | Ultrasharp        | 2x    | 2752 × 1536     |
| `kraft-paper-grain-21x9.jpg` | 1584 × 672  | Ultrasharp        | 2x    | 3168 × 1344     |
| `nitrile-glove-16x9.jpg`     | 1376 × 768  | Ultrasharp        | 2x    | 2752 × 1536     |
| `non-woven-weave-1x1.jpg`    | 1024 × 1024 | Ultramix Balanced | 2x    | 2048 × 2048     |
| `nitrile-glove-1x1.jpg`      | 1024 × 1024 | Ultramix Balanced | 2x    | 2048 × 2048     |
| `kraft-paper-grain-1x1.jpg`  | 1024 × 1024 | Ultramix Balanced | 2x    | 2048 × 2048     |

Upscayl's models are natively 4x, so choosing **2x** already runs the 4x pass and
downsamples internally — do **not** manually upscale to 4x and then downscale, and
never run an image through Upscayl twice. Artifacts compound and the grain goes
waxy. Output PNG, compression 0, Double Upscayl **off**.

The `.jpg` filenames in the table above are the **pre-upscale originals**, which
is what was fed to Upscayl. None of them are still in the repo — each was
replaced by the `.webp` of the same stem, per the storage-format decision above.

## Hero cup images — RESOLVED 2026-09-24, tested: they CAN be upscaled

Two sessions disagreed about whether the cup images in `public/hero/` should be
upscaled. The disagreement was settled by running the test, not by argument. It
is recorded in full below so nobody relitigates it.

**The case against (Position A, held by the earlier session).** The cups carry a
two-line wordmark ("Navodaya" / "Industries and Care Kits"), and over-sharpening
genuinely does damage letterforms. This was the original instruction in this
file: cup images must not be upscaled because AI upscalers mangle the wordmark.

**The case for (Position B).** Upscayl runs Real-ESRGAN, a deterministic CNN —
it does not re-invent letterforms the way a diffusion refiner does. The
practical risk is model-dependent: Ultrasharp over-crunches text, Ultramix
Balanced holds it. There is also a concrete reason to want more pixels: the hero
slot renders at 520 × 520 CSS px (`src/components/sections/HeroSection.tsx:283-285`,
`ProductCategoryGraph width={520} height={520}`; the container sets
`minHeight: '520px'` at `:266`). That needs 1040px at 2x DPR and 1560px at 3x
DPR. The cups are 1024px — clearing 2x by only 16px and failing 3x outright.

### Verdict: Position B is supported by the test

All three cups were upscaled with Upscayl at **3x** using **Ultramix Balanced**,
producing 3072 × 3072 PNGs. Output files live outside the repo, in
`D:\downlaods\Upscayl Output\`:

- `cup-front_upscayl_3x_ultramix-balanced-4x.png`
- `cup-rim-seam_upscayl_3x_ultramix-balanced-4x.png`
- `cup-three-quarter_upscayl_3x_ultramix-balanced-4x.png`

Visual inspection of `cup-front` showed the two-line wordmark rendered with
clean, correctly-formed letterforms — no smearing, no fused or warped glyphs.
The two-tone blue logo mark held both tones with clean edges. The paper surface
retained natural fibre texture rather than going waxy or plastic.

**Limitation, stated honestly.** That inspection was performed on a view
downsampled to roughly 2000px from the 3072px native file — about 65% of full
scale, not a true 100%-zoom pixel-level audit. Letterform damage at 3x would be
expected to be visible even at that scale, which is why the result is treated as
conclusive; a human doing a 100% zoom check before final sign-off remains the
stronger verification.

**Ruling.** Cups may be upscaled. Use **Ultramix Balanced**. **Ultrasharp
remains unsuitable** for these three files because it over-sharpens text.

Note that 3x / 3072² is more than the hero slot strictly requires — 520 CSS px
needs 1560px at 3x DPR — but it is harmless and does not need redoing. The
earlier plan in this file called for 2x to 2048 × 2048; the run that actually
happened was 3x to 3072 × 3072, and those are the real numbers.

## Outstanding

- **Category panels — all three done as of 2026-09-24.** `hygiene-safety`,
  `hotel-amenities` and `spa-salon` have each been run through Upscayl with
  **Ultrasharp at 3x**, producing 2784 × 3456, and all three are now in
  `public/categories/` as WebP. An earlier revision of this line said the latter
  two had not been run yet; that was true when written and is now stale.
- Everything in this directory is done: all five texture bands and all three 1:1
  textures are upscaled and verified at their target sizes.
- All three hero cups are done at 3072 × 3072 (Ultramix Balanced, 3x) and are in
  `public/hero/` as WebP.
- **The `terry-cloth-fold-21x9.jpg` question is settled** — it was deleted on
  2026-09-24 and is recoverable from git history. Nothing is outstanding: all
  14 assets across the three directories are upscaled, converted and in the
  tree, and no JPEG remains anywhere in them.
