'use client';

import { useEffect, useRef } from 'react';
import { ShieldCheck, Truck, Users, Leaf } from 'lucide-react';

const REASONS = [
  {
    icon: ShieldCheck,
    title: 'Uncompromising Quality',
    description:
      'Every product is sourced and verified to meet international hygiene and safety standards. No shortcuts.',
    iconBg: '#EFF6FF',
    iconColor: '#1E40AF',
    accent: '#1E40AF',
  },
  {
    icon: Truck,
    title: 'Prompt Delivery',
    description:
      'We understand that your operations depend on timely supply. We deliver on schedule, every time.',
    iconBg: '#F0F9FF',
    iconColor: '#0EA5E9',
    accent: '#0EA5E9',
  },
  {
    icon: Users,
    title: 'B2B Expertise',
    description:
      'We work exclusively with businesses — hotels, hospitals, spas, and industries. We speak your language.',
    iconBg: '#F5F3FF',
    iconColor: '#7C3AED',
    accent: '#7C3AED',
  },
  {
    icon: Leaf,
    title: 'Eco-Conscious Options',
    description:
      'Biodegradable shower caps, jute products, and sustainable alternatives available across our range.',
    iconBg: '#F0FDF4',
    iconColor: '#16A34A',
    accent: '#16A34A',
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
              letterSpacing: '0.1em',
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

        // ── 4. Cards — skip GSAP if CSS handles it ────────────────────────
        if (!hasScrollTimeline) {
          const cards = cardsRef.current?.querySelectorAll('.why-card');
          if (cards) {
            gsap.fromTo(
              cards,
              {
                opacity: 0,
                y: 120,
                rotationX: 30,
                rotationZ: (i) => (i % 2 === 0 ? -8 : 8),
                scale: 0.8,
                transformPerspective: 1000,
              },
              {
                opacity: 1,
                y: 0,
                rotationX: 0,
                rotationZ: 0,
                scale: 1,
                duration: 0.9,
                stagger: 0.12,
                ease: 'back.out(1.3)',
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
      className="py-24 bg-white overflow-hidden"
    >
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <span
            ref={labelRef}
            className="inline-block text-[11px] font-semibold tracking-[0.1em] uppercase text-brand-secondary mb-3 scroll-animate-up"
          >
            Why Navodaya
          </span>
          <h2
            ref={headingRef}
            id="why-us-heading"
            className="font-display text-[clamp(1.75rem,3vw,2.5rem)] font-bold text-brand-dark mb-4"
          >
            Why Businesses Choose Us
          </h2>
          <p ref={subRef} className="text-[17px] text-slate-500 max-w-lg mx-auto scroll-animate-up">
            We&apos;re not just a supplier — we&apos;re a partner committed to your operations.
          </p>
        </div>

        <div
          ref={cardsRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 scroll-stagger"
        >
          {REASONS.map(({ icon: Icon, title, description, iconBg, iconColor, accent }) => (
            <div
              key={title}
              className="why-card card-hover-feature bg-surface-muted rounded-[16px] p-7 border border-slate-200 h-full scroll-animate-up"
            >
              <div
                className="why-icon w-12 h-12 rounded-[12px] flex items-center justify-center mb-5"
                style={{ background: iconBg }}
              >
                <Icon className="w-6 h-6" style={{ color: iconColor }} aria-hidden="true" />
              </div>
              <div
                className="accent-bar w-full h-[3px] rounded-full mb-4"
                style={{ background: accent }}
              />
              <h3 className="font-bold text-brand-dark mb-2 text-[15px]">{title}</h3>
              <p className="text-[13px] text-slate-500 leading-[1.65]">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
