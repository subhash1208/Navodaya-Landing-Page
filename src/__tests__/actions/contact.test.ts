import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const { mockSend } = vi.hoisted(() => ({ mockSend: vi.fn() }));

// Mock resend before importing the action
vi.mock('resend', () => ({
  Resend: class MockResend {
    emails = { send: mockSend };
  },
}));

// We need to test the validateForm logic via the exported action
// Since validateForm is private, we test it through submitContactForm
import { submitContactForm } from '@/app/actions/contact';
import { BRAND } from '@/constants';

const validFormData = {
  productName: 'Surgeon Cap',
  quantity: '1000 pieces',
  companyName: 'Test Hospital',
  companyEmail: 'test@hospital.com',
  contactPersonName: 'Dr. Smith',
  contactPersonDesignation: 'Procurement Head',
  contactPersonNumber: '+91 98765 43210',
  message: 'Need bulk order for Q3',
};

const SENTINEL = 'your_resend_api_key_here';

/**
 * The rate limiter keeps its window in a module-level Map that every test in this file shares.
 * Rather than exporting a reset hook into production code, each test runs an hour after the one
 * before it on a stubbed clock, which puts it outside the previous test's 10-minute window.
 */
let clock = Date.UTC(2026, 0, 1);

describe('submitContactForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    mockSend.mockResolvedValue({ id: 'mock-email-id' });
    // Default: no API key (dev mode)
    process.env.RESEND_API_KEY = '';
    delete process.env.RESEND_FROM;
    clock += 60 * 60 * 1000;
    vi.spyOn(Date, 'now').mockImplementation(() => clock);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('validation', () => {
    it('rejects empty product name', async () => {
      const result = await submitContactForm({ ...validFormData, productName: '' });
      expect(result.success).toBe(false);
      expect(result.error).toBe('Product name is required.');
    });

    it('rejects whitespace-only product name', async () => {
      const result = await submitContactForm({ ...validFormData, productName: '   ' });
      expect(result.success).toBe(false);
      expect(result.error).toBe('Product name is required.');
    });

    it('rejects empty quantity', async () => {
      const result = await submitContactForm({ ...validFormData, quantity: '' });
      expect(result.success).toBe(false);
      expect(result.error).toBe('Quantity is required.');
    });

    it('rejects empty company name', async () => {
      const result = await submitContactForm({ ...validFormData, companyName: '' });
      expect(result.success).toBe(false);
      expect(result.error).toBe('Company name is required.');
    });

    it('rejects empty company email', async () => {
      const result = await submitContactForm({ ...validFormData, companyEmail: '' });
      expect(result.success).toBe(false);
      expect(result.error).toBe('Company email is required.');
    });

    it('rejects invalid email format', async () => {
      const result = await submitContactForm({ ...validFormData, companyEmail: 'not-an-email' });
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid email address.');
    });

    it('rejects email without domain', async () => {
      const result = await submitContactForm({ ...validFormData, companyEmail: 'user@' });
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid email address.');
    });

    it('rejects empty contact person name', async () => {
      const result = await submitContactForm({ ...validFormData, contactPersonName: '' });
      expect(result.success).toBe(false);
      expect(result.error).toBe('Contact person name is required.');
    });

    it('rejects empty contact number', async () => {
      const result = await submitContactForm({ ...validFormData, contactPersonNumber: '' });
      expect(result.success).toBe(false);
      expect(result.error).toBe('Contact number is required.');
    });

    it('rejects phone number too short', async () => {
      const result = await submitContactForm({ ...validFormData, contactPersonNumber: '123' });
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid phone number.');
    });

    it('rejects phone number too long', async () => {
      const result = await submitContactForm({
        ...validFormData,
        contactPersonNumber: '+123456789012345678901234',
      });
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid phone number.');
    });

    it('accepts a phone number at the 24-character ceiling', async () => {
      const number = '+12345678901234567890123';
      expect(number).toHaveLength(24);
      const result = await submitContactForm({ ...validFormData, contactPersonNumber: number });
      expect(result.success).toBe(true);
    });

    it('accepts a phone number at the 7-character floor', async () => {
      const result = await submitContactForm({ ...validFormData, contactPersonNumber: '1234567' });
      expect(result.success).toBe(true);
    });

    it('rejects a phone number one character below the floor', async () => {
      const result = await submitContactForm({ ...validFormData, contactPersonNumber: '123456' });
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid phone number.');
    });

    it('accepts a parenthesised country code', async () => {
      const result = await submitContactForm({
        ...validFormData,
        contactPersonNumber: '(+91) 98765 43210',
      });
      expect(result.success).toBe(true);
    });

    it('accepts a US-style number with an area code in parentheses', async () => {
      const result = await submitContactForm({
        ...validFormData,
        contactPersonNumber: '+1 (555) 123-4567',
      });
      expect(result.success).toBe(true);
    });

    it('rejects a digit-free string of otherwise valid length', async () => {
      // Every character in the permitted class is optional, so without the `(?=.*\d)` lookahead
      // a string built entirely out of separators validates as a phone number.
      const result = await submitContactForm({
        ...validFormData,
        contactPersonNumber: '+++++++',
      });
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid phone number.');
    });

    it('accepts a single digit padded to valid length with separators', async () => {
      const result = await submitContactForm({
        ...validFormData,
        contactPersonNumber: '--- 1 ---',
      });
      expect(result.success).toBe(true);
    });

    it('rejects phone number with invalid characters', async () => {
      const result = await submitContactForm({
        ...validFormData,
        contactPersonNumber: 'abc@def#ghi',
      });
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid phone number.');
    });

    it('accepts valid phone with + prefix', async () => {
      const result = await submitContactForm({
        ...validFormData,
        contactPersonNumber: '+919876543210',
      });
      expect(result.success).toBe(true);
    });

    it('accepts valid phone with spaces', async () => {
      const result = await submitContactForm({
        ...validFormData,
        contactPersonNumber: '+91 98765 43210',
      });
      expect(result.success).toBe(true);
    });

    it('accepts valid phone with dashes', async () => {
      const result = await submitContactForm({
        ...validFormData,
        contactPersonNumber: '+91-98765-43210',
      });
      expect(result.success).toBe(true);
    });

    it('accepts valid phone with parentheses', async () => {
      const result = await submitContactForm({
        ...validFormData,
        contactPersonNumber: '+91(98765)4321',
      });
      expect(result.success).toBe(true);
    });

    it('accepts valid form data', async () => {
      const result = await submitContactForm(validFormData);
      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('accepts form without optional fields (designation, message)', async () => {
      const { contactPersonDesignation, message, ...required } = validFormData;
      const result = await submitContactForm({
        ...required,
        contactPersonDesignation: '',
        message: '',
      });
      expect(result.success).toBe(true);
    });
  });

  /**
   * The four rows of the key/environment discriminator. The dangerous row is the last one: before
   * this, an unset key in production returned `{ success: true }` and the visitor was shown a
   * thank-you panel while the lead was discarded with only an ephemeral `console.error`.
   */
  describe('RESEND_API_KEY discriminator', () => {
    it('takes the mock path for the sentinel key, even in production', async () => {
      // Playwright's webServer runs `next build && next start`, so gate 7 submits this form with
      // NODE_ENV=production and the sentinel present. That combination must not error.
      vi.stubEnv('NODE_ENV', 'production');
      process.env.RESEND_API_KEY = SENTINEL;
      const log = vi.spyOn(console, 'log').mockImplementation(() => {});

      const result = await submitContactForm(validFormData);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(mockSend).not.toHaveBeenCalled();
      log.mockRestore();
    });

    it('takes the mock path for an absent key outside production', async () => {
      vi.stubEnv('NODE_ENV', 'development');
      process.env.RESEND_API_KEY = '';
      const log = vi.spyOn(console, 'log').mockImplementation(() => {});

      const result = await submitContactForm(validFormData);

      expect(result.success).toBe(true);
      expect(mockSend).not.toHaveBeenCalled();
      log.mockRestore();
    });

    it('never fakes success when the key is missing in production', async () => {
      vi.stubEnv('NODE_ENV', 'production');
      process.env.RESEND_API_KEY = '';
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await submitContactForm(validFormData);

      expect(result.success).toBe(false);
      expect(mockSend).not.toHaveBeenCalled();
      // The visitor must still be able to reach the business.
      expect(result.error).toContain(BRAND.EMAIL);
      expect(result.error).toContain(BRAND.PHONE);
      // Greppable in the hosting platform's logs, and carrying the whole lead so it is recoverable.
      expect(consoleError.mock.calls[0][0]).toContain('[contact] FATAL:');
      expect(consoleError.mock.calls[0][1]).toEqual(validFormData);
      consoleError.mockRestore();
    });

    it('sends through Resend when a real key is present', async () => {
      vi.stubEnv('NODE_ENV', 'production');
      process.env.RESEND_API_KEY = 'test_not_a_real_key';

      const result = await submitContactForm(validFormData);

      expect(result.success).toBe(true);
      expect(mockSend).toHaveBeenCalledTimes(1);
    });
  });

  describe('sender address', () => {
    it('falls back to the Resend sandbox sender', async () => {
      process.env.RESEND_API_KEY = 'test_not_a_real_key';
      await submitContactForm(validFormData);
      expect(mockSend.mock.calls[0][0].from).toBe('Navodaya Website <onboarding@resend.dev>');
    });

    it('uses RESEND_FROM when one is configured', async () => {
      process.env.RESEND_API_KEY = 'test_not_a_real_key';
      process.env.RESEND_FROM = 'Navodaya <website@navodaya.group>';
      await submitContactForm(validFormData);
      expect(mockSend.mock.calls[0][0].from).toBe('Navodaya <website@navodaya.group>');
    });
  });

  describe('honeypot', () => {
    it('discards a submission whose hidden field was filled, without sending', async () => {
      process.env.RESEND_API_KEY = 'test_not_a_real_key';
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = await submitContactForm({ ...validFormData, honeypot: 'https://spam.test' });

      // The bot is told nothing: same shape a real success returns.
      expect(result).toEqual({ success: true });
      expect(mockSend).not.toHaveBeenCalled();
      expect(warn).toHaveBeenCalled();
      warn.mockRestore();
    });

    it('is checked before validation, so a bot learns nothing from a broken payload', async () => {
      process.env.RESEND_API_KEY = 'test_not_a_real_key';
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = await submitContactForm({
        ...validFormData,
        companyEmail: 'not-an-email',
        honeypot: 'x',
      });

      expect(result).toEqual({ success: true });
      expect(mockSend).not.toHaveBeenCalled();
      warn.mockRestore();
    });

    it('treats a whitespace-only honeypot as untouched', async () => {
      process.env.RESEND_API_KEY = 'test_not_a_real_key';
      const result = await submitContactForm({ ...validFormData, honeypot: '   ' });
      expect(result.success).toBe(true);
      expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it('sends normally when the honeypot is absent', async () => {
      process.env.RESEND_API_KEY = 'test_not_a_real_key';
      const result = await submitContactForm(validFormData);
      expect(result.success).toBe(true);
      expect(mockSend).toHaveBeenCalledTimes(1);
    });
  });

  describe('rate limiting', () => {
    const rateLimited = { ...validFormData, companyEmail: 'burst@hospital.com' };

    it('allows three submissions then refuses the fourth', async () => {
      process.env.RESEND_API_KEY = 'test_not_a_real_key';
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

      for (let i = 0; i < 3; i++) {
        expect((await submitContactForm(rateLimited)).success).toBe(true);
      }
      const fourth = await submitContactForm(rateLimited);

      expect(fourth.success).toBe(false);
      expect(fourth.field).toBe('companyEmail');
      expect(fourth.error).toContain(BRAND.EMAIL);
      expect(mockSend).toHaveBeenCalledTimes(3);
      warn.mockRestore();
    });

    it('keys on a case-normalised email, so a shift key does not buy extra quota', async () => {
      process.env.RESEND_API_KEY = 'test_not_a_real_key';
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

      await submitContactForm({ ...validFormData, companyEmail: 'case@hospital.com' });
      await submitContactForm({ ...validFormData, companyEmail: 'CASE@hospital.com' });
      await submitContactForm({ ...validFormData, companyEmail: 'Case@Hospital.com' });
      const fourth = await submitContactForm({
        ...validFormData,
        companyEmail: 'cAsE@hospital.com',
      });

      expect(fourth.success).toBe(false);
      expect(mockSend).toHaveBeenCalledTimes(3);
      warn.mockRestore();
    });

    it('does not limit a different email', async () => {
      process.env.RESEND_API_KEY = 'test_not_a_real_key';
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

      for (let i = 0; i < 3; i++) await submitContactForm(rateLimited);
      const other = await submitContactForm({
        ...validFormData,
        companyEmail: 'other@hospital.com',
      });

      expect(other.success).toBe(true);
      warn.mockRestore();
    });

    it('forgets a sender once the window has passed', async () => {
      process.env.RESEND_API_KEY = 'test_not_a_real_key';
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

      for (let i = 0; i < 3; i++) await submitContactForm(rateLimited);
      expect((await submitContactForm(rateLimited)).success).toBe(false);

      clock += 10 * 60 * 1000 + 1;
      expect((await submitContactForm(rateLimited)).success).toBe(true);
      warn.mockRestore();
    });

    it('does not spend quota on a submission that failed validation', async () => {
      process.env.RESEND_API_KEY = 'test_not_a_real_key';
      const email = 'invalidfirst@hospital.com';

      for (let i = 0; i < 4; i++) {
        const rejected = await submitContactForm({
          ...validFormData,
          companyEmail: email,
          quantity: '',
        });
        expect(rejected.error).toBe('Quantity is required.');
      }
      expect((await submitContactForm({ ...validFormData, companyEmail: email })).success).toBe(
        true,
      );
    });
  });

  describe('length caps', () => {
    it.each([
      ['productName', 120, 'Product'],
      ['quantity', 100, 'Quantity'],
      ['companyName', 120, 'Company name'],
      ['contactPersonName', 100, 'Contact person name'],
      ['contactPersonDesignation', 100, 'Designation'],
      ['message', 2000, 'Message'],
    ] as const)('rejects %s beyond %i characters', async (field, max, label) => {
      const result = await submitContactForm({ ...validFormData, [field]: 'x'.repeat(max + 1) });
      expect(result.success).toBe(false);
      expect(result.error).toBe(`${label} must be ${max} characters or fewer.`);
      expect(result.field).toBe(field);
    });

    it('accepts a value sitting exactly on the cap', async () => {
      const result = await submitContactForm({ ...validFormData, message: 'x'.repeat(2000) });
      expect(result.success).toBe(true);
    });

    it('rejects an over-long email address', async () => {
      const result = await submitContactForm({
        ...validFormData,
        companyEmail: `${'a'.repeat(115)}@test.com`,
      });
      expect(result.success).toBe(false);
      expect(result.error).toBe('Company email must be 120 characters or fewer.');
      expect(result.field).toBe('companyEmail');
    });

    it('reports the more specific format error before the length error', async () => {
      // An over-long phone number is more usefully reported as an invalid phone number.
      const result = await submitContactForm({
        ...validFormData,
        contactPersonNumber: '+1234567890123456789012345',
      });
      expect(result.error).toBe('Invalid phone number.');
      expect(result.field).toBe('contactPersonNumber');
    });
  });

  describe('field-level error shape', () => {
    it.each([
      [{ productName: '' }, 'productName'],
      [{ quantity: '' }, 'quantity'],
      [{ companyName: '' }, 'companyName'],
      [{ companyEmail: '' }, 'companyEmail'],
      [{ companyEmail: 'nope' }, 'companyEmail'],
      [{ contactPersonName: '' }, 'contactPersonName'],
      [{ contactPersonNumber: '' }, 'contactPersonNumber'],
      [{ contactPersonNumber: 'abc' }, 'contactPersonNumber'],
    ])('names the offending field for %o', async (override, field) => {
      const result = await submitContactForm({ ...validFormData, ...override });
      expect(result.success).toBe(false);
      expect(result.field).toBe(field);
    });

    it('carries no field on a successful submission', async () => {
      const result = await submitContactForm(validFormData);
      expect(result.field).toBeUndefined();
    });
  });

  describe('production mode (with API key)', () => {
    it('sends email via Resend when API key is configured', async () => {
      process.env.RESEND_API_KEY = 'test_not_a_real_key';
      const result = await submitContactForm(validFormData);
      expect(result.success).toBe(true);
      expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it('returns a failure carrying the fallback contact details when Resend rejects', async () => {
      process.env.RESEND_API_KEY = 'test_not_a_real_key';
      mockSend.mockRejectedValue(new Error('Resend is down'));
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await submitContactForm(validFormData);

      expect(result.success).toBe(false);
      // A visitor told only "something went wrong" is a lost lead. The message must hand them
      // another way to reach the business.
      expect(result.error).toContain(BRAND.EMAIL);
      expect(result.error).toContain(BRAND.PHONE);
      expect(result.error).toContain('Failed to send your enquiry');
      expect(consoleError).toHaveBeenCalled();
      consoleError.mockRestore();
    });

    it('flattens CR/LF out of the email subject', async () => {
      // `productName` carries arbitrary free text via the "Other" option, and a newline in a
      // subject is the classic header-injection vector.
      process.env.RESEND_API_KEY = 'test_not_a_real_key';
      const result = await submitContactForm({
        ...validFormData,
        productName: 'Surgeon Cap\r\nBcc: attacker@evil.test',
        companyName: 'Test\nHospital',
      });

      expect(result.success).toBe(true);
      const subject = mockSend.mock.calls[0][0].subject as string;
      expect(subject).not.toMatch(/[\r\n]/);
      expect(subject).toBe('New Enquiry: Surgeon Cap Bcc: attacker@evil.test — Test Hospital');
    });

    it('clamps an overlong subject', async () => {
      process.env.RESEND_API_KEY = 'test_not_a_real_key';
      // Both values sit exactly on their 120-character caps, so the clamp is still reachable
      // (13 + 120 + 3 + 120 = 256 characters of subject) without tripping the length validator.
      const result = await submitContactForm({
        ...validFormData,
        productName: 'A'.repeat(120),
        companyName: 'B'.repeat(120),
      });

      expect(result.success).toBe(true);
      const subject = mockSend.mock.calls[0][0].subject as string;
      expect(subject).toHaveLength(180);
    });

    it('omits the designation line from the email body when none was given', async () => {
      process.env.RESEND_API_KEY = 'test_not_a_real_key';
      const result = await submitContactForm({
        ...validFormData,
        contactPersonDesignation: '',
        message: '',
      });

      expect(result.success).toBe(true);
      const body = mockSend.mock.calls[0][0].text as string;
      expect(body).not.toContain('Designation:');
      expect(body).toContain('(No additional message)');
    });
  });
});
