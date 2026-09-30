import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, within, act } from '@testing-library/react';
import type { ReactElement } from 'react';
import { useRouter } from 'next/navigation';
import { ProductGrid } from '@/components/ui/ProductGrid';
import {
  ALL_ID,
  PRODUCTS,
  PRODUCT_COUNT_BY_CATEGORY,
  PRODUCT_COUNT_BY_SUB_CATEGORY,
  SUB_CATEGORIES,
  SUB_CATEGORY_PARENT,
  productsInCategory,
  productsInSubCategory,
} from '@/constants';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('lucide-react', () => ({
  Search: (props: any) => <svg data-testid="search-icon" {...props} />,
  X: (props: any) => <svg data-testid="x-icon" {...props} />,
  ArrowRight: (props: any) => <svg data-testid="arrow-right" {...props} />,
  ChevronDown: (props: any) => <svg data-testid="chevron-down" {...props} />,
}));

// `setup.ts` pins `usePathname()` to `/`, but ProductGrid is only ever mounted at `/products` and
// writes its category filter back through that pathname. This file-scope mock overrides it so the
// tab-filter path is exercised against the route the component actually runs on, and exposes a
// stable `router` object so the URL it writes can be asserted.
//
// There is deliberately no `useSearchParams` here any more: reading it inside the grid is what
// forced `/products` to render client-side only. The active category now arrives as a prop from
// the server — see `src/__tests__/app/products/page.ssr.test.tsx`.
vi.mock('next/navigation', () => {
  const router = {
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  };
  return {
    useRouter: () => router,
    usePathname: () => '/products',
  };
});

