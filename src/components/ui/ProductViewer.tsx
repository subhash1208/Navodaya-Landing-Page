'use client';

import Image from 'next/image';
import { RotateCcw, ZoomIn, ZoomOut, Camera } from 'lucide-react';

interface ProductViewerProps {
  productName: string;
  /**
   * Path to the product photograph, e.g. `/products/mop-set.webp`. Most of the catalogue has no
   * approved photo, so the placeholder below remains the fallback rather than a dead end.
   */
  image?: string;
}

/**
 * Product photograph, with a placeholder for the products that do not have one yet.
 *
 * The photographed branch is a static image, not a spin: every photo is a single 4:3 cutout on the
 * `paper` background, so the box takes the images' own 4:3 ratio and `object-contain` guarantees
 * the cutout is never cropped. The decorative rotate/zoom/camera controls belong to the
 * placeholder only — beside a real static photo they advertise 360° interactivity that does not
 * exist, so they are not rendered there.
 *
 * When real 360° assets arrive: an <img> sequence driven by drag events, or @google/model-viewer
 * for a true .glb.
 *
 * `loading="eager"` + `fetchPriority="high"` because this is the detail page's likely LCP element:
 * it sits in the left column of an above-the-fold `lg:grid-cols-2`, and `next/image` defaults to
 * `loading="lazy"`, which the preload scanner cannot discover until layout resolves. Per
 * `node_modules/next/dist/docs/01-app/03-api-reference/02-components/image.md:288` these two are
 * the recommended API over the `preload` prop — and note `priority` is DEPRECATED in Next 16
 * (`:294`), so it is not the thing to reach for. Safe here in a way it would not be on the grid:
 * this component renders exactly once per detail page. The same change on `ProductCard` would make
 * 42 images eager on `/products` and is explicitly not wanted.
 *
 * Performance: the placeholder's hover effect is CSS-only (group-hover Tailwind classes) instead
 * of useState, eliminating re-renders on every mouse enter/leave.
 */
export function ProductViewer({ productName, image }: ProductViewerProps) {
  if (image) {
    return (
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-grey-50 border border-grey-100">
        <Image
          src={image}
          alt={productName}
          fill
          sizes="(min-width: 1024px) 45vw, 92vw"
          className="object-contain"
          loading="eager"
          fetchPriority="high"
        />
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-square overflow-hidden bg-grey-50 border border-grey-100">
      {/* Placeholder content */}
      <div className="group absolute inset-0 flex flex-col items-center justify-center gap-4 p-8">
        {/* Animated product icon — CSS hover via group-hover */}
        <div className="w-32 h-32 bg-paper shadow-e4 flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
          <span className="text-6xl" role="img" aria-label={productName}>
            📦
          </span>
        </div>

        <div className="text-center">
          <p className="text-sm font-semibold text-ink mb-1">360° View Coming Soon</p>
          <p className="text-xs text-grey-500 max-w-[200px] leading-relaxed">
            Product photography in progress. Real images will be added shortly.
          </p>
        </div>

        {/* Fake viewer controls — visual only */}
        <div className="flex items-center gap-2 mt-2" aria-hidden="true">
          {[RotateCcw, ZoomOut, ZoomIn, Camera].map((Icon, i) => (
            <div
              key={i}
              className="w-8 h-8 bg-paper/80 border border-grey-200 flex items-center justify-center opacity-50"
            >
              <Icon className="w-3.5 h-3.5 text-grey-500" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
