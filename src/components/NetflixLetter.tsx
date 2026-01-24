import React, { useEffect, useRef, useState } from 'react';

interface NetflixLetterProps {
  letter: string;
  delay: number;
  duration?: number;
  color?: string;
  onComplete?: () => void;
}

const NetflixLetter: React.FC<NetflixLetterProps> = ({ 
  letter, 
  delay, 
  duration = 1.5, 
  color = "#E50914",
  onComplete 
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(true);
      if (onComplete) {
        setTimeout(onComplete, duration * 1000);
      }
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [delay, duration, onComplete]);

  const getLetterPaths = (letter: string) => {
    switch (letter) {
      case 'N':
        return {
          stroke1: "M 25 10 L 35 10 L 35 90 L 25 90 Z", // Left vertical - thick
          stroke2: "M 35 10 L 65 90 L 75 90 L 45 10 Z", // Diagonal - thick
          stroke3: "M 65 10 L 75 10 L 75 90 L 65 90 Z"  // Right vertical - thick
        };
      case 'A':
        return {
          stroke1: "M 25 90 L 35 90 L 50 10 L 40 10 Z", // Left diagonal - thick
          stroke2: "M 35 50 L 65 50 L 65 60 L 35 60 Z", // Cross bar - thick
          stroke3: "M 60 10 L 70 10 L 50 90 L 40 90 Z"  // Right diagonal - thick
        };
      case 'V':
        return {
          stroke1: "M 25 10 L 50 90 L 45 90 L 20 10 Z", // Left diagonal - very thick
          stroke2: "M 50 10 L 75 90 L 70 90 L 45 10 Z"  // Right diagonal - very thick
        };
      case 'O':
        return {
          stroke1: "M 50 15 A 35 35 0 1 1 50 85 A 35 35 0 1 1 50 15 Z" // Complete circle - thick
        };
      case 'D':
        return {
          stroke1: "M 25 10 L 35 10 L 35 90 L 25 90 Z", // Left vertical - thick
          stroke2: "M 35 10 A 35 35 0 0 1 35 90 Z"     // Right curve - thick
        };
      case 'Y':
        return {
          stroke1: "M 25 10 L 50 50 L 45 50 L 20 10 Z",   // Left diagonal - thick
          stroke2: "M 75 10 L 50 50 L 55 50 L 80 10 Z",  // Right diagonal - thick
          stroke3: "M 45 50 L 55 50 L 50 90 L 45 90 Z"   // Bottom vertical - thick
        };
      default:
        return {
          stroke1: "M 20 45 L 80 45 L 80 55 L 20 55 Z"   // Default thick bar
        };
    }
  };

  const paths = getLetterPaths(letter);

  return (
    <div className="relative inline-block mx-1" style={{ width: '100px', height: '100px' }}>
      <svg
        ref={svgRef}
        viewBox="0 0 100 100"
        className="w-full h-full"
        style={{ willChange: 'transform' }}
      >
        {/* Stroke 1 - Back layer (darker) */}
        {paths.stroke1 && (
          <path
            d={paths.stroke1}
            fill={isAnimating ? color : "transparent"}
            className="transition-all duration-1000 ease-out"
            style={{
              fill: isAnimating ? color : "transparent",
              opacity: isAnimating ? 0.8 : 0,
              transform: isAnimating ? 'scaleY(1)' : 'scaleY(0)',
              transformOrigin: 'bottom',
              transitionDelay: `${delay}s`,
              transitionDuration: `${duration}s`
            }}
          />
        )}
        
        {/* Stroke 2 - Middle layer (brighter) */}
        {paths.stroke2 && (
          <path
            d={paths.stroke2}
            fill={isAnimating ? color : "transparent"}
            className="transition-all duration-1000 ease-out"
            style={{
              fill: isAnimating ? color : "transparent",
              opacity: isAnimating ? 1 : 0,
              transform: isAnimating ? 'scale(1)' : 'scale(0)',
              transformOrigin: 'center',
              transitionDelay: `${delay + 0.2}s`,
              transitionDuration: `${duration * 0.8}s`
            }}
          />
        )}
        
        {/* Stroke 3 - Front layer (darker) */}
        {paths.stroke3 && (
          <path
            d={paths.stroke3}
            fill={isAnimating ? color : "transparent"}
            className="transition-all duration-1000 ease-out"
            style={{
              fill: isAnimating ? color : "transparent",
              opacity: isAnimating ? 0.8 : 0,
              transform: isAnimating ? 'scaleY(1)' : 'scaleY(0)',
              transformOrigin: 'bottom',
              transitionDelay: `${delay + 0.4}s`,
              transitionDuration: `${duration * 0.6}s`
            }}
          />
        )}
      </svg>
    </div>
  );
};

export default NetflixLetter;
