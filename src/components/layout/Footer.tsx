import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';
import { BRAND, NAV_LINKS, ROUTES, PRODUCT_CATEGORIES } from '@/constants';

export default function Footer() {
  return (
    <footer style={{ background: '#0F172A', color: '#FFFFFF' }}>
      <div style={{ maxWidth: '1152px', margin: '0 auto', padding: '64px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.5fr', gap: '48px' }}>

          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #1E40AF, #0EA5E9)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ color: '#FFFFFF', fontWeight: 900, fontSize: '14px', userSelect: 'none' }}>N</span>
              </div>
              <span style={{ fontWeight: 700, fontSize: '18px', color: '#FFFFFF' }}>{BRAND.NAME}</span>
            </div>
            <p style={{ color: '#64748B', fontSize: '13px', lineHeight: 1.7, marginBottom: '12px' }}>
              {BRAND.FULL_NAME}
            </p>
            <p style={{ color: '#475569', fontSize: '12px', fontStyle: 'italic' }}>
              &ldquo;{BRAND.TAGLINE}&rdquo;
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 style={{ fontSize: '11px', fontWeight: 600, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>Quick Links</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {NAV_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} style={{ color: '#64748B', fontSize: '13px', textDecoration: 'none', transition: 'color 0.15s' }}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Products */}
          <div>
            <h3 style={{ fontSize: '11px', fontWeight: 600, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>Products</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {PRODUCT_CATEGORIES.map((cat) => (
                <li key={cat.id}>
                  <Link href={`${ROUTES.PRODUCTS}?category=${cat.slug}`} style={{ color: '#64748B', fontSize: '13px', textDecoration: 'none', transition: 'color 0.15s' }}>
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href={ROUTES.PRODUCTS} style={{ color: '#38BDF8', fontSize: '13px', fontWeight: 500, textDecoration: 'none' }}>
                  View All Products →
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 style={{ fontSize: '11px', fontWeight: 600, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>Contact Us</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li>
                <a href={`mailto:${BRAND.EMAIL}`} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', color: '#64748B', fontSize: '13px', textDecoration: 'none' }}>
                  <Mail style={{ width: '14px', height: '14px', marginTop: '2px', flexShrink: 0 }} aria-hidden="true" />
                  {BRAND.EMAIL}
                </a>
              </li>
              <li>
                <a href={`tel:${BRAND.PHONE.replace(/\s/g, '')}`} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', color: '#64748B', fontSize: '13px', textDecoration: 'none' }}>
                  <Phone style={{ width: '14px', height: '14px', marginTop: '2px', flexShrink: 0 }} aria-hidden="true" />
                  {BRAND.PHONE}
                </a>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', color: '#64748B', fontSize: '13px' }}>
                <MapPin style={{ width: '14px', height: '14px', marginTop: '2px', flexShrink: 0 }} aria-hidden="true" />
                {BRAND.LOCATION}
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: '1px solid #1E293B', marginTop: '48px', paddingTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <p style={{ fontSize: '12px', color: '#475569' }}>&copy; {new Date().getFullYear()} {BRAND.FULL_NAME}. All rights reserved.</p>
          <a href={`https://${BRAND.WEBSITE}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: '#475569', textDecoration: 'none' }}>
            {BRAND.WEBSITE}
          </a>
        </div>
      </div>
    </footer>
  );
}
