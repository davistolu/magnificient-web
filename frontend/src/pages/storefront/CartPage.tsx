import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext.js';
import { formatPrice, getMediaUrl, isVideoMedia } from '../../utils/formatters.js';
import { Trash2, ArrowRight, MessageSquare, ShoppingBag, Tag, ChevronRight, Play } from 'lucide-react';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.js';

export const CartPage: React.FC = () => {
  const { items, itemCount, subtotal, updateQuantity, removeItem, clearCart } = useCart();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<any>(null);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) return;

    setIsValidatingPromo(true);
    try {
      const res = await api.validateDiscount(promoCode.trim(), subtotal);
      if (res.success) {
        setAppliedDiscount(res.data);
        success('Promotional Code Applied', `Discount of ${formatPrice(res.data.discountAmount)} has been credited.`);
      }
    } catch (err: any) {
      error('Invalid Code', err.message || 'This promotional code could not be applied.');
      setAppliedDiscount(null);
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const discountAmount = appliedDiscount?.discountAmount || 0;
  const shippingEstimate = subtotal >= 150000 || subtotal === 0 ? 0 : 3500;
  const total = Math.max(0, subtotal - discountAmount + shippingEstimate);

  const buildWhatsAppMessage = () => {
    const lines = items.map((i) => `• ${i.name} (Qty: ${i.quantity}) - ${formatPrice(i.price * i.quantity)}`);
    const msg = [
      `Hello Magnificent Concierge,`,
      `I would like to place an order for the following items in my bag:`,
      ...lines,
      `\nSubtotal: ${formatPrice(subtotal)}`,
      appliedDiscount ? `Discount (${appliedDiscount.code}): -${formatPrice(discountAmount)}` : '',
      `Estimated Total: ${formatPrice(total)}`,
      `\nPlease assist me with external bank wire details or concierge payment.`,
    ].filter(Boolean).join('\n');
    return `https://wa.me/2348000000000?text=${encodeURIComponent(msg)}`;
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <div className="max-w-md mx-auto space-y-4">
          <ShoppingBag className="w-16 h-16 text-stone-muted stroke-[1] mx-auto mb-2" />
          <h1 className="font-serif text-3xl text-espresso-900 font-medium">Your Shopping Bag is Empty</h1>
          <p className="text-xs sm:text-sm text-charcoal font-light leading-relaxed">
            Your shopping bag currently contains no pieces. Explore our horology, fine jewellery, and bespoke fragrances.
          </p>
          <div className="pt-4">
            <Link
              to="/shop"
              className="inline-flex items-center space-x-2 px-8 py-4 bg-espresso-900 text-ivory-100 text-xs uppercase tracking-editorial font-semibold hover:bg-champagne-dark transition-colors"
            >
              <span>Explore Creations</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-[11px] uppercase tracking-editorial text-charcoal/70 mb-8 font-mono">
        <Link to="/" className="hover:text-espresso-900 transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-espresso-900 font-medium">Shopping Bag</span>
      </nav>

      <div className="flex justify-between items-end pb-6 border-b border-stone mb-10">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl text-espresso-900 font-medium">
            Your Shopping Bag
          </h1>
          <p className="text-xs text-charcoal tracking-editorial uppercase mt-1">
            {itemCount} {itemCount === 1 ? 'Creation' : 'Creations'} Selected
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-stone-muted hover:text-red-700 uppercase tracking-editorial transition-colors"
        >
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Line Items Table (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-stone p-6 sm:p-8 space-y-6">
          <div className="divide-y divide-stone/50">
            {items.map((item) => (
              <div key={item.productId} className="py-6 first:pt-0 last:pb-0 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 items-start sm:items-center justify-between">
                <div className="flex space-x-4 items-center">
                  <div className="w-20 h-24 bg-stone-light shrink-0 overflow-hidden border border-stone/50 relative">
                    {isVideoMedia(item.imageUrl) ? (
                      <div className="relative w-full h-full bg-espresso-950 flex items-center justify-center">
                        <video
                          src={getMediaUrl(item.imageUrl)}
                          className="w-full h-full object-cover opacity-80"
                          muted
                          preload="metadata"
                        />
                        <Play className="w-4 h-4 text-ivory-100 absolute fill-ivory-100/50" />
                      </div>
                    ) : (
                      <img
                        src={getMediaUrl(item.imageUrl)}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="%23999" stroke-width="1.5"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';
                        }}
                      />
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-charcoal/70 font-mono">
                      {item.sku}
                    </span>
                    <Link
                      to={`/products/${item.slug}`}
                      className="font-serif text-base font-medium text-espresso-900 hover:text-champagne-dark transition-colors block"
                    >
                      {item.name}
                    </Link>
                    <span className="text-xs text-charcoal font-medium font-sans mt-0.5 block">
                      {formatPrice(item.price)} each
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-6 w-full sm:w-auto justify-between sm:justify-end">
                  {/* Quantity selector */}
                  <div className="flex items-center border border-stone bg-ivory-50">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center text-charcoal hover:text-espresso-900"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-xs font-semibold text-espresso-900 font-mono">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      disabled={item.quantity >= item.maxStock}
                      className="w-8 h-8 flex items-center justify-center text-charcoal hover:text-espresso-900 disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>

                  <span className="font-serif text-base font-semibold text-espresso-900 font-sans">
                    {formatPrice(item.price * item.quantity)}
                  </span>

                  <button
                    onClick={() => removeItem(item.productId)}
                    className="p-1.5 text-stone-muted hover:text-red-700 transition-colors"
                    aria-label={`Remove ${item.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary & Actions (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-stone p-6 sm:p-8 space-y-6">
          <h2 className="font-serif text-xl text-espresso-900 font-medium">Order Summary</h2>

          {/* Promo code input */}
          <form onSubmit={handleApplyPromo} className="flex space-x-2">
            <div className="relative flex-1">
              <Tag className="w-3.5 h-3.5 text-stone-muted absolute left-3 top-3.5" />
              <input
                type="text"
                placeholder="Promo Code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                className="w-full bg-ivory-50 border border-stone pl-9 pr-3 py-2 text-xs uppercase tracking-wider text-espresso-900 focus:outline-none focus:border-espresso-900"
              />
            </div>
            <button
              type="submit"
              disabled={isValidatingPromo}
              className="px-4 py-2 bg-espresso-900 hover:bg-espresso-800 disabled:opacity-50 text-ivory-100 text-xs uppercase tracking-editorial font-medium"
            >
              {isValidatingPromo ? '...' : 'Apply'}
            </button>
          </form>

          {appliedDiscount && (
            <div className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 p-2.5 flex justify-between items-center">
              <span>Code <strong>{appliedDiscount.code}</strong> applied</span>
              <button
                onClick={() => {
                  setAppliedDiscount(null);
                  setPromoCode('');
                }}
                className="text-stone-muted hover:text-red-700 text-xs"
              >
                Remove
              </button>
            </div>
          )}

          <div className="divide-y divide-stone/40 text-xs space-y-3 pt-2">
            <div className="flex justify-between items-center text-charcoal pt-3">
              <span>Subtotal</span>
              <span className="font-mono text-espresso-900 font-semibold">{formatPrice(subtotal)}</span>
            </div>

            {appliedDiscount && (
              <div className="flex justify-between items-center text-emerald-800 pt-3">
                <span>Promotional Discount</span>
                <span className="font-mono font-semibold">-{formatPrice(discountAmount)}</span>
              </div>
            )}

            <div className="flex justify-between items-center text-charcoal pt-3">
              <span>Delivery Transport</span>
              <span className="font-mono text-espresso-900 font-semibold">
                {shippingEstimate === 0 ? 'Complimentary' : formatPrice(shippingEstimate)}
              </span>
            </div>

            <div className="flex justify-between items-baseline pt-4 text-base">
              <span className="font-serif text-espresso-900 text-lg">Total Amount</span>
              <span className="font-serif text-xl sm:text-2xl font-bold text-espresso-900 font-sans tracking-tight">
                {formatPrice(total)}
              </span>
            </div>
          </div>

          <div className="pt-2 flex flex-col space-y-3">
            <button
              onClick={() => navigate('/checkout', { state: { discountCode: appliedDiscount?.code } })}
              className="w-full py-4 bg-espresso-900 hover:bg-espresso-800 text-ivory-100 text-xs uppercase tracking-editorial font-semibold transition-all shadow-md flex items-center justify-center space-x-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href={buildWhatsAppMessage()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 border border-stone bg-ivory-50 hover:bg-ivory-200 text-espresso-900 text-xs uppercase tracking-editorial font-medium flex items-center justify-center space-x-2 transition-colors text-center"
            >
              <MessageSquare className="w-4 h-4 text-emerald-700" />
              <span>Complete via WhatsApp Concierge</span>
            </a>
          </div>

          <p className="text-[11px] text-charcoal/80 leading-relaxed text-center">
            Manual bank wire transfer instructions and receipt upload link provided on the confirmation step.
          </p>
        </div>
      </div>
    </div>
  );
};
