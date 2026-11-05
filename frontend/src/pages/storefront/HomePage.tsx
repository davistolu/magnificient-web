import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Clock, Award, MessageCircle, Gift } from 'lucide-react';
import { api } from '../../services/api.js';
import { ProductCard } from '../../components/storefront/ProductCard.js';
import { SEO } from '../../components/common/SEO.js';

export const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.getFeaturedProducts();
        if (res.success) {
          setFeaturedProducts(res.data);
        }
      } catch (err) {
        console.error('Failed to load featured products', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const categories = [
    {
      title: 'Wristwatches',
      subtitle: 'Horological precision & Swiss mechanics',
      slug: 'watches',
      imageUrl: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=1200&auto=format&fit=crop',
    },
    {
      title: 'Fine Jewellery',
      subtitle: 'Handcrafted solid gold & rare gemstones',
      slug: 'jewellery',
      imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1200&auto=format&fit=crop',
    },
    {
      title: 'Niche Fragrances',
      subtitle: 'Artisanal extraits with rare botanicals',
      slug: 'perfumes',
      imageUrl: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1200&auto=format&fit=crop',
    },
    {
      title: 'Curated Gift Sets',
      subtitle: 'Bespoke presentation for milestones',
      slug: 'gift-sets',
      imageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=1200&auto=format&fit=crop',
    },
  ];

  const occasions = [
    { name: 'Anniversaries', slug: 'anniversary', desc: 'Timeless symbols of love' },
    { name: 'Milestone Birthdays', slug: 'birthday', desc: 'Heirloom watches and fine gems' },
    { name: 'Weddings & Vows', slug: 'wedding', desc: 'Eternity bands & gold sets' },
    { name: 'Executive & Corporate', slug: 'corporate', desc: 'Distinguished boardroom presence' },
  ];

  return (
    <div className="space-y-24 sm:space-y-32 pb-24">
      <SEO
        title="MagnifiScent | Haute Horlogerie, Fine Jewellery & Artisanal Fragrances"
        description="Discover horology, handcrafted fine jewellery, artisanal perfumes, and bespoke gift edits. MagnifiScent — Made to Be Remembered."
        canonical="https://magnifiscent.site/"
        ogImage="/logo.png"
      />
      {/* 1. EDITORIAL HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center bg-espresso-900 text-ivory-100 overflow-hidden">
        {/* Background campaign photo */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1508057198894-247b23fe5ade?q=80&w=1920&auto=format&fit=crop"
            alt="MagnifiScent Campaign Editorial"
            className="w-full h-full object-cover object-center opacity-40 scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-espresso-900 via-espresso-900/80 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 w-full">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center space-x-2 border-b border-champagne pb-1">
              <span className="text-[10px] sm:text-xs uppercase tracking-widest text-champagne font-medium">
                The New Season Edit
              </span>
            </div>

            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal tracking-wide text-ivory-100 leading-[1.1]">
              Made to Be <br />
              <span className="italic font-light text-champagne-light">Remembered.</span>
            </h1>

            <p className="text-sm sm:text-base text-stone-muted leading-relaxed font-light max-w-lg">
              Discover horology, handcrafted fine jewellery, artisanal extraits, and bespoke gift suites curated to elevate every chapter of distinction.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row gap-4 sm:items-center">
              <Link
                to="/shop"
                className="px-8 py-4 bg-champagne hover:bg-champagne-light text-espresso-900 text-xs uppercase tracking-editorial font-semibold transition-all flex items-center justify-center space-x-2 shadow-lg"
              >
                <span>Explore the Collection</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/gift-sets"
                className="px-8 py-4 border border-stone-muted/40 hover:border-ivory-100 text-ivory-100 text-xs uppercase tracking-editorial font-medium transition-colors text-center"
              >
                Curated Gift Edits
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORY MOSAIC PANELS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
          <span className="text-[10px] uppercase tracking-widest text-charcoal/70 font-semibold">
            Our Disciplines
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-espresso-900 font-medium">
            Curated Categories of Distinction
          </h2>
          <p className="text-xs sm:text-sm text-charcoal font-light">
            Every creation is selected with unwavering standards of mechanical integrity, provenance, and aesthetic grace.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, idx) => (
            <Link
              key={cat.slug}
              to={`/${cat.slug}`}
              className="group relative aspect-[3/4] overflow-hidden bg-stone border border-stone/60 shadow-sm"
            >
              <img
                src={cat.imageUrl}
                alt={cat.title}
                className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-espresso-900/90 via-espresso-900/20 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-6 text-ivory-100 space-y-1">
                <span className="text-[9px] uppercase tracking-widest text-champagne font-mono">
                  Collection 0{idx + 1}
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-medium tracking-wide">
                  {cat.title}
                </h3>
                <p className="text-xs text-stone-muted line-clamp-1 font-light">
                  {cat.subtitle}
                </p>
                <div className="pt-2 flex items-center space-x-1.5 text-[11px] uppercase tracking-editorial text-champagne group-hover:text-white transition-colors">
                  <span>Discover</span>
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. FEATURED PIECES SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 border-b border-stone pb-6 gap-4">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-charcoal/70 font-semibold block mb-1">
              Hand-Selected
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-espresso-900 font-medium">
              Featured Creations
            </h2>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center space-x-2 text-xs uppercase tracking-editorial text-espresso-900 hover:text-champagne-dark font-medium transition-colors"
          >
            <span>View All Creations</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="aspect-[4/5] bg-stone/40 animate-pulse border border-stone" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 4. EDITORIAL BRAND STORY */}
      <section className="bg-ivory-50 border-y border-stone py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Story copy */}
            <div className="space-y-6">
              <span className="text-[10px] uppercase tracking-widest text-champagne-dark font-semibold">
                The MagnifiScent Ethos
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl text-espresso-900 font-normal leading-tight">
                Objects that carry meaning across generations.
              </h2>
              <div className="space-y-4 text-xs sm:text-sm text-charcoal font-light leading-relaxed">
                <p>
                  MagnifiScent was conceived from an appreciation for the tactile, deliberate rituals of luxury. In a world of fleeting mass manufacture, we celebrate horologists who calibrate seconds with mechanical hairsprings, goldsmiths who set natural stones by hand, and master perfumers who distill memories into concentrated extraits.
                </p>
                <p>
                  Whether selecting a chronograph to mark a career triumph, fine jewellery for an anniversary, or a signature fragrance, every piece arrives in our bespoke white-glove packaging ready to become a cherished memory.
                </p>
              </div>

              <div className="pt-2">
                <Link
                  to="/about"
                  className="inline-flex items-center space-x-2 text-xs uppercase tracking-editorial font-semibold text-espresso-900 hover:text-champagne-dark border-b border-espresso-900 pb-1"
                >
                  <span>Read our complete story</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Visual Diptych */}
            <div className="relative aspect-[4/3] sm:aspect-[16/11] overflow-hidden border border-stone shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200&auto=format&fit=crop"
                alt="Horological Artistry at Magnificent"
                className="w-full h-full object-cover object-center"
                loading="lazy"
              />
              <div className="absolute bottom-4 left-4 bg-espresso-900/90 text-ivory-100 text-[10px] uppercase tracking-editorial px-3 py-1.5 backdrop-blur-xs font-mono">
                Studio Archival Study
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. OCCASIONS GIFT DISCOVERY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-14 space-y-2">
          <div className="inline-flex items-center justify-center space-x-2 text-champagne-dark mb-1">
            <Gift className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-widest font-semibold">
              The Art of Giving
            </span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-espresso-900 font-medium">
            Curated by Milestone
          </h2>
          <p className="text-xs sm:text-sm text-charcoal font-light">
            Find the exact gift that articulates devotion, respect, and celebratory joy.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {occasions.map((occ) => (
            <Link
              key={occ.slug}
              to={`/shop?occasion=${occ.slug}`}
              className="p-8 bg-white border border-stone/60 hover:border-champagne transition-all group flex flex-col justify-between h-52 text-left hover:shadow-md"
            >
              <div>
                <span className="text-[9px] uppercase tracking-widest text-charcoal/60 font-mono block mb-2">
                  Occasion Edit
                </span>
                <h3 className="font-serif text-xl font-medium text-espresso-900 group-hover:text-champagne-dark transition-colors">
                  {occ.name}
                </h3>
                <p className="text-xs text-charcoal mt-1 font-light">
                  {occ.desc}
                </p>
              </div>

              <div className="flex items-center space-x-1.5 text-xs uppercase tracking-editorial text-espresso-900 group-hover:text-champagne-dark font-medium pt-4">
                <span>View Gifts</span>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 6. TRUST & CONCIERGE PILLARS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-stone pt-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center sm:text-left">
          <div className="space-y-2">
            <ShieldCheck className="w-6 h-6 text-champagne-dark stroke-[1.5] mx-auto sm:mx-0" />
            <h4 className="font-serif text-base text-espresso-900 font-medium">
              Verified Bank Wire
            </h4>
            <p className="text-xs text-charcoal font-light leading-relaxed">
              Protected direct bank transfer with individual ledger review and encrypted receipt validation.
            </p>
          </div>

          <div className="space-y-2">
            <MessageCircle className="w-6 h-6 text-champagne-dark stroke-[1.5] mx-auto sm:mx-0" />
            <h4 className="font-serif text-base text-espresso-900 font-medium">
              WhatsApp Concierge
            </h4>
            <p className="text-xs text-charcoal font-light leading-relaxed">
              Order directly via encrypted WhatsApp messaging with our dedicated personal luxury shopper.
            </p>
          </div>

          <div className="space-y-2">
            <Award className="w-6 h-6 text-champagne-dark stroke-[1.5] mx-auto sm:mx-0" />
            <h4 className="font-serif text-base text-espresso-900 font-medium">
              White-Glove Presentation
            </h4>
            <p className="text-xs text-charcoal font-light leading-relaxed">
              Signature wax-sealed stationery, crushed velvet presentation cases, and gift packaging with every order.
            </p>
          </div>

          <div className="space-y-2">
            <Clock className="w-6 h-6 text-champagne-dark stroke-[1.5] mx-auto sm:mx-0" />
            <h4 className="font-serif text-base text-espresso-900 font-medium">
              Expedited Delivery
            </h4>
            <p className="text-xs text-charcoal font-light leading-relaxed">
              Next-day dispatch for Lagos and Abuja, with secure insured courier transport nationwide.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
