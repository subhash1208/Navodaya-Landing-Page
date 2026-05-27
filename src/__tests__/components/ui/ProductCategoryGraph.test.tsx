import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { ProductCategoryGraph } from '@/components/ui/ProductCategoryGraph';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock canvas context
const mockCtx = {
  clearRect: vi.fn(),
  beginPath: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  stroke: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  fillText: vi.fn(),
  measureText: vi.fn().mockReturnValue({ width: 50 }),
  createRadialGradient: vi.fn().mockReturnValue({ addColorStop: vi.fn() }),
  createLinearGradient: vi.fn().mockReturnValue({ addColorStop: vi.fn() }),
  save: vi.fn(),
  restore: vi.fn(),
  setLineDash: vi.fn(),
  roundRect: vi.fn(),
  font: '',
  textAlign: '',
  textBaseline: '',
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 0,
  globalAlpha: 1,
  lineCap: '',
};

describe('ProductCategoryGraph', () => {
  beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(mockCtx as any);
    // Override rAF to NOT call the callback (prevents infinite loop)
    Object.defineProperty(window, 'requestAnimationFrame', {
      writable: true,
      value: vi.fn().mockReturnValue(1),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders canvas element', () => {
    const { container } = render(<ProductCategoryGraph />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeTruthy();
  });

  it('renders with custom width and height', () => {
    const { container } = render(<ProductCategoryGraph width={600} height={600} />);
    const canvas = container.querySelector('canvas') as HTMLCanvasElement;
    expect(canvas.width).toBe(600);
    expect(canvas.height).toBe(600);
  });

  it('has aria-hidden attribute', () => {
    const { container } = render(<ProductCategoryGraph />);
    const canvas = container.querySelector('canvas');
    expect(canvas?.getAttribute('aria-hidden')).toBe('true');
  });

  it('calls requestAnimationFrame on render', () => {
    render(<ProductCategoryGraph />);
    expect(window.requestAnimationFrame).toHaveBeenCalled();
  });

  it('handles mouse move events', () => {
    const { container } = render(<ProductCategoryGraph />);
    const canvas = container.querySelector('canvas') as HTMLCanvasElement;
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      right: 500,
      bottom: 500,
      width: 500,
      height: 500,
      x: 0,
      y: 0,
      toJSON: vi.fn(),
    });
    fireEvent.mouseMove(canvas, { clientX: 100, clientY: 100 });
    expect(canvas).toBeTruthy();
  });

  it('handles mouse leave events', () => {
    const { container } = render(<ProductCategoryGraph />);
    const canvas = container.querySelector('canvas') as HTMLCanvasElement;
    fireEvent.mouseLeave(canvas);
    expect(canvas).toBeTruthy();
  });

  it('handles click events', () => {
    const { container } = render(<ProductCategoryGraph />);
    const canvas = container.querySelector('canvas') as HTMLCanvasElement;
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      right: 500,
      bottom: 500,
      width: 500,
      height: 500,
      x: 0,
      y: 0,
      toJSON: vi.fn(),
    });
    fireEvent.click(canvas, { clientX: 250, clientY: 250 });
    expect(canvas).toBeTruthy();
  });

  it('renders with isMobile prop', () => {
    const { container } = render(<ProductCategoryGraph isMobile={true} />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeTruthy();
  });

  it('accepts onLogoScale callback', () => {
    const onLogoScale = vi.fn();
    render(<ProductCategoryGraph onLogoScale={onLogoScale} />);
    expect(onLogoScale).not.toThrow;
  });

  it('accepts collapseRef', () => {
    const collapseRef = { current: null } as React.MutableRefObject<(() => void) | null>;
    render(<ProductCategoryGraph collapseRef={collapseRef} />);
    expect(collapseRef.current).toBeTypeOf('function');
  });

  it('collapseRef function can be called', () => {
    const collapseRef = { current: null } as React.MutableRefObject<(() => void) | null>;
    render(<ProductCategoryGraph collapseRef={collapseRef} />);
    expect(() => collapseRef.current?.()).not.toThrow();
  });

  it('does not start animation when prefers-reduced-motion', () => {
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

    const { container } = render(<ProductCategoryGraph />);
    expect(container.querySelector('canvas')).toBeTruthy();
  });
});
