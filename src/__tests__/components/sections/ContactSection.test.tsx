import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ContactSection from '@/components/sections/ContactSection';
import { BRAND, PRODUCTS, productEnquiryLabel } from '@/constants';
import { submitContactForm } from '@/app/actions/contact';

/**
 * `react` is deliberately NOT mocked here.
 *
 * An earlier revision replaced `useActionState` wholesale and drove the component from a
 * module-level `mockFormState`. The "Send another enquiry" test then set `mockFormState = null`
 * by hand after clicking the button — the test performing the state change the component was
 * supposed to perform — so it passed while the button did nothing at all. Every assertion below
 * runs against the real hook and a real form submission.
 */

vi.mock('motion/react', () => {
  // The component per tag is CACHED. A bare `get` handler returns a fresh function on every
  // property access, so `motion.div` is a different component type on every render and React
  // tears down and rebuilds the whole subtree — which silently destroys uncontrolled input
  // values and makes every node-identity assertion below fail for a reason that exists only in
  // the mock. The real `motion.div` is a stable reference.
  const cache = new Map<string, React.ComponentType<Record<string, unknown>>>();
  return {
    motion: new Proxy(
      {},
      {
        get: (_, tag) => {
          const key = String(tag);
          let component = cache.get(key);
          if (!component) {
            component = (props: Record<string, unknown>) => {
              const {
                initial,
                animate,
                exit,
                transition,
                whileInView,
                variants,
                viewport,
                ...rest
              } = props;
              void [initial, animate, exit, transition, whileInView, variants, viewport];
              return <div data-testid={`motion-${key}`} {...rest} />;
            };
            cache.set(key, component);
          }
          return component;
        },
      },
    ),
  };
});

vi.mock('lucide-react', () => ({
  Send: (props: Record<string, unknown>) => <svg data-testid="send-icon" {...props} />,
  CheckCircle: (props: Record<string, unknown>) => <svg data-testid="check-icon" {...props} />,
  AlertCircle: (props: Record<string, unknown>) => <svg data-testid="alert-icon" {...props} />,
  Package: (props: Record<string, unknown>) => <svg data-testid="package-icon" {...props} />,
  Users: (props: Record<string, unknown>) => <svg data-testid="users-icon" {...props} />,
  Mail: (props: Record<string, unknown>) => <svg data-testid="mail-icon" {...props} />,
  Phone: (props: Record<string, unknown>) => <svg data-testid="phone-icon" {...props} />,
  MessageSquare: (props: Record<string, unknown>) => <svg data-testid="message-icon" {...props} />,
  User: (props: Record<string, unknown>) => <svg data-testid="user-icon" {...props} />,
  Briefcase: (props: Record<string, unknown>) => <svg data-testid="briefcase-icon" {...props} />,
}));

vi.mock('@/app/actions/contact', () => ({
  submitContactForm: vi.fn(),
}));

const mockSubmit = vi.mocked(submitContactForm);
const FIRST_PRODUCT_VALUE = productEnquiryLabel(PRODUCTS[0]);

function fillForm(overrides: { product?: string; phone?: string; other?: string } = {}) {
  fireEvent.change(screen.getByRole('combobox'), {
    target: { value: overrides.product ?? FIRST_PRODUCT_VALUE },
  });
  if (overrides.other !== undefined) {
    fireEvent.change(screen.getByPlaceholderText('Describe the product you need'), {
      target: { value: overrides.other },
    });
  }
  fireEvent.change(screen.getByPlaceholderText('e.g. 1000 pieces'), {
    target: { value: '1000 pieces' },
  });
  fireEvent.change(screen.getByPlaceholderText('Company name'), { target: { value: 'Test Co' } });
  fireEvent.change(screen.getByPlaceholderText('company@example.com'), {
    target: { value: 'buyer@test.com' },
  });
  fireEvent.change(screen.getByPlaceholderText('Full name'), { target: { value: 'Jane Doe' } });
  fireEvent.change(screen.getByPlaceholderText('+91 XXXXX XXXXX'), {
    target: { value: overrides.phone ?? '+91 98765 43210' },
  });
}

function submitForm() {
  fireEvent.click(screen.getByRole('button', { name: /send enquiry/i }));
}

