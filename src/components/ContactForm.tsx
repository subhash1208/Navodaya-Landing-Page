import React, { useState } from 'react';
import { Send, CheckCircle, Package, Users, Mail, Phone, MessageSquare } from 'lucide-react';
import { ContactFormData } from '../types';

const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    productName: '',
    quantity: '',
    companyName: '',
    companyEmail: '',
    contactPersonName: '',
    contactPersonDesignation: '',
    contactPersonNumber: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // In a real application, you would send this data to your backend
      // For now, we'll simulate the submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Form data to be sent to info@navodaya.group:', formData);
      
      setIsSubmitted(true);
      setFormData({
        productName: '',
        quantity: '',
        companyName: '',
        companyEmail: '',
        contactPersonName: '',
        contactPersonDesignation: '',
        contactPersonNumber: '',
        message: ''
      });

      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <section id="contact" className="min-h-screen flex items-center justify-center p-4 animate-fadeIn">
        <div className="backdrop-blur-xl bg-white/20 border border-white/30 rounded-3xl p-8 max-w-2xl w-full text-center hover-lift">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-slate-800 mb-4 animate-slide-up">Thank You!</h3>
          <p className="text-slate-700 text-lg animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Your message has been sent successfully. We'll get back to you soon at {formData.companyEmail || 'your email'}.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="contact" className="min-h-screen flex items-center justify-center p-4 animate-fadeIn">
      <div className="backdrop-blur-xl bg-white/20 border border-white/30 rounded-3xl p-8 md:p-12 max-w-4xl w-full hover-lift">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4 animate-slide-up">
            Get in Touch
          </h2>
          <p className="text-slate-700 text-lg animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Tell us about your requirements and we'll help you find the perfect solution
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="productName" className="flex items-center space-x-2 text-slate-700 font-medium">
                <Package className="w-4 h-4" />
                <span>Product Name</span>
              </label>
              <select
                id="productName"
                name="productName"
                value={formData.productName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-xl backdrop-blur-sm bg-white/30 border border-white/30 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-400 hover:bg-white/40"
              >
                <option value="">Select a product</option>
                <option value="Paper Cups">Paper Cups</option>
                <option value="Garbage Bags">Garbage Bags</option>
                <option value="Cable Ties">Cable Ties</option>
                <option value="Beard Masks">Beard Masks</option>
                <option value="Shoe Masks">Shoe Masks</option>
                <option value="Latex Gloves">Latex Gloves</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="quantity" className="text-slate-700 font-medium">Quantity</label>
              <input
                type="text"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                required
                placeholder="e.g., 1000 pieces, 50 boxes"
                className="w-full px-4 py-3 rounded-xl backdrop-blur-sm bg-white/30 border border-white/30 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-400 hover:bg-white/40"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="companyName" className="flex items-center space-x-2 text-slate-700 font-medium">
                <Users className="w-4 h-4" />
                <span>Company Name</span>
              </label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                required
                placeholder="Your company name"
                className="w-full px-4 py-3 rounded-xl backdrop-blur-sm bg-white/30 border border-white/30 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-400 hover:bg-white/40"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="companyEmail" className="flex items-center space-x-2 text-slate-700 font-medium">
                <Mail className="w-4 h-4" />
                <span>Company Email</span>
              </label>
              <input
                type="email"
                id="companyEmail"
                name="companyEmail"
                value={formData.companyEmail}
                onChange={handleInputChange}
                required
                placeholder="company@example.com"
                className="w-full px-4 py-3 rounded-xl backdrop-blur-sm bg-white/30 border border-white/30 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-400 hover:bg-white/40"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="contactPersonName" className="text-slate-700 font-medium">Contact Person Name</label>
              <input
                type="text"
                id="contactPersonName"
                name="contactPersonName"
                value={formData.contactPersonName}
                onChange={handleInputChange}
                required
                placeholder="Full name"
                className="w-full px-4 py-3 rounded-xl backdrop-blur-sm bg-white/30 border border-white/30 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-400 hover:bg-white/40"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="contactPersonDesignation" className="text-slate-700 font-medium">Designation</label>
              <input
                type="text"
                id="contactPersonDesignation"
                name="contactPersonDesignation"
                value={formData.contactPersonDesignation}
                onChange={handleInputChange}
                required
                placeholder="e.g., Manager, Director"
                className="w-full px-4 py-3 rounded-xl backdrop-blur-sm bg-white/30 border border-white/30 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-400 hover:bg-white/40"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="contactPersonNumber" className="flex items-center space-x-2 text-slate-700 font-medium">
              <Phone className="w-4 h-4" />
              <span>Contact Number</span>
            </label>
            <input
              type="tel"
              id="contactPersonNumber"
              name="contactPersonNumber"
              value={formData.contactPersonNumber}
              onChange={handleInputChange}
              required
              placeholder="+91 XXXXX XXXXX"
              className="w-full px-4 py-3 rounded-xl backdrop-blur-sm bg-white/30 border border-white/30 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-400 hover:bg-white/40"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="message" className="flex items-center space-x-2 text-slate-700 font-medium">
              <MessageSquare className="w-4 h-4" />
              <span>Message</span>
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              rows={4}
              placeholder="Tell us more about your requirements..."
              className="w-full px-4 py-3 rounded-xl backdrop-blur-sm bg-white/30 border border-white/30 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-400 resize-none hover:bg-white/40"
            ></textarea>
          </div>

          <div className="text-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-400 disabled:to-slate-500 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center space-x-3 mx-auto disabled:transform-none disabled:hover:shadow-none relative overflow-hidden"
            >
              <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
              <Send className={`w-5 h-5 ${isSubmitting ? 'animate-pulse' : 'group-hover:translate-x-2'} transition-transform duration-300`} />
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default ContactForm;