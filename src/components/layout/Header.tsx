'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BRAND, NAV_LINKS, ROUTES } from '@/constants';

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let rafId: number;
    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => setScrolled(window.scrollY > 20));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center transition-all duration-300 pt-4"
      style={{ pointerEvents: 'none' }}
    >
      {/* Centered glassmorphism pill */}
      <div
        className="flex items-center justify-between rounded-2xl transition-all duration-300"
        style={{
          width: scrolled ? '65%' : '70%',
          maxWidth: '900px',
          minWidth: '320px',
          height: scrolled ? '52px' : '60px',
          background: scrolled ? 'rgba(26,10,46,0.95)' : 'rgba(26,10,46,0.80)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(139,92,246,0.15)',
          boxShadow: scrolled ? '0 4px 32px rgba(0,0,0,0.3)' : '0 2px 16px rgba(0,0,0,0.2)',
          padding: '0 20px',
          pointerEvents: 'all',
        }}
      >

        {/* Logo */}
        <Link
          href={ROUTES.HOME}
          className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 rounded-lg"
          style={{ ['--tw-ring-color' as string]: '#1E40AF' }}
          aria-label="Navodaya home"
        >
          <img
            src="/navodaya-logo.png"
            alt="Navodaya logo"
            width={36}
            height={36}
            style={{ width: '36px', height: '36px', objectFit: 'contain', display: 'block' }}
          />
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-base text-white">{BRAND.NAME}</span>
            <span className="text-[10px] tracking-wide hidden sm:block" style={{ color: '#CBD5E1' }}>Industries &amp; Care Kits</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Main navigation" className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ label, href }) => {
            const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2"
                style={{
                  color: isActive ? '#60A5FA' : '#CBD5E1',
                  background: isActive ? 'rgba(96,165,250,0.1)' : 'transparent',
                  textDecoration: 'none',
                }}
              >
                {label}
              </Link>
            );
          })}
          <Link
            href={ROUTES.CONTACT}
            className="ml-3 rounded-full text-sm font-semibold transition-all duration-150 hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{
              background: 'linear-gradient(135deg, #1E40AF, #1D4ED8)',
              boxShadow: '0 2px 12px rgba(30,64,175,0.35)',
              color: '#FFFFFF',
              textDecoration: 'none',
              padding: '10px 22px',
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            Get a Quote
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2"
          style={{ color: '#CBD5E1' }}
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile nav — perspective flip-in links */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            id="mobile-nav"
            aria-label="Mobile navigation"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.76, 0, 0.24, 1] }}
            className="md:hidden absolute top-full left-0 right-0 overflow-hidden"
            style={{
              background: '#FFFFFF',
              borderBottom: '1px solid #E2E8F0',
              boxShadow: '0 4px 16px rgba(15,23,42,0.08)',
            }}
          >
            <ul className="flex flex-col py-2 px-4 gap-1" style={{ perspective: '1000px' }}>
              {NAV_LINKS.map(({ label, href }, i) => (
                <li key={href} style={{ perspective: '120px', perspectiveOrigin: 'bottom' }}>
                  <motion.div
                    initial={{ opacity: 0, rotateX: 90, translateY: 40 }}
                    animate={{ opacity: 1, rotateX: 0, translateY: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: 0.5,
                      delay: 0.1 + i * 0.08,
                      ease: [0.215, 0.61, 0.355, 1],
                    }}
                  >
                    <Link
                      href={href}
                      onClick={closeMobile}
                      className="block px-4 py-3 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2"
                      style={{ color: '#374151' }}
                    >
                      {label}
                    </Link>
                  </motion.div>
                </li>
              ))}
              <li className="pt-1 pb-2">
                <motion.div
                  initial={{ opacity: 0, rotateX: 90, translateY: 40 }}
                  animate={{ opacity: 1, rotateX: 0, translateY: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.1 + NAV_LINKS.length * 0.08,
                    ease: [0.215, 0.61, 0.355, 1],
                  }}
                >
                  <Link
                    href={ROUTES.CONTACT}
                    onClick={closeMobile}
                    className="block w-full text-center px-4 py-3 rounded-full text-white text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2"
                    style={{ background: '#1E40AF' }}
                  >
                    Get a Quote
                  </Link>
                </motion.div>
              </li>
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
