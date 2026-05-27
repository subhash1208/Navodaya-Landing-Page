'use client';

import { useActionState, useCallback, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  Send,
  CheckCircle,
  AlertCircle,
  Package,
  Users,
  Mail,
  Phone,
  MessageSquare,
  User,
  Briefcase,
} from 'lucide-react';
import { BRAND, PRODUCT_CATEGORIES, PRODUCTS } from '@/constants';
import { submitContactForm } from '@/app/actions/contact';

const inputClass =
  'w-full px-4 py-3 rounded-[10px] bg-surface-muted border border-slate-200 text-sm text-brand-dark outline-none transition-[border-color,box-shadow] duration-150 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 min-h-[44px]';

interface FieldProps {
  label: string;
  id: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}
function Field({ label, id, icon, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-[0.06em]"
      >
        {icon && <span aria-hidden="true">{icon}</span>}
        {label}
      </label>
      {children}
    </div>
  );
}

type FormState = { success: boolean; error?: string } | null;

async function contactAction(_prev: FormState, formData: FormData): Promise<FormState> {
  return submitContactForm({
    productName: (formData.get('productName') as string) ?? '',
    quantity: (formData.get('quantity') as string) ?? '',
    companyName: (formData.get('companyName') as string) ?? '',
    companyEmail: (formData.get('companyEmail') as string) ?? '',
    contactPersonName: (formData.get('contactPersonName') as string) ?? '',
    contactPersonDesignation: (formData.get('contactPersonDesignation') as string) ?? '',
    contactPersonNumber: (formData.get('contactPersonNumber') as string) ?? '',
    message: (formData.get('message') as string) ?? '',
  });
}

