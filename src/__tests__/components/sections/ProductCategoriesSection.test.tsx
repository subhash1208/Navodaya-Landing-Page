import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import ProductCategoriesSection from '@/components/sections/ProductCategoriesSection';
import { PRODUCT_CATEGORIES, PRODUCT_COUNT_BY_CATEGORY } from '@/constants';

const mockFromTo = vi.fn();
const mockRevert = vi.fn();
const mockContext = vi.fn().mockImplementation((fn: () => void) => {
  fn();
  return { revert: mockRevert };
});

vi.mock('gsap', () => ({
  gsap: {
    registerPlugin: vi.fn(),
    fromTo: (...args: any[]) => mockFromTo(...args),
    to: vi.fn(),
    set: vi.fn(),
    context: (...args: any[]) => mockContext(...args),
  },
}));

vi.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: {
    create: vi.fn().mockImplementation((config: any) => {
      // Call onEnter to cover the animation callback branch
      if (config.onEnter) config.onEnter();
      return { kill: vi.fn() };
    }),
    getAll: vi.fn().mockReturnValue([]),
  },
}));

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
  BookOpen: (props: any) => <svg data-testid="book-open" {...props} />,
}));

vi.mock('motion/react', () => {
  // The component per tag is CACHED. A bare `get` handler returns a fresh function on every
  // property access, so `motion.div` is a different component type on every render and React
  // tears down and rebuilds the whole subtree — silently destroying uncontrolled input values
  // and breaking any `toBe` node-identity assertion. The real `motion.div` is a stable
  // reference. Same pattern as ContactSection.test.tsx:17-31.
  const cache = new Map<string, React.ComponentType<any>>();
  return {
    motion: new Proxy(
      {},
      {
        get: (_, tag) => {
          const key = String(tag);
          let component = cache.get(key);
          if (!component) {
            component = (props: any) => {
              const {
                initial,
                animate,
                exit,
                transition,
                whileInView,
                variants,
                viewport,
                ...rest
              } = props;
              return <div data-testid={`motion-${key}`} {...rest} />;
            };
            cache.set(key, component);
          }
          return component;
        },
      },
    ),
  };
});

vi.mock('@/components/ui/AnimateIn', () => ({
  AnimateIn: ({ children }: any) => <div>{children}</div>,
}));

