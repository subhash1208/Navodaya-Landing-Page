import { PRODUCTS, PRODUCT_CATEGORIES } from '@/constants';

const ITEMS = [
  `${PRODUCTS.length}+ Products`,
  `${PRODUCT_CATEGORIES.length} Categories`,
  'B2B Focused',
  'Hyderabad',
  'Hotels',
  'Hospitals',
  'Spas',
  'Salons',
  'Educational Institutions',
  'Industries',
  'Corporate Offices',
];

export function MarqueeStrip() {
  return (
    <div
      className="relative overflow-hidden bg-brand-blue py-4 border-y border-paper/20"
      aria-hidden="true"
    >
      {/* Fade edges */}
      <div
        className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to right, #00559A, transparent)' }}
      />
      <div
        className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to left, #00559A, transparent)' }}
      />

      {/* Two tracks side by side, both animating — creates seamless infinite loop */}
      <div className="flex whitespace-nowrap">
        <div className="marquee-track-a flex items-center shrink-0">
          {[...ITEMS, ...ITEMS].map((item, i) => (
            <span key={i} className="inline-flex items-center gap-3 px-6">
              <span className="text-sm font-semibold text-paper tracking-wide uppercase">
                {item}
              </span>
              <span className="w-1 h-1 rounded-full bg-brand-cyan/60 shrink-0" />
            </span>
          ))}
        </div>
        <div className="marquee-track-a flex items-center shrink-0" aria-hidden="true">
          {[...ITEMS, ...ITEMS].map((item, i) => (
            <span key={i} className="inline-flex items-center gap-3 px-6">
              <span className="text-sm font-semibold text-paper tracking-wide uppercase">
                {item}
              </span>
              <span className="w-1 h-1 rounded-full bg-brand-cyan/60 shrink-0" />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
