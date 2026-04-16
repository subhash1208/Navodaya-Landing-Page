import { useState, useCallback } from 'react';
import { Send, CheckCircle, Package, Users, Mail, Phone, MessageSquare, User, Briefcase } from 'lucide-react';
import { ContactFormData } from '../types';
import { cn } from '../utils/cn';
import { PRODUCTS, SECTION_IDS } from '../constants';

const EMPTY_FORM: ContactFormData = {
  productName: '',
  quantity: '',
  companyName: '',
  companyEmail: '',
  contactPersonName: '',
  contactPersonDesignation: '',
  contactPersonNumber: '',
  message: '',
};

interface FieldProps {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const Field: React.FC<FieldProps> = ({ label, icon, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="flex items-center gap-1.5 text-caption font-semibold text-slate-700">
      {icon && <span aria-hidden="true">{icon}</span>}
      {label}
    </label>
    {children}
  </div>
);

const inputClass = cn(
  'w-full px-4 py-3 rounded-xl bg-surface-subtle border border-slate-200',
  'text-sm text-slate-800 placeholder:text-slate-400',
  'hover:border-slate-300 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20',
  'outline-none transition-all duration-200 ease-smooth min-h-[44px]'
);

const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormData>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Simulate API call — replace with real endpoint
      await new Promise<void>((resolve) => setTimeout(resolve, 1800));
      setSubmittedEmail(formData.companyEmail);
      setIsSubmitted(true);
      setFormData(EMPTY_FORM);
      setTimeout(() => setIsSubmitted(false), 6000);
    } catch {
      // Handle error state here
    } finally {
      setIsSubmitting(false);
    }
  }, [formData.companyEmail]);

  if (isSubmitted) {
    return (
      <section id={SECTION_IDS.CONTACT} className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white border border-slate-100 rounded-card p-10 max-w-lg w-full text-center shadow-card animate-scale-in" role="alert" aria-live="polite">
          <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-5" aria-hidden="true" />
          <h2 className="text-heading text-brand-dark mb-3">Thank You!</h2>
          <p className="text-body text-slate-500">
            Your enquiry has been sent. We'll get back to you at{' '}
            <strong className="text-brand-primary">{submittedEmail}</strong> shortly.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id={SECTION_IDS.CONTACT} className="min-h-screen flex items-center justify-center p-4 py-section">
      <div className="bg-white border border-slate-100 rounded-card p-8 md:p-12 max-w-4xl w-full shadow-card animate-fade-up">

        <div className="text-center mb-10">
          <h2 className="text-heading text-brand-dark mb-3">Get in Touch</h2>
          <p className="text-body text-slate-500">
            Tell us about your requirements and we'll find the perfect solution.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Field label="Product" icon={<Package className="w-3.5 h-3.5" />}>
              <select
                id="productName"
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                required
                className={inputClass}
              >
                <option value="">Select a product</option>
                {PRODUCTS.map((p) => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
                <option value="Other">Other</option>
              </select>
            </Field>

            <Field label="Quantity">
              <input
                type="text"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
                placeholder="e.g. 1000 pieces, 50 boxes"
                className={inputClass}
              />
            </Field>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Field label="Company Name" icon={<Users className="w-3.5 h-3.5" />}>
              <input
                type="text"
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
                placeholder="Your company name"
                className={inputClass}
              />
            </Field>

            <Field label="Company Email" icon={<Mail className="w-3.5 h-3.5" />}>
              <input
                type="email"
                id="companyEmail"
                name="companyEmail"
                value={formData.companyEmail}
                onChange={handleChange}
                required
                placeholder="company@example.com"
                className={inputClass}
              />
            </Field>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Field label="Contact Person" icon={<User className="w-3.5 h-3.5" />}>
              <input
                type="text"
                id="contactPersonName"
                name="contactPersonName"
                value={formData.contactPersonName}
                onChange={handleChange}
                required
                placeholder="Full name"
                className={inputClass}
              />
            </Field>

            <Field label="Designation" icon={<Briefcase className="w-3.5 h-3.5" />}>
              <input
                type="text"
                id="contactPersonDesignation"
                name="contactPersonDesignation"
                value={formData.contactPersonDesignation}
                onChange={handleChange}
                required
                placeholder="e.g. Manager, Director"
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Contact Number" icon={<Phone className="w-3.5 h-3.5" />}>
            <input
              type="tel"
              id="contactPersonNumber"
              name="contactPersonNumber"
              value={formData.contactPersonNumber}
              onChange={handleChange}
              required
              placeholder="+91 XXXXX XXXXX"
              className={inputClass}
            />
          </Field>

          <Field label="Message" icon={<MessageSquare className="w-3.5 h-3.5" />}>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={4}
              placeholder="Tell us more about your requirements..."
              className={cn(inputClass, 'resize-none min-h-[120px]')}
            />
          </Field>

          <div className="text-center pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                'group inline-flex items-center gap-3 px-10 py-4 rounded-card font-semibold text-sm text-white',
                'bg-brand-primary hover:bg-brand-primary/90 hover:-translate-y-0.5 hover:shadow-glow',
                'disabled:bg-slate-300 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none',
                'transition-all duration-200 ease-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2',
                'min-h-[44px]'
              )}
            >
              <span>{isSubmitting ? 'Sending…' : 'Send Enquiry'}</span>
              <Send
                className={cn('w-4 h-4 transition-transform duration-200', isSubmitting ? 'animate-pulse' : 'group-hover:translate-x-1')}
                aria-hidden="true"
              />
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default ContactForm;
