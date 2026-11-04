import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../../services/api.js';
import { formatPrice, formatDateTime } from '../../utils/formatters.js';
import { Search, Eye, Filter, RotateCcw } from 'lucide-react';

export const OrderListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>({ total: 0, page: 1, limit: 15, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);

  const orderStatus = searchParams.get('orderStatus') || 'all';
  const paymentStatus = searchParams.get('paymentStatus') || 'all';
  const paymentMethod = searchParams.get('paymentMethod') || 'all';
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const res = await api.getOrders({
        orderStatus,
        paymentStatus,
        paymentMethod,
        search,
        page,
        limit: 15,
      });
      if (res.success) {
        setOrders(res.data);
        setMeta(res.meta);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [orderStatus, paymentStatus, paymentMethod, search, page]);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === 'all') {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    if (key !== 'page') next.delete('page');
    setSearchParams(next);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-espresso-900 font-medium">
            Order Register
          </h1>
          <p className="text-xs text-charcoal tracking-editorial uppercase mt-0.5">
            Audit customer acquisitions, payments, and dispatch tracking
          </p>
        </div>

        <span className="text-xs text-charcoal font-medium">
          Total: {meta.total} {meta.total === 1 ? 'order' : 'orders'}
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-stone p-4 space-y-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-muted absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search reference, customer, email..."
              value={search}
              onChange={(e) => updateParam('search', e.target.value)}
              className="w-full bg-ivory-50 border border-stone pl-9 pr-3 py-2 text-espresso-900 focus:outline-none focus:border-espresso-900"
            />
          </div>

          {/* Payment Status Filter */}
          <div>
            <select
              value={paymentStatus}
              onChange={(e) => updateParam('paymentStatus', e.target.value)}
              className="w-full bg-ivory-50 border border-stone px-3 py-2 text-espresso-900 focus:outline-none focus:border-espresso-900"
            >
              <option value="all">All Payment Statuses</option>
              <option value="unpaid">Unpaid</option>
              <option value="pending_verification">Pending Verification</option>
              <option value="paid">Paid</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Order Status Filter */}
          <div>
            <select
              value={orderStatus}
              onChange={(e) => updateParam('orderStatus', e.target.value)}
              className="w-full bg-ivory-50 border border-stone px-3 py-2 text-espresso-900 focus:outline-none focus:border-espresso-900"
            >
              <option value="all">All Fulfillment Statuses</option>
              <option value="pending_payment">Pending Payment</option>
              <option value="payment_review">Payment Review</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="ready_for_dispatch">Ready for Dispatch</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Payment Method */}
          <div>
            <select
              value={paymentMethod}
              onChange={(e) => updateParam('paymentMethod', e.target.value)}
              className="w-full bg-ivory-50 border border-stone px-3 py-2 text-espresso-900 focus:outline-none focus:border-espresso-900"
            >
              <option value="all">All Methods</option>
              <option value="bank_transfer">Manual Bank Transfer</option>
              <option value="whatsapp">WhatsApp Order</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-stone overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-charcoal tracking-editorial uppercase">
            Loading order records...
          </div>
        ) : orders.length === 0 ? (
          <div className="p-16 text-center space-y-2">
            <p className="font-serif text-xl text-espresso-900">No orders match filter</p>
            <p className="text-xs text-charcoal">Try clearing the search or status filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-ivory-50 text-charcoal uppercase tracking-editorial text-[10px] font-semibold border-b border-stone/50">
                <tr>
                  <th className="py-3 px-4">Order Ref</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Destination</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Fulfillment</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone/40">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-ivory-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-espresso-900">
                      {o.orderNumber}
                    </td>
                    <td className="py-3 px-4 font-mono text-[10px] text-stone-muted">
                      {formatDateTime(o.createdAt)}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-espresso-900">{o.customerName}</p>
                      <p className="text-[10px] text-charcoal/70">{o.customerEmail}</p>
                    </td>
                    <td className="py-3 px-4">
                      {o.deliveryCity}, {o.deliveryState}
                    </td>
                    <td className="py-3 px-4 font-sans font-semibold text-espresso-900">
                      {formatPrice(o.totalAmount)}
                    </td>
                    <td className="py-3 px-4 capitalize font-mono text-[10px]">
                      {o.paymentMethod.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[9px] uppercase tracking-wider px-2 py-0.5 font-semibold ${
                          o.paymentStatus === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : o.paymentStatus === 'pending_verification'
                            ? 'bg-amber-100 text-amber-900'
                            : o.paymentStatus === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-stone text-charcoal'
                        }`}
                      >
                        {o.paymentStatus.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 bg-espresso-900 text-ivory-100 font-semibold">
                        {o.orderStatus.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/admin/orders/${o.id}`}
                        className="px-2.5 py-1.5 bg-ivory-50 hover:bg-espresso-900 hover:text-ivory-100 border border-stone text-espresso-900 text-[11px] font-medium transition-colors inline-flex items-center space-x-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Manage</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex justify-center space-x-2 pt-4">
          <button
            onClick={() => updateParam('page', String(page - 1))}
            disabled={page <= 1}
            className="px-3 py-1.5 border border-stone bg-white text-xs disabled:opacity-40"
          >
            Prev
          </button>
          <span className="px-3 py-1.5 text-xs text-charcoal font-mono">
            Page {page} of {meta.totalPages}
          </span>
          <button
            onClick={() => updateParam('page', String(page + 1))}
            disabled={page >= meta.totalPages}
            className="px-3 py-1.5 border border-stone bg-white text-xs disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
