import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { formatPrice, formatDate, formatDateTime, getMediaUrl, isVideoMedia } from '../../utils/formatters.js';
import {
  Search,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  AlertTriangle,
  ArrowRight,
  MessageSquare,
  ShieldCheck,
  Building2,
  Play,
} from 'lucide-react';
import { SEO } from '../../components/common/SEO.js';

const STATUS_STEPS = [
  { key: 'pending_payment', label: 'Order Placed' },
  { key: 'payment_review', label: 'Payment Review' },
  { key: 'confirmed', label: 'Payment Confirmed' },
  { key: 'processing', label: 'Processing' },
  { key: 'ready_for_dispatch', label: 'Ready for Dispatch' },
  { key: 'shipped', label: 'In Transit' },
  { key: 'delivered', label: 'Delivered' },
];

export const OrderTrackingPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialOrderNumber = searchParams.get('orderNumber') || '';
  const initialEmail = searchParams.get('email') || '';
  const initialToken = searchParams.get('token') || '';

  const [orderNumberInput, setOrderNumberInput] = useState(initialOrderNumber);
  const [emailInput, setEmailInput] = useState(initialEmail);

  const [orderData, setOrderData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchOrder = async (number: string, email: string, token: string) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await api.trackOrder(number, { email, token });
      if (res.success) {
        setOrderData(res.data);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to locate order. Please verify your reference number and email.');
      setOrderData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderNumber && (initialEmail || initialToken)) {
      fetchOrder(initialOrderNumber, initialEmail, initialToken);
    }
  }, [initialOrderNumber, initialEmail, initialToken]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumberInput.trim()) return;

    setSearchParams({
      orderNumber: orderNumberInput.trim(),
      email: emailInput.trim(),
    });
    fetchOrder(orderNumberInput.trim(), emailInput.trim(), '');
  };

  const getStepIndex = (status: string) => {
    if (status === 'cancelled') return -1;
    const idx = STATUS_STEPS.findIndex((s) => s.key === status);
    return idx > -1 ? idx : 0;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      <SEO
        title="Track Your Acquisition & Order Status | MagnifiScent Concierge"
        description="Verify real-time fulfillment status, wire payment verification, and dispatch progress for your MagnifiScent luxury order."
        canonical="https://magnifiscent.site/track"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Track Order', url: '/track' },
        ]}
      />
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-[10px] uppercase tracking-widest text-charcoal/70 font-semibold font-mono">
          Concierge Services
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-espresso-900 font-medium tracking-wide">
          Track Your Acquisition
        </h1>
        <p className="text-xs sm:text-sm text-charcoal font-light leading-relaxed">
          Verify fulfillment status, bank transfer review, and dispatch schedule.
        </p>
      </div>

      {/* Lookup Form */}
      <form onSubmit={handleSearchSubmit} className="bg-white border border-stone p-6 sm:p-8 max-w-2xl mx-auto shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] uppercase tracking-editorial text-espresso-900 font-semibold block mb-1">
              Order Reference Number *
            </label>
            <input
              type="text"
              required
              value={orderNumberInput}
              onChange={(e) => setOrderNumberInput(e.target.value.toUpperCase())}
              placeholder="e.g. MAG-2026-XXXX"
              className="w-full bg-ivory-50 border border-stone px-3.5 py-2.5 text-xs font-mono text-espresso-900 uppercase focus:outline-none focus:border-espresso-900"
            />
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-editorial text-espresso-900 font-semibold block mb-1">
              Order Email Address *
            </label>
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="e.g. yourname@example.com"
              className="w-full bg-ivory-50 border border-stone px-3.5 py-2.5 text-xs text-espresso-900 focus:outline-none focus:border-espresso-900"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 bg-espresso-900 hover:bg-espresso-800 disabled:opacity-50 text-ivory-100 text-xs uppercase tracking-editorial font-semibold transition-colors flex items-center justify-center space-x-2"
        >
          <Search className="w-4 h-4" />
          <span>{isLoading ? 'Locating Record...' : 'Retrieve Order Details'}</span>
        </button>

        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </form>

      {/* Order Details Display */}
      {orderData && (
        <div className="space-y-10 animate-in fade-in duration-300">
          {/* Status Card & Visual Lifecycle Timeline */}
          <div className="bg-white border border-stone p-6 sm:p-10 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone/50 pb-6 gap-4">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-charcoal/70 font-mono">
                  Order {orderData.order.orderNumber}
                </span>
                <h2 className="font-serif text-2xl text-espresso-900 font-medium">
                  {orderData.order.customerName}
                </h2>
                <p className="text-xs text-charcoal mt-0.5">
                  Placed on {formatDateTime(orderData.order.createdAt)}
                </p>
              </div>

              {/* Status Badges */}
              <div className="flex flex-col sm:items-end space-y-1.5">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] uppercase tracking-editorial text-charcoal font-medium">Payment:</span>
                  <span
                    className={`text-[10px] uppercase tracking-editorial px-2.5 py-1 font-semibold ${
                      orderData.order.paymentStatus === 'paid'
                        ? 'bg-emerald-100 text-emerald-800'
                        : orderData.order.paymentStatus === 'pending_verification'
                        ? 'bg-amber-100 text-amber-900'
                        : orderData.order.paymentStatus === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-stone text-charcoal'
                    }`}
                  >
                    {orderData.order.paymentStatus.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-[10px] uppercase tracking-editorial text-charcoal font-medium">Fulfillment:</span>
                  <span className="text-[10px] uppercase tracking-editorial px-2.5 py-1 font-semibold bg-espresso-900 text-ivory-100">
                    {orderData.order.orderStatus.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Visual Timeline Steps */}
            <div>
              <p className="text-xs uppercase tracking-editorial text-charcoal font-semibold mb-6">
                Fulfillment Timeline
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                {STATUS_STEPS.map((step, idx) => {
                  const currentIdx = getStepIndex(orderData.order.orderStatus);
                  const isDone = currentIdx >= idx;
                  const isCurrent = currentIdx === idx;

                  return (
                    <div
                      key={step.key}
                      className={`p-3 border text-center flex flex-col justify-between transition-colors ${
                        isCurrent
                          ? 'border-espresso-900 bg-ivory-50 ring-1 ring-espresso-900'
                          : isDone
                          ? 'border-emerald-300 bg-emerald-50/40 text-emerald-900'
                          : 'border-stone/40 bg-white text-stone-muted'
                      }`}
                    >
                      <span className="text-[9px] font-mono block mb-1">Step 0{idx + 1}</span>
                      <span className="text-[11px] font-medium leading-tight">{step.label}</span>
                      <div className="mt-2 flex justify-center">
                        {isDone ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-stone-muted" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Rejection Alert & Re-upload Trigger */}
            {orderData.order.paymentStatus === 'rejected' && (
              <div className="p-4 bg-red-50 border border-red-200 text-xs text-red-900 space-y-2">
                <div className="flex items-center space-x-2 font-semibold">
                  <AlertTriangle className="w-4 h-4 text-red-700" />
                  <span>Payment Receipt Rejected by Concierge Desk</span>
                </div>
                {orderData.paymentSubmissions?.[0]?.rejectionReason && (
                  <p className="font-light">
                    Reason: <em>"{orderData.paymentSubmissions[0].rejectionReason}"</em>
                  </p>
                )}
                <Link
                  to={`/payment-instructions/${orderData.order.orderNumber}?token=${orderData.order.guestAccessToken}`}
                  className="inline-block mt-2 px-4 py-2 bg-red-700 text-white text-xs uppercase tracking-editorial font-medium hover:bg-red-800"
                >
                  Re-upload Valid Bank Receipt
                </Link>
              </div>
            )}

            {/* Unpaid Action */}
            {orderData.order.paymentStatus === 'unpaid' && (
              <div className="p-4 bg-amber-50 border border-amber-200 text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">Awaiting Bank Transfer</p>
                  <p className="font-light text-[11px]">
                    Please complete your transfer to secure inventory.
                  </p>
                </div>
                <Link
                  to={`/payment-instructions/${orderData.order.orderNumber}?token=${orderData.order.guestAccessToken}`}
                  className="px-4 py-2 bg-espresso-900 text-ivory-100 text-xs uppercase tracking-editorial font-medium hover:bg-champagne-dark shrink-0 text-center"
                >
                  View Wire Details & Upload Receipt
                </Link>
              </div>
            )}
          </div>

          {/* Items Summary & Delivery Info */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Items (7 cols) */}
            <div className="lg:col-span-7 bg-white border border-stone p-6 space-y-4">
              <h3 className="font-serif text-lg text-espresso-900 font-medium border-b border-stone/50 pb-2">
                Ordered Creations
              </h3>
              <div className="divide-y divide-stone/40">
                {orderData.items.map((item: any) => (
                  <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-14 bg-stone-light shrink-0 overflow-hidden border border-stone/50 relative">
                        {item.productImageSnapshot ? (
                          isVideoMedia(item.productImageSnapshot) ? (
                            <div className="relative w-full h-full bg-espresso-950 flex items-center justify-center">
                              <video
                                src={getMediaUrl(item.productImageSnapshot)}
                                className="w-full h-full object-cover opacity-80"
                                muted
                                preload="metadata"
                              />
                              <Play className="w-3.5 h-3.5 text-ivory-100 absolute fill-ivory-100/50" />
                            </div>
                          ) : (
                            <img
                              src={getMediaUrl(item.productImageSnapshot)}
                              alt={item.productNameSnapshot}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="%23999" stroke-width="1.5"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';
                              }}
                            />
                          )
                        ) : (
                          <Package className="w-6 h-6 text-stone-muted m-auto" />
                        )}
                      </div>
                      <div>
                        <p className="font-serif font-medium text-espresso-900">{item.productNameSnapshot}</p>
                        <p className="text-[10px] text-charcoal/70 font-mono">
                          {item.skuSnapshot} • Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono font-medium text-espresso-900">
                      {formatPrice(item.lineTotal)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-stone space-y-1.5 text-xs">
                <div className="flex justify-between text-charcoal">
                  <span>Subtotal</span>
                  <span className="font-mono">{formatPrice(orderData.order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-charcoal">
                  <span>Delivery Transport</span>
                  <span className="font-mono">{formatPrice(orderData.order.shippingAmount)}</span>
                </div>
                <div className="flex justify-between text-base font-serif font-bold text-espresso-900 pt-2 border-t border-stone">
                  <span>Total Amount</span>
                  <span className="font-sans">{formatPrice(orderData.order.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Delivery Destination & Status History (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Destination */}
              <div className="bg-white border border-stone p-6 space-y-3 text-xs">
                <h3 className="font-serif text-lg text-espresso-900 font-medium border-b border-stone/50 pb-2">
                  Delivery Destination
                </h3>
                <p className="font-medium text-espresso-900">{orderData.order.customerName}</p>
                <p className="text-charcoal leading-relaxed">{orderData.order.deliveryAddress}</p>
                <p className="text-charcoal">{orderData.order.deliveryCity}, {orderData.order.deliveryState}</p>
                <p className="text-charcoal/80 font-mono">Phone: {orderData.order.customerPhone}</p>
                {orderData.order.deliveryInstructions && (
                  <p className="text-[11px] text-stone-muted bg-ivory-50 p-2 border border-stone/60">
                    Note: {orderData.order.deliveryInstructions}
                  </p>
                )}
              </div>

              {/* Status History Log */}
              {orderData.statusHistory && orderData.statusHistory.length > 0 && (
                <div className="bg-white border border-stone p-6 space-y-3 text-xs">
                  <h3 className="font-serif text-lg text-espresso-900 font-medium border-b border-stone/50 pb-2">
                    Audit Log
                  </h3>
                  <div className="space-y-3">
                    {orderData.statusHistory.map((h: any) => (
                      <div key={h.id} className="border-l-2 border-champagne pl-3 space-y-0.5">
                        <p className="font-medium text-espresso-900 capitalize">
                          {h.newStatus.replace('_', ' ')}
                        </p>
                        {h.note && <p className="text-charcoal text-[11px] font-light">{h.note}</p>}
                        <p className="text-[10px] text-charcoal/60 font-mono">
                          {formatDateTime(h.createdAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
