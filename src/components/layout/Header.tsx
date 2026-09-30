'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BRAND, NAV_LINKS, ROUTES } from '@/constants';
import { cn } from '@/utils/cn';
import { useFocusTrap } from '@/hooks/useFocusTrap';

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  // Checked once on mount, matching the repo-wide pattern (AnimateIn, CustomCursor,
  // PageTransition, CounterStat): a plain `matchMedia` read in an effect, no live
  // subscription. The mobile nav is closed on both the server and the initial client
  // render, so there is no SSR-visible content this gates — only the entrance/exit
  // animation the menu plays once a visitor can actually open it, well after this
  // effect has run.
  const [reducedMotion, setReducedMotion] = useState(false);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  const scrollLockedRef = useRef(false);

  useEffect(() => {
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  useEffect(() => {
    let rafId: number;
    const onScroll = () => {
      // While the scroll lock below is engaged the page is parked at 0 by `position: fixed`,
      // and the browser fires a scroll event for that clamp. Reading it as "the visitor is at
      // the top" would expand the header from h-16 to h-20 under the open menu and shrink it
      // again on close — a visible wobble caused by the lock rather than by the visitor.
      if (scrollLockedRef.current) return;
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const isScrolled = window.scrollY > 20;
        setScrolled((prev) => (prev === isScrolled ? prev : isScrolled));
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  // Tapping a menu link closes the menu AND starts a route transition in the same click. The
  // scroll-lock cleanup below re-applies the offset captured on open — correct for Escape and
  // for the toggle button, wrong here: when the destination is prefetched or static, the restore
  // commits after the router's own scroll reset and wins, dropping the visitor onto the new route
  // at the previous page's offset (from `/products` at y=900, `/` opened at 900 with the hero,
  // headline and primary CTA all above the fold). This ref tells the cleanup the close is a
  // navigation, so the page is left wherever the router puts it — which is also what the
  // same-page anchors (`/#about`, `/#contact`) need, their scroll being the router's to perform.
  //
  // It cannot stick `true`: the cleanup clears it after reading, and the effect clears it again
  // on every open, before the next close can consume a stale value. That second clear is what
  // covers the one path where setting it runs no cleanup at all — a tap on a link that is still
  // mounted for its exit animation, when `mobileOpen` is already `false` and the state write is
  // a no-op.
  const navigatingRef = useRef(false);
  const closeViaLink = useCallback(() => {
    navigatingRef.current = true;
    setMobileOpen(false);
  }, []);

  useFocusTrap('mobile-nav', mobileOpen, closeMobile, toggleButtonRef);

  // Lock page scroll while the mobile nav is open. Keyed on `mobileOpen` alone so the
  // cleanup runs on every close path (link click, Escape) AND on unmount — there is no
  // way to strand the lock on the body.
  //
  // `body { overflow: hidden }` alone is inert here. Per CSS Overflow 3 §3.1.4 the viewport
  // takes its overflow from <body> only while the root's own overflow is `visible` in both
  // axes, and globals.css:25 sets `html { overflow-x: hidden }` to suppress a horizontal
  // scrollbar — so body's value is never propagated and the page scrolled freely behind the
  // open menu. Moving the lock onto <html> would propagate, but `hidden` leaves the box a
  // scroll container: per MDN "the hidden overflow content can be scrolled into view … Content
  // can also be scrolled to programmatically", and tabbing to an off-screen focusable scrolls
  // it too. iOS Safari ignores it on <body> outright.
  //
  // Taking the body out of flow removes the document's scrollable overflow altogether, which
  // is the only form that holds on iOS. `overflow: hidden` stays on the body as well so the
  // locked state is still legible from a computed style. The offset is captured before the
  // body is pinned and re-applied on release — except when the close is a navigation, see
  // `navigatingRef` above — so closing the menu does not jump to the top;
  // `behavior: 'instant'` overrides the `scroll-behavior: smooth` at globals.css:23, which
  // would otherwise glide the page back over several hundred milliseconds.
  useEffect(() => {
    if (!mobileOpen) return;
    const { body } = document;
    const offset = window.scrollY;
    const previous = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      overflow: body.style.overflow,
    };
    navigatingRef.current = false;
    scrollLockedRef.current = true;
    body.style.position = 'fixed';
    body.style.top = `-${offset}px`;
    body.style.left = '0px';
    body.style.right = '0px';
    body.style.overflow = 'hidden';
    return () => {
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.left = previous.left;
      body.style.right = previous.right;
      body.style.overflow = previous.overflow;
      // Skipped when a link caused the close: restoring there would fight the router. See
      // `navigatingRef` above.
      if (!navigatingRef.current) window.scrollTo({ top: offset, left: 0, behavior: 'instant' });
      navigatingRef.current = false;
      scrollLockedRef.current = false;
    };
  }, [mobileOpen]);

  // The open mobile nav traps Tab focus (`useFocusTrap` above) but that only covers
  // sequential keyboard navigation — a screen-reader virtual cursor moves by document
  // order, not Tab order, and could still read and activate the page content sitting
  // behind the overlay. `Header` cannot reach `<main>`/`<Footer>` through props or
  // context — they are its siblings in `src/app/layout.tsx`, not its children — so this
  // reaches them the same way the scroll lock above reaches `document.body`: directly,
  // by DOM query, imperatively. `inert` is a real HTML attribute (React 19 can also
  // render it as a JSX boolean prop, but there is no JSX here to render it onto), so
  // setting it outside React does not fight any render.
  // `SkipNav` (a sibling in `layout.tsx`, rendered before `main`) is deliberately NOT included in
  // this targeting. Tab is already fully trapped inside the open mobile nav by `useFocusTrap`
  // above, and `SkipNav`'s only target — `#main-content` — is itself `inert` while this is open,
  // so activating the skip link would be a no-op; only a screen-reader virtual-cursor traversal
  // could reach it at all. Adding `inert` here would risk it sticking on an exit path this effect
  // doesn't cover, for a link that does nothing anyway.
  useEffect(() => {
    const main = document.getElementById('main-content');
    const footer = document.querySelector('footer');
    if (mobileOpen) {
      main?.setAttribute('inert', '');
      footer?.setAttribute('inert', '');
    }
    return () => {
      main?.removeAttribute('inert');
      footer?.removeAttribute('inert');
    };
  }, [mobileOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-paper border-b border-grey-200">
      <div
        data-testid="header-bar"
        className={cn(
          'container mx-auto flex items-center justify-between transition-[height] duration-300',
          scrolled ? 'h-16' : 'h-20',
        )}
      >
        {/* Logo */}
        <Link
          href={ROUTES.HOME}
          className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
          aria-label="Navodaya home"
        >
          <Image
            src="/navodaya-logo.png"
            alt="Navodaya logo"
            width={36}
            height={36}
            priority
            style={{ width: '36px', height: '36px', objectFit: 'contain' }}
          />
          <span className="flex flex-col leading-tight">
            <span className="font-display text-base font-semibold text-ink">{BRAND.NAME}</span>
            <span className="hidden sm:block font-mono text-label uppercase text-grey-500">
              Industries &amp; Care Kits
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Main navigation" className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ label, href }) => {
            const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  // `relative` + an absolutely-positioned invisible `::before` grows the
                  // clickable/tappable area toward 44px tall without touching layout: the
                  // pseudo-element is out of flow, so the visible text, padding and
                  // surrounding spacing are pixel-identical to before. Horizontal inset is
                  // half of vertical: adjacent links sit `gap-1` (4px) apart, and a full
                  // -4px on each side would make neighbouring invisible hit areas overlap
                  // by 4px — -2px each side exactly meets in the middle of the gap instead.
                  "relative px-3 py-2 text-body-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue before:absolute before:inset-x-[-2px] before:inset-y-[-4px] before:content-['']",
                  isActive
                    ? 'text-ink underline decoration-ink decoration-1 underline-offset-8'
                    : 'text-grey-600 hover:text-brand-blue',
                )}
              >
                {label}
              </Link>
            );
          })}
          <Link
            href={ROUTES.CONTACT}
            className="ml-4 inline-flex items-center min-h-[44px] px-6 font-mono text-label uppercase bg-brand-blue text-paper hover:bg-brand-blue/90 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
            data-cursor-invert
          >
            Get a Quote
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          ref={toggleButtonRef}
          className="md:hidden relative p-2 text-ink hover:text-brand-blue transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink before:absolute before:inset-[-4px] before:content-['']"
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
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-nav-heading"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: reducedMotion ? 0.01 : 0.35, ease: [0.76, 0, 0.24, 1] }}
            className="md:hidden absolute top-full left-0 right-0 overflow-hidden bg-paper border-b border-grey-200"
          >
            {/* Screen-reader-only accessible name for the dialog. Text matches the previous
                bare `aria-label`, so `getByLabelText('Mobile navigation')` — used throughout
                this file's tests — still resolves via `aria-labelledby` without any test edits. */}
            <h2 id="mobile-nav-heading" className="sr-only">
              Mobile navigation
            </h2>
            <ul className="flex flex-col py-3 px-6 gap-1" style={{ perspective: '1000px' }}>
              {NAV_LINKS.map(({ label, href }, i) => {
                const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
                return (
                  <li key={href} style={{ perspective: '120px', perspectiveOrigin: 'bottom' }}>
                    <motion.div
                      initial={
                        reducedMotion ? { opacity: 0 } : { opacity: 0, rotateX: 90, translateY: 40 }
                      }
                      animate={
                        reducedMotion ? { opacity: 1 } : { opacity: 1, rotateX: 0, translateY: 0 }
                      }
                      exit={{ opacity: 0 }}
                      transition={{
                        duration: reducedMotion ? 0.01 : 0.5,
                        delay: reducedMotion ? 0 : 0.1 + i * 0.08,
                        ease: [0.215, 0.61, 0.355, 1],
                      }}
                    >
                      <Link
                        href={href}
                        onClick={closeViaLink}
                        aria-current={isActive ? 'page' : undefined}
                        className={cn(
                          'block px-2 py-3 text-body-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue',
                          isActive ? 'text-ink' : 'text-grey-600 hover:text-brand-blue',
                        )}
                      >
                        {label}
                      </Link>
                    </motion.div>
                  </li>
                );
              })}
              <li className="pt-2 pb-2">
                <motion.div
                  initial={
                    reducedMotion ? { opacity: 0 } : { opacity: 0, rotateX: 90, translateY: 40 }
                  }
                  animate={
                    reducedMotion ? { opacity: 1 } : { opacity: 1, rotateX: 0, translateY: 0 }
                  }
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: reducedMotion ? 0.01 : 0.5,
                    delay: reducedMotion ? 0 : 0.1 + NAV_LINKS.length * 0.08,
                    ease: [0.215, 0.61, 0.355, 1],
                  }}
                >
                  <Link
                    href={ROUTES.CONTACT}
                    onClick={closeViaLink}
                    className="flex w-full items-center justify-center min-h-[48px] px-4 font-mono text-label uppercase bg-brand-blue text-paper hover:bg-brand-blue/90 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
                    data-cursor-invert
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
