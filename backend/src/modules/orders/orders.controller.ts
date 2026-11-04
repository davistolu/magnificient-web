import { Request, Response } from 'express';
import { orderStatusUpdateSchema } from '../../shared/index.js';
import { store } from '../../database/index.js';
import { AppError } from '../../middleware/errorHandler.js';
import jwt from 'jsonwebtoken';
import { config } from '../../config/index.js';

export async function trackOrder(req: Request, res: Response) {
  const { orderNumber, email, token } = req.query;

  if (!orderNumber) {
    throw new AppError('Order reference number is required to track an order', 400);
  }

  const order = store.orders.find(
    (o) => o.orderNumber.toUpperCase() === String(orderNumber).trim().toUpperCase()
  );

  if (!order) {
    throw new AppError('No order found matching the provided reference number.', 404);
  }

  // Security Check: Customer must provide either matching guestAccessToken OR matching email
  const tokenMatch = token && order.guestAccessToken === String(token);
  const emailMatch = email && order.customerEmail.toLowerCase() === String(email).trim().toLowerCase();
  const isAdmin = req.user && req.user.role === 'admin';

  if (!tokenMatch && !emailMatch && !isAdmin) {
    throw new AppError('Authentication failed: please provide the email address used during purchase.', 403);
  }

  const items = store.orderItems.filter((i) => i.orderId === order.id);
  const statusHistory = store.orderStatusHistory
    .filter((h) => h.orderId === order.id)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  const paymentSubmissions = store.paymentSubmissions
    .filter((s) => s.orderId === order.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((s) => ({
      id: s.id,
      originalFilename: s.originalFilename,
      status: s.status,
      rejectionReason: s.rejectionReason,
      createdAt: s.createdAt,
    }));

  const generalSettings = store.storeSettings.get('general');

  return res.json({
    success: true,
    data: {
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        deliveryAddress: order.deliveryAddress,
        deliveryCity: order.deliveryCity,
        deliveryState: order.deliveryState,
        deliveryInstructions: order.deliveryInstructions,
        subtotal: order.subtotal,
        discountAmount: order.discountAmount,
        shippingAmount: order.shippingAmount,
        totalAmount: order.totalAmount,
        currency: order.currency,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        guestAccessToken: order.guestAccessToken,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      },
      items,
      statusHistory,
      paymentSubmissions,
      bankDetails: generalSettings?.bankDetails || null,
    },
  });
}

export async function listOrders(req: Request, res: Response) {
  const {
    orderStatus,
    paymentStatus,
    paymentMethod,
    search,
    page = '1',
    limit = '15',
  } = req.query;

  let queryList = [...store.orders];

  if (orderStatus && orderStatus !== 'all') {
    queryList = queryList.filter((o) => o.orderStatus === orderStatus);
  }

  if (paymentStatus && paymentStatus !== 'all') {
    queryList = queryList.filter((o) => o.paymentStatus === paymentStatus);
  }

  if (paymentMethod && paymentMethod !== 'all') {
    queryList = queryList.filter((o) => o.paymentMethod === paymentMethod);
  }

  if (search && String(search).trim()) {
    const term = String(search).toLowerCase().trim();
    queryList = queryList.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(term) ||
        o.customerName.toLowerCase().includes(term) ||
        o.customerEmail.toLowerCase().includes(term) ||
        o.customerPhone.toLowerCase().includes(term)
    );
  }

  // Sort by newest first
  queryList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const total = queryList.length;
  const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
  const limitNum = Math.max(1, parseInt(String(limit), 10) || 15);
  const totalPages = Math.ceil(total / limitNum) || 1;
  const offset = (pageNum - 1) * limitNum;

  const paginated = queryList.slice(offset, offset + limitNum).map((order) => {
    const itemsCount = store.orderItems.filter((i) => i.orderId === order.id).length;
    const hasPendingReceipt = store.paymentSubmissions.some(
      (s) => s.orderId === order.id && s.status === 'pending'
    );
    return {
      ...order,
      itemsCount,
      hasPendingReceipt,
    };
  });

  return res.json({
    success: true,
    data: paginated,
    meta: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
    },
  });
}

export async function getOrderDetails(req: Request, res: Response) {
  const { id } = req.params;
  const order = store.orders.find((o) => o.id === id || o.orderNumber === id);

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  const items = store.orderItems.filter((i) => i.orderId === order.id);
  const statusHistory = store.orderStatusHistory
    .filter((h) => h.orderId === order.id)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const paymentSubmissions = store.paymentSubmissions
    .filter((s) => s.orderId === order.id)
    .map((s) => {
      const reviewToken = jwt.sign(
        { filename: s.receiptStorageKey, role: 'admin' },
        config.jwt.secret,
        { expiresIn: '2h' }
      );
      return {
        ...s,
        previewUrl: `/api/receipts/file/${reviewToken}`,
      };
    });

  return res.json({
    success: true,
    data: {
      order,
      items,
      statusHistory,
      paymentSubmissions,
    },
  });
}

