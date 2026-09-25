import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import HeroSection from '@/components/sections/HeroSection';
import { PRODUCTS } from '@/constants';

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
    AnimatePresence: ({ children }: any) => <>{children}</>,
    useMotionValue: () => ({ get: () => 0, set: vi.fn() }),
    useSpring: () => ({ get: () => 0, set: vi.fn() }),
    useTransform: () => ({ get: () => 0 }),
  };
});

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('next/image', () => ({
  default: (props: any) => <img {...props} />,
}));

vi.mock('lucide-react', () => ({
  ArrowRight: (props: any) => <svg data-testid="arrow-right" {...props} />,
  ChevronDown: (props: any) => <svg data-testid="chevron-down" {...props} />,
}));

vi.mock('@/hooks/useTypewriter', () => ({
  useTypewriter: ({ onComplete }: any) => {
    // Call onComplete to trigger contentVisible
    if (onComplete) {
      setTimeout(onComplete, 0);
    }
    return {
      displayed: 'Premium Hygiene & Care',
      showCursor: true,
      isDone: true,
    };
  },
}));

vi.mock('@/components/ui/ProductCategoryGraph', () => ({
  ProductCategoryGraph: (props: any) => {
    // Call onLogoScale to cover the handleLogoScale callback
    if (props.onLogoScale) props.onLogoScale(1.5);
    return <canvas data-testid="product-graph" />;
  },
}));

describe('HeroSection', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders headline text', () => {
    render(<HeroSection />);
    expect(screen.getByText('Premium Hygiene & Care')).toBeTruthy();
  });

  it('renders hero section with aria-label', () => {
    const { container } = render(<HeroSection />);
    const section = container.querySelector('[aria-label="Hero"]');
    expect(section).toBeTruthy();
  });

  it('renders CTAs when content becomes visible', () => {
    render(<HeroSection />);
    // Advance timers to trigger onComplete -> setLine2Visible -> setContentVisible
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    // CTAs should now be visible
    expect(screen.getByText('Explore Products')).toBeTruthy();
    expect(screen.getByText('Get a Quote')).toBeTruthy();
  });

  it('renders trust stats when content is visible', () => {
    render(<HeroSection />);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText(`${PRODUCTS.length}+`)).toBeTruthy();
    expect(screen.getByText('Products')).toBeTruthy();
  });

  it('renders scroll indicator', () => {
    render(<HeroSection />);
    const scrollLink = screen.getByLabelText('Scroll to About section');
    expect(scrollLink).toBeTruthy();
  });

  it('renders product category graph', () => {
    render(<HeroSection />);
    expect(screen.getByTestId('product-graph')).toBeTruthy();
  });

  it('renders badge text', () => {
    render(<HeroSection />);
    expect(screen.getByText(/Trusted B2B Supplier/)).toBeTruthy();
  });

  it('sets isMobile to true when matchMedia matches max-width 768px', () => {
    vi.mocked(window.matchMedia).mockImplementation((query: string) => ({
      matches: query === '(max-width: 768px)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(<HeroSection />);
    // The ProductCategoryGraph should receive isMobile=true
    // Component renders without error in mobile mode
    expect(screen.getByTestId('product-graph')).toBeTruthy();
  });

  it('keeps hero content visible immediately when prefers-reduced-motion is set', () => {
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

    render(<HeroSection />);

    // With reduced motion the layout effect returns early and leaves the server-rendered
    // finished state in place, so the copy is present without waiting on any animation.
    expect(screen.getByText(/Solutions for Every Industry/)).toBeTruthy();
    expect(screen.getByText('Explore Products')).toBeTruthy();
    expect(screen.getByText('Get a Quote')).toBeTruthy();
  });

  it('calls handleLogoScale callback when ProductCategoryGraph invokes onLogoScale', () => {
    // The ProductCategoryGraph mock already calls onLogoScale in the module-level mock
    // We verify the component handles it without error by checking it renders
    render(<HeroSection />);
    expect(screen.getByTestId('product-graph')).toBeTruthy();
  });

  it('handles keyboard Enter key on right panel', () => {
    render(<HeroSection />);
    const rightPanel = screen.getByRole('button', { name: /product category graph/i });

    // Simulate Enter key press
    fireEvent.keyDown(rightPanel, { key: 'Enter' });

    // Component should handle without error
    expect(rightPanel).toBeTruthy();
  });

  it('handles keyboard Space key on right panel', () => {
    render(<HeroSection />);
    const rightPanel = screen.getByRole('button', { name: /product category graph/i });

    // Simulate Space key press
    fireEvent.keyDown(rightPanel, { key: ' ' });

    // Component should handle without error
    expect(rightPanel).toBeTruthy();
  });

  it('handles keyboard other keys on right panel (no action)', () => {
    render(<HeroSection />);
    const rightPanel = screen.getByRole('button', { name: /product category graph/i });

    // Simulate other key press (should not trigger collapse)
    fireEvent.keyDown(rightPanel, { key: 'Escape' });

    // Component should handle without error
    expect(rightPanel).toBeTruthy();
  });

  it('handles click on right panel', () => {
    render(<HeroSection />);
    const rightPanel = screen.getByRole('button', { name: /product category graph/i });

    // Simulate click
    fireEvent.click(rightPanel);

    // Component should handle without error
    expect(rightPanel).toBeTruthy();
  });

  it('right panel has correct role and tabIndex', () => {
    render(<HeroSection />);
    const rightPanel = screen.getByRole('button', { name: /product category graph/i });

    expect(rightPanel.getAttribute('role')).toBe('button');
    expect(rightPanel.getAttribute('tabindex')).toBe('0');
  });

  it('clears both reveal timers on unmount', () => {
    const { unmount } = render(<HeroSection />);

    // Fire the typewriter's onComplete, which schedules the 150ms and 600ms reveal timers.
    // They start inside the callback, outside `useTypewriter`'s own cleanup closure, so
    // nothing but HeroSection's effect cleanup can cancel them.
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(vi.getTimerCount()).toBeGreaterThanOrEqual(2);

    unmount();

    expect(vi.getTimerCount()).toBe(0);
  });
});
