import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Scale, FileText, Clock, HelpCircle, ArrowRight } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3 border-b border-stone pb-8">
        <span className="text-[10px] uppercase tracking-widest text-champagne-dark font-semibold font-mono">
          Legal Charter & Governance
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl text-espresso-900 font-medium tracking-wide">
          Terms & Conditions
        </h1>
        <p className="text-xs sm:text-sm text-charcoal font-light leading-relaxed">
          The legal charter governing acquisitions, bank wire verification, white-glove transport, and client privileges at MagnifiScent.
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
            <Scale className="w-5 h-5 text-champagne-dark shrink-0" />
            <h2 className="font-serif text-xl sm:text-2xl text-espresso-900 font-medium">
              1. Institutional Identity & Scope
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-charcoal font-light leading-relaxed">
            These Terms and Conditions constitute a legally binding agreement between you (&ldquo;Client&rdquo;, &ldquo;You&rdquo;) and <strong>MagnifiScent Luxury Retail Ltd</strong> (&ldquo;MagnifiScent&rdquo;, &ldquo;We&rdquo;, &ldquo;Our&rdquo;), governing access to our online retail sanctuary, concierge order desks, product catalogues, and acquisition services for haute horlogerie, fine jewellery, artisanal extraits, and bespoke gift collections.
          </p>
          <p className="text-xs sm:text-sm text-charcoal font-light leading-relaxed">
            By browsing our collection, enrolling as a private client, placing an order, or submitting a payment transfer receipt, you unconditionally agree to be bound by these Terms and our companion <Link to="/privacy-policy" className="text-champagne-dark font-medium underline underline-offset-2">Privacy Policy</Link>.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <div className="flex items-center space-x-2.5">
            <ShieldCheck className="w-5 h-5 text-champagne-dark shrink-0" />
            <h2 className="font-serif text-xl sm:text-2xl text-espresso-900 font-medium">
              2. Order Formation, Bank Wire & Verification
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-charcoal font-light leading-relaxed">
            Due to the rare, limited-allocation nature of our timepieces, jewellery, and extraits:
          </p>
          <ul className="list-disc list-inside space-y-2 text-xs sm:text-sm text-charcoal font-light leading-relaxed pl-2">
            <li>
              <strong>Offer to Purchase:</strong> Placement of an order generates a unique Order Reference (e.g. <code>MAG-2026-XXXX</code>) and represents an offer to acquire. The contract of sale is confirmed solely upon our finance concierge verifying receipt of irrevocable bank wire funds.
            </li>
            <li>
              <strong>24-Hour Allocation Window:</strong> Upon placing an order selecting Manual Bank Transfer, your selected items are temporarily reserved for twenty-four (24) hours. If an authentic payment receipt is not uploaded within this window, the pieces are automatically released back to our private catalog.
            </li>
            <li>
              <strong>Authoritative Beneficiary:</strong> Payments must be remitted exclusively to the verified corporate bank accounts specified in your formal payment instructions (Beneficiary: <em>MagnifiScent Luxury Retail Ltd</em>). MagnifiScent disclaims all responsibility for transfers made to unverified third-party accounts.
            </li>
            <li>
              <strong>Proof of Transfer:</strong> Clients must upload a clear, legible payment receipt (JPEG, PNG, WebP, or PDF up to 10MB) containing the matching narration or transaction reference. Submissions undergo cryptographic binary inspection and manual ledger reconciliation before order fulfillment commences.
            </li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <div className="flex items-center space-x-2.5">
            <FileText className="w-5 h-5 text-champagne-dark shrink-0" />
            <h2 className="font-serif text-xl sm:text-2xl text-espresso-900 font-medium">
              3. Authenticity Guarantee & Warranties
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-charcoal font-light leading-relaxed">
            MagnifiScent guarantees that 100% of all wristwatches, fine jewellery creations, and niche fragrances offered through our house are genuine, brand new or pristine archive acquisitions:
          </p>
          <ul className="list-disc list-inside space-y-2 text-xs sm:text-sm text-charcoal font-light leading-relaxed pl-2">
            <li>
              <strong>Horology:</strong> All mechanical timepieces undergo multi-position chronometric timing, amplitude checks, and water resistance validation before delivery. Timepieces include authentic presentation boxes, operating manuals, and serial-numbered warranty certificates.
            </li>
            <li>
              <strong>Fine Jewellery:</strong> Metal purities (18k solid gold, 950 platinum) and natural gemstones comply with ethical Kimberley Process sourcing standards and gemological hallmarks.
            </li>
            <li>
              <strong>Artisanal Fragrances:</strong> Extraits and eaux de parfum are stored under climate-controlled conditions to protect natural absolutes and volatile scent notes.
            </li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <div className="flex items-center space-x-2.5">
            <Clock className="w-5 h-5 text-champagne-dark shrink-0" />
            <h2 className="font-serif text-xl sm:text-2xl text-espresso-900 font-medium">
              4. Insured White-Glove Shipping & Delivery
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-charcoal font-light leading-relaxed">
            All orders are fulfilled in discreet, unmarked tamper-evident outer packaging to ensure complete privacy and security during transit:
          </p>
          <ul className="list-disc list-inside space-y-2 text-xs sm:text-sm text-charcoal font-light leading-relaxed pl-2">
            <li>
              <strong>Transit Insurance:</strong> High-value shipments are insured against theft, loss, or transit damage until physical handover to the recipient.
            </li>
            <li>
              <strong>Delivery Timelines:</strong> Standard nationwide delivery across Nigeria is completed within 2 to 4 business days. Priority Express delivery for Lagos and Abuja guarantees dispatch within 24 hours of payment clearance.
            </li>
            <li>
              <strong>Recipient Inspection:</strong> Upon delivery by our bonded courier, the recipient must inspect the wax security seals. If the carton seal appears broken or tampered with, the recipient must refuse delivery and immediately notify our concierge desk.
            </li>
          </ul>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="font-serif text-xl sm:text-2xl text-espresso-900 font-medium">
            5. Seven-Day Privilege Returns & Exchanges
          </h2>
          <p className="text-xs sm:text-sm text-charcoal font-light leading-relaxed">
            We want every acquisition to be cherished without compromise. We grant our clients a <strong>7-calendar-day return or exchange privilege</strong> starting from the confirmed date of delivery, subject to strict adherence to the following conditions:
          </p>
          <ul className="list-disc list-inside space-y-2 text-xs sm:text-sm text-charcoal font-light leading-relaxed pl-2">
            <li>
              Pieces must remain completely unworn, undamaged, unaltered, and with all factory protective films, tags, and seals intact.
            </li>
            <li>
              The complete original packaging, including the hand-crafted lacquer box, silk champagne ribbon, wax seal, warranty card, and certificates, must accompany the piece.
            </li>
            <li>
              <strong>Exceptions:</strong> Personalized creations (such as custom engraving, bespoke ring sizing, or calligraphed gift cards) and opened fragrance flacons are final sale and non-refundable for hygiene and provenance reasons.
            </li>
          </ul>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h2 className="font-serif text-xl sm:text-2xl text-espresso-900 font-medium">
            6. Pricing, Currency & Taxes
          </h2>
          <p className="text-xs sm:text-sm text-charcoal font-light leading-relaxed">
            All prices on MagnifiScent are quoted in <strong>Nigerian Naira (₦ / NGN)</strong>. Prices are inclusive of applicable packaging and value-added tax unless otherwise specified. We reserve the right to correct typographical pricing errors before order confirmation in the rare event of clerical discrepancy.
          </p>
        </section>

        {/* Section 7 */}
        <section className="space-y-3">
          <h2 className="font-serif text-xl sm:text-2xl text-espresso-900 font-medium">
            7. Intellectual Property & Brand Rights
          </h2>
          <p className="text-xs sm:text-sm text-charcoal font-light leading-relaxed">
            All intellectual property rights associated with MagnifiScent—including our name, the distinctive perfume medallion logo, website layout, editorial copywriting, product descriptions, horological photographs, and digital assets—belong exclusively to <strong>MagnifiScent Luxury Retail Ltd</strong>. Any unauthorized reproduction or distribution is strictly prohibited.
          </p>
        </section>

        {/* Section 8 */}
        <section className="space-y-3">
          <h2 className="font-serif text-xl sm:text-2xl text-espresso-900 font-medium">
            8. Governing Law & Dispute Resolution
          </h2>
          <p className="text-xs sm:text-sm text-charcoal font-light leading-relaxed">
            These Terms and any non-contractual obligations arising out of or in connection with them are governed by and construed in accordance with the laws of the <strong>Federal Republic of Nigeria</strong>. In the unlikely event of any inquiry or dispute, clients are warmly invited to first engage our Concierge Desk for amicable resolution.
          </p>
        </section>
      </div>

      {/* Concierge Desk Callout */}
      <div className="bg-ivory-50 border border-stone p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <HelpCircle className="w-4 h-4 text-champagne-dark" />
            <h3 className="font-serif text-lg text-espresso-900 font-medium">Have a Question Regarding Our Terms?</h3>
          </div>
          <p className="text-xs text-charcoal font-light">
            Our private concierge desk is available 7 days a week to clarify policies or assist with institutional acquisitions.
          </p>
        </div>
        <Link
          to="/contact"
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-espresso-900 text-ivory-100 hover:bg-espresso-800 text-xs uppercase tracking-wider font-semibold transition-colors shrink-0"
        >
          <span>Speak With Concierge</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
