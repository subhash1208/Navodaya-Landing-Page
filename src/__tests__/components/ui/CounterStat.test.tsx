import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { CounterStat } from '@/components/ui/CounterStat';

const mockFromTo = vi.fn();
const mockTo = vi.fn();
const mockKill = vi.fn();

// Mirrors real GSAP: a tween returned WITHOUT a `scrollTrigger` in its vars carries no
// `.scrollTrigger` handle. This is what makes the unmount test below meaningful against the
// original bug — a bare `ScrollTrigger.create({ onEnter: () => gsap.to(...) })` produces a
// tween whose vars never include `scrollTrigger`, so `tween?.scrollTrigger?.kill()` would
// silently no-op and this test would fail against the unfixed code.
function tweenFor(vars: any) {
  return vars?.scrollTrigger ? { scrollTrigger: { kill: mockKill } } : {};
}

vi.mock('gsap', () => ({
  gsap: {
    registerPlugin: vi.fn(),
    fromTo: (...args: any[]) => {
      mockFromTo(...args);
      return tweenFor(args[2]);
    },
    to: (...args: any[]) => {
      mockTo(...args);
      return tweenFor(args[1]);
    },
    set: vi.fn(),
    context: vi.fn().mockReturnValue({ revert: vi.fn() }),
  },
}));

vi.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: {
    create: vi.fn(),
    getAll: vi.fn().mockReturnValue([]),
  },
}));

describe('CounterStat', () => {
  function setReducedMotion(matches: boolean) {
    vi.mocked(window.matchMedia).mockImplementation((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)' ? matches : false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  }

  beforeEach(() => {
    mockFromTo.mockClear();
    mockTo.mockClear();
    mockKill.mockClear();
    setReducedMotion(false);
  });

  it('renders numeric value', () => {
    render(<CounterStat value="51+" label="Products in catalogue" />);
    expect(screen.getByText('51+')).toBeTruthy();
  });

  it('renders label', () => {
    render(<CounterStat value="3" label="Product categories" />);
    expect(screen.getByText('Product categories')).toBeTruthy();
  });

  it('renders non-numeric value (e.g. HYD)', () => {
    render(<CounterStat value="HYD" label="Based in Hyderabad" />);
    expect(screen.getByText('HYD')).toBeTruthy();
  });

  it('renders percentage value', () => {
    render(<CounterStat value="100%" label="B2B focused" />);
    expect(screen.getByText('100%')).toBeTruthy();
  });

  it('has aria-label on the value element', () => {
    render(<CounterStat value="51+" label="Products" />);
    const el = screen.getByLabelText('51+');
    expect(el).toBeTruthy();
  });

  it('embeds a scrollTrigger config inside the tween for numeric values', async () => {
    await act(async () => {
      render(<CounterStat value="51+" label="Products" />);
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(mockTo).toHaveBeenCalledWith(
      expect.objectContaining({ val: 0 }),
      expect.objectContaining({
        val: 51,
        scrollTrigger: expect.objectContaining({ start: 'top 85%', once: true }),
      }),
    );
  });

  it('calls gsap.fromTo for non-numeric values (fade in with scale)', async () => {
    await act(async () => {
      render(<CounterStat value="HYD" label="Based in Hyderabad" />);
      // Wait for dynamic import to resolve
      await new Promise((resolve) => setTimeout(resolve, 50));
    });
    expect(mockFromTo).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({
        scrollTrigger: expect.objectContaining({ start: 'top 85%', once: true }),
      }),
    );
  });

  it('starts the counter tween directly on init (no ScrollTrigger.create indirection)', async () => {
    await act(async () => {
      render(<CounterStat value="51+" label="Products" />);
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // gsap.to should have been called with the counter animation
    expect(mockTo).toHaveBeenCalledWith(
      expect.objectContaining({ val: 0 }),
      expect.objectContaining({
        val: 51,
        ease: 'power2.out',
        onUpdate: expect.any(Function),
        onComplete: expect.any(Function),
      }),
    );
  });

  it('onUpdate callback updates element textContent', async () => {
    let capturedOnUpdate: (() => void) | undefined;
    let capturedOnComplete: (() => void) | undefined;
    mockTo.mockImplementationOnce((_target: any, vars: any) => {
      capturedOnUpdate = vars.onUpdate;
      capturedOnComplete = vars.onComplete;
      return { scrollTrigger: { kill: mockKill } };
    });

    let container: any;
    await act(async () => {
      const result = render(<CounterStat value="51+" label="Products" />);
      container = result.container;
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    const numEl = container.querySelector('[aria-label="51+"]') as HTMLElement;

    // Call onUpdate
    if (capturedOnUpdate) capturedOnUpdate();
    expect(numEl.textContent).toBe('0+');

    // Call onComplete
    if (capturedOnComplete) capturedOnComplete();
    expect(numEl.textContent).toBe('51+');
  });

  it('uses shorter duration for small numbers', async () => {
    await act(async () => {
      render(<CounterStat value="3" label="Categories" />);
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // For numbers <= 10, duration should be 0.8
    expect(mockTo).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ duration: 0.8 }),
    );
  });

  it('uses longer duration for large numbers', async () => {
    await act(async () => {
      render(<CounterStat value="100%" label="B2B focused" />);
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // For numbers > 10, duration should be 1.5
    expect(mockTo).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ duration: 1.5 }),
    );
  });

  it('kills the tween itself on unmount, via tween.scrollTrigger.kill() — not merely an orphaned trigger', async () => {
    let unmount: () => void = () => {};
    await act(async () => {
      const result = render(<CounterStat value="51+" label="Products" />);
      unmount = result.unmount;
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(mockKill).not.toHaveBeenCalled();
    act(() => unmount());
    expect(mockKill).toHaveBeenCalledTimes(1);
  });

  describe('prefers-reduced-motion: reduce', () => {
    it('creates no tween for a numeric value', async () => {
      setReducedMotion(true);

      await act(async () => {
        render(<CounterStat value="51+" label="Products" />);
        await new Promise((resolve) => setTimeout(resolve, 50));
      });

      expect(mockTo).not.toHaveBeenCalled();
    });

    it('creates no fade tween for a non-numeric value', async () => {
      setReducedMotion(true);

      await act(async () => {
        render(<CounterStat value="HYD" label="Based in Hyderabad" />);
        await new Promise((resolve) => setTimeout(resolve, 50));
      });

      expect(mockFromTo).not.toHaveBeenCalled();
    });

    it('leaves the terminal state on screen — final text, no inline opacity or transform', async () => {
      setReducedMotion(true);

      let container: HTMLElement = document.createElement('div');
      await act(async () => {
        const result = render(<CounterStat value="100%" label="B2B focused" />);
        container = result.container;
        await new Promise((resolve) => setTimeout(resolve, 50));
      });

      const numEl = container.querySelector('[aria-label="100%"]') as HTMLElement;
      expect(numEl.textContent).toBe('100%');
      expect(numEl.style.opacity).toBe('');
      expect(numEl.style.transform).toBe('');
    });

    it('unmounts cleanly when the guard returned early', async () => {
      setReducedMotion(true);

      let unmount: () => void = () => {};
      await act(async () => {
        const result = render(<CounterStat value="3" label="Categories" />);
        unmount = result.unmount;
        await new Promise((resolve) => setTimeout(resolve, 50));
      });

      expect(() => act(() => unmount())).not.toThrow();
    });
  });
});
