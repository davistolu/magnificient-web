import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQS = [
  {
    q: 'How does payment work without an online card gateway?',
    a: 'At Magnificent, we deliberately use direct external bank wire transfers and WhatsApp luxury concierge channels. This eliminates intermediary processor fees, protects client banking anonymity, and guarantees personalized human verification for every allocation.',
  },
  {
    q: 'How do I submit my bank payment receipt?',
    a: 'Once your order is placed, you will receive our corporate banking account details and a unique Order Reference (e.g. MAG-2026-XXXX). After transferring funds from your banking app, upload a screenshot or PDF receipt on the order confirmation screen. Our finance desk verifies the funds against our actual bank statement and confirms your order.',
  },
  {
    q: 'How fast is delivery across Nigeria and internationally?',
    a: 'Orders in Lagos and Abuja are dispatched via express priority courier within 24 hours of payment verification. Deliveries across other Nigerian states take 2 to 4 business days. All shipments are insured and packaged in our discreet outer protective transport cartons.',
  },
  {
    q: 'Are your timepieces and jewellery certified authentic?',
    a: 'Every mechanical watch and jewellery piece arrives with an individual Certificate of Authenticity, manufacturer documentation, and a documented serial register. Natural diamonds and emeralds carry independent gemological grade documentation.',
  },
  {
    q: 'Can I order custom bespoke gift packaging?',
    a: 'Yes. All gift sets include complimentary handwritten calligraphy gift cards. If you desire custom wax seals or corporate presentation chests, connect directly with our WhatsApp concierge before or after checkout.',
  },
  {
    q: 'What is your return and exchange policy?',
    a: 'We accept returns within 7 calendar days of delivery for unworn, unaltered items in pristine original presentation with all protective seals and documentation intact. Bespoke personalized or engraved pieces cannot be returned.',
  },
];

export const FaqPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-12">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-[10px] uppercase tracking-widest text-champagne-dark font-semibold font-mono">
          Knowledge Base
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-espresso-900 font-medium tracking-wide">
          Frequently Answered Questions
        </h1>
        <p className="text-xs sm:text-sm text-charcoal font-light leading-relaxed">
          Guidance regarding manual bank transfers, concierge ordering, packaging, and fulfillment.
        </p>
      </div>

      <div className="bg-white border border-stone divide-y divide-stone/40">
        {FAQS.map((faq, idx) => (
          <div key={idx} className="p-6 transition-colors">
            <button
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              className="w-full flex justify-between items-center text-left"
            >
              <h3 className="font-serif text-base sm:text-lg text-espresso-900 font-medium">
                {faq.q}
              </h3>
              {openIndex === idx ? (
                <ChevronUp className="w-4 h-4 text-espresso-900 shrink-0 ml-4" />
              ) : (
                <ChevronDown className="w-4 h-4 text-stone-muted shrink-0 ml-4" />
              )}
            </button>
            {openIndex === idx && (
              <p className="mt-3 text-xs sm:text-sm text-charcoal font-light leading-relaxed animate-in fade-in">
                {faq.a}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
