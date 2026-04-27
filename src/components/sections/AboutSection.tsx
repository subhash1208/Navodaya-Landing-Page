'use client';

import { useRef } from 'react';
import { Award, Globe, Handshake } from 'lucide-react';
import { motion, useInView } from 'motion/react';
import { BRAND } from '@/constants';
import { CounterStat } from '@/components/ui/CounterStat';

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

// Heading reveal — text clips up like a curtain lifting
const headingVariants = {
  hidden: { opacity: 0, y: 60, clipPath: 'inset(100% 0 0 0)' },
  visible: { opacity: 1, y: 0, clipPath: 'inset(0% 0 0 0)' },
};

// Card flip-in from below
const flipVariants = {
  hidden: { opacity: 0, rotateX: 25, y: 40 },
  visible: (i: number) => ({
    opacity: 1, rotateX: 0, y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: 'easeOut' as const },
  }),
};

export default function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const cardRef    = useRef<HTMLDivElement>(null);
  const pillarsRef = useRef<HTMLDivElement>(null);

  const headingInView = useInView(headingRef, { once: true, margin: '-80px' });
  const cardInView    = useInView(cardRef,    { once: true, margin: '-60px' });
  const pillarsInView = useInView(pillarsRef, { once: true, margin: '-60px' });

  return (
    <section ref={sectionRef} id="about" aria-labelledby="about-heading" className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto">

        {/* Heading — curtain lift reveal */}
        <div ref={headingRef} className="text-center mb-16">
          <motion.span
            variants={headingVariants}
            initial="hidden"
            animate={headingInView ? 'visible' : 'hidden'}
            className="inline-block text-[11px] font-semibold tracking-[0.1em] uppercase text-brand-secondary mb-3"
          >
            Who We Are
          </motion.span>
          <motion.h2
            id="about-heading"
            variants={headingVariants}
            initial="hidden"
            animate={headingInView ? 'visible' : 'hidden'}
            transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
            className="font-display text-[clamp(1.75rem,3vw,2.5rem)] font-bold text-brand-dark mb-4"
          >
            About {BRAND.NAME}
          </motion.h2>
          <motion.p
            variants={headingVariants}
            initial="hidden"
            animate={headingInView ? 'visible' : 'hidden'}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            className="text-[17px] text-slate-500 max-w-xl mx-auto leading-[1.7]"
          >
            {BRAND.MISSION}
          </motion.p>
        </div>

        {/* Main card — split reveal: text from left, stats from right */}
        <div ref={cardRef} className="rounded-[20px] p-8 md:p-12 mb-8 bg-gradient-to-br from-brand-light to-surface-muted border border-blue-100 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              animate={cardInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            >
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
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 60 }}
              animate={cardInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
              className="grid grid-cols-2 gap-4"
            >
              {STATS.map(({ value, label }) => (
                <CounterStat key={label} value={value} label={label} />
              ))}
            </motion.div>
          </div>
        </div>

        {/* Pillars — flip in from below, staggered */}
        <div ref={pillarsRef} className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {PILLARS.map(({ icon: Icon, title, description, iconBg, iconColor }, i) => (
            <motion.div
              key={title}
              custom={i}
              variants={flipVariants}
              initial="hidden"
              animate={pillarsInView ? 'visible' : 'hidden'}
            >
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
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
