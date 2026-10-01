'use client';

import { useState, useMemo, useRef, useEffect, type KeyboardEvent } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronDown, Search, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import {
  ALL_ID,
  PRODUCTS,
  PRODUCT_CATEGORIES,
  PRODUCT_COUNT_BY_CATEGORY,
  PRODUCT_COUNT_BY_SUB_CATEGORY,
  SUB_CATEGORIES,
  SUB_CATEGORY_PARENT,
  SUB_PARAM,
  productsInCategory,
} from '@/constants';
import { CATEGORY_RULE } from '@/constants/categoryRule';
import type { CategorySlug, SubCategorySlug } from '@/types';
import { ProductCard } from './ProductCard';

const SEARCH_ID = 'product-search';
/** Target of the disclosure trigger's `aria-controls`. */
const SUB_GROUP_ID = 'sub-category-refinement';
/**
 * Everything below Tailwind's `sm` breakpoint (`min-width: 640px`), expressed as its complement.
 * `.98` rather than `639px` so a fractional viewport width between the two never falls through
 * both queries.
 */
const COMPACT_QUERY = '(max-width: 639.98px)';

/**
 * Stays here while `ALL_ID` had to move to `@/constants` (see the note on its declaration): a
 * `type` export is erased at compile time, so it never becomes a client reference and the server
 * can read it through an `import { type TabId }` exactly as written.
 */
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

/**
 * The sub-category refinement row's controls, in row order.
 *
 * `slug: null` is the "All" chip. It lives in the same row as the ten subdivisions rather than
 * being a separate "clear" affordance, because that makes the eleven read as one mutually
 * exclusive choice with the visitor's current position always visible — and it puts the category
 * total directly beside the parts that sum to it.
 *
 * Module scope, not per-render: every value here is derived from the catalogue constants and
 * nothing in it depends on component state. Derived rather than written down, so a count here
 * can never drift from the grid it describes.
 */
const SUB_CATEGORY_CHIPS: { slug: SubCategorySlug | null; name: string; count: number }[] = [
  { slug: null, name: 'All', count: PRODUCT_COUNT_BY_CATEGORY[SUB_CATEGORY_PARENT] },
  ...SUB_CATEGORIES.map((s) => ({
    slug: s.slug,
    name: s.name,
    count: PRODUCT_COUNT_BY_SUB_CATEGORY[s.slug],
  })),
];

/**
 * Selected state is **brand blue**, matching `ProductOptions.tsx`'s chips exactly so the site has
 * one selected-state language rather than two. `paper` on `brand.blue` measures **7.15:1** (the
 * figure `tailwind.config.ts` records for that pair; the ratio is symmetric), well clear of the
 * 4.5:1 bar, and `brand.blue` is a LIGHT-surfaces-only token sitting here on `paper`/`grey-50`.
 * `aria-pressed` carries the same fact to assistive technology. `grey-200` on `brand.blue`
 * measures 5.13:1, which is why the count span flips with the chip instead of staying `grey-500`
 * (a light-surfaces-only token, per tailwind.config) or `grey-300`, which measured 9.02:1 against
 * the old `ink` ground but only 3.48:1 against this one — below the bar, so it moved up a step.
 *
 * `py-2.5` (10px) plus the 14.3px `text-label` line box and the 1px border gives a 36.3px box;
 * `before:inset-y-[-5px]` grows the invisible hit area to 46.3px, clearing the 44px WCAG
 * 2.5.5/2.5.8 floor. The row's `gap-y-2.5` (10px) is exactly the 5px+5px two stacked rows' hit
 * areas claim between them, so the expansion never steals a tap from the row above or below.
 */
const SUB_CHIP_CLASS =
  "group relative inline-flex items-baseline gap-1.5 border border-grey-200 px-3 py-2.5 font-mono text-label uppercase text-grey-500 transition-colors duration-200 hover:border-grey-400 hover:text-ink aria-pressed:border-brand-blue aria-pressed:bg-brand-blue aria-pressed:text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 before:absolute before:inset-x-0 before:inset-y-[-5px] before:content-['']";

