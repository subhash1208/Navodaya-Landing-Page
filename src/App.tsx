import { useState, useEffect } from 'react';
import Header from './components/Header';
import LoadingAnimation from './components/LoadingAnimation';
import PopupCard from './components/PopupCard';
import AboutUs from './components/AboutUs';
import ProductCarousel from './components/ProductCarousel';
import ContactForm from './components/ContactForm';
import Footer from './components/Footer';
import { AnimationState } from './types';

function App() {
  const [animationState, setAnimationState] = useState<AnimationState>({
    isLoading: true,
    showPopup: false,
    showContent: false
  });
  const [showMainContent, setShowMainContent] = useState(false);

  const handleLoadingComplete = () => {
    setAnimationState(prev => ({
      ...prev,
      isLoading: false,
      showPopup: true
    }));
    setShowMainContent(false);
  };

  const handleContactClick = () => {
    setAnimationState(prev => ({
      ...prev,
      showPopup: false,
      showContent: true
    }));
    setShowMainContent(false);
    
    // Smooth scroll to contact section
    setTimeout(() => {
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 300);
  };

  const handleExploreClick = () => {
    setAnimationState(prev => ({
      ...prev,
      showPopup: false,
      showContent: false
    }));
    setShowMainContent(true);
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      
      if (hash === '#contact') {
        setAnimationState(prev => ({
          ...prev,
          showPopup: false,
          showContent: true
        }));
        setShowMainContent(false);
      } else if (hash === '#home' || hash === '#about' || hash === '#products') {
        setAnimationState(prev => ({
          ...prev,
          showPopup: false,
          showContent: false
        }));
        setShowMainContent(true);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);



  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-blue-100 font-sans transition-all duration-1000 overflow-x-hidden">
      {/* Loading Animation */}
      {animationState.isLoading && (
        <LoadingAnimation onComplete={handleLoadingComplete} />
      )}

      {/* Main Website Content */}
      {!animationState.isLoading && !animationState.showPopup && !animationState.showContent && showMainContent && (
        <>
          <Header />
          <div className="pt-16">
            <AboutUs />
            <ProductCarousel />
            <Footer />
          </div>
        </>
      )}

      {/* Gray Overlay when popup is visible */}
      {animationState.showPopup && (
        <div className="fixed inset-0 bg-black/50 z-30 animate-fadeIn" />
      )}

      {/* Popup Card */}
      {animationState.showPopup && (
        <PopupCard onContactClick={handleContactClick} onExploreClick={handleExploreClick} />
      )}

      {/* Contact Form */}
      {animationState.showContent && (
        <>
          <Header />
          <div className="pt-16 min-h-screen flex flex-col">
            <div className="flex-1">
              <ContactForm />
            </div>
            <Footer />
          </div>
        </>
      )}


    </div>
  );
}

export default App;