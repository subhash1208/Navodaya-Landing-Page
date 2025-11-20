import React from 'react';
import { Award, Heart, TrendingUp } from 'lucide-react';

const AboutUs: React.FC = () => {
  return (
    <section id="about" className="py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">About Navodaya</h2>
          <p className="text-xl text-slate-600">Industries and Care Kits</p>
        </div>

        <div className="backdrop-blur-xl bg-white/30 border border-white/40 rounded-3xl p-8 md:p-12 mb-8 hover-lift">
          <p className="text-lg text-slate-700 leading-relaxed mb-6 text-center">
            Your Trusted Partner in Progress and Care. We specialize in manufacturing high-quality industrial products and care kits, 
            delivering excellence in every product we create.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <Award className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Quality First</h3>
              <p className="text-slate-600">Committed to delivering premium products that meet the highest standards</p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <Heart className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Care & Trust</h3>
              <p className="text-slate-600">Building lasting relationships through reliability and genuine care</p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Innovation</h3>
              <p className="text-slate-600">Continuously evolving to meet the changing needs of our customers</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
