import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { AppScreen } from './types';
import { SECTION_IDS } from './constants';
import Header from './components/Header';
import Footer from './components/Footer';
import LoadingAnimation from './components/LoadingAnimation';

// Lazy-load below-fold sections
const PopupCard      = lazy(() => import('./components/PopupCard'));
const AboutUs        = lazy(() => import('./components/AboutUs'));
const ProductCarousel = lazy(() => import('./components/ProductCarousel'));
const ContactForm    = lazy(() => import('./components/ContactForm'));

function SectionFallback() {
  return (
    <div className="w-full py-section flex items-center justify-center" aria-hidden="true">
      <div className="w-8 h-8 rounded-full border-2 border-brand-primary border-t-transparent animate-spin" />
    </div>
  );
}

function App() {
  const [screen, setScreen] = useState<AppScreen>('loading');

  const goTo = useCallback((next: AppScreen) => setScreen(next), []);

  const handleLoadingComplete = useCallback(() => goTo('popup'), [goTo]);
  const handleExploreClick    = useCallback(() => goTo('main'),    [goTo]);
  const handleContactClick    = useCallback(() => {
    goTo('contact');
    setTimeout(() => {
      document.getElementById(SECTION_IDS.CONTACT)?.scrollIntoView({ behavior: 'smooth' });
    }, 300);
  }, [goTo]);

  // Hash-based navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === SECTION_IDS.CONTACT) {
        goTo('contact');
      } else if ([SECTION_IDS.HOME, SECTION_IDS.ABOUT, SECTION_IDS.PRODUCTS].includes(hash as typeof SECTION_IDS[keyof typeof SECTION_IDS])) {
        goTo('main');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [goTo]);

  const showHeader  = screen === 'main' || screen === 'contact';
  const showMain    = screen === 'main';
  const showContact = screen === 'contact';
  const showPopup   = screen === 'popup';

  return (
    <div className="min-h-screen bg-gradient-mesh font-sans overflow-x-hidden">
      {/* Skip navigation — accessibility */}
      <a
        href={`#${SECTION_IDS.HOME}`}
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-brand-primary focus:text-white focus:rounded-lg focus:text-sm focus:font-medium"
      >
        Skip to content
      </a>

      {/* Loading */}
      {screen === 'loading' && (
        <LoadingAnimation onComplete={handleLoadingComplete} />
      )}

      {/* Popup */}
      {showPopup && (
        <>
          <div className="fixed inset-0 bg-black/50 z-30 animate-fade-in" aria-hidden="true" />
          <Suspense fallback={null}>
            <PopupCard onContactClick={handleContactClick} onExploreClick={handleExploreClick} />
          </Suspense>
        </>
      )}

      {/* Main content */}
      {(showMain || showContact) && (
        <>
          <Header currentScreen={screen} onNavigate={goTo} />
          <main id={SECTION_IDS.HOME} className="pt-14">
            {showMain && (
              <Suspense fallback={<SectionFallback />}>
                <AboutUs />
                <ProductCarousel />
              </Suspense>
            )}
            {showContact && (
              <Suspense fallback={<SectionFallback />}>
                <ContactForm />
              </Suspense>
            )}
          </main>
          <Footer />
        </>
      )}
    </div>
  );
}

export default App;
