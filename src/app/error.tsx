'use client';

import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RootError({ error, reset }: ErrorProps) {
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
        <h2 className="text-xl font-bold text-brand-blue mb-2">Something went wrong</h2>
        <p className="text-sm text-grey-500 mb-6">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>
        {error.digest ? (
          // grey-400 (#8E897C) on paper (#FAF8F2) is 3.28:1 at text-xs (12px) normal weight,
          // below the 4.5:1 WCAG 1.4.3 threshold. grey-600 (#524E46) is 7.79:1 on the same
          // ground (documented in tailwind.config.ts), clearing it comfortably.
          <p className="font-mono text-xs text-grey-600 mb-6">Reference: {error.digest}</p>
        ) : null}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-5 py-2.5 bg-brand-blue text-paper text-sm font-semibold hover:bg-brand-blue/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
            data-cursor-invert
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-5 py-2.5 border-2 border-grey-200 text-grey-600 text-sm font-semibold hover:border-ink hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
