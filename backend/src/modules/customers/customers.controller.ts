import { Request, Response } from 'express';
import { store } from '../../database/index.js';
import { AppError } from '../../middleware/errorHandler.js';

export async function listCustomers(req: Request, res: Response) {
  // Aggregate customer records from users + guest orders
  const customerMap = new Map<string, any>();

  // Registered customers
  store.users
    .filter((u) => u.role === 'customer')
    .forEach((u) => {
      customerMap.set(u.email.toLowerCase(), {
        id: u.id,
        fullName: u.fullName,
        email: u.email,
        phone: u.phone || 'N/A',
        isRegistered: true,
        orderCount: 0,
        totalConfirmedSpend: 0,
        lastOrderDate: null,
      });
    });

  // Calculate order stats
  store.orders.forEach((order) => {
    const emailKey = order.customerEmail.toLowerCase();
    let existing = customerMap.get(emailKey);
    if (!existing) {
      existing = {
        id: `guest-${emailKey}`,
        fullName: order.customerName,
        email: order.customerEmail,
        phone: order.customerPhone,
        isRegistered: false,
        orderCount: 0,
        totalConfirmedSpend: 0,
        lastOrderDate: null,
      };
      customerMap.set(emailKey, existing);
    }

    existing.orderCount += 1;
    if (order.paymentStatus === 'paid') {
      existing.totalConfirmedSpend += Number(order.totalAmount);
    }

    if (!existing.lastOrderDate || new Date(order.createdAt) > new Date(existing.lastOrderDate)) {
      existing.lastOrderDate = order.createdAt;
    }
  });

  const customerList = Array.from(customerMap.values()).sort(
    (a, b) => b.totalConfirmedSpend - a.totalConfirmedSpend
  );

  return res.json({
    success: true,
    data: customerList,
  });
}

export async function getCustomerDetails(req: Request, res: Response) {
  const { emailOrId } = req.params;
  const normalized = emailOrId.toLowerCase();

  const customerOrders = store.orders
    .filter((o) => o.customerEmail.toLowerCase() === normalized || o.customerId === emailOrId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (customerOrders.length === 0) {
    const user = store.users.find((u) => u.id === emailOrId || u.email.toLowerCase() === normalized);
    if (!user) {
      throw new AppError('Customer not found', 404);
    }
    return res.json({
      success: true,
      data: {
        customer: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          isRegistered: true,
          totalConfirmedSpend: 0,
        },
        orders: [],
      },
    });
  }

  const firstOrder = customerOrders[0];
  const totalConfirmedSpend = customerOrders
    .filter((o) => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + Number(o.totalAmount), 0);

  return res.json({
    success: true,
    data: {
      customer: {
        fullName: firstOrder.customerName,
        email: firstOrder.customerEmail,
        phone: firstOrder.customerPhone,
        totalConfirmedSpend,
      },
      orders: customerOrders,
    },
  });
}
