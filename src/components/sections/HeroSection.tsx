import Link from 'next/link';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { BRAND, ROUTES } from '@/constants';

export default function HeroSection() {
  return (
    <section
      id="home"
      aria-label="Hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Gradient mesh background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[--color-brand-light] via-white to-slate-50" />
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-[--color-brand-primary]/8 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-[--color-brand-secondary]/10 blur-[100px]" />
        <div className="absolute top-1/2 left-0 w-[300px] h-[300px] rounded-full bg-[--color-brand-accent]/6 blur-[80px]" />
      </div>

      {/* Floating geometric shapes */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-24 right-16 w-16 h-16 rounded-2xl border-2 border-[--color-brand-primary]/15 rotate-12 animate-[float_6s_ease-in-out_infinite]" />
        <div className="absolute top-1/3 left-12 w-10 h-10 rounded-full border-2 border-[--color-brand-secondary]/20 animate-[float_8s_ease-in-out_infinite_1s]" />
        <div className="absolute bottom-1/3 right-24 w-8 h-8 rounded-lg border-2 border-[--color-brand-accent]/20 rotate-45 animate-[float_7s_ease-in-out_infinite_2s]" />
        <div className="absolute bottom-24 left-1/4 w-12 h-12 rounded-full bg-[--color-brand-primary]/6 animate-[float_9s_ease-in-out_infinite_0.5s]" />
      </div>

      <div className="max-w-[80rem] mx-auto px-4 sm:px-6 lg:px-8 text-center py-32">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-[--color-brand-light] border border-[--color-brand-primary]/20 text-[--color-brand-primary] text-xs font-semibold px-4 py-1.5 rounded-full mb-8 animate-[fadeUp_0.6s_ease_forwards]">
          <span className="w-1.5 h-1.5 rounded-full bg-[--color-brand-secondary] animate-pulse" />
          Trusted B2B Supplier · Gandhi Nagar, Hyderabad
        </div>

        {/* Headline */}
        <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-black leading-[1.05] tracking-tight text-[--color-brand-dark] mb-6 animate-[fadeUp_0.7s_0.1s_ease_both]">
          Premium Hygiene &amp; Care
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[--color-brand-primary] to-[--color-brand-secondary]">
            Solutions for Every Industry
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed animate-[fadeUp_0.7s_0.2s_ease_both]">
          {BRAND.MISSION}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-[fadeUp_0.7s_0.3s_ease_both]">
          <Link
            href={ROUTES.PRODUCTS}
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[--color-brand-primary] text-white font-semibold text-sm hover:bg-[--color-brand-primary]/90 hover:-translate-y-0.5 hover:shadow-[0_0_40px_rgba(30,64,175,0.35)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-brand-primary] focus-visible:ring-offset-2 min-h-[44px]"
          >
            Explore Products
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" aria-hidden="true" />
          </Link>
          <Link
            href={ROUTES.CONTACT}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full border-2 border-[--color-brand-primary] text-[--color-brand-primary] font-semibold text-sm hover:bg-[--color-brand-light] hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-brand-primary] focus-visible:ring-offset-2 min-h-[44px]"
          >
            Get a Quote
          </Link>
        </div>

        {/* Trust stats */}
        <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto animate-[fadeUp_0.7s_0.4s_ease_both]">
          {[
            { value: '51+', label: 'Products' },
            { value: '3', label: 'Categories' },
            { value: 'B2B', label: 'Focused' },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-2xl font-black text-[--color-brand-primary]">{value}</div>
              <div className="text-xs text-slate-400 font-medium mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <a
        href="#about"
        aria-label="Scroll to About section"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-slate-400 hover:text-[--color-brand-primary] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-brand-primary] rounded"
      >
        <span className="text-xs font-medium tracking-widest uppercase">Scroll</span>
        <ChevronDown className="w-4 h-4 animate-bounce" aria-hidden="true" />
      </a>
    </section>
  );
}
