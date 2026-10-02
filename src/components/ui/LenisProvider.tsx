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
    let tickerFn: ((time: number) => void) | null = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let gsapRef: any = null;

    async function init() {
      const [{ default: Lenis }, { gsap }, { ScrollTrigger }] = await Promise.all([
        import('lenis'),
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);

      if (destroyed) return;

      gsap.registerPlugin(ScrollTrigger);
      gsapRef = gsap;

      const lenis = new Lenis({
        lerp: 0.1,
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        // Abandon in-flight wheel momentum when a link to a DIFFERENT pathname is clicked.
        //
        // Lenis keeps `targetScroll`/`animatedScroll` in its own state, independent of the DOM, and
        // its raf loop runs off the GSAP ticker above — a separate loop from the App Router's
        // scroll reset. A programmatic write Lenis did not make is adopted only through the async
        // native `scroll` event, which it ignores while it is itself animating. So a glide that is
        // still unwinding when a route change commits survives the navigation and reasserts its
        // stale target the frame AFTER `htmlElement.scrollTop = 0`, clamped to the new page's
        // maximum — landing the visitor at the bottom of the page they just opened.
        //
        // This option (lenis 1.3.23, `lenis.mjs:546-551`) resets the instance from Lenis's own
        // click listener, at click time, before the navigation commits. It fires only for a click
        // whose composed path holds an `<a href>` on the SAME host with a DIFFERENT pathname, so
        // in-page hash anchors (`/#about`, `/#contact`, the skip link) and external links are
        // untouched. Covered by "Scroll restoration when clicked mid-glide" in
        // e2e/scroll-restoration.spec.ts; do not remove without reading FAULT C there.
        stopInertiaOnNavigate: true,
      });

      lenisRef.current = lenis;

      // Integrate with GSAP ScrollTrigger
      lenis.on('scroll', ScrollTrigger.update);

      // Add lenis to GSAP ticker for smooth animation loop
      tickerFn = (time: number) => {
        lenis.raf(time * 1000);
      };
      gsap.ticker.add(tickerFn);
      gsap.ticker.lagSmoothing(0);
    }

    init();

    return () => {
      destroyed = true;
      if (tickerFn && gsapRef) {
        gsapRef.ticker.remove(tickerFn);
      }
      lenisRef.current?.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <>{children}</>;
}
