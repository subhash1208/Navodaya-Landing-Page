import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';
import { BRAND, NAV_LINKS, ROUTES, PRODUCT_CATEGORIES } from '@/constants';

export default function Footer() {
  return (
    <footer className="bg-brand-dark text-white">
      <div className="max-w-[72rem] mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1.5fr] gap-10 lg:gap-12">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center shrink-0">
                <span className="text-white font-black text-sm select-none">N</span>
              </div>
              <span className="font-bold text-lg text-white">{BRAND.NAME}</span>
            </div>
            <p className="text-slate-500 text-[13px] leading-[1.7] mb-3">
              {BRAND.FULL_NAME}
            </p>
            <p className="text-slate-600 text-xs italic">
              &ldquo;{BRAND.TAGLINE}&rdquo;
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-[11px] font-semibold text-white uppercase tracking-[0.08em] mb-4">Quick Links</h3>
            <ul className="flex flex-col gap-2.5">
              {NAV_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-slate-500 text-[13px] hover:text-white transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-secondary rounded"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-[11px] font-semibold text-white uppercase tracking-[0.08em] mb-4">Products</h3>
            <ul className="flex flex-col gap-2.5">
              {PRODUCT_CATEGORIES.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`${ROUTES.PRODUCTS}?category=${cat.slug}`}
                    className="text-slate-500 text-[13px] hover:text-white transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-secondary rounded"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href={ROUTES.PRODUCTS}
                  className="text-brand-secondary text-[13px] font-medium hover:text-white transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-secondary rounded"
                >
                  View All Products →
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-[11px] font-semibold text-white uppercase tracking-[0.08em] mb-4">Contact Us</h3>
            <ul className="flex flex-col gap-3">
              <li>
                <a
                  href={`mailto:${BRAND.EMAIL}`}
                  className="flex items-start gap-2.5 text-slate-500 text-[13px] hover:text-white transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-secondary rounded"
                >
                  <Mail className="w-3.5 h-3.5 mt-0.5 shrink-0" aria-hidden="true" />
                  {BRAND.EMAIL}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${BRAND.PHONE.replace(/\s/g, '')}`}
                  className="flex items-start gap-2.5 text-slate-500 text-[13px] hover:text-white transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-secondary rounded"
                >
                  <Phone className="w-3.5 h-3.5 mt-0.5 shrink-0" aria-hidden="true" />
                  {BRAND.PHONE}
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-slate-500 text-[13px]">
                <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" aria-hidden="true" />
                {BRAND.LOCATION}
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-600">&copy; {new Date().getFullYear()} {BRAND.FULL_NAME}. All rights reserved.</p>
          <a
            href={`https://${BRAND.WEBSITE}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-slate-600 hover:text-white transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-secondary rounded"
          >
            {BRAND.WEBSITE}
          </a>
        </div>
      </div>
    </footer>
  );
}
