import { useState, useCallback } from 'react';
import { Menu, X } from 'lucide-react';
import logoImage from '../assets/images/logo.png';
import { cn } from '../utils/cn';
import { NAV_LINKS, SECTION_IDS } from '../constants';
import { AppScreen } from '../types';

interface HeaderProps {
  currentScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavClick = useCallback((href: string) => {
    setMobileOpen(false);
    const hash = href.replace('#', '');
    if (hash === SECTION_IDS.CONTACT) {
      onNavigate('contact');
    } else {
      onNavigate('main');
      setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  }, [onNavigate]);

  const handleLogoClick = useCallback(() => {
    onNavigate('main');
  }, [onNavigate]);

  return (
    <header className="group fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/95 border-b border-slate-100 h-14 hover:h-20 transition-all duration-200 ease-smooth">
      <div className="max-w-content mx-auto px-6 h-full flex items-center justify-between">

        {/* Logo */}
        <button
          onClick={handleLogoClick}
          className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary rounded-lg"
          aria-label="Go to homepage"
        >
          <img
            src={logoImage}
            alt="Navodaya logo"
            width={32}
            height={32}
            className="w-8 h-8 group-hover:w-10 group-hover:h-10 object-contain transition-all duration-300 ease-smooth"
          />
          <div className="flex flex-col justify-center">
            <span className="text-base group-hover:text-xl font-bold text-slate-800 transition-all duration-300 ease-smooth leading-tight">
              Navodaya
            </span>
            <span className="text-xs text-slate-500 opacity-0 group-hover:opacity-100 max-h-0 group-hover:max-h-8 overflow-hidden transition-all duration-300 ease-smooth">
              Industries and Care Kits
            </span>
          </div>
        </button>

        {/* Desktop nav */}
        <nav aria-label="Main navigation" className="hidden md:flex items-center gap-6 overflow-hidden">
          {NAV_LINKS.map(({ label, href }, i) => (
            <button
              key={href}
              onClick={() => handleNavClick(href)}
              className={cn(
                'text-sm font-medium text-slate-600 hover:text-brand-primary',
                'translate-x-full opacity-0 group-hover:translate-x-0 group-hover:opacity-100',
                'transition-all duration-300 ease-out',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary rounded'
              )}
              style={{ transitionDelay: `${i * 50}ms` }}
            >
              {label}
            </button>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg text-slate-600 hover:text-brand-primary hover:bg-surface-subtle transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
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
          className="md:hidden absolute top-full left-0 right-0 bg-white/98 backdrop-blur-md border-b border-slate-100 shadow-card animate-fade-in"
        >
          <ul className="flex flex-col py-2">
            {NAV_LINKS.map(({ label, href }) => (
              <li key={href}>
                <button
                  onClick={() => handleNavClick(href)}
                  className="w-full text-left px-6 py-3 text-sm font-medium text-slate-700 hover:text-brand-primary hover:bg-surface-subtle transition-colors focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-brand-primary"
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
};

export default Header;
