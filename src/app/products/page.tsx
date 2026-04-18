import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { ProductGrid } from '@/components/ui/ProductGrid';
import { BRAND, PRODUCTS, PRODUCT_CATEGORIES } from '@/constants';

export const metadata: Metadata = {
  title: 'Product Catalogue',
  description: `Browse ${PRODUCTS.length}+ hygiene and care products across ${PRODUCT_CATEGORIES.length} categories. ${BRAND.FULL_NAME}, ${BRAND.LOCATION}.`,
};

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4" aria-busy="true" aria-label="Loading products">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="bg-slate-100 rounded-[1.25rem] aspect-[3/4] animate-pulse" />
      ))}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-[--color-surface-muted]">
      {/* Page header */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-[80rem] mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-400 mb-4">
            <Link href="/" className="hover:text-[--color-brand-primary] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[--color-brand-primary] rounded">
              Home
            </Link>
            <ChevronRight className="w-3 h-3" aria-hidden="true" />
            <span className="text-[--color-brand-dark] font-medium">Products</span>
          </nav>

          <h1 className="text-[clamp(1.75rem,3vw,2.5rem)] font-bold text-[--color-brand-dark] mb-2">
            Product Catalogue
          </h1>
          <p className="text-slate-500 text-lg">
            {PRODUCTS.length}+ products across {PRODUCT_CATEGORIES.length} categories — hygiene, hospitality &amp; wellness.
          </p>
        </div>
      </div>

      {/* Catalogue */}
      <div className="max-w-[80rem] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Suspense fallback={<GridSkeleton />}>
          <ProductGrid />
        </Suspense>
      </div>
    </div>
  );
}
