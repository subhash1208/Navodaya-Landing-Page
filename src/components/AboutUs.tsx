import React, { useEffect, useState, useRef } from 'react';
import { Award, MapPin, TrendingUp } from 'lucide-react';

const rotatingWords = ['Care Kits', 'Quality Products', 'Innovation', 'Excellence'];

const AboutUs: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentWord, setCurrentWord] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const word = rotatingWords[currentWord];
    let timeout: ReturnType<typeof setTimeout>;

    if (!isDeleting && displayText === word) {
      timeout = setTimeout(() => setIsDeleting(true), 2000);
    } else if (isDeleting && displayText === '') {
      setIsDeleting(false);
      setCurrentWord((prev) => (prev + 1) % rotatingWords.length);
    } else {
      const speed = isDeleting ? 50 : 100;
      timeout = setTimeout(() => {
        setDisplayText(word.substring(0, displayText.length + (isDeleting ? -1 : 1)));
      }, speed);
    }

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentWord]);

  return (
    <section ref={sectionRef} id="about" className="py-8 px-4 bg-gradient-to-br from-blue-50 via-white to-slate-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className={`text-4xl md:text-5xl font-bold text-blue-900 mb-4 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'
          }`}>About Navodaya</h2>
          <p className="text-xl text-slate-600">
            Industries and{' '}
            <span className="inline-block relative h-8 min-w-[200px] align-middle text-left">
              <span className="font-semibold text-blue-600">
                {displayText}
                <span className="animate-pulse">|</span>
              </span>
            </span>
          </p>
        </div>

        <div className={`bg-white border border-blue-100 rounded-3xl p-8 md:p-12 mb-8 hover-lift shadow-lg transition-all duration-1000 delay-300 ${
          isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
        }`}>
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-blue-800 mb-4">
              Your Trusted Partner in Progress and Care
            </h3>
            <p className="text-lg text-slate-700 leading-relaxed">
              We are a leading manufacturer and global supplier of disposable hygiene & safety products, hotel amenities, and spa & salon essentials. Through strategic manufacturing and import-export operations, we deliver comprehensive solutions to meet diverse industry needs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className={`text-center group transition-all duration-1000 delay-500 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4 shadow-md group-hover:shadow-lg group-hover:bg-blue-700 transition-all">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Quality Assured</h3>
              <p className="text-slate-600">Manufactured and sourced products meeting international quality and safety standards</p>
            </div>

            <div className={`text-center group transition-all duration-1000 delay-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-full mb-4 shadow-md group-hover:shadow-lg group-hover:bg-blue-600 transition-all">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Global Reach</h3>
              <p className="text-slate-600">Seamless import-export operations ensuring timely delivery across markets</p>
            </div>

            <div className={`text-center group transition-all duration-1000 delay-900 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-700 rounded-full mb-4 shadow-md group-hover:shadow-lg group-hover:bg-blue-800 transition-all">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Comprehensive Solutions</h3>
              <p className="text-slate-600">Extensive product portfolio serving hotels, hospitals, spas, and industries</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
