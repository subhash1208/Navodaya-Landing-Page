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

const hotelProduct: ProductItem = {
  ...mockProduct,
  id: 'terry-slippers',
  name: 'Terry Slippers',
  slug: 'terry-slippers',
  category: { ...mockProduct.category, id: 'hotel-amenities', slug: 'hotel-amenities' },
};

const spaProduct: ProductItem = {
  ...mockProduct,
  id: 'waxing-gown',
  name: 'Waxing Gown',
  slug: 'waxing-gown',
  category: { ...mockProduct.category, id: 'spa-salon', slug: 'spa-salon' },
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

  it('renders the product description', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('Sterile disposable surgeon cap for operating theatres.')).toBeTruthy();
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
    render(<ProductCard product={mockProduct} className="extra-class" />);
    const link = screen.getByRole('link');
    expect(link.className).toContain('extra-class');
  });

  it('renders a catalogue reference derived from the category and product slugs', () => {
    render(<ProductCard product={mockProduct} />);
    const reference = screen.getByText('hs-surgeon-cap');
    expect(reference).toBeTruthy();
    // Decorative — it must not pollute the accessible name of the link.
    expect(reference.getAttribute('aria-hidden')).toBe('true');
  });

  it('renders no photo placeholder', () => {
    const { container } = render(<ProductCard product={mockProduct} />);
    expect(screen.queryByText(/photo coming soon/i)).toBeNull();
    expect(container.querySelector('img')).toBeNull();
  });

  it('marks a hygiene product with exactly one hygiene colour rule', () => {
    const { container } = render(<ProductCard product={mockProduct} />);
    expect(container.querySelectorAll('.bg-category-hygiene')).toHaveLength(1);
    expect(container.querySelectorAll('.bg-category-hotel')).toHaveLength(0);
    expect(container.querySelectorAll('.bg-category-spa')).toHaveLength(0);
  });

  it('marks a hotel product with exactly one hotel colour rule', () => {
    const { container } = render(<ProductCard product={hotelProduct} />);
    expect(container.querySelectorAll('.bg-category-hotel')).toHaveLength(1);
    expect(container.querySelectorAll('.bg-category-hygiene')).toHaveLength(0);
    expect(container.querySelectorAll('.bg-category-spa')).toHaveLength(0);
  });

  it('marks a spa product with exactly one spa colour rule', () => {
    const { container } = render(<ProductCard product={spaProduct} />);
    expect(container.querySelectorAll('.bg-category-spa')).toHaveLength(1);
    expect(container.querySelectorAll('.bg-category-hygiene')).toHaveLength(0);
    expect(container.querySelectorAll('.bg-category-hotel')).toHaveLength(0);
  });
});
