'use client';

import { useState, useCallback } from 'react';
import { Send, CheckCircle, AlertCircle, Package, Users, Mail, Phone, MessageSquare, User, Briefcase } from 'lucide-react';
import { BRAND, PRODUCT_CATEGORIES, PRODUCTS } from '@/constants';
import { submitContactForm } from '@/app/actions/contact';
import type { ContactFormData } from '@/types';

const EMPTY: ContactFormData = {
  productName: '', quantity: '', companyName: '', companyEmail: '',
  contactPersonName: '', contactPersonDesignation: '', contactPersonNumber: '', message: '',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 16px',
  borderRadius: '10px',
  background: '#F8FAFC',
  border: '1.5px solid #E2E8F0',
  fontSize: '14px',
  color: '#0F172A',
  outline: 'none',
  transition: 'border-color 0.15s, box-shadow 0.15s',
  minHeight: '44px',
};

interface FieldProps { label: string; icon?: React.ReactNode; children: React.ReactNode; }
function Field({ label, icon, children }: FieldProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {icon && <span aria-hidden="true">{icon}</span>}
        {label}
      </label>
      {children}
    </div>
  );
}

export default function ContactSection() {
  const [form, setForm] = useState<ContactFormData>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  }, [error]);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const result = await submitContactForm(form);
    if (result.success) {
      setSubmitted(true);
      setForm(EMPTY);
      setTimeout(() => setSubmitted(false), 8000);
    } else {
      setError(result.error ?? 'Something went wrong. Please try again.');
    }
    setSubmitting(false);
  }, [form]);

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      style={{ padding: '96px 0', background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)' }}
    >
      <div style={{ maxWidth: '1152px', margin: '0 auto', padding: '0 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'start' }}>

          {/* Left — info */}
          <div style={{ color: '#FFFFFF' }}>
            <span style={{ display: 'inline-block', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#38BDF8', marginBottom: '12px' }}>
              Get in Touch
            </span>
            <h2
              id="contact-heading"
              style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 700, marginBottom: '16px', lineHeight: 1.2 }}
            >
              Request a Quote
            </h2>
            <p style={{ color: '#94A3B8', fontSize: '17px', lineHeight: 1.7, marginBottom: '40px' }}>
              Tell us what you need and we&apos;ll get back to you with pricing and availability.
              We work with hotels, hospitals, spas, salons, and industries across India.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { icon: Mail, label: 'Email', value: BRAND.EMAIL, href: `mailto:${BRAND.EMAIL}` },
                { icon: Phone, label: 'Phone', value: BRAND.PHONE, href: `tel:${BRAND.PHONE.replace(/\s/g, '')}` },
              ].map(({ icon: Icon, label, value, href }) => (
                <a
                  key={label}
                  href={href}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#94A3B8', textDecoration: 'none', transition: 'color 0.15s' }}
                >
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon style={{ width: '18px', height: '18px' }} aria-hidden="true" />
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>{label}</div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#E2E8F0' }}>{value}</div>
                  </div>
                </a>
              ))}
            </div>

            {/* Trust note */}
            <div style={{ marginTop: '48px', padding: '20px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.6 }}>
                📍 Gandhi Nagar, Hyderabad · Serving hotels, hospitals, spas &amp; industries across India
              </p>
            </div>
          </div>

          {/* Right — form */}
          <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '36px', boxShadow: '0 24px 64px rgba(0,0,0,0.35)' }}>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }} role="alert" aria-live="polite">
                <CheckCircle style={{ width: '56px', height: '56px', color: '#10B981', margin: '0 auto 16px' }} aria-hidden="true" />
                <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>Thank You!</h3>
                <p style={{ fontSize: '14px', color: '#64748B' }}>
                  Your enquiry has been sent to <strong style={{ color: '#1E40AF' }}>{BRAND.EMAIL}</strong>. We&apos;ll be in touch shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>Send an Enquiry</h3>

                {error && (
                  <div role="alert" aria-live="assertive" style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', fontSize: '13px', borderRadius: '10px', padding: '12px 14px' }}>
                    <AlertCircle style={{ width: '16px', height: '16px', marginTop: '1px', flexShrink: 0 }} aria-hidden="true" />
                    {error}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <Field label="Product" icon={<Package style={{ width: '12px', height: '12px' }} />}>
                    <select id="productName" name="productName" value={form.productName} onChange={handleChange} required style={inputStyle}>
                      <option value="">Select a product</option>
                      {PRODUCT_CATEGORIES.map(cat => (
                        <optgroup key={cat.id} label={cat.name}>
                          {PRODUCTS.filter(p => p.category.id === cat.id).map(p => (
                            <option key={p.id} value={p.name}>{p.name}</option>
                          ))}
                        </optgroup>
                      ))}
                      <option value="Other">Other</option>
                    </select>
                  </Field>
                  <Field label="Quantity">
                    <input type="text" id="quantity" name="quantity" value={form.quantity} onChange={handleChange} required placeholder="e.g. 1000 pieces" style={inputStyle} />
                  </Field>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <Field label="Company" icon={<Users style={{ width: '12px', height: '12px' }} />}>
                    <input type="text" id="companyName" name="companyName" value={form.companyName} onChange={handleChange} required placeholder="Company name" style={inputStyle} />
                  </Field>
                  <Field label="Email" icon={<Mail style={{ width: '12px', height: '12px' }} />}>
                    <input type="email" id="companyEmail" name="companyEmail" value={form.companyEmail} onChange={handleChange} required placeholder="company@example.com" style={inputStyle} />
                  </Field>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <Field label="Contact Person" icon={<User style={{ width: '12px', height: '12px' }} />}>
                    <input type="text" id="contactPersonName" name="contactPersonName" value={form.contactPersonName} onChange={handleChange} required placeholder="Full name" style={inputStyle} />
                  </Field>
                  <Field label="Designation" icon={<Briefcase style={{ width: '12px', height: '12px' }} />}>
                    <input type="text" id="contactPersonDesignation" name="contactPersonDesignation" value={form.contactPersonDesignation} onChange={handleChange} placeholder="e.g. Manager" style={inputStyle} />
                  </Field>
                </div>

                <Field label="Phone" icon={<Phone style={{ width: '12px', height: '12px' }} />}>
                  <input type="tel" id="contactPersonNumber" name="contactPersonNumber" value={form.contactPersonNumber} onChange={handleChange} required placeholder="+91 XXXXX XXXXX" style={inputStyle} />
                </Field>

                <Field label="Message" icon={<MessageSquare style={{ width: '12px', height: '12px' }} />}>
                  <textarea id="message" name="message" value={form.message} onChange={handleChange} rows={3} placeholder="Tell us more about your requirements..." style={{ ...inputStyle, resize: 'none', minHeight: '88px' }} />
                </Field>

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '14px',
                    borderRadius: '12px',
                    fontWeight: 600,
                    fontSize: '14px',
                    color: '#FFFFFF',
                    background: submitting ? '#94A3B8' : 'linear-gradient(135deg, #1E40AF, #1D4ED8)',
                    border: 'none',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    boxShadow: submitting ? 'none' : '0 4px 16px rgba(30,64,175,0.35)',
                    transition: 'all 0.2s',
                    minHeight: '48px',
                  }}
                >
                  <span>{submitting ? 'Sending…' : 'Send Enquiry'}</span>
                  <Send style={{ width: '16px', height: '16px' }} aria-hidden="true" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
