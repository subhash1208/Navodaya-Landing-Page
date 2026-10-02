'use client';

import { useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, BookOpen } from 'lucide-react';
import { PRODUCT_CATEGORIES, PRODUCT_COUNT_BY_CATEGORY, ROUTES } from '@/constants';
import { CATEGORY_RULE } from '@/constants/categoryRule';
import { AnimateIn } from '@/components/ui/AnimateIn';
import { cn } from '@/utils/cn';
import type { CategorySlug } from '@/types';

/**
 * Describes what each specimen plate photograph actually shows. Deliberately not the category
 * name — the adjacent <h3> already announces that, so repeating it here would be noise.
 */
const PLATE_ALT: Record<CategorySlug, string> = {
  'hygiene-safety-housekeeping':
    'Four sheets of white medical-grade non-woven fabric fanned out in overlapping layers, showing the fibrous surface and clean-cut edges',
  'hotel-amenities':
    'A folded white terry cloth towel resting on a second towel over pale card, showing the looped pile and woven border',
  'spa-salon':
    'A sheet of soft grey non-woven fabric draped into deep, even waves under raking light',
  // `protective-packing` has no plate photographed yet and renders a typographic tile instead,
  // so this string is never passed to an <img alt>. Kept because the Record is exhaustive by
  // type: dropping the key would be a compile error, and an empty string would read as a
  // deliberate "decorative" marker rather than "not shot yet".
  'protective-packing':
    'A roll of clear protective packing film beside sheets of bubble wrap and foam',
};

// One entry per card ref below, indexed by position. The two arrays are the same length on
// purpose: `cards` is built from `cardRefs`, so `i` can never run past the last origin.
const CARD_ORIGINS = [
  { x: -100, y: 0 },
  { x: -40, y: 60 },
  { x: 40, y: 60 },
  { x: 100, y: 0 },
] as const;

