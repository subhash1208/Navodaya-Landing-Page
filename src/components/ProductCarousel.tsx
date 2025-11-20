import React, { useState, useEffect } from 'react';

const ProductCarousel: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showInfo, setShowInfo] = useState<number | null>(null);

  const products = [
    { name: 'Paper Cups', icon: '🥤', info: 'Eco-friendly disposable cups for hot and cold beverages. Available in multiple sizes for all occasions.' },
    { name: 'Garbage Bags', icon: '🗑️', info: 'Heavy-duty waste disposal bags with superior strength. Leak-proof and tear-resistant for industrial use.' },
    { name: 'Cable Ties', icon: '🔗', info: 'Durable nylon cable ties for secure bundling. Heat and UV resistant for indoor and outdoor applications.' },
    { name: 'Beard Masks', icon: '😷', info: 'Hygienic disposable beard covers for food and medical industries. Breathable and comfortable fit.' },
    { name: 'Shoe Covers', icon: '👟', info: 'Non-slip disposable shoe protectors for clean environments. Waterproof and dust-proof design.' },
    { name: 'Latex Gloves', icon: '🧤', info: 'Premium quality latex gloves for medical and industrial use. Powder-free with excellent grip and sensitivity.' }
  ];

  const itemsPerSlide = 3;
  const totalSlides = Math.ceil(products.length / itemsPerSlide);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const handleDotClick = (index: number) => {
    if (totalSlides === 2) {
      // For 2 dots, always go to next
      nextSlide();
    } else {
      const middle = Math.floor(totalSlides / 2);
      if (index < middle) {
        prevSlide();
      } else if (index > middle) {
        nextSlide();
      }
      // If index === middle (odd case), do nothing
    }
  };

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 3000);
    return () => clearInterval(interval);
  }, [currentSlide, isPaused]);

  return (
    <section id="products" className="py-8 px-4">
      <div className="max-w-6xl mx-auto">
      <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-8 shadow-xl">
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-slate-700 mb-2">Our Product Range</h3>
          <p className="text-slate-600 text-sm">Coming Soon - Premium Quality Products</p>
        </div>
        
        <div className="relative">
          <div 
            className="overflow-hidden"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                <div key={slideIndex} className="min-w-full grid grid-cols-3 gap-4 px-2">
                  {products.slice(slideIndex * itemsPerSlide, (slideIndex + 1) * itemsPerSlide).map((product, productIndex) => {
                    const globalIndex = slideIndex * itemsPerSlide + productIndex;
                    const isFlipped = showInfo === globalIndex;
                    return (
                      <div 
                        key={productIndex} 
                        className="relative h-40 cursor-pointer"
                        style={{ perspective: '1000px' }}
                        onMouseLeave={() => setShowInfo(null)}
                      >
                        <div 
                          className={`relative w-full h-full transition-transform duration-700 ease-in-out`}
                          style={{ 
                            transformStyle: 'preserve-3d',
                            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                          }}
                        >
                          {/* Front Side */}
                          <div 
                            className="absolute inset-0 backdrop-blur-sm bg-white/15 border border-white/25 rounded-xl p-4 text-center hover-lift cursor-pointer"
                            style={{ backfaceVisibility: 'hidden' }}
                            onClick={() => setShowInfo(globalIndex)}
                          >
                            <div className="text-3xl mb-2 opacity-60">{product.icon}</div>
                            <div className="h-3 bg-white/20 rounded mb-2"></div>
                            <div className="h-2 bg-white/15 rounded w-3/4 mx-auto"></div>
                            <div className="text-xs text-slate-500 mt-2 opacity-70">{product.name}</div>
                          </div>
                          
                          {/* Back Side */}
                          <div 
                            className="absolute inset-0 backdrop-blur-sm bg-blue-50/90 border border-blue-300 rounded-xl p-4 flex items-center justify-center cursor-pointer"
                            style={{ 
                              backfaceVisibility: 'hidden',
                              transform: 'rotateY(180deg)'
                            }}
                            onClick={() => setShowInfo(null)}
                          >
                            <div 
                              className={`text-xs text-slate-700 leading-relaxed px-2 text-center transition-all duration-700 delay-300 ${
                                isFlipped ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-50 translate-y-8'
                              }`}
                            >
                              {product.info}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 border-2 ${
                currentSlide === index 
                  ? 'bg-blue-500 border-blue-600 w-6' 
                  : 'bg-white/40 border-slate-400 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
        
        <div className="mt-6 text-center">
          <div className="inline-flex items-center space-x-2 text-slate-600 text-sm">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-smooth-pulse"></div>
            <span>More products coming soon...</span>
            <div className="w-2 h-2 rounded-full bg-teal-400 animate-smooth-pulse" style={{ animationDelay: '0.5s' }}></div>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
};

export default ProductCarousel;
