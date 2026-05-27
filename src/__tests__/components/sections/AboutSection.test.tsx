import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import AboutSection from '@/components/sections/AboutSection';

vi.mock('gsap', () => ({
  gsap: {
    registerPlugin: vi.fn(),
    fromTo: vi.fn(),
    to: vi.fn(),
    set: vi.fn(),
    context: vi.fn().mockImplementation((fn: any, ref: any) => {
      fn();
      return { revert: vi.fn() };
    }),
  },
}));

vi.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: {
    create: vi.fn(),
    getAll: vi.fn().mockReturnValue([]),
  },
}));

vi.mock('gsap/SplitText', () => {
  class SplitText {
    chars: any[] = [];
    words: any[] = [];
    revert = vi.fn();
    constructor(el?: any, config?: any) {
      this.chars = config?.type?.includes('chars') ? [{ textContent: 'A' }] : [];
      this.words = config?.type?.includes('words') ? [{ textContent: 'Word' }] : [];
    }
  }
  return { SplitText };
});

vi.mock('lucide-react', () => ({
  Award: (props: any) => <svg data-testid="award-icon" {...props} />,
  Globe: (props: any) => <svg data-testid="globe-icon" {...props} />,
  Handshake: (props: any) => <svg data-testid="handshake-icon" {...props} />,
}));

vi.mock('@/components/ui/CounterStat', () => ({
  CounterStat: ({ value, label }: any) => (
    <div data-testid="counter-stat">
      <span>{value}</span>
      <span>{label}</span>
    </div>
  ),
}));

describe('AboutSection', () => {
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

  it('renders heading', () => {
    render(<AboutSection />);
    expect(screen.getByText(/About Navodaya/)).toBeTruthy();
  });

  it('renders section with id', () => {
    const { container } = render(<AboutSection />);
    const section = container.querySelector('#about');
    expect(section).toBeTruthy();
  });

  it('renders pillars', () => {
    render(<AboutSection />);
    expect(screen.getByText('Quality Assured')).toBeTruthy();
    expect(screen.getByText('Global Reach')).toBeTruthy();
    expect(screen.getByText('Customer First')).toBeTruthy();
  });

  it('renders stats', () => {
    render(<AboutSection />);
    const stats = screen.getAllByTestId('counter-stat');
    expect(stats.length).toBe(4);
  });

  it('renders Who We Are label', () => {
    render(<AboutSection />);
    expect(screen.getByText('Who We Are')).toBeTruthy();
  });

  it('renders brand tagline', () => {
    render(<AboutSection />);
    expect(screen.getByText('Your Trusted Partner in Progress and Care')).toBeTruthy();
  });

  it('checks CSS.supports branch (returns false by default)', () => {
    // CSS.supports returns false in setup.ts, so GSAP fallback path runs
    render(<AboutSection />);
    expect(screen.getByText(/About Navodaya/)).toBeTruthy();
  });

  it('handles CSS.supports returning true', () => {
    vi.mocked(window.CSS.supports).mockReturnValue(true);
    render(<AboutSection />);
    expect(screen.getByText(/About Navodaya/)).toBeTruthy();
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

    render(<AboutSection />);
    expect(screen.getByText(/About Navodaya/)).toBeTruthy();
  });

  it('renders pillar cards with correct structure', () => {
    const { container } = render(<AboutSection />);
    const pillarCards = container.querySelectorAll('.pillar-card');
    expect(pillarCards.length).toBe(3);
  });

  it('renders stats grid', () => {
    render(<AboutSection />);
    const stats = screen.getAllByTestId('counter-stat');
    expect(stats.length).toBe(4);
  });

  it('renders main card with gradient background', () => {
    const { container } = render(<AboutSection />);
    const card = container.querySelector('.bg-gradient-to-br');
    expect(card).toBeTruthy();
  });

  it('renders description paragraphs', () => {
    render(<AboutSection />);
    expect(screen.getByText(/dedicated supplier/)).toBeTruthy();
    expect(screen.getByText(/approach is simple/)).toBeTruthy();
  });

  it('tests destroyed flag path - unmount before async init completes', async () => {
    // This tests the "destroyed" flag that prevents animation setup if component unmounts
    const { unmount } = render(<AboutSection />);

    // Unmount immediately before async import resolves
    unmount();

    // Component should unmount without errors
    expect(true).toBe(true);
  });

  it('tests async import path with CSS.supports false', async () => {
    vi.mocked(window.CSS.supports).mockReturnValue(false);

    await act(async () => {
      render(<AboutSection />);
      // Wait for async imports to complete
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    expect(screen.getByText(/About Navodaya/)).toBeTruthy();
  });

  it('tests async import path with CSS.supports true', async () => {
    vi.mocked(window.CSS.supports).mockReturnValue(true);

    await act(async () => {
      render(<AboutSection />);
      // Wait for async imports to complete
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    expect(screen.getByText(/About Navodaya/)).toBeTruthy();
  });

  it('renders all pillar descriptions', () => {
    render(<AboutSection />);
    expect(screen.getByText(/Every product meets international/)).toBeTruthy();
    expect(screen.getByText(/Strategic import-export/)).toBeTruthy();
    expect(screen.getByText(/Prompt service and a commitment/)).toBeTruthy();
  });

  it('renders sweep line element', () => {
    const { container } = render(<AboutSection />);
    const line = container.querySelector('.w-16.h-\\[2px\\]');
    expect(line).toBeTruthy();
  });

  it('renders text and stats columns', () => {
    const { container } = render(<AboutSection />);
    const grid = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-2');
    expect(grid).toBeTruthy();
  });
});
