import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useEffect } from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { useIntroFinished } from '@/hooks/useIntroFinished';

vi.mock('motion/react', () => {
  // The component per tag is CACHED. A bare `get` handler returns a fresh function on every
  // property access, so `motion.div` is a different component type on every render and React
  // tears down and rebuilds the whole subtree — silently destroying uncontrolled input values
  // and breaking any `toBe` node-identity assertion. That matters more here than anywhere:
  // this file's whole subject is a wrapper whose remount behaviour is the defect under test.
  // Same pattern as ContactSection.test.tsx:17-31.
  const cache = new Map<string, React.ComponentType<any>>();
  return {
    motion: new Proxy(
      {},
      {
        get: (_, tag) => {
          const key = String(tag);
          let component = cache.get(key);
          if (!component) {
            component = (props: any) => {
              const {
                initial,
                animate,
                exit,
                transition,
                whileInView,
                variants,
                viewport,
                ...rest
              } = props;
              return <div data-testid={`motion-${key}`} {...rest} />;
            };
            cache.set(key, component);
          }
          return component;
        },
      },
    ),
    AnimatePresence: ({ children }: any) => <>{children}</>,
  };
});

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
    const { container } = render(
      <LoadingScreen>
        <div data-testid="main-content">Main</div>
      </LoadingScreen>,
    );

    // The intro is one 1400ms gesture, not the old four-second montage. Advancing just past
    // TOTAL_DURATION must be enough — a slower timeline would fail here rather than hide
    // behind a generous 5000ms advance.
    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(screen.getByTestId('main-content')).toBeTruthy();
    expect(container.querySelector('[role="status"]')).toBeNull();
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

    const { container } = render(
      <LoadingScreen>
        <div data-testid="main-content">Main</div>
      </LoadingScreen>,
    );

    // Reduced motion holds a static brand frame for 600ms — no seal draw, no split.
    act(() => {
      vi.advanceTimersByTime(599);
    });
    expect(container.querySelector('[role="status"]')).toBeTruthy();

    act(() => {
      vi.advanceTimersByTime(2);
    });

    expect(screen.getByTestId('main-content')).toBeTruthy();
    expect(container.querySelector('[role="status"]')).toBeNull();
  });
});

/**
 * WCAG SC 2.2.2 (Pause, Stop, Hide): auto-starting content needs a mechanism to stop it.
 * The intro offers two — Escape, and a full-viewport skip button.
 *
 * The SSR regression guard that used to sit here now lives in `LoadingScreen.ssr.test.tsx`.
 * `vi.mock` is file-scoped and hoisted, so the `motion/react` passthrough at the top of this
 * file applied to it — stripping the very `initial` prop whose SSR serialisation is the
 * defect it was written to catch. It could not have failed.
 */
describe('LoadingScreen skip mechanism', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    sessionStorage.clear();
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

  afterEach(() => {
    vi.useRealTimers();
  });

  it('dismisses the overlay and marks the intro seen when Escape is pressed', () => {
    const { container } = render(
      <LoadingScreen>
        <div data-testid="main-content">Main</div>
      </LoadingScreen>,
    );

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(container.querySelector('[role="status"]')).toBeTruthy();

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });

    expect(container.querySelector('[role="status"]')).toBeNull();
    expect(sessionStorage.getItem('nv_intro_seen')).toBe('1');
    expect(screen.getByTestId('main-content')).toBeTruthy();
  });

  it('ignores keys other than Escape', () => {
    const { container } = render(
      <LoadingScreen>
        <div data-testid="main-content">Main</div>
      </LoadingScreen>,
    );

    act(() => {
      vi.advanceTimersByTime(100);
    });

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    });

    expect(container.querySelector('[role="status"]')).toBeTruthy();
    expect(sessionStorage.getItem('nv_intro_seen')).toBeNull();
  });

  it('dismisses the overlay and marks the intro seen when the skip button is clicked', () => {
    const { container } = render(
      <LoadingScreen>
        <div data-testid="main-content">Main</div>
      </LoadingScreen>,
    );

    act(() => {
      vi.advanceTimersByTime(100);
    });

    const skip = screen.getByRole('button', { name: /skip intro/i });
    act(() => {
      fireEvent.click(skip);
    });

    expect(container.querySelector('[role="status"]')).toBeNull();
    expect(sessionStorage.getItem('nv_intro_seen')).toBe('1');
  });

  it('stops listening for Escape once the component unmounts', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = render(
      <LoadingScreen>
        <div data-testid="main-content">Main</div>
      </LoadingScreen>,
    );

    act(() => {
      vi.advanceTimersByTime(100);
    });
    unmount();

    expect(removeSpy.mock.calls.some(([type]) => type === 'keydown')).toBe(true);
    removeSpy.mockRestore();
  });
});