export default function ContactSection() {
  const [state, formAction, isPending] = useActionState<FormState, FormData>(contactAction, null);
  const [formKey, setFormKey] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const lastMoveRef = useRef(0);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const now = performance.now();
    if (now - lastMoveRef.current < 32) return;
    lastMoveRef.current = now;
    const el = sectionRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty('--cursor-x', `${x}%`);
    el.style.setProperty('--cursor-y', `${y}%`);
  }, []);

  return (
    <section
      ref={sectionRef}
      id="contact"
      aria-labelledby="contact-heading"
      className="py-24 bg-gradient-to-br from-brand-dark to-slate-800 cursor-spotlight"
      onMouseMove={handleMouseMove}
    >
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left — info */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, ease: [0.34, 1.06, 0.64, 1] }}
            className="text-white"
          >
            <span className="inline-block text-[11px] font-semibold tracking-[0.1em] uppercase text-brand-secondary mb-3">
              Get in Touch
            </span>
            <h2
              id="contact-heading"
              className="text-[clamp(1.75rem,3vw,2.5rem)] font-bold mb-4 leading-snug"
            >
              Request a Quote
            </h2>
            <p className="text-slate-400 text-[17px] leading-[1.7] mb-10">
              Tell us what you need and we&apos;ll get back to you with pricing and availability. We
              work with hotels, hospitals, spas, salons, and industries across India.
            </p>

            <div className="flex flex-col gap-4">
              {[
                { icon: Mail, label: 'Email', value: BRAND.EMAIL, href: `mailto:${BRAND.EMAIL}` },
                {
                  icon: Phone,
                  label: 'Phone',
                  value: BRAND.PHONE,
                  href: `tel:${BRAND.PHONE.replace(/\s/g, '')}`,
                },
              ].map(({ icon: Icon, label, value, href }) => (
                <a
                  key={label}
                  href={href}
                  className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary rounded-lg"
                >
                  <div className="w-11 h-11 rounded-[12px] bg-white/10 flex items-center justify-center shrink-0">
                    <Icon className="w-[18px] h-[18px]" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400 font-medium">{label}</div>
                    <div className="text-sm font-semibold text-slate-200">{value}</div>
                  </div>
                </a>
              ))}
            </div>

            <div className="mt-12 p-5 rounded-[16px] bg-white/5 border border-white/10">
              <p className="text-[13px] text-slate-500 leading-[1.6]">
                📍 Gandhi Nagar, Hyderabad · Serving hotels, hospitals, spas &amp; industries across
                India
              </p>
            </div>
          </motion.div>

          {/* Right — form */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.34, 1.06, 0.64, 1] }}
            className="bg-white rounded-[20px] p-8 shadow-[0_24px_64px_rgba(0,0,0,0.35)]"
          >
            {state?.success ? (
              <div className="text-center py-8" role="alert" aria-live="polite">
                <CheckCircle
                  className="w-14 h-14 text-emerald-500 mx-auto mb-4"
                  aria-hidden="true"
                />
                <h3 className="text-xl font-bold text-brand-dark mb-2">Thank You!</h3>
                <p className="text-sm text-slate-500 mb-6">
                  Your enquiry has been sent to{' '}
                  <strong className="text-brand-primary">{BRAND.EMAIL}</strong>. We&apos;ll be in
                  touch shortly.
                </p>
                <button
                  onClick={() => setFormKey((k) => k + 1)}
                  className="text-sm font-medium text-brand-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary rounded"
                >
                  Send another enquiry
                </button>
              </div>
            ) : (
              <form key={formKey} action={formAction} noValidate className="flex flex-col gap-5">
                <h3 className="text-lg font-bold text-brand-dark">Send an Enquiry</h3>

                {state?.error && (
                  <div
                    role="alert"
                    aria-live="assertive"
                    className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-600 text-[13px] rounded-[10px] p-3"
                  >
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
                    {state.error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Product" id="productName" icon={<Package className="w-3 h-3" />}>
                    <select
                      id="productName"
                      name="productName"
                      required
                      className={inputClass}
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Select a product
                      </option>
                      {PRODUCT_CATEGORIES.map((cat) => (
                        <optgroup key={cat.id} label={cat.name}>
                          {PRODUCTS.filter((p) => p.category.id === cat.id).map((p) => (
                            <option key={p.id} value={p.name}>
                              {p.name}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                      <option value="Other">Other</option>
                    </select>
                  </Field>
                  <Field label="Quantity" id="quantity">
                    <input
                      id="quantity"
                      type="text"
                      name="quantity"
                      required
                      placeholder="e.g. 1000 pieces"
                      className={inputClass}
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Company" id="companyName" icon={<Users className="w-3 h-3" />}>
                    <input
                      id="companyName"
                      type="text"
                      name="companyName"
                      required
                      placeholder="Company name"
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Email" id="companyEmail" icon={<Mail className="w-3 h-3" />}>
                    <input
                      id="companyEmail"
                      type="email"
                      name="companyEmail"
                      required
                      placeholder="company@example.com"
                      className={inputClass}
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                    label="Contact Person"
                    id="contactPersonName"
                    icon={<User className="w-3 h-3" />}
                  >
                    <input
                      id="contactPersonName"
                      type="text"
                      name="contactPersonName"
                      required
                      placeholder="Full name"
                      className={inputClass}
                    />
                  </Field>
                  <Field
                    label="Designation"
                    id="contactPersonDesignation"
                    icon={<Briefcase className="w-3 h-3" />}
                  >
                    <input
                      id="contactPersonDesignation"
                      type="text"
                      name="contactPersonDesignation"
                      placeholder="e.g. Manager"
                      className={inputClass}
                    />
                  </Field>
                </div>

                <Field label="Phone" id="contactPersonNumber" icon={<Phone className="w-3 h-3" />}>
                  <input
                    id="contactPersonNumber"
                    type="tel"
                    name="contactPersonNumber"
                    required
                    placeholder="+91 XXXXX XXXXX"
                    className={inputClass}
                  />
                </Field>

                <Field label="Message" id="message" icon={<MessageSquare className="w-3 h-3" />}>
                  <textarea
                    id="message"
                    name="message"
                    rows={3}
                    placeholder="Tell us more about your requirements..."
                    className={`${inputClass} resize-none min-h-[88px]`}
                  />
                </Field>

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-[12px] font-semibold text-sm text-white transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 min-h-[48px] disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{
                    background: isPending ? undefined : 'linear-gradient(135deg, #1E40AF, #1D4ED8)',
                    backgroundColor: isPending ? '#94A3B8' : undefined,
                    boxShadow: isPending ? 'none' : '0 4px 16px rgba(30,64,175,0.35)',
                  }}
                >
                  <span>{isPending ? 'Sending…' : 'Send Enquiry'}</span>
                  <Send className="w-4 h-4" aria-hidden="true" />
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
