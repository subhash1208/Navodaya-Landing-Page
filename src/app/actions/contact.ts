'use server';

import { Resend } from 'resend';
import { BRAND } from '@/constants';
import type { ContactFormData } from '@/types';

/** The field whose value the visitor must fix, matching both the form `name` and the input `id`. */
export type ContactFieldName = keyof ContactFormData;

export interface ContactActionResult {
  success: boolean;
  error?: string;
  /** Present on validation failures so the client can mark and focus the offending input. */
  field?: ContactFieldName;
}

/**
 * The enquiry plus the honeypot. `honeypot` is deliberately NOT on `ContactFormData` — it is not
 * part of a lead, it is anti-abuse plumbing, and nothing downstream should be able to read it.
 */
export interface ContactSubmission extends ContactFormData {
  honeypot?: string;
}

/**
 * Explicit developer marker for "there is no key here on purpose". Checked in preference to
 * `NODE_ENV` because Playwright's `webServer` runs `next build && next start`, so gate 7 submits
 * this form for real with `NODE_ENV === 'production'` — gating the mock path on the environment
 * alone would make the e2e happy path return an error. Nobody sets this string in real production,
 * and if anybody does, `VERCEL_ENV` is what catches it (see `submitContactForm`).
 */
const SENTINEL_API_KEY = 'your_resend_api_key_here';

/**
 * Sender address. `onboarding@resend.dev` is Resend's shared sandbox sender and is commonly
 * restricted to delivering only to the Resend account owner's own verified address — mail to
 * anyone else is accepted by the API and never arrives. Production MUST set `RESEND_FROM` to an
 * address on a domain verified in the Resend dashboard, e.g. `Navodaya Website <website@navodaya.group>`.
 */
const DEFAULT_FROM = `${BRAND.NAME} Website <onboarding@resend.dev>`;

/**
 * Every failure path hands the visitor a way to reach the business anyway. A lead that picks up
 * the phone is not a lost lead; a lead told "something went wrong" and nothing else is.
 */
const FALLBACK_CONTACT = `please email us directly at ${BRAND.EMAIL} or call ${BRAND.PHONE}`;

const MISCONFIGURED_ERROR = `We could not send your enquiry — our email service is not configured. Sorry about that: ${FALLBACK_CONTACT}.`;
const SEND_FAILED_ERROR = `Failed to send your enquiry. Please try again, or ${FALLBACK_CONTACT}.`;
const RATE_LIMITED_ERROR = `You have sent several enquiries in the last few minutes. Please give us a little time to reply, or ${FALLBACK_CONTACT}.`;

/**
 * Per-field length ceilings, enforced here and mirrored by `maxLength` on every input in
 * `src/components/sections/ContactSection.tsx` (see `FIELD_MAX_LENGTHS` there). The two tables
 * must carry the same numbers; both are asserted in their respective specs.
 */
const FIELD_LIMITS: Record<ContactFieldName, { max: number; label: string }> = {
  productName: { max: 120, label: 'Product' },
  quantity: { max: 100, label: 'Quantity' },
  companyName: { max: 120, label: 'Company name' },
  companyEmail: { max: 120, label: 'Company email' },
  contactPersonName: { max: 100, label: 'Contact person name' },
  contactPersonDesignation: { max: 100, label: 'Designation' },
  contactPersonNumber: { max: 24, label: 'Contact number' },
  message: { max: 2000, label: 'Message' },
};

function validateForm(data: ContactFormData): ContactActionResult | null {
  if (!data.productName?.trim())
    return { success: false, error: 'Product name is required.', field: 'productName' };
  if (!data.quantity?.trim())
    return { success: false, error: 'Quantity is required.', field: 'quantity' };
  if (!data.companyName?.trim())
    return { success: false, error: 'Company name is required.', field: 'companyName' };
  if (!data.companyEmail?.trim())
    return { success: false, error: 'Company email is required.', field: 'companyEmail' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.companyEmail))
    return { success: false, error: 'Invalid email address.', field: 'companyEmail' };
  if (!data.contactPersonName?.trim())
    return {
      success: false,
      error: 'Contact person name is required.',
      field: 'contactPersonName',
    };
  if (!data.contactPersonNumber?.trim())
    return { success: false, error: 'Contact number is required.', field: 'contactPersonNumber' };
  // 7–24 characters, at least one of them a digit. The old pattern was `/^\+?[\d\s\-()]{7,15}$/`,
  // which failed twice over: the 15-char ceiling was exactly the length of the placeholder's own
  // "+91 98765 43210", and `+` was only allowed as the very first character, so
  // "(+91) 98765 43210" was rejected outright. Separators stay restricted to space, dash,
  // parentheses and plus, so "abc@def#ghi" is still refused. The `(?=.*\d)` lookahead is what
  // stops a string built entirely out of separators — "+++++++", "-------" — validating as a
  // phone number, since every character in the class is otherwise optional.
  if (!/^(?=.*\d)[+\d\s\-()]{7,24}$/.test(data.contactPersonNumber))
    return { success: false, error: 'Invalid phone number.', field: 'contactPersonNumber' };

  // Length caps run LAST so the more specific "required"/format messages keep priority — an
  // over-long phone number is better reported as an invalid phone number than as a long one.
  for (const key of Object.keys(FIELD_LIMITS) as ContactFieldName[]) {
    const { max, label } = FIELD_LIMITS[key];
    if ((data[key] ?? '').length > max) {
      return {
        success: false,
        error: `${label} must be ${max} characters or fewer.`,
        field: key,
      };
    }
  }

  return null;
}

const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

