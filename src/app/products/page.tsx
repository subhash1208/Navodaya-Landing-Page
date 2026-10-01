import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { ProductGrid, type TabId } from '@/components/ui/ProductGrid';
import {
  ALL_ID,
  BRAND,
  PRODUCTS,
  PRODUCT_CATEGORIES,
  ROUTES,
  SUB_CATEGORIES,
  SUB_CATEGORY_PARENT,
  SUB_PARAM,
} from '@/constants';
import type { SubCategorySlug } from '@/types';

export const metadata: Metadata = {
  title: 'Product Catalogue',
  description: `Browse ${PRODUCTS.length} hygiene, housekeeping and care products across ${PRODUCT_CATEGORIES.length} categories. ${BRAND.FULL_NAME}, ${BRAND.LOCATION}.`,
  alternates: { canonical: ROUTES.PRODUCTS },
  openGraph: {
    title: `Product Catalogue | ${BRAND.NAME}`,
    description: `Browse ${PRODUCTS.length} hygiene, housekeeping and care products across ${PRODUCT_CATEGORIES.length} categories from ${BRAND.FULL_NAME}.`,
    url: ROUTES.PRODUCTS,
    type: 'website',
    locale: 'en_IN',
    siteName: BRAND.FULL_NAME,
  },
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

/**
 * Resolve `?sub=` against the real sub-category slugs.
 *
 * Resolved here rather than in the grid for the same reason `?category=` is: a `?sub=` link has
 * to be filtered in the HTML the server sends, or a crawler and a no-JS visitor both see the
 * whole 133-product category instead of the slice the URL asked for.
 *
 * Three inputs are rejected identically, to the unfiltered category rather than an empty grid or
 * a throw: an unknown slug, a repeated param (which arrives as an array), and — the one specific
 * to this axis — a perfectly valid slug paired with any category other than the one it
 * subdivides. That last pairing describes a filter that cannot match a single product, so
 * honouring it would render a guaranteed-empty page off a hand-edited address bar.
 */
function resolveSubCategory(
  raw: string | string[] | undefined,
  category: TabId,
): SubCategorySlug | null {
  if (category !== SUB_CATEGORY_PARENT) return null;
  const match = typeof raw === 'string' ? SUB_CATEGORIES.find((s) => s.slug === raw) : undefined;
  return match ? match.slug : null;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const activeCategory = resolveCategory(params.category);
  const activeSubCategory = resolveSubCategory(params[SUB_PARAM], activeCategory);

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

          <h1 className="text-[clamp(1.75rem,3vw,2.5rem)] font-bold text-brand-blue mb-2">
            Product Catalogue
          </h1>
          <p className="text-grey-500 text-lg">
            {PRODUCTS.length} products across {PRODUCT_CATEGORIES.length} categories — education,
            healthcare &amp; hospitality.
          </p>
        </div>
      </div>

      {/* Catalogue */}
      <div className="container mx-auto py-10">
        <ProductGrid activeCategory={activeCategory} activeSubCategory={activeSubCategory} />
      </div>
    </div>
  );
}
