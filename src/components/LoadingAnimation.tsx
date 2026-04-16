import { useEffect, useState, useCallback } from 'react';
import logoImage from '../assets/images/logo.png';
import { BRAND } from '../constants';

const SESSION_KEY = 'nv_intro_seen';
const COMPANY_LETTERS = BRAND.NAME.toUpperCase().split('');

interface LoadingAnimationProps {
  onComplete: () => void;
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({ onComplete }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [showLogo, setShowLogo] = useState(false);
  const [showLetters, setShowLetters] = useState(false);
  const [showTagline, setShowTagline] = useState(false);
  const [showMotto, setShowMotto] = useState(false);

  const exit = useCallback(() => {
    setIsExiting(true);
    sessionStorage.setItem(SESSION_KEY, '1');
    setTimeout(onComplete, 600);
  }, [onComplete]);

  useEffect(() => {
    // Skip intro for returning visitors in the same session
    if (sessionStorage.getItem(SESSION_KEY)) {
      onComplete();
      return;
    }

    const timers = [
      setTimeout(() => setShowLogo(true),    100),
      setTimeout(() => setShowLetters(true), 400),
      setTimeout(() => setShowTagline(true), 1300),
      setTimeout(() => setShowMotto(true),   1700),
      setTimeout(() => exit(),               3000),
    ];

    return () => timers.forEach(clearTimeout);
  }, [exit, onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-mesh overflow-hidden transition-all duration-700 ease-smooth ${
        isExiting ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
      }`}
      role="status"
      aria-label="Loading Navodaya"
    >
      {/* Skip button */}
      <button
        onClick={exit}
        className="absolute top-6 right-6 text-xs text-slate-400 hover:text-slate-600 transition-colors px-3 py-1.5 rounded-pill border border-slate-200 hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
      >
        Skip
      </button>

      <div className="flex flex-col items-center gap-6 select-none">
        {/* Logo */}
        <div
          className={`transition-all duration-700 ease-spring ${
            showLogo ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
          }`}
          style={{ willChange: 'transform, opacity' }}
        >
          <img
            src={logoImage}
            alt="Navodaya logo"
            width={96}
            height={96}
            className="w-24 h-24 object-contain"
            fetchPriority="high"
          />
        </div>

        {/* Company name — letter stagger */}
        <div className="flex gap-1 md:gap-2" aria-label={BRAND.NAME}>
          {COMPANY_LETTERS.map((letter, i) => (
            <span
              key={i}
              aria-hidden="true"
              className="text-5xl md:text-7xl font-black text-brand-primary transition-all duration-700 ease-spring"
              style={{
                opacity: showLetters ? 1 : 0,
                transform: showLetters ? 'translateY(0)' : 'translateY(32px)',
                transitionDelay: `${i * 80}ms`,
                textShadow: '0 4px 24px rgba(30, 64, 175, 0.35)',
                willChange: 'transform, opacity',
              }}
            >
              {letter}
            </span>
          ))}
        </div>

        {/* Tagline */}
        <p
          className={`text-lg md:text-xl font-medium text-slate-600 transition-all duration-700 ease-smooth ${
            showTagline ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '100ms', willChange: 'transform, opacity' }}
        >
          {BRAND.FULL_NAME}
        </p>

        {/* Motto */}
        <p
          className={`text-base md:text-lg font-semibold italic text-brand-secondary text-center px-4 transition-all duration-700 ease-smooth ${
            showMotto ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '100ms', willChange: 'transform, opacity' }}
        >
          "{BRAND.TAGLINE}"
        </p>

        {/* Progress bar */}
        <div className="w-48 h-0.5 bg-slate-100 rounded-pill overflow-hidden mt-2">
          <div
            className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary rounded-pill transition-all duration-[2800ms] ease-smooth"
            style={{ width: showLogo ? '100%' : '0%' }}
            role="progressbar"
            aria-valuenow={showLogo ? 100 : 0}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>

      {/* Reduced motion override */}
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .loading-letter { transition: none !important; opacity: 1 !important; transform: none !important; }
        }
      `}</style>
    </div>
  );
};

export default LoadingAnimation;