describe('ProductGrid', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders products', () => {
    render(<ProductGrid activeCategory={ALL_ID} />);
    // Should render product cards
    expect(screen.getByPlaceholderText('Search products…')).toBeTruthy();
  });

  it('renders one catalogue link per result', () => {
    render(<ProductGrid activeCategory={ALL_ID} />);
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
    links.forEach((link) => expect(link.getAttribute('href')).toMatch(/^\/products\//));
  });

  it('renders no photo placeholder', () => {
    const { container } = render(<ProductGrid activeCategory={ALL_ID} />);
    expect(screen.queryByText(/photo coming soon/i)).toBeNull();
    // Part of the catalogue is photographed now, so `no img at all` is no longer the invariant.
    // What must still hold: every image in the grid is a real catalogue photograph served from
    // /products/, never an apologetic placeholder graphic.
    const images = Array.from(container.querySelectorAll('img'));
    expect(images.length).toBeGreaterThan(0);
    images.forEach((img) => expect(img.getAttribute('src')).toMatch(/^\/products\/.+\.webp$/));
  });

  it('renders search input', () => {
    render(<ProductGrid activeCategory={ALL_ID} />);
    const input = screen.getByLabelText('Search products');
    expect(input).toBeTruthy();
  });

  it('renders category tabs', () => {
    render(<ProductGrid activeCategory={ALL_ID} />);
    expect(screen.getByRole('tab', { name: /All Products/i })).toBeTruthy();
  });

  it('marks the active tab with a single navy rule', () => {
    render(<ProductGrid activeCategory={ALL_ID} />);
    const tablist = screen.getByRole('tablist');
    expect(tablist.querySelectorAll('.bg-brand-blue')).toHaveLength(1);
    expect(screen.getByRole('tab', { name: /All Products/i }).getAttribute('aria-selected')).toBe(
      'true',
    );
  });

  it('keeps the tablist ARIA wiring intact alongside the expanded hit areas', () => {
    render(<ProductGrid activeCategory={ALL_ID} />);
    const tab = screen.getByRole('tab', { name: /All Products/i });
    expect(tab.getAttribute('id')).toBe('tab-all');
    expect(tab.getAttribute('aria-controls')).toBe('product-grid-panel');
    const panel = document.getElementById('product-grid-panel');
    expect(panel?.getAttribute('aria-labelledby')).toBe('tab-all');
  });

  it('reports the result count in the plural', () => {
    render(<ProductGrid activeCategory={ALL_ID} />);
    expect(screen.getByText(/^\d+ products$/)).toBeTruthy();
  });

  it('reports the result count in the singular when one product matches', () => {
    render(<ProductGrid activeCategory={ALL_ID} />);
    const input = screen.getByLabelText('Search products');
    fireEvent.change(input, { target: { value: 'surgeon' } });
    expect(screen.getByText('1 product')).toBeTruthy();
  });

  it('handles search input', () => {
    render(<ProductGrid activeCategory={ALL_ID} />);
    const input = screen.getByLabelText('Search products');
    fireEvent.change(input, { target: { value: 'surgeon' } });
    expect((input as HTMLInputElement).value).toBe('surgeon');
  });

  it('shows clear button when search has value', () => {
    render(<ProductGrid activeCategory={ALL_ID} />);
    const input = screen.getByLabelText('Search products');
    fireEvent.change(input, { target: { value: 'test' } });
    const clearBtn = screen.getByLabelText('Clear search');
    expect(clearBtn).toBeTruthy();
  });

  it('clears search when clear button clicked', () => {
    render(<ProductGrid activeCategory={ALL_ID} />);
    const input = screen.getByLabelText('Search products') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'test' } });
    const clearBtn = screen.getByLabelText('Clear search');
    fireEvent.click(clearBtn);
    expect(input.value).toBe('');
  });

  it('expands the clear-search button hit area to the 44px touch-target floor without moving the icon', () => {
    render(<ProductGrid activeCategory={ALL_ID} />);
    const input = screen.getByLabelText('Search products');
    fireEvent.change(input, { target: { value: 'test' } });
    const clearBtn = screen.getByLabelText('Clear search');
    // The icon keeps its own w-4 h-4 box; only the invisible `before` pseudo-element grows the
    // hit area, so the button itself must stay absolutely positioned (unchanged) and gain the
    // before:inset-[-14px] expansion — never `relative`, which would break its own placement.
    expect(clearBtn.className).toContain('absolute');
    expect(clearBtn.className).toContain('before:inset-[-14px]');
    expect(clearBtn.querySelector('svg')?.getAttribute('class')).toContain('w-4 h-4');
  });

  it('expands the category tab hit area vertically without changing horizontal reach', () => {
    render(<ProductGrid activeCategory={ALL_ID} />);
    const tab = screen.getByRole('tab', { name: /All Products/i });
    expect(tab.className).toContain('before:inset-y-[-5px]');
    expect(tab.className).toContain('before:inset-x-0');
  });

  it('handles category filter change', () => {
    render(<ProductGrid activeCategory={ALL_ID} />);
    const tabs = screen.getAllByRole('tab');
    const initialLinks = screen.getAllByRole('link').length;

    // Click second tab (first category)
    fireEvent.click(tabs[1]);

    expect(tabs[1].getAttribute('aria-selected')).toBe('true');
    expect(tabs[0].getAttribute('aria-selected')).toBe('false');
    expect(screen.getAllByRole('link').length).toBeLessThan(initialLinks);
  });

  it('marks the active category tab with its own colour rule', () => {
    render(<ProductGrid activeCategory={ALL_ID} />);
    const tablist = screen.getByRole('tablist');
    fireEvent.click(screen.getAllByRole('tab')[1]);

    expect(tablist.querySelectorAll('.bg-category-hygiene')).toHaveLength(1);
    expect(tablist.querySelectorAll('.bg-ink')).toHaveLength(0);
  });

  it('searches material and variant labels, not just the product name', () => {
    render(<ProductGrid activeCategory={ALL_ID} />);
    const input = screen.getByLabelText('Search products');

    // 'ABS plastic' is a material and appears in no product NAME at all, so a hit here cannot
    // have come from the name branch of the filter.
    fireEvent.change(input, { target: { value: 'abs plastic' } });
    expect(screen.getAllByRole('link').length).toBeGreaterThan(0);
    expect(PRODUCTS.filter((p) => p.name.toLowerCase().includes('abs plastic'))).toHaveLength(0);

    // '5 kg' is a variant label, likewise absent from every product name.
    fireEvent.change(input, { target: { value: '5 kg' } });
    expect(screen.getAllByRole('link').length).toBeGreaterThan(0);
    expect(PRODUCTS.filter((p) => p.name.toLowerCase().includes('5 kg'))).toHaveLength(0);
  });

  it('shows no results message when search has no matches', () => {
    render(<ProductGrid activeCategory={ALL_ID} />);
    const input = screen.getByLabelText('Search products');
    fireEvent.change(input, { target: { value: 'xyznonexistent123' } });
    expect(screen.getByText('No products found')).toBeTruthy();
  });

  it('shows clear filters button in no results state', () => {
    render(<ProductGrid activeCategory={ALL_ID} />);
    const input = screen.getByLabelText('Search products');
    fireEvent.change(input, { target: { value: 'xyznonexistent123' } });
    const clearFilters = screen.getByText('Clear filters');
    expect(clearFilters).toBeTruthy();
    fireEvent.click(clearFilters);
    expect((input as HTMLInputElement).value).toBe('');
  });
});

