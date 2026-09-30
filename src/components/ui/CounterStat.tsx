'use client';

import { useEffect, useRef } from 'react';

interface CounterStatProps {
  value: string; // e.g. "50+", "3", "100%", "HYD"
  label: string;
}

export function CounterStat({ value, label }: CounterStatProps) {
  const numRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reduced motion: the server-rendered markup is already the terminal state — final text,
    // opacity 1, identity transform — so returning before anything is created leaves exactly
    // that on screen. Same early-return shape as `AboutSection.tsx:46`.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const el = numRef.current;
    if (!el) return;

    let destroyed = false;
    let tween: gsap.core.Tween | null = null;

    async function init() {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

      if (destroyed || !el) return;

      // Parse numeric part and suffix
      const match = value.match(/^(\d+)(.*)$/);
      if (!match) {
        // Non-numeric (e.g. "HYD") — just fade in with scale. The scrollTrigger config
        // lives inside the tween's own vars (matching AboutSection.tsx/WhyUsSection.tsx),
        // so `tween.scrollTrigger` below is associated with THIS tween and killing it
        // kills both — unlike a bare ScrollTrigger.create() whose onEnter tween is never
        // linked to the trigger it was created from.
        tween = gsap.fromTo(
          el,
          { opacity: 0, scale: 0.8 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.6,
            ease: 'back.out(1.7)',
            scrollTrigger: { trigger: el, start: 'top 85%', once: true },
          },
        );
        return;
      }

      const endNum = parseInt(match[1], 10);
      const suffix = match[2]; // "+", "%", or ""
      const duration = endNum > 10 ? 1.5 : 0.8;

      const obj = { val: 0 };

      tween = gsap.to(obj, {
        val: endNum,
        duration,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        onUpdate: () => {
          el.textContent = Math.round(obj.val) + suffix;
        },
        onComplete: () => {
          el.textContent = value; // Ensure exact final value
        },
      });
    }

    init();

    return () => {
      destroyed = true;
      // Killing the tween's ScrollTrigger (rather than the tween directly) also kills
      // the associated tween by default, stopping any in-flight `onUpdate` write to
      // `el.textContent` from reaching a node that may since have been detached.
      tween?.scrollTrigger?.kill();
    };
  }, [value]);

  return (
    <div className="bg-paper p-5 border border-grey-200 shadow-e1">
      <div ref={numRef} className="text-[26px] font-black text-brand-blue mb-1" aria-label={value}>
        {value}
      </div>
      <div className="text-xs font-medium text-grey-500">{label}</div>
    </div>
  );
}
