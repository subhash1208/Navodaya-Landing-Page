import Link from 'next/link';
import { ROUTES } from '@/constants';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-black text-brand-primary/10 mb-4 select-none">404</div>
        <h1 className="text-2xl font-bold text-brand-dark mb-3">Page Not Found</h1>
        <p className="text-slate-500 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={ROUTES.HOME}
            className="px-6 py-3 rounded-xl bg-brand-primary text-white font-semibold text-sm hover:bg-brand-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
          >
            Go Home
          </Link>
          <Link
            href={ROUTES.PRODUCTS}
            className="px-6 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold text-sm hover:border-brand-primary hover:text-brand-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
}