/**
 * The small-screen disclosure trigger. Same box as a chip — border, `px-3 py-2.5`, mono label, and
 * the same `before:inset-y-[-5px]` lift from the 36.3px visible box to a 46.3px hit area — so the
 * collapsed row reads as part of the same control family rather than as a new kind of thing.
 *
 * `self-start` keeps it shrink-wrapped inside the column wrapper without making that wrapper
 * `items-start`, which would also shrink-wrap the chip group and stop it wrapping at the container
 * width on desktop. `sm:hidden` is what removes it — `display: none`, so it leaves the tab order
 * and the accessibility tree entirely — at every width where the group is unconditionally open.
 */
const SUB_TRIGGER_CLASS =
  "relative inline-flex items-center gap-1.5 self-start border border-grey-200 px-3 py-2.5 font-mono text-label uppercase text-grey-500 transition-colors duration-200 hover:border-grey-400 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 before:absolute before:inset-x-0 before:inset-y-[-5px] before:content-[''] sm:hidden";

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
  /**
   * The sub-category the server resolved from `?sub=`, or `null` for the unfiltered category.
   * Server-resolved for exactly the reason above — a `?sub=` deep link has to reach a crawler.
   *
   * Optional because "no refinement" is the honest default: the value is absent from most URLs,
   * and every caller that has nothing to say can simply say nothing.
   */
  activeSubCategory?: SubCategorySlug | null;
}