describe('ProductGrid category prop', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('filters to the prop category on first render, before any interaction', () => {
    render(<ProductGrid activeCategory="spa-salon" />);

    // `productsInCategory` is what the grid itself filters with, so the two shower caps that
    // carry `secondaryCategory: 'spa-salon'` are expected here even though their primary
    // category is hotel amenities.
    const expected = productsInCategory('spa-salon');
    expect(expected.length).toBeGreaterThan(
      PRODUCTS.filter((p) => p.category.slug === 'spa-salon').length,
    );
    expect(screen.getAllByRole('link')).toHaveLength(expected.length);
    expect(screen.getByRole('tab', { selected: true }).getAttribute('id')).toBe('tab-spa-salon');
  });

  it('re-syncs when the URL changes underneath it', () => {
    // Browser back/forward, or following a `?category=` link from the landing page: the server
    // hands down a new prop while the component stays mounted. Without the render-phase sync the
    // tabs would keep showing the stale category.
    const { rerender } = render(<ProductGrid activeCategory={ALL_ID} />);
    expect(screen.getAllByRole('link')).toHaveLength(PRODUCTS.length);

    rerender(<ProductGrid activeCategory="hotel-amenities" />);

    const expected = productsInCategory('hotel-amenities');
    expect(screen.getAllByRole('link')).toHaveLength(expected.length);
    expect(screen.getByRole('tab', { selected: true }).getAttribute('id')).toBe(
      'tab-hotel-amenities',
    );
  });

  it('keeps the typed search term when the URL category changes', () => {
    const { rerender } = render(<ProductGrid activeCategory={ALL_ID} />);
    const input = screen.getByLabelText('Search products') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'soap' } });

    rerender(<ProductGrid activeCategory="spa-salon" />);

    expect((screen.getByLabelText('Search products') as HTMLInputElement).value).toBe('soap');
  });

  it('writes the chosen category into the URL, and drops the param for "all"', () => {
    render(<ProductGrid activeCategory={ALL_ID} />);
    const { replace } = useRouter();

    fireEvent.click(screen.getByRole('tab', { name: /Spa/i }));
    expect(replace).toHaveBeenLastCalledWith('/products?category=spa-salon', { scroll: false });

    fireEvent.click(screen.getByRole('tab', { name: /All Products/i }));
    expect(replace).toHaveBeenLastCalledWith('/products', { scroll: false });
  });
});

/**
 * The WAI-ARIA tabs pattern's keyboard interaction. Arrow keys move focus only — activation is
 * manual, so a `Space`/`Enter` on the focused tab is what selects it, which a native `<button>`
 * already provides. These assertions are the only thing standing between the tablist and the
 * plain-buttons state it was in, where Tab stepped through every tab and arrows did nothing.
 */
