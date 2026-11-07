import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { config } from './config/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { store } from './database/index.js';

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
import ogRoutes from './modules/og/og.routes.js';
import mediaRoutes from './modules/media/media.routes.js';
import { getMediaFile } from './modules/media/media.controller.js';

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

  // Dynamic SEO XML Sitemap (includes all live products & categories)
  app.get('/sitemap.xml', (req, res) => {
    res.setHeader('Content-Type', 'application/xml');
    const baseUrl = (process.env.FRONTEND_URL || 'https://magnifiscent.site').replace(/\/+$/, '');
    const staticUrls = [
      '',
      '/watches',
      '/jewellery',
      '/perfumes',
      '/gift-sets',
      '/shop',
      '/about',
      '/contact',
      '/faq',
      '/track',
      '/shipping-policy',
      '/returns-policy',
      '/privacy',
      '/terms',
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls
  .map(
    (u) => `  <url>
    <loc>${baseUrl}${u}</loc>
    <changefreq>${u === '' || u.startsWith('/watches') || u.startsWith('/jewellery') || u.startsWith('/perfumes') ? 'daily' : 'weekly'}</changefreq>
    <priority>${u === '' ? '1.0' : u.startsWith('/watches') || u.startsWith('/jewellery') || u.startsWith('/perfumes') ? '0.95' : '0.7'}</priority>
  </url>`
  )
  .join('\n')}
${store.products
  .filter((p) => p.status === 'published')
  .map(
    (p) => `  <url>
    <loc>${baseUrl}/products/${p.slug}</loc>
    <lastmod>${new Date(p.updatedAt || p.createdAt || Date.now()).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;
    res.send(xml);
  });

  // Dynamic robots.txt
  app.get('/robots.txt', (req, res) => {
    res.setHeader('Content-Type', 'text/plain');
    const baseUrl = (process.env.FRONTEND_URL || 'https://magnifiscent.site').replace(/\/+$/, '');
    res.send(`User-agent: *
Allow: /
Allow: /watches
Allow: /jewellery
Allow: /perfumes
Allow: /gift-sets
Allow: /shop
Allow: /products/
Allow: /about
Allow: /contact
Allow: /faq
Disallow: /admin
Disallow: /admin/
Disallow: /api/
Disallow: /checkout
Disallow: /cart
Disallow: /payment-instructions/

Sitemap: ${baseUrl}/sitemap.xml
`);
  });

  // Static Public Product Media (Images and Videos with DB fallback)
  app.use('/uploads/products', express.static(config.storage.productsDir));
  app.use('/uploads', express.static(path.resolve('./uploads')));
  app.get('/uploads/products/:filename', getMediaFile);
  app.get('/uploads/receipts/:filename', getMediaFile);
  app.get('/uploads/:filename', getMediaFile);

  // Disable HTTP caching on dynamic /api routes (exclude static media & og previews)
  app.use('/api', (req, res, next) => {
    if (req.path.startsWith('/media') || req.path.startsWith('/og')) {
      return next();
    }
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    next();
  });

  // Ensure PostgreSQL DataStore is fully synchronized before any API request executes
  app.use(async (req, res, next) => {
    if (req.path === '/health' || req.path === '/robots.txt') {
      return next();
    }
    try {
      // Admin requests or authenticated requests require the absolute latest database state
      const maxAge = req.path.startsWith('/api/admin') || req.headers.authorization ? 500 : 1500;
      await store.ensureFresh(maxAge);
    } catch (err) {
      console.warn('[Store Sync Middleware Note]:', (err as Error).message);
    }
    next();
  });

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
  app.use('/api/og-preview', ogRoutes);
  app.use('/api/og', ogRoutes);
  app.use('/api/media', mediaRoutes);

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
