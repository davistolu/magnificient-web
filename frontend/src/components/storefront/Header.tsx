import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, User as UserIcon, Menu, X } from 'lucide-react';
import { useCart } from '../../context/CartContext.js';
import { useAuth } from '../../context/AuthContext.js';

interface HeaderProps {
  onOpenSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSearch }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { itemCount, setIsCartOpen } = useCart();
  const { user, isAdmin } = useAuth();
  const location = useLocation();

  const navLinks = [
    { label: 'Shop All', href: '/shop' },
    { label: 'Watches', href: '/watches' },
    { label: 'Jewellery', href: '/jewellery' },
    { label: 'Perfumes', href: '/perfumes' },
    { label: 'Gift Sets', href: '/gift-sets' },
    { label: 'Our Ethos', href: '/about' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-ivory-100/90 backdrop-blur-md border-b border-stone/60 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-espresso-800 hover:text-champagne transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Brand Logo & Wordmark */}
          <div className="flex-1 lg:flex-none text-center lg:text-left">
            <Link to="/" className="inline-flex items-center space-x-3 group py-1">
              <img
                src="/logo.jpg"
                alt="MagnifiScent Luxury"
                className="h-11 sm:h-12 w-auto object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-105"
              />
              <div className="hidden md:block text-left">
                <span className="font-serif text-xl sm:text-2xl font-medium tracking-widest text-espresso-900 group-hover:text-champagne-dark transition-colors block leading-none">
                  Magnifi<span className="text-champagne-dark font-semibold">Scent</span>
                </span>
                <span className="block text-[8px] tracking-[0.25em] text-charcoal/80 uppercase mt-1 font-sans">
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

          {/* Action Icons */}
          <div className="flex items-center space-x-5">
            {/* Search */}
            <button
              onClick={onOpenSearch}
              className="p-2 text-espresso-800 hover:text-champagne-dark transition-colors"
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

            {/* Shopping Bag */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="p-2 text-espresso-800 hover:text-champagne-dark transition-colors relative"
              aria-label="Open Shopping Bag"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-espresso-900 text-ivory-100 text-[10px] font-sans font-semibold w-5 h-5 rounded-full flex items-center justify-center border border-ivory-100">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-20 z-50 bg-ivory-100/98 backdrop-blur-lg border-t border-stone animate-in fade-in duration-200">
          <div className="px-6 py-8 flex flex-col space-y-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-lg font-serif tracking-wide py-2 border-b border-stone/40 ${
                  isActive(link.href) ? 'text-espresso-900 font-semibold' : 'text-charcoal'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 flex flex-col space-y-3">
              {user ? (
                <Link
                  to={isAdmin ? '/admin/dashboard' : '/account'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xs uppercase tracking-editorial text-espresso-900 font-semibold"
                >
                  {isAdmin ? 'Operations Dashboard' : `My Client Sanctuary (${user.fullName})`}
                </Link>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xs uppercase tracking-editorial text-espresso-900 font-semibold"
                >
                  Client Sign In / Register
                </Link>
              )}
              <Link
                to="/track"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs uppercase tracking-editorial text-charcoal hover:text-espresso-900"
              >
                Track An Order
              </Link>
              <Link
                to={isAdmin ? '/admin/dashboard' : '/admin/login'}
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs uppercase tracking-editorial text-stone-muted hover:text-charcoal"
              >
                {isAdmin ? 'Staff Operations' : 'Staff Concierge Portal'}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
