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
    iconBg: '#EFF6FF',
    iconColor: '#1E40AF',
  },
  {
    icon: Globe,
    title: 'Global Reach',
    description: 'Strategic import-export operations ensuring reliable supply across markets.',
    iconBg: '#F0F9FF',
    iconColor: '#0EA5E9',
  },
  {
    icon: Handshake,
    title: 'Customer First',
    description: 'Prompt service and a commitment to comfort, cleanliness, and satisfaction.',
    iconBg: '#F0FDF4',
    iconColor: '#16A34A',
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
      className="py-24 bg-white overflow-hidden"
    >
      <div className="container mx-auto">
        {/* Heading block */}
        <div className="text-center mb-16">
          {/* Sweep line */}
          <div ref={lineRef} className="w-16 h-[2px] bg-brand-secondary mx-auto mb-4" />
          <span
            ref={labelRef}
            className="inline-block text-[11px] font-semibold tracking-[0.1em] uppercase text-brand-secondary mb-3 scroll-animate-up"
          >
            Who We Are
          </span>
          <h2
            ref={headingRef}
            id="about-heading"
            className="font-display text-[clamp(1.75rem,3vw,2.5rem)] font-bold text-brand-dark mb-4"
          >
            About {BRAND.NAME}
          </h2>
          <p ref={subRef} className="text-[17px] text-slate-500 max-w-xl mx-auto leading-[1.7]">
            {BRAND.MISSION}
          </p>
        </div>

        {/* Main card */}
        <div
          ref={cardRef}
          className="rounded-[20px] p-8 md:p-12 mb-8 bg-gradient-to-br from-brand-light to-surface-muted border border-blue-100 overflow-hidden scroll-animate-scale"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 items-center">
            <div ref={textColRef} className="scroll-animate-left">
              <h3 className="text-xl font-bold text-brand-dark mb-4">{BRAND.TAGLINE}</h3>
              <p className="text-slate-600 leading-[1.75] mb-4">
                Based in {BRAND.LOCATION}, we are a dedicated supplier of disposable hygiene &amp;
                safety products, hotel room slippers, guest amenities, and spa &amp; salon
                essentials — serving the hospitality and wellness sectors with reliability and care.
              </p>
              <p className="text-slate-600 leading-[1.75]">
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

        {/* Pillars */}
        <div ref={pillarsRef} className="grid grid-cols-1 sm:grid-cols-3 gap-5 scroll-stagger">
          {PILLARS.map(({ icon: Icon, title, description, iconBg, iconColor }) => (
            <div
              key={title}
              className="pillar-card card-hover bg-white rounded-[16px] p-7 border border-slate-200 shadow-[0_4px_20px_rgba(15,23,42,0.06)] h-full scroll-animate-up"
            >
              <div
                className="w-12 h-12 rounded-[12px] flex items-center justify-center mb-5"
                style={{ background: iconBg }}
              >
                <Icon className="w-6 h-6" style={{ color: iconColor }} aria-hidden="true" />
              </div>
              <h3 className="font-bold text-brand-dark mb-2 text-[15px]">{title}</h3>
              <p className="text-[13px] text-slate-500 leading-[1.65]">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
