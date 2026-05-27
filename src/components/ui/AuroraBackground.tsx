'use client';

import { cn } from '@/utils/cn';

interface AuroraBackgroundProps {
  children?: React.ReactNode;
  className?: string;
}

/**
 * Aurora background effect — animated gradient with mix-blend-difference.
 * Adapted from Priyanshu's portfolio aurora-background.tsx.
 * Designed to sit behind dark hero content.
 */
export function AuroraBackground({ children, className }: AuroraBackgroundProps) {
  return (
    <div className={cn('relative', className)}>
      {/* Aurora layer */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div
          className={cn(
            // Aurora gradient layers
            '[--aurora:repeating-linear-gradient(100deg,#1E40AF_10%,#4F46E5_15%,#0EA5E9_20%,#7C3AED_25%,#1E40AF_30%)]',
            '[--dark-gradient:repeating-linear-gradient(100deg,#000_0%,#000_7%,transparent_10%,transparent_12%,#000_16%)]',
            // Sizing and positioning
            '[background-image:var(--dark-gradient),var(--aurora)]',
            '[background-size:300%,_200%]',
            '[background-position:50%_50%,50%_50%]',
            // Visual treatment
            'filter blur-[10px] invert-0',
            // Pseudo-element for blend effect
            'after:content-[""] after:absolute after:inset-0',
            'after:[background-image:var(--dark-gradient),var(--aurora)]',
            'after:[background-size:200%,_100%]',
            'after:animate-aurora',
            'after:[background-attachment:fixed]',
            'after:mix-blend-difference',
            // Positioning
            'absolute -inset-[10px] opacity-40 will-change-transform',
            // Mask — visible only in top-right area
            '[mask-image:radial-gradient(ellipse_at_80%_20%,black_10%,transparent_70%)]',
          )}
        />
      </div>
      {children}
    </div>
  );
}
