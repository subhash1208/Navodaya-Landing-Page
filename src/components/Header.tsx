import React from 'react';
import logoImage from '../../logo.png';

const Header: React.FC = () => {
  const handleLogoClick = () => {
    window.location.hash = '#home';
  };

  return (
    <header className="group fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-blue-100/90 border-b border-blue-200 h-14 hover:h-20 transition-all duration-200 ease-in-out">
      <div className="container mx-auto px-6 h-full">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center space-x-3 transition-all duration-300 ease-in-out cursor-pointer" onClick={handleLogoClick}>
            <div className="p-1 group-hover:p-2 rounded-lg bg-white shadow-lg transition-all duration-300 ease-in-out">
              <img 
                src={logoImage} 
                alt="Navodaya Logo" 
                className="w-5 h-5 group-hover:w-8 group-hover:h-8 object-contain logo-enhanced transition-all duration-300 ease-in-out"
              />
            </div>
            <div className="transition-all duration-300 ease-in-out flex flex-col justify-center">
              <h1 className="text-base group-hover:text-xl font-bold text-slate-800 transition-all duration-300 ease-in-out leading-tight">Navodaya</h1>
              <p className="text-xs text-slate-600 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out max-h-0 group-hover:max-h-10 overflow-hidden">Industries and Care Kits</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center space-x-6 overflow-hidden">
            <a 
              href="#home" 
              className="text-slate-700 hover:text-blue-600 text-sm font-medium translate-x-full opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 ease-out"
              style={{ transitionDelay: '0ms' }}
            >
              Home
            </a>
            <a 
              href="#about" 
              className="text-slate-700 hover:text-blue-600 text-sm font-medium translate-x-full opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 ease-out"
              style={{ transitionDelay: '50ms' }}
            >
              About
            </a>
            <a 
              href="#products" 
              className="text-slate-700 hover:text-blue-600 text-sm font-medium translate-x-full opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 ease-out"
              style={{ transitionDelay: '100ms' }}
            >
              Products
            </a>
            <a 
              href="#contact" 
              className="text-slate-700 hover:text-blue-600 text-sm font-medium translate-x-full opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 ease-out"
              style={{ transitionDelay: '150ms' }}
            >
              Contact
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header