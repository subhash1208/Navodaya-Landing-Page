import Link from 'next/link';
import { ROUTES } from '@/constants';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/*
          Decorative, so `aria-hidden` — the `<h1>` and the paragraph below carry the message,
          and this matches how every other decorative numeral here is marked (AboutSection.tsx:217,
          WhyUsSection.tsx:187, ProductCard.tsx:45). `aria-hidden` alone does NOT discharge WCAG
          1.4.3 though: axe's `color-contrast` rule keys on visible-on-screen, not exposed-to-AT,
          and measured red on this node with `aria-hidden` present. `grey-100` on `paper` was
          1.17:1; `grey-400 #8A8A83` on `paper #FAFAF8` is 3.32:1, which clears the 3:1 bar this
          text qualifies for at 96px (`text-8xl`, far above axe's 24px large-text threshold).
        */}
        <div className="text-8xl font-black text-grey-400 mb-4 select-none" aria-hidden="true">
          404
        </div>
        <h1 className="text-2xl font-bold text-ink mb-3">Page Not Found</h1>
        <p className="text-grey-500 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={ROUTES.HOME}
            className="px-6 py-3 bg-ink text-white font-semibold text-sm hover:bg-ink/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
          >
            Go Home
          </Link>
          <Link
            href={ROUTES.PRODUCTS}
            className="px-6 py-3 border-2 border-grey-200 text-grey-600 font-semibold text-sm hover:border-ink hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
          >
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
}
