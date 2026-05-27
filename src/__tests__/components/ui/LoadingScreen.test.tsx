import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

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
}));

vi.mock('next/image', () => ({
  default: (props: any) => <img {...props} />,
}));

describe('LoadingScreen', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders children after loading completes', () => {
    render(
      <LoadingScreen>
        <div data-testid="main-content">Main</div>
      </LoadingScreen>,
    );

    // Advance through all timers
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(screen.getByTestId('main-content')).toBeTruthy();
  });

  it('skips loading when session key exists', () => {
    sessionStorage.setItem('nv_intro_seen', '1');

    render(
      <LoadingScreen>
        <div data-testid="main-content">Main</div>
      </LoadingScreen>,
    );

    expect(screen.getByTestId('main-content')).toBeTruthy();
  });

  it('shows loading screen on first visit', () => {
    const { container } = render(
      <LoadingScreen>
        <div data-testid="main-content">Main</div>
      </LoadingScreen>,
    );

    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Should have loading status element
    const status = container.querySelector('[role="status"]');
    expect(status).toBeTruthy();
  });

  it('handles reduced motion preference', () => {
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

    render(
      <LoadingScreen>
        <div data-testid="main-content">Main</div>
      </LoadingScreen>,
    );

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByTestId('main-content')).toBeTruthy();
  });
});
