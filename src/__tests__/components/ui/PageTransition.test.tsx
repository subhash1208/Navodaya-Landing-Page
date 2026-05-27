import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { PageTransition } from '@/components/ui/PageTransition';

const mockFromTo = vi.fn();
const mockTo = vi.fn();
const mockSet = vi.fn();

vi.mock('gsap', () => ({
  gsap: {
    registerPlugin: vi.fn(),
    fromTo: (...args: any[]) => mockFromTo(...args),
    to: (...args: any[]) => mockTo(...args),
    set: (...args: any[]) => mockSet(...args),
  },
}));

let mockPathname = '/';
vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

describe('PageTransition', () => {
  beforeEach(() => {
    mockFromTo.mockClear();
    mockTo.mockClear();
    mockSet.mockClear();
    mockPathname = '/';
  });
  it('renders children', () => {
    mockPathname = '/';
    render(
      <PageTransition>
        <div data-testid="child">Content</div>
      </PageTransition>,
    );
    expect(screen.getByTestId('child')).toBeTruthy();
  });

  it('renders curtain overlay', () => {
    mockPathname = '/';
    const { container } = render(
      <PageTransition>
        <div>Content</div>
      </PageTransition>,
    );
    const curtain = container.querySelector('[aria-hidden="true"]');
    expect(curtain).toBeTruthy();
  });

  it('curtain is initially off-screen', () => {
    mockPathname = '/';
    const { container } = render(
      <PageTransition>
        <div>Content</div>
      </PageTransition>,
    );
    const curtain = container.querySelector('[aria-hidden="true"]') as HTMLElement;
    expect(curtain.style.transform).toBe('translateX(-100%)');
  });

  it('curtain has pointer-events none when not animating', () => {
    mockPathname = '/';
    const { container } = render(
      <PageTransition>
        <div>Content</div>
      </PageTransition>,
    );
    const curtain = container.querySelector('[aria-hidden="true"]') as HTMLElement;
    expect(curtain.style.pointerEvents).toBe('none');
  });

  it('does not animate when pathname does not change', () => {
    mockPathname = '/';
    render(
      <PageTransition>
        <div>Content</div>
      </PageTransition>,
    );
    expect(mockFromTo).not.toHaveBeenCalled();
  });

  it('triggers animation on Home to Products transition', async () => {
    // First render at '/'
    mockPathname = '/';
    const { rerender } = render(
      <PageTransition>
        <div>Content</div>
      </PageTransition>,
    );

    // Change to /products
    mockPathname = '/products';
    await act(async () => {
      rerender(
        <PageTransition>
          <div>Content</div>
        </PageTransition>,
      );
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(mockFromTo).toHaveBeenCalled();
  });

  it('triggers animation on Products to Home transition', async () => {
    mockPathname = '/products';
    const { rerender } = render(
      <PageTransition>
        <div>Content</div>
      </PageTransition>,
    );

    mockPathname = '/';
    await act(async () => {
      rerender(
        <PageTransition>
          <div>Content</div>
        </PageTransition>,
      );
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(mockFromTo).toHaveBeenCalled();
  });

  it('executes onComplete callback chain (curtain slide out)', async () => {
    // Mock gsap.fromTo to call onComplete synchronously
    mockFromTo.mockImplementation((_el: any, _from: any, toVars: any) => {
      if (toVars.onComplete) toVars.onComplete();
    });
    mockTo.mockImplementation((_el: any, toVars: any) => {
      if (toVars.onComplete) toVars.onComplete();
    });

    mockPathname = '/';
    const { rerender } = render(
      <PageTransition>
        <div>Content</div>
      </PageTransition>,
    );

    mockPathname = '/products';
    await act(async () => {
      rerender(
        <PageTransition>
          <div>Content</div>
        </PageTransition>,
      );
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // fromTo was called (curtain slides in)
    expect(mockFromTo).toHaveBeenCalled();
    // gsap.to was called (curtain slides out)
    expect(mockTo).toHaveBeenCalled();
    // gsap.set was called (reset curtain position)
    expect(mockSet).toHaveBeenCalled();
  });

  it('does not animate for non-qualifying transitions', () => {
    mockPathname = '/about';
    const { rerender } = render(
      <PageTransition>
        <div>Content</div>
      </PageTransition>,
    );

    mockPathname = '/contact';
    rerender(
      <PageTransition>
        <div>Content</div>
      </PageTransition>,
    );

    expect(mockFromTo).not.toHaveBeenCalled();
  });

  it('respects prefers-reduced-motion', async () => {
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

    mockPathname = '/';
    const { rerender } = render(
      <PageTransition>
        <div>Content</div>
      </PageTransition>,
    );

    mockPathname = '/products';
    await act(async () => {
      rerender(
        <PageTransition>
          <div>Content</div>
        </PageTransition>,
      );
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(mockFromTo).not.toHaveBeenCalled();
  });
});
