import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';
import { BRAND, NAV_LINKS, ROUTES, PRODUCT_CATEGORIES } from '@/constants';

export default function Footer() {
  return (
    <footer className="bg-ink text-white">
      <div className="container mx-auto py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-paper flex items-center justify-center shrink-0">
                <span className="text-ink font-black text-sm select-none">N</span>
              </div>
              <span className="font-bold text-lg text-white">{BRAND.NAME}</span>
            </div>
            <p className="text-grey-400 text-[13px] leading-[1.7] mb-3">{BRAND.FULL_NAME}</p>
            <p className="text-grey-400 text-xs italic">&ldquo;{BRAND.TAGLINE}&rdquo;</p>
          </div>

          {/*
            Quick links
            Every link below grows its tap target via `relative` + an invisible, out-of-flow
            `::before` — the visible text, colour and spacing are untouched. The vertical inset
            is capped at half the smallest stacked gap in this footer (`gap-2.5` = 10px, so
            -5px each side) so that adjacent links' invisible hit areas meet at the midpoint of
            the gap rather than overlapping into each other's click area. Horizontal inset can
            stay generous (-14px) because the nearest neighbour in that direction is a whole
            grid column away (`gap-10`/`gap-12`).
          */}
          <div>
            <h3 className="text-[11px] font-semibold text-white uppercase tracking-[0.08em] mb-4">
              Quick Links
            </h3>
            <ul className="flex flex-col gap-2.5">
              {NAV_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="relative text-grey-400 text-[13px] hover:text-paper transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-cyan rounded before:absolute before:inset-x-[-14px] before:inset-y-[-5px] before:content-['']"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-[11px] font-semibold text-white uppercase tracking-[0.08em] mb-4">
              Products
            </h3>
            <ul className="flex flex-col gap-2.5">
              {PRODUCT_CATEGORIES.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`${ROUTES.PRODUCTS}?category=${cat.slug}`}
                    className="relative text-grey-400 text-[13px] hover:text-paper transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-cyan rounded before:absolute before:inset-x-[-14px] before:inset-y-[-5px] before:content-['']"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href={ROUTES.PRODUCTS}
                  className="relative text-brand-cyan text-[13px] font-medium hover:text-paper transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-cyan rounded before:absolute before:inset-x-[-14px] before:inset-y-[-5px] before:content-['']"
                >
                  View All Products →
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-[11px] font-semibold text-white uppercase tracking-[0.08em] mb-4">
              Contact Us
            </h3>
            <ul className="flex flex-col gap-3">
              <li>
                <a
                  href={`mailto:${BRAND.EMAIL}`}
                  className="relative flex items-start gap-2.5 text-grey-400 text-[13px] hover:text-paper transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-cyan rounded before:absolute before:inset-x-[-14px] before:inset-y-[-5px] before:content-['']"
                >
                  <Mail className="w-3.5 h-3.5 mt-0.5 shrink-0" aria-hidden="true" />
                  {BRAND.EMAIL}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${BRAND.PHONE.replace(/\s/g, '')}`}
                  className="relative flex items-start gap-2.5 text-grey-400 text-[13px] hover:text-paper transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-cyan rounded before:absolute before:inset-x-[-14px] before:inset-y-[-5px] before:content-['']"
                >
                  <Phone className="w-3.5 h-3.5 mt-0.5 shrink-0" aria-hidden="true" />
                  {BRAND.PHONE}
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-grey-400 text-[13px]">
                <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" aria-hidden="true" />
                {BRAND.LOCATION}
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-grey-800 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-grey-400">
            &copy; {new Date().getFullYear()} {BRAND.FULL_NAME}. All rights reserved.
          </p>
          <a
            href={`https://${BRAND.WEBSITE}`}
            target="_blank"
            rel="noopener noreferrer"
            className="relative text-xs text-grey-400 hover:text-paper transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-cyan rounded before:absolute before:inset-x-[-14px] before:inset-y-[-5px] before:content-['']"
          >
            {BRAND.WEBSITE}
          </a>
        </div>
      </div>
    </footer>
  );
}
