import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';
import { BRAND, NAV_LINKS, ROUTES, PRODUCT_CATEGORIES } from '@/constants';

export default function Footer() {
  return (
    <footer className="bg-[--color-brand-dark] text-white">
      <div className="max-w-[80rem] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[--color-brand-primary] to-[--color-brand-secondary] flex items-center justify-center shrink-0">
                <span className="text-white font-black text-sm select-none">N</span>
              </div>
              <span className="font-bold text-white text-lg">{BRAND.NAME}</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              {BRAND.FULL_NAME}
            </p>
            <p className="text-slate-500 text-xs italic">
              &ldquo;{BRAND.TAGLINE}&rdquo;
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {NAV_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-slate-400 hover:text-[--color-brand-secondary] text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[--color-brand-secondary] rounded"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Product categories */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Products</h3>
            <ul className="space-y-2">
              {PRODUCT_CATEGORIES.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`${ROUTES.PRODUCTS}?category=${cat.slug}`}
                    className="text-slate-400 hover:text-[--color-brand-secondary] text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[--color-brand-secondary] rounded"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href={ROUTES.PRODUCTS}
                  className="text-[--color-brand-secondary] hover:text-white text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[--color-brand-secondary] rounded"
                >
                  View All Products →
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href={`mailto:${BRAND.EMAIL}`}
                  className="flex items-start gap-2.5 text-slate-400 hover:text-[--color-brand-secondary] text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[--color-brand-secondary] rounded"
                >
                  <Mail className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
                  {BRAND.EMAIL}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${BRAND.PHONE.replace(/\s/g, '')}`}
                  className="flex items-start gap-2.5 text-slate-400 hover:text-[--color-brand-secondary] text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[--color-brand-secondary] rounded"
                >
                  <Phone className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
                  {BRAND.PHONE}
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-slate-400 text-sm">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
                {BRAND.LOCATION}
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} {BRAND.FULL_NAME}. All rights reserved.</p>
          <a
            href={`https://${BRAND.WEBSITE}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-slate-300 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400 rounded"
          >
            {BRAND.WEBSITE}
          </a>
        </div>
      </div>
    </footer>
  );
}
