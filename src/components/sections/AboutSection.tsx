import { Award, Globe, Handshake } from 'lucide-react';
import { BRAND } from '@/constants';

const PILLARS = [
  {
    icon: Award,
    title: 'Quality Assured',
    description: 'Every product meets international hygiene and safety standards before it reaches you.',
  },
  {
    icon: Globe,
    title: 'Global Reach',
    description: 'Strategic import-export operations ensuring reliable supply across markets.',
  },
  {
    icon: Handshake,
    title: 'Customer First',
    description: 'Prompt service and a commitment to comfort, cleanliness, and satisfaction.',
  },
] as const;

export default function AboutSection() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="py-24 sm:py-32 bg-white"
    >
      <div className="max-w-[80rem] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section label */}
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-[--color-brand-secondary] mb-3">
            Who We Are
          </span>
          <h2
            id="about-heading"
            className="text-[clamp(1.75rem,3vw,2.5rem)] font-bold text-[--color-brand-dark] mb-4"
          >
            About {BRAND.NAME}
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg leading-relaxed">
            {BRAND.MISSION}
          </p>
        </div>

        {/* Main content card */}
        <div className="bg-gradient-to-br from-[--color-brand-light] to-slate-50 rounded-[1.25rem] p-8 md:p-12 mb-12 border border-[--color-brand-primary]/10">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h3 className="text-xl font-bold text-[--color-brand-dark] mb-4">
                {BRAND.TAGLINE}
              </h3>
              <p className="text-slate-600 leading-relaxed mb-6">
                Based in {BRAND.LOCATION}, we are a dedicated supplier of disposable hygiene &amp; safety products,
                hotel room slippers, guest amenities, and spa &amp; salon essentials — serving the hospitality
                and wellness sectors with reliability and care.
              </p>
              <p className="text-slate-600 leading-relaxed">
                Our approach is simple: understand what businesses need, source the best products,
                and deliver them promptly. Every order is backed by our commitment to quality and
                customer satisfaction.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: '51+', label: 'Products in catalogue' },
                { value: '3', label: 'Product categories' },
                { value: '100%', label: 'B2B focused' },
                { value: 'HYD', label: 'Based in Hyderabad' },
              ].map(({ value, label }) => (
                <div
                  key={label}
                  className="bg-white rounded-xl p-5 border border-slate-100 shadow-[0_2px_8px_rgba(15,23,42,0.06)]"
                >
                  <div className="text-2xl font-black text-[--color-brand-primary] mb-1">{value}</div>
                  <div className="text-xs text-slate-500 font-medium">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pillars */}
        <div className="grid sm:grid-cols-3 gap-6">
          {PILLARS.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group bg-white border border-slate-100 rounded-[1.25rem] p-7 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.08)] hover:shadow-[0_20px_48px_-8px_rgba(15,23,42,0.16)] hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-[--color-brand-light] flex items-center justify-center mb-5 group-hover:bg-[--color-brand-primary] transition-colors duration-300">
                <Icon className="w-6 h-6 text-[--color-brand-primary] group-hover:text-white transition-colors duration-300" aria-hidden="true" />
              </div>
              <h3 className="font-bold text-[--color-brand-dark] mb-2">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
