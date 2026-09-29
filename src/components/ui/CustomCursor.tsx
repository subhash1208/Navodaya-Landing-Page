'use client';

import { useEffect, useRef } from 'react';

/**
 * Custom rotating cursor — replaces default browser cursor.
 * Uses CSS custom properties (--cursor-x, --cursor-y) instead of rAF loop.
 * The browser reads CSS vars reactively — no per-frame JS needed.
 * Disabled on touch devices (hover: none).
 */
export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Disable on touch devices
    if (window.matchMedia('(hover: none)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const cursor = cursorRef.current;
    if (!cursor) return;

    // Only hide the native cursor once the custom cursor has actually painted —
    // if globals.css ever fails to load, the unstyled div has zero size and this
    // guard leaves the visitor with a real pointer instead of none at all.
    const rect = cursor.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    // Hide default cursor
    document.documentElement.style.cursor = 'none';

    // Single mousemove listener — writes to CSS custom properties
    // The cursor element reads these via CSS translate(), no rAF needed
    const onMouseMove = (e: MouseEvent) => {
      cursor.style.transform = `translate(${e.clientX - 20}px, ${e.clientY - 20}px)`;
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });

    // Change cursor on interactive elements via event delegation. Also invert
    // the cursor's colour to paper over surfaces marked [data-cursor-invert]
    // (dark or brand-blue grounds) — independent of the hover check, since an
    // element can be both (e.g. the header's blue "Get a Quote" CTA).
    const onOver = (e: MouseEvent) => {
      const target = e.target as Element;
      if (target.closest('a, button, [role="button"]')) {
        cursor.classList.add('custom-cursor--hover');
      }
      if (target.closest('[data-cursor-invert]')) {
        cursor.classList.add('custom-cursor--invert');
      }
    };
    const onOut = (e: MouseEvent) => {
      const target = e.target as Element;
      if (target.closest('a, button, [role="button"]')) {
        cursor.classList.remove('custom-cursor--hover');
      }
      if (target.closest('[data-cursor-invert]')) {
        cursor.classList.remove('custom-cursor--invert');
      }
    };
    document.addEventListener('mouseover', onOver);
    document.addEventListener('mouseout', onOut);

    return () => {
      document.documentElement.style.cursor = '';
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout', onOut);
    };
  }, []);

  return <div ref={cursorRef} aria-hidden="true" className="custom-cursor" />;
}
