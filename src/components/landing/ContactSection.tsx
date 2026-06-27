'use client';

import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitted(true);
        setFormData({ name: '', email: '', phone: '', message: '' });
        setTimeout(() => setSubmitted(false), 5000);
      } else {
        const data = await response.json();
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#F4ECE1]">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-sm uppercase tracking-[0.2em] text-[#A9755A] mb-3">
            Contact
          </p>
          <h2 className="font-serif text-4xl sm:text-5xl text-[#2A211B] leading-tight">
            Get In Touch
          </h2>
          <p className="mt-4 text-[#6F6055] max-w-xl mx-auto">
            Have questions? We&apos;d love to hear from you. Send us a message
            and we&apos;ll get back to you as soon as possible.
          </p>
        </div>

        {/* Form */}
        <div className="bg-[#EBE0D1] rounded-[2rem] p-8 lg:p-12">
          {submitted && (
            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              Thank you for contacting us. We&apos;ll get back to you soon!
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label
                  htmlFor="contact-name"
                  className="block text-sm font-medium text-[#2A211B] mb-2"
                >
                  Full Name
                </label>
                <input
                  id="contact-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  minLength={2}
                  className="w-full px-4 py-3 border border-[#2A211B]/15 rounded-xl focus:ring-2 focus:ring-[#A9755A] focus:border-transparent outline-none transition bg-[#F4ECE1]"
                  placeholder="Your name"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="contact-email"
                  className="block text-sm font-medium text-[#2A211B] mb-2"
                >
                  Email Address
                </label>
                <input
                  id="contact-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-[#2A211B]/15 rounded-xl focus:ring-2 focus:ring-[#A9755A] focus:border-transparent outline-none transition bg-[#F4ECE1]"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            {/* Phone (optional) */}
            <div>
              <label
                htmlFor="contact-phone"
                className="block text-sm font-medium text-[#2A211B] mb-2"
              >
                Phone Number <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                id="contact-phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-transparent outline-none transition bg-white"
                placeholder="+44 123 456 7890"
              />
            </div>

            {/* Message */}
            <div>
              <label
                htmlFor="contact-message"
                className="block text-sm font-medium text-[#2A211B] mb-2"
              >
                Message
              </label>
              <textarea
                id="contact-message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                minLength={10}
                rows={6}
                className="w-full px-4 py-3 border border-[#2A211B]/15 rounded-xl focus:ring-2 focus:ring-[#A9755A] focus:border-transparent outline-none transition resize-none bg-[#F4ECE1]"
                placeholder="Tell us how we can help..."
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              fullWidth
              disabled={loading}
              className="bg-[#2A211B] hover:bg-[#A9755A] text-[#F4ECE1] font-medium py-3 rounded-full transition-colors focus:ring-[#A9755A]"
            >
              {loading ? 'Sending...' : 'Send Message'}
            </Button>
          </form>
        </div>

        {/* Contact Info Row */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-3xl mb-3">📧</div>
            <h4 className="font-semibold text-[#2A211B] mb-1">Email</h4>
            <p className="text-[#6F6055] text-sm">support@turkanabla.uk</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-3">📱</div>
            <h4 className="font-semibold text-[#2A211B] mb-1">Phone</h4>
            <p className="text-[#6F6055] text-sm">+44 (0) 123 456 7890</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-3">📍</div>
            <h4 className="font-semibold text-[#2A211B] mb-1">Location</h4>
            <p className="text-[#6F6055] text-sm">United Kingdom</p>
          </div>
        </div>
      </div>
    </section>
  );
}
