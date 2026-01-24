import React, { useEffect, useState, useCallback } from 'react';
import { X } from 'lucide-react';
import logoImage from '../assets/images/logo.png';

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
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-slate-50 overflow-hidden transition-all duration-1000 ease-out ${
      isExiting ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
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

      <div className="relative flex items-center justify-center w-full h-full">
        {/* Logo - Fixed Position */}
        {showLogo && (
          <div 
            className="absolute top-[20%] animate-fadeIn"
            style={{ 
              willChange: 'transform, opacity',
              backfaceVisibility: 'hidden'
            }}
          >
            <img 
              src={logoImage} 
              alt="Logo" 
              className="w-24 h-24 object-contain transform transition-all duration-1000 ease-out hover:scale-110"
              style={{ 
                willChange: 'transform',
                backfaceVisibility: 'hidden'
              }}
            />
          </div>
        )}

        {/* Company Name with elegant wavy animation */}
        <div 
          className="absolute top-[45%] flex gap-1 md:gap-2 text-6xl md:text-8xl font-bold wavy-text"
          style={{ 
            willChange: 'transform',
            backfaceVisibility: 'hidden'
          }}
        >
          {companyName.split('').map((letter, index) => (
            <span
              key={index}
              className="text-blue-600 animate-fadeIn"
              style={{
                textShadow: '0 4px 20px rgba(37, 99, 235, 0.5)',
                opacity: startDrawing ? 1 : 0,
                transform: startDrawing ? 'translateY(0)' : 'translateY(20px)',
                transition: `all 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.1}s`,
                willChange: 'transform, opacity',
                backfaceVisibility: 'hidden'
              }}
            >
              {letter}
            </span>
          ))}
        </div>
        
        {/* Tagline - Fixed Position */}
        {showTagline && (
          <div 
            className="absolute top-[65%] text-slate-700 text-lg md:text-xl font-medium animate-slide-up text-center"
            style={{ 
              willChange: 'transform, opacity',
              backfaceVisibility: 'hidden'
            }}
          >
            <span className="inline-block transform transition-all duration-700 ease-out">
              Industries and Care Kits
            </span>
          </div>
        )}

        {/* Company Motto - Fixed Position */}
        {showMotto && (
          <div 
            className="absolute top-[75%] text-blue-600 text-base md:text-lg font-semibold italic animate-slide-up text-center px-4"
            style={{ 
              willChange: 'transform, opacity',
              backfaceVisibility: 'hidden'
            }}
          >
            <span className="inline-block transform transition-all duration-700 ease-out">
              "Your Trusted Partner in Progress and Care"
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingAnimation;