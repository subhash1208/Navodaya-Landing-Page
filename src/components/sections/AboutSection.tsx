import { Award, Globe, Handshake } from 'lucide-react';
import { BRAND } from '@/constants';
import { AnimateIn, Stagger, StaggerItem } from '@/components/ui/AnimateIn';

const PILLARS = [
  { icon: Award,     title: 'Quality Assured',   description: 'Every product meets international hygiene and safety standards before it reaches you.',          iconBg: '#EFF6FF', iconColor: '#1E40AF' },
  { icon: Globe,     title: 'Global Reach',       description: 'Strategic import-export operations ensuring reliable supply across markets.',                    iconBg: '#F0F9FF', iconColor: '#0EA5E9' },
  { icon: Handshake, title: 'Customer First',     description: 'Prompt service and a commitment to comfort, cleanliness, and satisfaction.',                     iconBg: '#F0FDF4', iconColor: '#16A34A' },
] as const;

const STATS = [
  { value: '51+',   label: 'Products in catalogue' },
  { value: '3',     label: 'Product categories'    },
  { value: '100%',  label: 'B2B focused'            },
  { value: 'HYD',   label: 'Based in Hyderabad'    },
];

export default function AboutSection() {
  return (
    <section id="about" aria-labelledby="about-heading" className="py-24 bg-white">
      <div className="section-container">

        {/* Heading */}
        <AnimateIn direction="up" delay={0}>
          <div className="text-center mb-16">
            <span className="inline-block text-[11px] font-semibold tracking-[0.1em] uppercase text-brand-secondary mb-3">
              Who We Are
            </span>
            <h2 id="about-heading" className="font-display text-[clamp(1.75rem,3vw,2.5rem)] font-bold text-brand-dark mb-4">
              About {BRAND.NAME}
            </h2>
            <p className="text-[17px] text-slate-500 max-w-xl mx-auto leading-[1.7]">
              {BRAND.MISSION}
            </p>
          </div>
        </AnimateIn>

        {/* Main card */}
        <AnimateIn direction="up" delay={0.1}>
          <div className="rounded-[20px] p-8 md:p-12 mb-8 bg-gradient-to-br from-brand-light to-surface-muted border border-blue-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 items-center">
              <div>
                <h3 className="text-xl font-bold text-brand-dark mb-4">
                  {BRAND.TAGLINE}
                </h3>
                <p className="text-slate-600 leading-[1.75] mb-4">
                  Based in {BRAND.LOCATION}, we are a dedicated supplier of disposable hygiene &amp; safety products,
                  hotel room slippers, guest amenities, and spa &amp; salon essentials — serving the hospitality
                  and wellness sectors with reliability and care.
                </p>
                <p className="text-slate-600 leading-[1.75]">
                  Our approach is simple: understand what businesses need, source the best products,
                  and deliver them promptly. Every order is backed by our commitment to quality and customer satisfaction.
                </p>
              </div>
              <Stagger staggerDelay={0.08} className="grid grid-cols-2 gap-4">
                {STATS.map(({ value, label }) => (
                  <StaggerItem key={label}>
                    <div className="bg-white rounded-[14px] p-5 border border-slate-200 shadow-[0_2px_8px_rgba(15,23,42,0.06)]">
                      <div className="text-[26px] font-black text-brand-primary mb-1">{value}</div>
                      <div className="text-xs font-medium text-slate-500">{label}</div>
                    </div>
                  </StaggerItem>
                ))}
              </Stagger>
            </div>
          </div>
        </AnimateIn>

        {/* Pillars — staggered */}
        <Stagger staggerDelay={0.12} className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {PILLARS.map(({ icon: Icon, title, description, iconBg, iconColor }) => (
            <StaggerItem key={title}>
              <div className="card-hover bg-white rounded-[16px] p-7 border border-slate-200 shadow-[0_4px_20px_rgba(15,23,42,0.06)] h-full">
                <div
                  className="w-12 h-12 rounded-[12px] flex items-center justify-center mb-5"
                  style={{ background: iconBg }}
                >
                  <Icon className="w-6 h-6" style={{ color: iconColor }} aria-hidden="true" />
                </div>
                <h3 className="font-bold text-brand-dark mb-2 text-[15px]">{title}</h3>
                <p className="text-[13px] text-slate-500 leading-[1.65]">{description}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
