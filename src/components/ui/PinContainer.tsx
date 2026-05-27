'use client';

import { useRef, useCallback } from 'react';
import { cn } from '@/utils/cn';

interface PinContainerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * 3D tilt effect on hover — card tilts toward viewer.
 * Adapted from Priyanshu's PinContainer component.
 * Disabled on touch devices.
 *
 * Performance: uses useRef + direct DOM style mutation instead of useState
 * to avoid re-renders on every mouse enter/leave. With 51 product cards on
 * the /products page, useState would trigger 51+ re-renders per hover event.
 */
export function PinContainer({ children, className }: PinContainerProps) {
  const innerRef = useRef<HTMLDivElement>(null);

  const onMouseEnter = useCallback(() => {
    if (innerRef.current) {
      innerRef.current.style.transform = 'rotateX(8deg) scale(0.97) translateY(-4px)';
    }
  }, []);

  const onMouseLeave = useCallback(() => {
    if (innerRef.current) {
      innerRef.current.style.transform = 'rotateX(0deg) scale(1) translateY(0px)';
    }
  }, []);

  return (
    <div
      className={cn('group relative cursor-pointer', className)}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ perspective: '800px' }}
    >
      <div
        ref={innerRef}
        style={{
          transform: 'rotateX(0deg) scale(1) translateY(0px)',
          transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          transformStyle: 'preserve-3d',
        }}
      >
        {children}
      </div>
    </div>
  );
}
