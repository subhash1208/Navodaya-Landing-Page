'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PRODUCT_CATEGORIES, ROUTES } from '@/constants';
import { AnimateIn } from '@/components/ui/AnimateIn';

gsap.registerPlugin(ScrollTrigger);

const CARD_ORIGINS = [
  { x: -100, y: 0 },
  { x: 0,    y: 60 },
  { x: 100,  y: 0 },
] as const;

export default function ProductCategoriesSection() {
  const cardsRef = useRef<HTMLDivElement>(null);
  const card0 = useRef<HTMLDivElement>(null);
  const card1 = useRef<HTMLDivElement>(null);
  const card2 = useRef<HTMLDivElement>(null);
  const cardRefs = [card0, card1, card2];

  useEffect(() => {
    const cardsContainer = cardsRef.current;
    if (!cardsContainer) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const cards = cardRefs.map(r => r.current).filter(Boolean) as HTMLElement[];
    const triggers: ScrollTrigger[] = [];

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

    return () => {
      triggers.forEach(t => t.kill());
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section
      id="products"
      aria-labelledby="products-heading"
      className="py-24 bg-surface-muted"
    >
      <div className="container mx-auto">

        <AnimateIn direction="up">
          <div className="text-center mb-16">
            <span className="inline-block text-[11px] font-semibold tracking-[0.1em] uppercase text-brand-secondary mb-3">
              What We Supply
            </span>
            <h2 id="products-heading" className="font-display text-[clamp(1.75rem,3vw,2.5rem)] font-bold text-brand-dark mb-4">
              Our Product Categories
            </h2>
            <p className="text-[17px] text-slate-500 max-w-lg mx-auto">
              Three focused ranges covering every hygiene and care need across industries.
            </p>
          </div>
        </AnimateIn>

        <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          {PRODUCT_CATEGORIES.map((category, i) => (
            <div key={category.id} ref={cardRefs[i]}>
              <div className="card-hover-category relative flex flex-col bg-white rounded-[20px] p-8 border border-slate-200 shadow-[0_4px_24px_rgba(15,23,42,0.07)] overflow-hidden h-full">
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-brand-primary to-brand-secondary" aria-hidden="true" />
                <div className="text-5xl mb-6 leading-none" role="img" aria-label={category.name}>
                  {category.icon}
                </div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="font-bold text-[17px] text-brand-dark leading-snug">
                    {category.name}
                  </h3>
                  <span className="shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-brand-light text-brand-primary">
                    {category.productCount} products
                  </span>
                </div>
                <p className="text-[13px] text-slate-500 leading-[1.65] mb-7 flex-1">
                  {category.description}
                </p>
                <Link
                  href={`${ROUTES.PRODUCTS}?category=${category.slug}`}
                  className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand-primary hover:gap-2.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary rounded"
                >
                  Browse Products
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <AnimateIn direction="up" delay={0.2}>
          <div className="text-center">
            <Link
              href={ROUTES.PRODUCTS}
              className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full font-semibold text-sm text-brand-primary border-2 border-brand-primary bg-transparent hover:bg-brand-light transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 min-h-[48px]"
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
