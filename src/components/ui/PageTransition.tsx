'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Blue curtain wipe transition — triggers only on Home → Products navigation.
 * The curtain slides in from left, then slides out to right.
 * Total duration: ~0.8s.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const curtainRef = useRef<HTMLDivElement>(null);
  const prevPathRef = useRef<string>(pathname);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const curtain = curtainRef.current;
    if (!curtain) return;

    const prev = prevPathRef.current;
    const curr = pathname;
    prevPathRef.current = curr;

    // Only animate on Home → Products transition
    const shouldAnimate =
      (prev === '/' && curr === '/products') || (prev === '/products' && curr === '/');

    if (!shouldAnimate || prev === curr) return;

    // Respect prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    setIsAnimating(true);

    // A navigation faster than the ~0.8s chain used to leave the previous chain's nested
    // `onComplete` callbacks pending. Both called `setIsAnimating` and `gsap.set`, so the
    // curtain's resting position and its `pointerEvents` were decided by whichever orphaned
    // chain resolved last rather than by the current navigation.
    let destroyed = false;
    let ctx: gsap.Context | null = null;

    // Dynamic import — GSAP is not needed until a transition actually fires. The `await` is
    // why `destroyed` exists: unmount inside that window runs cleanup while `ctx` is still
    // null, so `ctx?.revert()` no-ops and an unguarded context would never be reverted.
    async function init() {
      const { gsap } = await import('gsap');
      if (destroyed) return;

      ctx = gsap.context(() => {
        // Curtain slides in from left
        gsap.fromTo(
          curtain,
          { x: '-100%', opacity: 1 },
          {
            x: '0%',
            duration: 0.35,
            ease: 'power2.inOut',
            onComplete: () => {
              if (destroyed) return;
              // Curtain slides out to right
              gsap.to(curtain, {
                x: '100%',
                duration: 0.35,
                ease: 'power2.inOut',
                onComplete: () => {
                  if (destroyed) return;
                  gsap.set(curtain, { x: '-100%' });
                  setIsAnimating(false);
                },
              });
            },
          },
        );
      });
    }
    void init();

    return () => {
      destroyed = true;
      ctx?.revert();
      // Without this an interrupted chain never reaches its final `setIsAnimating(false)` and
      // the curtain keeps `pointerEvents: 'all'`, swallowing every click on the new page.
      setIsAnimating(false);
    };
  }, [pathname]);

  return (
    <>
      {/* Curtain overlay */}
      <div
        ref={curtainRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9998,
          background: '#0A0B0D',
          transform: 'translateX(-100%)',
          pointerEvents: isAnimating ? 'all' : 'none',
        }}
      />
      {children}
    </>
  );
}
