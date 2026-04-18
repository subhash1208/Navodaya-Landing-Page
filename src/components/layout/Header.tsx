'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { BRAND, NAV_LINKS, ROUTES } from '@/constants';

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-[0_1px_12px_rgba(15,23,42,0.08)] h-14'
          : 'bg-white/80 backdrop-blur-sm h-16'
      )}
    >
      <div className="max-w-[80rem] mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">

        {/* Logo */}
        <Link
          href={ROUTES.HOME}
          className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-brand-primary] rounded-lg"
          aria-label="Navodaya home"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[--color-brand-primary] to-[--color-brand-secondary] flex items-center justify-center shrink-0">
            <span className="text-white font-black text-sm select-none">N</span>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-[--color-brand-dark] text-sm sm:text-base">{BRAND.NAME}</span>
            <span className="text-[10px] text-slate-400 hidden sm:block tracking-wide">Industries &amp; Care Kits</span>
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
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-brand-primary]',
                  isActive
                    ? 'text-[--color-brand-primary] bg-[--color-brand-light]'
                    : 'text-slate-600 hover:text-[--color-brand-primary] hover:bg-[--color-surface-subtle]'
                )}
              >
                {label}
              </Link>
            );
          })}
          <Link
            href={ROUTES.CONTACT}
            className="ml-3 px-5 py-2 rounded-full bg-[--color-brand-primary] text-white text-sm font-semibold hover:bg-[--color-brand-primary]/90 hover:-translate-y-px transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-brand-primary] focus-visible:ring-offset-2"
          >
            Get a Quote
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg text-slate-600 hover:text-[--color-brand-primary] hover:bg-[--color-surface-subtle] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-brand-primary]"
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
          className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-100 shadow-[0_4px_16px_rgba(15,23,42,0.08)] animate-[fadeIn_0.15s_ease]"
        >
          <ul className="flex flex-col py-2 px-4 gap-1">
            {NAV_LINKS.map(({ label, href }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={closeMobile}
                  className="block px-4 py-3 rounded-lg text-sm font-medium text-slate-700 hover:text-[--color-brand-primary] hover:bg-[--color-surface-subtle] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-brand-primary]"
                >
                  {label}
                </Link>
              </li>
            ))}
            <li className="pt-1 pb-2">
              <Link
                href={ROUTES.CONTACT}
                onClick={closeMobile}
                className="block w-full text-center px-4 py-3 rounded-full bg-[--color-brand-primary] text-white text-sm font-semibold hover:bg-[--color-brand-primary]/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-brand-primary]"
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
