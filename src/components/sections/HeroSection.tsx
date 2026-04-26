'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronDown } from 'lucide-react';
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

  useEffect(() => {
    setIsMobile(window.matchMedia('(max-width: 640px)').matches);
  }, []);

  const { displayed, isDone, showCursor } = useTypewriter({
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
      className="relative flex flex-col items-center justify-center overflow-hidden"
      style={{
        minHeight: 'calc(100vh - 4rem)',
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 60%, #0F172A 100%)',
      }}
    >
      {/* Radial glow behind graph */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(30,64,175,0.15) 0%, transparent 70%)',
        }}
      />

      {/* Product-category graph canvas */}
      <ProductCategoryGraph isMobile={isMobile} />

      {/* Main content — centered, above canvas */}
      <div className="relative z-10 w-full container mx-auto text-center px-6">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full mb-8 border"
          style={{
            background: 'rgba(30,64,175,0.15)',
            borderColor: 'rgba(30,64,175,0.3)',
            color: '#93C5FD',
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-brand-secondary" />
          Trusted B2B Supplier · Gandhi Nagar, Hyderabad
        </motion.div>

        {/* Headline — typewriter line 1 */}
        <h1
          className="font-black leading-[1.05] tracking-tight mb-2 font-display"
          style={{ fontSize: 'clamp(2.5rem, 5.5vw, 4.5rem)' }}
          aria-label={`${HEADLINE_LINE1} ${HEADLINE_LINE2}`}
        >
          {/* Line 1 — typewriter */}
          <span className="block text-white">
            {displayed}
            {showCursor && (
              <span
                className="inline-block w-[3px] h-[0.85em] bg-brand-secondary ml-1 align-middle animate-pulse"
                aria-hidden="true"
              />
            )}
          </span>

          {/* Line 2 — gradient sweep reveal */}
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
              className="text-lg leading-relaxed max-w-2xl mx-auto mb-10 mt-6"
              style={{ color: '#94A3B8' }}
            >
              {BRAND.MISSION}
            </motion.p>
          )}
        </AnimatePresence>

        {/* CTAs — spring physics */}
        <AnimatePresence>
          {contentVisible && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14"
            >
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0 }}
              >
                <Link
                  href={ROUTES.PRODUCTS}
                  className="group inline-flex items-center gap-2.5 rounded-full font-semibold text-base text-white transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 px-8 py-4 min-h-[52px]"
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
                  className="inline-flex items-center gap-2 rounded-full font-semibold text-base transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 px-8 py-4 min-h-[52px]"
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
              className="inline-flex items-center rounded-2xl px-10 py-5"
              style={{
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {[
                { value: '51+', label: 'Products' },
                { value: '3', label: 'Categories' },
                { value: 'B2B', label: 'Focused' },
              ].map(({ value, label }, i) => (
                <div key={label} className="flex items-center">
                  <div className="text-center px-8">
                    <div className="text-[22px] font-black text-white">{value}</div>
                    <div className="text-[11px] font-medium mt-0.5" style={{ color: '#64748B' }}>{label}</div>
                  </div>
                  {i < 2 && <div className="w-px h-8 shrink-0" style={{ background: 'rgba(255,255,255,0.1)' }} />}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Scroll indicator */}
      <a
        href="#about"
        aria-label="Scroll to About section"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 transition-colors focus-visible:outline-none focus-visible:ring-2 rounded"
        style={{ color: '#475569' }}
      >
        <span className="text-xs font-medium tracking-widest uppercase">Scroll</span>
        <ChevronDown className="w-4 h-4 animate-bounce" aria-hidden="true" />
      </a>
    </section>
  );
}
