import React, { useRef } from 'react';
import { ArrowDown } from 'lucide-react';

interface PopupCardProps {
  onContactClick: () => void;
  onExploreClick: () => void;
}

const PopupCard: React.FC<PopupCardProps> = ({ onContactClick, onExploreClick }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  return (
    <div 
      ref={scrollContainerRef}
      className="fixed inset-0 z-40 flex flex-col animate-fadeIn" 
      style={{ paddingTop: '80px' }}
    >
      <div className="flex flex-col items-center justify-center p-4 h-full">
      {/* Main Popup Card */}
      <div className="backdrop-blur-xl bg-white/90 border border-blue-300 rounded-3xl p-8 md:p-12 max-w-2xl w-full mx-4 shadow-2xl hover-lift">
        {/* Maximum bright overlay effect */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/80 to-blue-50/80 backdrop-blur-xl transition-all duration-500"></div>
        
        <div className="relative z-10 text-center">
          <div className="mb-6">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4 animate-slide-up">
              Coming Soon
            </h2>
            <p className="text-lg md:text-xl text-slate-700 leading-relaxed animate-slide-up">
              We are building something <span className="text-blue-600 font-semibold">extraordinary</span> for you, 
              but you can still contact us
            </p>
          </div>

          <div className="mb-8 animate-slide-up">
            <p className="text-slate-600 text-lg italic">
              "Your Trusted Partner in Progress and Care"
            </p>
          </div>

          <div className="mb-6 animate-slide-up">
            <p className="text-slate-600 text-base">
              Explore our manufacturing capabilities or get in touch directly
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 justify-center animate-slide-up">
            <button
              onClick={onExploreClick}
              className="group bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center space-x-3 mx-auto relative overflow-hidden"
            >
              <span>Explore Manufacturing</span>
            </button>
            
            <button
              onClick={onContactClick}
              className="group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center space-x-3 mx-auto relative overflow-hidden"
            >
              <span>Contact Us</span>
              <ArrowDown className="w-5 h-5 group-hover:translate-y-2 transition-transform duration-300" />
            </button>
          </div>

          {/* Floating elements */}
          <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 opacity-70 animate-float shadow-lg"></div>
          <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 opacity-70 animate-float shadow-lg" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 -right-6 w-4 h-4 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 opacity-60 animate-float shadow-lg" style={{ animationDelay: '2s' }}></div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default PopupCard;