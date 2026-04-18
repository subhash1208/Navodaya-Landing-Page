import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';
import { PRODUCT_CATEGORIES, ROUTES } from '@/constants';

export default function ProductCategoriesSection() {
  return (
    <section id="products" aria-labelledby="products-heading" style={{ padding: '96px 0', background: '#F8FAFC' }}>
      <div style={{ maxWidth: '1152px', margin: '0 auto', padding: '0 32px' }}>

        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <span style={{ display: 'inline-block', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#0EA5E9', marginBottom: '12px' }}>
            What We Supply
          </span>
          <h2 id="products-heading" style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 700, color: '#0F172A', marginBottom: '16px' }}>
            Our Product Categories
          </h2>
          <p style={{ fontSize: '17px', color: '#64748B', maxWidth: '480px', margin: '0 auto' }}>
            Three focused ranges covering every hygiene and care need across industries.
          </p>
        </div>

        {/* Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' }}>
          {PRODUCT_CATEGORIES.map((category) => (
            <div
              key={category.id}
              style={{ position: 'relative', display: 'flex', flexDirection: 'column', background: '#FFFFFF', borderRadius: '20px', padding: '32px', border: '1px solid #E2E8F0', boxShadow: '0 4px 24px rgba(15,23,42,0.07)', overflow: 'hidden', transition: 'transform 0.25s, box-shadow 0.25s' }}
            >
              {/* Top gradient accent */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #1E40AF, #0EA5E9)' }} aria-hidden="true" />

              {/* Icon */}
              <div style={{ fontSize: '48px', marginBottom: '24px', lineHeight: 1 }} role="img" aria-label={category.name}>
                {category.icon}
              </div>

              {/* Name + badge */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '12px' }}>
                <h3 style={{ fontWeight: 700, fontSize: '17px', color: '#0F172A', lineHeight: 1.3 }}>
                  {category.name}
                </h3>
                <span style={{ flexShrink: 0, fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '9999px', background: '#EFF6FF', color: '#1E40AF' }}>
                  {category.productCount} products
                </span>
              </div>

              <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.65, marginBottom: '28px', flex: 1 }}>
                {category.description}
              </p>

              <Link
                href={`${ROUTES.PRODUCTS}?category=${category.slug}`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#1E40AF', textDecoration: 'none' }}
              >
                Browse Products
                <ArrowRight style={{ width: '14px', height: '14px' }} aria-hidden="true" />
              </Link>
            </div>
          ))}
        </div>

        {/* View full catalogue */}
        <div style={{ textAlign: 'center' }}>
          <Link
            href={ROUTES.PRODUCTS}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '14px 32px', borderRadius: '9999px', fontWeight: 600, fontSize: '14px', color: '#1E40AF', border: '2px solid #1E40AF', background: 'transparent', textDecoration: 'none', transition: 'all 0.2s', minHeight: '48px' }}
          >
            <BookOpen style={{ width: '16px', height: '16px' }} aria-hidden="true" />
            View Full Product Catalogue
          </Link>
        </div>
      </div>
    </section>
  );
}
