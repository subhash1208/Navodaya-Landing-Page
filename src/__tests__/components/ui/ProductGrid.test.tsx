import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { ALL_ID, ProductGrid } from '@/components/ui/ProductGrid';
import { PRODUCTS } from '@/constants';

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
    expect(container.querySelector('img')).toBeNull();
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

  it('marks the active tab with a single ink rule', () => {
    render(<ProductGrid activeCategory={ALL_ID} />);
    const tablist = screen.getByRole('tablist');
    expect(tablist.querySelectorAll('.bg-ink')).toHaveLength(1);
    expect(screen.getByRole('tab', { name: /All Products/i }).getAttribute('aria-selected')).toBe(
      'true',
    );
  });

  it('reports the result count in the plural', () => {
    render(<ProductGrid activeCategory={ALL_ID} />);
    expect(screen.getByText(/^\d+ products$/)).toBeTruthy();
  });

  it('reports the result count in the singular when one product matches', () => {
    render(<ProductGrid activeCategory={ALL_ID} />);
    const input = screen.getByLabelText('Search products');
    fireEvent.change(input, { target: { value: 'langot' } });
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

    const expected = PRODUCTS.filter((p) => p.category.slug === 'spa-salon');
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

    const expected = PRODUCTS.filter((p) => p.category.slug === 'hotel-amenities');
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
