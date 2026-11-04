import React from 'react';
import { X, Trash2, ArrowRight, MessageSquare, ShoppingBag, Play } from 'lucide-react';
import { useCart } from '../../context/CartContext.js';
import { formatPrice, getMediaUrl, isVideoMedia } from '../../utils/formatters.js';
import { Link } from 'react-router-dom';

export const CartDrawer: React.FC = () => {
  const { items, itemCount, subtotal, isCartOpen, setIsCartOpen, updateQuantity, removeItem } = useCart();

  if (!isCartOpen) return null;

  const buildWhatsAppMessage = () => {
    const lines = items.map((i) => `• ${i.name} (Qty: ${i.quantity}) - ${formatPrice(i.price * i.quantity)}`);
    const text = [
      `Hello Magnificent Concierge,`,
      `I would like to enquire about purchasing the following items currently in my bag:`,
      ...lines,
      `\nEstimated Subtotal: ${formatPrice(subtotal)}`,
      `Could you please confirm availability and provide bank transfer or concierge payment instructions?`,
    ].join('\n');
    return `https://wa.me/2348000000000?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-espresso-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-ivory-100 shadow-2xl flex flex-col border-l border-stone animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-6 border-b border-stone flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl text-espresso-900 tracking-wide font-medium">
                Your Shopping Bag
              </h2>
              <p className="text-xs text-charcoal tracking-editorial uppercase mt-0.5">
                {itemCount} {itemCount === 1 ? 'Piece' : 'Pieces'} Selected
              </p>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-stone-muted hover:text-espresso-900 transition-colors"
              aria-label="Close bag drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {items.length === 0 ? (
              <div className="text-center py-16 flex flex-col items-center">
                <ShoppingBag className="w-12 h-12 text-stone-muted stroke-[1] mb-4" />
                <h3 className="font-serif text-lg text-espresso-900 font-medium">
                  Your bag is currently empty
                </h3>
                <p className="text-xs text-charcoal mt-2 max-w-xs leading-relaxed">
                  Discover our horological timepieces, fine jewellery, and artisanal extraits.
                </p>
                <Link
                  to="/shop"
                  onClick={() => setIsCartOpen(false)}
                  className="mt-6 inline-flex items-center space-x-2 text-xs uppercase tracking-editorial font-semibold text-espresso-900 hover:text-champagne-dark border-b border-espresso-900 pb-1"
                >
                  <span>Explore the Collection</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.productId} className="flex space-x-4 pb-6 border-b border-stone/50 last:border-b-0">
                  <div className="w-20 h-24 bg-stone-light shrink-0 overflow-hidden border border-stone/60 relative">
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
                        className="w-full h-full object-cover object-center"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="%23999" stroke-width="1.5"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';
                        }}
                      />
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <Link
                          to={`/products/${item.slug}`}
                          onClick={() => setIsCartOpen(false)}
                          className="font-serif text-sm font-medium text-espresso-900 hover:text-champagne-dark transition-colors line-clamp-1"
                        >
                          {item.name}
                        </Link>
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="text-stone-muted hover:text-red-700 transition-colors p-1"
                          aria-label={`Remove ${item.name} from bag`}
                        >
                          <Trash2 className="w-4 h-4 stroke-[1.5]" />
                        </button>
                      </div>
                      <p className="text-[11px] text-charcoal/80 mt-0.5 tracking-wider uppercase font-mono">
                        {item.sku}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity Selector */}
                      <div className="flex items-center border border-stone bg-white">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-charcoal hover:text-espresso-900 text-sm"
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-xs font-medium text-espresso-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          disabled={item.quantity >= item.maxStock}
                          className="w-7 h-7 flex items-center justify-center text-charcoal hover:text-espresso-900 disabled:opacity-30 text-sm"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <span className="text-sm font-medium text-espresso-900 font-sans">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Actions */}
          {items.length > 0 && (
            <div className="p-6 border-t border-stone bg-white space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="font-serif text-espresso-900 text-base">Estimated Subtotal</span>
                <span className="font-medium text-espresso-900 text-base font-sans">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <p className="text-[11px] text-charcoal leading-relaxed">
                Taxes & delivery fees calculated at checkout. Orders paid via manual bank transfer or direct WhatsApp concierge.
              </p>

              <div className="flex flex-col space-y-2 pt-2">
                <Link
                  to="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full py-3.5 bg-espresso-900 hover:bg-espresso-800 text-ivory-100 text-xs uppercase tracking-editorial font-semibold flex items-center justify-center space-x-2 transition-all shadow-md"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href={buildWhatsAppMessage()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 border border-stone bg-ivory-50 hover:bg-ivory-200 text-espresso-900 text-xs uppercase tracking-editorial font-medium flex items-center justify-center space-x-2 transition-colors"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-700" />
                  <span>Order via WhatsApp Concierge</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
