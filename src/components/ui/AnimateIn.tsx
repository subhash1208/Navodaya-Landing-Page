'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect';

/** Spring-like cubic bezier. Typed as a 4-tuple so it satisfies motion's `BezierDefinition`. */
const SPRING_EASE: [number, number, number, number] = [0.34, 1.06, 0.64, 1];

interface AnimateInProps {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Reusable scroll-triggered entrance animation wrapper.
 * Uses Motion (formerly Framer Motion) with whileInView.
 * Respects prefers-reduced-motion automatically via Motion.
 */
export function AnimateIn({
  children,
  delay = 0,
  direction = 'up',
  className,
  style,
}: AnimateInProps) {
  const offsets = {
    up: { y: 40, x: 0 },
    down: { y: -40, x: 0 },
    left: { y: 0, x: 40 },
    right: { y: 0, x: -40 },
    none: { y: 0, x: 0 },
  };

  const { x, y } = offsets[direction];

  // Seeded `false` so the server renders the FINISHED state. `initial={false}` makes motion
  // emit the `animate` target into the inline style during server render instead of `initial`,
  // so the HTML ships visible content. This used to be `initial={{ opacity: 0, x, y }}`, which
  // serialised to `style="opacity:0"` — real copy that a crawler or a no-JS visitor could not
  // see, and the heading, description and CTA of ProductCategoriesSection were all inside it.
  //
  // The layout effect below winds it back to hidden before the first client paint, so the
  // scroll reveal is unchanged for everyone running JS.
  const [hidden, setHidden] = useState(false);

  useIsomorphicLayoutEffect(() => {
    // Reduced motion keeps the server-rendered visible state. There is no reveal to play, so
    // hiding here would leave content waiting on a gesture animation nobody wants.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setHidden(true);
  }, []);

  return (
    <motion.div
      initial={false}
      // The wind-back is instant; only the `whileInView` reveal is animated. `whileInView`
      // outranks `animate`, so carrying each target's own transition keeps the two apart.
      animate={
        hidden
          ? { opacity: 0, x, y, transition: { duration: 0 } }
          : { opacity: 1, x: 0, y: 0, transition: { duration: 0 } }
      }
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
        transition: { duration: 0.6, delay, ease: SPRING_EASE },
      }}
      viewport={{ once: true, margin: '-60px' }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

/**
 * Staggered children — wraps a list and staggers each child's entrance.
 */
interface StaggerProps {
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function Stagger({ children, staggerDelay = 0.1, className, style }: StaggerProps) {
  // The same SSR defence as `AnimateIn` above, in its variant-based form. This used to be
  // `initial="hidden"`, which made motion resolve each child's `hidden` variant —
  // `{ opacity: 0, y: 32 }` — into that child's inline style during server render, so every
  // staggered item shipped `style="opacity:0;transform:translateY(32px)"`. `initial={false}`
  // blocks the initial animation, and motion then seeds from `animate` instead, which holds the
  // visible label until the layout effect below winds it back before the first client paint.
  //
  // `initial` and `animate` propagate to the children through motion's variant context, so
  // `StaggerItem` needs no state of its own.
  const [hidden, setHidden] = useState(false);

  useIsomorphicLayoutEffect(() => {
    // Reduced motion keeps the server-rendered visible state — there is no reveal to play.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setHidden(true);
  }, []);

  return (
    <motion.div
      initial={false}
      animate={hidden ? 'hidden' : 'visible'}
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: staggerDelay } },
      }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <motion.div
      variants={{
        // The wind-back to `hidden` must be instant — only the in-view reveal is animated. A
        // single shared duration would drag the wind-back out over half a second, which a
        // visitor would see as content fading *out* after the page loaded.
        hidden: { opacity: 0, y: 32, transition: { duration: 0 } },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: SPRING_EASE } },
      }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}
