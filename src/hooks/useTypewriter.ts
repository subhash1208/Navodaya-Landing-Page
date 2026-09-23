'use client';

import { useState, useEffect, useRef } from 'react';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';

interface UseTypewriterOptions {
  text: string;
  speed?: number; // ms per character
  startDelay?: number; // ms before typing starts
  /**
   * Hold at an empty string instead of typing. Flipping this to `true` starts the
   * animation. Exists so a headline does not type itself out behind a full-screen
   * overlay, finish, and be sitting there static by the time the overlay lifts.
   */
  enabled?: boolean;
  onComplete?: () => void;
}

export function useTypewriter({
  text,
  speed = 40,
  startDelay = 200,
  enabled = true,
  onComplete,
}: UseTypewriterOptions) {
  // Seeded with the FULL text, not ''. The server renders real, crawlable copy, and the
  // client's first pre-effect render matches it exactly, so hydration stays clean. The
  // layout effect below clears it before paint and types it back out.
  //
  // This used to be useState(''), which meant the server sent an <h1> containing nothing
  // but the blinking cursor span — a text-empty primary heading on the landing page.
  const [displayed, setDisplayed] = useState(text);
  const [isDone, setIsDone] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const onCompleteRef = useRef(onComplete);

  // Keep ref in sync with latest callback (avoids stale closure)
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useIsomorphicLayoutEffect(() => {
    // Respect prefers-reduced-motion — show full text immediately
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayed(text);
      setIsDone(true);
      setShowCursor(false);
      onCompleteRef.current?.();
      return;
    }

    // Wind back to empty before the first paint so the animation starts from nothing.
    setDisplayed('');

    // Held: stay empty until the caller enables us. Re-running on `enabled` is what
    // starts the typing later.
    if (!enabled) return;

    let i = 0;
    let typeTimer: ReturnType<typeof setTimeout>;

    const startTimer = setTimeout(() => {
      const type = () => {
        if (i < text.length) {
          setDisplayed(text.slice(0, i + 1));
          i++;
          typeTimer = setTimeout(type, speed);
        } else {
          setIsDone(true);
          onCompleteRef.current?.();
          // Blink cursor twice then hide
          setTimeout(() => setShowCursor(false), 800);
        }
      };
      type();
    }, startDelay);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(typeTimer);
    };
  }, [text, speed, startDelay, enabled]);

  return { displayed, isDone, showCursor };
}
