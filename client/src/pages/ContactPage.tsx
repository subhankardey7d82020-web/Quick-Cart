import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';

export const ContactPage: React.FC = () => {
  const { settings } = useSettings();
  const { success } = useToast();

  const [form, setForm] = useState({ name: '', email: '', subject: 'Fit & Sizing Consultation', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    success('Inquiry submitted. Our concierge will be in touch shortly.');
    setForm({ name: '', email: '', subject: 'Fit & Sizing Consultation', message: '' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      <div className="text-center space-y-2">
        <p className="text-xs uppercase tracking-widest text-neutral-400 font-semibold">
          Client Concierge
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl text-noir-900 font-normal">
          Connect With Our Boutique
        </h1>
        <p className="text-xs text-neutral-500 max-w-md mx-auto leading-relaxed">
          Inquire regarding custom sizing, private appointments, order tracking, or bridal wardrobing.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Left Column: Direct Boutique Info */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 bg-white border border-sand-200 shadow-xs space-y-4">
            <h3 className="font-serif text-lg font-normal uppercase tracking-wider text-noir-900 pb-2 border-b border-sand-200">
              Flagship Atelier
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-start space-x-3 text-neutral-600">
                <MapPin className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-noir-900 block mb-0.5">Physical Address</strong>
                  <p>{settings.contactAddress}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 text-neutral-600">
                <Phone className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-noir-900 block mb-0.5">Concierge Phone</strong>
                  <p>{settings.contactPhone}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 text-neutral-600">
                <Mail className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-noir-900 block mb-0.5">Direct Correspondence</strong>
                  <p>{settings.contactEmail}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 text-neutral-600">
                <Clock className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-noir-900 block mb-0.5">Boutique Hours</strong>
                  <p>Monday – Saturday: 10:00 AM – 8:00 PM IST</p>
                  <p>Sunday: By Prior Appointment Only</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Inquiry Form */}
        <div className="lg:col-span-7">
          <div className="p-6 sm:p-8 bg-white border border-sand-200 shadow-xs space-y-6">
            <h3 className="font-serif text-lg font-normal uppercase tracking-wider text-noir-900 pb-2 border-b border-sand-200">
              Send an Inquiry
            </h3>

            {sent ? (
              <div className="p-6 bg-cream-50 border border-sand-200 text-center space-y-3">
                <CheckCircle2 className="w-8 h-8 text-accent mx-auto" />
                <h4 className="font-serif text-lg text-noir-900">Message Received</h4>
                <p className="text-xs text-neutral-600 max-w-sm mx-auto">
                  Our dedicated client concierge team reviews inquiries and will respond to your provided email within 2-4 business hours.
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="px-4 py-2 bg-noir-900 text-cream-50 text-xs uppercase tracking-wider font-semibold"
                >
                  Send Another Note
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-noir-800 font-semibold mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Maya Singhania"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full p-2.5 bg-cream-50/50 border border-sand-300 text-xs focus:outline-none focus:border-noir-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-widest text-noir-800 font-semibold mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="maya@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full p-2.5 bg-cream-50/50 border border-sand-300 text-xs focus:outline-none focus:border-noir-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-noir-800 font-semibold mb-1">
                    Subject of Inquiry
                  </label>
                  <select
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full p-2.5 bg-cream-50/50 border border-sand-300 text-xs focus:outline-none focus:border-noir-900 cursor-pointer"
                  >
                    <option value="Fit & Sizing Consultation">Fit & Sizing Consultation</option>
                    <option value="Order & Tracking Inquiries">Order & Tracking Inquiries</option>
                    <option value="Custom Bespoke Tailoring">Custom Bespoke Tailoring</option>
                    <option value="Press & Collaborative Projects">Press & Collaborative Projects</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-noir-800 font-semibold mb-1">
                    Detailed Message *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe how our concierge may assist you..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full p-2.5 bg-cream-50/50 border border-sand-300 text-xs focus:outline-none focus:border-noir-900"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 bg-noir-900 hover:bg-noir-800 text-cream-50 text-xs uppercase tracking-widest font-semibold flex items-center space-x-2 transition-all shadow-md"
                >
                  <Send className="w-3.5 h-3.5 text-accent" />
                  <span>Transmit Note to Concierge</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
