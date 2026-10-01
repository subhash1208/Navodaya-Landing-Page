import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProductsPage, { metadata } from '@/app/products/page';
import { BRAND, PRODUCT_CATEGORIES, SUB_CATEGORIES, SUB_CATEGORY_PARENT } from '@/constants';

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

// The grid has its own spec; here it is a probe for the two things this page decides — which
// category and which sub-category it resolved out of the query string and handed down.
//
// The mock supplies `ProductGrid` alone. `ALL_ID` and `SUB_PARAM` used to be re-stated here too,
// because the page imported them from this module — they now come from `@/constants`, which is
// deliberately NOT mocked, so the page reads the real `'all'` and `'sub'` throughout. That move is
// the fix for a production defect: every export of a `'use client'` module is a client reference
// stub on the server, so `params[SUB_PARAM]` was indexing with a function and `?sub=` never
// resolved. See the note on their declaration in `src/constants/categories.ts`.
//
// A literal rather than `importOriginal`: the real module imports `Search` and `X` from
// `lucide-react`, which the mock two blocks up narrows to `ChevronRight` alone — so spreading the
// actual module in would fail on a missing icon export, not on anything this file is testing.
const receivedCategory = vi.fn();
const receivedSubCategory = vi.fn();
vi.mock('@/components/ui/ProductGrid', () => ({
  ProductGrid: ({
    activeCategory,
    activeSubCategory,
  }: {
    activeCategory: string;
    activeSubCategory: string | null;
  }) => {
    receivedCategory(activeCategory);
    receivedSubCategory(activeSubCategory);
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
    await renderPage({ category: ['spa-salon', 'hygiene-safety-housekeeping'] });
    expect(receivedCategory).toHaveBeenCalledWith('all');
  });
});

describe('ProductsPage sub-category resolution', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('passes null when no sub-category is given', async () => {
    await renderPage({ category: SUB_CATEGORY_PARENT });
    expect(receivedSubCategory).toHaveBeenCalledWith(null);
  });

  it.each(SUB_CATEGORIES.map((s) => s.slug))(
    'passes through the %s slug under its own category',
    async (slug) => {
      await renderPage({ category: SUB_CATEGORY_PARENT, sub: slug });
      expect(receivedSubCategory).toHaveBeenCalledWith(slug);
    },
  );

  it('ignores a sub-category slug that is not in the catalogue', async () => {
    await renderPage({ category: SUB_CATEGORY_PARENT, sub: 'air-cair' });
    expect(receivedSubCategory).toHaveBeenCalledWith(null);
  });

  it('ignores a repeated sub param (array value)', async () => {
    await renderPage({ category: SUB_CATEGORY_PARENT, sub: ['air-care', 'tissues-paper'] });
    expect(receivedSubCategory).toHaveBeenCalledWith(null);
  });

  it('ignores a real slug paired with a category that does not subdivide', async () => {
    // `air-care` subdivides hygiene, not spa-salon. Honouring the pairing would filter a category
    // in which no product can carry that sub-category, i.e. a guaranteed-empty grid.
    await renderPage({ category: 'spa-salon', sub: 'air-care' });
    expect(receivedCategory).toHaveBeenCalledWith('spa-salon');
    expect(receivedSubCategory).toHaveBeenCalledWith(null);
  });

  it('ignores a sub param with no category at all', async () => {
    await renderPage({ sub: 'air-care' });
    expect(receivedCategory).toHaveBeenCalledWith('all');
    expect(receivedSubCategory).toHaveBeenCalledWith(null);
  });
});

describe('ProductsPage metadata', () => {
  it('has title', () => {
    expect(metadata.title).toBe('Product Catalogue');
  });

  it('has description', () => {
    expect(metadata.description).toContain('hygiene, housekeeping and care products');
  });

  it('declares /products as its canonical URL', () => {
    expect(metadata.alternates?.canonical).toBe('/products');
  });

  it('sets its own openGraph.url matching the canonical route', () => {
    expect(metadata.openGraph?.url).toBe('/products');
  });

  it('sets its own openGraph title and description, not inherited from the root layout', () => {
    // The root layout's openGraph title/description are BRAND.FULL_NAME / BRAND.TAGLINE
    // (src/app/layout.tsx). Per the Metadata API's inheritance rule, setting `openGraph`
    // here replaces the whole parent object — this proves it wasn't left to inherit.
    expect(metadata.openGraph?.title).not.toBe(BRAND.FULL_NAME);
    expect(metadata.openGraph?.description).not.toBe(BRAND.TAGLINE);
    expect(metadata.openGraph?.title).toContain('Product Catalogue');
    expect(metadata.openGraph?.description).toContain('hygiene, housekeeping and care products');
  });

  it('carries forward siteName, type and locale so they are not lost by the inheritance replacement', () => {
    // `OpenGraph` is a union keyed on `type`, and one union member (bare
    // `OpenGraphMetadata`) has no `type` field at all — so `.type` isn't
    // narrowed without a cast, same pattern as the `description as string`
    // casts above.
    const openGraph = metadata.openGraph as { siteName?: string; type?: string; locale?: string };
    expect(openGraph?.siteName).toBe(BRAND.FULL_NAME);
    expect(openGraph?.type).toBe('website');
    expect(openGraph?.locale).toBe('en_IN');
  });
});
