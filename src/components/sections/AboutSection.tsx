import { Award, Globe, Handshake } from 'lucide-react';
import { BRAND } from '@/constants';

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
    <section id="about" aria-labelledby="about-heading" style={{ padding: '96px 0', background: '#FFFFFF' }}>
      <div style={{ maxWidth: '1152px', margin: '0 auto', padding: '0 32px' }}>

        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <span style={{ display: 'inline-block', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#0EA5E9', marginBottom: '12px' }}>
            Who We Are
          </span>
          <h2 id="about-heading" style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 700, color: '#0F172A', marginBottom: '16px' }}>
            About {BRAND.NAME}
          </h2>
          <p style={{ fontSize: '17px', color: '#64748B', maxWidth: '560px', margin: '0 auto', lineHeight: 1.7 }}>
            {BRAND.MISSION}
          </p>
        </div>

        {/* Main card */}
        <div style={{ borderRadius: '20px', padding: '48px', marginBottom: '32px', background: 'linear-gradient(135deg, #EFF6FF 0%, #F8FAFC 100%)', border: '1px solid #DBEAFE' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', marginBottom: '16px' }}>
                {BRAND.TAGLINE}
              </h3>
              <p style={{ color: '#475569', lineHeight: 1.75, marginBottom: '16px' }}>
                Based in {BRAND.LOCATION}, we are a dedicated supplier of disposable hygiene &amp; safety products,
                hotel room slippers, guest amenities, and spa &amp; salon essentials — serving the hospitality
                and wellness sectors with reliability and care.
              </p>
              <p style={{ color: '#475569', lineHeight: 1.75 }}>
                Our approach is simple: understand what businesses need, source the best products,
                and deliver them promptly. Every order is backed by our commitment to quality and customer satisfaction.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {STATS.map(({ value, label }) => (
                <div key={label} style={{ background: '#FFFFFF', borderRadius: '14px', padding: '20px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(15,23,42,0.06)' }}>
                  <div style={{ fontSize: '26px', fontWeight: 900, color: '#1E40AF', marginBottom: '4px' }}>{value}</div>
                  <div style={{ fontSize: '12px', fontWeight: 500, color: '#64748B' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pillars */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          {PILLARS.map(({ icon: Icon, title, description, iconBg, iconColor }) => (
            <div key={title} style={{ background: '#FFFFFF', borderRadius: '16px', padding: '28px', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(15,23,42,0.06)', transition: 'transform 0.2s, box-shadow 0.2s' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <Icon style={{ width: '24px', height: '24px', color: iconColor }} aria-hidden="true" />
              </div>
              <h3 style={{ fontWeight: 700, color: '#0F172A', marginBottom: '8px', fontSize: '15px' }}>{title}</h3>
              <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.65 }}>{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
