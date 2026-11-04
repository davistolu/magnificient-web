import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { formatPrice, formatDateTime, getMediaUrl, isVideoMedia } from '../../utils/formatters.js';
import { useToast } from '../../context/ToastContext.js';
import {
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Truck,
  Building2,
  User,
  ShieldCheck,
  Package,
  ExternalLink,
  AlertTriangle,
  Play,
} from 'lucide-react';

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const { success, error } = useToast();

  const loadOrder = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const res = await api.getOrderDetails(id);
      if (res.success) {
        setData(res.data);
        setNewStatus(res.data.order.orderStatus);
      }
    } catch (err: any) {
      error('Error', err.message || 'Could not load order record.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [id]);

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newStatus) return;

    setIsUpdating(true);
    try {
      const res = await api.updateOrderStatus(id, {
        status: newStatus,
        note: statusNote || undefined,
      });
      if (res.success) {
        success('Status Updated', `Order transitioned to ${newStatus}.`);
        setStatusNote('');
        loadOrder();
      }
    } catch (err: any) {
      error('Update Failed', err.message || 'Invalid state transition.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-xs uppercase tracking-editorial text-charcoal">
        Loading order details...
      </div>
    );
  }

  if (!data?.order) {
    return (
      <div className="p-12 text-center space-y-3">
        <p className="font-serif text-xl text-espresso-900">Order record not found.</p>
        <Link to="/admin/orders" className="text-xs uppercase tracking-editorial text-champagne-dark">
          Return to Order Register
        </Link>
      </div>
    );
  }

  const { order, items, statusHistory, paymentSubmissions } = data;

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Back button & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone gap-4">
        <div>
          <Link
            to="/admin/orders"
            className="inline-flex items-center space-x-1 text-xs uppercase tracking-editorial text-charcoal hover:text-espresso-900 mb-2"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Back to Orders</span>
          </Link>
          <div className="flex items-center space-x-3">
            <h1 className="font-serif text-2xl sm:text-3xl text-espresso-900 font-medium">
              Order {order.orderNumber}
            </h1>
            <span
              className={`text-[10px] uppercase tracking-wider px-2.5 py-1 font-semibold ${
                order.paymentStatus === 'paid'
                  ? 'bg-emerald-100 text-emerald-800'
                  : order.paymentStatus === 'pending_verification'
                  ? 'bg-amber-100 text-amber-900'
                  : 'bg-stone text-charcoal'
              }`}
            >
              {order.paymentStatus.replace('_', ' ')}
            </span>
          </div>
          <p className="text-xs text-charcoal mt-0.5">
            Placed on {formatDateTime(order.createdAt)} via {order.paymentMethod.replace('_', ' ')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Items & Delivery Details (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Ordered Line Items */}
          <div className="bg-white border border-stone p-6 space-y-4">
            <h2 className="font-serif text-lg text-espresso-900 font-medium border-b border-stone/50 pb-2">
              Ordered Items Snapshot
            </h2>
            <div className="divide-y divide-stone/40 text-xs">
              {items.map((i: any) => (
                <div key={i.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-14 bg-stone-light shrink-0 overflow-hidden border border-stone/50 relative">
                      {i.productImageSnapshot ? (
                        isVideoMedia(i.productImageSnapshot) ? (
                          <div className="relative w-full h-full bg-espresso-950 flex items-center justify-center">
                            <video
                              src={getMediaUrl(i.productImageSnapshot)}
                              className="w-full h-full object-cover opacity-80"
                              muted
                              preload="metadata"
                            />
                            <Play className="w-3.5 h-3.5 text-ivory-100 absolute fill-ivory-100/50" />
                          </div>
                        ) : (
                          <img
                            src={getMediaUrl(i.productImageSnapshot)}
                            alt={i.productNameSnapshot}
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
                      <p className="font-serif font-medium text-espresso-900">{i.productNameSnapshot}</p>
                      <p className="text-[10px] text-charcoal/70 font-mono">
                        {i.skuSnapshot} • Qty: {i.quantity} @ {formatPrice(i.unitPrice)}
                      </p>
                    </div>
                  </div>
                  <span className="font-mono font-medium text-espresso-900">
                    {formatPrice(i.lineTotal)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-stone space-y-1.5 text-xs">
              <div className="flex justify-between text-charcoal">
                <span>Subtotal</span>
                <span className="font-mono">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-charcoal">
                <span>Delivery Transport</span>
                <span className="font-mono">{formatPrice(order.shippingAmount)}</span>
              </div>
              {Number(order.discountAmount) > 0 && (
                <div className="flex justify-between text-emerald-800">
                  <span>Promotional Discount</span>
                  <span className="font-mono">-{formatPrice(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-serif font-bold text-espresso-900 pt-2 border-t border-stone">
                <span>Total Amount</span>
                <span className="font-sans">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Delivery & Customer Info */}
          <div className="bg-white border border-stone p-6 space-y-4 text-xs">
            <h2 className="font-serif text-lg text-espresso-900 font-medium border-b border-stone/50 pb-2">
              Customer & Delivery Destination
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-charcoal/70 block mb-0.5">
                  Recipient Name
                </span>
                <span className="font-medium text-espresso-900">{order.customerName}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-widest text-charcoal/70 block mb-0.5">
                  Telephone Contact
                </span>
                <span className="font-mono text-espresso-900">{order.customerPhone}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-[10px] uppercase tracking-widest text-charcoal/70 block mb-0.5">
                  Delivery Address
                </span>
                <span className="text-charcoal leading-relaxed">{order.deliveryAddress}</span>
                <p className="text-charcoal mt-0.5">
                  {order.deliveryCity}, {order.deliveryState}
                </p>
              </div>
              {order.deliveryInstructions && (
                <div className="sm:col-span-2 bg-ivory-50 p-2.5 border border-stone/50">
                  <span className="text-[10px] uppercase tracking-widest text-charcoal/70 block mb-0.5">
                    Delivery Instructions
                  </span>
                  <p className="text-charcoal">{order.deliveryInstructions}</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Receipts History */}
          <div className="bg-white border border-stone p-6 space-y-4 text-xs">
            <h2 className="font-serif text-lg text-espresso-900 font-medium border-b border-stone/50 pb-2">
              Payment Submissions ({paymentSubmissions.length})
            </h2>
            {paymentSubmissions.length === 0 ? (
              <p className="text-charcoal font-light">No payment receipt submitted yet.</p>
            ) : (
              <div className="space-y-3">
                {paymentSubmissions.map((sub: any) => (
                  <div key={sub.id} className="p-3 bg-ivory-50 border border-stone/50 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-mono font-medium text-espresso-900">{sub.originalFilename}</span>
                      <span
                        className={`text-[9px] uppercase tracking-wider px-2 py-0.5 font-semibold ${
                          sub.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : sub.status === 'pending'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {sub.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-charcoal text-[11px]">
                      <span>Amount: {formatPrice(sub.submittedAmount || order.totalAmount)}</span>
                      <span>{formatDateTime(sub.createdAt)}</span>
                    </div>
                    {sub.rejectionReason && (
                      <p className="text-red-700 font-light text-[11px] pt-1 border-t border-stone/30">
                        Rejection reason: {sub.rejectionReason}
                      </p>
                    )}
                    {sub.previewUrl && (
                      <a
                        href={sub.previewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 text-champagne-dark font-medium underline text-[11px] pt-1"
                      >
                        <span>View Secure Receipt</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Status Transition & Timeline (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Status Transition Control Card */}
          <div className="bg-white border border-stone p-6 space-y-4">
            <h2 className="font-serif text-lg text-espresso-900 font-medium border-b border-stone/50 pb-2">
              Update Order Status
            </h2>

            <form onSubmit={handleStatusUpdate} className="space-y-4 text-xs">
              <div>
                <label className="text-[11px] uppercase tracking-editorial text-espresso-900 font-semibold block mb-1">
                  Transition Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-ivory-50 border border-stone px-3 py-2 text-espresso-900 font-medium focus:outline-none focus:border-espresso-900"
                >
                  <option value="pending_payment">Pending Payment</option>
                  <option value="payment_review">Payment Review</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="ready_for_dispatch">Ready for Dispatch</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled (Restocks items)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-editorial text-espresso-900 font-semibold block mb-1">
                  Internal / Customer Timeline Note
                </label>
                <textarea
                  rows={2}
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="e.g. Courier tracking code dispatched via DHL: #992144"
                  className="w-full bg-ivory-50 border border-stone px-3 py-2 text-espresso-900 focus:outline-none focus:border-espresso-900"
                />
              </div>

              <button
                type="submit"
                disabled={isUpdating || newStatus === order.orderStatus}
                className="w-full py-3 bg-espresso-900 hover:bg-espresso-800 disabled:opacity-50 text-ivory-100 text-xs uppercase tracking-editorial font-semibold transition-colors"
              >
                {isUpdating ? 'Updating Status...' : 'Apply Status Transition'}
              </button>
            </form>
          </div>

          {/* Audit History Timeline */}
          <div className="bg-white border border-stone p-6 space-y-4 text-xs">
            <h2 className="font-serif text-lg text-espresso-900 font-medium border-b border-stone/50 pb-2">
              Status History Trail
            </h2>
            <div className="space-y-3">
              {statusHistory.map((h: any) => (
                <div key={h.id} className="border-l-2 border-champagne pl-3 space-y-0.5">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-espresso-900 capitalize">
                      {h.newStatus.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-stone-muted font-mono">
                      {formatDateTime(h.createdAt)}
                    </span>
                  </div>
                  {h.note && <p className="text-charcoal text-[11px] font-light leading-relaxed">{h.note}</p>}
                  <p className="text-[10px] text-charcoal/70">By: {h.changedBy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
