import { ShieldCheck, Truck, Users, Leaf } from 'lucide-react';
import { AnimateIn, Stagger, StaggerItem } from '@/components/ui/AnimateIn';

const REASONS = [
  { icon: ShieldCheck, title: 'Uncompromising Quality',  description: 'Every product is sourced and verified to meet international hygiene and safety standards. No shortcuts.',                                    iconBg: '#EFF6FF', iconColor: '#1E40AF', accent: '#1E40AF' },
  { icon: Truck,       title: 'Prompt Delivery',         description: 'We understand that your operations depend on timely supply. We deliver on schedule, every time.',                                          iconBg: '#F0F9FF', iconColor: '#0EA5E9', accent: '#0EA5E9' },
  { icon: Users,       title: 'B2B Expertise',           description: 'We work exclusively with businesses — hotels, hospitals, spas, and industries. We speak your language.',                                   iconBg: '#F5F3FF', iconColor: '#7C3AED', accent: '#7C3AED' },
  { icon: Leaf,        title: 'Eco-Conscious Options',   description: 'Biodegradable shower caps, jute products, and sustainable alternatives available across our range.',                                       iconBg: '#F0FDF4', iconColor: '#16A34A', accent: '#16A34A' },
] as const;

export default function WhyUsSection() {
  return (
    <section id="why-us" aria-labelledby="why-us-heading" className="py-24 bg-white">
      <div className="container mx-auto">

        <AnimateIn direction="up">
          <div className="text-center mb-16">
            <span className="inline-block text-[11px] font-semibold tracking-[0.1em] uppercase text-brand-secondary mb-3">
              Why Navodaya
            </span>
            <h2 id="why-us-heading" className="font-display text-[clamp(1.75rem,3vw,2.5rem)] font-bold text-brand-dark mb-4">
              Why Businesses Choose Us
            </h2>
            <p className="text-[17px] text-slate-500 max-w-lg mx-auto">
              We&apos;re not just a supplier — we&apos;re a partner committed to your operations.
            </p>
          </div>
        </AnimateIn>

        <Stagger staggerDelay={0.1} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {REASONS.map(({ icon: Icon, title, description, iconBg, iconColor, accent }) => (
            <StaggerItem key={title}>
              <div className="card-hover-feature bg-surface-muted rounded-[16px] p-7 border border-slate-200 h-full">
                <div
                  className="w-12 h-12 rounded-[12px] flex items-center justify-center mb-5"
                  style={{ background: iconBg }}
                >
                  <Icon className="w-6 h-6" style={{ color: iconColor }} aria-hidden="true" />
                </div>
                <div className="w-6 h-[3px] rounded-full mb-4" style={{ background: accent }} />
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
