'use client';

import { useRef } from 'react';
import { ShieldCheck, Truck, Users, Leaf } from 'lucide-react';
import { motion, useInView } from 'motion/react';

const REASONS = [
  { icon: ShieldCheck, title: 'Uncompromising Quality',  description: 'Every product is sourced and verified to meet international hygiene and safety standards. No shortcuts.',                                    iconBg: '#EFF6FF', iconColor: '#1E40AF', accent: '#1E40AF' },
  { icon: Truck,       title: 'Prompt Delivery',         description: 'We understand that your operations depend on timely supply. We deliver on schedule, every time.',                                          iconBg: '#F0F9FF', iconColor: '#0EA5E9', accent: '#0EA5E9' },
  { icon: Users,       title: 'B2B Expertise',           description: 'We work exclusively with businesses — hotels, hospitals, spas, and industries. We speak your language.',                                   iconBg: '#F5F3FF', iconColor: '#7C3AED', accent: '#7C3AED' },
  { icon: Leaf,        title: 'Eco-Conscious Options',   description: 'Biodegradable shower caps, jute products, and sustainable alternatives available across our range.',                                       iconBg: '#F0FDF4', iconColor: '#16A34A', accent: '#16A34A' },
] as const;

// Cards deal from 4 directions
const CARD_ORIGINS = [
  { x: -80, y: -40 },  // top-left
  { x: 80,  y: -40 },  // top-right
  { x: -80, y: 40  },  // bottom-left
  { x: 80,  y: 40  },  // bottom-right
];

export default function WhyUsSection() {
  const headingRef = useRef<HTMLDivElement>(null);
  const cardsRef   = useRef<HTMLDivElement>(null);

  const headingInView = useInView(headingRef, { once: true, margin: '-80px' });
  const cardsInView   = useInView(cardsRef,   { once: true, margin: '-60px' });

  return (
    <section id="why-us" aria-labelledby="why-us-heading" className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto">

        {/* Heading */}
        <div ref={headingRef} className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 30 }}
            animate={headingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="inline-block text-[11px] font-semibold tracking-[0.1em] uppercase text-brand-secondary mb-3"
          >
            Why Navodaya
          </motion.span>
          <motion.h2
            id="why-us-heading"
            initial={{ opacity: 0, y: 40, clipPath: 'inset(100% 0 0 0)' }}
            animate={headingInView ? { opacity: 1, y: 0, clipPath: 'inset(0% 0 0 0)' } : {}}
            transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
            className="font-display text-[clamp(1.75rem,3vw,2.5rem)] font-bold text-brand-dark mb-4"
          >
            Why Businesses Choose Us
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={headingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.25, ease: 'easeOut' }}
            className="text-[17px] text-slate-500 max-w-lg mx-auto"
          >
            We&apos;re not just a supplier — we&apos;re a partner committed to your operations.
          </motion.p>
        </div>

        {/* Cards — deal from 4 corners */}
        <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {REASONS.map(({ icon: Icon, title, description, iconBg, iconColor, accent }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, x: CARD_ORIGINS[i].x, y: CARD_ORIGINS[i].y, scale: 0.9 }}
              animate={cardsInView ? { opacity: 1, x: 0, y: 0, scale: 1 } : {}}
              transition={{ duration: 0.65, delay: i * 0.1, ease: 'easeOut' }}
            >
              <div className="card-hover-feature bg-surface-muted rounded-[16px] p-7 border border-slate-200 h-full">
                <div
                  className="w-12 h-12 rounded-[12px] flex items-center justify-center mb-5"
                  style={{ background: iconBg }}
                >
                  <Icon className="w-6 h-6" style={{ color: iconColor }} aria-hidden="true" />
                </div>

                {/* Accent bar — animates width on scroll */}
                <div className="w-full h-[3px] rounded-full mb-4 overflow-hidden bg-slate-100">
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={cardsInView ? { width: '100%' } : {}}
                    transition={{ duration: 0.8, delay: i * 0.1 + 0.3, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: accent }}
                  />
                </div>

                <h3 className="font-bold text-brand-dark mb-2 text-[15px]">{title}</h3>
                <p className="text-[13px] text-slate-500 leading-[1.65]">{description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