export async function updateOrderStatus(req: Request, res: Response) {
  const { id } = req.params;
  const validated = orderStatusUpdateSchema.parse(req.body);

  const order = store.orders.find((o) => o.id === id || o.orderNumber === id);
  if (!order) {
    throw new AppError('Order not found', 404);
  }

  const previousStatus = order.orderStatus;
  const newStatus = validated.status;

  // Cannot mark as fulfilled/shipped/delivered if order is unpaid
  if (['processing', 'ready_for_dispatch', 'shipped', 'delivered'].includes(newStatus) && order.paymentStatus !== 'paid') {
    throw new AppError(
      `Cannot advance order to "${newStatus}" while payment status is "${order.paymentStatus}". Payment must be verified first.`,
      400
    );
  }

  // Handle cancellation restocking
  if (newStatus === 'cancelled' && previousStatus !== 'cancelled') {
    const items = store.orderItems.filter((i) => i.orderId === order.id);
    for (const item of items) {
      if (item.productId) {
        const product = store.products.find((p) => p.id === item.productId);
        if (product) {
          product.stockQuantity += item.quantity;
          store.inventoryMovements.push({
            id: `inv-${Date.now()}`,
            productId: product.id,
            productName: product.name,
            quantityChange: item.quantity,
            movementType: 'order_cancellation',
            reason: `Order cancelled: ${order.orderNumber}`,
            referenceId: order.orderNumber,
            createdBy: req.user?.fullName || 'Admin',
            createdAt: new Date(),
          });
        }
      }
    }
  }

  store.updateOrderStatus(order.id, newStatus);

  // Record history
  store.saveOrderStatusHistory({
    id: `osh-${Date.now()}`,
    orderId: order.id,
    previousStatus,
    newStatus,
    changedBy: req.user?.fullName || 'Administrator',
    note: validated.note || `Order status updated to ${newStatus}`,
    createdAt: new Date(),
  });

  store.saveAuditLog({
    id: `aud-${Date.now()}`,
    actorId: req.user?.id || 'admin',
    actorName: req.user?.fullName || 'Admin',
    action: 'order_status_update',
    resourceType: 'order',
    resourceId: order.id,
    metadata: { orderNumber: order.orderNumber, previousStatus, newStatus },
    createdAt: new Date(),
  });

  return res.json({
    success: true,
    message: `Order status updated to ${newStatus}`,
    data: order,
  });
}

export async function getMyOrders(req: Request, res: Response) {
  if (!req.user) {
    throw new AppError('Authentication required to view private orders', 401);
  }

  const userId = req.user.id;
  const userEmail = req.user.email.toLowerCase();

  const customerOrders = store.orders
    .filter((o) => o.customerId === userId || o.customerEmail.toLowerCase() === userEmail)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((o) => {
      const items = store.orderItems.filter((i) => i.orderId === o.id);
      const latestSubmission = store.paymentSubmissions
        .filter((s) => s.orderId === o.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] || null;

      return {
        ...o,
        items,
        itemCount: items.reduce((acc, it) => acc + (it.quantity || 1), 0),
        latestPaymentSubmission: latestSubmission
          ? {
              status: latestSubmission.verificationStatus || latestSubmission.status,
              rejectionReason: latestSubmission.rejectionReason,
              createdAt: latestSubmission.createdAt,
            }
          : null,
      };
    });

  return res.json({
    success: true,
    data: customerOrders,
  });
}

export async function getMyOrderDetails(req: Request, res: Response) {
  if (!req.user) {
    throw new AppError('Authentication required to view order details', 401);
  }

  const { orderNumber } = req.params;
  const userId = req.user.id;
  const userEmail = req.user.email.toLowerCase();

  const order = store.orders.find(
    (o) =>
      o.orderNumber.toUpperCase() === orderNumber.toUpperCase() &&
      (o.customerId === userId || o.customerEmail.toLowerCase() === userEmail)
  );

  if (!order) {
    throw new AppError('Order not found or does not belong to your account', 404);
  }

  const items = store.orderItems.filter((i) => i.orderId === order.id);
  const statusHistory = store.orderStatusHistory
    .filter((h) => h.orderId === order.id)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  const paymentSubmissions = store.paymentSubmissions
    .filter((s) => s.orderId === order.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const generalSettings = store.storeSettings.get('general');

  return res.json({
    success: true,
    data: {
      order,
      items,
      statusHistory,
      paymentSubmissions,
      bankDetails: generalSettings?.bankDetails || null,
    },
  });
}
