import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.js';
import { config } from '../config/index.js';
import { INITIAL_ADMIN, INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_DISCOUNTS } from './seed-data.js';
import { DEFAULT_STORE_SETTINGS } from '../shared/index.js';
import bcrypt from 'bcryptjs';
import { SQLiteEngine } from './sqlite.js';

const { Pool } = pg;

export let pool: pg.Pool | null = null;
export let db: ReturnType<typeof drizzle<typeof schema>> | null = null;

try {
  if (config.databaseUrl) {
    pool = new Pool({
      connectionString: config.databaseUrl,
      ssl: config.databaseUrl.includes('neon.tech') || config.databaseUrl.includes('sslmode=require')
        ? { rejectUnauthorized: false }
        : false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    db = drizzle(pool, { schema });
  }
} catch (err) {
  console.warn('[Database] PostgreSQL not connected, fallback to SQLite persistence:', (err as Error).message);
}

// Resilient Repository Store with persistent SQLite database fallback
export class DataStore {
  users: any[] = [];
  categories: any[] = [];
  products: any[] = [];
  productImages: any[] = [];
  orders: any[] = [];
  orderItems: any[] = [];
  paymentSubmissions: any[] = [];
  orderStatusHistory: any[] = [];
  inventoryMovements: any[] = [];
  storeSettings: Map<string, any> = new Map();
  discounts: any[] = [];
  auditLogs: any[] = [];
  notifications: any[] = [];
  newsletter: Set<string> = new Set();
  public sqlite: SQLiteEngine | null = null;

  constructor() {
    try {
      this.sqlite = new SQLiteEngine();
      const loaded = this.sqlite.loadAll();
      this.users = loaded.users;
      this.categories = loaded.categories;
      this.products = loaded.products;
      this.productImages = loaded.productImages;
      this.orders = loaded.orders;
      this.orderItems = loaded.orderItems;
      this.paymentSubmissions = loaded.paymentSubmissions;
      this.orderStatusHistory = loaded.orderStatusHistory;
      this.inventoryMovements = loaded.inventoryMovements;
      this.storeSettings = loaded.storeSettings;
      this.discounts = loaded.discounts;
      this.auditLogs = loaded.auditLogs;
      this.notifications = loaded.notifications;
      this.newsletter = loaded.newsletter;
      console.log(`[Database] SQLite engine active (${this.users.length} users, ${this.products.length} products, ${this.orders.length} orders).`);
    } catch (err) {
      console.warn('[Database] Initializing in fallback operational memory mode:', (err as Error).message);
      this.seed();
    }
  }

  // Write-Through Helper Methods
  public saveUser(user: any) {
    const idx = this.users.findIndex((u) => u.id === user.id);
    if (idx >= 0) {
      this.users[idx] = user;
    } else {
      this.users.push(user);
    }
    if (this.sqlite) this.sqlite.saveUser(user);
  }

  public saveCategory(category: any) {
    const idx = this.categories.findIndex((c) => c.id === category.id);
    if (idx >= 0) {
      this.categories[idx] = category;
    } else {
      this.categories.push(category);
    }
    if (this.sqlite) this.sqlite.saveCategory(category);
  }

  public saveProduct(product: any, images: any[] = []) {
    const idx = this.products.findIndex((p) => p.id === product.id);
    if (idx >= 0) {
      this.products[idx] = product;
    } else {
      this.products.push(product);
    }
    if (images && images.length > 0) {
      this.productImages = this.productImages.filter((img) => img.productId !== product.id);
      images.forEach((img, i) => {
        this.productImages.push({
          id: img.id || `img-${product.id}-${i}`,
          productId: product.id,
          imageUrl: img.imageUrl,
          altText: img.altText || 'Product photograph',
          displayOrder: img.displayOrder || i,
          isPrimary: Boolean(img.isPrimary),
          createdAt: new Date(),
        });
      });
    }
    if (this.sqlite) this.sqlite.saveProduct(product, images);
  }

  public saveOrder(order: any, items: any[] = []) {
    const idx = this.orders.findIndex((o) => o.id === order.id);
    if (idx >= 0) {
      this.orders[idx] = order;
    } else {
      this.orders.unshift(order);
    }
    if (items && items.length > 0) {
      this.orderItems = this.orderItems.filter((it) => it.orderId !== order.id);
      this.orderItems.push(...items);
    }
    if (this.sqlite) this.sqlite.saveOrder(order, items);
  }

  public updateOrderStatus(orderId: string, orderStatus: string, paymentStatus?: string) {
    const order = this.orders.find((o) => o.id === orderId);
    if (order) {
      order.orderStatus = orderStatus;
      if (paymentStatus) order.paymentStatus = paymentStatus;
      order.updatedAt = new Date();
    }
    if (this.sqlite) this.sqlite.updateOrderStatus(orderId, orderStatus, paymentStatus);
  }

  public savePaymentSubmission(sub: any) {
    const idx = this.paymentSubmissions.findIndex((s) => s.id === sub.id);
    if (idx >= 0) {
      this.paymentSubmissions[idx] = sub;
    } else {
      this.paymentSubmissions.unshift(sub);
    }
    if (this.sqlite) this.sqlite.savePaymentSubmission(sub);
  }

  public saveOrderStatusHistory(h: any) {
    this.orderStatusHistory.push(h);
    if (this.sqlite) this.sqlite.saveOrderStatusHistory(h);
  }

  public saveInventoryMovement(m: any) {
    this.inventoryMovements.push(m);
    if (this.sqlite) this.sqlite.saveInventoryMovement(m);
  }

  public saveStoreSetting(key: string, value: any) {
    this.storeSettings.set(key, value);
    if (this.sqlite) this.sqlite.saveStoreSetting(key, value);
  }

  public saveDiscount(d: any) {
    const idx = this.discounts.findIndex((disc) => disc.id === d.id);
    if (idx >= 0) {
      this.discounts[idx] = d;
    } else {
      this.discounts.push(d);
    }
    if (this.sqlite) this.sqlite.saveDiscount(d);
  }

  public saveAuditLog(l: any) {
    this.auditLogs.unshift(l);
    if (this.sqlite) this.sqlite.saveAuditLog(l);
  }

  public saveNotification(n: any) {
    this.notifications.unshift(n);
    if (this.sqlite) this.sqlite.saveNotification(n);
  }

  public saveNewsletter(email: string) {
    this.newsletter.add(email.toLowerCase());
    if (this.sqlite) this.sqlite.saveNewsletter(email);
  }

  seed(clearOrders = false) {
    // Seed Admin
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(INITIAL_ADMIN.password, salt);
    this.users = [
      {
        id: 'usr-admin-1',
        fullName: INITIAL_ADMIN.fullName,
        email: INITIAL_ADMIN.email,
        phone: INITIAL_ADMIN.phone,
        passwordHash,
        role: INITIAL_ADMIN.role,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Seed Categories
    this.categories = INITIAL_CATEGORIES.map((c) => ({
      ...c,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    // Seed Products & Images
    this.products = [];
    this.productImages = [];
    INITIAL_PRODUCTS.forEach((p) => {
      const { images, ...productData } = p;
      this.products.push({
        ...productData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      images.forEach((img, idx) => {
        this.productImages.push({
          id: `img-${p.id}-${idx}`,
          productId: p.id,
          imageUrl: img.imageUrl,
          altText: img.altText,
          displayOrder: img.displayOrder,
          isPrimary: img.isPrimary,
          createdAt: new Date(),
        });
      });
    });

    // Seed Discounts
    this.discounts = INITIAL_DISCOUNTS.map((d) => ({
      ...d,
      createdAt: new Date(),
    }));

    // Seed Store Settings
    this.storeSettings.set('general', {
      storeName: DEFAULT_STORE_SETTINGS.store_name,
      tagline: DEFAULT_STORE_SETTINGS.tagline,
      supportEmail: DEFAULT_STORE_SETTINGS.support_email,
      whatsappNumber: DEFAULT_STORE_SETTINGS.whatsapp_number,
      whatsappEnabled: DEFAULT_STORE_SETTINGS.whatsapp_enabled,
      currency: DEFAULT_STORE_SETTINGS.currency,
      currencySymbol: DEFAULT_STORE_SETTINGS.currency_symbol,
      announcement: DEFAULT_STORE_SETTINGS.announcement,
      bankDetails: DEFAULT_STORE_SETTINGS.bank_details,
      shipping: DEFAULT_STORE_SETTINGS.shipping,
      hero: DEFAULT_STORE_SETTINGS.hero,
    });

    // Only reset transactional runtime state if explicitly requested (e.g. during test resets)
    if (clearOrders) {
      this.orders = [];
      this.orderItems = [];
      this.paymentSubmissions = [];
      this.orderStatusHistory = [];
      this.inventoryMovements = [];
      this.auditLogs = [];
      this.notifications = [];
      this.newsletter = new Set();

      if (this.sqlite) {
        this.sqlite.resetForSeed();
      }
    }
  }
}

export const store = new DataStore();
