'use client';

import { useEffect, useRef } from 'react';

interface HoverEffectCardProps {
  image1: string;
  image2: string;
  displacementImage?: string;
  children?: React.ReactNode;
  className?: string;
}

/**
 * WebGL hover distortion effect on images.
 * Adapted from Adeola's hover-effect implementation.
 * Only activates when real images are provided (not placeholders).
 * Requires: npm install hover-effect
 */
export function HoverEffectCard({
  image1,
  image2,
  displacementImage = '/displacement.jpg',
  children,
  className,
}: HoverEffectCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Only activate if real images are provided
    if (!image1 || !image2 || image1.includes('placeholder')) return;

    let effect: { destroy?: () => void } | null = null;

    const init = async () => {
      try {
        const HoverEffect = (await import('hover-effect')).default;
        effect = new HoverEffect({
          parent: el,
          intensity: 0.3,
          image1,
          image2,
          displacementImage,
          speedIn: 1.4,
          speedOut: 1.4,
          easing: 'Expo.easeInOut',
        });
      } catch {
        // hover-effect not available or images failed — silent fallback
      }
    };

    init();

    return () => {
      if (effect?.destroy) effect.destroy();
    };
  }, [image1, image2, displacementImage]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