export function ProductGrid({
  activeCategory: categoryFromUrl,
  activeSubCategory: subCategoryFromUrl = null,
}: ProductGridProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Seeded from the server-resolved prop, so the very first render — the server's included —
  // already shows the right tab. Held locally so a tab click repaints immediately instead of
  // waiting on the navigation round trip the URL update triggers.
  const [activeCategory, setActiveCategory] = useState<TabId>(categoryFromUrl);
  const [activeSubCategory, setActiveSubCategory] = useState<SubCategorySlug | null>(
    subCategoryFromUrl,
  );
  const [syncedCategory, setSyncedCategory] = useState<TabId>(categoryFromUrl);
  const [syncedSubCategory, setSyncedSubCategory] = useState<SubCategorySlug | null>(
    subCategoryFromUrl,
  );
  const [query, setQuery] = useState('');

  /**
   * Whether the refinement row is a disclosure right now.
   *
   * `false` on the server and on the first client render, which is what keeps the chips in the
   * server HTML and in the accessibility tree at every width the server cannot measure — the
   * opposite default would ship a `hidden` group to every crawler. The *visual* default comes from
   * CSS instead (`hidden sm:flex` on the group below), so a small screen paints the collapsed row
   * from the very first frame and this state only ever catches the accessibility tree up.
   */
  const [isCompact, setIsCompact] = useState(false);
  /** Disclosure state. Collapsed by default, `?sub=` deep links included — see the trigger's copy. */
  const [subCategoriesOpen, setSubCategoriesOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(COMPACT_QUERY);
    const sync = () => setIsCompact(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  // Re-sync when the URL changes underneath us — browser back/forward, or a `?category=` link
  // followed from elsewhere. Done during render rather than in an effect so there is no
  // intermediate paint showing the stale tab.
  if (syncedCategory !== categoryFromUrl || syncedSubCategory !== subCategoryFromUrl) {
    setSyncedCategory(categoryFromUrl);
    setSyncedSubCategory(subCategoryFromUrl);
    setActiveCategory(categoryFromUrl);
    setActiveSubCategory(subCategoryFromUrl);
  }

  // Update URL when filter changes
  const handleCategoryChange = (slug: TabId) => {
    setActiveCategory(slug);
    // Cleared deliberately, NOT as a side effect of the blank `URLSearchParams` below. A
    // sub-category subdivides `hygiene-safety-housekeeping` alone, so carrying one onto any other
    // tab would describe a filter that cannot match a single product — and the server would
    // refuse it on the next load anyway, leaving the state and the URL disagreeing.
    setActiveSubCategory(null);
    // Leaving the subdivided category and coming back must not restore a 400px-tall open row on a
    // phone; "collapsed by default" is a property of arriving at the tab, not of first mount.
    setSubCategoriesOpen(false);
    const params = new URLSearchParams();
    if (slug !== ALL_ID) {
      params.set('category', slug);
    }
    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  };

  const handleSubCategoryChange = (slug: SubCategorySlug | null) => {
    setActiveSubCategory(slug);
    // Collapse on selection. On a phone the open row is ~407px of filters sitting between the
    // visitor and the grid they just re-filtered; leaving it open would mean the result of the tap
    // is entirely off-screen. The trigger then carries the chosen sub-category (see `activeSub`
    // below), so closing the row hides the choices without hiding the choice.
    //
    // Unconditional rather than gated on `isCompact`: at `sm` and above the group's visibility is
    // `sm:flex`, which does not consult this flag at all, so this is a no-op there.
    setSubCategoriesOpen(false);
    // The refinement row renders only under the parent tab, so that is the only category a
    // sub-category change can ever be made from — written explicitly rather than read back off
    // `activeCategory`, so the pairing the server validates is the pairing this writes.
    const params = new URLSearchParams({ category: SUB_CATEGORY_PARENT });
    if (slug) {
      params.set(SUB_PARAM, slug);
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const filtered = useMemo(() => {
    let list = PRODUCTS;
    if (activeCategory !== ALL_ID) {
      // `productsInCategory` rather than a bare `p.category.slug ===` test: three products carry a
      // `secondaryCategory` and belong in both listings. Filtering on `category` alone would drop
      // them from one, and the tab count beside the label — which is derived the same way — would
      // then disagree with the grid below it.
      list = productsInCategory(activeCategory);
    }
    if (activeSubCategory) {
      list = list.filter((p) => p.subCategory === activeSubCategory);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description?.toLowerCase().includes(q) ?? false) ||
          (p.material?.toLowerCase().includes(q) ?? false) ||
          (p.variants?.some((v) => v.label.toLowerCase().includes(q)) ?? false) ||
          // A product carries `variants` OR `optionAxes`, never both, so this clause is the only
          // thing that makes the four axis products searchable by their own option names. Without
          // it, "lavender" — a fragrance the catalogue genuinely lists — returns "No products
          // found" on the site's only discovery surface.
          (p.optionAxes?.some((a) => a.values.some((v) => v.toLowerCase().includes(q))) ?? false),
      );
    }
    return list;
  }, [activeCategory, activeSubCategory, query]);

  const tabs: { id: TabId; label: string; count: number }[] = [
    { id: ALL_ID, label: 'All Products', count: PRODUCTS.length },
    ...PRODUCT_CATEGORIES.map((c) => ({
      id: c.slug,
      label: c.name,
      count: PRODUCT_COUNT_BY_CATEGORY[c.slug],
    })),
  ];

  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  /**
   * The WAI-ARIA tabs pattern's keyboard interaction, with **manual** activation.
   *
   * Arrow keys move focus and nothing else; `Enter` and `Space` activate, which a native
   * `<button>` already delivers through `onClick` — so neither key is handled here. The APG makes
   * activation-on-arrow optional ("Optionally, activates the newly focused tab",
   * https://www.w3.org/WAI/ARIA/apg/patterns/tabs/), and this tablist declines it: activating
   * re-filters a 164-product grid and rewrites the URL, so scrubbing across four tabs with the
   * arrow keys would do that four times for one intended change.
   *
   * `Home`/`End` are the pattern's optional first/last jumps. Both wrap-around cases are the
   * pattern's required behaviour, not a nicety.
   */
  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = tabs.length - 1;
    let next: number;
    switch (event.key) {
      case 'ArrowRight':
        next = index === last ? 0 : index + 1;
        break;
      case 'ArrowLeft':
        next = index === 0 ? last : index - 1;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = last;
        break;
      default:
        return;
    }
    event.preventDefault();
    tabRefs.current[next]?.focus();
  };

  const showSubCategories = activeCategory === SUB_CATEGORY_PARENT;
  const activeSub = activeSubCategory && SUB_CATEGORIES.find((s) => s.slug === activeSubCategory);

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
        className={cn(
          'flex flex-wrap gap-x-8 gap-y-1 border-b border-grey-200',
          showSubCategories ? 'mb-5' : 'mb-10',
        )}
        role="tablist"
        aria-label="Filter by category"
      >
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            ref={(node) => {
              tabRefs.current[index] = node;
            }}
            type="button"
            role="tab"
            aria-selected={activeCategory === tab.id}
            aria-controls="product-grid-panel"
            // Roving tabindex: Tab enters the tablist exactly once and lands on the active tab,
            // per the APG's Keyboard Interaction section. Without it the row was four separate
            // tab stops — which is also what made a ten-button refinement row below unaffordable.
            tabIndex={activeCategory === tab.id ? 0 : -1}
            onKeyDown={(event) => handleTabKeyDown(event, index)}
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

      {/*
        Sub-category refinement — deliberately NOT a second `role="tablist"`. Two nested tablists
        controlling one panel is incoherent to a screen reader: the category row is the tab
        dimension, and this narrows the selection already made within it. A labelled `role="group"`
        of `aria-pressed` toggle buttons says exactly that, and `aria-pressed` conveys the
        selection independently of the chip's colour inversion.

        Renders only under `SUB_CATEGORY_PARENT`, because that is the only category subdivided.
      */}
      {showSubCategories && (
        <div className="mb-10 flex flex-col gap-2.5">
          {/*
            Below `sm` the eleven chips cost ~407px — more than half a 667px viewport — so the
            biggest category was the one tab that showed a visitor no product at all on their first
            screen. The disclosure buys that back while still naming the dimension and its scale,
            which is the entire reason the row exists.
          */}
          <button
            type="button"
            aria-expanded={subCategoriesOpen}
            aria-controls={SUB_GROUP_ID}
            onClick={() => setSubCategoriesOpen((open) => !open)}
            className={SUB_TRIGGER_CLASS}
          >
            {activeSub ? (
              <>
                {/*
                  Keeps the accessible name saying what the control is for — "Air Care 11" alone
                  names a thing, not a filter — while the visible text stays the visitor's own
                  current selection. The visible string is still contained in the accessible name,
                  so WCAG 2.5.3 Label in Name holds.
                */}
                <span className="sr-only">{'Refine by sub-category: '}</span>
                {activeSub.name}
                <span className="text-grey-500">
                  {PRODUCT_COUNT_BY_SUB_CATEGORY[activeSub.slug]}
                </span>
              </>
            ) : (
              <>
                Refine by sub-category
                <span className="text-grey-500">{SUB_CATEGORIES.length} ranges</span>
              </>
            )}
            {/*
              Rotated, never transitioned: a 180° snap has no motion to reduce, so this needs no
              `prefers-reduced-motion` branch and no cleanup.
            */}
            <ChevronDown
              aria-hidden="true"
              className={cn('h-3.5 w-3.5', subCategoriesOpen && 'rotate-180')}
            />
          </button>

          <div
            id={SUB_GROUP_ID}
            role="group"
            aria-label="Refine by sub-category"
            // Two mechanisms, deliberately, because they answer two different questions.
            //
            // The class pair is what paints: `hidden` below `sm` until the disclosure is opened,
            // `sm:flex` unconditionally at and above it. Being CSS, it is right in the server HTML
            // and on the very first frame, so a phone never flashes the open row before hydration
            // and a desktop never needs a trigger it has no room for.
            //
            // The `hidden` ATTRIBUTE is what the accessibility tree and the tab order read. Tying
            // it to a measured `isCompact` rather than to `subCategoriesOpen` alone is the point:
            // the alternative — attribute on, `sm:flex` overriding it — leaves a desktop with an
            // element that is visible and focusable while still claiming to be hidden, which is
            // the documented reason authors are told never to override `[hidden]`. Here the
            // attribute is present only at widths where the CSS agrees the group is gone.
            hidden={isCompact && !subCategoriesOpen}
            className={cn(
              'flex-wrap gap-x-2 gap-y-2.5 sm:flex',
              subCategoriesOpen ? 'flex' : 'hidden',
            )}
          >
            {SUB_CATEGORY_CHIPS.map((chip) => {
              const pressed = activeSubCategory === chip.slug;
              return (
                <button
                  key={chip.slug ?? ALL_ID}
                  type="button"
                  aria-pressed={pressed}
                  onClick={() => handleSubCategoryChange(chip.slug)}
                  className={SUB_CHIP_CLASS}
                  // The pressed chip is an ink ground, on which the custom cursor's own ink ring
                  // would be invisible — same marker the other dark surfaces carry.
                  data-cursor-invert={pressed || undefined}
                >
                  {chip.name}
                  <span className="text-grey-500 group-aria-pressed:text-grey-200">
                    {chip.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

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
