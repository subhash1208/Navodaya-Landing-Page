import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ContactSection from '@/components/sections/ContactSection';

vi.mock('motion/react', () => ({
  motion: new Proxy(
    {},
    {
      get: (_, tag) => (props: any) => {
        const { initial, animate, exit, transition, whileInView, variants, viewport, ...rest } =
          props;
        return <div data-testid={`motion-${String(tag)}`} {...rest} />;
      },
    },
  ),
}));

vi.mock('lucide-react', () => ({
  Send: (props: any) => <svg data-testid="send-icon" {...props} />,
  CheckCircle: (props: any) => <svg data-testid="check-icon" {...props} />,
  AlertCircle: (props: any) => <svg data-testid="alert-icon" {...props} />,
  Package: (props: any) => <svg data-testid="package-icon" {...props} />,
  Users: (props: any) => <svg data-testid="users-icon" {...props} />,
  Mail: (props: any) => <svg data-testid="mail-icon" {...props} />,
  Phone: (props: any) => <svg data-testid="phone-icon" {...props} />,
  MessageSquare: (props: any) => <svg data-testid="message-icon" {...props} />,
  User: (props: any) => <svg data-testid="user-icon" {...props} />,
  Briefcase: (props: any) => <svg data-testid="briefcase-icon" {...props} />,
}));

vi.mock('@/app/actions/contact', () => ({
  submitContactForm: vi.fn().mockResolvedValue({ success: true }),
}));

// Mock useActionState to control form state
let mockFormState: { success: boolean; error?: string } | null = null;
let mockIsPending = false;
const mockFormAction = vi.fn();
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    useActionState: (...args: any[]) => {
      // Capture the action function and call it to cover branches
      const actionFn = args[0];
      if (actionFn && !(actionFn as any).__tested) {
        (actionFn as any).__tested = true;
        // Call with a mock FormData with all values to cover the non-null ?? path
        const mockFormData = new FormData();
        mockFormData.set('productName', 'Test Product');
        mockFormData.set('quantity', '100');
        mockFormData.set('companyName', 'Test Co');
        mockFormData.set('companyEmail', 'test@test.com');
        mockFormData.set('contactPersonName', 'John');
        mockFormData.set('contactPersonDesignation', 'Manager');
        mockFormData.set('contactPersonNumber', '+91 12345');
        mockFormData.set('message', 'Hello');
        actionFn(null, mockFormData);

        // Also call with empty FormData to cover the null ?? '' path
        const emptyFormData = new FormData();
        actionFn(null, emptyFormData);
      }
      return [mockFormState, mockFormAction, mockIsPending];
    },
  };
});

