import React, { useState } from 'react';
import { MessageSquare, Mail, MapPin, Phone, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext.js';
import { SEO } from '../../components/common/SEO.js';

export const ContactPage: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '', subject: 'Acquisition Inquiry' });
  const [sent, setSent] = useState(false);
  const { success } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    success('Inquiry Received', 'Our concierge desk will respond to your message within 4 business hours.');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-16">
      <SEO
        title="Concierge & Private Client Services | MagnifiScent Luxury"
        description="Connect with our private luxury concierge desk for bespoke commissions, acquisitions, and horology inquiries."
        canonical="https://magnifiscent.site/contact"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Contact Concierge', url: '/contact' },
        ]}
      />
      <div className="text-center max-w-xl mx-auto space-y-3">
        <span className="text-[10px] uppercase tracking-widest text-champagne-dark font-semibold font-mono">
          Private Client Services
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl text-espresso-900 font-medium tracking-wide">
          Contact Concierge
        </h1>
        <p className="text-xs sm:text-sm text-charcoal font-light leading-relaxed">
          For personal appointments, bespoke gift curation, or assistance with external wire transfers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Contact Info (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-stone p-8 space-y-6">
          <h2 className="font-serif text-xl text-espresso-900 font-medium border-b border-stone/50 pb-3">
            Concierge Channels
          </h2>

          <div className="space-y-4 text-xs text-charcoal">
            <div className="flex items-start space-x-3">
              <MessageSquare className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-espresso-900 uppercase tracking-editorial text-[11px]">
                  WhatsApp Client Desk
                </p>
                <p className="mt-0.5">{import.meta.env.VITE_WHATSAPP_NUMBER || '+234 800 000 0000'}</p>
                <a
                  href={`https://wa.me/${(import.meta.env.VITE_WHATSAPP_NUMBER || '2348000000000').replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-800 underline underline-offset-2 mt-1 inline-block"
                >
                  Start encrypted chat
                </a>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Mail className="w-4 h-4 text-champagne-dark shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-espresso-900 uppercase tracking-editorial text-[11px]">
                  Electronic Mail
                </p>
                <p className="mt-0.5">concierge@magnifiscent.site</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <MapPin className="w-4 h-4 text-champagne-dark shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-espresso-900 uppercase tracking-editorial text-[11px]">
                  Private Viewing Lounge
                </p>
                <p className="mt-0.5">Victoria Island, Lagos, Nigeria</p>
                <p className="text-[10px] text-stone-muted mt-0.5">By confirmed prior appointment only</p>
              </div>
            </div>
          </div>
        </div>

        {/* Inquiry Form (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-stone p-8 space-y-6">
          <h2 className="font-serif text-xl text-espresso-900 font-medium border-b border-stone/50 pb-3">
            Send an Inquiry
          </h2>

          {sent ? (
            <div className="text-center py-10 space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-700 mx-auto" />
              <h3 className="font-serif text-xl text-espresso-900">Message Delivered</h3>
              <p className="text-xs text-charcoal max-w-sm mx-auto font-light leading-relaxed">
                Thank you. Our luxury concierge representative will contact you via your provided telephone or email address.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] uppercase tracking-editorial text-espresso-900 font-semibold block mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-ivory-50 border border-stone px-3.5 py-2.5 text-xs text-espresso-900 focus:outline-none focus:border-espresso-900"
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-editorial text-espresso-900 font-semibold block mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-ivory-50 border border-stone px-3.5 py-2.5 text-xs text-espresso-900 focus:outline-none focus:border-espresso-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-editorial text-espresso-900 font-semibold block mb-1">
                  Telephone (with country code)
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+234..."
                  className="w-full bg-ivory-50 border border-stone px-3.5 py-2.5 text-xs text-espresso-900 focus:outline-none focus:border-espresso-900"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-editorial text-espresso-900 font-semibold block mb-1">
                  Message Details *
                </label>
                <textarea
                  required
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Detail your inquiry, requested piece, or special occasion..."
                  className="w-full bg-ivory-50 border border-stone px-3.5 py-2.5 text-xs text-espresso-900 focus:outline-none focus:border-espresso-900"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-espresso-900 hover:bg-espresso-800 text-ivory-100 text-xs uppercase tracking-editorial font-semibold transition-colors"
              >
                Transmit Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
