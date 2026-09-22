import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useEffect } from 'react';
import { render, screen, act } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { useIntroFinished } from '@/hooks/useIntroFinished';

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

/**
 * Regression guard for the SSR defect.
 *
 * `LoadingScreen` wraps the entire homepage (`src/app/page.tsx`). It used to return
 * ONLY an empty `aria-hidden` overlay while `show === null` — the state during server
 * render and the client's first pre-effect pass. The server-rendered HTML for the whole
 * site was therefore one empty div: no <h1>, no copy, no links.
 *
 * Every existing test missed it. The jsdom tests above all run effects, so they only
 * ever observe post-hydration DOM. `src/__tests__/app/page.test.tsx` mocks LoadingScreen
 * into a passthrough, so it cannot exercise the branch at all. The e2e specs let
 * hydration finish before asserting, so they passed with the bug present.
 *
 * `renderToStaticMarkup` never runs effects, so it reproduces the true SSR branch.
 */
describe('LoadingScreen server rendering', () => {
  it('includes children in the server-rendered markup', () => {
    const html = renderToStaticMarkup(
      <LoadingScreen>
        <h1>Real content</h1>
      </LoadingScreen>,
    );

    expect(html).toContain('Real content');
    expect(html).toContain('<h1>');
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
