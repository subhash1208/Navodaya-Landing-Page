'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { BRAND, ROUTES } from '@/constants';
import { useTypewriter } from '@/hooks/useTypewriter';
import { ProductCategoryGraph, type ProductPosition } from '@/components/ui/ProductCategoryGraph';
import { AuroraBackground } from '@/components/ui/AuroraBackground';

const HEADLINE_LINE1 = 'Premium Hygiene & Care';
const HEADLINE_LINE2 = 'Solutions for Every Industry';

export default function HeroSection() {
  const [line2Visible, setLine2Visible] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);
  const [productPositions, setProductPositions] = useState<ProductPosition[]>([]);
  const [logoScale, setLogoScale] = useState(1);
  const collapseRef = useRef<(() => void) | null>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMobile(window.matchMedia('(max-width: 768px)').matches);
  }, []);

  const handleExpandChange = useCallback((idx: number | null, positions: ProductPosition[]) => {
    setExpandedCategory(idx);
    setProductPositions(idx === null ? [] : positions);
  }, []);

  const handleLogoScale = useCallback((scale: number) => {
    setLogoScale(scale);
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

      {/* Aurora background effect */}
      <AuroraBackground className="absolute inset-0" />

      {/* 2-column layout: text left (anchored to left), graph+placeholder right (larger) */}
      <div
        className="relative z-10 w-full flex flex-col md:flex-row items-center"
        style={{ minHeight: 'calc(100vh - 4rem)', padding: '3rem 2rem 3rem 4rem' }}
      >

        {/* LEFT — Text content */}
        <div className="flex flex-col justify-center text-center md:text-left md:pr-6" style={{ width: '42%', minWidth: '320px', flexShrink: 0 }}>

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
                  className="block animate-gradient-shift"
                  initial={{ opacity: 0, clipPath: 'inset(0 100% 0 0)' }}
                  animate={{ opacity: 1, clipPath: 'inset(0 0% 0 0)' }}
                  transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                  style={{
                    background: 'linear-gradient(-45deg, #60A5FA, #818CF8, #38BDF8, #60A5FA)',
                    backgroundSize: '400% 400%',
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
          className="relative hidden md:flex items-center justify-center"
          style={{ flex: 1, minHeight: '520px' }}
          onClick={() => collapseRef.current?.()}
        >
          {/* Canvas graph */}
          <div className="absolute inset-0 flex items-center justify-center">
            <ProductCategoryGraph
              width={520}
              height={520}
              isMobile={isMobile}
              onExpandChange={handleExpandChange}
              onLogoScale={handleLogoScale}
              collapseRef={collapseRef}
            />
          </div>

          {/* HTML product link overlay — labels use CSS animation to appear with nodes */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            aria-label={expandedCategory !== null ? 'Product links' : undefined}
          >
            <div style={{ width: '520px', height: '520px', position: 'relative' }}>
              {productPositions.map((pos) => {
                const LABEL_OFFSET = 22;
                const labelX = pos.x + Math.cos(pos.angle) * LABEL_OFFSET;
                const labelY = pos.y + Math.sin(pos.angle) * LABEL_OFFSET;
                const onRight = Math.cos(pos.angle) >= 0;
                const borderColor = ['rgba(96,165,250,0.35)', 'rgba(34,211,238,0.35)', 'rgba(192,132,252,0.35)'][pos.pIdx];
                // CSS animation: fade in after 0.5s (spiral takes ~0.67s, labels appear as nodes arrive)
                const animName = onRight ? 'labelFadeInRight' : 'labelFadeInLeft';
                return (
                  <Link
                    key={pos.slug}
                    href={`/products/${pos.slug}`}
                    className="absolute pointer-events-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 rounded-sm"
                    style={{
                      left: labelX,
                      top: labelY,
                      transform: onRight ? 'translateY(-50%)' : 'translate(-100%, -50%)',
                      fontSize: '8.5px',
                      fontWeight: 600,
                      color: '#CBD5E1',
                      whiteSpace: 'nowrap',
                      textDecoration: 'none',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: 'rgba(15,23,42,0.82)',
                      backdropFilter: 'blur(4px)',
                      border: `1px solid ${borderColor}`,
                      opacity: 0,
                      animation: `${animName} 0.25s ease-out 0.5s forwards`,
                      lineHeight: '1.4',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(30,64,175,0.65)';
                      (e.currentTarget as HTMLAnchorElement).style.color = '#ffffff';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(15,23,42,0.82)';
                      (e.currentTarget as HTMLAnchorElement).style.color = '#CBD5E1';
                    }}
                  >
                    {pos.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* 3D Logo Placeholder — pointer-events-none so clicks pass through to canvas */}
          <div className="relative z-10 flex items-center justify-center pointer-events-none">
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
              className="absolute rounded-full"
              style={{ width: '130px', height: '130px' }}
            >
              <svg
                width="130" height="130"
                viewBox="0 0 130 130"
                className="absolute inset-0"
                aria-hidden="true"
              >
                <defs>
                  <path
                    id="orbitPath"
                    d="M 13,65 a 52,52 0 1,1 104,0 a 52,52 0 1,1 -104,0"
                  />
                </defs>
                <text
                  fontSize="7"
                  fontFamily="Inter, sans-serif"
                  fontWeight="500"
                  letterSpacing="2"
                  fill="rgba(56,189,248,0.7)"
                >
                  <textPath href="#orbitPath" startOffset="0%">
                    YOUR TRUSTED PARTNER IN PROGRESS AND CARE · 
                  </textPath>
                </text>
              </svg>
            </motion.div>

            <motion.div
              animate={{ scale: logoScale }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="relative"
              style={{ width: '80px', height: '80px' }}
            >
              <motion.div
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="relative w-full h-full"
              >
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: 'radial-gradient(circle, rgba(30,64,175,0.35) 0%, transparent 70%)',
                    filter: 'blur(14px)',
                    transform: 'scale(1.8)',
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Image
                    src="/navodaya-logo.png"
                    alt="Navodaya logo"
                    width={72}
                    height={72}
                    style={{
                      width: '72px',
                      height: '72px',
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 0 12px rgba(30,64,175,0.6))',
                    }}
                  />
                </div>
              </motion.div>
            </motion.div>
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
