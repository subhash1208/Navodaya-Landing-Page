import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/utils/cn';
import { ROUTES } from '@/constants';
import { CATEGORY_RULE } from '@/constants/categoryRule';
import type { ProductItem } from '@/types';

interface ProductCardProps {
  product: ProductItem;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  // Catalogue reference, derived entirely from existing data: category initials + product slug.
  const categoryCode = product.category.slug
    .split('-')
    .map((word) => word[0])
    .join('');
  const reference = `${categoryCode}-${product.slug}`;

  return (
    <Link
      href={ROUTES.PRODUCT(product.slug)}
      className={cn(
        'group relative flex h-full flex-col border border-grey-200 bg-paper p-6 pt-7',
        'shadow-e0 transition-shadow duration-200 hover:shadow-e1',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2',
        className,
      )}
    >
      {/* Category identifier — a 2px rule, the only permitted colour use */}
      <span
        aria-hidden="true"
        className={cn(
          'absolute top-0 left-0 right-0 h-[2px]',
          CATEGORY_RULE[product.category.slug],
        )}
      />

      {/* Specimen header — category on the left, derived catalogue reference on the right */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <span className="font-mono text-label uppercase text-grey-500">
          {product.category.name}
        </span>
        <span aria-hidden="true" className="font-mono text-label uppercase text-grey-500">
          {reference}
        </span>
      </div>

      <h3 className="mt-5 text-heading-2 text-ink">{product.name}</h3>

      <p className="mt-3 text-body-sm text-grey-600 line-clamp-3">{product.description}</p>

      {product.material && (
        <p className="mt-5 border-t border-grey-100 pt-3 font-mono text-data text-grey-500">
          Material: {product.material}
        </p>
      )}

      <div className="mt-auto flex items-center gap-2 border-t border-grey-100 pt-4 font-mono text-label uppercase text-ink transition-all duration-200 group-hover:gap-3">
        View Details
        <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
      </div>
    </Link>
  );
}
