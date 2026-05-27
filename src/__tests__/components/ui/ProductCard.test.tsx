import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProductCard } from '@/components/ui/ProductCard';
import type { ProductItem } from '@/types';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('lucide-react', () => ({
  ArrowRight: (props: any) => <svg data-testid="arrow-right" {...props} />,
}));

const mockProduct: ProductItem = {
  id: 'surgeon-cap',
  name: 'Disposable Surgeon Cap',
  category: {
    id: 'hygiene-safety',
    name: 'Disposable Hygiene & Safety',
    slug: 'hygiene-safety',
    description: 'Medical-grade disposable protective wear.',
    icon: '🏥',
    productCount: 17,
  },
  material: 'Non-woven',
  description: 'Sterile disposable surgeon cap for operating theatres.',
  slug: 'surgeon-cap',
};

describe('ProductCard', () => {
  it('renders product name', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('Disposable Surgeon Cap')).toBeTruthy();
  });

  it('renders category badge', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('Disposable Hygiene & Safety')).toBeTruthy();
  });

  it('renders material when present', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('Material: Non-woven')).toBeTruthy();
  });

  it('does not render material when absent', () => {
    const productNoMaterial = { ...mockProduct, material: undefined };
    render(<ProductCard product={productNoMaterial} />);
    expect(screen.queryByText(/Material:/)).toBeNull();
  });

  it('links to product page', () => {
    render(<ProductCard product={mockProduct} />);
    const link = screen.getByRole('link');
    expect(link.getAttribute('href')).toBe('/products/surgeon-cap');
  });

  it('renders View Details CTA', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('View Details')).toBeTruthy();
  });

  it('applies custom className', () => {
    const { container } = render(<ProductCard product={mockProduct} className="extra-class" />);
    const link = container.querySelector('a');
    expect(link?.className).toContain('extra-class');
  });
});
