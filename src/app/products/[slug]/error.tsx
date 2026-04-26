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
        <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" aria-hidden="true" />
        <h2 className="text-xl font-bold text-brand-dark mb-2">Failed to load product</h2>
        <p className="text-sm text-slate-500 mb-6">
          {error.message || 'This product could not be loaded. Please try again.'}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-5 py-2.5 rounded-xl bg-brand-primary text-white text-sm font-semibold hover:bg-brand-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
          >
            Try again
          </button>
          <Link
            href={ROUTES.PRODUCTS}
            className="px-5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 text-sm font-semibold hover:border-brand-primary hover:text-brand-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
}
