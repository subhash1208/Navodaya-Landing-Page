'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/utils/cn';
import { PRODUCTS, PRODUCT_CATEGORIES } from '@/constants';
import { ProductCard } from './ProductCard';
import { MagneticWrapper } from './MagneticWrapper';
import { PinContainer } from './PinContainer';

const ALL_ID = 'all';

export function ProductGrid() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const initialCategory = searchParams.get('category') ?? ALL_ID;
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [query, setQuery] = useState('');

  // Sync URL → state when navigating from category cards on landing page
  useEffect(() => {
    const cat = searchParams.get('category') ?? ALL_ID;
    setActiveCategory(cat);
  }, [searchParams]);

  // Update URL when filter changes
  const handleCategoryChange = (slug: string) => {
    setActiveCategory(slug);
    const params = new URLSearchParams(searchParams.toString());
    if (slug === ALL_ID) {
      params.delete('category');
    } else {
      params.set('category', slug);
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
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

  const tabs = [
    { id: ALL_ID, label: 'All Products', count: PRODUCTS.length },
    ...PRODUCT_CATEGORIES.map((c) => ({ id: c.slug, label: c.name, count: c.productCount })),
  ];

  return (
    <div>
      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Search products…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search products"
            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-brand-dark placeholder:text-slate-400 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all duration-200"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-primary rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Result count */}
        <div className="flex items-center gap-2 text-sm text-slate-500 sm:ml-auto">
          <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
          <span>
            {filtered.length} product{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2 mb-10" role="tablist" aria-label="Filter by category">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeCategory === tab.id}
            onClick={() => handleCategoryChange(tab.id)}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-1',
              activeCategory === tab.id
                ? 'bg-brand-primary text-white shadow-[0_0_20px_rgba(30,64,175,0.25)]'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-brand-primary hover:text-brand-primary',
            )}
          >
            {tab.label}
            <span
              className={cn(
                'text-xs px-1.5 py-0.5 rounded-full font-semibold',
                activeCategory === tab.id
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 text-slate-500',
              )}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((product) => (
            <PinContainer key={product.id}>
              <MagneticWrapper>
                <ProductCard product={product} />
              </MagneticWrapper>
            </PinContainer>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-4xl mb-4" aria-hidden="true">
            🔍
          </div>
          <h3 className="font-semibold text-brand-dark mb-2">No products found</h3>
          <p className="text-sm text-slate-500 mb-4">Try a different search term or category.</p>
          <button
            onClick={() => {
              setQuery('');
              handleCategoryChange(ALL_ID);
            }}
            className="text-sm font-medium text-brand-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary rounded"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
