import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { generateStaticParams, generateMetadata } from '@/app/products/[slug]/page';
import ProductPage from '@/app/products/[slug]/page';

vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/products/surgeon-cap',
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('lucide-react', () => ({
  ChevronRight: (props: any) => <svg data-testid="chevron" {...props} />,
  MessageSquare: (props: any) => <svg data-testid="message" {...props} />,
  Package: (props: any) => <svg data-testid="package" {...props} />,
  Tag: (props: any) => <svg data-testid="tag" {...props} />,
  ArrowLeft: (props: any) => <svg data-testid="arrow-left" {...props} />,
  ArrowRight: (props: any) => <svg data-testid="arrow-right" {...props} />,
}));

vi.mock('@/components/ui/ProductViewer', () => ({
  ProductViewer: ({ productName }: any) => <div data-testid="product-viewer">{productName}</div>,
}));

vi.mock('@/components/ui/ProductCard', () => ({
  ProductCard: ({ product }: any) => <div data-testid="product-card">{product.name}</div>,
}));

describe('ProductPage [slug]', () => {
  describe('generateStaticParams', () => {
    it('returns all product slugs', async () => {
      const params = await generateStaticParams();
      expect(params.length).toBeGreaterThan(0);
      expect(params[0]).toHaveProperty('slug');
    });
  });

  describe('generateMetadata', () => {
    it('returns metadata for valid product', async () => {
      const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'surgeon-cap' }) });
      expect(metadata.title).toBe('Disposable Surgeon Cap');
      expect(metadata.description).toContain('Sterile disposable surgeon cap');
    });

    it('returns not found title for invalid slug', async () => {
      const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'nonexistent' }) });
      expect(metadata.title).toBe('Product Not Found');
    });
  });

  describe('ProductPage render', () => {
    it('renders product page for valid slug', async () => {
      const Page = await ProductPage({ params: Promise.resolve({ slug: 'surgeon-cap' }) });
      const { container } = render(Page as any);
      expect(container.querySelector('h1')).toBeTruthy();
    });

    it('renders material spec when product has material', async () => {
      // surgeon-cap has material: 'Non-woven'
      const Page = await ProductPage({ params: Promise.resolve({ slug: 'surgeon-cap' }) });
      const { container } = render(Page as any);
      expect(screen.getByText('Material')).toBeTruthy();
      expect(screen.getByText('Non-woven')).toBeTruthy();
    });

    it('does not render material spec when product has no material', async () => {
      // jute-slippers has no material field
      const Page = await ProductPage({ params: Promise.resolve({ slug: 'jute-slippers' }) });
      const { container } = render(Page as any);
      // Should not have a Material row
      const allDts = container.querySelectorAll('dt');
      const materialDt = Array.from(allDts).find((dt) => dt.textContent === 'Material');
      expect(materialDt).toBeFalsy();
    });

    it('calls notFound for invalid slug', async () => {
      const { notFound } = await import('next/navigation');
      vi.mocked(notFound).mockImplementation(() => {
        throw new Error('NEXT_NOT_FOUND');
      });

      await expect(
        ProductPage({ params: Promise.resolve({ slug: 'nonexistent-product-xyz' }) }),
      ).rejects.toThrow('NEXT_NOT_FOUND');
      expect(notFound).toHaveBeenCalled();
    });

    it('renders related products section', async () => {
      const Page = await ProductPage({ params: Promise.resolve({ slug: 'surgeon-cap' }) });
      const { container } = render(Page as any);
      expect(screen.getByText('Related Products')).toBeTruthy();
      const cards = screen.getAllByTestId('product-card');
      expect(cards.length).toBeGreaterThan(0);
      expect(cards.length).toBeLessThanOrEqual(4);
    });
  });
});