/**
 * Best-effort rate limiting, and the word "best-effort" is doing real work here.
 *
 * This Map lives in the memory of ONE serverless instance. A platform that scales to N instances
 * gives an attacker N times the quota, and a cold start resets it to zero — so this stops a
 * casual script hammering one form, and stops nothing else. The real fix is a durable shared
 * store (Upstash Redis, or the platform's own KV) keyed the same way; it is deliberately not
 * done here because it needs a dependency and an account, neither of which exist yet.
 */
const recentSubmissions = new Map<string, number[]>();

function isRateLimited(email: string): boolean {
  const now = Date.now();

  // Sweep every key on the way past. The map is only as large as the number of distinct emails
  // seen inside one 10-minute window on one instance, so this cannot grow without bound.
  for (const [key, stamps] of recentSubmissions) {
    const live = stamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
    if (live.length === 0) recentSubmissions.delete(key);
    else recentSubmissions.set(key, live);
  }

  const identifier = email.trim().toLowerCase();
  const stamps = recentSubmissions.get(identifier) ?? [];
  if (stamps.length >= RATE_LIMIT_MAX) return true;

  recentSubmissions.set(identifier, [...stamps, now]);
  return false;
}

/**
 * Flatten a user-supplied value for safe interpolation into an email subject.
 *
 * `productName` carries arbitrary free text since the "Other" option was added
 * (ContactSection.tsx:76-77 folds a user-typed string into it), and a CR or LF in a subject is
 * the classic header-injection vector. Resend's JSON API almost certainly encodes this
 * correctly — this is defence in depth, not a confirmed exploit. `\p{Cc}` is the Unicode
 * control category, which covers CR, LF, tab and the rest of C0/C1 without putting a literal
 * control character in the pattern. The plain-text `emailBody` is deliberately left alone;
 * newlines are legitimate there.
 */
function flattenForSubject(value: string): string {
  return value
    .replace(/\p{Cc}+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function submitContactForm(data: ContactSubmission): Promise<ContactActionResult> {
  // Honeypot first: a bot that filled the hidden field gets the same answer a human gets, so it
  // has nothing to learn from. Checked before validation so a bot's garbage payload never even
  // reaches the validator.
  if (data.honeypot?.trim()) {
    console.warn('[contact] Honeypot triggered; discarding submission without sending.');
    return { success: true };
  }

  const validationFailure = validateForm(data);
  if (validationFailure) return validationFailure;

  if (isRateLimited(data.companyEmail)) {
    console.warn('[contact] Rate limit reached for this email; submission not sent.');
    return { success: false, error: RATE_LIMITED_ERROR, field: 'companyEmail' };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const isSentinel = apiKey === SENTINEL_API_KEY;

  // The sentinel is an explicit "no key on purpose" marker, so it takes the mock path in any
  // environment where a mock path can possibly be the right answer — which is everywhere except a
  // real production deployment. Locally and in CI `VERCEL_ENV` is undefined, so the carve-out
  // still applies and Playwright's `next start` (which runs with `NODE_ENV === 'production'`)
  // keeps returning a mock success, leaving gate 7 green. On a Vercel production deployment
  // `VERCEL_ENV === 'production'`, so a sentinel pasted into the dashboard is treated as the
  // misconfiguration it is instead of silently discarding every lead behind a thank-you panel.
  if (isSentinel && process.env.VERCEL_ENV !== 'production') {
    console.log('[contact] RESEND_API_KEY is the sentinel placeholder. Form data:', data);
    return { success: true };
  }

  if (isSentinel) {
    console.error(
      '[contact] FATAL: RESEND_API_KEY is the sentinel placeholder in production. Enquiry was NOT delivered:',
      data,
    );
    return { success: false, error: MISCONFIGURED_ERROR };
  }

  if (!apiKey) {
    // Ordinary local development with no .env.local: log and pretend, as before.
    if (process.env.NODE_ENV !== 'production') {
      console.log('[contact] No RESEND_API_KEY configured (dev). Form data:', data);
      return { success: true };
    }

    // Production with no key. This used to return `{ success: true }`, so every lead vanished
    // while every visitor was shown a thank-you panel. Never fake success here — tell the
    // visitor, and log the whole enquiry with a greppable prefix so it can be recovered.
    console.error(
      '[contact] FATAL: RESEND_API_KEY is not set in production. Enquiry was NOT delivered:',
      data,
    );
    return { success: false, error: MISCONFIGURED_ERROR };
  }

  try {
    const resend = new Resend(apiKey);

    const emailBody = `
New enquiry received via navodaya.group

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PRODUCT ENQUIRY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Product:    ${data.productName}
Quantity:   ${data.quantity}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMPANY DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Company:    ${data.companyName}
Email:      ${data.companyEmail}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONTACT PERSON
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name:       ${data.contactPersonName}
${data.contactPersonDesignation ? `Designation: ${data.contactPersonDesignation}` : ''}
Phone:      ${data.contactPersonNumber}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MESSAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${data.message || '(No additional message)'}
    `.trim();

    await resend.emails.send({
      from: process.env.RESEND_FROM || DEFAULT_FROM,
      to: [BRAND.EMAIL],
      replyTo: data.companyEmail,
      // Clamped to 180 chars: well inside RFC 2822's 998-octet line limit once the header name
      // and any encoding overhead are accounted for, and long enough that a realistic product
      // and company name both survive intact.
      subject:
        `New Enquiry: ${flattenForSubject(data.productName)} — ${flattenForSubject(data.companyName)}`.slice(
          0,
          180,
        ),
      text: emailBody,
    });

    return { success: true };
  } catch (err) {
    console.error('[contact] FATAL: Resend rejected the enquiry. It was NOT delivered:', err, data);
    return { success: false, error: SEND_FAILED_ERROR };
  }
}
