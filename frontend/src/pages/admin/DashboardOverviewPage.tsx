import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { formatPrice, formatDateTime } from '../../utils/formatters.js';
import {
  TrendingUp,
  FileCheck2,
  Package,
  AlertTriangle,
  ArrowRight,
  Eye,
  CheckCircle2,
  Clock,
} from 'lucide-react';

export const DashboardOverviewPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const res = await api.getDashboardMetrics();
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadMetrics();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-stone/40" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-white border border-stone" />
          ))}
        </div>
      </div>
    );
  }

  const metrics = data?.metrics || {
    totalOrders: 0,
    pendingVerificationOrders: 0,
    paidOrdersCount: 0,
    awaitingFulfillment: 0,
    deliveredOrders: 0,
    totalConfirmedSales: 0,
    lowStockCount: 0,
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-espresso-900 font-medium">
            Operational Overview
          </h1>
          <p className="text-xs text-charcoal tracking-editorial uppercase mt-0.5">
            Store performance & fulfillment metrics
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/admin/payments"
            className="px-4 py-2 bg-espresso-900 text-ivory-100 text-xs uppercase tracking-editorial font-medium hover:bg-espresso-800 transition-colors inline-flex items-center space-x-1.5"
          >
            <FileCheck2 className="w-3.5 h-3.5 text-champagne" />
            <span>Verify Receipts</span>
            {metrics.pendingVerificationOrders > 0 && (
              <span className="ml-1 bg-champagne text-espresso-900 text-[10px] font-bold px-1.5 py-0.2 rounded-full font-mono">
                {metrics.pendingVerificationOrders}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Confirmed Sales */}
        <div className="bg-white border border-stone p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-charcoal/70 font-semibold">
              Confirmed Sales (Paid)
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="font-serif text-2xl font-bold text-espresso-900 font-sans tracking-tight">
            {formatPrice(metrics.totalConfirmedSales)}
          </div>
          <p className="text-[11px] text-charcoal/80">
            From {metrics.paidOrdersCount} verified transactions
          </p>
        </div>

        {/* Pending Payment Review */}
        <div className="bg-white border border-stone p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-charcoal/70 font-semibold">
              Pending Bank Receipts
            </span>
            <Clock className="w-4 h-4 text-amber-700" />
          </div>
          <div className="font-serif text-2xl font-bold text-espresso-900 font-sans tracking-tight">
            {metrics.pendingVerificationOrders}
          </div>
          <Link
            to="/admin/payments"
            className="text-[11px] text-champagne-dark hover:underline inline-flex items-center space-x-1 font-medium"
          >
            <span>Review payment queue</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Awaiting Fulfillment */}
        <div className="bg-white border border-stone p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-charcoal/70 font-semibold">
              Awaiting Fulfillment
            </span>
            <Package className="w-4 h-4 text-espresso-800" />
          </div>
          <div className="font-serif text-2xl font-bold text-espresso-900 font-sans tracking-tight">
            {metrics.awaitingFulfillment}
          </div>
          <p className="text-[11px] text-charcoal/80">Confirmed orders ready for packing</p>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white border border-stone p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-charcoal/70 font-semibold">
              Low Stock Warnings
            </span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <div className="font-serif text-2xl font-bold text-espresso-900 font-sans tracking-tight">
            {metrics.lowStockCount}
          </div>
          <Link
            to="/admin/inventory"
            className="text-[11px] text-red-700 hover:underline inline-flex items-center space-x-1 font-medium"
          >
            <span>View inventory alert list</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Recent Orders & Recent Receipts Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Recent Orders Table (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-stone p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-stone/50 pb-3">
            <h2 className="font-serif text-lg text-espresso-900 font-medium">Recent Orders</h2>
            <Link
              to="/admin/orders"
              className="text-xs uppercase tracking-editorial text-charcoal hover:text-espresso-900"
            >
              View All Orders
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-ivory-50 text-charcoal uppercase tracking-editorial text-[10px] font-semibold border-b border-stone/40">
                <tr>
                  <th className="py-2.5 px-3">Order Ref</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Total Amount</th>
                  <th className="py-2.5 px-3">Payment</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone/40">
                {data?.recentOrders?.map((order: any) => (
                  <tr key={order.id} className="hover:bg-ivory-50/50 transition-colors">
                    <td className="py-3 px-3 font-mono font-medium text-espresso-900">
                      {order.orderNumber}
                    </td>
                    <td className="py-3 px-3">{order.customerName}</td>
                    <td className="py-3 px-3 font-sans font-medium text-espresso-900">
                      {formatPrice(order.totalAmount)}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[9px] uppercase tracking-wider px-2 py-0.5 font-semibold ${
                          order.paymentStatus === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.paymentStatus === 'pending_verification'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-stone text-charcoal'
                        }`}
                      >
                        {order.paymentStatus.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 bg-espresso-900 text-ivory-100 font-semibold">
                        {order.orderStatus.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        to={`/admin/orders/${order.id}`}
                        className="p-1 text-stone-muted hover:text-espresso-900 inline-block"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Submissions Queue (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-stone p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-stone/50 pb-3">
            <h2 className="font-serif text-lg text-espresso-900 font-medium">Receipt Submissions</h2>
            <Link
              to="/admin/payments"
              className="text-xs uppercase tracking-editorial text-champagne-dark hover:underline font-medium"
            >
              Queue ({metrics.pendingVerificationOrders})
            </Link>
          </div>

          <div className="space-y-3">
            {data?.recentSubmissions?.length === 0 ? (
              <p className="text-xs text-charcoal py-4 text-center">No receipts awaiting review.</p>
            ) : (
              data?.recentSubmissions?.map((s: any) => (
                <div key={s.id} className="p-3 bg-ivory-50 border border-stone/50 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-semibold text-espresso-900">{s.orderNumber}</span>
                    <span
                      className={`text-[9px] uppercase tracking-wider px-2 py-0.5 font-semibold ${
                        s.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : s.status === 'pending'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {s.status}
                    </span>
                  </div>
                  <p className="text-charcoal">{s.customerName}</p>
                  <div className="flex justify-between items-center pt-1 border-t border-stone/40 text-[11px]">
                    <span className="font-sans font-medium text-espresso-900">
                      {formatPrice(s.submittedAmount)}
                    </span>
                    <span className="text-[10px] text-stone-muted font-mono">
                      {formatDateTime(s.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
