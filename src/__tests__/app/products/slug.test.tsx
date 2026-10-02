import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { generateStaticParams, generateMetadata } from '@/app/products/[slug]/page';
import ProductPage from '@/app/products/[slug]/page';
import { PRODUCTS } from '@/constants';

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
      expect(metadata.title).toBe('Surgeon Cap');
      // The client's catalogue carries no product copy, so the description is composed by
      // `productSummary` from the data that does exist — here, the material.
      expect(metadata.description).toContain('Non-woven construction.');
      expect(metadata.description).not.toContain('undefined');
    });

    it('returns not found title for invalid slug', async () => {
      const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'nonexistent' }) });
      expect(metadata.title).toBe('Product Not Found');
    });

    it('sets the canonical URL to the product route', async () => {
      const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'surgeon-cap' }) });
      expect(metadata.alternates?.canonical).toBe('/products/surgeon-cap');
    });

    it('omits a canonical for an unknown slug', async () => {
      const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'nonexistent' }) });
      expect(metadata.alternates).toBeUndefined();
    });

    it('sets openGraph.url to the canonical product route', async () => {
      const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'surgeon-cap' }) });
      expect(metadata.openGraph?.url).toBe('/products/surgeon-cap');
    });

    it('keeps the generated meta description within search-result truncation limits for every product', async () => {
      // Derived from PRODUCTS by actually generating every product's metadata rather
      // than hardcoding a slug, so a future product addition (longer description OR
      // longer category name) cannot silently regress this unnoticed.
      const allMetadata = await Promise.all(
        PRODUCTS.map((p) => generateMetadata({ params: Promise.resolve({ slug: p.slug }) })),
      );
      const longest = allMetadata.reduce((max, m) =>
        (m.description as string).length > (max.description as string).length ? m : max,
      );
      expect((longest.description as string).length).toBeLessThanOrEqual(160);
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
      render(Page as any);
      expect(screen.getByText('Material')).toBeTruthy();
      expect(screen.getByText('Non-woven')).toBeTruthy();
    });

    it('does not render material spec when product has no material', async () => {
      // face-mask carries neither `material` nor `variants` — the bare-fallback shape
      const Page = await ProductPage({ params: Promise.resolve({ slug: 'face-mask' }) });
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
      render(Page as any);
      expect(screen.getByText('Related Products')).toBeTruthy();
      const cards = screen.getAllByTestId('product-card');
      expect(cards.length).toBeGreaterThan(0);
      expect(cards.length).toBeLessThanOrEqual(4);
    });

    it('lists every variant a product has, and omits the block entirely when it has none', async () => {
      const withVariants = await ProductPage({
        params: Promise.resolve({ slug: 'shoe-cover' }),
      });
      const { unmount } = render(withVariants as any);
      const product = PRODUCTS.find((p) => p.slug === 'shoe-cover')!;
      expect(product.variants!.length).toBeGreaterThan(1);
      expect(screen.getByText('Available Options')).toBeTruthy();
      // Selectable chips, not a dead list: one radiogroup of discrete models.
      expect(screen.getAllByRole('radiogroup')).toHaveLength(1);
      product.variants!.forEach((v) =>
        expect(screen.getByRole('radio', { name: v.label })).toBeTruthy(),
      );
      // The variant count also reaches the spec table, so a visitor sees it twice over.
      expect(screen.getByText(`${product.variants!.length} available`)).toBeTruthy();
      unmount();

      const without = await ProductPage({ params: Promise.resolve({ slug: 'face-mask' }) });
      render(without as any);
      expect(screen.queryByText('Available Options')).toBeNull();
      expect(screen.queryByText('Options')).toBeNull();
      expect(screen.queryByRole('radiogroup')).toBeNull();
    });

    it('renders one row per axis for a product whose options are axes', async () => {
      // These four carry `optionAxes` instead of `variants` and rendered NOTHING under the old
      // `<ul>`, which read `variants` alone.
      const product = PRODUCTS.find((p) => p.slug === 'hand-wash')!;
      expect(product.optionAxes!.length).toBeGreaterThan(1);
      const Page = await ProductPage({ params: Promise.resolve({ slug: product.slug }) });
      render(Page as any);
      expect(screen.getAllByRole('radiogroup')).toHaveLength(product.optionAxes!.length);
      product.optionAxes!.forEach((axis) => {
        expect(screen.getByRole('radiogroup', { name: axis.name })).toBeTruthy();
        axis.values.forEach((value) =>
          expect(screen.getByRole('radio', { name: value })).toBeTruthy(),
        );
      });
    });

    it('never renders the literal string undefined for a product with no copy', async () => {
      const Page = await ProductPage({ params: Promise.resolve({ slug: 'face-mask' }) });
      const { container } = render(Page as any);
      expect(container.textContent).not.toContain('undefined');
      // The summary slot must still say something — an empty paragraph is the failure this guards.
      expect(screen.getByText(/Available for bulk supply/)).toBeTruthy();
    });

    it('points "Request a Quote" at the homepage contact form, keyed by slug', async () => {
      const Page = await ProductPage({ params: Promise.resolve({ slug: 'surgeon-cap' }) });
      render(Page as any);
      const link = screen.getByRole('link', { name: /request a quote/i });
      expect(link.getAttribute('href')).toBe('/?product=surgeon-cap#contact');
    });

    it('adds the chosen option to the quote link', async () => {
      const product = PRODUCTS.find((p) => p.slug === 'shoe-cover')!;
      const Page = await ProductPage({ params: Promise.resolve({ slug: product.slug }) });
      render(Page as any);
      const label = product.variants![0].label;
      fireEvent.click(screen.getByRole('radio', { name: label }));
      const href = screen.getByRole('link', { name: /request a quote/i }).getAttribute('href')!;
      expect(new URL(href, 'https://example.test').searchParams.get('variant')).toBe(label);
    });
  });
});
