import React, { useEffect, useState, useCallback } from 'react';
import { X } from 'lucide-react';
import logoImage from '../assets/images/navodaya_logo.png';

interface LoadingAnimationProps {
  onComplete: () => void;
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({ onComplete }) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [isFilled, setIsFilled] = useState(false);
  const [showLogo, setShowLogo] = useState(false);
  const [showTagline, setShowTagline] = useState(false);
  const [showSkip, setShowSkip] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const companyName = "NAVODAYA";

  const handleExit = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => onComplete(), 800);
  }, [onComplete]);

  useEffect(() => {
    // Start drawing animation
    const drawTimer = setTimeout(() => {
      setIsDrawing(true);
      // Play whoosh sound
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGS57OihUBELTKXh8bllHAU2jdXvzn0pBSh+zPDhkj4KFV+16+qnVRQLRp/g8r5sIQUrgs/y2Ik2CBhkuezooVARDEyl4fG5ZRwFNo3V7859KQUofsz');
      audio.volume = 0.15;
      audio.play().catch(() => {});
    }, 300);

    // Fill animation after drawing completes
    const fillTimer = setTimeout(() => setIsFilled(true), 1800);
    
    const logoTimer = setTimeout(() => setShowLogo(true), 2500);
    const taglineTimer = setTimeout(() => setShowTagline(true), 2900);
    const skipTimer = setTimeout(() => setShowSkip(true), 2000);
    const completeTimer = setTimeout(() => handleExit(), 4500);

    return () => {
      clearTimeout(drawTimer);
      clearTimeout(fillTimer);
      clearTimeout(logoTimer);
      clearTimeout(taglineTimer);
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

      <div className="flex flex-col items-center gap-8">
        {/* Logo */}
        {showLogo && (
          <div className="animate-fadeIn">
            <div className="bg-white p-4 rounded-2xl shadow-2xl">
              <img src={logoImage} alt="Logo" className="w-20 h-20 object-contain" />
            </div>
          </div>
        )}

        {/* Company Name with Drawing Effect */}
        <div className="flex gap-2 md:gap-4 text-6xl md:text-8xl font-bold">
          {companyName.split('').map((letter, index) => (
            <span
              key={index}
              className="inline-block relative"
              style={{
                color: isFilled ? '#2563eb' : 'transparent',
                WebkitTextStroke: isDrawing ? '2px #2563eb' : '2px transparent',
                textShadow: isFilled ? '0 4px 20px rgba(37, 99, 235, 0.5)' : 'none',
                transition: 'all 0.6s ease-out'
              } as React.CSSProperties}
            >
              {letter}
            </span>
          ))}
        </div>
        
        {/* Tagline with typing effect */}
        {showTagline && (
          <div className="text-slate-700 text-lg md:text-xl font-medium animate-slide-up">
            <span className="inline-block">Industries and Care Kits</span>
          </div>
        )}

        {/* Company Motto */}
        {showTagline && (
          <div className="text-blue-600 text-base md:text-lg font-semibold italic animate-slide-up" style={{ animationDelay: '0.3s' }}>
            "Your Trusted Partner in Progress and Care"
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingAnimation;