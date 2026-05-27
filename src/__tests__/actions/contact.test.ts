import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock resend before importing the action
vi.mock('resend', () => ({
  Resend: class MockResend {
    emails = {
      send: vi.fn().mockResolvedValue({ id: 'mock-email-id' }),
    };
  },
}));

// We need to test the validateForm logic via the exported action
// Since validateForm is private, we test it through submitContactForm
import { submitContactForm } from '@/app/actions/contact';

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

describe('submitContactForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: no API key (dev mode)
    process.env.RESEND_API_KEY = '';
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
        contactPersonNumber: '12345678901234567',
      });
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid phone number.');
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

  describe('dev mode (no API key)', () => {
    it('returns success without sending email when no API key', async () => {
      process.env.RESEND_API_KEY = '';
      const result = await submitContactForm(validFormData);
      expect(result.success).toBe(true);
    });

    it('returns success when API key is placeholder', async () => {
      process.env.RESEND_API_KEY = 'your_resend_api_key_here';
      const result = await submitContactForm(validFormData);
      expect(result.success).toBe(true);
    });
  });

  describe('production mode (with API key)', () => {
    it('sends email via Resend when API key is configured', async () => {
      process.env.RESEND_API_KEY = 'test_not_a_real_key';
      const result = await submitContactForm(validFormData);
      expect(result.success).toBe(true);
    });
  });
});
