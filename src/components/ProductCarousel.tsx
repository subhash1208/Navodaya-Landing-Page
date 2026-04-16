import { useState, useEffect, useCallback } from 'react';
import { useInView } from '../hooks/useInView';
import { cn } from '../utils/cn';
import { PRODUCTS, SECTION_IDS } from '../constants';

const ITEMS_PER_SLIDE = 3;
const TOTAL_SLIDES = Math.ceil(PRODUCTS.length / ITEMS_PER_SLIDE);
const AUTO_PLAY_MS = 3500;

const ProductCarousel: React.FC = () => {
  const { ref, inView } = useInView();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [flippedId, setFlippedId] = useState<string | null>(null);

  const nextSlide = useCallback(() => setCurrentSlide((p) => (p + 1) % TOTAL_SLIDES), []);
  const prevSlide = useCallback(() => setCurrentSlide((p) => (p - 1 + TOTAL_SLIDES) % TOTAL_SLIDES), []);

  useEffect(() => {
    if (isPaused) return;
    const id = setInterval(nextSlide, AUTO_PLAY_MS);
    return () => clearInterval(id);
  }, [isPaused, nextSlide]);

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      id={SECTION_IDS.PRODUCTS}
      className="py-section px-4"
      aria-labelledby="products-heading"
    >
      <div className="max-w-content mx-auto">

        {/* Heading */}
        <div className={cn(
          'text-center mb-12 transition-all duration-700',
          inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        )}>
          <h2 id="products-heading" className="text-heading text-brand-dark mb-3">
            Our Product Range
          </h2>
          <p className="text-body text-slate-500">Premium quality — coming soon to our full catalogue</p>
        </div>

        {/* Carousel container */}
        <div
          className={cn(
            'bg-white border border-slate-100 rounded-card p-8 shadow-card transition-all duration-700',
            inView ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          )}
          style={{ transitionDelay: '150ms' }}
        >
          <div
            className="overflow-hidden"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => { setIsPaused(false); setFlippedId(null); }}
          >
            <div
              className="flex transition-transform duration-500 ease-smooth"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              aria-live="polite"
              aria-atomic="true"
            >
              {Array.from({ length: TOTAL_SLIDES }).map((_, slideIdx) => (
                <div key={slideIdx} className="min-w-full grid grid-cols-3 gap-4 px-1">
                  {PRODUCTS.slice(slideIdx * ITEMS_PER_SLIDE, (slideIdx + 1) * ITEMS_PER_SLIDE).map((product) => {
                    const isFlipped = flippedId === product.id;
                    return (
                      <div
                        key={product.id}
                        className="relative h-40 cursor-pointer"
                        style={{ perspective: '1000px' }}
                        onMouseLeave={() => setFlippedId(null)}
                      >
                        <div
                          className="relative w-full h-full transition-transform duration-700 ease-smooth"
                          style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
                        >
                          {/* Front */}
                          <button
                            className="absolute inset-0 bg-surface-subtle border border-slate-100 rounded-card p-4 text-center flex flex-col items-center justify-center hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                            style={{ backfaceVisibility: 'hidden' }}
                            onClick={() => setFlippedId(product.id)}
                            aria-label={`Learn more about ${product.name}`}
                          >
                            <span className="text-4xl mb-2" role="img" aria-hidden="true">{product.icon}</span>
                            <span className="text-caption text-slate-600 font-medium">{product.name}</span>
                          </button>

                          {/* Back */}
                          <button
                            className="absolute inset-0 bg-brand-light border border-brand-secondary/30 rounded-card p-4 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                            onClick={() => setFlippedId(null)}
                            aria-label={`Close ${product.name} details`}
                          >
                            <p className={cn(
                              'text-xs text-slate-700 leading-relaxed text-center transition-all duration-500',
                              isFlipped ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                            )}
                              style={{ transitionDelay: isFlipped ? '300ms' : '0ms' }}
                            >
                              {product.description}
                            </p>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-6" role="tablist" aria-label="Carousel navigation">
            {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={currentSlide === i}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setCurrentSlide(i)}
                className={cn(
                  'h-2 rounded-pill transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary',
                  currentSlide === i ? 'w-6 bg-brand-primary' : 'w-2 bg-slate-200 hover:bg-slate-300'
                )}
              />
            ))}
          </div>

          {/* Prev / Next */}
          <div className="flex justify-between mt-4">
            <button
              onClick={prevSlide}
              aria-label="Previous slide"
              className="text-xs text-slate-400 hover:text-brand-primary transition-colors px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary rounded"
            >
              ← Prev
            </button>
            <button
              onClick={nextSlide}
              aria-label="Next slide"
              className="text-xs text-slate-400 hover:text-brand-primary transition-colors px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary rounded"
            >
              Next →
            </button>
          </div>

          <p className="mt-4 text-center text-caption text-slate-400 flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-secondary inline-block animate-pulse" aria-hidden="true" />
            More products coming soon
          </p>
        </div>
      </div>
    </section>
  );
};

export default ProductCarousel;
