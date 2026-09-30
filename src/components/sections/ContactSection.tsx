'use client';

import { startTransition, useActionState, useCallback, useEffect, useRef, useState } from 'react';
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
import { BRAND, PRODUCT_CATEGORIES, PRODUCTS, productEnquiryLabel } from '@/constants';
import { SEND_FAILED_ERROR } from '@/constants/contact';
import { submitContactForm, type ContactActionResult } from '@/app/actions/contact';
import { AnimateIn } from '@/components/ui/AnimateIn';
import { cn } from '@/utils/cn';

// `grey-400`, not `grey-300`: this border is the visual boundary of every input, the select, and
// the textarea below (all three share `inputClass`) on the section's `bg-paper` ground. WCAG
// 1.4.11 requires 3:1 for a form field's boundary. `grey-300 #B4AFA6` on `paper #FAF8F2` measures
// 2.055:1 and fails; `grey-400 #8E897C` measures 3.285:1 and clears the floor. Do not "tidy" this
// back down the ramp — this is the same bug class as `sealed-contrast-rule` in the knowledge
// graph, recurring in the opposite direction on the light-ground recast.
const inputClass =
  'w-full px-4 py-3 bg-transparent border border-grey-400 text-body-sm text-ink placeholder:text-grey-500 outline-none transition-colors duration-150 focus:border-ink min-h-[44px]';

/**
 * The closed `<select>` inherits `bg-transparent` happily, but its open dropdown is a native OS
 * popup: `background-color` does not reach it, while `color` does — so an option colour tuned for
 * the page ground can land near-invisible on a system popup painted the other way round. An opaque
 * `bg-paper` plus `color-scheme: light` makes the browser paint its own popup chrome light, to
 * match the near-white options; the `option`/`optgroup` rules are a defensive floor for engines
 * that ignore `color-scheme`.
 * Tailwind 3.4 has no `color-scheme` core plugin, hence the arbitrary property.
 * Scoped to the `<select>` — the seven sibling inputs share `inputClass` and are unaffected.
 */
const selectClass =
  'bg-paper [color-scheme:light] [&>option]:bg-paper [&>option]:text-ink [&>optgroup]:bg-paper [&>optgroup]:text-grey-600';

/** Sentinel option value for "my product is not listed". */
const OTHER_VALUE = 'Other';

/**
 * Hidden name of the honeypot input. Deliberately plausible — a bot that autofills anything
 * called "website" gets caught. NOT `type="hidden"`: naive form-fillers skip those, while an
 * off-screen text input looks like every other field in the DOM.
 */
const HONEYPOT_FIELD = 'companyWebsite';

/**
 * Client-side length ceilings. These mirror `FIELD_LIMITS` in `src/app/actions/contact.ts`, which
 * enforces the same numbers server-side — `maxLength` is a convenience for a human typing, not a
 * control. Both tables are asserted against these literals in their respective specs, so a drift
 * in either direction fails a test.
 */
const FIELD_MAX_LENGTHS = {
  quantity: 100,
  // The detail is folded into `productName` as `Other — <detail>`, an 8-character prefix, so the
  // ceiling here is the server's 120-char `productName` cap minus that prefix.
  productOther: 112,
  companyName: 120,
  companyEmail: 120,
  contactPersonName: 100,
  contactPersonDesignation: 100,
  contactPersonNumber: 24,
  message: 2000,
} as const;

/**
 * `formData.get()` returns `string | File | null`. `as string` is erased at compile time and
 * coerces nothing, so a `File` would reach `.trim()` in `validateForm` the day a field changes.
 */
function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
}

