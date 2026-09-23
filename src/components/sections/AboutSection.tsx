'use client';

import { useEffect, useRef } from 'react';
import { Award, Globe, Handshake } from 'lucide-react';
import { BRAND } from '@/constants';
import { CounterStat } from '@/components/ui/CounterStat';

const PILLARS = [
  {
    icon: Award,
    title: 'Quality Assured',
    description:
      'Every product meets international hygiene and safety standards before it reaches you.',
  },
  {
    icon: Globe,
    title: 'Global Reach',
    description: 'Strategic import-export operations ensuring reliable supply across markets.',
  },
  {
    icon: Handshake,
    title: 'Customer First',
    description: 'Prompt service and a commitment to comfort, cleanliness, and satisfaction.',
  },
] as const;

const STATS = [
  { value: '51+', label: 'Products in catalogue' },
  { value: '3', label: 'Product categories' },
  { value: '100%', label: 'B2B focused' },
  { value: 'HYD', label: 'Based in Hyderabad' },
];

export default function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const textColRef = useRef<HTMLDivElement>(null);
  const statsColRef = useRef<HTMLDivElement>(null);
  const pillarsRef = useRef<HTMLDivElement>(null);

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
        // ── 1. Sweep line before heading ──────────────────────────────────
        gsap.fromTo(
          lineRef.current,
          { scaleX: 0, transformOrigin: 'left center' },
          {
            scaleX: 1,
            duration: 0.6,
            ease: 'power3.inOut',
            scrollTrigger: { trigger: labelRef.current, start: 'top 85%', once: true },
          },
        );

        // ── 2. Label fade up ───────────────────────────────────────────────
        if (!hasScrollTimeline) {
          gsap.fromTo(
            labelRef.current,
            { opacity: 0, y: 20 },
            {
              opacity: 1,
              y: 0,
              duration: 0.5,
              delay: 0.3,
              scrollTrigger: { trigger: labelRef.current, start: 'top 85%', once: true },
            },
          );
        }

        // ── 3. Heading — character-by-character slide up + blur (GSAP only — CSS can't do this) ────
        if (headingRef.current) {
          const split = new SplitText(headingRef.current, { type: 'chars,words' });
          gsap.fromTo(
            split.chars,
            { opacity: 0, y: 80, rotationX: -90, filter: 'blur(8px)' },
            {
              opacity: 1,
              y: 0,
              rotationX: 0,
              filter: 'blur(0px)',
              duration: 0.7,
              stagger: 0.025,
              ease: 'back.out(1.4)',
              scrollTrigger: { trigger: headingRef.current, start: 'top 80%', once: true },
              onComplete: () => split.revert(),
            },
          );
        }

        // ── 4. Subheadline word-by-word (GSAP only — CSS can't stagger words) ────
        if (subRef.current) {
          const splitSub = new SplitText(subRef.current, { type: 'words' });
          gsap.fromTo(
            splitSub.words,
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              duration: 0.5,
              stagger: 0.04,
              ease: 'power2.out',
              scrollTrigger: { trigger: subRef.current, start: 'top 82%', once: true },
              onComplete: () => splitSub.revert(),
            },
          );
        }

        // ── 5-7. Card + columns — skip GSAP if CSS scroll-driven handles it ──
        if (!hasScrollTimeline) {
          gsap.fromTo(
            cardRef.current,
            { opacity: 0, y: 100, rotationX: 20, scale: 0.92, transformPerspective: 1000 },
            {
              opacity: 1,
              y: 0,
              rotationX: 0,
              scale: 1,
              duration: 1,
              ease: 'power3.out',
              scrollTrigger: { trigger: cardRef.current, start: 'top 80%', once: true },
            },
          );

          gsap.fromTo(
            textColRef.current,
            { opacity: 0, x: -80 },
            {
              opacity: 1,
              x: 0,
              duration: 0.8,
              delay: 0.2,
              ease: 'power3.out',
              scrollTrigger: { trigger: cardRef.current, start: 'top 80%', once: true },
            },
          );

          gsap.fromTo(
            statsColRef.current,
            { opacity: 0, x: 80 },
            {
              opacity: 1,
              x: 0,
              duration: 0.8,
              delay: 0.3,
              ease: 'power3.out',
              scrollTrigger: { trigger: cardRef.current, start: 'top 80%', once: true },
            },
          );
        }

        // ── 8. Pillar cards — skip GSAP if CSS scroll-driven handles it ───
        if (!hasScrollTimeline) {
          const pillars = pillarsRef.current?.querySelectorAll('.pillar-card');
          if (pillars) {
            gsap.fromTo(
              pillars,
              { opacity: 0, y: 80, rotationY: -25, scale: 0.85, transformPerspective: 800 },
              {
                opacity: 1,
                y: 0,
                rotationY: 0,
                scale: 1,
                duration: 0.8,
                stagger: 0.15,
                ease: 'back.out(1.2)',
                scrollTrigger: { trigger: pillarsRef.current, start: 'top 80%', once: true },
              },
            );
          }
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
      id="about"
      aria-labelledby="about-heading"
      className="py-24 bg-paper overflow-hidden"
    >
      <div className="container mx-auto">
        {/* Section rule — draws in from the left */}
        <div ref={lineRef} className="h-px w-full bg-grey-200" aria-hidden="true" />

        {/* Asymmetric editorial split — title hard left, mission offset right and lower */}
        <div className="grid grid-cols-1 gap-8 pt-8 mb-16 md:grid-cols-12 md:gap-12">
          <div className="md:col-span-5">
            <span aria-hidden="true" className="font-mono text-label text-grey-300">
              01
            </span>
            <span
              ref={labelRef}
              className="block mt-5 font-mono text-label uppercase text-grey-500 scroll-animate-up"
            >
              Who We Are
            </span>
            <h2
              ref={headingRef}
              id="about-heading"
              className="mt-3 font-display text-heading-1 text-ink"
            >
              About {BRAND.NAME}
            </h2>
          </div>
          <div className="md:col-span-6 md:col-start-7 md:pt-16">
            <p ref={subRef} className="text-body-lg text-grey-600">
              {BRAND.MISSION}
            </p>
          </div>
        </div>

        {/* Main specimen panel */}
        <div
          ref={cardRef}
          className="p-8 md:p-12 bg-grey-50 border border-grey-200 shadow-e0 overflow-hidden scroll-animate-scale"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 items-center">
            <div ref={textColRef} className="scroll-animate-left">
              <h3 className="text-heading-2 text-ink mb-4">{BRAND.TAGLINE}</h3>
              <p className="text-body text-grey-600 mb-4">
                Based in {BRAND.LOCATION}, we are a dedicated supplier of disposable hygiene &amp;
                safety products, hotel room slippers, guest amenities, and spa &amp; salon
                essentials — serving the hospitality and wellness sectors with reliability and care.
              </p>
              <p className="text-body text-grey-600">
                Our approach is simple: understand what businesses need, source the best products,
                and deliver them promptly. Every order is backed by our commitment to quality and
                customer satisfaction.
              </p>
            </div>
            <div ref={statsColRef} className="grid grid-cols-2 gap-4 scroll-animate-right">
              {STATS.map(({ value, label }) => (
                <CounterStat key={label} value={value} label={label} />
              ))}
            </div>
          </div>
        </div>

        {/* Pillars — flat 3-up, hairline separated */}
        <div
          ref={pillarsRef}
          className="mt-16 grid grid-cols-1 sm:grid-cols-3 border-t border-grey-200 scroll-stagger"
        >
          {PILLARS.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="pillar-card py-8 border-b border-grey-100 sm:border-b-0 sm:border-l sm:border-grey-100 sm:px-8 sm:first:border-l-0 sm:first:pl-0 scroll-animate-up"
            >
              <Icon className="w-5 h-5 text-grey-400 mb-5" aria-hidden="true" />
              <h3 className="text-heading-2 text-ink mb-2">{title}</h3>
              <p className="text-body-sm text-grey-600">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
