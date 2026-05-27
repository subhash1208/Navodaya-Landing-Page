'use client';

import { useEffect, useRef } from 'react';

interface CounterStatProps {
  value: string; // e.g. "51+", "3", "100%", "HYD"
  label: string;
}

export function CounterStat({ value, label }: CounterStatProps) {
  const numRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = numRef.current;
    if (!el) return;

    let destroyed = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let trigger: any = null;

    async function init() {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

      if (destroyed || !el) return;

      // Parse numeric part and suffix
      const match = value.match(/^(\d+)(.*)$/);
      if (!match) {
        // Non-numeric (e.g. "HYD") — just fade in with scale
        trigger = ScrollTrigger.create({
          trigger: el,
          start: 'top 85%',
          once: true,
          onEnter: () => {
            gsap.fromTo(
              el,
              { opacity: 0, scale: 0.8 },
              { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.7)' },
            );
          },
        });
        return;
      }

      const endNum = parseInt(match[1], 10);
      const suffix = match[2]; // "+", "%", or ""
      const duration = endNum > 10 ? 1.5 : 0.8;

      const obj = { val: 0 };

      trigger = ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to(obj, {
            val: endNum,
            duration,
            ease: 'power2.out',
            onUpdate: () => {
              el.textContent = Math.round(obj.val) + suffix;
            },
            onComplete: () => {
              el.textContent = value; // Ensure exact final value
            },
          });
        },
      });
    }

    init();

    return () => {
      destroyed = true;
      trigger?.kill();
    };
  }, [value]);

  return (
    <div className="bg-white rounded-[14px] p-5 border border-slate-200 shadow-[0_2px_8px_rgba(15,23,42,0.06)]">
      <div
        ref={numRef}
        className="text-[26px] font-black text-brand-primary mb-1"
        aria-label={value}
      >
        {value}
      </div>
      <div className="text-xs font-medium text-slate-500">{label}</div>
    </div>
  );
}
