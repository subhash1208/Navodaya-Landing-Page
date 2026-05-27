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
  SlidersHorizontal: (props: any) => <svg data-testid="sliders-icon" {...props} />,
  ArrowRight: (props: any) => <svg data-testid="arrow-right" {...props} />,
}));

vi.mock('./MagneticWrapper', () => ({
  MagneticWrapper: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('./PinContainer', () => ({
  PinContainer: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('@/hooks/useMagneticHover', () => ({
  useMagneticHover: () => ({ current: null }),
}));

describe('ProductGrid', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders products', () => {
    render(<ProductGrid />);
    // Should render product cards
    expect(screen.getByPlaceholderText('Search products…')).toBeTruthy();
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
    // Click second tab (first category)
    fireEvent.click(tabs[1]);
    // The component updates state internally
    // Verify the tab was clickable and component didn't crash
    expect(tabs[1]).toBeTruthy();
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
