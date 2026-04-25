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
    <section id="why-us" aria-labelledby="why-us-heading" style={{ padding: '96px 0', background: '#FFFFFF' }}>
      <div style={{ maxWidth: '1152px', margin: '0 auto', padding: '0 32px' }}>

        <AnimateIn direction="up">
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <span style={{ display: 'inline-block', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#0EA5E9', marginBottom: '12px' }}>
              Why Navodaya
            </span>
            <h2 id="why-us-heading" className="font-display" style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 700, color: '#0F172A', marginBottom: '16px' }}>
              Why Businesses Choose Us
            </h2>
            <p style={{ fontSize: '17px', color: '#64748B', maxWidth: '480px', margin: '0 auto' }}>
              We&apos;re not just a supplier — we&apos;re a partner committed to your operations.
            </p>
          </div>
        </AnimateIn>

        <Stagger staggerDelay={0.1} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
          {REASONS.map(({ icon: Icon, title, description, iconBg, iconColor, accent }) => (
            <StaggerItem key={title}>
              <div className="card-hover-feature" style={{ background: '#F8FAFC', borderRadius: '16px', padding: '28px', border: '1px solid #E2E8F0', height: '100%' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                  <Icon style={{ width: '24px', height: '24px', color: iconColor }} aria-hidden="true" />
                </div>
                <div style={{ width: '24px', height: '3px', borderRadius: '9999px', background: accent, marginBottom: '16px' }} />
                <h3 style={{ fontWeight: 700, color: '#0F172A', marginBottom: '8px', fontSize: '15px' }}>{title}</h3>
                <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.65 }}>{description}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
