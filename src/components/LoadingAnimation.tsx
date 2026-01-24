import React, { useEffect, useState, useCallback, useRef } from 'react';
import { X } from 'lucide-react';
import { DotLottie } from '@lottiefiles/dotlottie-web';
import netflixLottie from '../assets/images/netflix-logo.json';
import logoImage from '../assets/images/navodaya_logo.png';

interface LoadingAnimationProps {
  onComplete: () => void;
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({ onComplete }) => {
  const [showSkip, setShowSkip] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [showLogo, setShowLogo] = useState(false);
  const [startDrawing, setStartDrawing] = useState(false);
  const [showTagline, setShowTagline] = useState(false);
  const [showMotto, setShowMotto] = useState(false);
  const companyName = "NAVODAYA";

  const handleExit = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => onComplete(), 800);
  }, [onComplete]);

  useEffect(() => {
    // Play whoosh sound
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGS57OihUBELTKXh8bllHAU2jdXvzn0pBSh+zPDhkj4KFV+16+qnVRQLRp/g8r5sIQUrgs/y2Ik2CBhkuezooVARDEyl4fG5ZRwFNo3V7859KQUofsz');
    audio.volume = 0.15;
    audio.play().catch(() => {});
    
    const logoTimer = setTimeout(() => setShowLogo(true), 300);
    const drawTimer = setTimeout(() => setStartDrawing(true), 800);
    const taglineTimer = setTimeout(() => setShowTagline(true), 3000);
    const mottoTimer = setTimeout(() => setShowMotto(true), 3500);
    const skipTimer = setTimeout(() => setShowSkip(true), 2000);
    const completeTimer = setTimeout(() => handleExit(), 5000);

    return () => {
      clearTimeout(logoTimer);
      clearTimeout(drawTimer);
      clearTimeout(taglineTimer);
      clearTimeout(mottoTimer);
      clearTimeout(skipTimer);
      clearTimeout(completeTimer);
    };
  }, [handleExit]);

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-slate-50 overflow-hidden transition-opacity duration-700 ${
      isExiting ? 'opacity-0' : 'opacity-100'
    }`}>
      {/* Skip Button */}
      {showSkip && !isExiting && (
        <button
          onClick={handleExit}
          className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2 bg-white/80 hover:bg-white text-slate-700 rounded-full shadow-lg transition-all duration-300 hover:scale-105 animate-fadeIn"
        >
          <span className="text-sm font-medium">Skip</span>
          <X className="w-4 h-4" />
        </button>
      )}

      <div className="flex flex-col items-center justify-center gap-6">
        {/* Logo */}
        {showLogo && (
          <div className="animate-fadeIn">
            <img src={logoImage} alt="Logo" className="w-24 h-24 object-contain" />
          </div>
        )}

        {/* Company Name with Netflix-style path morphing */}
        <div className="relative flex gap-1 md:gap-2 text-6xl md:text-8xl font-bold">
          {companyName.split('').map((letter, index) => (
            <div
              key={index}
              className="relative inline-block text-blue-600"
              style={{
                textShadow: '0 4px 20px rgba(37, 99, 235, 0.5)',
                clipPath: startDrawing ? 'inset(0 0 0 0)' : 'inset(100% 0 0 0)',
                transition: `clip-path 0.5s cubic-bezier(0.25, 0.1, 0.25, 1) ${index * 0.15}s`
              }}
            >
              {letter}
            </div>
          ))}
        </div>
        
        {/* Tagline */}
        {showTagline && (
          <div className="text-slate-700 text-lg md:text-xl font-medium animate-slide-up">
            <span className="inline-block">Industries and Care Kits</span>
          </div>
        )}

        {/* Company Motto */}
        {showMotto && (
          <div className="text-blue-600 text-base md:text-lg font-semibold italic animate-slide-up">
            "Your Trusted Partner in Progress and Care"
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingAnimation;