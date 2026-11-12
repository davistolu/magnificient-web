import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.js';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const { error } = useToast();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      error('Invalid Email', 'Please provide a valid email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.subscribeNewsletter(email);
      if (res.success) {
        setSubscribed(true);
        setEmail('');
      }
    } catch (err: any) {
      error('Subscription Error', err.message || 'Could not complete subscription.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="bg-espresso-900 text-ivory-100 border-t border-espresso-800">
      {/* Top Editorial Newsletter Banner */}
      <div className="border-b border-espresso-800 py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-[10px] uppercase tracking-widest text-champagne font-medium block mb-2">
            The MagnifiScent Journal
          </span>
          <h3 className="font-serif text-2xl sm:text-3xl text-ivory-100 font-medium">
            Join Our Private Circle
          </h3>
          <p className="text-xs sm:text-sm text-stone-muted max-w-md mx-auto mt-2 leading-relaxed">
            Receive private allocations, invitations to horological previews, and curated gift guides.
          </p>

          {subscribed ? (
            <div className="mt-6 flex items-center justify-center space-x-2 text-champagne text-xs uppercase tracking-editorial">
              <CheckCircle2 className="w-4 h-4" />
              <span>You have been added to our private register. Welcome.</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="mt-6 max-w-md mx-auto flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="flex-1 bg-espresso-800/80 border border-stone-muted/30 px-4 py-3 text-xs text-ivory-100 placeholder-stone-muted/50 focus:outline-none focus:border-champagne"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-champagne hover:bg-champagne-light text-espresso-900 text-xs uppercase tracking-editorial font-semibold transition-colors flex items-center justify-center space-x-1 disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Joining...' : 'Subscribe'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Main Navigation Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Philosophy */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center space-x-3.5 group">
              <div className="w-12 h-12 rounded-sm bg-ivory-100 p-1 flex items-center justify-center border border-champagne/40 shadow-sm shrink-0">
                <img
                  src="/logo.png"
                  alt="MagnifiScent"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="font-serif text-2xl font-medium tracking-widest text-ivory-100 block leading-tight">
                  Magnifi<span className="text-champagne font-semibold">Scent</span>
                </span>
                <span className="block text-[8px] tracking-[0.25em] text-champagne uppercase font-sans">
                  Fine Living & Sillage
                </span>
              </div>
            </Link>
            <p className="text-xs text-stone-muted leading-relaxed max-w-sm">
              An independent retail sanctuary offering mechanical wristwatches, fine jewellery, artisanal perfumes, and thoughtful gift suites for connoisseurs who value enduring quality and uncompromising craftsmanship.
            </p>
            <div className="pt-2">
              <span className="text-[10px] uppercase tracking-widest text-champagne block">
                White-Glove Payment Guarantee
              </span>
              <p className="text-[11px] text-stone-muted/80 mt-1">
                Direct external bank wire transfer & WhatsApp concierge order confirmation.
              </p>
            </div>
          </div>

          {/* Collections */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-champagne font-semibold mb-4">
              Collections
            </h4>
            <ul className="space-y-2 text-xs text-stone-muted">
              <li>
                <Link to="/shop" className="hover:text-white transition-colors">
                  All Pieces
                </Link>
              </li>
              <li>
                <Link to="/watches" className="hover:text-white transition-colors">
                  Wristwatches
                </Link>
              </li>
              <li>
                <Link to="/jewellery" className="hover:text-white transition-colors">
                  Fine Jewellery
                </Link>
              </li>
              <li>
                <Link to="/perfumes" className="hover:text-white transition-colors">
                  Niche Fragrances
                </Link>
              </li>
              <li>
                <Link to="/gift-sets" className="hover:text-white transition-colors">
                  Curated Gift Sets
                </Link>
              </li>
            </ul>
          </div>

          {/* Client Concierge */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-champagne font-semibold mb-4">
              Concierge Desk
            </h4>
            <ul className="space-y-2 text-xs text-stone-muted">
              <li>
                <Link to="/track" className="hover:text-white transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <a
                  href={`https://wa.me/${(import.meta.env.VITE_WHATSAPP_NUMBER || '2348000000000').replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  WhatsApp Concierge
                </a>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Client Inquiries
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-white transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link to="/shipping-policy" className="hover:text-white transition-colors">
                  Shipping & Delivery
                </Link>
              </li>
              <li>
                <Link to="/returns-policy" className="hover:text-white transition-colors">
                  Returns & Care
                </Link>
              </li>
            </ul>
          </div>

          {/* Administration & Legal */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-champagne font-semibold mb-4">
              Governance
            </h4>
            <ul className="space-y-2 text-xs text-stone-muted">
              <li>
                <Link to="/privacy-policy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 pt-8 border-t border-espresso-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-muted/70">
          <p>© {new Date().getFullYear()} MagnifiScent Luxury Retail Ltd. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Curated in Nigeria for global delivery.</p>
        </div>
      </div>
    </footer>
  );
};
