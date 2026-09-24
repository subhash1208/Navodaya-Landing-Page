import Link from 'next/link';
import { ROUTES } from '@/constants';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-black text-grey-100 mb-4 select-none">404</div>
        <h1 className="text-2xl font-bold text-ink mb-3">Page Not Found</h1>
        <p className="text-grey-500 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={ROUTES.HOME}
            className="px-6 py-3 rounded-xl bg-ink text-white font-semibold text-sm hover:bg-ink/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
          >
            Go Home
          </Link>
          <Link
            href={ROUTES.PRODUCTS}
            className="px-6 py-3 rounded-xl border-2 border-grey-200 text-grey-600 font-semibold text-sm hover:border-ink hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
          >
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
}
