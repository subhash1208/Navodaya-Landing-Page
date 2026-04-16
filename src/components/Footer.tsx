import { Mail, Phone, MapPin, Handshake } from 'lucide-react';
import { BRAND, NAV_LINKS } from '../constants';

const Footer: React.FC = () => (
  <footer className="w-full bg-brand-dark text-white py-10">
    <div className="max-w-content mx-auto px-6">
      <div className="flex flex-col md:flex-row gap-8 items-start">

        {/* Trust icon */}
        <div className="flex items-center justify-center md:justify-start mt-2 shrink-0">
          <Handshake className="w-16 h-16 text-brand-secondary animate-float" strokeWidth={1.5} aria-hidden="true" />
        </div>

        {/* Grid */}
        <div className="flex-1 grid sm:grid-cols-3 gap-6">

          {/* Brand */}
          <div>
            <h2 className="text-lg font-bold mb-1">{BRAND.NAME}</h2>
            <p className="text-slate-300 text-caption">{BRAND.FULL_NAME}</p>
            <p className="text-slate-400 text-xs mt-2 italic">"{BRAND.TAGLINE}"</p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-base font-semibold mb-3">Contact Us</h3>
            <ul className="space-y-2 text-caption text-slate-300">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0" aria-hidden="true" />
                <a href={`mailto:${BRAND.EMAIL}`} className="hover:text-brand-secondary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-secondary rounded">
                  {BRAND.EMAIL}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{BRAND.PHONE}</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{BRAND.LOCATION}</span>
              </li>
            </ul>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-base font-semibold mb-3">Quick Links</h3>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-caption">
              {NAV_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <a
                    href={href}
                    className="text-slate-300 hover:text-brand-secondary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-secondary rounded"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-700 mt-8 pt-4 text-center text-slate-400 text-xs">
        <p>&copy; {new Date().getFullYear()} {BRAND.FULL_NAME}. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
