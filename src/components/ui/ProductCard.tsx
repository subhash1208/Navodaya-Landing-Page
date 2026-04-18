import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/utils/cn';
import { ROUTES } from '@/constants';
import type { ProductItem } from '@/types';

interface ProductCardProps {
  product: ProductItem;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  return (
    <Link
      href={ROUTES.PRODUCT(product.slug)}
      className={cn(
        'group flex flex-col bg-white border border-slate-100 rounded-[1.25rem] p-6',
        'shadow-[0_4px_24px_-4px_rgba(15,23,42,0.08)]',
        'hover:shadow-[0_20px_48px_-8px_rgba(15,23,42,0.16)] hover:-translate-y-1',
        'transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-brand-primary] focus-visible:ring-offset-2',
        className
      )}
    >
      {/* Placeholder image area */}
      <div className="w-full aspect-square rounded-xl bg-gradient-to-br from-[--color-brand-light] to-slate-100 flex items-center justify-center mb-5 overflow-hidden">
        <div className="text-center p-4">
          <div className="text-4xl mb-2" aria-hidden="true">📦</div>
          <span className="text-xs text-slate-400 font-medium">Photo coming soon</span>
        </div>
      </div>

      {/* Category badge */}
      <span className="inline-block text-[10px] font-semibold uppercase tracking-wider text-[--color-brand-secondary] bg-sky-50 px-2.5 py-1 rounded-full mb-2 self-start">
        {product.category.name}
      </span>

      {/* Name */}
      <h3 className="font-bold text-[--color-brand-dark] text-sm leading-snug mb-1 flex-1">
        {product.name}
      </h3>

      {/* Material */}
      {product.material && (
        <p className="text-xs text-slate-400 mb-3">Material: {product.material}</p>
      )}

      {/* CTA */}
      <div className="flex items-center gap-1 text-xs font-semibold text-[--color-brand-primary] mt-auto pt-3 border-t border-slate-50 group-hover:gap-2 transition-all duration-200">
        View Details
        <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
      </div>
    </Link>
  );
}