describe('ProductGrid category tablist keyboard navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /** Index of the active tab in the tablist's own DOM order — 0 is "All Products". */
  const focusedIndex = () =>
    screen.getAllByRole('tab').findIndex((tab) => tab === document.activeElement);

  it('puts only the selected tab in the page tab sequence', () => {
    render(<ProductGrid activeCategory="spa-salon" />);
    const tabs = screen.getAllByRole('tab');

    const inSequence = tabs.filter((tab) => tab.getAttribute('tabindex') === '0');
    expect(inSequence).toHaveLength(1);
    expect(inSequence[0].getAttribute('id')).toBe('tab-spa-salon');
    tabs
      .filter((tab) => tab.getAttribute('id') !== 'tab-spa-salon')
      .forEach((tab) => expect(tab.getAttribute('tabindex')).toBe('-1'));
  });

  it('moves focus right and left, wrapping at both ends', () => {
    render(<ProductGrid activeCategory={ALL_ID} />);
    const tabs = screen.getAllByRole('tab');
    const last = tabs.length - 1;

    tabs[0].focus();
    fireEvent.keyDown(tabs[0], { key: 'ArrowRight' });
    expect(focusedIndex()).toBe(1);

    fireEvent.keyDown(tabs[1], { key: 'ArrowLeft' });
    expect(focusedIndex()).toBe(0);

    // Wrap backwards off the first tab, then forwards off the last.
    fireEvent.keyDown(tabs[0], { key: 'ArrowLeft' });
    expect(focusedIndex()).toBe(last);

    fireEvent.keyDown(tabs[last], { key: 'ArrowRight' });
    expect(focusedIndex()).toBe(0);
  });

  it('jumps to the first and last tab on Home and End', () => {
    render(<ProductGrid activeCategory={ALL_ID} />);
    const tabs = screen.getAllByRole('tab');

    tabs[0].focus();
    fireEvent.keyDown(tabs[0], { key: 'End' });
    expect(focusedIndex()).toBe(tabs.length - 1);

    fireEvent.keyDown(tabs[tabs.length - 1], { key: 'Home' });
    expect(focusedIndex()).toBe(0);
  });

  it('does not activate the newly focused tab — activation is manual', () => {
    render(<ProductGrid activeCategory={ALL_ID} />);
    const { replace } = useRouter();
    const tabs = screen.getAllByRole('tab');

    tabs[0].focus();
    fireEvent.keyDown(tabs[0], { key: 'ArrowRight' });

    // Focus moved, but nothing was selected, nothing re-filtered and nothing was written to the
    // URL. Re-filtering a 164-product grid on every arrow keypress is what manual activation buys.
    expect(focusedIndex()).toBe(1);
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
    expect(tabs[1].getAttribute('aria-selected')).toBe('false');
    expect(replace).not.toHaveBeenCalled();
    expect(screen.getAllByRole('link')).toHaveLength(PRODUCTS.length);

    // …and the focused tab activates on click, which is also what Enter/Space fire on a button.
    fireEvent.click(tabs[1]);
    expect(tabs[1].getAttribute('aria-selected')).toBe('true');
  });

  it('leaves every other key to the browser', () => {
    render(<ProductGrid activeCategory={ALL_ID} />);
    const tabs = screen.getAllByRole('tab');

    tabs[0].focus();
    // `Tab` in particular must not be swallowed — it is how focus leaves the tablist.
    fireEvent.keyDown(tabs[0], { key: 'Tab' });
    fireEvent.keyDown(tabs[0], { key: 'ArrowDown' });
    expect(focusedIndex()).toBe(0);
  });
});

/**
 * The sub-category refinement row. It subdivides `hygiene-safety-housekeeping` only — 133 of the
 * catalogue's 164 products sit in that one category, which is the whole reason the row exists.
 *
 * Every expected count below is derived from the catalogue constants. A literal would pass today
 * and then quietly assert the wrong thing the next time the client's catalogue moves.
 */
