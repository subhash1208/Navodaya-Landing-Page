'use client';

import { RotateCcw, ZoomIn, ZoomOut, Camera } from 'lucide-react';

interface ProductViewerProps {
  productName: string;
}

/**
 * 360° Product Viewer placeholder.
 * When real product photos or .glb 3D models are available:
 * - For 360° spin: replace the placeholder with an <img> sequence
 *   driven by mouse/touch drag events
 * - For true 3D: install @google/model-viewer and replace with
 *   <model-viewer src="product.glb" camera-controls auto-rotate />
 *
 * Performance: hover effect is CSS-only (group-hover Tailwind classes) instead
 * of useState, eliminating re-renders on every mouse enter/leave.
 */
export function ProductViewer({ productName }: ProductViewerProps) {
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
