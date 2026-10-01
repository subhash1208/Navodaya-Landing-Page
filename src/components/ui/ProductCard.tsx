import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/utils/cn';
import { ROUTES, productSummary } from '@/constants';
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
  const variantCount = product.variants?.length ?? 0;

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

      {/*
        Specimen plate. Part of the catalogue is photographed and the rest is not, so BOTH branches
        ship: the photograph when `product.image` is set, and a hairline-ruled grey-50 field
        carrying the catalogue reference in mono otherwise — a blank specimen label rather than a
        broken image. No emoji, no "image missing" glyph. The 4:3 box is declared on the wrapper,
        outside the branch, so a mixed grid row cannot go ragged between a photographed card and an
        unphotographed one. `object-contain` is a correctness requirement, not a preference: every
        photograph is a cutout that already fits its frame with margin, and `fill`'s default
        `object-cover` would crop it.
      */}
      <div className="relative mt-5 aspect-[4/3] overflow-hidden border border-grey-200 bg-grey-50">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
            className="object-contain"
          />
        ) : (
          <span
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center px-3 text-center font-mono text-label uppercase tracking-wider text-grey-500"
          >
            {reference}
          </span>
        )}
      </div>

      <h3 className="mt-5 text-heading-2 text-ink">{product.name}</h3>

      <p className="mt-3 text-body-sm text-grey-600 line-clamp-3">{productSummary(product)}</p>

      {(product.material || variantCount > 1) && (
        <dl className="mt-5 border-t border-grey-100 pt-3 font-mono text-data text-grey-500">
          {product.material && (
            <div className="flex gap-2">
              <dt>Material:</dt>
              <dd>{product.material}</dd>
            </div>
          )}
          {variantCount > 1 && (
            <div className="flex gap-2">
              <dt>Options:</dt>
              <dd>{variantCount}</dd>
            </div>
          )}
        </dl>
      )}

      <div className="mt-auto flex items-center gap-2 border-t border-grey-100 pt-4 font-mono text-label uppercase text-ink transition-all duration-200 group-hover:gap-3">
        View Details
        <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
      </div>
    </Link>
  );
}
