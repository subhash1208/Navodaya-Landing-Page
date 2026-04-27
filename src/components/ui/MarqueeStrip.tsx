const ITEMS = [
  '51+ Products',
  '3 Categories',
  'B2B Focused',
  'Gandhi Nagar, Hyderabad',
  'Hotels',
  'Hospitals',
  'Spas',
  'Salons',
  'Industries',
  'Corporate Offices',
];

// Render 4 copies — 2 visible + 2 for seamless loop
const QUAD = [...ITEMS, ...ITEMS, ...ITEMS, ...ITEMS];

export function MarqueeStrip() {
  return (
    <div
      className="relative overflow-hidden bg-brand-dark py-4 border-y border-white/5"
      aria-hidden="true"
    >
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to right, #0F172A, transparent)' }} />
      <div className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to left, #0F172A, transparent)' }} />

      {/* Two tracks side by side, both animating — creates seamless infinite loop */}
      <div className="flex whitespace-nowrap">
        <div className="marquee-track-a flex items-center shrink-0">
          {[...ITEMS, ...ITEMS].map((item, i) => (
            <span key={i} className="inline-flex items-center gap-3 px-6">
              <span className="text-sm font-semibold text-white/70 tracking-wide uppercase">
                {item}
              </span>
              <span className="w-1 h-1 rounded-full bg-brand-secondary/60 shrink-0" />
            </span>
          ))}
        </div>
        <div className="marquee-track-a flex items-center shrink-0" aria-hidden="true">
          {[...ITEMS, ...ITEMS].map((item, i) => (
            <span key={i} className="inline-flex items-center gap-3 px-6">
              <span className="text-sm font-semibold text-white/70 tracking-wide uppercase">
                {item}
              </span>
              <span className="w-1 h-1 rounded-full bg-brand-secondary/60 shrink-0" />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
