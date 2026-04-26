'use client';

import { useMagneticHover } from '@/hooks/useMagneticHover';

interface MagneticWrapperProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Wraps any element with a magnetic hover effect.
 * The element pulls toward the cursor when nearby.
 * Automatically disabled on touch devices.
 */
export function MagneticWrapper({ children, className }: MagneticWrapperProps) {
  const ref = useMagneticHover<HTMLDivElement>(0.25);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
