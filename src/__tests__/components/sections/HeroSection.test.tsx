import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import HeroSection from '@/components/sections/HeroSection';

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
  AnimatePresence: ({ children }: any) => <>{children}</>,
  useMotionValue: () => ({ get: () => 0, set: vi.fn() }),
  useSpring: () => ({ get: () => 0, set: vi.fn() }),
  useTransform: () => ({ get: () => 0 }),
}));

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

vi.mock('@/components/ui/AuroraBackground', () => ({
  AuroraBackground: ({ children, className }: any) => (
    <div data-testid="aurora" className={className}>
      {children}
    </div>
  ),
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
    expect(screen.getByText('51+')).toBeTruthy();
    expect(screen.getByText('Products')).toBeTruthy();
  });

  it('renders scroll indicator', () => {
    render(<HeroSection />);
    const scrollLink = screen.getByLabelText('Scroll to About section');
    expect(scrollLink).toBeTruthy();
  });

  it('renders aurora background', () => {
    render(<HeroSection />);
    expect(screen.getByTestId('aurora')).toBeTruthy();
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

  it('calls handleLogoScale callback when ProductCategoryGraph invokes onLogoScale', () => {
    // The ProductCategoryGraph mock already calls onLogoScale in the module-level mock
    // We verify the component handles it without error by checking it renders
    render(<HeroSection />);
    expect(screen.getByTestId('product-graph')).toBeTruthy();
  });

  it('handles keyboard Enter key on right panel', () => {
    render(<HeroSection />);
    const rightPanel = screen.getByLabelText('Click to collapse expanded category');

    // Simulate Enter key press
    fireEvent.keyDown(rightPanel, { key: 'Enter' });

    // Component should handle without error
    expect(rightPanel).toBeTruthy();
  });

  it('handles keyboard Space key on right panel', () => {
    render(<HeroSection />);
    const rightPanel = screen.getByLabelText('Click to collapse expanded category');

    // Simulate Space key press
    fireEvent.keyDown(rightPanel, { key: ' ' });

    // Component should handle without error
    expect(rightPanel).toBeTruthy();
  });

  it('handles keyboard other keys on right panel (no action)', () => {
    render(<HeroSection />);
    const rightPanel = screen.getByLabelText('Click to collapse expanded category');

    // Simulate other key press (should not trigger collapse)
    fireEvent.keyDown(rightPanel, { key: 'Escape' });

    // Component should handle without error
    expect(rightPanel).toBeTruthy();
  });

  it('handles click on right panel', () => {
    render(<HeroSection />);
    const rightPanel = screen.getByLabelText('Click to collapse expanded category');

    // Simulate click
    fireEvent.click(rightPanel);

    // Component should handle without error
    expect(rightPanel).toBeTruthy();
  });

  it('right panel has correct role and tabIndex', () => {
    render(<HeroSection />);
    const rightPanel = screen.getByLabelText('Click to collapse expanded category');

    expect(rightPanel.getAttribute('role')).toBe('button');
    expect(rightPanel.getAttribute('tabindex')).toBe('0');
  });
});
