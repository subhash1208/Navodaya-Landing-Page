import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProductsPage, { metadata } from '@/app/products/page';
import { PRODUCT_CATEGORIES } from '@/constants';

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

// The grid has its own spec; here it is a probe for the one thing this page now decides — which
// category it resolved out of `?category=` and handed down. `ALL_ID` is re-exported because the
// page imports the real constant at runtime.
const receivedCategory = vi.fn();
vi.mock('@/components/ui/ProductGrid', () => ({
  ALL_ID: 'all',
  ProductGrid: ({ activeCategory }: { activeCategory: string }) => {
    receivedCategory(activeCategory);
    return <div data-testid="product-grid">{activeCategory}</div>;
  },
}));

/** The page is an async Server Component; `searchParams` is a Promise in Next 16. */
async function renderPage(searchParams: Record<string, string | string[] | undefined> = {}) {
  return render(await ProductsPage({ searchParams: Promise.resolve(searchParams) }));
}

describe('ProductsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders page heading', async () => {
    await renderPage();
    expect(screen.getByText('Product Catalogue')).toBeTruthy();
  });

  it('renders product count description', async () => {
    await renderPage();
    expect(screen.getByText(/products across/)).toBeTruthy();
  });

  it('renders breadcrumb', async () => {
    await renderPage();
    expect(screen.getByText('Home')).toBeTruthy();
  });

  it('renders product grid', async () => {
    await renderPage();
    expect(screen.getByTestId('product-grid')).toBeTruthy();
  });

  it('renders breadcrumb with chevron icon', async () => {
    await renderPage();
    expect(screen.getByTestId('chevron-right')).toBeTruthy();
    expect(screen.getByText('Products')).toBeTruthy();
  });
});

describe('ProductsPage category resolution', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('defaults to the full catalogue when no category is given', async () => {
    await renderPage();
    expect(receivedCategory).toHaveBeenCalledWith('all');
  });

  it.each(PRODUCT_CATEGORIES.map((c) => c.slug))('passes through the %s slug', async (slug) => {
    await renderPage({ category: slug });
    expect(receivedCategory).toHaveBeenCalledWith(slug);
  });

  it('falls back to all for a slug that is not in the catalogue', async () => {
    await renderPage({ category: 'hygiene-saftey' });
    expect(receivedCategory).toHaveBeenCalledWith('all');
  });

  it('falls back to all for a repeated category param (array value)', async () => {
    await renderPage({ category: ['spa-salon', 'hygiene-safety'] });
    expect(receivedCategory).toHaveBeenCalledWith('all');
  });
});

describe('ProductsPage metadata', () => {
  it('has title', () => {
    expect(metadata.title).toBe('Product Catalogue');
  });

  it('has description', () => {
    expect(metadata.description).toContain('hygiene and care products');
  });

  it('declares /products as its canonical URL', () => {
    expect(metadata.alternates?.canonical).toBe('/products');
  });
});
