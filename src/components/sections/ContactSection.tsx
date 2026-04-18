'use client';

import { useState, useCallback } from 'react';
import { Send, CheckCircle, AlertCircle, Package, Users, Mail, Phone, MessageSquare, User, Briefcase } from 'lucide-react';
import { cn } from '@/utils/cn';
import { BRAND, PRODUCT_CATEGORIES, PRODUCTS } from '@/constants';
import { submitContactForm } from '@/app/actions/contact';
import type { ContactFormData } from '@/types';

const EMPTY: ContactFormData = {
  productName: '', quantity: '', companyName: '', companyEmail: '',
  contactPersonName: '', contactPersonDesignation: '', contactPersonNumber: '', message: '',
};

const inputCls = cn(
  'w-full px-4 py-3 rounded-xl bg-[--color-surface-subtle] border border-slate-200 text-sm text-[--color-brand-dark]',
  'placeholder:text-slate-400 hover:border-slate-300',
  'focus:border-[--color-brand-primary] focus:ring-2 focus:ring-[--color-brand-primary]/20 focus:bg-white',
  'outline-none transition-all duration-200 min-h-[44px]'
);

interface FieldProps { label: string; icon?: React.ReactNode; children: React.ReactNode; }
function Field({ label, icon, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 uppercase tracking-wide">
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
      className="py-24 sm:py-32 bg-gradient-to-br from-[--color-brand-dark] to-slate-800"
    >
      <div className="max-w-[80rem] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-start">

          {/* Left — info */}
          <div className="text-white">
            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-[--color-brand-secondary] mb-3">
              Get in Touch
            </span>
            <h2
              id="contact-heading"
              className="text-[clamp(1.75rem,3vw,2.5rem)] font-bold mb-4"
            >
              Request a Quote
            </h2>
            <p className="text-slate-300 text-lg leading-relaxed mb-10">
              Tell us what you need and we&apos;ll get back to you with pricing and availability.
              We work with hotels, hospitals, spas, salons, and industries across India.
            </p>

            <ul className="space-y-4">
              {[
                { icon: Mail, label: 'Email', value: BRAND.EMAIL, href: `mailto:${BRAND.EMAIL}` },
                { icon: Phone, label: 'Phone', value: BRAND.PHONE, href: `tel:${BRAND.PHONE.replace(/\s/g, '')}` },
              ].map(({ icon: Icon, label, value, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[--color-brand-secondary] rounded"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 font-medium">{label}</div>
                      <div className="text-sm font-semibold">{value}</div>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Right — form */}
          <div className="bg-white rounded-[1.25rem] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
            {submitted ? (
              <div className="text-center py-8" role="alert" aria-live="polite">
                <CheckCircle className="w-14 h-14 text-emerald-500 mx-auto mb-4" aria-hidden="true" />
                <h3 className="text-xl font-bold text-[--color-brand-dark] mb-2">Thank You!</h3>
                <p className="text-slate-500 text-sm">
                  Your enquiry has been sent to <strong className="text-[--color-brand-primary]">{BRAND.EMAIL}</strong>. We&apos;ll be in touch shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-5">

                {/* Error banner */}
                {error && (
                  <div role="alert" aria-live="assertive" className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3.5">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
                    {error}
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-5">
                  <Field label="Product" icon={<Package className="w-3 h-3" />}>
                    <select id="productName" name="productName" value={form.productName} onChange={handleChange} required className={inputCls}>
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
                    <input type="text" id="quantity" name="quantity" value={form.quantity} onChange={handleChange} required placeholder="e.g. 1000 pieces" className={inputCls} />
                  </Field>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <Field label="Company" icon={<Users className="w-3 h-3" />}>
                    <input type="text" id="companyName" name="companyName" value={form.companyName} onChange={handleChange} required placeholder="Company name" className={inputCls} />
                  </Field>
                  <Field label="Email" icon={<Mail className="w-3 h-3" />}>
                    <input type="email" id="companyEmail" name="companyEmail" value={form.companyEmail} onChange={handleChange} required placeholder="company@example.com" className={inputCls} />
                  </Field>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <Field label="Contact Person" icon={<User className="w-3 h-3" />}>
                    <input type="text" id="contactPersonName" name="contactPersonName" value={form.contactPersonName} onChange={handleChange} required placeholder="Full name" className={inputCls} />
                  </Field>
                  <Field label="Designation" icon={<Briefcase className="w-3 h-3" />}>
                    <input type="text" id="contactPersonDesignation" name="contactPersonDesignation" value={form.contactPersonDesignation} onChange={handleChange} placeholder="e.g. Manager" className={inputCls} />
                  </Field>
                </div>

                <Field label="Phone" icon={<Phone className="w-3 h-3" />}>
                  <input type="tel" id="contactPersonNumber" name="contactPersonNumber" value={form.contactPersonNumber} onChange={handleChange} required placeholder="+91 XXXXX XXXXX" className={inputCls} />
                </Field>

                <Field label="Message" icon={<MessageSquare className="w-3 h-3" />}>
                  <textarea id="message" name="message" value={form.message} onChange={handleChange} rows={3} placeholder="Tell us more about your requirements..." className={cn(inputCls, 'resize-none min-h-[88px]')} />
                </Field>

                <button
                  type="submit"
                  disabled={submitting}
                  className={cn(
                    'w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm text-white',
                    'bg-[--color-brand-primary] hover:bg-[--color-brand-primary]/90 hover:-translate-y-0.5 hover:shadow-[0_0_40px_rgba(30,64,175,0.35)]',
                    'disabled:bg-slate-300 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none',
                    'transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-brand-primary] focus-visible:ring-offset-2 min-h-[44px]'
                  )}
                >
                  <span>{submitting ? 'Sending…' : 'Send Enquiry'}</span>
                  <Send className={cn('w-4 h-4', submitting && 'animate-pulse')} aria-hidden="true" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
