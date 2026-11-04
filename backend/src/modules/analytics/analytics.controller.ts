import { Request, Response } from 'express';
import { store } from '../../database/index.js';

export async function getDashboardMetrics(req: Request, res: Response) {
  const totalOrders = store.orders.length;
  const pendingVerificationOrders = store.orders.filter(
    (o) => o.paymentStatus === 'pending_verification'
  ).length;

  const paidOrders = store.orders.filter((o) => o.paymentStatus === 'paid');
  const awaitingFulfillment = store.orders.filter(
    (o) => ['confirmed', 'processing', 'ready_for_dispatch'].includes(o.orderStatus)
  ).length;

  const deliveredOrders = store.orders.filter((o) => o.orderStatus === 'delivered').length;
  const cancelledOrders = store.orders.filter((o) => o.orderStatus === 'cancelled').length;

  // Confirmed Sales: Only sum orders with paymentStatus === 'paid'
  const totalConfirmedSales = paidOrders.reduce((acc, o) => acc + Number(o.totalAmount), 0);

  // Low stock products count
  const lowStockCount = store.products.filter(
    (p) => p.stockQuantity <= p.lowStockThreshold
  ).length;

  // Recent 6 orders
  const recentOrders = [...store.orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6)
    .map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.customerName,
      totalAmount: o.totalAmount,
      currency: o.currency,
      paymentStatus: o.paymentStatus,
      orderStatus: o.orderStatus,
      paymentMethod: o.paymentMethod,
      createdAt: o.createdAt,
    }));

  // Recent payment submissions
  const recentSubmissions = [...store.paymentSubmissions]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map((s) => {
      const order = store.orders.find((o) => o.id === s.orderId);
      return {
        id: s.id,
        orderNumber: order?.orderNumber || s.orderId,
        customerName: order?.customerName || 'Customer',
        submittedAmount: s.submittedAmount || order?.totalAmount,
        status: s.status,
        createdAt: s.createdAt,
      };
    });

  return res.json({
    success: true,
    data: {
      metrics: {
        totalOrders,
        pendingVerificationOrders,
        paidOrdersCount: paidOrders.length,
        awaitingFulfillment,
        deliveredOrders,
        cancelledOrders,
        totalConfirmedSales,
        lowStockCount,
      },
      recentOrders,
      recentSubmissions,
    },
  });
}
