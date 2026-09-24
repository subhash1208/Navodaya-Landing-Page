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
import { cn } from '@/utils/cn';

const inputClass =
  'w-full px-4 py-3 bg-transparent border border-grey-500 text-body-sm text-paper placeholder:text-grey-400 outline-none transition-colors duration-150 focus:border-paper min-h-[44px]';

interface FieldProps {
  label: string;
  id: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}
function Field({ label, id, icon, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className="flex items-center gap-1.5 font-mono text-label uppercase text-grey-400"
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
      className="py-24 bg-ink cursor-spotlight"
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
            className="text-paper"
          >
            <div className="flex items-baseline gap-5 border-t border-grey-700 pt-8">
              <span aria-hidden="true" className="font-mono text-label text-grey-500">
                05
              </span>
              <span className="font-mono text-label uppercase text-grey-400">Get in Touch</span>
            </div>
            <h2 id="contact-heading" className="mt-6 font-display text-heading-1 text-paper">
              Request a Quote
            </h2>
            <p className="mt-4 mb-10 max-w-lg text-body-lg text-grey-300">
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
                  className="flex items-center gap-4 text-grey-300 hover:text-paper transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paper"
                >
                  <div className="w-11 h-11 border border-grey-700 flex items-center justify-center shrink-0">
                    <Icon className="w-[18px] h-[18px]" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="font-mono text-label uppercase text-grey-400">{label}</div>
                    <div className="mt-1 font-mono text-data text-grey-300">{value}</div>
                  </div>
                </a>
              ))}
            </div>

            <div className="mt-12 p-5 border border-grey-700">
              <p className="font-mono text-data text-grey-400">
                📍 Gandhi Nagar, Hyderabad · Serving hotels, hospitals, spas &amp; industries across
                India
              </p>
            </div>
          </motion.div>

          {/* Right — specification form */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.34, 1.06, 0.64, 1] }}
            className="p-8 border border-grey-700"
          >
            {state?.success ? (
              <div className="py-8" role="alert" aria-live="polite">
                <CheckCircle className="w-10 h-10 text-paper mb-4" aria-hidden="true" />
                <h3 className="text-heading-2 text-paper mb-2">Thank You!</h3>
                <p className="text-body-sm text-grey-300 mb-6">
                  Your enquiry has been sent to{' '}
                  <strong className="text-paper">{BRAND.EMAIL}</strong>. We&apos;ll be in touch
                  shortly.
                </p>
                <button
                  onClick={() => setFormKey((k) => k + 1)}
                  className="font-mono text-label uppercase text-paper underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paper"
                >
                  Send another enquiry
                </button>
              </div>
            ) : (
              <form key={formKey} action={formAction} noValidate className="flex flex-col gap-6">
                <h3 className="font-mono text-label uppercase text-grey-400">Send an Enquiry</h3>

                {state?.error && (
                  <div
                    role="alert"
                    aria-live="assertive"
                    className="flex items-start gap-2.5 border border-red-400 bg-red-950 text-body-sm text-red-200 p-3"
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
                    className={cn(inputClass, 'resize-none min-h-[88px]')}
                  />
                </Field>

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-paper text-ink font-mono text-label uppercase transition-colors duration-200 hover:bg-grey-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paper focus-visible:ring-offset-2 focus-visible:ring-offset-ink min-h-[48px] disabled:bg-grey-600 disabled:text-grey-200 disabled:cursor-not-allowed"
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
