'use server';

import { Resend } from 'resend';
import { BRAND } from '@/constants';
import type { ContactFormData } from '@/types';

export interface ContactActionResult {
  success: boolean;
  error?: string;
}

function validateForm(data: ContactFormData): string | null {
  if (!data.productName?.trim()) return 'Product name is required.';
  if (!data.quantity?.trim()) return 'Quantity is required.';
  if (!data.companyName?.trim()) return 'Company name is required.';
  if (!data.companyEmail?.trim()) return 'Company email is required.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.companyEmail)) return 'Invalid email address.';
  if (!data.contactPersonName?.trim()) return 'Contact person name is required.';
  if (!data.contactPersonNumber?.trim()) return 'Contact number is required.';
  // 7–24 characters, at least one of them a digit. The old pattern was `/^\+?[\d\s\-()]{7,15}$/`,
  // which failed twice over: the 15-char ceiling was exactly the length of the placeholder's own
  // "+91 98765 43210", and `+` was only allowed as the very first character, so
  // "(+91) 98765 43210" was rejected outright. Separators stay restricted to space, dash,
  // parentheses and plus, so "abc@def#ghi" is still refused. The `(?=.*\d)` lookahead is what
  // stops a string built entirely out of separators — "+++++++", "-------" — validating as a
  // phone number, since every character in the class is otherwise optional.
  if (!/^(?=.*\d)[+\d\s\-()]{7,24}$/.test(data.contactPersonNumber)) return 'Invalid phone number.';
  return null;
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

export async function submitContactForm(data: ContactFormData): Promise<ContactActionResult> {
  // Server-side validation
  const validationError = validateForm(data);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const apiKey = process.env.RESEND_API_KEY;

  // If no API key configured, log and return success (dev/staging mode)
  if (!apiKey || apiKey === 'your_resend_api_key_here') {
    console.log('[Contact Form] No RESEND_API_KEY configured. Form data:', data);
    return { success: true };
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
      from: `${BRAND.NAME} Website <onboarding@resend.dev>`,
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
    console.error('[Contact Form] Failed to send email:', err);
    return {
      success: false,
      error: 'Failed to send your enquiry. Please try again or contact us directly.',
    };
  }
}
