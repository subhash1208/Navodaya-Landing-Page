import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { ALL_ID, ProductGrid, type TabId } from '@/components/ui/ProductGrid';
import { BRAND, PRODUCTS, PRODUCT_CATEGORIES, ROUTES } from '@/constants';

export const metadata: Metadata = {
  title: 'Product Catalogue',
  description: `Browse ${PRODUCTS.length}+ hygiene and care products across ${PRODUCT_CATEGORIES.length} categories. ${BRAND.FULL_NAME}, ${BRAND.LOCATION}.`,
  alternates: { canonical: ROUTES.PRODUCTS },
};

/**
 * Resolve `?category=` against the real catalogue slugs.
 *
 * A repeated param (`?category=a&category=b`) arrives as an array, and a hand-typed or stale slug
 * matches nothing. Both fall back to the unfiltered catalogue — never an empty grid, and never a
 * throw on input anyone can put in the address bar.
 */
function resolveCategory(raw: string | string[] | undefined): TabId {
  const match =
    typeof raw === 'string' ? PRODUCT_CATEGORIES.find((c) => c.slug === raw) : undefined;
  return match ? match.slug : ALL_ID;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const activeCategory = resolveCategory((await searchParams).category);

  return (
    <div className="min-h-screen bg-grey-50">
      {/* Page header */}
      <div className="bg-paper border-b border-grey-100">
        <div className="container mx-auto py-10">
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-xs text-grey-500 mb-4"
          >
            <Link
              href="/"
              className="hover:text-brand-blue transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-blue rounded"
            >
              Home
            </Link>
            <ChevronRight className="w-3 h-3" aria-hidden="true" />
            <span className="text-ink font-medium">Products</span>
          </nav>

          <h1 className="text-[clamp(1.75rem,3vw,2.5rem)] font-bold text-ink mb-2">
            Product Catalogue
          </h1>
          <p className="text-grey-500 text-lg">
            {PRODUCTS.length}+ products across {PRODUCT_CATEGORIES.length} categories — hygiene,
            hospitality &amp; wellness.
          </p>
        </div>
      </div>

      {/* Catalogue */}
      <div className="container mx-auto py-10">
        <ProductGrid activeCategory={activeCategory} />
      </div>
    </div>
  );
}
