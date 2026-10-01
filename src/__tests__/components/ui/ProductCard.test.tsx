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

vi.mock('next/image', () => ({
  default: ({ fill, ...props }: any) => <img {...props} />,
}));

vi.mock('lucide-react', () => ({
  ArrowRight: (props: any) => <svg data-testid="arrow-right" {...props} />,
}));

const mockProduct: ProductItem = {
  id: 'surgeon-cap',
  name: 'Disposable Surgeon Cap',
  category: {
    id: 'hygiene-safety-housekeeping',
    name: 'Hygiene, Safety & Housekeeping',
    slug: 'hygiene-safety-housekeeping',
    description: 'Medical-grade disposable protective wear.',
    plate: '/categories/hygiene-safety.webp',
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

const packingProduct: ProductItem = {
  ...mockProduct,
  id: 'bubble-wrap',
  name: 'Bubble Wrap',
  slug: 'bubble-wrap',
  category: { ...mockProduct.category, id: 'protective-packing', slug: 'protective-packing' },
};

describe('ProductCard', () => {
  it('renders product name', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('Disposable Surgeon Cap')).toBeTruthy();
  });

  it('renders category badge', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('Hygiene, Safety & Housekeeping')).toBeTruthy();
  });

  it('renders the product description', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('Sterile disposable surgeon cap for operating theatres.')).toBeTruthy();
  });

  it('composes a summary from the data it has when a product carries no description', () => {
    // The client's catalogue supplies no product copy, so this is the state of all 164 products
    // today. The card must never show an empty paragraph or the word "undefined".
    const noCopy: ProductItem = {
      ...mockProduct,
      description: undefined,
      variants: [{ label: 'Small' }, { label: 'Large' }],
    };
    render(<ProductCard product={noCopy} />);
    expect(screen.getByText('Non-woven construction. Available in 2 options.')).toBeTruthy();
  });

  it('falls back to a category sentence when a product has neither copy, material nor variants', () => {
    const bare: ProductItem = { ...mockProduct, description: undefined, material: undefined };
    const { container } = render(<ProductCard product={bare} />);
    expect(screen.getByText(/Available for bulk supply/)).toBeTruthy();
    expect(container.textContent).not.toContain('undefined');
  });

  it('renders material when present', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('Material:')).toBeTruthy();
    expect(screen.getByText('Non-woven')).toBeTruthy();
  });

  it('does not render material when absent', () => {
    const productNoMaterial = { ...mockProduct, material: undefined };
    render(<ProductCard product={productNoMaterial} />);
    expect(screen.queryByText(/Material:/)).toBeNull();
  });

  it('reports a variant count only when there is a real choice to make', () => {
    const { unmount } = render(
      <ProductCard product={{ ...mockProduct, variants: [{ label: 'A' }, { label: 'B' }] }} />,
    );
    expect(screen.getByText('Options:')).toBeTruthy();
    expect(screen.getByText('2')).toBeTruthy();
    unmount();

    // A single variant is not a choice — two products in the catalogue have exactly one.
    render(<ProductCard product={{ ...mockProduct, variants: [{ label: 'A' }] }} />);
    expect(screen.queryByText('Options:')).toBeNull();
  });

  it('names the option axes rather than counting them for an axis-bearing product', () => {
    render(
      <ProductCard
        product={{
          ...mockProduct,
          variants: undefined,
          optionAxes: [
            { name: 'Size', values: ['500 ML', '1 L', '5 L'] },
            { name: 'Fragrance', values: ['Lavender', 'Jasmine'] },
          ],
        }}
      />,
    );
    expect(screen.getByText('Options:')).toBeTruthy();
    // Names, not a count: 3 × 2 = 6 would re-fabricate SKUs the source never asserted.
    expect(screen.getByText('Size, Fragrance')).toBeTruthy();
    expect(screen.queryByText('6')).toBeNull();
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
    // Twice: once in the specimen header, once as the empty plate's label. Both decorative, so
    // neither may pollute the accessible name of the link.
    const references = screen.getAllByText('hsh-surgeon-cap');
    expect(references).toHaveLength(2);
    references.forEach((node) => expect(node.getAttribute('aria-hidden')).toBe('true'));
  });

  it('renders a typographic plate, not an image, while a product has no photograph', () => {
    const { container } = render(<ProductCard product={mockProduct} />);
    expect(container.querySelector('img')).toBeNull();
    expect(screen.queryByText(/photo coming soon/i)).toBeNull();
    // The plate slot still reserves its 4:3 box so a grid row cannot go ragged once photos land.
    expect(container.querySelector('.aspect-\\[4\\/3\\]')).toBeTruthy();
  });

  it('renders the photograph once a product has one, with an explicit sizes hint', () => {
    render(<ProductCard product={{ ...mockProduct, image: '/products/surgeon-cap.webp' }} />);
    const image = screen.getByRole('img');
    expect(image.getAttribute('src')).toBe('/products/surgeon-cap.webp');
    expect(image.getAttribute('alt')).toBe('Disposable Surgeon Cap');
    expect(image.getAttribute('sizes')).toBe(
      '(min-width: 1280px) 22vw, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw',
    );
    // The reference label is the plate's EMPTY state — it must not sit on top of a photograph.
    expect(screen.getAllByText('hsh-surgeon-cap')).toHaveLength(1);
  });

  it('never overrides the grid photograph to eager — a page of these would regress LCP', () => {
    // A grid page renders up to 42 photographed cards, nearly all below the fold, so the card must
    // inherit next/image's `loading="lazy"` default and pass NO override. ProductViewer is the
    // deliberate opposite: it renders once, above the fold, and IS eager. Do not copy that here.
    //
    // Note what this can and cannot see: the next/image mock in this file forwards only the props
    // the component actually passes and supplies no default of its own, so the real lazy default
    // does not reach this DOM at all — `loading` is absent, not `'lazy'`. Asserting for `'lazy'`
    // would fail. Absence of the eager override is the invariant that matters, and the sibling
    // assertion in ProductViewer.test.tsx proves these two attribute names do render when set.
    render(<ProductCard product={{ ...mockProduct, image: '/products/surgeon-cap.webp' }} />);
    const image = screen.getByRole('img');
    expect(image.getAttribute('loading')).not.toBe('eager');
    expect(image.getAttribute('fetchpriority')).not.toBe('high');
  });

  it('contains the photograph rather than cropping it', () => {
    // Every approved photo is an 800x600 cutout that already fits its frame with ~6% margin, so
    // `fill`'s default object-cover would slice the product's edges off. This is correctness.
    render(<ProductCard product={{ ...mockProduct, image: '/products/surgeon-cap.webp' }} />);
    const image = screen.getByRole('img');
    expect(image.className).toContain('object-contain');
    expect(image.className).not.toContain('object-cover');
  });

  it('reserves the same 4:3 plate whether or not a product is photographed', () => {
    // A mixed grid row must not go ragged, so the box is declared outside the image/placeholder
    // branch and both states occupy identical space.
    const withPhoto = render(
      <ProductCard product={{ ...mockProduct, image: '/products/surgeon-cap.webp' }} />,
    );
    expect(withPhoto.container.querySelectorAll('.aspect-\\[4\\/3\\]')).toHaveLength(1);
    withPhoto.unmount();

    const withoutPhoto = render(<ProductCard product={mockProduct} />);
    expect(withoutPhoto.container.querySelectorAll('.aspect-\\[4\\/3\\]')).toHaveLength(1);
  });

  it('marks a hygiene product with exactly one hygiene colour rule', () => {
    const { container } = render(<ProductCard product={mockProduct} />);
    expect(container.querySelectorAll('.bg-category-hygiene')).toHaveLength(1);
    expect(container.querySelectorAll('.bg-category-hotel')).toHaveLength(0);
    expect(container.querySelectorAll('.bg-category-spa')).toHaveLength(0);
    expect(container.querySelectorAll('.bg-category-packing')).toHaveLength(0);
  });

  it('marks a hotel product with exactly one hotel colour rule', () => {
    const { container } = render(<ProductCard product={hotelProduct} />);
    expect(container.querySelectorAll('.bg-category-hotel')).toHaveLength(1);
    expect(container.querySelectorAll('.bg-category-hygiene')).toHaveLength(0);
    expect(container.querySelectorAll('.bg-category-spa')).toHaveLength(0);
    expect(container.querySelectorAll('.bg-category-packing')).toHaveLength(0);
  });

  it('marks a spa product with exactly one spa colour rule', () => {
    const { container } = render(<ProductCard product={spaProduct} />);
    expect(container.querySelectorAll('.bg-category-spa')).toHaveLength(1);
    expect(container.querySelectorAll('.bg-category-hygiene')).toHaveLength(0);
    expect(container.querySelectorAll('.bg-category-hotel')).toHaveLength(0);
    expect(container.querySelectorAll('.bg-category-packing')).toHaveLength(0);
  });

  it('marks a protective-packing product with exactly one packing colour rule', () => {
    const { container } = render(<ProductCard product={packingProduct} />);
    expect(container.querySelectorAll('.bg-category-packing')).toHaveLength(1);
    expect(container.querySelectorAll('.bg-category-hygiene')).toHaveLength(0);
    expect(container.querySelectorAll('.bg-category-hotel')).toHaveLength(0);
    expect(container.querySelectorAll('.bg-category-spa')).toHaveLength(0);
  });
});
