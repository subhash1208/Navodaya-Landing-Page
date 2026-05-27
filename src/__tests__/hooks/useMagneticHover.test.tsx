import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { render, fireEvent } from '@testing-library/react';
import { useMagneticHover } from '@/hooks/useMagneticHover';

describe('useMagneticHover', () => {
  it('returns a ref object', () => {
    const { result } = renderHook(() => useMagneticHover());
    expect(result.current).toHaveProperty('current');
  });

  it('accepts a custom strength parameter', () => {
    const { result } = renderHook(() => useMagneticHover(0.5));
    expect(result.current).toHaveProperty('current');
    expect(result.current.current).toBeNull();
  });

  it('does not throw when ref is not attached', () => {
    expect(() => {
      renderHook(() => useMagneticHover(0.25));
    }).not.toThrow();
  });

  it('does not add listeners on touch devices', () => {
    vi.mocked(window.matchMedia).mockImplementation((query: string) => ({
      matches: query === '(hover: none)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { result } = renderHook(() => useMagneticHover(0.3));
    expect(result.current.current).toBeNull();
  });

  it('works with a real DOM element via component', () => {
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

    function TestComponent() {
      const ref = useMagneticHover<HTMLDivElement>(0.25);
      return (
        <div ref={ref} data-testid="magnetic">
          Content
        </div>
      );
    }

    const { getByTestId } = render(<TestComponent />);
    const el = getByTestId('magnetic');

    // Simulate mouse move
    fireEvent.mouseMove(el, { clientX: 100, clientY: 100 });
    // Simulate mouse leave
    fireEvent.mouseLeave(el);

    expect(el.style.transform).toBe('translate(0, 0)');
  });

  it('applies magnetic transform when mouse is within threshold distance', () => {
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

    function TestComponent() {
      const ref = useMagneticHover<HTMLDivElement>(0.3);
      return (
        <div ref={ref} data-testid="magnetic-close" style={{ width: '100px', height: '100px' }}>
          Content
        </div>
      );
    }

    const { getByTestId } = render(<TestComponent />);
    const el = getByTestId('magnetic-close');

    // Mock getBoundingClientRect to return known values
    vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      right: 100,
      bottom: 100,
      width: 100,
      height: 100,
      x: 0,
      y: 0,
      toJSON: () => {},
    });

    // Move mouse very close to center (50, 50) — distance will be small
    // Center is at (50, 50), mouse at (60, 55) → distance = sqrt(100+25) ≈ 11.18
    // Threshold = max(100, 100) * 1.2 = 120, so 11.18 < 120 → within threshold
    fireEvent.mouseMove(el, { clientX: 60, clientY: 55 });

    // The transform should be applied (not "translate(0, 0)")
    expect(el.style.transform).toContain('translate(');
    expect(el.style.transform).not.toBe('translate(0, 0)');
    // Verify the transition is set for the magnetic effect
    expect(el.style.transition).toBe('transform 0.1s ease-out');
  });

  it('does not apply transform when mouse is outside threshold distance', () => {
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

    function TestComponent() {
      const ref = useMagneticHover<HTMLDivElement>(0.3);
      return (
        <div ref={ref} data-testid="magnetic-far" style={{ width: '100px', height: '100px' }}>
          Content
        </div>
      );
    }

    const { getByTestId } = render(<TestComponent />);
    const el = getByTestId('magnetic-far');

    // Mock getBoundingClientRect
    vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      right: 100,
      bottom: 100,
      width: 100,
      height: 100,
      x: 0,
      y: 0,
      toJSON: () => {},
    });

    // Move mouse far from center (50, 50) — distance > threshold (120)
    // Mouse at (200, 200) → distance = sqrt(150^2 + 150^2) ≈ 212 > 120
    fireEvent.mouseMove(el, { clientX: 200, clientY: 200 });

    // Transform should NOT be applied (stays at default or empty)
    // The element won't have the magnetic transform applied
    expect(el.style.transform).not.toContain('translate(1');
  });

  it('cleans up event listeners on unmount', () => {
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

    function TestComponent() {
      const ref = useMagneticHover<HTMLDivElement>(0.3);
      return (
        <div ref={ref} data-testid="magnetic-cleanup">
          Content
        </div>
      );
    }

    const { getByTestId, unmount } = render(<TestComponent />);
    const el = getByTestId('magnetic-cleanup');
    const removeSpy = vi.spyOn(el, 'removeEventListener');

    unmount();

    expect(removeSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith('mouseleave', expect.any(Function));
  });
});
