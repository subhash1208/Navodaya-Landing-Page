import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Suspense } from 'react';
import ProductsPage from '@/app/products/page';
import { metadata } from '@/app/products/page';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('lucide-react', () => ({
  ChevronRight: (props: any) => <svg data-testid="chevron-right" {...props} />,
}));

let shouldSuspend = false;
vi.mock('@/components/ui/ProductGrid', () => ({
  ProductGrid: () => {
    if (shouldSuspend) throw new Promise(() => {});
    return <div data-testid="product-grid">Grid</div>;
  },
}));

describe('ProductsPage', () => {
  beforeEach(() => {
    shouldSuspend = false;
  });

  it('renders page heading', () => {
    render(<ProductsPage />);
    expect(screen.getByText('Product Catalogue')).toBeTruthy();
  });

  it('renders product count description', () => {
    render(<ProductsPage />);
    expect(screen.getByText(/products across/)).toBeTruthy();
  });

  it('renders breadcrumb', () => {
    render(<ProductsPage />);
    expect(screen.getByText('Home')).toBeTruthy();
  });

  it('renders product grid', () => {
    render(<ProductsPage />);
    expect(screen.getByTestId('product-grid')).toBeTruthy();
  });

  it('renders breadcrumb with chevron icon', () => {
    render(<ProductsPage />);
    expect(screen.getByTestId('chevron-right')).toBeTruthy();
    expect(screen.getByText('Products')).toBeTruthy();
  });
});

describe('ProductsPage metadata', () => {
  it('has title', () => {
    expect(metadata.title).toBe('Product Catalogue');
  });

  it('has description', () => {
    expect(metadata.description).toContain('hygiene and care products');
  });
});

describe('GridSkeleton (Suspense fallback)', () => {
  it('renders skeleton loading grid when ProductGrid suspends', () => {
    shouldSuspend = true;

    const { container } = render(<ProductsPage />);

    // GridSkeleton renders a grid with aria-busy and pulse items
    const skeleton = container.querySelector('[aria-busy="true"]');
    expect(skeleton).toBeTruthy();
    expect(skeleton?.getAttribute('aria-label')).toBe('Loading products');

    // Should have 10 skeleton items
    const pulseItems = container.querySelectorAll('.animate-pulse');
    expect(pulseItems.length).toBe(10);
  });
});
