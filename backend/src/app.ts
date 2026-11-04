import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { config } from './config/index.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route imports
import authRoutes from './modules/auth/auth.routes.js';
import categoryRoutes from './modules/categories/categories.routes.js';
import productRoutes from './modules/products/products.routes.js';
import cartRoutes from './modules/cart/cart.routes.js';
import checkoutRoutes from './modules/checkout/checkout.routes.js';
import paymentRoutes from './modules/payments/payments.routes.js';
import receiptRoutes from './modules/receipts/receipts.routes.js';
import orderRoutes from './modules/orders/orders.routes.js';
import inventoryRoutes from './modules/inventory/inventory.routes.js';
import customerRoutes from './modules/customers/customers.routes.js';
import settingsRoutes from './modules/settings/settings.routes.js';
import discountRoutes from './modules/discounts/discounts.routes.js';
import auditRoutes from './modules/audit/audit.routes.js';
import notificationRoutes from './modules/notifications/notifications.routes.js';
import newsletterRoutes from './modules/newsletter/newsletter.routes.js';
import analyticsRoutes from './modules/analytics/analytics.routes.js';
import teamRoutes from './modules/admin-team/team.routes.js';

export function createApp() {
  const app = express();

  // Security Headers
  const helmetMiddleware: any = (helmet as any).default || helmet;
  if (typeof helmetMiddleware === 'function') {
    app.use(
      helmetMiddleware({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
        contentSecurityPolicy: false, // Managed per environment
      })
    );
  }

  // Dynamic CORS Configuration
  const configuredOrigins = (process.env.ALLOWED_ORIGINS || config.frontendUrl || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (config.env === 'development' || configuredOrigins.includes('*')) {
          return callback(null, true);
        }
        if (
          configuredOrigins.includes(origin) ||
          origin.includes('localhost') ||
          origin.includes('127.0.0.1') ||
          origin.endsWith('.vercel.app')
        ) {
          return callback(null, true);
        }
        return callback(null, true);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Body Parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Logging (in non-test environments)
  if (config.env !== 'test') {
    app.use(morgan('dev'));
  }

  // Health Check
  app.get('/health', (req, res) => {
    res.json({
      status: 'operational',
      brand: 'MagnifiScent',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  });

  // Static Public Product Media (Images and Videos)
  app.use('/uploads/products', express.static(config.storage.productsDir));
  app.use('/uploads', express.static(path.resolve('./uploads')));

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/cart', cartRoutes);
  app.use('/api/checkout', checkoutRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/receipts', receiptRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/inventory', inventoryRoutes);
  app.use('/api/customers', customerRoutes);
  app.use('/api/settings', settingsRoutes);
  app.use('/api/discounts', discountRoutes);
  app.use('/api/audit', auditRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/newsletter', newsletterRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/admin/team', teamRoutes);

  // 404 Handler for undefined API routes
  app.use('/api/*', (req, res) => {
    res.status(404).json({
      success: false,
      message: `API endpoint ${req.method} ${req.originalUrl} not found`,
    });
  });

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
}
