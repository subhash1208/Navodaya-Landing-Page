import Link from 'next/link';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { BRAND, ROUTES } from '@/constants';
import { AnimateIn } from '@/components/ui/AnimateIn';

export default function HeroSection() {
  return (
    <section
      id="home"
      aria-label="Hero"
      className="relative flex flex-col items-center justify-center overflow-hidden min-h-screen pb-20 pt-4"
      style={{ background: 'linear-gradient(135deg, #F0F9FF 0%, #ffffff 40%, #F8FAFC 100%)' }}
    >
      {/* Background blobs */}
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full opacity-30"
          style={{ background: 'radial-gradient(circle, #BFDBFE 0%, transparent 70%)' }} />
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full opacity-25"
          style={{ background: 'radial-gradient(circle, #BAE6FD 0%, transparent 70%)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #1E40AF 0%, transparent 60%)' }} />
      </div>

      {/* Floating shapes */}
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-28 right-20 w-14 h-14 rounded-2xl rotate-12 animate-[float_6s_ease-in-out_infinite]"
          style={{ background: 'linear-gradient(135deg, #DBEAFE, #BFDBFE)', boxShadow: '0 4px 20px rgba(30,64,175,0.15)' }} />
        <div className="absolute top-1/3 left-16 w-8 h-8 rounded-full animate-[float_8s_ease-in-out_infinite_1s]"
          style={{ background: 'linear-gradient(135deg, #BAE6FD, #7DD3FC)', boxShadow: '0 4px 16px rgba(14,165,233,0.2)' }} />
        <div className="absolute bottom-1/3 right-28 w-10 h-10 rounded-xl rotate-45 animate-[float_7s_ease-in-out_infinite_2s]"
          style={{ background: 'linear-gradient(135deg, #FDE68A, #FCD34D)', boxShadow: '0 4px 16px rgba(245,158,11,0.2)' }} />
        <div className="absolute bottom-32 left-1/4 w-6 h-6 rounded-full animate-[float_9s_ease-in-out_infinite_0.5s]"
          style={{ background: 'linear-gradient(135deg, #C7D2FE, #A5B4FC)', boxShadow: '0 4px 12px rgba(99,102,241,0.2)' }} />
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full section-container text-center">

        {/* Badge */}
        <AnimateIn delay={0}>
          <div className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full mb-8 bg-blue-50 border border-blue-200 text-brand-primary">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-brand-secondary" />
            Trusted B2B Supplier · Gandhi Nagar, Hyderabad
          </div>
        </AnimateIn>

        {/* Headline */}
        <AnimateIn delay={0.1}>
          <h1
            className="font-black leading-[1.05] tracking-tight mb-6 font-display text-glow text-brand-dark"
            style={{ fontSize: 'clamp(2.75rem, 6vw, 5rem)' }}
          >
            Premium Hygiene &amp; Care
            <br />
            <span style={{
              background: 'linear-gradient(135deg, #1E40AF 0%, #0EA5E9 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Solutions for Every Industry
            </span>
          </h1>
        </AnimateIn>

        {/* Subheadline */}
        <AnimateIn delay={0.2}>
          <p className="text-xl leading-relaxed max-w-2xl mx-auto mb-12 text-slate-500">
            {BRAND.MISSION}
          </p>
        </AnimateIn>

        {/* CTAs */}
        <AnimateIn delay={0.3}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href={ROUTES.PRODUCTS}
              className="group inline-flex items-center gap-2.5 rounded-full font-semibold text-base text-white transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 px-8 py-4 min-h-[52px]"
              style={{
                background: 'linear-gradient(135deg, #1E40AF, #1D4ED8)',
                boxShadow: '0 4px 24px rgba(30,64,175,0.4)',
              }}
            >
              Explore Products
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" aria-hidden="true" />
            </Link>
            <Link
              href={ROUTES.CONTACT}
              className="inline-flex items-center gap-2 rounded-full font-semibold text-base text-brand-primary bg-white border-2 border-brand-primary transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 px-8 py-4 min-h-[52px]"
              style={{ boxShadow: '0 2px 8px rgba(30,64,175,0.12)' }}
            >
              Get a Quote
            </Link>
          </div>
        </AnimateIn>

        {/* Trust stats */}
        <AnimateIn delay={0.4}>
          <div className="glass-panel inline-flex items-center rounded-2xl px-10 py-5">
            {[
              { value: '51+', label: 'Products' },
              { value: '3', label: 'Categories' },
              { value: 'B2B', label: 'Focused' },
            ].map(({ value, label }, i) => (
              <div key={label} className="flex items-center">
                <div className="text-center px-8">
                  <div className="text-[22px] font-black text-brand-primary">{value}</div>
                  <div className="text-[11px] font-medium mt-0.5 text-slate-400">{label}</div>
                </div>
                {i < 2 && <div className="w-px h-8 bg-slate-200 shrink-0" />}
              </div>
            ))}
          </div>
        </AnimateIn>
      </div>

      {/* Scroll indicator */}
      <a
        href="#about"
        aria-label="Scroll to About section"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors focus-visible:outline-none focus-visible:ring-2 rounded"
      >
        <span className="text-xs font-medium tracking-widest uppercase">Scroll</span>
        <ChevronDown className="w-4 h-4 animate-bounce" aria-hidden="true" />
      </a>
    </section>
  );
}
