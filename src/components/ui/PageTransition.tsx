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

    // Only animate on Home → Products transition
    const shouldAnimate =
      (prev === '/' && curr === '/products') || (prev === '/products' && curr === '/');

    if (shouldAnimate && prev !== curr) {
      // Respect prefers-reduced-motion
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        prevPathRef.current = curr;
        return;
      }

      setIsAnimating(true);

      // Dynamic import — GSAP is not needed until a transition actually fires
      import('gsap').then(({ gsap }) => {
        // Curtain slides in from left
        gsap.fromTo(
          curtain,
          { x: '-100%', opacity: 1 },
          {
            x: '0%',
            duration: 0.35,
            ease: 'power2.inOut',
            onComplete: () => {
              // Curtain slides out to right
              gsap.to(curtain, {
                x: '100%',
                duration: 0.35,
                ease: 'power2.inOut',
                onComplete: () => {
                  gsap.set(curtain, { x: '-100%' });
                  setIsAnimating(false);
                },
              });
            },
          },
        );
      });
    }

    prevPathRef.current = curr;
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
          background: 'linear-gradient(135deg, #1E40AF, #1D4ED8)',
          transform: 'translateX(-100%)',
          pointerEvents: isAnimating ? 'all' : 'none',
        }}
      />
      {children}
    </>
  );
}
