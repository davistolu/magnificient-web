import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Compass, Gem, Clock } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-16">
      {/* Editorial Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-[10px] uppercase tracking-widest text-champagne-dark font-semibold font-mono">
          Our Philosophy
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl text-espresso-900 font-medium tracking-wide">
          The Art of Thoughtful Presentation
        </h1>
        <p className="text-xs sm:text-sm text-charcoal font-light leading-relaxed">
          MagnifiScent was founded on the belief that enduring luxury lies in deliberate rituals, mechanical honesty, and timeless aesthetics.
        </p>
      </div>

      {/* Main Narrative Image */}
      <div className="aspect-[16/9] overflow-hidden border border-stone shadow-xl">
        <img
          src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1600&auto=format&fit=crop"
          alt="MagnifiScent Atelier Presentation"
          className="w-full h-full object-cover object-center"
        />
      </div>

      {/* Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-y border-stone py-12">
        <div className="space-y-3">
          <Clock className="w-6 h-6 text-champagne-dark stroke-[1.5]" />
          <h3 className="font-serif text-xl text-espresso-900 font-medium">Horological Integrity</h3>
          <p className="text-xs text-charcoal leading-relaxed font-light">
            We partner with independent ateliers and historic Swiss movements. Every mechanical calibre is verified for chronometric timing, amplitude, and finishing before allocation.
          </p>
        </div>

        <div className="space-y-3">
          <Gem className="w-6 h-6 text-champagne-dark stroke-[1.5]" />
          <h3 className="font-serif text-xl text-espresso-900 font-medium">Precious Metallurgy</h3>
          <p className="text-xs text-charcoal leading-relaxed font-light">
            From 18k solid gold alloys to Colombian emeralds and conflict-free natural diamonds, our fine jewellery pieces are crafted to outlast fleeting seasons.
          </p>
        </div>

        <div className="space-y-3">
          <Compass className="w-6 h-6 text-champagne-dark stroke-[1.5]" />
          <h3 className="font-serif text-xl text-espresso-900 font-medium">Olfactory High Art</h3>
          <p className="text-xs text-charcoal leading-relaxed font-light">
            Our extraits de parfum honor classical French extraction methods, harmonising aged wild agarwoods with Grasse floral absolutes for signature sillage.
          </p>
        </div>
      </div>

      {/* Presentation Callout */}
      <div className="bg-white border border-stone p-8 sm:p-12 text-center space-y-4 max-w-3xl mx-auto">
        <h2 className="font-serif text-2xl sm:text-3xl text-espresso-900 font-medium">
          The Signature Keepsake Box
        </h2>
        <p className="text-xs sm:text-sm text-charcoal font-light leading-relaxed">
          Every order placed with MagnifiScent is delivered in hand-crafted white-glove presentation boxes, tied with silk champagne ribbon and accompanied by wax-sealed certificates of authenticity.
        </p>
        <div className="pt-2">
          <Link
            to="/gift-sets"
            className="inline-flex items-center space-x-2 text-xs uppercase tracking-editorial font-semibold text-espresso-900 hover:text-champagne-dark border-b border-espresso-900 pb-1"
          >
            <span>Explore Curated Gift Edits</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