export default function ProductCategoriesSection() {
  const cardsRef = useRef<HTMLDivElement>(null);
  const card0 = useRef<HTMLDivElement>(null);
  const card1 = useRef<HTMLDivElement>(null);
  const card2 = useRef<HTMLDivElement>(null);
  const card3 = useRef<HTMLDivElement>(null);
  const cardRefs = useMemo(() => [card0, card1, card2, card3], [card0, card1, card2, card3]);

  useEffect(() => {
    const cardsContainer = cardsRef.current;
    if (!cardsContainer) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let destroyed = false;
    let ctx: gsap.Context | null = null;

    async function init() {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

      if (destroyed || !cardsContainer) return;

      const cards = cardRefs.map((r) => r.current).filter(Boolean) as HTMLElement[];

      // Staggered scroll-triggered reveal — NO pin (avoids React DOM conflict). The
      // scrollTrigger config lives inside each tween's own vars (matching AboutSection.tsx
      // and WhyUsSection.tsx) so the trigger and the tween it drives are one associated
      // unit, and creating them inside gsap.context() records both for ctx.revert() to
      // kill together in cleanup.
      ctx = gsap.context(() => {
        cards.forEach((card, i) => {
          const origin = CARD_ORIGINS[i];
          gsap.fromTo(
            card,
            { opacity: 0, x: origin.x, y: origin.y },
            {
              opacity: 1,
              x: 0,
              y: 0,
              duration: 0.7,
              delay: i * 0.15,
              ease: 'power3.out',
              scrollTrigger: { trigger: cardsContainer, start: 'top 75%', once: true },
            },
          );
        });
      }, cardsContainer);
    }

    init();

    return () => {
      destroyed = true;
      ctx?.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section id="products" aria-labelledby="products-heading" className="py-24 bg-grey-50">
      <div className="container mx-auto">
        <AnimateIn direction="up">
          {/* Specimen-table header — index, title, right-aligned count */}
          <div className="border-t border-grey-200 pt-8 mb-12">
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <div className="flex items-baseline gap-5">
                <div>
                  <span className="block font-mono text-label uppercase text-grey-500">
                    What We Supply
                  </span>
                  <h2
                    id="products-heading"
                    className="mt-3 font-display text-heading-1 text-brand-blue"
                  >
                    Our Product Categories
                  </h2>
                </div>
              </div>
              <span className="font-mono text-data text-grey-500">
                {PRODUCT_CATEGORIES.length} categories
              </span>
            </div>
            <p className="mt-6 max-w-xl text-body-lg text-grey-600">
              {PRODUCT_CATEGORIES.length} focused ranges covering every hygiene and care need across
              industries.
            </p>
          </div>
        </AnimateIn>

        {/*
          Two-up from `sm` and four-up from `xl`, rather than the three-up this grid carried when
          the catalogue had three categories. A hard `sm:grid-cols-3` would have left the fourth
          card alone on its own row at every width; redesigning the section is a later task, so
          this is the minimum change that seats four cards evenly.
        */}
        <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
          {PRODUCT_CATEGORIES.map((category, i) => (
            <div key={category.id} ref={cardRefs[i]}>
              <div className="relative flex h-full flex-col border border-grey-200 bg-paper p-8 shadow-e0 transition-shadow duration-200 hover:shadow-e1">
                <div
                  className={cn(
                    'absolute top-0 left-0 right-0 h-[2px]',
                    CATEGORY_RULE[category.slug],
                  )}
                  aria-hidden="true"
                />
                {/*
                  `category.plate` is optional: `protective-packing` has no specimen plate
                  photographed yet, so it falls back to a typographic tile at the SAME aspect
                  ratio and border so the row stays level. A real plate later is a data change
                  in `categories.ts`, not a change here.
                */}
                <div className="relative mb-6 aspect-[4/5] overflow-hidden border border-grey-200 bg-grey-50">
                  {category.plate ? (
                    <Image
                      src={category.plate}
                      alt={PLATE_ALT[category.slug]}
                      fill
                      sizes="(min-width: 1280px) 288px, (min-width: 640px) 45vw, calc(100vw - 7rem)"
                      className="object-cover"
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 flex items-center justify-center bg-brand-blue px-4 text-center font-mono text-label uppercase tracking-wider text-paper"
                    >
                      {category.name}
                    </span>
                  )}
                </div>
                {/*
                  Count above the name, on its own line, rather than beside it. The two previously
                  shared one `justify-between` row with `shrink-0` on the count — and an <h3>
                  cannot shrink below its longest word, so `Hygiene, Safety & Housekeeping` held
                  `Housekeeping` at full width in a four-up column and pushed `133 products`
                  clean out past the card border. Stacking cannot overflow at any column width,
                  and matches the label-above-title pattern the section header already uses.
                */}
                <div className="mb-3">
                  <span className="block font-mono text-data text-grey-500">
                    {PRODUCT_COUNT_BY_CATEGORY[category.slug]} products
                  </span>
                  <h3 className="mt-2 text-heading-2 text-ink">{category.name}</h3>
                </div>
                <p className="text-body text-grey-600 mb-7 flex-1">{category.description}</p>
                <Link
                  href={`${ROUTES.PRODUCTS}?category=${category.slug}`}
                  className="inline-flex items-center gap-2 font-mono text-label uppercase text-ink hover:gap-3 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
                >
                  Browse Products
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <AnimateIn direction="up" delay={0.2}>
          <div className="border-t border-grey-200 pt-8">
            <Link
              href={ROUTES.PRODUCTS}
              className="inline-flex items-center gap-2.5 px-8 py-3.5 font-mono text-label uppercase text-ink border border-ink bg-transparent hover:bg-brand-blue hover:text-paper transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 min-h-[48px]"
              data-cursor-invert
            >
              <BookOpen className="w-4 h-4" aria-hidden="true" />
              View Full Product Catalogue
            </Link>
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}
