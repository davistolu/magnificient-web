import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { createRequire } from 'module';
import { INITIAL_ADMIN, INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_DISCOUNTS } from './seed-data.js';
import { DEFAULT_STORE_SETTINGS } from '../shared/index.js';

const nodeRequire = createRequire(import.meta.url);
let DatabaseSync: any = null;
try {
  const sqlite = nodeRequire('node:sqlite');
  DatabaseSync = sqlite.DatabaseSync;
} catch (err) {
  console.warn('[SQLite] Native node:sqlite not available in this environment:', err);
}

const DEFAULT_SQLITE_DIR = fileURLToPath(new URL('../../data', import.meta.url));
const DEFAULT_SQLITE_FILE = path.join(DEFAULT_SQLITE_DIR, 'magnificent.db');

export class SQLiteEngine {
  private db: any = null;
  private dbPath: string;

  constructor(filePath?: string) {
    if (process.env.NODE_ENV === 'test') {
      this.dbPath = ':memory:';
    } else if (filePath) {
      this.dbPath = path.resolve(filePath);
    } else {
      this.dbPath = DEFAULT_SQLITE_FILE;
    }

    if (this.dbPath !== ':memory:') {
      const dir = path.dirname(this.dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }

    if (DatabaseSync) {
      this.db = new DatabaseSync(this.dbPath);
      this.initSchema();
    }
  }

  public query(sql: string, params: any[] = []): any[] {
    if (!this.db) return [];
    const stmt = this.db.prepare(sql);
    return stmt.all(...params);
  }

  public execute(sql: string, params: any[] = []): void {
    if (!this.db) return;
    const stmt = this.db.prepare(sql);
    stmt.run(...params);
  }

  private initSchema() {
    if (!this.db) return;
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        fullName TEXT,
        email TEXT UNIQUE,
        phone TEXT,
        passwordHash TEXT,
        role TEXT,
        isActive INTEGER,
        createdAt TEXT,
        updatedAt TEXT
      );

      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT,
        slug TEXT UNIQUE,
        description TEXT,
        imageUrl TEXT,
        displayOrder INTEGER,
        isActive INTEGER,
        createdAt TEXT,
        updatedAt TEXT
      );

      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        categoryId TEXT,
        name TEXT,
        slug TEXT UNIQUE,
        sku TEXT UNIQUE,
        shortDescription TEXT,
        description TEXT,
        price REAL,
        compareAtPrice REAL,
        stockQuantity INTEGER,
        lowStockThreshold INTEGER,
        status TEXT,
        isFeatured INTEGER,
        brand TEXT,
        gender TEXT,
        specifications TEXT,
        tags TEXT,
        occasion TEXT,
        createdAt TEXT,
        updatedAt TEXT
      );

      CREATE TABLE IF NOT EXISTS product_images (
        id TEXT PRIMARY KEY,
        productId TEXT,
        imageUrl TEXT,
        altText TEXT,
        displayOrder INTEGER,
        isPrimary INTEGER,
        createdAt TEXT
      );

      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        orderNumber TEXT UNIQUE,
        guestAccessToken TEXT,
        customerId TEXT,
        customerName TEXT,
        customerEmail TEXT,
        customerPhone TEXT,
        deliveryAddress TEXT,
        deliveryCity TEXT,
        deliveryState TEXT,
        deliveryInstructions TEXT,
        subtotal REAL,
        discountAmount REAL,
        shippingAmount REAL,
        totalAmount REAL,
        currency TEXT,
        paymentMethod TEXT,
        paymentStatus TEXT,
        orderStatus TEXT,
        createdAt TEXT,
        updatedAt TEXT
      );

      CREATE TABLE IF NOT EXISTS order_items (
        id TEXT PRIMARY KEY,
        orderId TEXT,
        productId TEXT,
        productNameSnapshot TEXT,
        skuSnapshot TEXT,
        unitPrice REAL,
        quantity INTEGER,
        lineTotal REAL,
        selectedOptionsSnapshot TEXT,
        productImageSnapshot TEXT,
        createdAt TEXT
      );

      CREATE TABLE IF NOT EXISTS payment_submissions (
        id TEXT PRIMARY KEY,
        orderId TEXT,
        orderNumber TEXT,
        submittedAmount REAL,
        receiptFilePath TEXT,
        paymentReference TEXT,
        notes TEXT,
        verificationStatus TEXT,
        rejectionReason TEXT,
        reviewedBy TEXT,
        reviewedAt TEXT,
        createdAt TEXT
      );

      CREATE TABLE IF NOT EXISTS order_status_history (
        id TEXT PRIMARY KEY,
        orderId TEXT,
        status TEXT,
        note TEXT,
        createdBy TEXT,
        createdAt TEXT
      );

      CREATE TABLE IF NOT EXISTS inventory_movements (
        id TEXT PRIMARY KEY,
        productId TEXT,
        productName TEXT,
        quantityChange INTEGER,
        movementType TEXT,
        reason TEXT,
        referenceId TEXT,
        createdBy TEXT,
        createdAt TEXT
      );

      CREATE TABLE IF NOT EXISTS store_settings (
        key TEXT PRIMARY KEY,
        valueJson TEXT,
        updatedAt TEXT
      );

      CREATE TABLE IF NOT EXISTS discounts (
        id TEXT PRIMARY KEY,
        code TEXT UNIQUE,
        description TEXT,
        discountType TEXT,
        discountValue REAL,
        minOrderAmount REAL,
        usageLimit INTEGER,
        usageCount INTEGER,
        startsAt TEXT,
        expiresAt TEXT,
        isActive INTEGER,
        createdAt TEXT
      );

      CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        actorId TEXT,
        actorName TEXT,
        action TEXT,
        resourceType TEXT,
        resourceId TEXT,
        metadataJson TEXT,
        createdAt TEXT
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        title TEXT,
        message TEXT,
        type TEXT,
        read INTEGER,
        createdAt TEXT
      );

      CREATE TABLE IF NOT EXISTS newsletter (
        email TEXT PRIMARY KEY,
        createdAt TEXT
      );
    `);
  }

  public seedIfEmpty() {
    if (!this.db) return;
    const userRow = this.db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
    if (userRow && userRow.count > 0) {
      return; // Already initialized
    }

    console.log('[SQLite Engine] Initializing database with luxury seed catalog...');

    // Seed Admin
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(INITIAL_ADMIN.password, salt);
    this.saveUser({
      id: 'usr-admin-1',
      fullName: INITIAL_ADMIN.fullName,
      email: INITIAL_ADMIN.email,
      phone: INITIAL_ADMIN.phone,
      passwordHash,
      role: INITIAL_ADMIN.role,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Seed Categories
    INITIAL_CATEGORIES.forEach((cat) => {
      this.saveCategory({
        ...cat,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    // Seed Products & Images
    INITIAL_PRODUCTS.forEach((prod) => {
      const { images, ...productData } = prod;
      this.saveProduct(
        {
          ...productData,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        images
      );
    });

    // Seed Discounts
    INITIAL_DISCOUNTS.forEach((disc) => {
      this.saveDiscount({
        ...disc,
        createdAt: new Date(),
      });
    });

    // Seed Settings
    this.saveStoreSetting('general', {
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
  }

  public loadAll() {
    if (!this.db) {
      return {
        users: [],
        categories: [],
        products: [],
        productImages: [],
        orders: [],
        orderItems: [],
        paymentSubmissions: [],
        orderStatusHistory: [],
        inventoryMovements: [],
        storeSettings: new Map(),
        discounts: [],
        auditLogs: [],
        notifications: [],
        newsletter: new Set<string>(),
      };
    }
    this.seedIfEmpty();

    const users = this.db.prepare('SELECT * FROM users').all().map((u: any) => ({
      ...u,
      isActive: Boolean(u.isActive),
      createdAt: new Date(u.createdAt),
      updatedAt: new Date(u.updatedAt),
    }));

    const categories = this.db.prepare('SELECT * FROM categories').all().map((c: any) => ({
      ...c,
      isActive: Boolean(c.isActive),
      createdAt: new Date(c.createdAt),
      updatedAt: new Date(c.updatedAt),
    }));

    const products = this.db.prepare('SELECT * FROM products').all().map((p: any) => ({
      ...p,
      isFeatured: Boolean(p.isFeatured),
      specifications: p.specifications ? JSON.parse(p.specifications) : {},
      tags: p.tags ? JSON.parse(p.tags) : [],
      occasion: p.occasion ? JSON.parse(p.occasion) : [],
      createdAt: new Date(p.createdAt),
      updatedAt: new Date(p.updatedAt),
    }));

    const productImages = this.db.prepare('SELECT * FROM product_images').all().map((img: any) => ({
      ...img,
      isPrimary: Boolean(img.isPrimary),
      createdAt: new Date(img.createdAt),
    }));

    const orders = this.db.prepare('SELECT * FROM orders ORDER BY createdAt DESC').all().map((o: any) => ({
      ...o,
      createdAt: new Date(o.createdAt),
      updatedAt: new Date(o.updatedAt),
    }));

    const orderItems = this.db.prepare('SELECT * FROM order_items').all().map((it: any) => ({
      ...it,
      selectedOptionsSnapshot: it.selectedOptionsSnapshot ? JSON.parse(it.selectedOptionsSnapshot) : {},
      createdAt: new Date(it.createdAt),
    }));

    const paymentSubmissions = this.db.prepare('SELECT * FROM payment_submissions').all().map((sub: any) => ({
      ...sub,
      createdAt: new Date(sub.createdAt),
      reviewedAt: sub.reviewedAt ? new Date(sub.reviewedAt) : null,
    }));

    const orderStatusHistory = this.db.prepare('SELECT * FROM order_status_history').all().map((h: any) => ({
      ...h,
      createdAt: new Date(h.createdAt),
    }));

    const inventoryMovements = this.db.prepare('SELECT * FROM inventory_movements').all().map((m: any) => ({
      ...m,
      createdAt: new Date(m.createdAt),
    }));

    const storeSettings = new Map<string, any>();
    const settingRows = this.db.prepare('SELECT * FROM store_settings').all();
    settingRows.forEach((row: any) => {
      try {
        storeSettings.set(row.key, JSON.parse(row.valueJson));
      } catch {
        // ignore
      }
    });

    const discounts = this.db.prepare('SELECT * FROM discounts').all().map((d: any) => ({
      ...d,
      isActive: Boolean(d.isActive),
      createdAt: new Date(d.createdAt),
      startsAt: d.startsAt ? new Date(d.startsAt) : null,
      expiresAt: d.expiresAt ? new Date(d.expiresAt) : null,
    }));

    const auditLogs = this.db.prepare('SELECT * FROM audit_logs').all().map((l: any) => ({
      ...l,
      metadata: l.metadataJson ? JSON.parse(l.metadataJson) : {},
      createdAt: new Date(l.createdAt),
    }));

    const notifications = this.db.prepare('SELECT * FROM notifications').all().map((n: any) => ({
      ...n,
      read: Boolean(n.read),
      createdAt: new Date(n.createdAt),
    }));

    const newsletter = new Set<string>();
    const newsRows = this.db.prepare('SELECT email FROM newsletter').all();
    newsRows.forEach((r: any) => newsletter.add(r.email));

    return {
      users,
      categories,
      products,
      productImages,
      orders,
      orderItems,
      paymentSubmissions,
      orderStatusHistory,
      inventoryMovements,
      storeSettings,
      discounts,
      auditLogs,
      notifications,
      newsletter,
    };
  }

  public resetForSeed() {
    if (!this.db) return;
    this.db.exec(`
      DELETE FROM orders;
      DELETE FROM order_items;
      DELETE FROM payment_submissions;
      DELETE FROM order_status_history;
      DELETE FROM inventory_movements;
      DELETE FROM users WHERE role != 'admin';
    `);
  }

  // Write-Through Methods
  public saveUser(user: any) {
    if (!this.db) return;
    try {
      const existing = this.db.prepare('SELECT id FROM users WHERE email = ?').get(user.email) as any;
      if (existing && existing.id !== user.id) {
        this.db.prepare('DELETE FROM users WHERE email = ?').run(user.email);
      }
    } catch {
      // ignore
    }

    const stmt = this.db.prepare(`
      INSERT INTO users (id, fullName, email, phone, passwordHash, role, isActive, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        fullName = excluded.fullName,
        email = excluded.email,
        phone = excluded.phone,
        passwordHash = excluded.passwordHash,
        role = excluded.role,
        isActive = excluded.isActive,
        updatedAt = excluded.updatedAt
    `);
    stmt.run(
      user.id,
      user.fullName,
      user.email,
      user.phone || null,
      user.passwordHash,
      user.role,
      user.isActive ? 1 : 0,
      new Date(user.createdAt || Date.now()).toISOString(),
      new Date(user.updatedAt || Date.now()).toISOString()
    );
  }

  public saveCategory(category: any) {
    const stmt = this.db.prepare(`
      INSERT INTO categories (id, name, slug, description, imageUrl, displayOrder, isActive, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        slug = excluded.slug,
        description = excluded.description,
        imageUrl = excluded.imageUrl,
        displayOrder = excluded.displayOrder,
        isActive = excluded.isActive,
        updatedAt = excluded.updatedAt
    `);
    stmt.run(
      category.id,
      category.name,
      category.slug,
      category.description || null,
      category.imageUrl || null,
      category.displayOrder || 0,
      category.isActive !== false ? 1 : 0,
      new Date(category.createdAt || Date.now()).toISOString(),
      new Date(category.updatedAt || Date.now()).toISOString()
    );
  }

  public saveProduct(product: any, images: any[] = []) {
    const stmt = this.db.prepare(`
      INSERT INTO products (
        id, categoryId, name, slug, sku, shortDescription, description,
        price, compareAtPrice, stockQuantity, lowStockThreshold, status,
        isFeatured, brand, gender, specifications, tags, occasion, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        categoryId = excluded.categoryId,
        name = excluded.name,
        slug = excluded.slug,
        sku = excluded.sku,
        shortDescription = excluded.shortDescription,
        description = excluded.description,
        price = excluded.price,
        compareAtPrice = excluded.compareAtPrice,
        stockQuantity = excluded.stockQuantity,
        lowStockThreshold = excluded.lowStockThreshold,
        status = excluded.status,
        isFeatured = excluded.isFeatured,
        brand = excluded.brand,
        gender = excluded.gender,
        specifications = excluded.specifications,
        tags = excluded.tags,
        occasion = excluded.occasion,
        updatedAt = excluded.updatedAt
    `);

    stmt.run(
      product.id,
      product.categoryId,
      product.name,
      product.slug,
      product.sku,
      product.shortDescription,
      product.description,
      product.price,
      product.compareAtPrice || null,
      product.stockQuantity,
      product.lowStockThreshold || 2,
      product.status || 'published',
      product.isFeatured ? 1 : 0,
      product.brand || 'Magnificent',
      product.gender || 'unisex',
      JSON.stringify(product.specifications || {}),
      JSON.stringify(product.tags || []),
      JSON.stringify(product.occasion || []),
      new Date(product.createdAt || Date.now()).toISOString(),
      new Date(product.updatedAt || Date.now()).toISOString()
    );

    if (images && images.length > 0) {
      const delStmt = this.db.prepare('DELETE FROM product_images WHERE productId = ?');
      delStmt.run(product.id);

      const imgStmt = this.db.prepare(`
        INSERT INTO product_images (id, productId, imageUrl, altText, displayOrder, isPrimary, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      images.forEach((img, idx) => {
        imgStmt.run(
          img.id || `img-${product.id}-${idx}`,
          product.id,
          img.imageUrl,
          img.altText || 'Product photograph',
          img.displayOrder || idx,
          img.isPrimary ? 1 : 0,
          new Date().toISOString()
        );
      });
    }
  }

  public saveOrder(order: any, items: any[] = []) {
    const stmt = this.db.prepare(`
      INSERT INTO orders (
        id, orderNumber, guestAccessToken, customerId, customerName, customerEmail,
        customerPhone, deliveryAddress, deliveryCity, deliveryState, deliveryInstructions,
        subtotal, discountAmount, shippingAmount, totalAmount, currency,
        paymentMethod, paymentStatus, orderStatus, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        paymentStatus = excluded.paymentStatus,
        orderStatus = excluded.orderStatus,
        updatedAt = excluded.updatedAt
    `);

    stmt.run(
      order.id,
      order.orderNumber,
      order.guestAccessToken,
      order.customerId || null,
      order.customerName,
      order.customerEmail,
      order.customerPhone,
      order.deliveryAddress,
      order.deliveryCity,
      order.deliveryState,
      order.deliveryInstructions || null,
      order.subtotal,
      order.discountAmount || 0,
      order.shippingAmount || 0,
      order.totalAmount,
      order.currency || 'NGN',
      order.paymentMethod,
      order.paymentStatus,
      order.orderStatus,
      new Date(order.createdAt || Date.now()).toISOString(),
      new Date(order.updatedAt || Date.now()).toISOString()
    );

    if (items && items.length > 0) {
      const itmStmt = this.db.prepare(`
        INSERT OR REPLACE INTO order_items (
          id, orderId, productId, productNameSnapshot, skuSnapshot,
          unitPrice, quantity, lineTotal, selectedOptionsSnapshot, productImageSnapshot, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      items.forEach((it) => {
        itmStmt.run(
          it.id,
          order.id,
          it.productId,
          it.productNameSnapshot,
          it.skuSnapshot,
          it.unitPrice,
          it.quantity,
          it.lineTotal,
          JSON.stringify(it.selectedOptionsSnapshot || {}),
          it.productImageSnapshot || null,
          new Date(it.createdAt || Date.now()).toISOString()
        );
      });
    }
  }

  public updateOrderStatus(orderId: string, orderStatus: string, paymentStatus?: string) {
    if (paymentStatus) {
      const stmt = this.db.prepare(`
        UPDATE orders SET orderStatus = ?, paymentStatus = ?, updatedAt = ? WHERE id = ?
      `);
      stmt.run(orderStatus, paymentStatus, new Date().toISOString(), orderId);
    } else {
      const stmt = this.db.prepare(`
        UPDATE orders SET orderStatus = ?, updatedAt = ? WHERE id = ?
      `);
      stmt.run(orderStatus, new Date().toISOString(), orderId);
    }
  }

  public savePaymentSubmission(sub: any) {
    if (!this.db) return;
    const stmt = this.db.prepare(`
      INSERT INTO payment_submissions (
        id, orderId, orderNumber, submittedAmount, receiptFilePath,
        paymentReference, notes, verificationStatus, rejectionReason, reviewedBy, reviewedAt, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        verificationStatus = excluded.verificationStatus,
        rejectionReason = excluded.rejectionReason,
        reviewedBy = excluded.reviewedBy,
        reviewedAt = excluded.reviewedAt
    `);
    stmt.run(
      sub.id,
      sub.orderId,
      sub.orderNumber,
      sub.submittedAmount ?? null,
      sub.receiptFilePath || sub.receiptStorageKey || sub.originalFilename || 'receipt.jpg',
      sub.paymentReference ?? null,
      sub.notes ?? null,
      sub.verificationStatus || sub.status || 'pending',
      sub.rejectionReason ?? null,
      sub.reviewedBy ?? null,
      sub.reviewedAt ? new Date(sub.reviewedAt).toISOString() : null,
      new Date(sub.createdAt || Date.now()).toISOString()
    );
  }

  public saveOrderStatusHistory(h: any) {
    if (!this.db) return;
    const stmt = this.db.prepare(`
      INSERT INTO order_status_history (id, orderId, status, note, createdBy, createdAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      h.id,
      h.orderId,
      h.status || h.newStatus || 'pending_payment',
      h.note ?? null,
      h.createdBy || h.changedBy || 'System',
      new Date(h.createdAt || Date.now()).toISOString()
    );
  }

  public saveInventoryMovement(m: any) {
    const stmt = this.db.prepare(`
      INSERT INTO inventory_movements (id, productId, productName, quantityChange, movementType, reason, referenceId, createdBy, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      m.id,
      m.productId,
      m.productName || null,
      m.quantityChange,
      m.movementType,
      m.reason || null,
      m.referenceId || null,
      m.createdBy || 'System',
      new Date(m.createdAt || Date.now()).toISOString()
    );

    // Also update product stock quantity in SQLite
    const prod = this.db.prepare('SELECT stockQuantity FROM products WHERE id = ?').get(m.productId) as any;
    if (prod) {
      const newStock = Math.max(0, prod.stockQuantity + m.quantityChange);
      this.db.prepare('UPDATE products SET stockQuantity = ?, updatedAt = ? WHERE id = ?').run(
        newStock,
        new Date().toISOString(),
        m.productId
      );
    }
  }

  public saveStoreSetting(key: string, value: any) {
    const stmt = this.db.prepare(`
      INSERT INTO store_settings (key, valueJson, updatedAt)
      VALUES (?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET
        valueJson = excluded.valueJson,
        updatedAt = excluded.updatedAt
    `);
    stmt.run(key, JSON.stringify(value), new Date().toISOString());
  }

  public saveDiscount(d: any) {
    const stmt = this.db.prepare(`
      INSERT INTO discounts (id, code, description, discountType, discountValue, minOrderAmount, usageLimit, usageCount, startsAt, expiresAt, isActive, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        code = excluded.code,
        description = excluded.description,
        discountType = excluded.discountType,
        discountValue = excluded.discountValue,
        minOrderAmount = excluded.minOrderAmount,
        usageLimit = excluded.usageLimit,
        usageCount = excluded.usageCount,
        startsAt = excluded.startsAt,
        expiresAt = excluded.expiresAt,
        isActive = excluded.isActive
    `);
    stmt.run(
      d.id,
      d.code,
      d.description || null,
      d.discountType,
      d.discountValue,
      d.minOrderAmount || null,
      d.usageLimit || null,
      d.usageCount || 0,
      d.startsAt ? new Date(d.startsAt).toISOString() : null,
      d.expiresAt ? new Date(d.expiresAt).toISOString() : null,
      d.isActive ? 1 : 0,
      new Date(d.createdAt || Date.now()).toISOString()
    );
  }

  public saveAuditLog(l: any) {
    const stmt = this.db.prepare(`
      INSERT INTO audit_logs (id, actorId, actorName, action, resourceType, resourceId, metadataJson, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      l.id,
      l.actorId,
      l.actorName,
      l.action,
      l.resourceType,
      l.resourceId,
      JSON.stringify(l.metadata || {}),
      new Date(l.createdAt || Date.now()).toISOString()
    );
  }

  public saveNotification(n: any) {
    const stmt = this.db.prepare(`
      INSERT INTO notifications (id, title, message, type, read, createdAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      n.id,
      n.title,
      n.message,
      n.type || 'info',
      n.read ? 1 : 0,
      new Date(n.createdAt || Date.now()).toISOString()
    );
  }

  public saveNewsletter(email: string) {
    const stmt = this.db.prepare(`
      INSERT OR IGNORE INTO newsletter (email, createdAt)
      VALUES (?, ?)
    `);
    stmt.run(email.toLowerCase(), new Date().toISOString());
  }
}
