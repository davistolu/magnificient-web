import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';
import { formatPrice, getMediaUrl, isVideoMedia } from '../../utils/formatters.js';
import { useToast } from '../../context/ToastContext.js';
import {
  CreditCard,
  Building2,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  AlertCircle,
  UserCheck,
  Tag,
  X,
  Check,
  Play,
} from 'lucide-react';

const NIGERIAN_STATES = [
  'Lagos',
  'Abuja (FCT)',
  'Rivers',
  'Oyo',
  'Kano',
  'Delta',
  'Edo',
  'Enugu',
  'Kaduna',
  'Ogun',
  'Anambra',
  'Akwa Ibom',
  'Ondo',
  'Osun',
  'Plateau',
  'Other / International Destination',
];

export const CheckoutPage: React.FC = () => {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { success, error } = useToast();

  const passedDiscountCode = (location.state as any)?.discountCode || '';

  const [form, setForm] = useState({
    customerName: user?.fullName || '',
    customerEmail: user?.email || '',
    customerPhone: user?.phone || '',
    deliveryAddress: '',
    deliveryCity: '',
    deliveryState: 'Lagos',
    deliveryInstructions: '',
    shippingMethod: 'standard' as 'standard' | 'express',
    paymentMethod: 'bank_transfer' as 'bank_transfer' | 'whatsapp',
    discountCode: passedDiscountCode,
  });

  const [promoInput, setPromoInput] = useState(passedDiscountCode);
  const [appliedDiscount, setAppliedDiscount] = useState<{
    code: string;
    discountType: string;
    discountValue: number;
    discountAmount: number;
  } | null>(null);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleValidateCode = async (codeToValidate: string, showToast = true) => {
    const code = codeToValidate.trim().toUpperCase();
    if (!code) return;

    setIsValidatingPromo(true);
    setPromoError(null);
    try {
      const res = await api.validateDiscount(code, subtotal);
      if (res.success && res.data) {
        setAppliedDiscount(res.data);
        setForm((prev) => ({ ...prev, discountCode: res.data.code }));
        setPromoInput(res.data.code);
        if (showToast) {
          success(
            'Privilege Code Applied',
            `Privilege discount of ${formatPrice(res.data.discountAmount)} has been credited.`
          );
        }
      }
    } catch (err: any) {
      const message = err.message || 'Invalid or expired promotional code.';
      setPromoError(message);
      setAppliedDiscount(null);
      setForm((prev) => ({ ...prev, discountCode: '' }));
      if (showToast) {
        error('Promotional Code', message);
      }
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedDiscount(null);
    setForm((prev) => ({ ...prev, discountCode: '' }));
    setPromoInput('');
    setPromoError(null);
  };

  useEffect(() => {
    if (passedDiscountCode && subtotal > 0 && !appliedDiscount) {
      handleValidateCode(passedDiscountCode, false);
    }
  }, [passedDiscountCode, subtotal]);

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const discountAmount = appliedDiscount?.discountAmount || 0;
  const shippingFee =
    form.shippingMethod === 'express'
      ? 7000
      : subtotal >= 150000
      ? 0
      : 3500;

  const estimatedTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormErrors({});

    try {
      const payload = {
        ...form,
        discountCode: appliedDiscount?.code || form.discountCode || undefined,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          selectedOptions: i.selectedOptions || {},
        })),
      };

      const res = await api.checkout(payload);
      if (res.success && res.data) {
        const { order, guestAccessToken, whatsappUrl } = res.data;
        clearCart();

        if (form.paymentMethod === 'whatsapp' && whatsappUrl) {
          window.open(whatsappUrl, '_blank');
          navigate(`/order-confirmation/${order.orderNumber}?token=${guestAccessToken}`);
        } else {
          navigate(`/payment-instructions/${order.orderNumber}?token=${guestAccessToken}`);
        }
      }
    } catch (err: any) {
      if (err.errors) {
        setFormErrors(err.errors);
      } else {
        error('Order Processing Error', err.message || 'Unable to create order. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-[11px] uppercase tracking-editorial text-charcoal/70 mb-8 font-mono">
        <Link to="/cart" className="hover:text-espresso-900 transition-colors">
          Shopping Bag
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-espresso-900 font-medium">Checkout</span>
      </nav>

      <div className="mb-10 pb-6 border-b border-stone">
        <h1 className="font-serif text-3xl sm:text-4xl text-espresso-900 font-medium">
          White-Glove Checkout
        </h1>
        <p className="text-xs text-charcoal tracking-editorial uppercase mt-1">
          Finalise your acquisition details
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: Information & Methods (7 cols) */}
        <div className="lg:col-span-7 space-y-10">
          {/* Section 1: Customer Details */}
          <div className="bg-white border border-stone p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-stone/50 pb-3">
              <h2 className="font-serif text-xl text-espresso-900 font-medium">
                1. Recipient Details
              </h2>
              {user ? (
                <span className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 inline-flex items-center space-x-1">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Client: {user.fullName}</span>
                </span>
              ) : (
                <Link
                  to="/login"
                  state={{ from: location }}
                  className="text-[11px] text-champagne-dark hover:underline font-medium"
                >
                  Sign in to auto-fill &rarr;
                </Link>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-[11px] uppercase tracking-editorial text-espresso-900 font-semibold block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.customerName}
                  onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                  placeholder="e.g. Lady Aisha Bello"
                  className="w-full bg-ivory-50 border border-stone px-3.5 py-2.5 text-xs text-espresso-900 focus:outline-none focus:border-espresso-900"
                />
                {formErrors.customerName && (
                  <p className="text-xs text-red-600 mt-1">{formErrors.customerName}</p>
                )}
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-editorial text-espresso-900 font-semibold block mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={form.customerEmail}
                  onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                  placeholder="aisha.bello@example.com"
                  className="w-full bg-ivory-50 border border-stone px-3.5 py-2.5 text-xs text-espresso-900 focus:outline-none focus:border-espresso-900"
                />
                {formErrors.customerEmail && (
                  <p className="text-xs text-red-600 mt-1">{formErrors.customerEmail}</p>
                )}
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-editorial text-espresso-900 font-semibold block mb-1">
                  Phone Number (reachable for courier) *
                </label>
                <input
                  type="tel"
                  required
                  value={form.customerPhone}
                  onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                  placeholder="+234 800 000 0000"
                  className="w-full bg-ivory-50 border border-stone px-3.5 py-2.5 text-xs text-espresso-900 focus:outline-none focus:border-espresso-900"
                />
                {formErrors.customerPhone && (
                  <p className="text-xs text-red-600 mt-1">{formErrors.customerPhone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Delivery Destination */}
          <div className="bg-white border border-stone p-6 sm:p-8 space-y-5">
            <h2 className="font-serif text-xl text-espresso-900 font-medium border-b border-stone/50 pb-3">
              2. Delivery Destination
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-[11px] uppercase tracking-editorial text-espresso-900 font-semibold block mb-1">
                  Street Address & Residence *
                </label>
                <input
                  type="text"
                  required
                  value={form.deliveryAddress}
                  onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })}
                  placeholder="e.g. 15 Queens Drive, Ikoyi"
                  className="w-full bg-ivory-50 border border-stone px-3.5 py-2.5 text-xs text-espresso-900 focus:outline-none focus:border-espresso-900"
                />
                {formErrors.deliveryAddress && (
                  <p className="text-xs text-red-600 mt-1">{formErrors.deliveryAddress}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] uppercase tracking-editorial text-espresso-900 font-semibold block mb-1">
                    City / Town *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.deliveryCity}
                    onChange={(e) => setForm({ ...form, deliveryCity: e.target.value })}
                    placeholder="e.g. Lagos"
                    className="w-full bg-ivory-50 border border-stone px-3.5 py-2.5 text-xs text-espresso-900 focus:outline-none focus:border-espresso-900"
                  />
                  {formErrors.deliveryCity && (
                    <p className="text-xs text-red-600 mt-1">{formErrors.deliveryCity}</p>
                  )}
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-editorial text-espresso-900 font-semibold block mb-1">
                    State / Territory *
                  </label>
                  <select
                    value={form.deliveryState}
                    onChange={(e) => setForm({ ...form, deliveryState: e.target.value })}
                    className="w-full bg-ivory-50 border border-stone px-3.5 py-2.5 text-xs text-espresso-900 focus:outline-none focus:border-espresso-900"
                  >
                    {NIGERIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-editorial text-espresso-900 font-semibold block mb-1">
                  Delivery Notes or Special Instructions (Optional)
                </label>
                <textarea
                  rows={2}
                  value={form.deliveryInstructions}
                  onChange={(e) => setForm({ ...form, deliveryInstructions: e.target.value })}
                  placeholder="e.g. Please leave with concierge desk or call before arrival"
                  className="w-full bg-ivory-50 border border-stone px-3.5 py-2 text-xs text-espresso-900 focus:outline-none focus:border-espresso-900"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Shipping Speed */}
          <div className="bg-white border border-stone p-6 sm:p-8 space-y-4">
            <h2 className="font-serif text-xl text-espresso-900 font-medium border-b border-stone/50 pb-3">
              3. Delivery Service
            </h2>

            <div className="space-y-3">
              <label
                className={`p-4 border flex items-center justify-between cursor-pointer transition-all ${
                  form.shippingMethod === 'standard'
                    ? 'border-espresso-900 bg-ivory-50/80 ring-1 ring-espresso-900'
                    : 'border-stone hover:border-stone-muted'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="shippingMethod"
                    checked={form.shippingMethod === 'standard'}
                    onChange={() => setForm({ ...form, shippingMethod: 'standard' })}
                    className="text-espresso-900 focus:ring-espresso-900"
                  />
                  <div>
                    <p className="text-xs font-semibold text-espresso-900">Standard Insured Courier</p>
                    <p className="text-[11px] text-charcoal">2-4 business days across Nigeria</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-semibold text-espresso-900">
                  {subtotal >= 150000 ? 'Complimentary' : '₦3,500'}
                </span>
              </label>

              <label
                className={`p-4 border flex items-center justify-between cursor-pointer transition-all ${
                  form.shippingMethod === 'express'
                    ? 'border-espresso-900 bg-ivory-50/80 ring-1 ring-espresso-900'
                    : 'border-stone hover:border-stone-muted'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="shippingMethod"
                    checked={form.shippingMethod === 'express'}
                    onChange={() => setForm({ ...form, shippingMethod: 'express' })}
                    className="text-espresso-900 focus:ring-espresso-900"
                  />
                  <div>
                    <p className="text-xs font-semibold text-espresso-900">Express Priority Concierge Dispatch</p>
                    <p className="text-[11px] text-charcoal">Next day arrival (Lagos & Abuja priority handling)</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-semibold text-espresso-900">₦7,000</span>
              </label>
            </div>
          </div>

          {/* Section 4: Manual Payment Method Selection */}
          <div className="bg-white border border-stone p-6 sm:p-8 space-y-4">
            <h2 className="font-serif text-xl text-espresso-900 font-medium border-b border-stone/50 pb-3">
              4. Payment Method
            </h2>

            <div className="space-y-4">
              {/* Option 1: Manual Bank Transfer */}
              <label
                className={`p-5 border flex items-start space-x-4 cursor-pointer transition-all ${
                  form.paymentMethod === 'bank_transfer'
                    ? 'border-espresso-900 bg-ivory-50 ring-1 ring-espresso-900'
                    : 'border-stone hover:border-stone-muted'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={form.paymentMethod === 'bank_transfer'}
                  onChange={() => setForm({ ...form, paymentMethod: 'bank_transfer' })}
                  className="mt-1 text-espresso-900 focus:ring-espresso-900"
                />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-4 h-4 text-espresso-900" />
                    <span className="text-xs font-semibold uppercase tracking-editorial text-espresso-900">
                      Manual Bank Wire Transfer & Receipt Upload
                    </span>
                  </div>
                  <p className="text-xs text-charcoal leading-relaxed">
                    Transfer directly to our designated corporate banking account. Once transferred, upload your payment receipt for independent ledger reconciliation and immediate order confirmation.
                  </p>
                </div>
              </label>

              {/* Option 2: WhatsApp Ordering */}
              <label
                className={`p-5 border flex items-start space-x-4 cursor-pointer transition-all ${
                  form.paymentMethod === 'whatsapp'
                    ? 'border-espresso-900 bg-ivory-50 ring-1 ring-espresso-900'
                    : 'border-stone hover:border-stone-muted'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={form.paymentMethod === 'whatsapp'}
                  onChange={() => setForm({ ...form, paymentMethod: 'whatsapp' })}
                  className="mt-1 text-espresso-900 focus:ring-espresso-900"
                />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4 text-emerald-700" />
                    <span className="text-xs font-semibold uppercase tracking-editorial text-espresso-900">
                      WhatsApp Luxury Concierge Order
                    </span>
                  </div>
                  <p className="text-xs text-charcoal leading-relaxed">
                    Connect directly with our private concierge team on WhatsApp to finalize your delivery window, request customized gift calligraphy, or arrange alternative payment.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Review Summary (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-stone p-6 sm:p-8 space-y-6 sticky top-28">
          <h2 className="font-serif text-xl text-espresso-900 font-medium border-b border-stone/50 pb-3">
            Acquisition Summary
          </h2>

          <div className="divide-y divide-stone/40 max-h-72 overflow-y-auto pr-1">
            {items.map((i) => (
              <div key={i.productId} className="py-3 flex items-center space-x-3 text-xs">
                <div className="w-12 h-14 bg-stone-light shrink-0 overflow-hidden border border-stone/50 relative">
                  {isVideoMedia(i.imageUrl) ? (
                    <div className="relative w-full h-full bg-espresso-950 flex items-center justify-center">
                      <video
                        src={getMediaUrl(i.imageUrl)}
                        className="w-full h-full object-cover opacity-80"
                        muted
                        preload="metadata"
                      />
                      <Play className="w-3.5 h-3.5 text-ivory-100 absolute fill-ivory-100/50" />
                    </div>
                  ) : (
                    <img
                      src={getMediaUrl(i.imageUrl)}
                      alt={i.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="%23999" stroke-width="1.5"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';
                      }}
                    />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-serif font-medium text-espresso-900 line-clamp-1">{i.name}</p>
                  <p className="text-[10px] text-charcoal/70">Qty: {i.quantity}</p>
                </div>
                <span className="font-mono font-medium text-espresso-900">
                  {formatPrice(i.price * i.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Privilege / Promotional Code */}
          <div className="pt-2 pb-1 border-t border-stone/50 space-y-2">
            <label className="text-[11px] uppercase tracking-editorial text-espresso-900 font-semibold flex items-center space-x-1.5">
              <Tag className="w-3.5 h-3.5 text-champagne-dark" />
              <span>Privilege / Discount Code</span>
            </label>

            {appliedDiscount ? (
              <div className="bg-emerald-50/90 border border-emerald-200/80 p-3 flex items-center justify-between text-xs transition-all">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-1.5 text-emerald-900 font-medium font-mono text-[11px] uppercase tracking-wider">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{appliedDiscount.code}</span>
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    {formatPrice(discountAmount)} privilege deduction applied
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRemovePromo}
                  className="text-[11px] text-stone-muted hover:text-red-700 underline transition-colors font-medium flex items-center space-x-1"
                >
                  <X className="w-3 h-3" />
                  <span>Remove</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="e.g. MAGNIFICENT10"
                      value={promoInput}
                      onChange={(e) => {
                        setPromoInput(e.target.value.toUpperCase());
                        if (promoError) setPromoError(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleValidateCode(promoInput, true);
                        }
                      }}
                      className="w-full bg-ivory-50 border border-stone px-3 py-2 text-xs uppercase tracking-wider text-espresso-900 placeholder:normal-case placeholder:tracking-normal placeholder:text-stone-muted focus:outline-none focus:border-espresso-900"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleValidateCode(promoInput, true)}
                    disabled={isValidatingPromo || !promoInput.trim()}
                    className="px-4 py-2 bg-espresso-900 hover:bg-espresso-800 disabled:opacity-40 text-ivory-100 text-[11px] uppercase tracking-editorial font-semibold transition-colors"
                  >
                    {isValidatingPromo ? 'Verifying...' : 'Apply'}
                  </button>
                </div>

                {promoError && (
                  <p className="text-[11px] text-red-600 flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{promoError}</span>
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="divide-y divide-stone/40 text-xs space-y-2 pt-2 border-t border-stone">
            <div className="flex justify-between items-center text-charcoal pt-2">
              <span>Subtotal</span>
              <span className="font-mono text-espresso-900 font-semibold">{formatPrice(subtotal)}</span>
            </div>

            {appliedDiscount && (
              <div className="flex justify-between items-center text-emerald-800 pt-2 font-medium">
                <span>Promotional Privilege ({appliedDiscount.code})</span>
                <span className="font-mono font-semibold">-{formatPrice(discountAmount)}</span>
              </div>
            )}

            <div className="flex justify-between items-center text-charcoal pt-2">
              <span>Delivery Transport</span>
              <span className="font-mono text-espresso-900 font-semibold">
                {shippingFee === 0 ? 'Complimentary' : formatPrice(shippingFee)}
              </span>
            </div>

            <div className="flex justify-between items-baseline pt-4 text-base">
              <span className="font-serif text-espresso-900 text-lg">Total Payable</span>
              <span className="font-serif text-xl sm:text-2xl font-bold text-espresso-900 tracking-tight font-sans">
                {formatPrice(estimatedTotal)}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-espresso-900 hover:bg-espresso-800 disabled:opacity-50 text-ivory-100 text-xs uppercase tracking-editorial font-semibold transition-all shadow-lg flex items-center justify-center space-x-2"
          >
            <span>{isSubmitting ? 'Placing Order...' : 'Confirm & Place Order'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="flex items-center justify-center space-x-2 text-[11px] text-charcoal/80 pt-2">
            <ShieldCheck className="w-4 h-4 text-champagne-dark" />
            <span>Encrypted external verification guarantee</span>
          </div>
        </div>
      </form>
    </div>
  );
};
