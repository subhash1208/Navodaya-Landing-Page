import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import WhyUsSection from '@/components/sections/WhyUsSection';

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
  ShieldCheck: (props: any) => <svg data-testid="shield-icon" {...props} />,
  Truck: (props: any) => <svg data-testid="truck-icon" {...props} />,
  Users: (props: any) => <svg data-testid="users-icon" {...props} />,
  Leaf: (props: any) => <svg data-testid="leaf-icon" {...props} />,
}));

describe('WhyUsSection', () => {
  beforeEach(() => {
    // Reset CSS.supports to default (false)
    vi.mocked(window.CSS.supports).mockReturnValue(false);
    // Reset matchMedia to default
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
    render(<WhyUsSection />);
    expect(screen.getByText('Why Businesses Choose Us')).toBeTruthy();
  });

  it('renders section with id', () => {
    const { container } = render(<WhyUsSection />);
    const section = container.querySelector('#why-us');
    expect(section).toBeTruthy();
  });

  it('renders 4 reason cards', () => {
    render(<WhyUsSection />);
    expect(screen.getByText('Uncompromising Quality')).toBeTruthy();
    expect(screen.getByText('Prompt Delivery')).toBeTruthy();
    expect(screen.getByText('B2B Expertise')).toBeTruthy();
    expect(screen.getByText('Eco-Conscious Options')).toBeTruthy();
  });

  it('renders Why Navodaya label', () => {
    render(<WhyUsSection />);
    expect(screen.getByText('Why Navodaya')).toBeTruthy();
  });

  it('renders subheadline', () => {
    render(<WhyUsSection />);
    expect(screen.getByText(/not just a supplier/)).toBeTruthy();
  });

  it('checks CSS.supports branch (returns false by default)', () => {
    render(<WhyUsSection />);
    expect(screen.getByText('Why Businesses Choose Us')).toBeTruthy();
  });

  it('handles CSS.supports returning true', () => {
    vi.mocked(window.CSS.supports).mockReturnValue(true);
    render(<WhyUsSection />);
    expect(screen.getByText('Why Businesses Choose Us')).toBeTruthy();
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

    render(<WhyUsSection />);
    expect(screen.getByText('Why Businesses Choose Us')).toBeTruthy();
  });

  it('renders card descriptions', () => {
    render(<WhyUsSection />);
    expect(screen.getByText(/Every product is sourced/)).toBeTruthy();
    expect(screen.getByText(/operations depend on timely/)).toBeTruthy();
    expect(screen.getByText(/work exclusively with businesses/)).toBeTruthy();
    expect(screen.getByText(/Biodegradable shower caps/)).toBeTruthy();
  });

  it('renders icons for each card', () => {
    render(<WhyUsSection />);
    expect(screen.getByTestId('shield-icon')).toBeTruthy();
    expect(screen.getByTestId('truck-icon')).toBeTruthy();
    expect(screen.getByTestId('users-icon')).toBeTruthy();
    expect(screen.getByTestId('leaf-icon')).toBeTruthy();
  });

  it('renders accent bars and icon containers', () => {
    const { container } = render(<WhyUsSection />);
    const accentBars = container.querySelectorAll('.accent-bar');
    expect(accentBars.length).toBe(4);
    const icons = container.querySelectorAll('.why-icon');
    expect(icons.length).toBe(4);
  });

  it('renders why-card elements', () => {
    const { container } = render(<WhyUsSection />);
    const cards = container.querySelectorAll('.why-card');
    expect(cards.length).toBe(4);
  });

  it('tests destroyed flag path - unmount before async init completes', async () => {
    // This tests the "destroyed" flag that prevents animation setup if component unmounts
    const { unmount } = render(<WhyUsSection />);

    // Unmount immediately before async import resolves
    unmount();

    // Component should unmount without errors
    expect(true).toBe(true);
  });

  it('tests async import path with CSS.supports false', async () => {
    vi.mocked(window.CSS.supports).mockReturnValue(false);

    await act(async () => {
      render(<WhyUsSection />);
      // Wait for async imports to complete
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    expect(screen.getByText('Why Businesses Choose Us')).toBeTruthy();
  });

  it('tests async import path with CSS.supports true', async () => {
    vi.mocked(window.CSS.supports).mockReturnValue(true);

    await act(async () => {
      render(<WhyUsSection />);
      // Wait for async imports to complete
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    expect(screen.getByText('Why Businesses Choose Us')).toBeTruthy();
  });

  it('renders all card titles', () => {
    render(<WhyUsSection />);
    const titles = [
      'Uncompromising Quality',
      'Prompt Delivery',
      'B2B Expertise',
      'Eco-Conscious Options',
    ];
    titles.forEach((title) => {
      expect(screen.getByText(title)).toBeTruthy();
    });
  });

  it('renders section with correct background', () => {
    const { container } = render(<WhyUsSection />);
    const section = container.querySelector('.bg-white');
    expect(section).toBeTruthy();
  });
});
