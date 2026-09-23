'use client';

import { useEffect, useLayoutEffect } from 'react';

/**
 * `useLayoutEffect` on the client, `useEffect` on the server.
 *
 * React logs a warning when `useLayoutEffect` is used during server rendering, where it is
 * a no-op. Swapping in `useEffect` there silences the warning without changing behaviour —
 * neither one runs on the server.
 *
 * Reach for this when a component server-renders its *post*-animation state so the HTML is
 * complete for crawlers and no-JS visitors, then needs to wind back to the pre-animation
 * state on the client. `useEffect` runs after paint, so the finished state would flash
 * visibly for a frame before the animation started. `useLayoutEffect` runs before paint, so
 * the wind-back is never rendered.
 *
 * @see src/hooks/useTypewriter.ts and src/components/sections/HeroSection.tsx
 */
export const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;
