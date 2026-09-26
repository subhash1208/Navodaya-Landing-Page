'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { BRAND, ROUTES, PRODUCT_CATEGORIES, PRODUCTS } from '@/constants';
import { useTypewriter } from '@/hooks/useTypewriter';
import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect';
import { useIntroFinished } from '@/hooks/useIntroFinished';

const HEADLINE_LINE1 = 'Premium Hygiene & Care';
const HEADLINE_LINE2 = 'Solutions for Every Industry';

/**
 * Describes what the specimen plate photograph actually shows. Deliberately not a repeat of the
 * caption below it — same convention as `PLATE_ALT` in `ProductCategoriesSection.tsx:17`.
 */
const PLATE_ALT =
  'A white single-use paper cup photographed at a three-quarter angle on a plain pale ground, printed with the Navodaya logo and wordmark, showing the rolled rim and tapered wall';

export default function HeroSection() {
  // Seeded `true` so the server renders the hero in its FINISHED state — headline, mission
  // copy and both CTAs present and visible in the HTML. These used to start `false` and gate
  // their content behind `{visible && ...}`, which meant the server sent a hero containing
  // no copy and no links at all: invisible to crawlers and to anyone without JS.
  //
  // The layout effect below winds them back to `false` before the first client paint, so the
  // entrance animation is unchanged for everyone running JS.
  const [line2Visible, setLine2Visible] = useState(true);
  const [contentVisible, setContentVisible] = useState(true);
  const [badgeVisible, setBadgeVisible] = useState(true);
  const [plateVisible, setPlateVisible] = useState(true);
  // The two reveal timers below are started from `useTypewriter`'s `onComplete`, which fires
  // from inside the hook's own effect — outside that effect's cleanup closure, so the hook
  // cannot clear them. Unmounting mid-typing used to leave both running.
  const revealTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // False while the first-visit intro overlay is covering the page. Without this the whole
  // entrance sequence — typewriter included — runs and finishes in the first ~1.7s, behind
  // an opaque overlay that does not lift until 4s, and the visitor meets a static hero.
  // Defaults to true outside <LoadingScreen>, so every other route is unaffected.
  const introFinished = useIntroFinished();

  useIsomorphicLayoutEffect(() => {
    // Reduced motion keeps the server-rendered finished state: nothing to animate, so
    // hiding it would only produce a pointless delay before it reappeared.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setLine2Visible(false);
    setContentVisible(false);
    setBadgeVisible(false);
    setPlateVisible(false);
  }, []);

  useEffect(() => {
    const timers = revealTimersRef.current;
    return () => {
      timers.forEach(clearTimeout);
      timers.length = 0;
    };
  }, []);

  useEffect(() => {
    // The badge and the specimen plate have no upstream trigger the way line 2 and the body
    // copy have the typewriter's onComplete, so they re-reveal themselves here once the intro
    // is out of the way. This runs after paint, by which point the layout effect above has
    // already hidden them, so motion animates them in from hidden.
    if (introFinished) {
      setBadgeVisible(true);
      setPlateVisible(true);
    }
  }, [introFinished]);

  const { displayed, showCursor } = useTypewriter({
    text: HEADLINE_LINE1,
    speed: 38,
    startDelay: 300,
    enabled: introFinished,
    onComplete: () => {
      revealTimersRef.current.push(
        setTimeout(() => setLine2Visible(true), 150),
        setTimeout(() => setContentVisible(true), 600),
      );
    },
  });

  return (
    <section
      id="home"
      aria-label="Hero"
      className="relative overflow-hidden bg-ink"
      style={{ minHeight: 'calc(100vh - 4rem)' }}
    >
      {/* 2-column layout: text left (anchored to left), specimen plate right (larger) */}
      <div
        className="relative z-10 w-full flex flex-col md:flex-row items-center px-6 py-12 md:pl-28 md:pr-8 md:py-12"
        style={{ minHeight: 'calc(100vh - 4rem)' }}
      >
        {/* LEFT — Text content */}
        <div
          className="flex flex-col justify-center text-center md:text-left md:pr-6"
          style={{ width: '42%', minWidth: '320px', flexShrink: 0 }}
        >
          {/* Badge */}
          <motion.div
            initial={false}
            animate={badgeVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 font-mono text-label uppercase px-4 py-2 mb-8 border border-brand-cyan/30 text-brand-cyan self-center md:self-start"
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-brand-cyan" />
            Trusted B2B Supplier · Gandhi Nagar, Hyderabad
          </motion.div>

          {/* Headline */}
          <h1
            className="font-black leading-[1.05] tracking-tight mb-2 font-display text-display-3"
            aria-label={`${HEADLINE_LINE1} ${HEADLINE_LINE2}`}
          >
            <span className="block text-paper">
              {displayed}
              {showCursor && (
                <span
                  className="inline-block w-[3px] h-[0.85em] bg-brand-cyan ml-1 align-middle animate-pulse"
                  aria-hidden="true"
                />
              )}
            </span>

            {/* Always mounted, never conditionally rendered: `initial={false}` makes motion
                skip its enter animation and render straight at the `animate` value, so the
                server emits the finished, visible state instead of `opacity: 0`. */}
            <motion.span
              className="block"
              initial={false}
              animate={line2Visible ? { opacity: 1, width: '100%' } : { opacity: 0, width: '0%' }}
              transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
              style={{ overflow: 'hidden', display: 'block' }}
            >
              <span className="inline-block text-brand-cyan">{HEADLINE_LINE2}</span>
            </motion.span>
          </h1>

          {/* Subheadline */}
          <motion.p
            initial={false}
            animate={contentVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
            className="text-base leading-relaxed mb-8 mt-5 max-w-lg text-grey-400"
          >
            {BRAND.MISSION}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={false}
            animate={contentVisible ? { opacity: 1 } : { opacity: 0 }}
            className="flex flex-col sm:flex-row items-center md:items-start justify-center md:justify-start gap-4 mb-10"
          >
            <motion.div
              initial={false}
              animate={contentVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <Link
                href={ROUTES.PRODUCTS}
                className="group inline-flex items-center gap-2.5 font-mono text-label uppercase bg-paper text-ink hover:bg-paper/90 transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-ink px-7 py-3.5 min-h-[48px]"
              >
                Explore Products
                <ArrowRight
                  className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200"
                  aria-hidden="true"
                />
              </Link>
            </motion.div>

            <motion.div
              initial={false}
              animate={contentVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.08 }}
            >
              <Link
                href={ROUTES.CONTACT}
                className="inline-flex items-center gap-2 font-mono text-label uppercase border border-paper/30 text-paper hover:bg-paper/10 transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-ink px-7 py-3.5 min-h-[48px]"
              >
                Get a Quote
              </Link>
            </motion.div>
          </motion.div>

          {/* Trust stats */}
          <motion.div
            initial={false}
            animate={contentVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center self-center md:self-start border border-paper/15"
            style={{ padding: '16px 32px' }}
          >
            {[
              { value: `${PRODUCTS.length}+`, label: 'Products' },
              { value: `${PRODUCT_CATEGORIES.length}`, label: 'Categories' },
              { value: 'B2B', label: 'Focused' },
            ].map(({ value, label }, i) => (
              <div key={label} className="flex items-center">
                <div className="text-center px-6">
                  <div className="text-xl font-black text-paper">{value}</div>
                  <div className="text-[11px] font-medium mt-0.5 text-grey-400">{label}</div>
                </div>
                {i < 2 && <div className="w-px h-7 shrink-0 bg-paper/10" />}
              </div>
            ))}
          </motion.div>
        </div>

        {/* RIGHT — Specimen plate. One photograph, hairline rule, index numeral and caption,
            echoing the category plates in `ProductCategoriesSection`. Static on purpose: this
            replaced a 734-line canvas graph whose 50 product nodes were mouse-only. */}
        <div
          className="relative hidden md:flex items-center justify-center"
          style={{ flex: 1, minHeight: '520px' }}
        >
          <motion.figure
            initial={false}
            animate={plateVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className="w-full max-w-[400px] border border-paper/15 bg-grey-900 p-6"
          >
            <div className="flex items-baseline justify-between gap-4 mb-6">
              <span aria-hidden="true" className="font-mono text-label text-grey-400">
                01
              </span>
              <span className="font-mono text-label uppercase text-grey-400">Specimen</span>
            </div>

            <div className="relative aspect-square overflow-hidden border border-paper/10 bg-ink">
              {/* The panel is `hidden` below 768px, so the `0px` slot keeps mobile browsers
                  from picking a candidate they will never paint. No `priority` — the LCP
                  element here is the <h1>, not this plate. */}
              <Image
                src="/hero/cup-three-quarter.webp"
                alt={PLATE_ALT}
                fill
                sizes="(max-width: 767px) 0px, 400px"
                className="object-cover"
              />
            </div>

            <figcaption className="mt-6 flex items-baseline justify-between gap-4 border-t border-paper/15 pt-5">
              <span className="font-mono text-label uppercase text-paper">Branded Paper Cup</span>
              <span className="font-mono text-data text-grey-400">Hotel Amenities</span>
            </figcaption>
          </motion.figure>
        </div>
      </div>

      {/* Scroll indicator */}
      <a
        href="#about"
        aria-label="Scroll to About section"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-grey-400 transition-colors focus-visible:outline-none focus-visible:ring-2 rounded"
      >
        <span className="text-xs font-medium tracking-widest uppercase">Scroll</span>
        <ChevronDown className="w-4 h-4 animate-bounce" aria-hidden="true" />
      </a>
    </section>
  );
}