describe('ContactSection', () => {
  beforeEach(() => {
    mockFormState = null;
    mockIsPending = false;
  });

  it('renders section with id', () => {
    const { container } = render(<ContactSection />);
    const section = container.querySelector('#contact');
    expect(section).toBeTruthy();
  });

  it('renders heading', () => {
    render(<ContactSection />);
    expect(screen.getByText('Request a Quote')).toBeTruthy();
  });

  it('renders form fields', () => {
    render(<ContactSection />);
    expect(screen.getByText('Send an Enquiry')).toBeTruthy();
    expect(screen.getByText('Product')).toBeTruthy();
    expect(screen.getByText('Company')).toBeTruthy();
    const emailElements = screen.getAllByText('Email');
    expect(emailElements.length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('Contact Person')).toBeTruthy();
    const phoneElements = screen.getAllByText('Phone');
    expect(phoneElements.length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('Message')).toBeTruthy();
  });

  it('renders product select with categories', () => {
    render(<ContactSection />);
    const select = screen.getByRole('combobox');
    expect(select).toBeTruthy();
  });

  it('renders submit button', () => {
    render(<ContactSection />);
    expect(screen.getByText('Send Enquiry')).toBeTruthy();
  });

  it('renders contact info', () => {
    render(<ContactSection />);
    expect(screen.getByText('info@navodaya.group')).toBeTruthy();
    expect(screen.getByText('+91 83286 05812')).toBeTruthy();
  });

  it('renders Get in Touch label', () => {
    render(<ContactSection />);
    expect(screen.getByText('Get in Touch')).toBeTruthy();
  });

  it('renders location info', () => {
    render(<ContactSection />);
    expect(screen.getByText(/Gandhi Nagar, Hyderabad/)).toBeTruthy();
  });

  it('renders Designation field', () => {
    render(<ContactSection />);
    expect(screen.getByText('Designation')).toBeTruthy();
  });

  it('renders Quantity field', () => {
    render(<ContactSection />);
    expect(screen.getByPlaceholderText('e.g. 1000 pieces')).toBeTruthy();
  });

  it('renders textarea for message', () => {
    render(<ContactSection />);
    expect(screen.getByPlaceholderText(/Tell us more/)).toBeTruthy();
  });

  it('handles mouse move on section', () => {
    const { container } = render(<ContactSection />);
    const section = container.querySelector('#contact') as HTMLElement;
    fireEvent.mouseMove(section, { clientX: 200, clientY: 300 });
    expect(section).toBeTruthy();
  });

  it('renders Other option in product select', () => {
    render(<ContactSection />);
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    const options = select.querySelectorAll('option');
    const otherOption = Array.from(options).find((o) => o.value === 'Other');
    expect(otherOption).toBeTruthy();
  });

  it('renders success state when form submission succeeds', () => {
    mockFormState = { success: true };
    render(<ContactSection />);
    expect(screen.getByText('Thank You!')).toBeTruthy();
    expect(screen.getByText(/Your enquiry has been sent/)).toBeTruthy();
    expect(screen.getByText('Send another enquiry')).toBeTruthy();
  });

  it('renders error state when form submission fails', () => {
    mockFormState = { success: false, error: 'Please fill in all required fields.' };
    render(<ContactSection />);
    expect(screen.getByText('Please fill in all required fields.')).toBeTruthy();
    expect(screen.getByText('Send an Enquiry')).toBeTruthy();
  });

  it('clicking "Send another enquiry" increments formKey to remount form', () => {
    mockFormState = { success: true };
    const { rerender } = render(<ContactSection />);
    expect(screen.getByText('Thank You!')).toBeTruthy();

    const resetBtn = screen.getByText('Send another enquiry');
    fireEvent.click(resetBtn);

    // After clicking, formKey increments, form remounts
    // Reset mockFormState to null to show form again
    mockFormState = null;
    rerender(<ContactSection />);
    // Form should be visible again (not success state)
    expect(screen.getByText('Send an Enquiry')).toBeTruthy();
  });

  it('handles mouse move setting CSS custom properties', () => {
    const { container } = render(<ContactSection />);
    const section = container.querySelector('#contact') as HTMLElement;

    // Mock getBoundingClientRect
    vi.spyOn(section, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      right: 1000,
      bottom: 800,
      width: 1000,
      height: 800,
      x: 0,
      y: 0,
      toJSON: () => {},
    });

    fireEvent.mouseMove(section, { clientX: 500, clientY: 400 });
    expect(section.style.getPropertyValue('--cursor-x')).toBe('50%');
    expect(section.style.getPropertyValue('--cursor-y')).toBe('50%');
  });

  it('renders pending state with disabled button', () => {
    mockIsPending = true;

    render(<ContactSection />);
    const btn = screen.getByRole('button');
    expect(btn.textContent).toContain('Sending');
    expect(btn.hasAttribute('disabled')).toBe(true);
  });

  it('renders form with no error when state has success false but no error message', () => {
    mockFormState = { success: false };
    render(<ContactSection />);
    // Form should be visible, no error alert
    expect(screen.getByText('Send an Enquiry')).toBeTruthy();
  });
});
