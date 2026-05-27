'use client';

import { useState, useEffect } from 'react';

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

  useEffect(() => {
    // Respect prefers-reduced-motion — show full text immediately
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayed(text);
      setIsDone(true);
      setShowCursor(false);
      onComplete?.();
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
          onComplete?.();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return { displayed, isDone, showCursor };
}
