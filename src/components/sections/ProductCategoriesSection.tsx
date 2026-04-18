import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';
import { PRODUCT_CATEGORIES, ROUTES } from '@/constants';

export default function ProductCategoriesSection() {
  return (
    <section
      id="products"
      aria-labelledby="products-heading"
      className="py-24 sm:py-32 bg-[--color-surface-muted]"
    >
      <div className="max-w-[80rem] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Heading */}
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-[--color-brand-secondary] mb-3">
            What We Supply
          </span>
          <h2
            id="products-heading"
            className="text-[clamp(1.75rem,3vw,2.5rem)] font-bold text-[--color-brand-dark] mb-4"
          >
            Our Product Categories
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto text-lg">
            Three focused ranges covering every hygiene and care need across industries.
          </p>
        </div>

        {/* Category cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {PRODUCT_CATEGORIES.map((category, i) => (
            <div
              key={category.id}
              className="group relative bg-white rounded-[1.25rem] p-8 border border-slate-100 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.08)] hover:shadow-[0_20px_48px_-8px_rgba(15,23,42,0.16)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col"
            >
              {/* Accent line */}
              <div
                className="absolute top-0 left-8 right-8 h-0.5 rounded-full bg-gradient-to-r from-[--color-brand-primary] to-[--color-brand-secondary] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                aria-hidden="true"
              />

              {/* Icon */}
              <div className="text-4xl mb-5" role="img" aria-label={category.name}>
                {category.icon}
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="font-bold text-[--color-brand-dark] text-lg leading-snug">
                    {category.name}
                  </h3>
                  <span className="shrink-0 text-xs font-semibold text-[--color-brand-primary] bg-[--color-brand-light] px-2.5 py-1 rounded-full">
                    {category.productCount} products
                  </span>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed mb-6">
                  {category.description}
                </p>
              </div>

              {/* CTA */}
              <Link
                href={`${ROUTES.PRODUCTS}?category=${category.slug}`}
                className="inline-flex items-center gap-2 text-sm font-semibold text-[--color-brand-primary] hover:gap-3 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-brand-primary] rounded"
                style={{ transitionDelay: `${i * 50}ms` }}
              >
                Browse Products
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          ))}
        </div>

        {/* View full catalogue CTA */}
        <div className="text-center">
          <Link
            href={ROUTES.PRODUCTS}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full border-2 border-[--color-brand-primary] text-[--color-brand-primary] font-semibold text-sm hover:bg-[--color-brand-primary] hover:text-white hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-brand-primary] focus-visible:ring-offset-2 min-h-[44px]"
          >
            <BookOpen className="w-4 h-4" aria-hidden="true" />
            View Full Product Catalogue
          </Link>
        </div>
      </div>
    </section>
  );
}
