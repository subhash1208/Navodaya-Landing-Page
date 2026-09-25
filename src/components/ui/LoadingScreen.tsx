'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import Image from 'next/image';
import { cn } from '@/utils/cn';
import { IntroFinishedContext } from '@/hooks/useIntroFinished';

const SESSION_KEY = 'nv_intro_seen';
const LETTERS = 'NAVODAYA'.split('');

/** When the overlay unmounts on a first visit. One gesture, not a six-effect montage. */
const TOTAL_DURATION = 1400;
/** Reduced motion: a static brand frame, held just long enough to register, then gone. */
const REDUCED_DURATION = 600;

/** Material Design 3 standard easing. No overshoot — this is a seal, not a bounce. */
const EASE: [number, number, number, number] = [0.2, 0, 0, 1];

const SEAL_DRAW = 0.45; // stage 1 → seal line scales out from the centre
const LETTER_RISE = 0.27; // stage 2 → per letter; + 7 × 40ms stagger = 550ms total
const LETTER_STAGGER = 0.04;
const PANEL_SPLIT = 0.4; // stage 3 → panels part along the seam
/** Never a literal 0 — a zero-length transition can skip its completion event. */
const INSTANT = 0.01;

// sessionStorage throws instead of returning null in some locked-down contexts (Safari
// private mode historically, storage-blocking extensions, `Partitioned` cookie policies).
// An exception here would abort the effect with `show` still `null`, leaving the opaque
// overlay on screen permanently — a blank site. Both accesses fail soft instead.
function hasSeenIntro(): boolean {
  try {
    return Boolean(sessionStorage.getItem(SESSION_KEY));
  } catch {
    return false;
  }
}

function markIntroSeen(): void {
  try {
    sessionStorage.setItem(SESSION_KEY, '1');
  } catch {
    // Non-fatal — the visitor simply sees the intro again next time.
  }
}

interface LoadingScreenProps {
  children: React.ReactNode;
}