describe('ProductGrid sub-category refinement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const refinementRow = () => screen.getByRole('group', { name: 'Refine by sub-category' });
  const chip = (name: string | RegExp) => within(refinementRow()).getByRole('button', { name });

  it('renders only under the category it subdivides', () => {
    const { rerender } = render(<ProductGrid activeCategory={ALL_ID} />);
    expect(screen.queryByRole('group', { name: 'Refine by sub-category' })).toBeNull();

    rerender(<ProductGrid activeCategory="spa-salon" />);
    expect(screen.queryByRole('group', { name: 'Refine by sub-category' })).toBeNull();

    rerender(<ProductGrid activeCategory={SUB_CATEGORY_PARENT} />);
    expect(refinementRow()).toBeTruthy();
  });

  it('appears when the visitor clicks through to that tab, and leaves again when they click away', () => {
    render(<ProductGrid activeCategory={ALL_ID} />);
    expect(screen.queryByRole('group', { name: 'Refine by sub-category' })).toBeNull();

    fireEvent.click(screen.getByRole('tab', { name: /Hygiene/i }));
    expect(refinementRow()).toBeTruthy();

    fireEvent.click(screen.getByRole('tab', { name: /Spa/i }));
    expect(screen.queryByRole('group', { name: 'Refine by sub-category' })).toBeNull();
  });

  it('is a labelled group, not a second tablist', () => {
    render(<ProductGrid activeCategory={SUB_CATEGORY_PARENT} />);

    // Two nested tablists controlling one panel is incoherent for a screen reader, so there must
    // still be exactly one — the category dimension.
    expect(screen.getAllByRole('tablist')).toHaveLength(1);
    expect(within(refinementRow()).queryAllByRole('tab')).toHaveLength(0);
    expect(refinementRow().getAttribute('role')).toBe('group');
  });

  it('offers an "All" control plus one chip per sub-category, each with a derived count', () => {
    render(<ProductGrid activeCategory={SUB_CATEGORY_PARENT} />);
    const chips = within(refinementRow()).getAllByRole('button');

    expect(chips).toHaveLength(SUB_CATEGORIES.length + 1);
    expect(chips[0].textContent).toBe(`All${PRODUCT_COUNT_BY_CATEGORY[SUB_CATEGORY_PARENT]}`);
    SUB_CATEGORIES.forEach((sub, i) => {
      expect(chips[i + 1].textContent).toBe(`${sub.name}${productsInSubCategory(sub.slug).length}`);
    });
  });

  it('tracks the selection with aria-pressed, with "All" pressed until one is chosen', () => {
    render(<ProductGrid activeCategory={SUB_CATEGORY_PARENT} />);
    const pressed = () =>
      within(refinementRow())
        .getAllByRole('button')
        .filter((b) => b.getAttribute('aria-pressed') === 'true')
        .map((b) => b.textContent);

    expect(pressed()).toEqual([`All${PRODUCT_COUNT_BY_CATEGORY[SUB_CATEGORY_PARENT]}`]);

    fireEvent.click(chip(/air care/i));

    // Exactly one at a time: choosing a sub-category must un-press "All".
    expect(pressed()).toEqual([`Air Care${productsInSubCategory('air-care').length}`]);
  });

  it('marks the pressed chip for the custom cursor, since it inverts to an ink ground', () => {
    render(<ProductGrid activeCategory={SUB_CATEGORY_PARENT} />);
    const airCare = chip(/air care/i);
    expect(airCare.hasAttribute('data-cursor-invert')).toBe(false);

    fireEvent.click(airCare);
    expect(airCare.hasAttribute('data-cursor-invert')).toBe(true);
  });

  it('filters the grid and the result count to the chosen sub-category', () => {
    render(<ProductGrid activeCategory={SUB_CATEGORY_PARENT} />);
    const expected = productsInSubCategory('cleaning-chemicals');
    expect(screen.getAllByRole('link')).toHaveLength(
      productsInCategory(SUB_CATEGORY_PARENT).length,
    );

    fireEvent.click(chip(/cleaning chemicals/i));

    expect(screen.getAllByRole('link')).toHaveLength(expected.length);
    expect(screen.getByText(`${expected.length} products`)).toBeTruthy();
    screen.getAllByRole('link').forEach((link) => {
      const slug = link.getAttribute('href')?.replace('/products/', '');
      expect(expected.some((p) => p.slug === slug)).toBe(true);
    });
  });

  it('returns to the whole category when "All" is chosen again', () => {
    render(<ProductGrid activeCategory={SUB_CATEGORY_PARENT} />);
    fireEvent.click(chip(/tissues & paper/i));
    expect(screen.getAllByRole('link')).toHaveLength(productsInSubCategory('tissues-paper').length);

    fireEvent.click(chip(/^All/));
    expect(screen.getAllByRole('link')).toHaveLength(
      productsInCategory(SUB_CATEGORY_PARENT).length,
    );
  });

  it('composes with the search field rather than replacing it', () => {
    render(<ProductGrid activeCategory={SUB_CATEGORY_PARENT} />);
    fireEvent.click(chip(/personal protection/i));
    const inSub = productsInSubCategory('personal-protection');

    const input = screen.getByLabelText('Search products');
    fireEvent.change(input, { target: { value: 'glove' } });

    const expected = inSub.filter((p) => p.name.toLowerCase().includes('glove'));
    expect(expected.length).toBeGreaterThan(0);
    expect(expected.length).toBeLessThan(inSub.length);
    expect(screen.getAllByRole('link')).toHaveLength(expected.length);
  });

  it('writes the sub-category into the URL beside the category, and drops it for "All"', () => {
    render(<ProductGrid activeCategory={SUB_CATEGORY_PARENT} />);
    const { replace } = useRouter();

    fireEvent.click(chip(/dust bins & waste/i));
    expect(replace).toHaveBeenLastCalledWith(
      `/products?category=${SUB_CATEGORY_PARENT}&sub=dust-bins-waste`,
      { scroll: false },
    );

    fireEvent.click(chip(/^All/));
    expect(replace).toHaveBeenLastCalledWith(`/products?category=${SUB_CATEGORY_PARENT}`, {
      scroll: false,
    });
  });

  it('clears the sub-category when the visitor changes category', () => {
    render(<ProductGrid activeCategory={SUB_CATEGORY_PARENT} activeSubCategory="air-care" />);
    const { replace } = useRouter();
    expect(screen.getAllByRole('link')).toHaveLength(productsInSubCategory('air-care').length);

    fireEvent.click(screen.getByRole('tab', { name: /Spa/i }));

    // No `sub=` survives the move: it subdivides one category and cannot apply to another.
    expect(replace).toHaveBeenLastCalledWith('/products?category=spa-salon', { scroll: false });
    expect(screen.getAllByRole('link')).toHaveLength(productsInCategory('spa-salon').length);

    // And it is really gone, not merely hidden — coming back shows the unfiltered category.
    fireEvent.click(screen.getByRole('tab', { name: /Hygiene/i }));
    expect(screen.getAllByRole('link')).toHaveLength(
      productsInCategory(SUB_CATEGORY_PARENT).length,
    );
    expect(chip(/^All/).getAttribute('aria-pressed')).toBe('true');
  });

  it('is reset by the empty state’s "Clear filters" button', () => {
    render(
      <ProductGrid activeCategory={SUB_CATEGORY_PARENT} activeSubCategory="disposable-linen" />,
    );
    const input = screen.getByLabelText('Search products') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'xyznonexistent123' } });
    expect(screen.getByText('No products found')).toBeTruthy();

    fireEvent.click(screen.getByText('Clear filters'));

    expect(input.value).toBe('');
    expect(screen.queryByRole('group', { name: 'Refine by sub-category' })).toBeNull();
    expect(screen.getAllByRole('link')).toHaveLength(PRODUCTS.length);
  });

  it('filters from the server-resolved prop on first render, before any interaction', () => {
    render(
      <ProductGrid activeCategory={SUB_CATEGORY_PARENT} activeSubCategory="mops-brooms-wipers" />,
    );

    const expected = productsInSubCategory('mops-brooms-wipers');
    expect(screen.getAllByRole('link')).toHaveLength(expected.length);
    expect(chip(/mops, brooms & wipers/i).getAttribute('aria-pressed')).toBe('true');
    expect(chip(/^All/).getAttribute('aria-pressed')).toBe('false');
  });

  it('re-syncs when only the sub-category changes underneath it', () => {
    // Browser back/forward between two `?sub=` URLs on the same tab: the category prop never
    // moves, so a sync keyed on category alone would leave the stale refinement selected.
    const { rerender } = render(
      <ProductGrid activeCategory={SUB_CATEGORY_PARENT} activeSubCategory="air-care" />,
    );
    expect(screen.getAllByRole('link')).toHaveLength(productsInSubCategory('air-care').length);

    rerender(
      <ProductGrid
        activeCategory={SUB_CATEGORY_PARENT}
        activeSubCategory="equipment-accessories"
      />,
    );

    expect(screen.getAllByRole('link')).toHaveLength(
      productsInSubCategory('equipment-accessories').length,
    );
    expect(chip(/equipment & accessories/i).getAttribute('aria-pressed')).toBe('true');
  });
});

