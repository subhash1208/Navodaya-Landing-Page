'use client';

import { useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';
import { PRODUCT_CATEGORIES, ROUTES } from '@/constants';
import { CATEGORY_RULE } from '@/constants/categoryRule';
import { AnimateIn } from '@/components/ui/AnimateIn';
import { cn } from '@/utils/cn';

const CARD_ORIGINS = [
  { x: -100, y: 0 },
  { x: 0, y: 60 },
  { x: 100, y: 0 },
] as const;

export default function ProductCategoriesSection() {
  const cardsRef = useRef<HTMLDivElement>(null);
  const card0 = useRef<HTMLDivElement>(null);
  const card1 = useRef<HTMLDivElement>(null);
  const card2 = useRef<HTMLDivElement>(null);
  const cardRefs = useMemo(() => [card0, card1, card2], [card0, card1, card2]);

  useEffect(() => {
    const cardsContainer = cardsRef.current;
    if (!cardsContainer) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let destroyed = false;
    const triggers: { kill: () => void }[] = [];

    async function init() {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

      if (destroyed) return;

      const cards = cardRefs.map((r) => r.current).filter(Boolean) as HTMLElement[];

      // Set initial hidden state
      cards.forEach((card, i) => {
        gsap.set(card, { opacity: 0, x: CARD_ORIGINS[i].x, y: CARD_ORIGINS[i].y });
      });

      // Staggered scroll-triggered reveal — NO pin (avoids React DOM conflict)
      cards.forEach((card, i) => {
        const st = ScrollTrigger.create({
          trigger: cardsContainer,
          start: 'top 75%',
          once: true,
          onEnter: () => {
            gsap.to(card, {
              opacity: 1,
              x: 0,
              y: 0,
              duration: 0.7,
              delay: i * 0.15,
              ease: 'power3.out',
            });
          },
        });
        triggers.push(st);
      });
    }

    init();

    return () => {
      destroyed = true;
      triggers.forEach((t) => t.kill());
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
                <span aria-hidden="true" className="font-mono text-label text-grey-300">
                  02
                </span>
                <div>
                  <span className="block font-mono text-label uppercase text-grey-500">
                    What We Supply
                  </span>
                  <h2 id="products-heading" className="mt-3 font-display text-heading-1 text-ink">
                    Our Product Categories
                  </h2>
                </div>
              </div>
              <span className="font-mono text-data text-grey-500">
                {PRODUCT_CATEGORIES.length} categories
              </span>
            </div>
            <p className="mt-6 max-w-xl text-body-lg text-grey-600">
              Three focused ranges covering every hygiene and care need across industries.
            </p>
          </div>
        </AnimateIn>

        <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
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
                <div className="text-3xl mb-6 leading-none" role="img" aria-label={category.name}>
                  {category.icon}
                </div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="text-heading-2 text-ink">{category.name}</h3>
                  <span className="shrink-0 pt-1 font-mono text-data text-grey-500">
                    {category.productCount} products
                  </span>
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
              className="inline-flex items-center gap-2.5 px-8 py-3.5 font-mono text-label uppercase text-ink border border-ink bg-transparent hover:bg-ink hover:text-paper transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 min-h-[48px]"
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
