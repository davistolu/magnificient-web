import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, EyeOff, FileCheck2, Database, HelpCircle, ArrowRight } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3 border-b border-stone pb-8">
        <span className="text-[10px] uppercase tracking-widest text-champagne-dark font-semibold font-mono">
          Private Client Discretion
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl text-espresso-900 font-medium tracking-wide">
          Privacy Policy
        </h1>
        <p className="text-xs sm:text-sm text-charcoal font-light leading-relaxed">
          How MagnifiScent protects your personal identity, physical delivery destinations, and transactional records with uncompromising discretion.
        </p>
        <p className="text-[11px] text-stone-muted font-mono">
          Last revised: October 2026 • MagnifiScent Luxury Retail Ltd
        </p>
      </div>

      {/* Main Content Sections */}
      <div className="bg-white border border-stone p-8 sm:p-12 space-y-10 shadow-xs">
        {/* Section 1 */}
        <section className="space-y-3">
          <div className="flex items-center space-x-2.5">
            <Lock className="w-5 h-5 text-champagne-dark shrink-0" />
            <h2 className="font-serif text-xl sm:text-2xl text-espresso-900 font-medium">
              1. Our Philosophy of Client Discretion
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-charcoal font-light leading-relaxed">
            At <strong>MagnifiScent Luxury Retail Ltd</strong>, we recognize that our private clientele values discretion as much as precision mechanics and fine perfumery. We are committed to safeguarding your personal data, transaction records, and delivery details in full compliance with the <strong>Nigeria Data Protection Act (NDPA)</strong> and international security best practices.
          </p>
          <p className="text-xs sm:text-sm text-charcoal font-light leading-relaxed">
            This Privacy Policy explains what information we collect when you visit our website, register for private client access, acquire creations, or communicate with our Concierge Desk.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <div className="flex items-center space-x-2.5">
            <Database className="w-5 h-5 text-champagne-dark shrink-0" />
            <h2 className="font-serif text-xl sm:text-2xl text-espresso-900 font-medium">
              2. Information We Collect
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-charcoal font-light leading-relaxed">
            We collect only the specific information strictly necessary to provide an uncompromising luxury retail experience:
          </p>
          <ul className="list-disc list-inside space-y-2 text-xs sm:text-sm text-charcoal font-light leading-relaxed pl-2">
            <li>
              <strong>Identity & Contact Details:</strong> Full name, verified electronic mail address, and telephone number (utilized for private client enrolment, WhatsApp concierge order coordination, and authentication).
            </li>
            <li>
              <strong>Physical Delivery Destinations:</strong> Delivery address, apartment/suite number, city, and Nigerian state for secure courier dispatch.
            </li>
            <li>
              <strong>Bank Wire Payment Records:</strong> Uploaded proof-of-payment receipts (JPEG, PNG, WebP, PDF), bank transaction narration, and submitted amounts. <em>Note: MagnifiScent does not collect or store raw debit/credit card numbers or online banking passwords.</em>
            </li>
            <li>
              <strong>Order History & Preferences:</strong> Past acquisitions, saved gift addresses, and communication transcripts with our concierge desk.
            </li>
            <li>
              <strong>Technical & Session Data:</strong> IP address, device browser type, and cryptographic session tokens (JWT) to preserve authentication states and cart contents.
            </li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <div className="flex items-center space-x-2.5">
            <FileCheck2 className="w-5 h-5 text-champagne-dark shrink-0" />
            <h2 className="font-serif text-xl sm:text-2xl text-espresso-900 font-medium">
              3. Protection of Bank Transfer Receipts
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-charcoal font-light leading-relaxed">
            Uploaded bank transfer receipts contain sensitive financial details. We implement multi-layered cryptographic safeguards:
          </p>
          <ul className="list-disc list-inside space-y-2 text-xs sm:text-sm text-charcoal font-light leading-relaxed pl-2">
            <li>
              <strong>Isolated Private Storage:</strong> Payment receipts are never saved in public web directories. They reside in private non-public directories or encrypted S3/Neon buckets.
            </li>
            <li>
              <strong>Cryptographic Ephemeral Tokens:</strong> Receipts can only be inspected using short-lived, signed JSON Web Tokens (JWT) issued strictly to authorized administrative finance reviewers.
            </li>
            <li>
              <strong>Strict Role-Based Access:</strong> Only vetted senior finance concierges with administrative credentials can view submitted payment documents during the ledger verification process.
            </li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <div className="flex items-center space-x-2.5">
            <EyeOff className="w-5 h-5 text-champagne-dark shrink-0" />
            <h2 className="font-serif text-xl sm:text-2xl text-espresso-900 font-medium">
              4. Zero Commercial Data Monetization
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-charcoal font-light leading-relaxed">
            We hold a strict policy regarding third-party data sharing:
          </p>
          <ul className="list-disc list-inside space-y-2 text-xs sm:text-sm text-charcoal font-light leading-relaxed pl-2">
            <li>
              <strong>No Data Selling or Leasing:</strong> We will never sell, lease, rent, or trade your personal information, purchase history, or contact details to third-party advertisers, data brokers, or marketing syndicates.
            </li>
            <li>
              <strong>Essential Service Partners Only:</strong> Information is disclosed only to vetted, bonded logistics couriers (strictly for package transit) and IT infrastructure providers bound by strict nondisclosure and data protection agreements.
            </li>
            <li>
              <strong>Legal Compliance:</strong> We disclose client information only if mandatory by applicable statutory law or formal court order under the laws of the Federal Republic of Nigeria.
            </li>
          </ul>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <div className="flex items-center space-x-2.5">
            <ShieldCheck className="w-5 h-5 text-champagne-dark shrink-0" />
            <h2 className="font-serif text-xl sm:text-2xl text-espresso-900 font-medium">
              5. Your Legal Rights (NDPA Compliance)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-charcoal font-light leading-relaxed">
            Under the Nigeria Data Protection Act, you possess full ownership over your personal data:
          </p>
          <ul className="list-disc list-inside space-y-2 text-xs sm:text-sm text-charcoal font-light leading-relaxed pl-2">
            <li>
              <strong>Right of Access:</strong> You may request an authoritative summary of all personal records, order histories, and addresses associated with your account.
            </li>
            <li>
              <strong>Right to Rectification:</strong> You may edit or update incomplete or inaccurate information at any time via your <Link to="/account" className="text-champagne-dark font-medium underline underline-offset-2">Client Sanctuary</Link> or by contacting Concierge.
            </li>
            <li>
              <strong>Right to Erasure (&ldquo;Right to be Forgotten&rdquo;):</strong> You may request the deletion of your account and personal details, subject only to statutory tax and financial retention laws.
            </li>
            <li>
              <strong>Right to Unsubscribe:</strong> You can opt out of the MagnifiScent private journal newsletter at any time via the 1-click unsubscribe mechanism.
            </li>
          </ul>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h2 className="font-serif text-xl sm:text-2xl text-espresso-900 font-medium">
            6. Cookies & Local Session Storage
          </h2>
          <p className="text-xs sm:text-sm text-charcoal font-light leading-relaxed">
            Our platform uses minimal, essential functional cookies and browser local storage. These are utilized solely to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-xs sm:text-sm text-charcoal font-light leading-relaxed pl-2">
            <li>Maintain your active client sign-in session securely across pages.</li>
            <li>Remember pieces currently placed in your Shopping Bag.</li>
            <li>Retain discount codes during your active checkout journey.</li>
          </ul>
          <p className="text-xs sm:text-sm text-charcoal font-light leading-relaxed">
            We do not employ aggressive cross-site tracking or invasive third-party advertising cookies.
          </p>
        </section>

        {/* Section 7 */}
        <section className="space-y-3">
          <h2 className="font-serif text-xl sm:text-2xl text-espresso-900 font-medium">
            7. Data Retention Guidelines
          </h2>
          <p className="text-xs sm:text-sm text-charcoal font-light leading-relaxed">
            Transactional and invoice records are retained for a minimum period of six (6) years in accordance with Nigerian corporate accounting laws and warranty fulfillment obligations for mechanical calibres and high jewellery pieces. Non-transactional data is permanently deleted upon account closure.
          </p>
        </section>

        {/* Section 8 */}
        <section className="space-y-3">
          <h2 className="font-serif text-xl sm:text-2xl text-espresso-900 font-medium">
            8. Contact Our Data Protection Concierge
          </h2>
          <p className="text-xs sm:text-sm text-charcoal font-light leading-relaxed">
            For any questions regarding our privacy practices, data access requests, or to exercise your rights under the NDPA, kindly reach our dedicated privacy officer:
          </p>
          <div className="bg-ivory-50 border border-stone p-4 space-y-1 text-xs">
            <p className="font-semibold text-espresso-900">Data Protection Officer</p>
            <p className="text-charcoal">MagnifiScent Luxury Retail Ltd</p>
            <p className="text-charcoal">Electronic Mail: <a href="mailto:concierge@magnifiscent.luxury" className="text-champagne-dark font-medium underline">concierge@magnifiscent.luxury</a></p>
            <p className="text-charcoal">Private Client Salon: Victoria Island, Lagos, Nigeria</p>
          </div>
        </section>
      </div>

      {/* Concierge Desk Callout */}
      <div className="bg-ivory-50 border border-stone p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <HelpCircle className="w-4 h-4 text-champagne-dark" />
            <h3 className="font-serif text-lg text-espresso-900 font-medium">Need Assistance or Data Access?</h3>
          </div>
          <p className="text-xs text-charcoal font-light">
            Our luxury concierge team is prepared to assist you with confidentiality and care.
          </p>
        </div>
        <Link
          to="/contact"
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-espresso-900 text-ivory-100 hover:bg-espresso-800 text-xs uppercase tracking-wider font-semibold transition-colors shrink-0"
        >
          <span>Contact Concierge Desk</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
