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

    // Hide default cursor
    document.documentElement.style.cursor = 'none';

    // Single mousemove listener — writes to CSS custom properties
    // The cursor element reads these via CSS translate(), no rAF needed
    const onMouseMove = (e: MouseEvent) => {
      cursor.style.transform = `translate(${e.clientX - 20}px, ${e.clientY - 20}px)`;
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });

    // Change cursor on interactive elements via event delegation
    const onOver = (e: MouseEvent) => {
      if ((e.target as Element).closest('a, button, [role="button"]')) {
        cursor.classList.add('cursor--hover');
      }
    };
    const onOut = (e: MouseEvent) => {
      if ((e.target as Element).closest('a, button, [role="button"]')) {
        cursor.classList.remove('cursor--hover');
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
