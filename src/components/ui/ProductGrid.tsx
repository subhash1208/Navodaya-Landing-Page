'use client';

import { useState, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { PRODUCTS, PRODUCT_CATEGORIES, PRODUCT_COUNT_BY_CATEGORY } from '@/constants';
import { CATEGORY_RULE } from '@/constants/categoryRule';
import type { CategorySlug } from '@/types';
import { ProductCard } from './ProductCard';

export const ALL_ID = 'all';
const SEARCH_ID = 'product-search';

export type TabId = CategorySlug | typeof ALL_ID;

/** The catalogue rules, plus the "all" tab's neutral ink rule. */
const TAB_RULE = {
  [ALL_ID]: 'bg-brand-blue',
  ...CATEGORY_RULE,
} satisfies Record<TabId, string>;

/**
 * Active state is expressed with the `aria-selected` variant rather than a conditional class, so
 * this needs no `cn()` call. (The `text-label` token is now registered with `tailwind-merge` in
 * `src/utils/cn.ts`, so it would survive a merge either way.)
 *
 * `text-label` is 0.6875rem/1.3 (11px * 1.3 = 14.3px line height); with `pt-2` (8px) and `pb-3`
 * (12px) the rendered box is 8 + 14.3 + 12 = 34.3px tall, short of the 44px WCAG 2.5.5/2.5.8
 * touch-target floor. `before:inset-y-[-5px]` grows the invisible hit area by 5px top and bottom
 * (34.3 + 10 = 44.3px) without touching the visible padding — same `before:` pseudo-element
 * technique as the desktop nav links in `Header.tsx:157-165`. Horizontal reach is left untouched
 * (`before:inset-x-0`): the tabs are already wide enough on their own text content, and growing
 * sideways would risk overlapping neighbouring tabs across the `gap-x-8` row gap.
 */
const TAB_CLASS =
  "relative flex items-baseline gap-2 px-1 pb-3 pt-2 font-mono text-label uppercase text-grey-500 transition-colors duration-200 hover:text-ink aria-selected:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 before:absolute before:inset-x-0 before:inset-y-[-5px] before:content-['']";

interface ProductGridProps {
  /**
   * The category the server resolved from `?category=`. Passing it down rather than reading it
   * here with `useSearchParams()` is what makes `/products` server-render: `useSearchParams` puts
   * the whole client tree up to the nearest Suspense boundary into client-side rendering
   * (`node_modules/next/dist/docs/01-app/03-api-reference/04-functions/use-search-params.md:82`),
   * so the catalogue never reached the server HTML. A client component that merely receives props
   * is server-rendered like any other.
   */
  activeCategory: TabId;
}

export function ProductGrid({ activeCategory: categoryFromUrl }: ProductGridProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Seeded from the server-resolved prop, so the very first render — the server's included —
  // already shows the right tab. Held locally so a tab click repaints immediately instead of
  // waiting on the navigation round trip the URL update triggers.
  const [activeCategory, setActiveCategory] = useState<TabId>(categoryFromUrl);
  const [syncedCategory, setSyncedCategory] = useState<TabId>(categoryFromUrl);
  const [query, setQuery] = useState('');

  // Re-sync when the URL changes underneath us — browser back/forward, or a `?category=` link
  // followed from elsewhere. Done during render rather than in an effect so there is no
  // intermediate paint showing the stale tab.
  if (syncedCategory !== categoryFromUrl) {
    setSyncedCategory(categoryFromUrl);
    setActiveCategory(categoryFromUrl);
  }

  // Update URL when filter changes
  const handleCategoryChange = (slug: TabId) => {
    setActiveCategory(slug);
    const params = new URLSearchParams();
    if (slug !== ALL_ID) {
      params.set('category', slug);
    }
    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  };

  const filtered = useMemo(() => {
    let list = PRODUCTS;
    if (activeCategory !== ALL_ID) {
      list = list.filter((p) => p.category.slug === activeCategory);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.material?.toLowerCase().includes(q) ?? false),
      );
    }
    return list;
  }, [activeCategory, query]);

  const tabs: { id: TabId; label: string; count: number }[] = [
    { id: ALL_ID, label: 'All Products', count: PRODUCTS.length },
    ...PRODUCT_CATEGORIES.map((c) => ({
      id: c.slug,
      label: c.name,
      count: PRODUCT_COUNT_BY_CATEGORY[c.slug],
    })),
  ];

  return (
    <div>
      {/* Specification field + catalogue count */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end mb-10">
        <div className="flex flex-1 max-w-sm flex-col gap-2">
          {/* Visible mono label — one accessible-name source, so `getByLabelText` stays unambiguous */}
          <label
            htmlFor={SEARCH_ID}
            className="font-mono text-label uppercase text-grey-500 cursor-pointer"
          >
            Search products
          </label>
          <div className="relative">
            <Search
              className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-grey-400 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id={SEARCH_ID}
              type="search"
              placeholder="Search products…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-none border-b border-grey-400 bg-transparent py-3 pl-7 pr-8 font-mono text-data text-ink placeholder:text-grey-500 transition-colors duration-200 focus:border-ink focus:outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                aria-label="Clear search"
                // The visible icon stays a 16x16 `w-4 h-4` glyph positioned by the button's own
                // box — `before:inset-[-14px]` grows only the invisible hit area to 44x44
                // (16 + 14*2), clearing the WCAG 2.5.5/2.5.8 touch-target floor without moving
                // the icon. Same `before:` technique as the desktop nav links in
                // `Header.tsx:157-165`. The extra reach stays inside the input's own `pr-8`
                // (32px) icon gutter on the left/top/bottom, so it does not steal clicks from
                // the input's actual text-entry region.
                className="absolute right-0 top-1/2 -translate-y-1/2 text-grey-400 transition-colors duration-200 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink before:absolute before:inset-[-14px] before:content-['']"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <span className="font-mono text-data text-grey-500 sm:ml-auto sm:pb-3">
          {filtered.length} product{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Category tabs — mono labels on a ruled baseline, active marked by a 2px category rule */}
      <div
        className="flex flex-wrap gap-x-8 gap-y-1 border-b border-grey-200 mb-10"
        role="tablist"
        aria-label="Filter by category"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            role="tab"
            aria-selected={activeCategory === tab.id}
            aria-controls="product-grid-panel"
            onClick={() => handleCategoryChange(tab.id)}
            className={TAB_CLASS}
          >
            {tab.label}
            <span className="font-mono text-data text-grey-500">{tab.count}</span>
            {activeCategory === tab.id && (
              <span
                aria-hidden="true"
                className={cn('absolute -bottom-px left-0 right-0 h-[2px]', TAB_RULE[tab.id])}
              />
            )}
          </button>
        ))}
      </div>

      {/* Catalogue */}
      {filtered.length > 0 ? (
        <div
          id="product-grid-panel"
          role="tabpanel"
          aria-labelledby={`tab-${activeCategory}`}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
        >
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div
          id="product-grid-panel"
          role="tabpanel"
          aria-labelledby={`tab-${activeCategory}`}
          className="border-t border-grey-200 py-20 text-center"
        >
          <h3 className="text-heading-2 text-ink">No products found</h3>
          <p className="mt-3 text-body text-grey-600">Try a different search term or category.</p>
          <button
            onClick={() => {
              setQuery('');
              handleCategoryChange(ALL_ID);
            }}
            className="mt-6 inline-flex items-center border border-ink px-6 py-3 font-mono text-label uppercase text-ink transition-colors duration-200 hover:bg-brand-blue hover:text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
            data-cursor-invert
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
