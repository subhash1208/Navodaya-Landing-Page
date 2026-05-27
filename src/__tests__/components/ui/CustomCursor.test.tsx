import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { CustomCursor } from '@/components/ui/CustomCursor';

describe('CustomCursor', () => {
  beforeEach(() => {
    // Reset matchMedia to default (hover supported, no reduced motion)
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
    // Reset cursor style
    document.documentElement.style.cursor = '';
  });

  it('renders cursor div', () => {
    const { container } = render(<CustomCursor />);
    const cursor = container.querySelector('.custom-cursor');
    expect(cursor).toBeTruthy();
  });

  it('has aria-hidden attribute', () => {
    const { container } = render(<CustomCursor />);
    const cursor = container.querySelector('[aria-hidden="true"]');
    expect(cursor).toBeTruthy();
  });

  it('adds mousemove listener when hover is supported', () => {
    const addEventSpy = vi.spyOn(window, 'addEventListener');
    render(<CustomCursor />);
    expect(addEventSpy).toHaveBeenCalledWith('mousemove', expect.any(Function), { passive: true });
    addEventSpy.mockRestore();
  });

  it('does not add listener on touch devices', () => {
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

    const addEventSpy = vi.spyOn(window, 'addEventListener');
    render(<CustomCursor />);
    expect(addEventSpy).not.toHaveBeenCalledWith('mousemove', expect.any(Function), {
      passive: true,
    });
    addEventSpy.mockRestore();
  });

  it('does not add listener when prefers-reduced-motion', () => {
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

    const addEventSpy = vi.spyOn(window, 'addEventListener');
    render(<CustomCursor />);
    expect(addEventSpy).not.toHaveBeenCalledWith('mousemove', expect.any(Function), {
      passive: true,
    });
    addEventSpy.mockRestore();
  });

  it('updates cursor transform on mousemove', () => {
    const { container } = render(<CustomCursor />);
    const cursor = container.querySelector('.custom-cursor') as HTMLElement;

    // Simulate mousemove
    const moveEvent = new MouseEvent('mousemove', { clientX: 100, clientY: 200 });
    window.dispatchEvent(moveEvent);

    // Cursor should be translated to (100-20, 200-20)
    expect(cursor.style.transform).toBe('translate(80px, 180px)');
  });

  it('adds cursor--hover class on interactive element mouseenter', () => {
    // Render with an interactive element
    const { container } = render(
      <div>
        <button data-testid="btn">Click me</button>
        <CustomCursor />
      </div>,
    );
    const cursor = container.querySelector('.custom-cursor') as HTMLElement;
    const btn = container.querySelector('button') as HTMLElement;

    // Simulate mouseenter on the button
    fireEvent.mouseEnter(btn);
    expect(cursor.classList.contains('custom-cursor--hover')).toBe(true);
  });

  it('removes cursor--hover class on interactive element mouseleave', () => {
    const { container } = render(
      <div>
        <button data-testid="btn">Click me</button>
        <CustomCursor />
      </div>,
    );
    const cursor = container.querySelector('.custom-cursor') as HTMLElement;
    const btn = container.querySelector('button') as HTMLElement;

    // Add hover class first
    fireEvent.mouseEnter(btn);
    expect(cursor.classList.contains('custom-cursor--hover')).toBe(true);

    // Then remove it
    fireEvent.mouseLeave(btn);
    expect(cursor.classList.contains('custom-cursor--hover')).toBe(false);
  });

  it('cleans up on unmount (restores default cursor)', () => {
    const { unmount } = render(<CustomCursor />);

    unmount();

    // Should restore default cursor
    expect(document.documentElement.style.cursor).toBe('');
  });

  it('hides default cursor on mount when hover is supported', () => {
    // Ensure matchMedia returns false for both checks (hover supported, no reduced motion)
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

    render(<CustomCursor />);
    expect(document.documentElement.style.cursor).toBe('none');
  });
});
