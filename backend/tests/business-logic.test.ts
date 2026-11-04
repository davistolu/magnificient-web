import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { store } from '../src/database/index.js';
import { INITIAL_ADMIN } from '../src/database/seed-data.js';

describe('Magnificent Luxury Platform - Critical Business Scenarios', () => {
  const app = createApp();
  let adminToken = '';

  beforeEach(async () => {
    // Reset test seed data in-memory
    store.seed(true);

    // Login admin to obtain test token
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: INITIAL_ADMIN.email,
        password: INITIAL_ADMIN.password,
      });

    adminToken = res.body.token;
  });

  it('1. Public catalog: customer can browse products and categories without authentication', async () => {
    const catRes = await request(app).get('/api/categories');
    expect(catRes.status).toBe(200);
    expect(catRes.body.success).toBe(true);
    expect(catRes.body.data.length).toBeGreaterThan(0);

    const prodRes = await request(app).get('/api/products?category=watches');
    expect(prodRes.status).toBe(200);
    expect(prodRes.body.data.length).toBeGreaterThan(0);
    expect(prodRes.body.data[0].category.slug).toBe('watches');
  });

  it('2. Tamper resistance: server calculates authoritative price and rejects client-side pricing', async () => {
    const watch = store.products.find((p) => p.sku === 'MAG-WAT-001')!;

    // Client attempts to pass fake price of ₦500
    const cartRes = await request(app)
      .post('/api/cart/verify')
      .send({
        items: [
          {
            productId: watch.id,
            quantity: 2,
            price: 500, // fake price
          },
        ],
      });

    expect(cartRes.status).toBe(200);
    const verifiedItem = cartRes.body.data.items[0];
    // Must match real database price of ₦1,850,000
    expect(verifiedItem.price).toBe(Number(watch.price));
    expect(cartRes.body.data.subtotal).toBe(Number(watch.price) * 2);
  });

  it('3. Checkout & Stock deduction: valid checkout creates order and decrements inventory', async () => {
    const watch = store.products.find((p) => p.sku === 'MAG-WAT-001')!;
    const initialStock = watch.stockQuantity;

    const checkoutRes = await request(app)
      .post('/api/checkout')
      .send({
        customerName: 'Amina Danjuma',
        customerEmail: 'amina.danjuma@example.com',
        customerPhone: '+2348031234567',
        deliveryAddress: '14 Queen Victoria Island, Waterfront Mansions',
        deliveryCity: 'Lagos',
        deliveryState: 'Lagos',
        shippingMethod: 'standard',
        paymentMethod: 'bank_transfer',
        items: [
          {
            productId: watch.id,
            quantity: 2,
          },
        ],
      });

    expect(checkoutRes.status).toBe(201);
    expect(checkoutRes.body.success).toBe(true);
    const { order, guestAccessToken } = checkoutRes.body.data;
    expect(order.orderNumber).toMatch(/^MAG-\d{4}-[A-F0-9]{6}$/);
    expect(order.paymentStatus).toBe('unpaid');
    expect(order.orderStatus).toBe('pending_payment');
    expect(guestAccessToken).toBeDefined();

    // Verify stock was deducted
    expect(watch.stockQuantity).toBe(initialStock - 2);
  });

  it('4. Concurrency & Overselling prevention: checkout fails if stock is insufficient', async () => {
    const rareSuite = store.products.find((p) => p.sku === 'MAG-GFT-001')!; // stock is 3

    const checkoutRes = await request(app)
      .post('/api/checkout')
      .send({
        customerName: 'Emeka Okafor',
        customerEmail: 'emeka@example.com',
        customerPhone: '+2348099887766',
        deliveryAddress: 'Plot 88 Diplomatic Zone',
        deliveryCity: 'Abuja',
        deliveryState: 'FCT',
        shippingMethod: 'express',
        paymentMethod: 'bank_transfer',
        items: [
          {
            productId: rareSuite.id,
            quantity: 10, // Requesting 10 when only 3 available
          },
        ],
      });

    expect(checkoutRes.status).toBe(400);
    expect(checkoutRes.body.success).toBe(false);
    expect(checkoutRes.body.message).toContain('Insufficient stock');
  });

  it('5. Guest order privacy: cannot view order with wrong email or missing token', async () => {
    const perfume = store.products.find((p) => p.sku === 'MAG-PRF-001')!;
    const checkoutRes = await request(app)
      .post('/api/checkout')
      .send({
        customerName: 'Bolanle Alabi',
        customerEmail: 'bolanle@example.com',
        customerPhone: '+2348022223333',
        deliveryAddress: '22 Ocean Promenade',
        deliveryCity: 'Port Harcourt',
        deliveryState: 'Rivers',
        paymentMethod: 'bank_transfer',
        items: [{ productId: perfume.id, quantity: 1 }],
      });

    const { order, guestAccessToken } = checkoutRes.body.data;

    // Snooper tries to track with wrong email and no token
    const snoopRes = await request(app)
      .get(`/api/orders/track?orderNumber=${order.orderNumber}&email=stranger@example.com`);
    expect(snoopRes.status).toBe(403);

    // Legitimate customer tracks with correct token
    const validTokenRes = await request(app)
      .get(`/api/orders/track?orderNumber=${order.orderNumber}&token=${guestAccessToken}`);
    expect(validTokenRes.status).toBe(200);
    expect(validTokenRes.body.data.order.orderNumber).toBe(order.orderNumber);

    // Legitimate customer tracks with correct email
    const validEmailRes = await request(app)
      .get(`/api/orders/track?orderNumber=${order.orderNumber}&email=bolanle@example.com`);
    expect(validEmailRes.status).toBe(200);
  });

  it('6. Payment verification queue: admin can approve payment, but customer cannot mark paid directly', async () => {
    const perfume = store.products.find((p) => p.sku === 'MAG-PRF-001')!;
    const checkoutRes = await request(app)
      .post('/api/checkout')
      .send({
        customerName: 'Kemi Adeleke',
        customerEmail: 'kemi@example.com',
        customerPhone: '+2348055554444',
        deliveryAddress: '7 Bourdillon Road, Ikoyi',
        deliveryCity: 'Lagos',
        deliveryState: 'Lagos',
        paymentMethod: 'bank_transfer',
        items: [{ productId: perfume.id, quantity: 1 }],
      });

    const { order } = checkoutRes.body.data;

    // Simulate submission created
    const submissionId = `sub-test-${Date.now()}`;
    store.paymentSubmissions.push({
      id: submissionId,
      orderId: order.id,
      orderNumber: order.orderNumber,
      receiptStorageKey: 'sample_rcpt.jpg',
      originalFilename: 'zenith_transfer_receipt.jpg',
      mimeType: 'image/jpeg',
      fileSize: 450000,
      submittedAmount: order.totalAmount,
      paymentReference: 'TRX-998822',
      status: 'pending',
      rejectionReason: null,
      reviewedBy: null,
      reviewedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    order.paymentStatus = 'pending_verification';
    order.orderStatus = 'payment_review';

    // Unauthenticated user attempts to approve payment
    const unauthApprove = await request(app)
      .post('/api/payments/verify')
      .send({ submissionId, action: 'approve' });
    expect(unauthApprove.status).toBe(401);

    // Admin approves payment
    const adminApprove = await request(app)
      .post('/api/payments/verify')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ submissionId, action: 'approve' });

    expect(adminApprove.status).toBe(200);
    expect(adminApprove.body.data.order.paymentStatus).toBe('paid');
    expect(adminApprove.body.data.order.orderStatus).toBe('confirmed');
  });

  it('7. Payment rejection: requires mandatory rejection reason', async () => {
    const submissionId = `sub-reject-${Date.now()}`;
    const orderId = `ord-reject-${Date.now()}`;
    const orderNumber = 'MAG-2026-REJECT';

    store.orders.push({
      id: orderId,
      orderNumber,
      guestAccessToken: 'token-reject',
      customerId: null,
      customerName: 'Tunde Bakare',
      customerEmail: 'tunde@example.com',
      customerPhone: '+2348011112222',
      deliveryAddress: '3 Marina Boulevard',
      deliveryCity: 'Lagos',
      deliveryState: 'Lagos',
      subtotal: 395000,
      discountAmount: 0,
      shippingAmount: 3500,
      totalAmount: 398500,
      currency: 'NGN',
      paymentMethod: 'bank_transfer',
      paymentStatus: 'pending_verification',
      orderStatus: 'payment_review',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    store.paymentSubmissions.push({
      id: submissionId,
      orderId,
      orderNumber,
      receiptStorageKey: 'blur_rcpt.jpg',
      originalFilename: 'blurred.jpg',
      mimeType: 'image/jpeg',
      fileSize: 120000,
      submittedAmount: 398500,
      paymentReference: null,
      status: 'pending',
      rejectionReason: null,
      reviewedBy: null,
      reviewedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Attempt rejection without reason
    const failReject = await request(app)
      .post('/api/payments/verify')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ submissionId, action: 'reject', rejectionReason: '' });

    expect(failReject.status).toBe(400);

    // Provide clear mandatory reason
    const validReject = await request(app)
      .post('/api/payments/verify')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        submissionId,
        action: 'reject',
        rejectionReason: 'Bank transfer reference could not be matched against current ledger statements.',
      });

    expect(validReject.status).toBe(200);
    expect(validReject.body.data.submission.status).toBe('rejected');
    expect(validReject.body.data.order.paymentStatus).toBe('rejected');
  });

  it('8. Customer authentication & order tracking: client can register, log in, place order, and retrieve their orders', async () => {
    // 1. Register a new customer
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'aliko.client@example.com',
        password: 'Password123!',
        fullName: 'Aliko Client',
        phone: '+2348000000001',
      });

    expect(regRes.status).toBe(201);
    expect(regRes.body.success).toBe(true);
    expect(regRes.body.token).toBeDefined();
    expect(regRes.body.user.role).toBe('customer');

    // 2. Login as the newly created customer
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'aliko.client@example.com',
        password: 'Password123!',
      });

    expect(loginRes.status).toBe(200);
    const clientToken = loginRes.body.token;
    expect(clientToken).toBeDefined();

    // 3. Place an order as authenticated client
    const watch = store.products.find((p) => p.sku === 'MAG-WAT-001')!;
    const checkoutRes = await request(app)
      .post('/api/checkout')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        customerName: 'Aliko Client',
        customerEmail: 'aliko.client@example.com',
        customerPhone: '+2348000000001',
        deliveryAddress: '15 Alexander Road, Ikoyi',
        deliveryCity: 'Lagos',
        deliveryState: 'Lagos',
        shippingMethod: 'express',
        paymentMethod: 'bank_transfer',
        items: [{ productId: watch.id, quantity: 1 }],
      });

    expect(checkoutRes.status).toBe(201);
    const { order } = checkoutRes.body.data;
    expect(order.customerId).toBe(regRes.body.user.id);

    // 4. Client retrieves their orders via /api/orders/my-orders
    const myOrdersRes = await request(app)
      .get('/api/orders/my-orders')
      .set('Authorization', `Bearer ${clientToken}`);

    expect(myOrdersRes.status).toBe(200);
    expect(myOrdersRes.body.success).toBe(true);
    expect(Array.isArray(myOrdersRes.body.data)).toBe(true);
    expect(myOrdersRes.body.data.some((o: any) => o.orderNumber === order.orderNumber)).toBe(true);

    // 5. Client retrieves specific order details via /api/orders/my-orders/:orderNumber
    const orderDetailsRes = await request(app)
      .get(`/api/orders/my-orders/${order.orderNumber}`)
      .set('Authorization', `Bearer ${clientToken}`);

    expect(orderDetailsRes.status).toBe(200);
    expect(orderDetailsRes.body.success).toBe(true);
    expect(orderDetailsRes.body.data.order.orderNumber).toBe(order.orderNumber);
    expect(orderDetailsRes.body.data.items.length).toBeGreaterThan(0);
  });

  it('9. SQLite Fallback Engine: native SQLite stores and persists records without PostgreSQL', async () => {
    // Verify that SQLiteEngine instance exists on store
    expect(store.sqlite).toBeDefined();

    if (store.sqlite) {
      // 1. Verify admin user from seed is in SQLite
      const adminUsers = store.sqlite.query('SELECT * FROM users WHERE email = ?', [INITIAL_ADMIN.email]);
      expect(adminUsers.length).toBe(1);
      expect(adminUsers[0].email).toBe(INITIAL_ADMIN.email);

      // 2. Write-through persistence: save new user and query directly from SQLite
      store.saveUser({
        id: 'usr-sqlite-test',
        fullName: 'Persisted Luxury Client',
        email: 'persisted.client@example.com',
        phone: '+2348099990000',
        passwordHash: 'testhash',
        role: 'customer',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const queriedUser = store.sqlite.query('SELECT * FROM users WHERE email = ?', ['persisted.client@example.com']);
      expect(queriedUser.length).toBe(1);
      expect(queriedUser[0].fullName).toBe('Persisted Luxury Client');

      // 3. Verify products table populated
      const products = store.sqlite.query('SELECT * FROM products LIMIT 5');
      expect(products.length).toBeGreaterThan(0);
    }
  });

  it('10. Operational Dashboard & Analytics: metrics endpoint returns operational state and recent orders', async () => {
    // 1. Check /api/analytics/metrics endpoint
    const metricsRes = await request(app)
      .get('/api/analytics/metrics')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(metricsRes.status).toBe(200);
    expect(metricsRes.body.success).toBe(true);
    expect(metricsRes.body.data.metrics).toBeDefined();
    expect(metricsRes.body.data.metrics.totalOrders).toBe(0);

    // 2. Place an order
    const watch = store.products.find((p) => p.sku === 'MAG-WAT-001')!;
    const checkoutRes = await request(app)
      .post('/api/checkout')
      .send({
        customerName: 'General Oladipo',
        customerEmail: 'oladipo@example.com',
        customerPhone: '+2348033333333',
        deliveryAddress: '15 Queens Drive',
        deliveryCity: 'Ikoyi',
        deliveryState: 'Lagos',
        paymentMethod: 'bank_transfer',
        items: [{ productId: watch.id, quantity: 1 }],
      });
    expect(checkoutRes.status).toBe(201);

    // 3. Verify metrics reflect new order immediately
    const updatedMetricsRes = await request(app)
      .get('/api/analytics/metrics')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(updatedMetricsRes.status).toBe(200);
    expect(updatedMetricsRes.body.data.metrics.totalOrders).toBe(1);
    expect(updatedMetricsRes.body.data.recentOrders.length).toBe(1);
    expect(updatedMetricsRes.body.data.recentOrders[0].customerName).toBe('General Oladipo');

    // 4. Verify Audit Trail also persists
    const auditRes = await request(app)
      .get('/api/audit')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(auditRes.status).toBe(200);
    expect(auditRes.body.success).toBe(true);
  });
});

