'use client';

import { useRef, useEffect } from 'react';

/**
 * Magnetic hover effect — element pulls toward cursor when nearby.
 * Disabled on touch devices.
 */
export function useMagneticHover<T extends HTMLElement>(strength = 0.3) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Disable on touch devices
    if (window.matchMedia('(hover: none)').matches) return;

    let rafId: number;

    const onMouseMove = (e: MouseEvent) => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dx = e.clientX - centerX;
        const dy = e.clientY - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const threshold = Math.max(rect.width, rect.height) * 1.2;

        if (distance < threshold) {
          const moveX = dx * strength;
          const moveY = dy * strength;
          el.style.transform = `translate(${moveX}px, ${moveY}px)`;
          el.style.transition = 'transform 0.1s ease-out';
        }
      });
    };

    const onMouseLeave = () => {
      cancelAnimationFrame(rafId);
      el.style.transform = 'translate(0, 0)';
      el.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
    };

    el.addEventListener('mousemove', onMouseMove);
    el.addEventListener('mouseleave', onMouseLeave);

    return () => {
      cancelAnimationFrame(rafId);
      el.removeEventListener('mousemove', onMouseMove);
      el.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [strength]);

  return ref;
}
