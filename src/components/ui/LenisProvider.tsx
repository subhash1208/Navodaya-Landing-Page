'use client';

import { useEffect, useRef } from 'react';

/**
 * Lenis smooth scroll provider.
 * Wraps the app with smooth scroll physics.
 * Integrates with GSAP ScrollTrigger via lenis.on('scroll', ScrollTrigger.update).
 *
 * GSAP (~74KB gzip) and Lenis are loaded via dynamic import inside useEffect so they
 * are excluded from the initial bundle, keeping First Load JS under the 150KB target.
 *
 * Config:
 * - lerp: 0.1 (smoothness — lower = smoother/slower)
 * - duration: 1.2 (scroll animation duration)
 * - easing: exponential ease-out
 *
 * WHY THREE SCROLL SYSTEMS COEXIST (not a bug):
 * 1. Lenis — smooth scroll physics (replaces native scroll momentum).
 * 2. GSAP ScrollTrigger — scroll-triggered animations. Lenis feeds it via
 *    `lenis.on('scroll', ScrollTrigger.update)` so both stay in sync.
 * 3. Header native scroll listener — rAF-debounced, only sets a boolean flag
 *    for the compact header style. Minimal overhead, no conflict with Lenis.
 * This is the standard Lenis + GSAP integration pattern. All three systems
 * serve distinct purposes and are designed to work together.
 */
export function LenisProvider({ children }: { children: React.ReactNode }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lenisRef = useRef<any>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let destroyed = false;

    async function init() {
      const [{ default: Lenis }, { gsap }, { ScrollTrigger }] = await Promise.all([
        import('lenis'),
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);

      if (destroyed) return;

      gsap.registerPlugin(ScrollTrigger);

      const lenis = new Lenis({
        lerp: 0.1,
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });

      lenisRef.current = lenis;

      // Integrate with GSAP ScrollTrigger
      lenis.on('scroll', ScrollTrigger.update);

      // Add lenis to GSAP ticker for smooth animation loop
      gsap.ticker.add((time: number) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    }

    init();

    return () => {
      destroyed = true;
      lenisRef.current?.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <>{children}</>;
}
