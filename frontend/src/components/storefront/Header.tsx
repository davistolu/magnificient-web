import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Search,
  ShoppingBag,
  User as UserIcon,
  Menu,
  X,
  Watch,
  Gem,
  Sparkles,
  Gift,
  Compass,
  ArrowRight,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { useCart } from '../../context/CartContext.js';
import { useAuth } from '../../context/AuthContext.js';

interface HeaderProps {
  onOpenSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSearch }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { itemCount, setIsCartOpen } = useCart();
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navLinks = [
    { label: 'Shop All', href: '/shop' },
    { label: 'Watches', href: '/watches' },
    { label: 'Jewellery', href: '/jewellery' },
    { label: 'Perfumes', href: '/perfumes' },
    { label: 'Gift Sets', href: '/gift-sets' },
    { label: 'Our Ethos', href: '/about' },
  ];

  const drawerCategories = [
    {
      name: 'All Creations',
      href: '/shop',
      subtitle: 'Complete luxury catalog',
      icon: Compass,
    },
    {
      name: 'Wristwatches',
      href: '/watches',
      subtitle: 'Swiss automatics & horology',
      icon: Watch,
    },
    {
      name: 'Fine Jewellery',
      href: '/jewellery',
      subtitle: 'Precious metals & natural gemstones',
      icon: Gem,
    },
    {
      name: 'Niche Fragrances',
      href: '/perfumes',
      subtitle: 'Artisanal extraits & sillage',
      icon: Sparkles,
    },
    {
      name: 'Curated Gift Sets',
      href: '/gift-sets',
      subtitle: 'Signature white-glove packaging',
      icon: Gift,
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <header className="sticky top-0 z-40 bg-ivory-100/95 backdrop-blur-md border-b border-stone/60 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Left: Mobile Menu Trigger (Mobile) / Desktop Wordmark Link */}
            <div className="flex items-center space-x-2 lg:hidden w-20">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2.5 -ml-2 text-espresso-900 hover:text-champagne-dark transition-colors touch-manipulation focus:outline-none"
                aria-label="Open luxury navigation menu"
              >
                <Menu className="w-6 h-6 stroke-[1.75]" />
              </button>
              <button
                onClick={onOpenSearch}
                className="p-2 text-espresso-900 hover:text-champagne-dark transition-colors touch-manipulation focus:outline-none"
                aria-label="Search catalog"
              >
                <Search className="w-5 h-5 stroke-[1.75]" />
              </button>
            </div>

            {/* Center / Brand Logo: Mathematically Centered on Mobile */}
            <div className="flex-1 text-center lg:flex-none lg:text-left flex items-center justify-center lg:justify-start">
              <Link to="/" className="inline-flex items-center space-x-2.5 sm:space-x-3 group py-1">
                <img
                  src="/logo.jpg"
                  alt="MagnifiScent Luxury"
                  className="h-10 sm:h-11 md:h-12 w-auto object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-105"
                />
                <div className="text-left">
                  <span className="font-serif text-lg sm:text-2xl font-medium tracking-widest text-espresso-900 group-hover:text-champagne-dark transition-colors block leading-none">
                    Magnifi<span className="text-champagne-dark font-semibold">Scent</span>
                  </span>
                  <span className="block text-[7px] sm:text-[8px] tracking-[0.25em] text-charcoal/80 uppercase mt-0.5 sm:mt-1 font-sans">
                    Fine Living & Sillage
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`text-xs uppercase tracking-editorial font-medium transition-colors hover:text-champagne-dark relative py-2 ${
                    isActive(link.href) ? 'text-espresso-900 font-semibold' : 'text-charcoal'
                  }`}
                >
                  {link.label}
                  {isActive(link.href) && (
                    <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-champagne" />
                  )}
                </Link>
              ))}
            </nav>

            {/* Right: Actions */}
            <div className="flex items-center justify-end space-x-3 sm:space-x-5 w-20 lg:w-auto">
              {/* Desktop Search Button */}
              <button
                onClick={onOpenSearch}
                className="hidden lg:flex p-2 text-espresso-800 hover:text-champagne-dark transition-colors"
                aria-label="Search catalog"
              >
                <Search className="w-5 h-5 stroke-[1.5]" />
              </button>

              {/* Client Account / Concierge Desk */}
              <Link
                to={isAdmin ? '/admin/dashboard' : user ? '/account' : '/login'}
                className="p-2 text-espresso-800 hover:text-champagne-dark transition-colors relative flex items-center space-x-1"
                aria-label="Client Sanctuary or Concierge Desk"
                title={isAdmin ? 'Admin Operations Desk' : user ? `Client Sanctuary (${user.fullName})` : 'Sign In / Register'}
              >
                <UserIcon className="w-5 h-5 stroke-[1.5]" />
                {isAdmin && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-champagne-dark ring-2 ring-ivory-100" />
                )}
                {user && !isAdmin && (
                  <span className="hidden xl:inline text-[11px] font-semibold text-espresso-900 tracking-wider uppercase ml-1">
                    {user.fullName.split(' ')[0]}
                  </span>
                )}
              </Link>

              {/* Shopping Bag Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="p-2 text-espresso-800 hover:text-champagne-dark transition-colors relative"
                aria-label="Open Shopping Bag"
              >
                <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-espresso-900 text-ivory-100 text-[10px] font-sans font-semibold w-5 h-5 rounded-full flex items-center justify-center border border-ivory-100 shadow-sm animate-in zoom-in-50 duration-150">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Luxury Mobile Slide-Out Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 overflow-hidden">
          {/* Darkened Backdrop Overlay */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-espresso-950/70 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
            aria-hidden="true"
          />

          {/* Slide-out Drawer Container */}
          <div className="fixed inset-y-0 left-0 w-[88vw] max-w-sm bg-ivory-100 shadow-2xl flex flex-col justify-between z-50 border-r border-stone transition-transform duration-300 ease-out animate-in slide-in-from-left">
            {/* Top Bar with Brand & Close */}
            <div>
              <div className="p-5 flex items-center justify-between border-b border-stone/60 bg-ivory-50/80">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2.5"
                >
                  <img
                    src="/logo.jpg"
                    alt="MagnifiScent"
                    className="h-9 w-auto object-contain mix-blend-multiply"
                  />
                  <div>
                    <span className="font-serif text-lg font-medium tracking-widest text-espresso-900 block leading-none">
                      Magnifi<span className="text-champagne-dark font-semibold">Scent</span>
                    </span>
                    <span className="text-[7px] tracking-[0.2em] text-charcoal/80 uppercase font-sans">
                      Haute Maison
                    </span>
                  </div>
                </Link>

                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-9 h-9 rounded-full bg-stone-light/60 hover:bg-stone flex items-center justify-center text-espresso-900 transition-colors"
                  aria-label="Close navigation"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Integrated Search Bar inside Drawer */}
              <div className="p-4 border-b border-stone/40 bg-white">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenSearch();
                  }}
                  className="w-full flex items-center space-x-2.5 bg-ivory-50 border border-stone px-3.5 py-2.5 text-xs text-charcoal text-left rounded-none hover:border-espresso-900 transition-colors"
                >
                  <Search className="w-4 h-4 text-stone-muted" />
                  <span className="text-[11px] font-sans tracking-wide">
                    Search Horology, Perfumes, Gems...
                  </span>
                </button>
              </div>

              {/* Categories & Navigation Links */}
              <div className="px-4 py-4 space-y-1 overflow-y-auto max-h-[calc(100vh-320px)]">
                <p className="text-[9px] uppercase tracking-editorial font-bold text-charcoal/70 px-2 py-1">
                  Haute Collections
                </p>

                {drawerCategories.map((cat) => {
                  const Icon = cat.icon;
                  const active = isActive(cat.href);
                  return (
                    <Link
                      key={cat.href}
                      to={cat.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between p-3 transition-colors ${
                        active
                          ? 'bg-espresso-900 text-ivory-100'
                          : 'text-espresso-900 hover:bg-ivory-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            active
                              ? 'bg-champagne/20 text-champagne'
                              : 'bg-stone-light text-espresso-800'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-serif text-base font-medium leading-tight">
                            {cat.name}
                          </p>
                          <p
                            className={`text-[10px] ${
                              active ? 'text-ivory-200/70' : 'text-charcoal/70'
                            }`}
                          >
                            {cat.subtitle}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 opacity-50" />
                    </Link>
                  );
                })}

                <div className="pt-3 border-t border-stone/50 space-y-1">
                  <p className="text-[9px] uppercase tracking-editorial font-bold text-charcoal/70 px-2 py-1">
                    The Maison
                  </p>
                  <Link
                    to="/about"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2 text-xs uppercase tracking-editorial font-semibold text-espresso-900 hover:bg-ivory-50"
                  >
                    <span>Our Ethos & Craftsmanship</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-40" />
                  </Link>
                  <Link
                    to="/track"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2 text-xs uppercase tracking-editorial font-semibold text-espresso-900 hover:bg-ivory-50"
                  >
                    <span>Track Consignment / Order</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-40" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Bottom Sanctuary & Concierge Footer */}
            <div className="p-4 bg-ivory-50/90 border-t border-stone space-y-3">
              {/* Client Auth Sanctuary */}
              {user ? (
                <div className="flex items-center justify-between p-2.5 bg-white border border-stone">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-charcoal">
                      Signed in as
                    </p>
                    <p className="font-serif text-sm font-medium text-espresso-900">
                      {user.fullName}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link
                      to={isAdmin ? '/admin/dashboard' : '/account'}
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-2.5 py-1.5 bg-espresso-900 text-ivory-100 text-[10px] uppercase tracking-wider font-semibold"
                    >
                      {isAdmin ? 'Admin' : 'Sanctuary'}
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="p-1.5 text-stone-muted hover:text-espresso-900 text-[11px]"
                      title="Log Out"
                    >
                      Exit
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 px-3 border border-espresso-900 text-center text-[10px] uppercase tracking-editorial font-semibold text-espresso-900 hover:bg-espresso-900 hover:text-ivory-100 transition-colors"
                  >
                    Client Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 px-3 bg-espresso-900 text-center text-[10px] uppercase tracking-editorial font-semibold text-ivory-100 hover:bg-espresso-800 transition-colors"
                  >
                    Register
                  </Link>
                </div>
              )}

              {/* WhatsApp Concierge Direct Touch */}
              <a
                href="https://wa.me/2348011223344?text=Hello%20MagnifiScent%20Private%20Concierge%2C%20I%20would%20like%20to%20enquire%20about%20a%20luxury%20creation."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-2 py-2 px-3 bg-emerald-800 text-white text-[10px] uppercase tracking-editorial font-semibold hover:bg-emerald-900 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp Private Concierge</span>
              </a>

              {/* Legal & Currency footer */}
              <div className="flex items-center justify-between text-[10px] text-charcoal/70 pt-1">
                <span>Nigeria • NGN (₦)</span>
                <div className="flex items-center space-x-3">
                  <Link
                    to="/terms"
                    onClick={() => setMobileMenuOpen(false)}
                    className="hover:text-espresso-900 underline"
                  >
                    Terms
                  </Link>
                  <Link
                    to="/privacy"
                    onClick={() => setMobileMenuOpen(false)}
                    className="hover:text-espresso-900 underline"
                  >
                    Privacy
                  </Link>
                  <Link
                    to={isAdmin ? '/admin/dashboard' : '/admin/login'}
                    onClick={() => setMobileMenuOpen(false)}
                    className="hover:text-espresso-900 text-stone-muted"
                  >
                    Desk
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
