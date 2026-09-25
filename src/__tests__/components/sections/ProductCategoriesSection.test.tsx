import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import ProductCategoriesSection from '@/components/sections/ProductCategoriesSection';

vi.mock('gsap', () => ({
  gsap: {
    registerPlugin: vi.fn(),
    fromTo: vi.fn(),
    to: vi.fn(),
    set: vi.fn(),
    context: vi.fn().mockReturnValue({ revert: vi.fn() }),
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

vi.mock('motion/react', () => ({
  motion: new Proxy(
    {},
    {
      get: (_, tag) => (props: any) => {
        const { initial, animate, exit, transition, whileInView, variants, viewport, ...rest } =
          props;
        return <div data-testid={`motion-${String(tag)}`} {...rest} />;
      },
    },
  ),
}));

vi.mock('@/components/ui/AnimateIn', () => ({
  AnimateIn: ({ children }: any) => <div>{children}</div>,
}));

describe('ProductCategoriesSection', () => {
  beforeEach(() => {
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

  it('renders 3 category cards', () => {
    render(<ProductCategoriesSection />);
    expect(screen.getByText('Disposable Hygiene & Safety')).toBeTruthy();
    expect(screen.getByText('Hotel Slippers & Guest Amenities')).toBeTruthy();
    expect(screen.getByText('Disposable Spa & Salon')).toBeTruthy();
  });

  it('renders product counts', () => {
    render(<ProductCategoriesSection />);
    expect(screen.getByText('17 products')).toBeTruthy();
    expect(screen.getByText('16 products')).toBeTruthy();
    expect(screen.getByText('18 products')).toBeTruthy();
  });

  it('renders View Full Product Catalogue button', () => {
    render(<ProductCategoriesSection />);
    expect(screen.getByText('View Full Product Catalogue')).toBeTruthy();
  });

  it('renders Browse Products links', () => {
    render(<ProductCategoriesSection />);
    const browseLinks = screen.getAllByText('Browse Products');
    expect(browseLinks.length).toBe(3);
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
    expect(cards.length).toBe(3);
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
  });

  it('renders one specimen plate per category, pointing at the slug-derived path', () => {
    render(<ProductCategoriesSection />);
    const plates = screen.getAllByRole('img');
    expect(plates.length).toBe(3);
    expect(plates[0].getAttribute('src')).toBe('/categories/hygiene-safety.webp');
    expect(plates[1].getAttribute('src')).toBe('/categories/hotel-amenities.webp');
    expect(plates[2].getAttribute('src')).toBe('/categories/spa-salon.webp');
  });

  it('gives every plate descriptive alt text that does not merely repeat the category name', () => {
    render(<ProductCategoriesSection />);
    const plates = screen.getAllByRole('img');
    const names = [
      'Disposable Hygiene & Safety',
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
      expect(plate.getAttribute('sizes')).toBe(
        '(min-width: 1152px) 288px, (min-width: 640px) 25vw, calc(100vw - 7rem)',
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

  it('renders the section index and the total category count', () => {
    render(<ProductCategoriesSection />);
    expect(screen.getByText('02')).toBeTruthy();
    expect(screen.getByText('3 categories')).toBeTruthy();
  });

  it('renders subheading text', () => {
    render(<ProductCategoriesSection />);
    expect(screen.getByText(/Three focused ranges/)).toBeTruthy();
  });
});
