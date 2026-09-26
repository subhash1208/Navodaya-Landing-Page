import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import ContactSection from '@/components/sections/ContactSection';
import { BRAND, PRODUCTS, productEnquiryLabel } from '@/constants';

/**
 * Server-rendering regression tests for the contact section.
 *
 * These deliberately do NOT mock `motion/react`. The behavioural spec beside this one replaces
 * it with a passthrough that strips `initial` and `animate` — correct there, fatal here, because
 * those are the exact props motion serialises into inline styles during server render. With the
 * old `initial={{ opacity: 0, x: ∓40 }}` this section shipped `style="opacity:0"` on both
 * columns, so the contact details and the entire quote-request form were invisible to a crawler
 * and to any visitor whose JavaScript had not run. `src/app/page.tsx` mounts this section through
 * a bare `dynamic()` import with no `ssr: false`, so it really is server-rendered.
 *
 * `renderToStaticMarkup` never runs effects, so it observes the true server branch — the one
 * jsdom tests can never reach, because Testing Library flushes effects before you can assert.
 */

vi.mock('@/app/actions/contact', () => ({
  submitContactForm: vi.fn().mockResolvedValue({ success: true }),
}));

describe('ContactSection server rendering', () => {
  const html = renderToStaticMarkup(<ContactSection />);

  it('server-renders the heading and body copy', () => {
    expect(html).toContain('Request a Quote');
    expect(html).toContain('Get in Touch');
    expect(html).toContain('Tell us what you need');
  });

  it('server-renders the contact email and phone as real links', () => {
    expect(html).toContain(BRAND.EMAIL);
    expect(html).toContain(BRAND.PHONE);
    expect(html).toContain(`href="mailto:${BRAND.EMAIL}"`);
    expect(html).toMatch(/href="tel:/);
  });

  it('server-renders every form field', () => {
    for (const name of [
      'productName',
      'quantity',
      'companyName',
      'companyEmail',
      'contactPersonName',
      'contactPersonDesignation',
      'contactPersonNumber',
      'message',
    ]) {
      expect(html, `missing field ${name}`).toContain(`name="${name}"`);
    }
    expect(html).toContain('Send an Enquiry');
    expect(html).toContain('Send Enquiry');
  });

  it('server-renders the full product list with disambiguated values', () => {
    expect(html).toContain('<select');
    for (const product of PRODUCTS) {
      const value = productEnquiryLabel(product)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
      expect(html, `missing option for ${product.id}`).toContain(`value="${value}"`);
    }
  });

  it('does not ship any contact content at opacity:0', () => {
    // motion writes `initial` into the inline style attribute during SSR. With `initial={false}`
    // it renders at the `animate` value instead, which is the visible state on the server. A
    // match here means a wrapper went back to `initial={{ opacity: 0 }}` and the form is once
    // again invisible to anyone whose JS has not run.
    const inlineStyles = html.match(/style="[^"]*"/g) ?? [];
    expect(inlineStyles.filter((s) => /opacity:\s*0[;"]/.test(s))).toEqual([]);
  });

  it('does not ship the columns translated off their resting position', () => {
    const inlineStyles = html.match(/style="[^"]*"/g) ?? [];
    expect(inlineStyles.filter((s) => /translate/i.test(s) && /-?40px/.test(s))).toEqual([]);
  });
});
