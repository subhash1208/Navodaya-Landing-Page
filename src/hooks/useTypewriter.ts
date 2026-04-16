import { useEffect, useState } from 'react';

interface UseTypewriterOptions {
  words: readonly string[];
  typeSpeed?: number;
  deleteSpeed?: number;
  pauseDuration?: number;
}

interface UseTypewriterReturn {
  displayText: string;
  isDeleting: boolean;
}

export function useTypewriter({
  words,
  typeSpeed = 100,
  deleteSpeed = 50,
  pauseDuration = 2000,
}: UseTypewriterOptions): UseTypewriterReturn {
  const [displayText, setDisplayText] = useState('');
  const [currentWord, setCurrentWord] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const word = words[currentWord];
    let timeout: ReturnType<typeof setTimeout>;

    if (!isDeleting && displayText === word) {
      timeout = setTimeout(() => setIsDeleting(true), pauseDuration);
    } else if (isDeleting && displayText === '') {
      setIsDeleting(false);
      setCurrentWord((prev) => (prev + 1) % words.length);
    } else {
      const speed = isDeleting ? deleteSpeed : typeSpeed;
      timeout = setTimeout(() => {
        setDisplayText(word.substring(0, displayText.length + (isDeleting ? -1 : 1)));
      }, speed);
    }

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentWord, words, typeSpeed, deleteSpeed, pauseDuration]);

  return { displayText, isDeleting };
}
