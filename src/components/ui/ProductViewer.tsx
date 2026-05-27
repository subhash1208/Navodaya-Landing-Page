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
    <div className="relative w-full aspect-square rounded-[1.25rem] overflow-hidden bg-gradient-to-br from-brand-light via-slate-50 to-slate-100 border border-slate-100">
      {/* Placeholder content */}
      <div className="group absolute inset-0 flex flex-col items-center justify-center gap-4 p-8">
        {/* Animated product icon — CSS hover via group-hover */}
        <div className="w-32 h-32 rounded-2xl bg-white shadow-[0_8px_32px_rgba(15,23,42,0.12)] flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
          <span className="text-6xl" role="img" aria-label={productName}>
            📦
          </span>
        </div>

        <div className="text-center">
          <p className="text-sm font-semibold text-brand-dark mb-1">360° View Coming Soon</p>
          <p className="text-xs text-slate-400 max-w-[200px] leading-relaxed">
            Product photography in progress. Real images will be added shortly.
          </p>
        </div>

        {/* Fake viewer controls — visual only */}
        <div className="flex items-center gap-2 mt-2" aria-hidden="true">
          {[RotateCcw, ZoomOut, ZoomIn, Camera].map((Icon, i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-lg bg-white/80 border border-slate-200 flex items-center justify-center opacity-50"
            >
              <Icon className="w-3.5 h-3.5 text-slate-500" />
            </div>
          ))}
        </div>
      </div>

      {/* Corner badge */}
      <div className="absolute top-3 right-3 bg-brand-primary/10 text-brand-primary text-[10px] font-semibold px-2 py-1 rounded-full border border-brand-primary/20">
        360° Ready
      </div>
    </div>
  );
}
