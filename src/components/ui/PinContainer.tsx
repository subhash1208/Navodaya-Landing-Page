'use client';

import { useState } from 'react';
import { cn } from '@/utils/cn';

interface PinContainerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * 3D tilt effect on hover — card tilts toward viewer.
 * Adapted from Priyanshu's PinContainer component.
 * Disabled on touch devices.
 */
export function PinContainer({ children, className }: PinContainerProps) {
  const [transform, setTransform] = useState('rotateX(0deg) scale(1)');

  const onMouseEnter = () => {
    setTransform('rotateX(8deg) scale(0.97) translateY(-4px)');
  };

  const onMouseLeave = () => {
    setTransform('rotateX(0deg) scale(1) translateY(0px)');
  };

  return (
    <div
      className={cn('group relative cursor-pointer', className)}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ perspective: '800px' }}
    >
      <div
        style={{
          transform,
          transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          transformStyle: 'preserve-3d',
        }}
      >
        {children}
      </div>
    </div>
  );
}
