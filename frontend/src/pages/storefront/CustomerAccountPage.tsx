import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  LogOut,
  ExternalLink,
  ShieldCheck,
  CreditCard,
  MessageCircle,
  ChevronRight,
  User,
  ShoppingBag,
  Play,
} from 'lucide-react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { formatPrice, formatDateTime, getMediaUrl, isVideoMedia } from '../../utils/formatters.js';

export const CustomerAccountPage: React.FC = () => {
  const { user, logout, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }

    if (user) {
      async function loadOrders() {
        try {
          const res = await api.getMyOrders();
          if (res.success && Array.isArray(res.data)) {
            setOrders(res.data);
          }
        } catch (err) {
          console.error('Error loading client orders:', err);
        } finally {
          setIsLoading(false);
        }
      }

      loadOrders();
    }
  }, [user, authLoading, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <span className="px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">Confirmed</span>;
      case 'payment_review':
        return <span className="px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider bg-amber-100 text-amber-900 border border-amber-200">Payment Under Review</span>;
      case 'processing':
        return <span className="px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider bg-blue-100 text-blue-900 border border-blue-200">In Atelier Preparation</span>;
      case 'ready_for_dispatch':
      case 'shipped':
        return <span className="px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider bg-indigo-100 text-indigo-900 border border-indigo-200">In White-Glove Transit</span>;
      case 'delivered':
        return <span className="px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider bg-emerald-800 text-ivory-100 border border-emerald-900">Delivered to Residence</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider bg-red-100 text-red-800 border border-red-200">Cancelled</span>;
      case 'pending_payment':
      default:
        return <span className="px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider bg-stone text-espresso-900 border border-stone-muted">Awaiting Payment</span>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <span className="text-[11px] font-semibold text-emerald-700 flex items-center space-x-1"><CheckCircle2 className="w-3.5 h-3.5" /><span>Verified & Paid</span></span>;
      case 'pending_verification':
        return <span className="text-[11px] font-semibold text-amber-800 flex items-center space-x-1"><Clock className="w-3.5 h-3.5" /><span>Receipt Uploaded</span></span>;
      case 'rejected':
        return <span className="text-[11px] font-semibold text-red-700 flex items-center space-x-1"><AlertCircle className="w-3.5 h-3.5" /><span>Receipt Rejected</span></span>;
      case 'unpaid':
      default:
        return <span className="text-[11px] font-semibold text-charcoal flex items-center space-x-1"><CreditCard className="w-3.5 h-3.5" /><span>Transfer Pending</span></span>;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8">
        <div className="w-8 h-8 border-2 border-espresso-900 border-t-champagne rounded-full animate-spin mb-3" />
        <p className="text-xs uppercase tracking-editorial text-charcoal">Loading Client Sanctuary...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Client Profile Banner */}
      <div className="bg-white border border-stone p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-ivory-100 border border-champagne/60 flex items-center justify-center text-espresso-900 font-serif text-2xl font-semibold shadow-sm shrink-0">
            {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'C'}
          </div>
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-widest text-champagne-dark font-mono block">
              Private Client Registry
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl text-espresso-900 font-medium leading-none">
              {user.fullName}
            </h1>
            <p className="text-xs text-charcoal flex flex-wrap items-center gap-x-3 pt-0.5">
              <span>{user.email}</span>
              {user.phone && <span className="text-stone-muted">&bull; {user.phone}</span>}
            </p>
          </div>
        </div>

        {/* Quick Stats & Sign Out */}
        <div className="flex items-center space-x-6 border-t md:border-t-0 md:border-l border-stone/60 pt-4 md:pt-0 md:pl-8">
          <div className="text-center">
            <span className="font-serif text-2xl text-espresso-900 font-medium block">
              {orders.length}
            </span>
            <span className="text-[9px] uppercase tracking-widest text-charcoal font-sans">
              Commissions
            </span>
          </div>
          <div className="text-center">
            <span className="font-serif text-2xl text-emerald-800 font-medium block">
              {orders.filter((o) => o.paymentStatus === 'paid').length}
            </span>
            <span className="text-[9px] uppercase tracking-widest text-charcoal font-sans">
              Completed
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center space-x-1.5 px-3 py-2 border border-stone text-xs text-charcoal hover:text-red-700 hover:border-red-300 transition-colors uppercase tracking-wider"
            title="Sign out of client session"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Orders Register */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-stone pb-3">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl text-espresso-900 font-medium">
              Orders & Bespoke Commissions
            </h2>
            <p className="text-xs text-charcoal tracking-editorial uppercase mt-0.5">
              Review lifecycle progress, payment status, and dispatch tracking
            </p>
          </div>
          <Link
            to="/shop"
            className="hidden sm:inline-flex items-center space-x-1 text-xs uppercase tracking-editorial text-champagne-dark hover:underline font-semibold"
          >
            <span>Explore Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="p-16 text-center text-xs text-charcoal uppercase tracking-editorial">
            Accessing private ledger...
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white border border-stone p-12 text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-ivory-50 border border-stone mx-auto flex items-center justify-center text-stone-muted">
              <ShoppingBag className="w-6 h-6 stroke-[1.5]" />
            </div>
            <div>
              <h3 className="font-serif text-lg text-espresso-900 font-medium">No Commissions Recorded</h3>
              <p className="text-xs text-charcoal max-w-sm mx-auto mt-1">
                Your private register has no active orders. Browse our curated pieces of horology, fine jewellery, and extraits.
              </p>
            </div>
            <Link
              to="/shop"
              className="inline-flex items-center space-x-2 px-6 py-2.5 bg-espresso-900 text-ivory-100 text-xs uppercase tracking-editorial font-semibold hover:bg-espresso-800 transition-colors"
            >
              <span>Explore The Collection</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const needsPayment = order.paymentStatus === 'unpaid' || order.paymentStatus === 'rejected';

              return (
                <div
                  key={order.id}
                  className="bg-white border border-stone shadow-sm overflow-hidden transition-all hover:border-espresso-900/50"
                >
                  {/* Order Top Bar */}
                  <div className="bg-ivory-50/70 border-b border-stone/60 p-4 sm:px-6 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span className="font-mono text-xs font-bold text-espresso-900">
                        {order.orderNumber}
                      </span>
                      <span className="text-[11px] text-stone-muted">
                        Placed {formatDateTime(order.createdAt)}
                      </span>
                      <div className="flex items-center space-x-2">
                        {getOrderStatusBadge(order.orderStatus)}
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      {getPaymentStatusBadge(order.paymentStatus)}
                      <span className="font-serif text-base text-espresso-900 font-medium">
                        {formatPrice(order.totalAmount, order.currency)}
                      </span>
                    </div>
                  </div>

                  {/* Rejection Alert if applicable */}
                  {order.paymentStatus === 'rejected' && order.latestPaymentSubmission?.rejectionReason && (
                    <div className="bg-red-50 border-b border-red-200 p-4 sm:px-6 flex items-start space-x-3 text-xs text-red-800">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold uppercase tracking-wider block">Receipt Attention Required:</span>
                        <p className="mt-0.5">{order.latestPaymentSubmission.rejectionReason}</p>
                        <p className="mt-1 text-[11px] text-red-600">Please re-upload a clear proof of payment transfer below.</p>
                      </div>
                    </div>
                  )}

                  {/* Order Items Preview */}
                  <div className="p-4 sm:p-6 divide-y divide-stone/40">
                    <div className="space-y-3 pb-4">
                      {order.items &&
                        order.items.map((item: any, i: number) => (
                          <div key={i} className="flex items-center space-x-4">
                            <div className="w-14 h-14 bg-ivory-50 border border-stone/60 overflow-hidden shrink-0 flex items-center justify-center relative">
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
                                <Package className="w-5 h-5 text-stone-muted" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-serif font-medium text-espresso-900 truncate">
                                {item.productNameSnapshot}
                              </h4>
                              <p className="text-[11px] text-charcoal">
                                Qty: {item.quantity} &bull; {formatPrice(item.unitPrice, order.currency)}
                              </p>
                              {item.skuSnapshot && (
                                <span className="text-[9px] font-mono text-stone-muted block uppercase">
                                  SKU: {item.skuSnapshot}
                                </span>
                              )}
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-mono font-medium text-espresso-900">
                                {formatPrice(item.lineTotal, order.currency)}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>

                    {/* Order Details & Actions */}
                    <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="text-xs text-charcoal space-y-0.5">
                        <p className="font-medium text-espresso-900">
                          Destination: {order.deliveryCity}, {order.deliveryState}
                        </p>
                        <p className="text-[11px] text-stone-muted">
                          {order.deliveryAddress}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {needsPayment ? (
                          <Link
                            to={`/payment-instructions/${order.orderNumber}`}
                            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-espresso-900 text-ivory-100 text-xs uppercase tracking-wider font-semibold hover:bg-espresso-800 transition-colors shadow-sm"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Complete Wire / Upload Receipt</span>
                          </Link>
                        ) : (
                          <Link
                            to={`/order-confirmation/${order.orderNumber}?token=${order.guestAccessToken || ''}`}
                            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-ivory-50 border border-stone text-espresso-900 text-xs uppercase tracking-wider font-semibold hover:border-espresso-900 transition-colors"
                          >
                            <span>Track Commission Live</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        )}
                        <a
                          href={`https://wa.me/2348000000000?text=${encodeURIComponent(`Hello Magnificent Concierge, I am inquiring regarding my commission ${order.orderNumber}.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 px-3 py-2 border border-stone text-xs text-charcoal hover:text-espresso-900 hover:border-espresso-900 transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp Concierge</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