/**
 * The small-screen disclosure that wraps that same row.
 *
 * **How the breakpoint is simulated, and what that does and does not prove.** jsdom has no layout
 * engine and no media-query engine: it loads no stylesheet, so `getComputedStyle` never sees a
 * Tailwind class, and `setup.ts` stubs `window.matchMedia` to answer `false` to everything. These
 * tests therefore swap that stub for one that answers `true` to the component's own
 * `(max-width: 639.98px)` query, and drive resizes by replaying the captured `change` listener.
 *
 * That exercises every branch the component owns — the `hidden` attribute, `aria-expanded`, the
 * trigger's copy, the collapse-on-selection — and those are real accessibility-tree assertions,
 * because Testing Library's role queries honour the `hidden` attribute with no CSS at all. It
 * proves nothing about the `hidden` / `sm:flex` class pair that does the painting; that half is
 * asserted as classes here and measured for real by Playwright at 375px.
 */
describe('ProductGrid sub-category disclosure below sm', () => {
  type MediaListener = () => void;

  const listeners = new Set<MediaListener>();
  let compactViewport = false;
  let originalMatchMedia: typeof window.matchMedia;

  beforeEach(() => {
    vi.clearAllMocks();
    listeners.clear();
    compactViewport = false;
    originalMatchMedia = window.matchMedia;
    window.matchMedia = ((query: string) => ({
      // A getter, not a fixed value: a real `MediaQueryList` is LIVE, and the component holds one
      // instance across its whole lifetime and re-reads `.matches` inside the `change` handler. A
      // snapshot here would make every resize a no-op and quietly pass the collapsed assertion for
      // the wrong reason. Only the component's compact query flips; anything else (a
      // reduced-motion probe from a neighbouring component, say) answers `false` as `setup.ts` does.
      get matches() {
        return query.includes('max-width') ? compactViewport : false;
      },
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: (_: string, fn: MediaListener) => listeners.add(fn),
      removeEventListener: (_: string, fn: MediaListener) => listeners.delete(fn),
      dispatchEvent: vi.fn(),
    })) as unknown as typeof window.matchMedia;
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  /** Render at a viewport narrower than `sm`, where the disclosure is live. */
  const renderCompact = (ui: ReactElement) => {
    compactViewport = true;
    return render(ui);
  };

  /** Replay the media-query `change` listener the component registered. */
  const resizeTo = (compact: boolean) => {
    compactViewport = compact;
    act(() => {
      listeners.forEach((fn) => fn());
    });
  };

  const trigger = () => screen.getByRole('button', { name: /refine by sub-category/i });
  const groupInDom = () =>
    document.querySelector('[role="group"][aria-label="Refine by sub-category"]');
  const groupInA11yTree = () => screen.queryByRole('group', { name: 'Refine by sub-category' });

  it('is a real disclosure — a button wired by aria-expanded and aria-controls to the group', () => {
    renderCompact(<ProductGrid activeCategory={SUB_CATEGORY_PARENT} />);

    const button = trigger();
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(button.getAttribute('aria-controls')).toBe(groupInDom()?.getAttribute('id'));
    expect(button.getAttribute('aria-controls')).toBeTruthy();
  });

  it('removes itself at sm and above, where the group is unconditionally open', () => {
    // jsdom cannot evaluate `sm:hidden`, so this is a class assertion and is honest about it: the
    // *behavioural* half — that the group is open and un-collapsed without a trigger — is what the
    // next test asserts against the accessibility tree.
    renderCompact(<ProductGrid activeCategory={SUB_CATEGORY_PARENT} />);
    expect(trigger().className).toContain('sm:hidden');
  });

  it('leaves the group open, with no hidden attribute, at sm and above', () => {
    render(<ProductGrid activeCategory={SUB_CATEGORY_PARENT} />);

    expect(groupInA11yTree()).toBeTruthy();
    expect(groupInDom()?.hasAttribute('hidden')).toBe(false);
    // …and the paint half: `sm:flex` is what re-shows it above the breakpoint.
    expect(groupInDom()?.className).toContain('sm:flex');
  });

  it('takes the chips out of the accessibility tree while collapsed, not merely out of sight', () => {
    renderCompact(<ProductGrid activeCategory={SUB_CATEGORY_PARENT} />);

    // Still in the DOM — the chips reach a crawler and survive a resize to desktop…
    expect(groupInDom()).toBeTruthy();
    // …but gone from the accessibility tree and the tab order with it. An implementation that only
    // swapped a `hidden` CSS class would pass a class assertion and fail every line below.
    expect(groupInA11yTree()).toBeNull();
    const reachable = screen.getAllByRole('button').map((b) => b.textContent ?? '');
    SUB_CATEGORIES.forEach((sub) => {
      expect(reachable.some((name) => name.startsWith(sub.name))).toBe(false);
    });
    expect(reachable.some((name) => name.startsWith('All'))).toBe(false);
  });

  it('reveals the same group — not a second copy of it — when opened', () => {
    renderCompact(<ProductGrid activeCategory={SUB_CATEGORY_PARENT} />);
    fireEvent.click(trigger());

    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    const group = groupInA11yTree();
    expect(group).toBeTruthy();
    expect(group).toBe(groupInDom());
    expect(document.querySelectorAll('[role="group"]')).toHaveLength(1);
    expect(within(group as HTMLElement).getAllByRole('button')).toHaveLength(
      SUB_CATEGORIES.length + 1,
    );
  });

  it('names the dimension and its scale while nothing is refined', () => {
    renderCompact(<ProductGrid activeCategory={SUB_CATEGORY_PARENT} />);

    // Derived, not written down: the day an eleventh sub-category is added this has to move.
    expect(trigger().textContent).toBe(`Refine by sub-category${SUB_CATEGORIES.length} ranges`);
  });

  it('names the active sub-category instead, so a closed row never hides the current filter', () => {
    renderCompact(
      <ProductGrid activeCategory={SUB_CATEGORY_PARENT} activeSubCategory="air-care" />,
    );

    // Collapsed on arrival even from a `?sub=` deep link — that visitor wants the products.
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
    expect(groupInA11yTree()).toBeNull();
    expect(screen.getAllByRole('link')).toHaveLength(productsInSubCategory('air-care').length);

    const airCare = SUB_CATEGORIES.find((s) => s.slug === 'air-care');
    expect(trigger().textContent).toBe(
      `Refine by sub-category: ${airCare?.name}${PRODUCT_COUNT_BY_SUB_CATEGORY['air-care']}`,
    );
  });

  it('collapses again when a chip is chosen, and then names the choice', () => {
    renderCompact(<ProductGrid activeCategory={SUB_CATEGORY_PARENT} />);
    fireEvent.click(trigger());

    const group = groupInA11yTree() as HTMLElement;
    fireEvent.click(within(group).getByRole('button', { name: /cleaning chemicals/i }));

    // The grid the visitor just asked for is back within reach instead of below 400px of filters…
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
    expect(groupInA11yTree()).toBeNull();
    expect(screen.getAllByRole('link')).toHaveLength(
      productsInSubCategory('cleaning-chemicals').length,
    );

    // …and the collapsed trigger still says what is filtering it.
    const cleaning = SUB_CATEGORIES.find((s) => s.slug === 'cleaning-chemicals');
    expect(trigger().textContent).toBe(
      `Refine by sub-category: ${cleaning?.name}${PRODUCT_COUNT_BY_SUB_CATEGORY['cleaning-chemicals']}`,
    );
  });

  it('is collapsed again on returning to the tab, not restored to however it was left', () => {
    renderCompact(<ProductGrid activeCategory={SUB_CATEGORY_PARENT} />);
    fireEvent.click(trigger());
    expect(trigger().getAttribute('aria-expanded')).toBe('true');

    fireEvent.click(screen.getByRole('tab', { name: /Spa/i }));
    fireEvent.click(screen.getByRole('tab', { name: /Hygiene/i }));

    expect(trigger().getAttribute('aria-expanded')).toBe('false');
    expect(groupInA11yTree()).toBeNull();
  });

  it('collapses and re-opens the group as the viewport crosses the breakpoint', () => {
    render(<ProductGrid activeCategory={SUB_CATEGORY_PARENT} />);
    expect(groupInA11yTree()).toBeTruthy();

    resizeTo(true);
    expect(groupInA11yTree()).toBeNull();

    resizeTo(false);
    expect(groupInA11yTree()).toBeTruthy();
  });

  it('stops listening for breakpoint changes when it unmounts', () => {
    const { unmount } = render(<ProductGrid activeCategory={SUB_CATEGORY_PARENT} />);
    expect(listeners.size).toBe(1);

    unmount();
    expect(listeners.size).toBe(0);
  });
});