interface FieldProps {
  label: string;
  id: string;
  icon?: React.ReactNode;
  /** Server-reported message for THIS field. Rendered at `errorId ?? `${id}-error``, referenced
   *  by the input. */
  error?: string;
  /** Overrides the error paragraph's id. Needed only when the visible message belongs to a
   *  DIFFERENT input's `aria-describedby` than this Field's own `id` — the `productOther` /
   *  `productName` case, where the server names `productName` but the visitor is looking at
   *  `productOther`. Defaults to `${id}-error`. */
  errorId?: string;
  /** Renders a visible "(Optional)" marker inside the label. Real text, not `aria-hidden`
   *  decoration, so the accessible name says it too. */
  optional?: boolean;
  children: React.ReactNode;
}
function Field({ label, id, icon, error, errorId, optional, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className="flex items-center gap-1.5 font-mono text-label uppercase text-grey-500"
      >
        {icon && <span aria-hidden="true">{icon}</span>}
        {label}{' '}
        {/* grey-500, not grey-400: on `bg-paper` grey-400 is 3.34:1 and fails WCAG 1.4.3 at this
            label's 11px, while grey-500 is 5.14:1. Do not "tidy" this back up the ramp. */}
        {optional ? <span className="text-grey-500">(Optional)</span> : null}
      </label>
      {children}
      {error ? (
        <p id={errorId ?? `${id}-error`} className="font-mono text-label text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}

type FormState = ContactActionResult | null;

/**
 * Defensive fallback for a `{ success: false }` result carrying no `error`. `ContactActionResult`
 * makes that shape a compile error for any TypeScript-checked return path, but the guarantee ends
 * at the server-action RPC boundary — it does not protect against a malformed response crossing
 * the wire. Rendering this instead of nothing means the visitor is never left staring at a reverted
 * button with zero explanation of what happened to their enquiry.
 */
const UNKNOWN_ERROR_MESSAGE = `Something went wrong sending your enquiry. Please try again, or email us directly at ${BRAND.EMAIL} or call ${BRAND.PHONE}.`;

async function contactAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const selected = readString(formData, 'productName');
  const otherDetail = readString(formData, 'productOther').trim();
  // "Other" on its own is an unusable lead, so fold the free-text detail into the product. With
  // no detail there is nothing to send, and server validation rejects the empty product name.
  const productName =
    selected === OTHER_VALUE ? (otherDetail ? `${OTHER_VALUE} — ${otherDetail}` : '') : selected;

  try {
    return await submitContactForm({
      productName,
      quantity: readString(formData, 'quantity'),
      companyName: readString(formData, 'companyName'),
      companyEmail: readString(formData, 'companyEmail'),
      contactPersonName: readString(formData, 'contactPersonName'),
      contactPersonDesignation: readString(formData, 'contactPersonDesignation'),
      contactPersonNumber: readString(formData, 'contactPersonNumber'),
      message: readString(formData, 'message'),
      honeypot: readString(formData, HONEYPOT_FIELD),
    });
  } catch {
    // The action call itself failed in transit — offline, DNS blip, connection reset before the
    // server responded — as opposed to the server returning a structured failure. Uncaught, this
    // rejection bubbles out of `startTransition` to the nearest error boundary and replaces the
    // ENTIRE page, taking every field the visitor typed with it. Catching it here keeps the
    // failure inline, exactly like a Resend rejection already is.
    return { success: false, error: SEND_FAILED_ERROR };
  }
}

export default function ContactSection() {
  const [state, formAction, isPending] = useActionState<FormState, FormData>(contactAction, null);
  // `state` is owned by `useActionState` and only changes when `formAction` is dispatched, so the
  // success panel cannot be dismissed by touching `state`. This flag is the dismissal, cleared
  // whenever a submission actually runs.
  const [dismissed, setDismissed] = useState(false);
  const [productChoice, setProductChoice] = useState('');
  const sectionRef = useRef<HTMLElement>(null);
  const lastMoveRef = useRef(0);

  const showSuccess = state?.success === true && !dismissed;
  const isOther = productChoice === OTHER_VALUE;
  // Field names match input ids throughout this form, so the server's `field` doubles as a
  // DOM id. `productName` is the exception: when "Other" is selected the thing the visitor must
  // actually retype is the free-text detail beside the select, not the select itself.
  const invalidField = state?.success === false ? state.field : undefined;
  const focusTarget = invalidField === 'productName' && isOther ? 'productOther' : invalidField;

  const errorFor = (id: string) =>
    state?.success === false && invalidField === id ? state.error : undefined;
  const invalidProps = (id: string) =>
    invalidField === id ? { 'aria-invalid': true, 'aria-describedby': `${id}-error` } : {};

  useEffect(() => {
    // A visitor who submitted from the bottom of a long form should not have to hunt for which
    // field the banner is talking about. `state` is a fresh object on every dispatch, so this
    // re-fires even when the same field fails twice in a row.
    if (focusTarget) document.getElementById(focusTarget)?.focus();
  }, [state, focusTarget]);

  useEffect(() => {
    // One-shot prefill from `/products/<slug>`'s "Request a Quote" link. Read directly off
    // `window.location.search` rather than `useSearchParams` — that hook forces this section's
    // subtree under a Suspense boundary and, on the homepage, would opt `/` into client-only
    // rendering for the same reason `useSearchParams` was removed from `/products` (see
    // `ProductGrid.tsx`). The slug is validated against `PRODUCTS`; anything unmatched leaves the
    // select at its blank placeholder exactly as today.
    const slug = new URLSearchParams(window.location.search).get('product');
    if (!slug) return;
    const product = PRODUCTS.find((p) => p.slug === slug);
    if (!product) return;
    setProductChoice(productEnquiryLabel(product));
  }, []);

  const handleAction = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      // Dispatched from `onSubmit` rather than `<form action={…}>` on purpose. React 19 resets
      // an uncontrolled form once the action COMPLETES — not once it succeeds — so a form action
      // wiped every field the moment the server returned `{ success: false }`, and a visitor who
      // mistyped their phone number had to retype the whole enquiry. Dispatching inside an
      // explicit transition keeps `isPending` working without handing React the form to reset.
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      setDismissed(false);
      startTransition(() => formAction(formData));
    },
    [formAction],
  );

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    setProductChoice('');
  }, []);

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
      className="py-24 bg-paper cursor-spotlight"
      onMouseMove={handleMouseMove}
    >
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left — info */}
          <AnimateIn direction="right" className="text-ink">
            <div className="flex items-baseline gap-5 border-t border-grey-200 pt-8">
              <span className="font-mono text-label uppercase text-grey-500">Get in Touch</span>
            </div>
            <h2 id="contact-heading" className="mt-6 font-display text-heading-1 text-brand-blue">
              Request a Quote
            </h2>
            <p className="mt-4 mb-10 max-w-lg text-body-lg text-grey-600">
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
                  className="flex items-center gap-4 text-grey-600 hover:text-ink transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
                >
                  <div className="w-11 h-11 border border-grey-200 flex items-center justify-center shrink-0">
                    <Icon className="w-[18px] h-[18px]" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="font-mono text-label uppercase text-grey-500">{label}</div>
                    <div className="mt-1 font-mono text-data text-grey-600">{value}</div>
                  </div>
                </a>
              ))}
            </div>

            <div className="mt-12 p-5 border border-grey-200">
              <p className="font-mono text-data text-grey-500">
                📍 Hyderabad · Serving educational institutions, healthcare, hospitality &amp; other
                institutional customers across India
              </p>
            </div>
          </AnimateIn>

          {/* Right — specification form */}
          <AnimateIn direction="left" delay={0.1} className="p-8 border border-grey-200">
            {showSuccess ? (
              <div className="py-8" role="alert" aria-live="assertive">
                <CheckCircle className="w-10 h-10 text-ink mb-4" aria-hidden="true" />
                <h3 className="text-heading-2 text-ink mb-2">Thank You!</h3>
                <p className="text-body-sm text-grey-600 mb-6">
                  Your enquiry has been sent to <strong className="text-ink">{BRAND.EMAIL}</strong>.
                  We&apos;ll be in touch shortly.
                </p>
                <button
                  onClick={handleDismiss}
                  className="font-mono text-label uppercase text-ink underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
                >
                  Send another enquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleAction} noValidate className="flex flex-col gap-6">
                <h3 className="font-mono text-label uppercase text-grey-500">Send an Enquiry</h3>

                {state?.success === false && (
                  <div
                    role="alert"
                    aria-live="assertive"
                    className="flex items-start gap-2.5 border border-red-300 bg-red-50 text-body-sm text-red-800 p-3"
                  >
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
                    {state.error || UNKNOWN_ERROR_MESSAGE}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                    label="Product"
                    id="productName"
                    icon={<Package className="w-3 h-3" />}
                    error={isOther ? undefined : errorFor('productName')}
                  >
                    <select
                      id="productName"
                      name="productName"
                      required
                      className={cn(inputClass, selectClass)}
                      value={productChoice}
                      onChange={(e) => setProductChoice(e.target.value)}
                      {...invalidProps('productName')}
                    >
                      <option value="" disabled>
                        Select a product
                      </option>
                      {PRODUCT_CATEGORIES.map((cat) => (
                        <optgroup key={cat.id} label={cat.name}>
                          {PRODUCTS.filter((p) => p.category.id === cat.id).map((p) => (
                            // Two pairs of products share a `name`, so the value carries the
                            // category too; the visible label stays `p.name` because the
                            // enclosing optgroup already shows the category.
                            <option key={p.id} value={productEnquiryLabel(p)}>
                              {p.name}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                      <option value={OTHER_VALUE}>{OTHER_VALUE}</option>
                    </select>
                  </Field>
                  <Field label="Quantity" id="quantity" error={errorFor('quantity')}>
                    <input
                      id="quantity"
                      type="text"
                      name="quantity"
                      required
                      maxLength={FIELD_MAX_LENGTHS.quantity}
                      placeholder="e.g. 1000 pieces"
                      className={inputClass}
                      {...invalidProps('quantity')}
                    />
                  </Field>
                  {/* Stable trailing slot — holds `null` rather than shifting its siblings. */}
                  {isOther ? (
                    <Field
                      label="Which product?"
                      id="productOther"
                      // The server reports this failure against `productName` (see `invalidField`
                      // above), but the visitor is looking at THIS input — render the message
                      // here, at the id `invalidProps('productName')` already points
                      // `aria-describedby` at, rather than leaving it under the now-hidden select.
                      error={errorFor('productName')}
                      errorId="productName-error"
                    >
                      <input
                        id="productOther"
                        type="text"
                        name="productOther"
                        required
                        maxLength={FIELD_MAX_LENGTHS.productOther}
                        placeholder="Describe the product you need"
                        className={inputClass}
                        {...invalidProps('productName')}
                      />
                    </Field>
                  ) : null}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                    label="Company"
                    id="companyName"
                    icon={<Users className="w-3 h-3" />}
                    error={errorFor('companyName')}
                  >
                    <input
                      id="companyName"
                      type="text"
                      name="companyName"
                      required
                      maxLength={FIELD_MAX_LENGTHS.companyName}
                      placeholder="Company name"
                      className={inputClass}
                      {...invalidProps('companyName')}
                    />
                  </Field>
                  <Field
                    label="Email"
                    id="companyEmail"
                    icon={<Mail className="w-3 h-3" />}
                    error={errorFor('companyEmail')}
                    optional
                  >
                    <input
                      id="companyEmail"
                      type="email"
                      name="companyEmail"
                      maxLength={FIELD_MAX_LENGTHS.companyEmail}
                      placeholder="company@example.com"
                      className={inputClass}
                      {...invalidProps('companyEmail')}
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                    label="Contact Person"
                    id="contactPersonName"
                    icon={<User className="w-3 h-3" />}
                    error={errorFor('contactPersonName')}
                  >
                    <input
                      id="contactPersonName"
                      type="text"
                      name="contactPersonName"
                      required
                      maxLength={FIELD_MAX_LENGTHS.contactPersonName}
                      placeholder="Full name"
                      className={inputClass}
                      {...invalidProps('contactPersonName')}
                    />
                  </Field>
                  <Field
                    label="Designation"
                    id="contactPersonDesignation"
                    icon={<Briefcase className="w-3 h-3" />}
                    error={errorFor('contactPersonDesignation')}
                    optional
                  >
                    <input
                      id="contactPersonDesignation"
                      type="text"
                      name="contactPersonDesignation"
                      maxLength={FIELD_MAX_LENGTHS.contactPersonDesignation}
                      placeholder="e.g. Manager"
                      className={inputClass}
                      {...invalidProps('contactPersonDesignation')}
                    />
                  </Field>
                </div>

                <Field
                  label="Phone"
                  id="contactPersonNumber"
                  icon={<Phone className="w-3 h-3" />}
                  error={errorFor('contactPersonNumber')}
                >
                  <input
                    id="contactPersonNumber"
                    type="tel"
                    name="contactPersonNumber"
                    required
                    maxLength={FIELD_MAX_LENGTHS.contactPersonNumber}
                    placeholder="+91 XXXXX XXXXX"
                    className={inputClass}
                    {...invalidProps('contactPersonNumber')}
                  />
                </Field>

                <Field
                  label="Message"
                  id="message"
                  icon={<MessageSquare className="w-3 h-3" />}
                  error={errorFor('message')}
                  optional
                >
                  <textarea
                    id="message"
                    name="message"
                    rows={3}
                    maxLength={FIELD_MAX_LENGTHS.message}
                    placeholder="Tell us more about your requirements..."
                    className={cn(inputClass, 'resize-none min-h-[88px]')}
                    {...invalidProps('message')}
                  />
                </Field>

                {/*
                  Honeypot. Off-screen rather than `display:none` so a bot reading computed styles
                  still sees a live field, `aria-hidden` + `tabIndex={-1}` so no human or assistive
                  technology can ever reach it, `autoComplete="off"` so no browser fills it in.
                  A non-empty value makes the server discard the submission and report success.
                */}
                <div
                  aria-hidden="true"
                  className="absolute -left-[9999px] h-px w-px overflow-hidden"
                >
                  <label htmlFor={HONEYPOT_FIELD}>Website</label>
                  <input
                    id={HONEYPOT_FIELD}
                    type="text"
                    name={HONEYPOT_FIELD}
                    tabIndex={-1}
                    autoComplete="off"
                    defaultValue=""
                  />
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-brand-blue text-paper font-mono text-label uppercase transition-colors duration-200 hover:bg-brand-blue/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:ring-offset-paper min-h-[48px] disabled:bg-grey-300 disabled:text-grey-500 disabled:cursor-not-allowed"
                  data-cursor-invert
                >
                  <span>{isPending ? 'Sending…' : 'Send Enquiry'}</span>
                  <Send className="w-4 h-4" aria-hidden="true" />
                </button>
              </form>
            )}
          </AnimateIn>
        </div>
      </div>
    </section>
  );
}
