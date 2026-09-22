'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import Image from 'next/image';
import { BRAND } from '@/constants';
import { IntroFinishedContext } from '@/hooks/useIntroFinished';

const SESSION_KEY = 'nv_intro_seen';
const LETTERS = 'NAVODAYA'.split('');
const TOTAL_DURATION = 4000;

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

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check reduced motion preference
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (hasSeenIntro()) {
      setShow(false);
      return;
    }

    setShow(true);

    if (prefersReduced) {
      // Reduced motion: show static brand briefly then dismiss
      setStage(5);
      const t = setTimeout(() => {
        markIntroSeen();
        setShow(false);
      }, 800);
      return () => clearTimeout(t);
    }

    // Animation stages
    const timers = [
      setTimeout(() => setStage(1), 100), // Logo
      setTimeout(() => setStage(2), 600), // Letters
      setTimeout(() => setStage(3), 1700), // Tagline
      setTimeout(() => setStage(4), 2200), // Motto
      setTimeout(() => setStage(5), 2700), // Progress bar
      setTimeout(() => {
        setStage(6); // Exit
        markIntroSeen();
      }, 3200),
      setTimeout(() => setShow(false), TOTAL_DURATION),
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  // ONE return, with a fixed shape: slot 0 is the overlay, slot 1 is always `children`.
  //
  // This used to be three separate returns — `[<div>, children]` while undecided,
  // `[<AnimatePresence>, children]` while showing, and `[children]` once done. React
  // reconciles fragment children by POSITION, so the moment `show` flipped to false,
  // `children` moved from index 1 to index 0, hit a type mismatch against the overlay
  // that used to live there, and React destroyed and rebuilt the entire page.
  //
  // On a first visit that happened at TOTAL_DURATION, four seconds in: measured at
  // +3920ms, the <form> and <h1> nodes were both replaced and anything the visitor had
  // already typed into the contact form was silently erased. Keeping `children` pinned to
  // one position is the whole fix.
  return (
    <>
      {show === null ? (
        // Undecided (SSR / pre-hydration) — cover the page so the intro never flashes
        // before we know whether to play it, but still RENDER children underneath so the
        // server HTML is complete for crawlers and no-JS visitors. The overlay is
        // fixed/inset-0/z-9999, so this looks identical to emitting the overlay alone.
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          }}
          aria-hidden="true"
        />
      ) : (
        show &&
        stage < 7 && (
          <motion.div
            key="loading-screen"
            initial={{ opacity: 1 }}
            role="status"
            aria-label="Loading Navodaya"
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
              overflow: 'hidden',
            }}
          >
            {/* Floating particles */}
            <div
              aria-hidden="true"
              style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}
            >
              {[
                { top: '20%', left: '15%', size: 6, delay: 0, dur: 7 },
                { top: '60%', left: '75%', size: 4, delay: 1, dur: 9 },
                { top: '35%', left: '85%', size: 5, delay: 2, dur: 8 },
                { top: '75%', left: '25%', size: 3, delay: 0.5, dur: 10 },
              ].map((p, i) => (
                <div
                  key={i}
                  className="loading-particle"
                  style={{
                    position: 'absolute',
                    top: p.top,
                    left: p.left,
                    width: p.size,
                    height: p.size,
                    borderRadius: '50%',
                    background: i % 2 === 0 ? '#3B82F6' : '#22D3EE',
                    opacity: 0.4,
                    animation: `float ${p.dur}s ease-in-out ${p.delay}s infinite`,
                  }}
                />
              ))}
            </div>

            {/* Radial glow behind logo */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -60%)',
                width: '400px',
                height: '400px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(30,64,175,0.2) 0%, transparent 70%)',
                filter: 'blur(40px)',
              }}
            />

            {/* Content */}
            <div
              style={{
                position: 'relative',
                zIndex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '24px',
              }}
            >
              {/* Stage 1: Logo */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={stage >= 1 ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
              >
                <Image
                  src="/navodaya-logo.png"
                  alt="Navodaya logo"
                  width={96}
                  height={96}
                  priority
                  style={{
                    width: '96px',
                    height: '96px',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 0 30px rgba(30,64,175,0.5))',
                  }}
                />
              </motion.div>

              {/* Stage 2: NAVODAYA letters */}
              <div style={{ display: 'flex', gap: '4px', overflow: 'hidden' }}>
                {LETTERS.map((letter, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
                    animate={stage >= 2 ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
                    transition={{
                      duration: 0.5,
                      delay: i * 0.07,
                      ease: [0.34, 1.56, 0.64, 1],
                    }}
                    className="font-display"
                    style={{
                      fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                      fontWeight: 900,
                      color: '#FFFFFF',
                      textShadow: '0 0 40px rgba(30,64,175,0.5)',
                      display: 'inline-block',
                      willChange: 'transform, opacity, filter',
                    }}
                  >
                    {letter}
                  </motion.span>
                ))}
              </div>

              {/* Gradient sweep overlay on text */}
              {stage >= 2 && (
                <div
                  className="loading-gradient-sweep"
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    top: '120px',
                    left: '-100%',
                    width: '100%',
                    height: '60px',
                    background:
                      'linear-gradient(90deg, transparent, rgba(56,189,248,0.3), transparent)',
                    animation: 'gradientSweep 0.8s ease 1.3s forwards',
                    pointerEvents: 'none',
                  }}
                />
              )}

              {/* Stage 3: Tagline */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={stage >= 3 ? { opacity: 1 } : {}}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                style={{
                  fontSize: '16px',
                  fontWeight: 500,
                  color: '#94A3B8',
                  letterSpacing: '0.05em',
                }}
              >
                Industries &amp; Care Kits
              </motion.p>

              {/* Slot machine — industry keywords */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={stage >= 3 ? { opacity: 1 } : {}}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                style={{
                  height: '20px',
                  overflow: 'hidden',
                  position: 'relative',
                  width: '200px',
                }}
              >
                <div
                  style={{
                    animation: stage >= 3 ? 'slotMachine 8s linear forwards' : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  {[
                    'HOTELS',
                    'HOSPITALS',
                    'SPAS',
                    'SALONS',
                    'INDUSTRIES',
                    'CORPORATE',
                    'WELLNESS',
                  ].map((word) => (
                    <span
                      key={word}
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        letterSpacing: '0.2em',
                        color: '#38BDF8',
                        lineHeight: '20px',
                        height: '20px',
                        display: 'block',
                      }}
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </motion.div>

              {/* Stage 4: Motto */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={stage >= 4 ? { opacity: 1 } : {}}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  fontStyle: 'italic',
                  color: '#38BDF8',
                }}
              >
                &ldquo;{BRAND.TAGLINE}&rdquo;
              </motion.p>

              {/* Stage 5: Progress bar */}
              <div
                style={{
                  width: '200px',
                  height: '2px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '9999px',
                  overflow: 'hidden',
                  marginTop: '16px',
                }}
              >
                <motion.div
                  initial={{ width: '0%' }}
                  animate={stage >= 5 ? { width: '100%' } : {}}
                  transition={{ duration: 0.8, ease: 'easeInOut' }}
                  style={{
                    height: '100%',
                    borderRadius: '9999px',
                    background: 'linear-gradient(90deg, #1E40AF, #0EA5E9)',
                  }}
                />
              </div>
            </div>
          </motion.div>
        )
      )}
      <IntroFinishedContext.Provider value={show === false}>
        {children}
      </IntroFinishedContext.Provider>
    </>
  );
}