describe('ContactSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSubmit.mockResolvedValue({ success: true });
  });

  it('renders section with id', () => {
    const { container } = render(<ContactSection />);
    expect(container.querySelector('#contact')).toBeTruthy();
  });

  it('renders the section on a solid ink surface, not a gradient, keeping cursor-spotlight', () => {
    const { container } = render(<ContactSection />);
    const section = container.querySelector('#contact') as HTMLElement;
    expect(section.className).toContain('bg-ink');
    expect(section.className).not.toContain('bg-gradient-');
    expect(section.className).toContain('cursor-spotlight');
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
    expect(screen.getAllByText('Email').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('Contact Person')).toBeTruthy();
    expect(screen.getAllByText('Phone').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('Message')).toBeTruthy();
  });

  it('renders submit button', () => {
    render(<ContactSection />);
    expect(screen.getByText('Send Enquiry')).toBeTruthy();
  });

  it('renders contact info', () => {
    render(<ContactSection />);
    expect(screen.getByText(BRAND.EMAIL)).toBeTruthy();
    expect(screen.getByText(BRAND.PHONE)).toBeTruthy();
  });

  it('renders Get in Touch label', () => {
    render(<ContactSection />);
    expect(screen.getByText('Get in Touch')).toBeTruthy();
  });

  it('renders the section index and mono field labels', () => {
    render(<ContactSection />);
    expect(screen.getByText('05')).toBeTruthy();
    expect(screen.getByText('Message').className).toContain('font-mono');
  });

  it('renders the heading in the dark-ground inversion, never near-black on near-black', () => {
    render(<ContactSection />);
    const heading = screen.getByText('Request a Quote');
    expect(heading.className).toContain('text-paper');
    expect(heading.className).not.toContain('text-ink');
  });

  it('renders location info', () => {
    render(<ContactSection />);
    expect(screen.getByText(new RegExp(BRAND.LOCATION))).toBeTruthy();
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

  it('handles mouse move setting CSS custom properties', () => {
    const { container } = render(<ContactSection />);
    const section = container.querySelector('#contact') as HTMLElement;

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

  it('throttles mouse moves that arrive inside the 32ms window', () => {
    const { container } = render(<ContactSection />);
    const section = container.querySelector('#contact') as HTMLElement;
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
    const now = vi.spyOn(performance, 'now');

    now.mockReturnValue(1000);
    fireEvent.mouseMove(section, { clientX: 500, clientY: 400 });
    expect(section.style.getPropertyValue('--cursor-x')).toBe('50%');

    now.mockReturnValue(1010);
    fireEvent.mouseMove(section, { clientX: 100, clientY: 100 });
    expect(section.style.getPropertyValue('--cursor-x')).toBe('50%');

    now.mockRestore();
  });

  describe('product dropdown', () => {
    it('paints an opaque dark surface so the native popup is not white-on-white', () => {
      render(<ContactSection />);
      const select = screen.getByRole('combobox');
      expect(select.className).toContain('bg-ink');
      expect(select.className).not.toContain('bg-transparent');
      expect(select.className).toContain('[color-scheme:dark]');
      expect(select.className).toContain('[&>option]:bg-ink');
      expect(select.className).toContain('[&>option]:text-paper');
    });

    it('submits productEnquiryLabel as each option value while showing the bare name', () => {
      render(<ContactSection />);
      const select = screen.getByRole('combobox') as HTMLSelectElement;
      const options = Array.from(select.querySelectorAll('option'));

      for (const product of PRODUCTS) {
        const option = options.find((o) => o.value === productEnquiryLabel(product));
        expect(option, `no option for ${product.id}`).toBeTruthy();
        expect(option?.textContent).toBe(product.name);
      }
    });

    it('distinguishes the two duplicate-name product pairs by value', () => {
      render(<ContactSection />);
      const select = screen.getByRole('combobox') as HTMLSelectElement;
      const values = Array.from(select.querySelectorAll('option')).map((o) => o.value);

      const duplicatePairs = [
        ['bio-shower-cap', 'bio-shower-spa'],
        ['bouffant-cap', 'bouffant-spa'],
      ];
      for (const [a, b] of duplicatePairs) {
        const first = PRODUCTS.find((p) => p.id === a);
        const second = PRODUCTS.find((p) => p.id === b);
        expect(first && second).toBeTruthy();
        expect(first!.name).toBe(second!.name);
        expect(productEnquiryLabel(first!)).not.toBe(productEnquiryLabel(second!));
        expect(values).toContain(productEnquiryLabel(first!));
        expect(values).toContain(productEnquiryLabel(second!));
      }
    });

    it('renders Other option in product select', () => {
      render(<ContactSection />);
      const select = screen.getByRole('combobox') as HTMLSelectElement;
      const options = Array.from(select.querySelectorAll('option'));
      expect(options.find((o) => o.value === 'Other')).toBeTruthy();
    });
  });

  describe('"Other" free-text detail', () => {
    it('is hidden until Other is selected and disappears again afterwards', () => {
      render(<ContactSection />);
      expect(screen.queryByPlaceholderText('Describe the product you need')).toBeNull();

      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Other' } });
      expect(screen.getByPlaceholderText('Describe the product you need')).toBeTruthy();

      fireEvent.change(screen.getByRole('combobox'), { target: { value: FIRST_PRODUCT_VALUE } });
      expect(screen.queryByPlaceholderText('Describe the product you need')).toBeNull();
    });

    it('does not shift its sibling fields when it appears', () => {
      render(<ContactSection />);
      const quantityBefore = screen.getByPlaceholderText('e.g. 1000 pieces');

      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Other' } });

      // Trailing slot: Product and Quantity keep their positions, so neither remounts.
      expect(screen.getByPlaceholderText('e.g. 1000 pieces')).toBe(quantityBefore);
    });

    it('folds the detail into the submitted product name', async () => {
      render(<ContactSection />);
      fillForm({ product: 'Other', other: 'Custom laminated apron' });
      submitForm();

      await waitFor(() => expect(mockSubmit).toHaveBeenCalledTimes(1));
      expect(mockSubmit.mock.calls[0][0].productName).toBe('Other — Custom laminated apron');
    });

    it('submits an empty product when Other is chosen with no detail', async () => {
      mockSubmit.mockResolvedValue({ success: false, error: 'Product name is required.' });
      render(<ContactSection />);
      fillForm({ product: 'Other', other: '   ' });
      submitForm();

      await waitFor(() => expect(mockSubmit).toHaveBeenCalledTimes(1));
      expect(mockSubmit.mock.calls[0][0].productName).toBe('');
    });
  });

  describe('submission', () => {
    it('forwards every field as a string', async () => {
      render(<ContactSection />);
      fillForm();
      fireEvent.change(screen.getByPlaceholderText('e.g. Manager'), {
        target: { value: 'Buyer' },
      });
      fireEvent.change(screen.getByPlaceholderText(/Tell us more/), {
        target: { value: 'Bulk order' },
      });
      submitForm();

      await waitFor(() => expect(mockSubmit).toHaveBeenCalledTimes(1));
      expect(mockSubmit.mock.calls[0][0]).toEqual({
        productName: FIRST_PRODUCT_VALUE,
        quantity: '1000 pieces',
        companyName: 'Test Co',
        companyEmail: 'buyer@test.com',
        contactPersonName: 'Jane Doe',
        contactPersonDesignation: 'Buyer',
        contactPersonNumber: '+91 98765 43210',
        message: 'Bulk order',
        honeypot: '',
      });
    });

    it('sends empty strings for fields the visitor left untouched', async () => {
      render(<ContactSection />);
      submitForm();

      await waitFor(() => expect(mockSubmit).toHaveBeenCalledTimes(1));
      expect(mockSubmit.mock.calls[0][0]).toEqual({
        productName: '',
        quantity: '',
        companyName: '',
        companyEmail: '',
        contactPersonName: '',
        contactPersonDesignation: '',
        contactPersonNumber: '',
        message: '',
        honeypot: '',
      });
    });

    it('renders the success panel after a successful submission', async () => {
      render(<ContactSection />);
      fillForm();
      submitForm();

      expect(await screen.findByText('Thank You!')).toBeTruthy();
      expect(screen.getByText(/Your enquiry has been sent/)).toBeTruthy();
      expect(screen.getByText('Send another enquiry')).toBeTruthy();
    });

    it('renders the error alert when the action reports a failure', async () => {
      mockSubmit.mockResolvedValue({ success: false, error: 'Invalid phone number.' });
      render(<ContactSection />);
      fillForm({ phone: '123' });
      submitForm();

      expect(await screen.findByText('Invalid phone number.')).toBeTruthy();
      expect(screen.getByText('Send an Enquiry')).toBeTruthy();
    });

    it('renders no alert when the action fails without a message', async () => {
      mockSubmit.mockResolvedValue({ success: false });
      render(<ContactSection />);
      fillForm();
      submitForm();

      await waitFor(() => expect(mockSubmit).toHaveBeenCalledTimes(1));
      expect(screen.getByText('Send an Enquiry')).toBeTruthy();
      expect(screen.queryByRole('alert')).toBeNull();
    });

    it('preserves typed input and node identity across an error re-render', async () => {
      mockSubmit.mockResolvedValue({ success: false, error: 'Quantity is required.' });
      render(<ContactSection />);

      const message = screen.getByPlaceholderText(/Tell us more/) as HTMLTextAreaElement;
      fillForm();
      fireEvent.change(message, { target: { value: 'typed before the error' } });
      submitForm();

      expect(await screen.findByText('Quantity is required.')).toBeTruthy();
      // A re-rendered form must not be a REBUILT form: same node, same uncontrolled value.
      expect(screen.getByPlaceholderText(/Tell us more/)).toBe(message);
      expect((screen.getByPlaceholderText(/Tell us more/) as HTMLTextAreaElement).value).toBe(
        'typed before the error',
      );
    });

    it('disables the submit button while pending so a double click fires the action once', async () => {
      let resolveAction: (value: { success: boolean }) => void = () => {};
      mockSubmit.mockReturnValue(
        new Promise<{ success: boolean }>((resolve) => {
          resolveAction = resolve;
        }),
      );

      render(<ContactSection />);
      fillForm();

      const button = screen.getByRole('button', { name: /send enquiry/i });
      fireEvent.click(button);
      fireEvent.click(button);

      await waitFor(() => expect(screen.getByRole('button').textContent).toContain('Sending'));
      expect(screen.getByRole('button').hasAttribute('disabled')).toBe(true);
      expect(mockSubmit).toHaveBeenCalledTimes(1);

      resolveAction({ success: true });
      expect(await screen.findByText('Thank You!')).toBeTruthy();
    });
  });

  describe('honeypot', () => {
    it('is reachable by neither keyboard nor assistive technology', () => {
      const { container } = render(<ContactSection />);
      const honeypot = container.querySelector(
        'input[name="companyWebsite"]',
      ) as HTMLInputElement | null;

      expect(honeypot).toBeTruthy();
      // Not `type="hidden"` — naive form-fillers skip those.
      expect(honeypot!.type).toBe('text');
      expect(honeypot!.tabIndex).toBe(-1);
      expect(honeypot!.getAttribute('autocomplete')).toBe('off');
      expect(honeypot!.closest('[aria-hidden="true"]')).toBeTruthy();
    });

    it('forwards whatever a bot typed into it', async () => {
      const { container } = render(<ContactSection />);
      const honeypot = container.querySelector('input[name="companyWebsite"]') as HTMLInputElement;
      fillForm();
      fireEvent.change(honeypot, { target: { value: 'https://spam.test' } });
      submitForm();

      await waitFor(() => expect(mockSubmit).toHaveBeenCalledTimes(1));
      expect(mockSubmit.mock.calls[0][0].honeypot).toBe('https://spam.test');
    });
  });

  describe('length caps', () => {
    it('caps every free-text input at the server-enforced length', () => {
      render(<ContactSection />);
      // These literals must match `FIELD_LIMITS` in src/app/actions/contact.ts, which is asserted
      // against the same numbers in src/__tests__/actions/contact.test.ts.
      const expected: Array<[string, number]> = [
        ['e.g. 1000 pieces', 100],
        ['Company name', 120],
        ['company@example.com', 120],
        ['Full name', 100],
        ['e.g. Manager', 100],
        ['+91 XXXXX XXXXX', 24],
        ['Tell us more about your requirements...', 2000],
      ];
      for (const [placeholder, max] of expected) {
        const input = screen.getByPlaceholderText(placeholder) as HTMLInputElement;
        expect(input.maxLength, `wrong maxLength on ${placeholder}`).toBe(max);
      }
    });

    it('caps the Other detail below the product cap to leave room for its prefix', () => {
      render(<ContactSection />);
      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Other' } });
      const input = screen.getByPlaceholderText(
        'Describe the product you need',
      ) as HTMLInputElement;
      // 120 (server `productName` cap) minus the 8 characters of the "Other — " prefix.
      expect(input.maxLength).toBe(112);
    });
  });

  describe('per-field errors', () => {
    it('marks the offending input and points it at a rendered message', async () => {
      mockSubmit.mockResolvedValue({
        success: false,
        error: 'Invalid email address.',
        field: 'companyEmail',
      });
      render(<ContactSection />);
      fillForm();
      submitForm();

      const input = (await screen.findByPlaceholderText('company@example.com')) as HTMLInputElement;
      await waitFor(() => expect(input.getAttribute('aria-invalid')).toBe('true'));
      expect(input.getAttribute('aria-describedby')).toBe('companyEmail-error');

      const message = document.getElementById('companyEmail-error');
      expect(message?.textContent).toBe('Invalid email address.');
      // The global banner stays as well — one is for the field, one announces the failure.
      expect(screen.getAllByText('Invalid email address.').length).toBe(2);
    });

    it('leaves every other input unmarked', async () => {
      mockSubmit.mockResolvedValue({
        success: false,
        error: 'Quantity is required.',
        field: 'quantity',
      });
      render(<ContactSection />);
      fillForm();
      submitForm();

      await waitFor(() =>
        expect(
          (screen.getByPlaceholderText('e.g. 1000 pieces') as HTMLInputElement).getAttribute(
            'aria-invalid',
          ),
        ).toBe('true'),
      );
      expect(screen.getByPlaceholderText('Company name').getAttribute('aria-invalid')).toBeNull();
      expect(document.getElementById('companyName-error')).toBeNull();
    });

    it('moves focus to the offending field', async () => {
      mockSubmit.mockResolvedValue({
        success: false,
        error: 'Invalid phone number.',
        field: 'contactPersonNumber',
      });
      render(<ContactSection />);
      fillForm({ phone: '123' });
      submitForm();

      const phone = screen.getByPlaceholderText('+91 XXXXX XXXXX');
      await waitFor(() => expect(document.activeElement).toBe(phone));
    });

    it('focuses the Other detail rather than the select when the product is free text', async () => {
      mockSubmit.mockResolvedValue({
        success: false,
        error: 'Product name is required.',
        field: 'productName',
      });
      render(<ContactSection />);
      fillForm({ product: 'Other', other: '   ' });
      submitForm();

      const detail = screen.getByPlaceholderText('Describe the product you need');
      await waitFor(() => expect(document.activeElement).toBe(detail));
      expect(detail.getAttribute('aria-describedby')).toBe('productName-error');
    });

    it('moves no focus when the failure names no field', async () => {
      mockSubmit.mockResolvedValue({ success: false, error: 'Something broke.' });
      render(<ContactSection />);
      const company = screen.getByPlaceholderText('Company name');
      company.focus();
      fillForm();
      submitForm();

      expect(await screen.findByText('Something broke.')).toBeTruthy();
      expect(document.activeElement).toBe(company);
    });
  });

  describe('fallback contact details', () => {
    it('renders a send failure that still tells the visitor how to reach the business', async () => {
      mockSubmit.mockResolvedValue({
        success: false,
        error: `Failed to send your enquiry. Please try again, or please email us directly at ${BRAND.EMAIL} or call ${BRAND.PHONE}.`,
      });
      render(<ContactSection />);
      fillForm();
      submitForm();

      const banner = await screen.findByRole('alert');
      expect(banner.textContent).toContain(BRAND.EMAIL);
      expect(banner.textContent).toContain(BRAND.PHONE);
    });
  });

  describe('"Send another enquiry"', () => {
    it('actually brings the form back, empty', async () => {
      render(<ContactSection />);
      fillForm();
      fireEvent.change(screen.getByPlaceholderText(/Tell us more/), {
        target: { value: 'first enquiry' },
      });
      submitForm();

      expect(await screen.findByText('Thank You!')).toBeTruthy();

      fireEvent.click(screen.getByText('Send another enquiry'));

      // The bug this replaces: the click bumped an unrelated `formKey`, `state.success` stayed
      // true, and the success panel never went away.
      expect(screen.queryByText('Thank You!')).toBeNull();
      expect(screen.getByText('Send an Enquiry')).toBeTruthy();
      expect((screen.getByPlaceholderText('Company name') as HTMLInputElement).value).toBe('');
      expect((screen.getByPlaceholderText(/Tell us more/) as HTMLTextAreaElement).value).toBe('');
      expect((screen.getByRole('combobox') as HTMLSelectElement).value).toBe('');
    });

    it('closes the Other detail field along with the success panel', async () => {
      render(<ContactSection />);
      fillForm({ product: 'Other', other: 'Custom apron' });
      submitForm();

      expect(await screen.findByText('Thank You!')).toBeTruthy();
      fireEvent.click(screen.getByText('Send another enquiry'));

      expect(screen.queryByPlaceholderText('Describe the product you need')).toBeNull();
    });

    it('can send a second enquiry after dismissing the first', async () => {
      render(<ContactSection />);
      fillForm();
      submitForm();
      expect(await screen.findByText('Thank You!')).toBeTruthy();

      fireEvent.click(screen.getByText('Send another enquiry'));
      fillForm({ product: productEnquiryLabel(PRODUCTS[1]) });
      submitForm();

      expect(await screen.findByText('Thank You!')).toBeTruthy();
      expect(mockSubmit).toHaveBeenCalledTimes(2);
      expect(mockSubmit.mock.calls[1][0].productName).toBe(productEnquiryLabel(PRODUCTS[1]));
    });
  });
});