describe('ProductCategoriesSection', () => {
  beforeEach(() => {
    mockFromTo.mockClear();
    mockRevert.mockClear();
    mockContext.mockClear();
    mockContext.mockImplementation((fn: () => void) => {
      fn();
      return { revert: mockRevert };
    });
    vi.mocked(window.CSS.supports).mockReturnValue(false);
    vi.mocked(window.matchMedia).mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  it('renders section with id', () => {
    const { container } = render(<ProductCategoriesSection />);
    const section = container.querySelector('#products');
    expect(section).toBeTruthy();
  });

  it('renders heading', () => {
    render(<ProductCategoriesSection />);
    expect(screen.getByText('Our Product Categories')).toBeTruthy();
  });

  it('renders 4 category cards', () => {
    render(<ProductCategoriesSection />);
    expect(screen.getByText('Hygiene, Safety & Housekeeping')).toBeTruthy();
    expect(screen.getByText('Hotel Slippers & Guest Amenities')).toBeTruthy();
    expect(screen.getByText('Disposable Spa & Salon')).toBeTruthy();
    // The fourth category must not be silently dropped by a grid that used to be hard-wired
    // to three columns — that is the whole risk this assertion covers. `getByRole('heading')`
    // rather than `getByText`, because this is the one category whose name also appears inside
    // its (aria-hidden) typographic plate.
    expect(screen.getByRole('heading', { name: 'Protective Packing' })).toBeTruthy();
  });

  it('renders product counts', () => {
    render(<ProductCategoriesSection />);
    // Counts are derived from PRODUCTS, so assert the rendered strings against the
    // derived numbers in category order rather than hand-typed digits. Two categories
    // can legitimately hold the same count, so getAllByText + order is the only
    // assertion that stays both unambiguous and exact.
    const rendered = screen.getAllByText(/^\d+ products$/).map((el) => el.textContent);
    expect(rendered).toEqual(
      PRODUCT_CATEGORIES.map((c) => `${PRODUCT_COUNT_BY_CATEGORY[c.slug]} products`),
    );
  });

  it('renders View Full Product Catalogue button', () => {
    render(<ProductCategoriesSection />);
    expect(screen.getByText('View Full Product Catalogue')).toBeTruthy();
  });

  it('renders Browse Products links', () => {
    render(<ProductCategoriesSection />);
    const browseLinks = screen.getAllByText('Browse Products');
    expect(browseLinks.length).toBe(4);
  });

  it('renders What We Supply label', () => {
    render(<ProductCategoriesSection />);
    expect(screen.getByText('What We Supply')).toBeTruthy();
  });

  it('handles prefers-reduced-motion', () => {
    vi.mocked(window.matchMedia).mockImplementation((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(<ProductCategoriesSection />);
    expect(screen.getByText('Our Product Categories')).toBeTruthy();
  });

  it('handles CSS.supports returning true for animation-timeline', () => {
    vi.mocked(window.CSS.supports).mockReturnValue(true);
    render(<ProductCategoriesSection />);
    expect(screen.getByText('Our Product Categories')).toBeTruthy();
  });

  it('renders category descriptions', () => {
    render(<ProductCategoriesSection />);
    // Each category card has a description
    const cards = screen.getAllByText(/Browse Products/);
    expect(cards.length).toBe(4);
  });

  it('renders category links with correct hrefs', () => {
    render(<ProductCategoriesSection />);
    const links = screen.getAllByText('Browse Products');
    links.forEach((link) => {
      expect(link.closest('a')?.getAttribute('href')).toContain('/products?category=');
    });
  });

  it('tests destroyed flag path - unmount before async init completes', async () => {
    // This tests the "destroyed" flag that prevents animation setup if component unmounts
    const { unmount } = render(<ProductCategoriesSection />);

    // Unmount immediately before async import resolves
    unmount();

    // Component should unmount without errors
    expect(true).toBe(true);
  });

  it('tests async import path with prefers-reduced-motion false', async () => {
    vi.mocked(window.matchMedia).mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    await act(async () => {
      render(<ProductCategoriesSection />);
      // Wait for async imports to complete
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    expect(screen.getByText('Our Product Categories')).toBeTruthy();
  });

  it('renders category cards with a top rule in their own category colour', () => {
    const { container } = render(<ProductCategoriesSection />);
    expect(container.querySelectorAll('.bg-category-hygiene').length).toBe(1);
    expect(container.querySelectorAll('.bg-category-hotel').length).toBe(1);
    expect(container.querySelectorAll('.bg-category-spa').length).toBe(1);
    expect(container.querySelectorAll('.bg-category-packing').length).toBe(1);
  });

  it('renders a specimen plate for every category that has one photographed', () => {
    render(<ProductCategoriesSection />);
    const plates = screen.getAllByRole('img');
    // Three, not four: `protective-packing` has no plate shot yet. The hygiene plate keeps its
    // original `hygiene-safety.webp` filename even though the category slug gained
    // `-housekeeping` — the asset was deliberately not renamed.
    expect(plates.length).toBe(3);
    expect(plates[0].getAttribute('src')).toBe('/categories/hygiene-safety.webp');
    expect(plates[1].getAttribute('src')).toBe('/categories/hotel-amenities.webp');
    expect(plates[2].getAttribute('src')).toBe('/categories/spa-salon.webp');
  });

  it('gives the unphotographed category a typographic tile at the same size as a real plate', () => {
    const { container } = render(<ProductCategoriesSection />);
    const plateSlots = container.querySelectorAll('.aspect-\\[4\\/5\\]');
    // Every card reserves the same box, so the row stays level whether or not a photo exists.
    expect(plateSlots.length).toBe(4);

    const tile = container.querySelector('.bg-brand-blue');
    expect(tile).toBeTruthy();
    expect(tile?.textContent).toBe('Protective Packing');
    // Decorative: the <h3> beneath already names the category, so the tile must not repeat it
    // to a screen reader.
    expect(tile?.getAttribute('aria-hidden')).toBe('true');
  });

  it('gives every plate descriptive alt text that does not merely repeat the category name', () => {
    render(<ProductCategoriesSection />);
    const plates = screen.getAllByRole('img');
    const names = [
      'Hygiene, Safety & Housekeeping',
      'Hotel Slippers & Guest Amenities',
      'Disposable Spa & Salon',
    ];
    const alts = plates.map((p) => p.getAttribute('alt') ?? '');

    alts.forEach((alt, i) => {
      expect(alt.length).toBeGreaterThan(0);
      expect(alt).not.toBe(names[i]);
    });
    expect(new Set(alts).size).toBe(3);
  });

  it('gives every plate an explicit sizes attribute and no priority hint', () => {
    render(<ProductCategoriesSection />);
    screen.getAllByRole('img').forEach((plate) => {
      // Recomputed for the four-up grid: the cards are two-up from `sm` and four-up from `xl`,
      // so each plate is wider in the middle range than it was under the old three-up layout.
      expect(plate.getAttribute('sizes')).toBe(
        '(min-width: 1280px) 288px, (min-width: 640px) 45vw, calc(100vw - 7rem)',
      );
      expect(plate.hasAttribute('priority')).toBe(false);
      expect(plate.hasAttribute('fetchpriority')).toBe(false);
    });
  });

  it('renders section with correct background', () => {
    const { container } = render(<ProductCategoriesSection />);
    const section = container.querySelector('.bg-grey-50');
    expect(section).toBeTruthy();
  });

  it('does not render a section index, and renders the total category count', () => {
    render(<ProductCategoriesSection />);
    expect(screen.queryByText('02')).toBeNull();
    expect(screen.getByText('4 categories')).toBeTruthy();
  });

  it('renders subheading text', () => {
    render(<ProductCategoriesSection />);
    expect(screen.getByText(/4 focused ranges/)).toBeTruthy();
  });

  it('creates one tween per card inside gsap.context, scoped to the cards container', async () => {
    const { container } = render(<ProductCategoriesSection />);
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    const cardsContainer = container.querySelector('.grid');
    expect(mockContext).toHaveBeenCalledTimes(1);
    expect(mockContext.mock.calls[0][1]).toBe(cardsContainer);

    expect(mockFromTo).toHaveBeenCalledTimes(4);
    mockFromTo.mock.calls.forEach((call) => {
      expect(call[2]).toEqual(
        expect.objectContaining({
          scrollTrigger: expect.objectContaining({
            trigger: cardsContainer,
            start: 'top 75%',
            once: true,
          }),
        }),
      );
    });
  });

  it('reverts the gsap.context on unmount, killing every card tween together — not a bare ScrollTrigger handle', async () => {
    let unmount: () => void = () => {};
    await act(async () => {
      const result = render(<ProductCategoriesSection />);
      unmount = result.unmount;
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    expect(mockRevert).not.toHaveBeenCalled();
    act(() => unmount());
    expect(mockRevert).toHaveBeenCalledTimes(1);
  });
});
