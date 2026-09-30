'use client';

import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { ROUTES } from '@/constants';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ProductError({ error, reset }: ErrorProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        {/*
          `amber-400` is not a SEALED palette token (tailwind.config.ts has no amber/warning
          scale) and the element is `aria-hidden`, purely decorative. `grey-400` matches the
          muted-decorative-icon convention already used for the Search/X icons in
          ProductGrid.tsx and clears the 3:1 WCAG 1.4.11 non-text floor on paper (3.28:1).
        */}
        <AlertTriangle className="w-12 h-12 text-grey-400 mx-auto mb-4" aria-hidden="true" />
        <h2 className="text-xl font-bold text-brand-blue mb-2">Failed to load product</h2>
        <p className="text-sm text-grey-500 mb-6">
          {error.message || 'This product could not be loaded. Please try again.'}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-5 py-2.5 bg-brand-blue text-paper text-sm font-semibold hover:bg-brand-blue/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
            data-cursor-invert
          >
            Try again
          </button>
          <Link
            href={ROUTES.PRODUCTS}
            className="px-5 py-2.5 border-2 border-grey-200 text-grey-600 text-sm font-semibold hover:border-ink hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
          >
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
}
