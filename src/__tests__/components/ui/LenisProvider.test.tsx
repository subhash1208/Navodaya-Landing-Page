import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { LenisProvider } from '@/components/ui/LenisProvider';

const mockDestroy = vi.fn();
const mockOn = vi.fn();
const mockRaf = vi.fn();

vi.mock('lenis', () => {
  return {
    default: vi.fn().mockImplementation(function (this: any) {
      this.destroy = mockDestroy;
      this.on = mockOn;
      this.raf = mockRaf;
      return this;
    }),
  };
});

const mockTickerAdd = vi.fn();
const mockTickerLagSmoothing = vi.fn();

vi.mock('gsap', () => ({
  gsap: {
    registerPlugin: vi.fn(),
    ticker: {
      add: (...args: any[]) => mockTickerAdd(...args),
      lagSmoothing: (...args: any[]) => mockTickerLagSmoothing(...args),
    },
  },
}));

vi.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: {
    update: vi.fn(),
  },
}));

describe('LenisProvider', () => {
  beforeEach(() => {
    mockDestroy.mockClear();
    mockOn.mockClear();
    mockRaf.mockClear();
    mockTickerAdd.mockClear();
    mockTickerLagSmoothing.mockClear();
    // Reset matchMedia to default (no reduced motion)
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

  it('renders children', () => {
    render(
      <LenisProvider>
        <div data-testid="child">Content</div>
      </LenisProvider>,
    );
    expect(screen.getByTestId('child')).toBeTruthy();
  });

  it('initializes Lenis when motion is not reduced', async () => {
    const Lenis = (await import('lenis')).default;
    await act(async () => {
      render(
        <LenisProvider>
          <div>Content</div>
        </LenisProvider>,
      );
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(Lenis).toHaveBeenCalled();
  });

  it('does not initialize Lenis when prefers-reduced-motion is set', async () => {
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

    const Lenis = (await import('lenis')).default;
    vi.mocked(Lenis).mockClear();

    render(
      <LenisProvider>
        <div data-testid="child-reduced">Content</div>
      </LenisProvider>,
    );
    expect(screen.getByTestId('child-reduced')).toBeTruthy();
    // Lenis should NOT be instantiated when reduced motion is preferred
    expect(Lenis).not.toHaveBeenCalled();
  });

  it('registers scroll listener on Lenis instance', async () => {
    await act(async () => {
      render(
        <LenisProvider>
          <div>Content</div>
        </LenisProvider>,
      );
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Verify lenis.on was called with 'scroll'
    expect(mockOn).toHaveBeenCalledWith('scroll', expect.any(Function));
  });

  it('adds gsap ticker callback that calls lenis.raf', async () => {
    await act(async () => {
      render(
        <LenisProvider>
          <div>Content</div>
        </LenisProvider>,
      );
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Verify gsap.ticker.add was called with a function
    expect(mockTickerAdd).toHaveBeenCalledWith(expect.any(Function));

    // Call the ticker callback to cover the lenis.raf(time * 1000) line
    const tickerCallback = mockTickerAdd.mock.calls[0][0] as (time: number) => void;
    tickerCallback(1.5);
    expect(mockRaf).toHaveBeenCalledWith(1500);
  });

  it('calls gsap.ticker.lagSmoothing(0)', async () => {
    await act(async () => {
      render(
        <LenisProvider>
          <div>Content</div>
        </LenisProvider>,
      );
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(mockTickerLagSmoothing).toHaveBeenCalledWith(0);
  });

  it('destroys Lenis on unmount', async () => {
    let unmount: any;
    await act(async () => {
      const result = render(
        <LenisProvider>
          <div>Content</div>
        </LenisProvider>,
      );
      unmount = result.unmount;
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    unmount();
    expect(mockDestroy).toHaveBeenCalled();
  });
});
