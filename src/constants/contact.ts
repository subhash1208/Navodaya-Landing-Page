import { BRAND } from '@/constants';

/**
 * Every failure path hands the visitor a way to reach the business anyway. A lead that picks up
 * the phone is not a lost lead; a lead told "something went wrong" and nothing else is.
 */
export const FALLBACK_CONTACT = `please email us directly at ${BRAND.EMAIL} or call ${BRAND.PHONE}`;

/**
 * Shared verbatim between `src/app/actions/contact.ts` (the RPC call itself rejecting) and
 * `ContactSection.tsx` (the `contactAction` wrapper's own catch, for the identical transport-level
 * failure) — both faults are different but the message to the visitor is the same: their enquiry
 * did not arrive.
 *
 * Deliberately NOT exported from `src/app/actions/contact.ts`, even though it is that file's own
 * failure string too. A file carrying `'use server'` may only export async functions — every other
 * export throws `Error: A "use server" file can only export async functions, found string.` on
 * every real-server request that instantiates the module. This constant lives here, in a
 * client-safe module, for exactly that reason.
 */
export const SEND_FAILED_ERROR = `Failed to send your enquiry. Please try again, or ${FALLBACK_CONTACT}.`;
