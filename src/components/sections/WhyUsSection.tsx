import { ShieldCheck, Truck, Users, Leaf } from 'lucide-react';

const REASONS = [
  {
    icon: ShieldCheck,
    title: 'Uncompromising Quality',
    description: 'Every product is sourced and verified to meet international hygiene and safety standards. No shortcuts.',
    color: 'text-[--color-brand-primary]',
    bg: 'bg-[--color-brand-light]',
  },
  {
    icon: Truck,
    title: 'Prompt Delivery',
    description: 'We understand that your operations depend on timely supply. We deliver on schedule, every time.',
    color: 'text-[--color-brand-secondary]',
    bg: 'bg-sky-50',
  },
  {
    icon: Users,
    title: 'B2B Expertise',
    description: 'We work exclusively with businesses — hotels, hospitals, spas, and industries. We speak your language.',
    color: 'text-violet-600',
    bg: 'bg-violet-50',
  },
  {
    icon: Leaf,
    title: 'Eco-Conscious Options',
    description: 'Biodegradable shower caps, jute products, and sustainable alternatives available across our range.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
] as const;

export default function WhyUsSection() {
  return (
    <section
      id="why-us"
      aria-labelledby="why-us-heading"
      className="py-24 sm:py-32 bg-white"
    >
      <div className="max-w-[80rem] mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-16">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-[--color-brand-secondary] mb-3">
            Why Navodaya
          </span>
          <h2
            id="why-us-heading"
            className="text-[clamp(1.75rem,3vw,2.5rem)] font-bold text-[--color-brand-dark] mb-4"
          >
            Why Businesses Choose Us
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto text-lg">
            We&apos;re not just a supplier — we&apos;re a partner committed to your operations.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {REASONS.map(({ icon: Icon, title, description, color, bg }) => (
            <div
              key={title}
              className="group bg-[--color-surface-muted] rounded-[1.25rem] p-7 border border-slate-100 hover:bg-white hover:shadow-[0_20px_48px_-8px_rgba(15,23,42,0.12)] hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center mb-5`}>
                <Icon className={`w-6 h-6 ${color}`} aria-hidden="true" />
              </div>
              <h3 className="font-bold text-[--color-brand-dark] mb-2 text-sm">{title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
