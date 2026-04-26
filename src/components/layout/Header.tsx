'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
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
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        height: scrolled ? '56px' : '64px',
        background: scrolled ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(12px)',
        boxShadow: scrolled ? '0 1px 12px rgba(15,23,42,0.08)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(226,232,240,0.8)' : 'none',
      }}
    >
      <div className="container mx-auto px-8 flex items-center justify-between h-full w-full">

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
            <span className="font-bold text-base" style={{ color: '#0F172A' }}>{BRAND.NAME}</span>
            <span className="text-[10px] tracking-wide hidden sm:block" style={{ color: '#94A3B8' }}>Industries &amp; Care Kits</span>
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
                  color: isActive ? '#1E40AF' : '#475569',
                  background: isActive ? '#EFF6FF' : 'transparent',
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
          style={{ color: '#475569' }}
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav
          id="mobile-nav"
          aria-label="Mobile navigation"
          className="md:hidden absolute top-full left-0 right-0 animate-[fadeIn_0.15s_ease]"
          style={{
            background: '#FFFFFF',
            borderBottom: '1px solid #E2E8F0',
            boxShadow: '0 4px 16px rgba(15,23,42,0.08)',
          }}
        >
          <ul className="flex flex-col py-2 px-4 gap-1">
            {NAV_LINKS.map(({ label, href }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={closeMobile}
                  className="block px-4 py-3 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2"
                  style={{ color: '#374151' }}
                >
                  {label}
                </Link>
              </li>
            ))}
            <li className="pt-1 pb-2">
              <Link
                href={ROUTES.CONTACT}
                onClick={closeMobile}
                className="block w-full text-center px-4 py-3 rounded-full text-white text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2"
                style={{ background: '#1E40AF' }}
              >
                Get a Quote
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