describe('LoadingScreen timeline', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    sessionStorage.clear();
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

  afterEach(() => {
    vi.useRealTimers();
  });

  it('marks the intro seen when the panels split, and lifts the overlay at 1400ms', () => {
    const { container } = render(
      <LoadingScreen>
        <div data-testid="main-content">Main</div>
      </LoadingScreen>,
    );

    // 900ms — the split begins and the session key is written. This is the marker
    // `e2e/loading-screen.spec.ts` polls for; it used to be the 3.2s stage.
    act(() => {
      vi.advanceTimersByTime(899);
    });
    expect(sessionStorage.getItem('nv_intro_seen')).toBeNull();

    act(() => {
      vi.advanceTimersByTime(2);
    });
    expect(sessionStorage.getItem('nv_intro_seen')).toBe('1');
    expect(container.querySelector('[role="status"]')).toBeTruthy();

    // 1400ms — TOTAL_DURATION. The overlay unmounts.
    act(() => {
      vi.advanceTimersByTime(498);
    });
    expect(container.querySelector('[role="status"]')).toBeTruthy();

    act(() => {
      vi.advanceTimersByTime(2);
    });
    expect(container.querySelector('[role="status"]')).toBeNull();
  });

  it('renders the wordmark and a single seal line, and no retired ornament', () => {
    const { container } = render(
      <LoadingScreen>
        <div data-testid="main-content">Main</div>
      </LoadingScreen>,
    );

    act(() => {
      vi.advanceTimersByTime(400);
    });

    const status = container.querySelector('[role="status"]');
    expect(status?.textContent).toContain('NAVODAYA');
    expect(status?.querySelector('.bg-brand-cyan')).toBeTruthy();

    // The six deleted effects: particles, radial glow, gradient sweep, keyword reel,
    // motto and progress bar. Their class and colour hooks must be gone for good.
    expect(container.querySelector('.loading-particle')).toBeNull();
    expect(container.querySelector('.loading-gradient-sweep')).toBeNull();
    expect(container.innerHTML).not.toContain('slotMachine');
    expect(container.innerHTML).not.toContain('radial-gradient');
    expect(container.innerHTML).not.toContain('#08B8F8');
  });
});

/**
 * Regression guard for the remount bug.
 *
 * `LoadingScreen` used to return three differently SHAPED fragments — `[<div>, children]`
 * while undecided, `[<AnimatePresence>, children]` while showing, `[children]` once done.
 * React reconciles fragment children by position, so when `show` flipped to false at
 * TOTAL_DURATION, `children` slid from index 1 to index 0, collided with the overlay's
 * type, and React tore down and rebuilt the entire homepage.
 *
 * Measured in a real browser: the <form> and <h1> nodes were both replaced at +3920ms,
 * and anything a visitor had typed into the contact form in the first four seconds was
 * silently wiped. Two Playwright contact-form specs failed for exactly this reason.
 *
 * Asserting on node identity and on an uncontrolled input's value is what catches it —
 * a remount is invisible to any assertion that only looks at rendered text.
 */
describe('LoadingScreen child stability', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    sessionStorage.clear();
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

  afterEach(() => {
    vi.useRealTimers();
  });

  it('never remounts its children while the intro plays and finishes', () => {
    const mounted = vi.fn();
    function Probe() {
      useEffect(() => {
        mounted();
      }, []);
      return <input data-testid="probe" />;
    }

    render(
      <LoadingScreen>
        <Probe />
      </LoadingScreen>,
    );

    const before = screen.getByTestId('probe') as HTMLInputElement;
    before.value = 'typed during the intro';

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    const after = screen.getByTestId('probe') as HTMLInputElement;
    expect(after).toBe(before);
    expect(after.value).toBe('typed during the intro');
    expect(mounted).toHaveBeenCalledTimes(1);
  });

  it('never remounts its children on a return visit either', () => {
    sessionStorage.setItem('nv_intro_seen', '1');
    const mounted = vi.fn();
    function Probe() {
      useEffect(() => {
        mounted();
      }, []);
      return <input data-testid="probe" />;
    }

    render(
      <LoadingScreen>
        <Probe />
      </LoadingScreen>,
    );

    const before = screen.getByTestId('probe');

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(screen.getByTestId('probe')).toBe(before);
    expect(mounted).toHaveBeenCalledTimes(1);
  });

  it('reports the intro unfinished while the overlay is up and finished once it lifts', () => {
    function Gate() {
      return <span data-testid="gate">{String(useIntroFinished())}</span>;
    }

    render(
      <LoadingScreen>
        <Gate />
      </LoadingScreen>,
    );

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(screen.getByTestId('gate').textContent).toBe('false');

    act(() => {
      vi.advanceTimersByTime(10000);
    });
    expect(screen.getByTestId('gate').textContent).toBe('true');
  });

  it('reports the intro finished immediately for a returning visitor', () => {
    sessionStorage.setItem('nv_intro_seen', '1');

    function Gate() {
      return <span data-testid="gate">{String(useIntroFinished())}</span>;
    }

    render(
      <LoadingScreen>
        <Gate />
      </LoadingScreen>,
    );

    expect(screen.getByTestId('gate').textContent).toBe('true');
  });

  it('still dismisses the overlay when sessionStorage throws', () => {
    // Storage access throws rather than returning null in locked-down contexts. An
    // uncaught throw would abort the effect with `show` stuck at null, leaving the opaque
    // overlay covering the site permanently — and now also leaving the intro gate closed,
    // so nothing underneath would ever animate in.
    //
    // Stubbing the whole global rather than spying on Storage.prototype: jsdom's
    // sessionStorage does not delegate to the prototype, so a spy there is silently
    // ignored and the test passes for the wrong reason.
    const denied = () => {
      throw new DOMException('access denied');
    };
    const original = Object.getOwnPropertyDescriptor(window, 'sessionStorage');
    Object.defineProperty(window, 'sessionStorage', {
      configurable: true,
      value: { getItem: denied, setItem: denied, removeItem: denied, clear: denied, length: 0 },
    });

    try {
      function Gate() {
        return <span data-testid="gate">{String(useIntroFinished())}</span>;
      }

      const { container } = render(
        <LoadingScreen>
          <Gate />
        </LoadingScreen>,
      );

      act(() => {
        vi.advanceTimersByTime(10000);
      });

      expect(container.querySelector('[role="status"]')).toBeNull();
      expect(screen.getByTestId('gate').textContent).toBe('true');
    } finally {
      if (original) Object.defineProperty(window, 'sessionStorage', original);
    }
  });
});
