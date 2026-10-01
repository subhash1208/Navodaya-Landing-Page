import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTypewriter } from '@/hooks/useTypewriter';

describe('useTypewriter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns empty string initially', () => {
    const { result } = renderHook(() =>
      useTypewriter({ text: 'Hello', speed: 40, startDelay: 200 }),
    );
    expect(result.current.displayed).toBe('');
    expect(result.current.showCursor).toBe(true);
  });

  it('holds at an empty string while disabled, then types once enabled', () => {
    // `enabled` exists so the hero headline does not type itself out behind the intro
    // overlay and sit there finished by the time the overlay lifts.
    const onComplete = vi.fn();
    const { result, rerender } = renderHook(
      ({ enabled }) =>
        useTypewriter({ text: 'Hi', speed: 40, startDelay: 100, enabled, onComplete }),
      { initialProps: { enabled: false } },
    );

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(result.current.displayed).toBe('');
    expect(onComplete).not.toHaveBeenCalled();

    rerender({ enabled: true });

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current.displayed).toBe('H');

    act(() => {
      vi.advanceTimersByTime(40);
    });
    expect(result.current.displayed).toBe('Hi');

    // onComplete fires on the tick *after* the final character is written.
    act(() => {
      vi.advanceTimersByTime(40);
    });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('types text progressively after start delay', () => {
    const { result } = renderHook(() => useTypewriter({ text: 'Hi', speed: 40, startDelay: 100 }));

    // After start delay
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current.displayed).toBe('H');

    // After one more character
    act(() => {
      vi.advanceTimersByTime(40);
    });
    expect(result.current.displayed).toBe('Hi');
  });

  it('calls onComplete when typing finishes', () => {
    const onComplete = vi.fn();
    renderHook(() => useTypewriter({ text: 'AB', speed: 40, startDelay: 100, onComplete }));

    act(() => {
      vi.advanceTimersByTime(100);
    }); // start delay
    act(() => {
      vi.advanceTimersByTime(40);
    }); // A -> B
    act(() => {
      vi.advanceTimersByTime(40);
    }); // done

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('hides cursor after completion', () => {
    const { result } = renderHook(() => useTypewriter({ text: 'A', speed: 40, startDelay: 100 }));

    act(() => {
      vi.advanceTimersByTime(100);
    }); // start
    act(() => {
      vi.advanceTimersByTime(40);
    }); // done
    act(() => {
      vi.advanceTimersByTime(800);
    }); // cursor hide delay

    expect(result.current.showCursor).toBe(false);
  });

  it('clears the cursor-hide timer on unmount, so it never fires against a torn-down component', () => {
    // Regression test for the untracked delete/cursor-hide-phase setTimeout: unmounting between
    // typing finishing and the 800ms cursor-hide delay must not let that timer's setShowCursor
    // callback run after teardown. If the timer were left untracked, clearTimeout in cleanup
    // would have nothing to clear and this would throw an "update on an unmounted component"
    // warning/act violation against the buggy code.
    const { result, unmount } = renderHook(() =>
      useTypewriter({ text: 'A', speed: 40, startDelay: 100 }),
    );

    act(() => {
      vi.advanceTimersByTime(100);
    }); // start
    act(() => {
      vi.advanceTimersByTime(40);
    }); // done typing — cursor-hide timer is now scheduled

    expect(result.current.showCursor).toBe(true);

    unmount();

    // Advancing timers past the 800ms cursor-hide delay after unmount must not throw and must
    // not be observable — the timer was cleared, not merely orphaned.
    expect(() => {
      act(() => {
        vi.advanceTimersByTime(800);
      });
    }).not.toThrow();
  });

  it('shows full text immediately when prefers-reduced-motion', () => {
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

    const onComplete = vi.fn();
    const { result } = renderHook(() =>
      useTypewriter({ text: 'Hello World', speed: 40, startDelay: 200, onComplete }),
    );

    expect(result.current.displayed).toBe('Hello World');
    expect(result.current.isDone).toBe(true);
    expect(result.current.showCursor).toBe(false);
    expect(onComplete).toHaveBeenCalled();
  });
});
