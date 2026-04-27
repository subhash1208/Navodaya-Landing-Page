'use client';

import { useEffect, useRef } from 'react';

/**
 * Custom rotating cursor — replaces default browser cursor.
 * Disabled on touch devices (hover: none).
 * Adapted from Adeola's cursor pattern.
 */
export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: -100, y: -100 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    // Disable on touch devices
    if (window.matchMedia('(hover: none)').matches) return;

    const cursor = cursorRef.current;
    if (!cursor) return;

    // Hide default cursor
    document.documentElement.style.cursor = 'none';

    const onMouseMove = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY };
    };

    // Smooth follow with rAF
    const animate = () => {
      if (cursor) {
        cursor.style.transform = `translate(${posRef.current.x - 20}px, ${posRef.current.y - 20}px)`;
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', onMouseMove);
    rafRef.current = requestAnimationFrame(animate);

    // Change cursor on interactive elements
    const onMouseEnterInteractive = () => cursor.classList.add('cursor--hover');
    const onMouseLeaveInteractive = () => cursor.classList.remove('cursor--hover');

    const interactives = document.querySelectorAll('a, button, [role="button"]');
    interactives.forEach(el => {
      el.addEventListener('mouseenter', onMouseEnterInteractive);
      el.addEventListener('mouseleave', onMouseLeaveInteractive);
    });

    return () => {
      document.documentElement.style.cursor = '';
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(rafRef.current);
      interactives.forEach(el => {
        el.removeEventListener('mouseenter', onMouseEnterInteractive);
        el.removeEventListener('mouseleave', onMouseLeaveInteractive);
      });
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      className="custom-cursor"
    />
  );
}
