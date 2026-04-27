'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronDown, Box } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BRAND, ROUTES } from '@/constants';
import { useTypewriter } from '@/hooks/useTypewriter';
import { ProductCategoryGraph } from '@/components/ui/ProductCategoryGraph';

const HEADLINE_LINE1 = 'Premium Hygiene & Care';
const HEADLINE_LINE2 = 'Solutions for Every Industry';

export default function HeroSection() {
  const [line2Visible, setLine2Visible] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const rightPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMobile(window.matchMedia('(max-width: 768px)').matches);
  }, []);

  const { displayed, showCursor } = useTypewriter({
    text: HEADLINE_LINE1,
    speed: 38,
    startDelay: 300,
    onComplete: () => {
      setTimeout(() => setLine2Visible(true), 150);
      setTimeout(() => setContentVisible(true), 600);
    },
  });

  return (
    <section
      id="home"
      aria-label="Hero"
      className="relative overflow-hidden"
      style={{
        minHeight: 'calc(100vh - 4rem)',
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 60%, #0F172A 100%)',
      }}
    >
      {/* Subtle radial glow */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 70% 50%, rgba(30,64,175,0.12) 0%, transparent 70%)',
        }}
      />

      {/* 2-column layout: text left, graph+placeholder right */}
      <div className="relative z-10 container mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-0"
        style={{ minHeight: 'calc(100vh - 4rem)', padding: '3rem 1.5rem' }}>

        {/* LEFT — Text content */}
        <div className="flex-1 flex flex-col justify-center md:pr-8 text-center md:text-left">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full mb-8 border self-center md:self-start"
            style={{
              background: 'rgba(30,64,175,0.15)',
              borderColor: 'rgba(30,64,175,0.3)',
              color: '#93C5FD',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-brand-secondary" />
            Trusted B2B Supplier · Gandhi Nagar, Hyderabad
          </motion.div>

          {/* Headline */}
          <h1
            className="font-black leading-[1.05] tracking-tight mb-2 font-display"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.75rem)' }}
            aria-label={`${HEADLINE_LINE1} ${HEADLINE_LINE2}`}
          >
            <span className="block text-white">
              {displayed}
              {showCursor && (
                <span
                  className="inline-block w-[3px] h-[0.85em] bg-brand-secondary ml-1 align-middle animate-pulse"
                  aria-hidden="true"
                />
              )}
            </span>

            <AnimatePresence>
              {line2Visible && (
                <motion.span
                  className="block"
                  initial={{ opacity: 0, clipPath: 'inset(0 100% 0 0)' }}
                  animate={{ opacity: 1, clipPath: 'inset(0 0% 0 0)' }}
                  transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                  style={{
                    background: 'linear-gradient(135deg, #60A5FA 0%, #38BDF8 50%, #818CF8 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {HEADLINE_LINE2}
                </motion.span>
              )}
            </AnimatePresence>
          </h1>

          {/* Subheadline */}
          <AnimatePresence>
            {contentVisible && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-base leading-relaxed mb-8 mt-5 max-w-lg"
                style={{ color: '#94A3B8' }}
              >
                {BRAND.MISSION}
              </motion.p>
            )}
          </AnimatePresence>

          {/* CTAs */}
          <AnimatePresence>
            {contentVisible && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col sm:flex-row items-center md:items-start justify-center md:justify-start gap-4 mb-10"
              >
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <Link
                    href={ROUTES.PRODUCTS}
                    className="group inline-flex items-center gap-2.5 rounded-full font-semibold text-base text-white transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 px-7 py-3.5 min-h-[48px]"
                    style={{
                      background: 'linear-gradient(135deg, #1E40AF, #1D4ED8)',
                      boxShadow: '0 4px 24px rgba(30,64,175,0.5)',
                    }}
                  >
                    Explore Products
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" aria-hidden="true" />
                  </Link>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.08 }}
                >
                  <Link
                    href={ROUTES.CONTACT}
                    className="inline-flex items-center gap-2 rounded-full font-semibold text-base transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 px-7 py-3.5 min-h-[48px]"
                    style={{
                      border: '2px solid rgba(255,255,255,0.2)',
                      color: '#E2E8F0',
                      background: 'rgba(255,255,255,0.05)',
                      backdropFilter: 'blur(8px)',
                    }}
                  >
                    Get a Quote
                  </Link>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Trust stats */}
          <AnimatePresence>
            {contentVisible && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="inline-flex items-center rounded-2xl self-center md:self-start"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  padding: '16px 32px',
                }}
              >
                {[
                  { value: '51+', label: 'Products' },
                  { value: '3', label: 'Categories' },
                  { value: 'B2B', label: 'Focused' },
                ].map(({ value, label }, i) => (
                  <div key={label} className="flex items-center">
                    <div className="text-center px-6">
                      <div className="text-xl font-black text-white">{value}</div>
                      <div className="text-[11px] font-medium mt-0.5" style={{ color: '#64748B' }}>{label}</div>
                    </div>
                    {i < 2 && <div className="w-px h-7 shrink-0" style={{ background: 'rgba(255,255,255,0.1)' }} />}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT — Graph + 3D Placeholder */}
        <div
          ref={rightPanelRef}
          className="flex-1 relative hidden md:flex items-center justify-center"
          style={{ minHeight: '480px' }}
        >
          {/* Canvas graph — centered, sized to fill right panel */}
          <div className="absolute inset-0 flex items-center justify-center">
            <ProductCategoryGraph width={480} height={480} isMobile={false} />
          </div>

          {/* 3D Logo Placeholder — centered in right panel */}
          <div className="relative z-10 flex flex-col items-center justify-center">
            <motion.div
              animate={{
                rotateY: [0, 360],
                scale: [1, 1.05, 1],
              }}
              transition={{
                rotateY: { duration: 8, repeat: Infinity, ease: 'linear' },
                scale: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
              }}
              className="relative"
              style={{ width: '160px', height: '160px' }}
            >
              {/* Outer glow ring */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(30,64,175,0.3) 0%, transparent 70%)',
                  filter: 'blur(20px)',
                  transform: 'scale(1.5)',
                }}
              />
              {/* Orbit ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-full"
                style={{
                  border: '1px solid rgba(96,165,250,0.3)',
                  borderTopColor: 'rgba(96,165,250,0.8)',
                }}
              />
              {/* Inner hexagon shape */}
              <div
                className="absolute inset-4 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(30,64,175,0.4), rgba(14,165,233,0.2))',
                  border: '1px solid rgba(96,165,250,0.3)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <Box className="w-12 h-12" style={{ color: '#60A5FA' }} aria-hidden="true" />
              </div>
            </motion.div>

            {/* Tagline orbiting text */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.8 }}
              className="mt-6 text-xs font-medium tracking-widest uppercase text-center"
              style={{ color: '#38BDF8', maxWidth: '200px' }}
            >
              3D Logo Coming Soon
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8, duration: 0.8 }}
              className="mt-2 text-[11px] text-center"
              style={{ color: '#475569', maxWidth: '180px' }}
            >
              &ldquo;{BRAND.TAGLINE}&rdquo;
            </motion.p>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <a
        href="#about"
        aria-label="Scroll to About section"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 transition-colors focus-visible:outline-none focus-visible:ring-2 rounded"
        style={{ color: '#475569' }}
      >
        <span className="text-xs font-medium tracking-widest uppercase">Scroll</span>
        <ChevronDown className="w-4 h-4 animate-bounce" aria-hidden="true" />
      </a>
    </section>
  );
}
