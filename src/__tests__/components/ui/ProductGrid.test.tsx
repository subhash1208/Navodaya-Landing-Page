import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductGrid } from '@/components/ui/ProductGrid';

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
// tab-filter path is exercised against the route the component actually runs on. The
// `useSearchParams()` instance is module-level here for the same reason it is in `setup.ts`: a
// fresh object per call would change the `[searchParams]` dependency identity on every render and
// re-fire the effect that syncs `activeCategory`.
vi.mock('next/navigation', () => {
  const params = new URLSearchParams();
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
    useSearchParams: () => params,
  };
});

describe('ProductGrid', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders products', () => {
    render(<ProductGrid />);
    // Should render product cards
    expect(screen.getByPlaceholderText('Search products…')).toBeTruthy();
  });

  it('renders one catalogue link per result', () => {
    render(<ProductGrid />);
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
    links.forEach((link) => expect(link.getAttribute('href')).toMatch(/^\/products\//));
  });

  it('renders no photo placeholder', () => {
    const { container } = render(<ProductGrid />);
    expect(screen.queryByText(/photo coming soon/i)).toBeNull();
    expect(container.querySelector('img')).toBeNull();
  });

  it('renders search input', () => {
    render(<ProductGrid />);
    const input = screen.getByLabelText('Search products');
    expect(input).toBeTruthy();
  });

  it('renders category tabs', () => {
    render(<ProductGrid />);
    expect(screen.getByRole('tab', { name: /All Products/i })).toBeTruthy();
  });

  it('marks the active tab with a single ink rule', () => {
    render(<ProductGrid />);
    const tablist = screen.getByRole('tablist');
    expect(tablist.querySelectorAll('.bg-ink')).toHaveLength(1);
    expect(screen.getByRole('tab', { name: /All Products/i }).getAttribute('aria-selected')).toBe(
      'true',
    );
  });

  it('reports the result count in the plural', () => {
    render(<ProductGrid />);
    expect(screen.getByText(/^\d+ products$/)).toBeTruthy();
  });

  it('reports the result count in the singular when one product matches', () => {
    render(<ProductGrid />);
    const input = screen.getByLabelText('Search products');
    fireEvent.change(input, { target: { value: 'langot' } });
    expect(screen.getByText('1 product')).toBeTruthy();
  });

  it('handles search input', () => {
    render(<ProductGrid />);
    const input = screen.getByLabelText('Search products');
    fireEvent.change(input, { target: { value: 'surgeon' } });
    expect((input as HTMLInputElement).value).toBe('surgeon');
  });

  it('shows clear button when search has value', () => {
    render(<ProductGrid />);
    const input = screen.getByLabelText('Search products');
    fireEvent.change(input, { target: { value: 'test' } });
    const clearBtn = screen.getByLabelText('Clear search');
    expect(clearBtn).toBeTruthy();
  });

  it('clears search when clear button clicked', () => {
    render(<ProductGrid />);
    const input = screen.getByLabelText('Search products') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'test' } });
    const clearBtn = screen.getByLabelText('Clear search');
    fireEvent.click(clearBtn);
    expect(input.value).toBe('');
  });

  it('handles category filter change', () => {
    render(<ProductGrid />);
    const tabs = screen.getAllByRole('tab');
    const initialLinks = screen.getAllByRole('link').length;

    // Click second tab (first category)
    fireEvent.click(tabs[1]);

    expect(tabs[1].getAttribute('aria-selected')).toBe('true');
    expect(tabs[0].getAttribute('aria-selected')).toBe('false');
    expect(screen.getAllByRole('link').length).toBeLessThan(initialLinks);
  });

  it('marks the active category tab with its own colour rule', () => {
    render(<ProductGrid />);
    const tablist = screen.getByRole('tablist');
    fireEvent.click(screen.getAllByRole('tab')[1]);

    expect(tablist.querySelectorAll('.bg-category-hygiene')).toHaveLength(1);
    expect(tablist.querySelectorAll('.bg-ink')).toHaveLength(0);
  });

  it('shows no results message when search has no matches', () => {
    render(<ProductGrid />);
    const input = screen.getByLabelText('Search products');
    fireEvent.change(input, { target: { value: 'xyznonexistent123' } });
    expect(screen.getByText('No products found')).toBeTruthy();
  });

  it('shows clear filters button in no results state', () => {
    render(<ProductGrid />);
    const input = screen.getByLabelText('Search products');
    fireEvent.change(input, { target: { value: 'xyznonexistent123' } });
    const clearFilters = screen.getByText('Clear filters');
    expect(clearFilters).toBeTruthy();
    fireEvent.click(clearFilters);
    expect((input as HTMLInputElement).value).toBe('');
  });
});