export function LoadingScreen({ children }: LoadingScreenProps) {
  const [show, setShow] = useState<boolean | null>(null);
  const [stage, setStage] = useState(0);
  const [reduced, setReduced] = useState(false);

  // WCAG SC 2.2.2 (Pause, Stop, Hide): auto-starting content needs a mechanism to stop it.
  // Wired to both Escape and a full-viewport button, so pointer and keyboard both work.
  const skipIntro = useCallback(() => {
    markIntroSeen();
    setShow(false);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (hasSeenIntro()) {
      setShow(false);
      return;
    }

    setShow(true);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') skipIntro();
    };
    window.addEventListener('keydown', onKeyDown);

    if (prefersReduced) {
      // Static brand frame: seal already drawn, wordmark already up, no split.
      setReduced(true);
      setStage(2);
      const timer = setTimeout(() => {
        markIntroSeen();
        setShow(false);
      }, REDUCED_DURATION);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('keydown', onKeyDown);
      };
    }

    const timers = [
      // One frame's grace: the overlay's first render has to seed at the stage-0 target
      // (seal at scaleX 0) before the flip to stage 1 can animate away from it.
      setTimeout(() => setStage(1), 20), //    20 →  470  seal line draws
      setTimeout(() => setStage(2), 350), //  350 →  900  wordmark rises from under the seam
      setTimeout(() => {
        setStage(3); //                       900 → 1300  panels split, page revealed beneath
        markIntroSeen();
      }, 900),
      setTimeout(() => setShow(false), TOTAL_DURATION),
    ];

    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [skipIntro]);

  // ONE return, with a fixed shape: slot 0 is the overlay, slot 1 is always `children`.
  //
  // This used to be three separate returns — `[<div>, children]` while undecided,
  // `[<AnimatePresence>, children]` while showing, and `[children]` once done. React
  // reconciles fragment children by POSITION, so the moment `show` flipped to false,
  // `children` moved from index 1 to index 0, hit a type mismatch against the overlay
  // that used to live there, and React destroyed and rebuilt the entire page.
  //
  // On a first visit that happened at TOTAL_DURATION — measured at +3920ms back when the
  // intro ran for four seconds, and it would now fire at ~1400ms instead, no less fatal:
  // the <form> and <h1> nodes were both replaced and anything the visitor had already
  // typed into the contact form was silently erased. Keeping `children` pinned to one
  // position is the whole fix.
  return (
    <>
      {show === null ? (
        // Undecided (SSR / pre-hydration) — cover the page so the intro never flashes
        // before we know whether to play it, but still RENDER children underneath so the
        // server HTML is complete for crawlers and no-JS visitors. No `motion` element is
        // reachable on this branch, so nothing can serialise a content-hiding `initial`.
        <div aria-hidden="true" className="fixed inset-0 z-[9999] bg-ink" />
      ) : show ? (
        <div
          role="status"
          aria-label="Loading Navodaya"
          className={cn(
            'fixed inset-0 z-[9999] overflow-hidden',
            // Once the panels are parting, the page beneath is already visible — stop the
            // overlay swallowing clicks meant for it.
            stage >= 3 && 'pointer-events-none',
          )}
        >
          {/* Top panel — carries the logo, the wordmark and the seal line itself, so all
              three leave together as one gesture when it lifts. */}
          <motion.div
            aria-hidden="true"
            initial={false}
            animate={{ y: stage >= 3 ? '-100%' : '0%' }}
            transition={{ duration: reduced ? INSTANT : PANEL_SPLIT, ease: EASE }}
            className="absolute inset-x-0 top-0 flex h-1/2 flex-col items-center justify-end overflow-hidden bg-ink"
          >
            <Image
              src="/navodaya-logo.png"
              alt="Navodaya logo"
              width={96}
              height={96}
              priority
              className="mb-6 h-24 w-24 object-contain"
            />

            {/* The mask. Its bottom edge IS the seam, so letters sitting at translateY(100%)
                are clipped underneath the seal line and appear to emerge from beneath it. */}
            <div className="overflow-hidden">
              <div className="flex gap-1">
                {LETTERS.map((letter, i) => (
                  <motion.span
                    key={i}
                    initial={false}
                    animate={{ y: stage >= 2 ? '0%' : '100%' }}
                    transition={{
                      duration: reduced ? INSTANT : LETTER_RISE,
                      delay: reduced ? 0 : i * LETTER_STAGGER,
                      ease: EASE,
                    }}
                    className="font-display block text-display-2 font-black text-paper"
                  >
                    {letter}
                  </motion.span>
                ))}
              </div>
            </div>

            {/* The seal line. Draws from the centre outward. */}
            <motion.div
              initial={false}
              animate={{ scaleX: stage >= 1 ? 1 : 0 }}
              transition={{ duration: reduced ? INSTANT : SEAL_DRAW, ease: EASE }}
              className="absolute inset-x-0 bottom-0 h-px origin-center bg-brand-cyan"
            />
          </motion.div>

          {/* Bottom panel — nothing but ground, parting downward. */}
          <motion.div
            aria-hidden="true"
            initial={false}
            animate={{ y: stage >= 3 ? '100%' : '0%' }}
            transition={{ duration: reduced ? INSTANT : PANEL_SPLIT, ease: EASE }}
            className="absolute inset-x-0 bottom-0 h-1/2 bg-ink"
          />

          {/* Skip affordance. A real full-viewport button rather than a click handler on a
              div: it gives pointer-anywhere skip, native Enter/Space, a focus ring and a
              screen-reader-reachable label from one element. */}
          <button
            type="button"
            onClick={skipIntro}
            className="absolute inset-0 z-10 h-full w-full cursor-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-cyan"
          >
            <span className="sr-only">Skip intro animation</span>
          </button>
        </div>
      ) : null}
      <IntroFinishedContext.Provider value={show === false}>
        {children}
      </IntroFinishedContext.Provider>
    </>
  );
}
