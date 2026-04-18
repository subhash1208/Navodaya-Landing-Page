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
  return null;
}

export async function submitContactForm(
  data: ContactFormData
): Promise<ContactActionResult> {
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
      subject: `New Enquiry: ${data.productName} — ${data.companyName}`,
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
