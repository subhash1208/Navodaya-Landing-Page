'use client';

import { useState, useEffect, useRef } from 'react';

interface UseTypewriterOptions {
  text: string;
  speed?: number; // ms per character
  startDelay?: number; // ms before typing starts
  onComplete?: () => void;
}

export function useTypewriter({
  text,
  speed = 40,
  startDelay = 200,
  onComplete,
}: UseTypewriterOptions) {
  const [displayed, setDisplayed] = useState('');
  const [isDone, setIsDone] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const onCompleteRef = useRef(onComplete);

  // Keep ref in sync with latest callback (avoids stale closure)
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    // Respect prefers-reduced-motion — show full text immediately
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayed(text);
      setIsDone(true);
      setShowCursor(false);
      onCompleteRef.current?.();
      return;
    }

    let i = 0;
    let startTimer: ReturnType<typeof setTimeout>;
    let typeTimer: ReturnType<typeof setTimeout>;

    startTimer = setTimeout(() => {
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
  }, [text, speed, startDelay]);

  return { displayed, isDone, showCursor };
}
