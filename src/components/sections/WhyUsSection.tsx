'use client';

import { useEffect, useRef } from 'react';
import { ShieldCheck, Truck, Users, Leaf } from 'lucide-react';

const REASONS = [
  {
    icon: ShieldCheck,
    title: 'Uncompromising Quality',
    description:
      'Every product is sourced and verified to meet international hygiene and safety standards. No shortcuts.',
  },
  {
    icon: Truck,
    title: 'Prompt Delivery',
    description:
      'We understand that your operations depend on timely supply. We deliver on schedule, every time.',
  },
  {
    icon: Users,
    title: 'B2B Expertise',
    description:
      'We work exclusively with businesses — hotels, hospitals, spas, and industries. We speak your language.',
  },
  {
    icon: Leaf,
    title: 'Eco-Conscious Options',
    description:
      'Biodegradable shower caps, jute products, and sustainable alternatives available across our range.',
  },
] as const;

export default function WhyUsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let destroyed = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let ctx: any = null;

    async function init() {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      const { SplitText } = await import('gsap/SplitText');
      gsap.registerPlugin(ScrollTrigger, SplitText);

      if (destroyed) return;

      // Check if browser supports CSS scroll-driven animations
      const hasScrollTimeline = CSS.supports('animation-timeline', 'view()');

      ctx = gsap.context(() => {
        // ── 1. Label — skip GSAP if CSS handles it ────────────────────────
        if (!hasScrollTimeline) {
          gsap.fromTo(
            labelRef.current,
            { opacity: 0, letterSpacing: '0.4em', y: 20 },
            {
              opacity: 1,
              letterSpacing: '0.12em',
              y: 0,
              duration: 0.7,
              ease: 'power3.out',
              scrollTrigger: { trigger: labelRef.current, start: 'top 85%', once: true },
            },
          );
        }

        // ── 2. Heading — GSAP only (SplitText word-by-word with skewY + blur, CSS can't do this) ──
        if (headingRef.current) {
          const split = new SplitText(headingRef.current, { type: 'words,chars' });
          gsap.fromTo(
            split.words,
            { opacity: 0, y: 100, skewY: 8 },
            {
              opacity: 1,
              y: 0,
              skewY: 0,
              duration: 0.8,
              stagger: 0.08,
              ease: 'power4.out',
              scrollTrigger: { trigger: headingRef.current, start: 'top 80%', once: true },
              onComplete: () => split.revert(),
            },
          );
        }

        // ── 3. Subheadline — skip GSAP if CSS handles it ──────────────────
        if (!hasScrollTimeline) {
          gsap.fromTo(
            subRef.current,
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              delay: 0.4,
              ease: 'power2.out',
              scrollTrigger: { trigger: subRef.current, start: 'top 82%', once: true },
            },
          );
        }

        // ── 4. Rows — skip GSAP if CSS handles it ─────────────────────────
        if (!hasScrollTimeline) {
          const cards = cardsRef.current?.querySelectorAll('.why-card');
          if (cards) {
            gsap.fromTo(
              cards,
              { opacity: 0, y: 40 },
              {
                opacity: 1,
                y: 0,
                duration: 0.7,
                stagger: 0.1,
                ease: 'power3.out',
                scrollTrigger: { trigger: cardsRef.current, start: 'top 78%', once: true },
              },
            );
          }
        }

        // ── 5. Icon spin-in — GSAP only (CSS can't do rotation: -180 → 0 on scroll) ──
        const icons = cardsRef.current?.querySelectorAll('.why-icon');
        if (icons) {
          gsap.fromTo(
            icons,
            { scale: 0, rotation: -180, opacity: 0 },
            {
              scale: 1,
              rotation: 0,
              opacity: 1,
              duration: 0.6,
              stagger: 0.12,
              ease: 'back.out(2)',
              delay: 0.3,
              scrollTrigger: { trigger: cardsRef.current, start: 'top 78%', once: true },
            },
          );
        }

        // ── 6. Accent bars draw — GSAP only (scaleX animation tied to scroll trigger) ──
        const bars = cardsRef.current?.querySelectorAll('.accent-bar');
        if (bars) {
          gsap.fromTo(
            bars,
            { scaleX: 0, transformOrigin: 'left center' },
            {
              scaleX: 1,
              duration: 0.8,
              stagger: 0.12,
              ease: 'power3.inOut',
              delay: 0.5,
              scrollTrigger: { trigger: cardsRef.current, start: 'top 78%', once: true },
            },
          );
        }
      }, sectionRef);
    }

    init();

    return () => {
      destroyed = true;
      ctx?.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="why-us"
      aria-labelledby="why-us-heading"
      className="py-24 bg-paper overflow-hidden"
    >
      <div className="container mx-auto">
        {/* Specification list — the title is the list's header row, not a block above it */}
        <div className="border-t border-grey-200">
          <div className="flex flex-col gap-4 py-8 md:flex-row md:items-baseline md:justify-between">
            <div className="flex items-baseline gap-5">
              <span aria-hidden="true" className="font-mono text-label text-grey-500">
                03
              </span>
              <h2
                ref={headingRef}
                id="why-us-heading"
                className="font-display text-heading-1 text-ink"
              >
                Why Businesses Choose Us
              </h2>
            </div>
            <span
              ref={labelRef}
              className="font-mono text-label uppercase text-grey-500 scroll-animate-up"
            >
              Why Navodaya
            </span>
          </div>

          <p ref={subRef} className="max-w-xl pb-8 text-body-lg text-grey-600 scroll-animate-up">
            We&apos;re not just a supplier — we&apos;re a partner committed to your operations.
          </p>

          <div ref={cardsRef} className="scroll-stagger">
            {REASONS.map(({ icon: Icon, title, description }, i) => (
              <div
                key={title}
                className="why-card grid grid-cols-[2.5rem_1fr] items-start gap-x-5 border-t border-grey-100 py-8 scroll-animate-up"
              >
                <span aria-hidden="true" className="pt-1 font-mono text-label text-grey-500">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <div className="flex items-center gap-3">
                    <Icon className="why-icon w-4 h-4 text-grey-400" aria-hidden="true" />
                    <h3 className="text-heading-2 text-ink">{title}</h3>
                  </div>
                  <div className="accent-bar my-4 h-px w-full bg-grey-100" aria-hidden="true" />
                  <p className="max-w-2xl text-body text-grey-600">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
