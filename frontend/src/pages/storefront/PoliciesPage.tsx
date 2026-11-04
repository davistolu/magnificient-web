import React from 'react';
import { useLocation } from 'react-router-dom';

export const PoliciesPage: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

  const getPolicyContent = () => {
    if (path.includes('shipping')) {
      return {
        title: 'Shipping & Delivery Policy',
        subtitle: 'Our standards for transit, security, and white-glove courier dispatch.',
        sections: [
          {
            heading: '1. Courier & Insured Transit',
            body: 'All MagnifiScent orders are transported in tamper-evident, discreet outer cartons. High-value horological pieces and diamond jewellery are accompanied by full transit insurance.',
          },
          {
            heading: '2. Delivery Windows',
            body: 'Standard delivery across Nigeria is completed within 2 to 4 business days. Priority Express courier (Lagos and Abuja) guarantees next-day delivery following payment reconciliation.',
          },
          {
            heading: '3. Inspection on Arrival',
            body: 'Clients are required to inspect the exterior security seal prior to signing the courier receipt. Any discrepancy must be reported to our concierge desk within 24 hours.',
          },
        ],
      };
    }

    if (path.includes('returns')) {
      return {
        title: 'Returns & Refund Policy',
        subtitle: 'Conditions governing exchanges, returns, and inspection.',
        sections: [
          {
            heading: '1. 7-Day Privilege Window',
            body: 'Clients may request a return or exchange within 7 calendar days of delivery. Items must remain completely unworn, with all protective factory plastic, hangtags, and boxes unaltered.',
          },
          {
            heading: '2. Bespoke & Personalized Items',
            body: 'Creations that have undergone custom engraving, ring resizing, or personalized gift calligraphy are final sale and non-refundable.',
          },
          {
            heading: '3. Refund Processing',
            body: 'Once returned pieces are inspected and certified by our gemological and horological team, funds are refunded via direct bank wire to the original account.',
          },
        ],
      };
    }

    if (path.includes('privacy')) {
      return {
        title: 'Privacy Policy',
        subtitle: 'How we safeguard your personal data, transaction records, and communication.',
        sections: [
          {
            heading: '1. Personal Information Collection',
            body: 'We collect only details necessary to fulfill your acquisition: recipient name, telephone number, physical delivery destination, and proof of payment receipts.',
          },
          {
            heading: '2. Confidentiality & Storage',
            body: 'Payment receipts uploaded to MagnifiScent are stored in private, non-public storage directories accessible exclusively by authorized senior finance administrators.',
          },
          {
            heading: '3. Third-Party Sharing',
            body: 'We never sell, lease, or monetize client details. Information is disclosed solely to vetted delivery couriers for transport completion.',
          },
        ],
      };
    }

    // Default: Terms & Conditions
    return {
      title: 'Terms & Conditions',
      subtitle: 'The legal charter governing the MagnifiScent luxury retail experience.',
      sections: [
        {
          heading: '1. Order Formation & Payment Verification',
          body: 'An order placed on MagnifiScent constitutes an offer to purchase. Contracts are finalized only upon independent verification of bank wire funds by our finance department.',
        },
        {
          heading: '2. Inventory Allocation',
          body: 'Because our timepieces and fine jewellery are produced in limited quantities, inventory reservations are held for 24 hours awaiting receipt upload.',
        },
        {
          heading: '3. Intellectual Property',
          body: 'All designs, editorial photography, typography, and trade dress associated with MagnifiScent are the protected intellectual property of MagnifiScent Luxury Retail Ltd.',
        },
      ],
    };
  };

  const policy = getPolicyContent();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-12">
      <div className="text-center max-w-xl mx-auto space-y-2 border-b border-stone pb-8">
        <span className="text-[10px] uppercase tracking-widest text-champagne-dark font-semibold font-mono">
          Legal & Governance
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-espresso-900 font-medium tracking-wide">
          {policy.title}
        </h1>
        <p className="text-xs sm:text-sm text-charcoal font-light leading-relaxed">
          {policy.subtitle}
        </p>
      </div>

      <div className="bg-white border border-stone p-8 sm:p-12 space-y-8">
        {policy.sections.map((sec, idx) => (
          <div key={idx} className="space-y-2">
            <h3 className="font-serif text-lg text-espresso-900 font-medium">{sec.heading}</h3>
            <p className="text-xs sm:text-sm text-charcoal font-light leading-relaxed">{sec.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
