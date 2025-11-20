import React, { useEffect, useState } from 'react';
import { Truck, Plane } from 'lucide-react';
import logoImage from '../../logo.png';

interface LoadingAnimationProps {
  onComplete: () => void;
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({ onComplete }) => {
  const [droppedLetters, setDroppedLetters] = useState<number[]>([]);
  const [showPlane, setShowPlane] = useState(false);
  const [dropLogo, setDropLogo] = useState(false);
  const companyName = "NAVODAYA";

  useEffect(() => {
    const letterTimers = companyName.split('').map((_, index) => 
      setTimeout(() => setDroppedLetters(prev => [...prev, index]), index * 500)
    );

    const planeTimer = setTimeout(() => setShowPlane(true), 0);
    const logoTimer = setTimeout(() => setDropLogo(true), 2000);
    const completeTimer = setTimeout(() => onComplete(), 6000);

    return () => {
      letterTimers.forEach(clearTimeout);
      clearTimeout(planeTimer);
      clearTimeout(logoTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-slate-50 overflow-hidden">
      <div className="absolute top-1/2 -translate-y-1/2" style={{
        animation: 'truckMove 5s linear forwards',
        left: '-80px'
      }}>
        <Truck className="w-16 h-16 text-blue-600" />
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-2 md:gap-4 text-5xl md:text-7xl font-bold">
          {companyName.split('').map((letter, index) => (
            <span
              key={index}
              className="inline-block text-blue-600"
              style={{
                textShadow: '0 4px 20px rgba(59, 130, 246, 0.4)',
                animation: droppedLetters.includes(index) ? 'letterFall 0.5s ease-out forwards' : 'none',
                opacity: 0
              }}
            >
              {letter}
            </span>
          ))}
        </div>
        
        <div className="text-slate-600 text-lg font-medium opacity-0" style={{
          animation: dropLogo ? 'fadeIn 0.5s ease-out forwards' : 'none'
        }}>
          Industries and Care Kits
        </div>
      </div>

      {showPlane && (
        <div className="absolute" style={{
          animation: 'planeSemiCircle 4s cubic-bezier(0.45, 0.05, 0.55, 0.95) forwards',
          left: '-80px',
          top: '10%'
        }}>
          <Plane className="w-14 h-14 text-slate-600" />
        </div>
      )}

      {dropLogo && (
        <div className="absolute left-1/2 -translate-x-1/2" style={{
          animation: 'logoFall 1.5s ease-out forwards',
          top: '20%'
        }}>
          <div className="bg-white p-3 rounded-2xl shadow-2xl">
            <img src={logoImage} alt="Logo" className="w-16 h-16 object-contain" />
          </div>
        </div>
      )}
    </div>
  );
};

export default LoadingAnimation;