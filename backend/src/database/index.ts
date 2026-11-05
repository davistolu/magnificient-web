import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.js';
import { config } from '../config/index.js';
import { INITIAL_ADMIN, INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_DISCOUNTS } from './seed-data.js';
import { DEFAULT_STORE_SETTINGS } from '../shared/index.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const isUuid = (val?: string | null): boolean => Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val));

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
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 15000,
    });

    pool.on('error', (err) => {
      console.warn('[Database Pool Warning]:', err.message);
    });

    db = drizzle(pool, { schema });
    console.log('[Database] Connected to Neon PostgreSQL engine.');
  }
} catch (err) {
  console.warn('[Database] PostgreSQL pool init failed:', (err as Error).message);
}

// 100% PostgreSQL-Backed Enterprise Store
export class DataStore {
  users: any[] = [];
  categories: any[] = [...INITIAL_CATEGORIES];
  products: any[] = [...INITIAL_PRODUCTS];
  productImages: any[] = INITIAL_PRODUCTS.flatMap((p) =>
    (p.images || []).map((img: any, i: number) => ({
      id: `img-${p.id}-${i}`,
      productId: p.id,
      imageUrl: img.imageUrl,
      altText: img.altText,
      displayOrder: img.displayOrder || i,
      isPrimary: Boolean(img.isPrimary),
      createdAt: new Date(),
    }))
  );
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
  private isLoaded = false;
  private initPromise: Promise<void> | null = null;

  constructor() {
    this.ensureInitialized().catch(() => {});
  }

  public async ensureInitialized(): Promise<void> {
    if (this.isLoaded) return;
    if (!this.initPromise) {
      this.initPromise = (async () => {
        if (pool) {
          try {
            await this.loadFromPostgres();
            this.isLoaded = true;
          } catch (err) {
            console.warn('[Database] PostgreSQL sync notice (serving active baseline):', (err as Error).message);
            // Clear initPromise so subsequent requests can re-attempt PostgreSQL sync
            this.initPromise = null;
          }
        }
      })();
    }
    await this.initPromise;
  }

  public async initStore() {
    await this.ensureInitialized();
  }

  public async loadFromPostgres() {
    if (!pool) return;
    const client = await pool.connect();
    try {
      // 1. Users
      const usersRes = await client.query(`
        SELECT id, full_name as "fullName", email, phone, password_hash as "passwordHash",
               role, is_active as "isActive", created_at as "createdAt", updated_at as "updatedAt"
        FROM users ORDER BY created_at ASC
      `);
      this.users = usersRes.rows.map((u) => ({
        ...u,
        isActive: Boolean(u.isActive),
      }));

      // 2. Categories
      let catRes = await client.query(`
        SELECT id, name, slug, description, image_url as "imageUrl",
               is_active as "isActive", display_order as "displayOrder",
               created_at as "createdAt", updated_at as "updatedAt"
        FROM categories ORDER BY display_order ASC
      `);

      // If categories table in PostgreSQL is empty, auto-populate the core luxury categories
      if (catRes.rows.length === 0) {
        console.log('[Database] Categories table empty in PostgreSQL. Initializing core luxury taxonomy...');
        for (const cat of INITIAL_CATEGORIES) {
          await client.query(`
            INSERT INTO categories (name, slug, description, image_url, display_order, is_active)
            VALUES ($1, $2, $3, $4, $5, true)
            ON CONFLICT (slug) DO UPDATE SET
              name = EXCLUDED.name,
              description = EXCLUDED.description,
              image_url = EXCLUDED.image_url,
              display_order = EXCLUDED.display_order
          `, [cat.name, cat.slug, cat.description, cat.imageUrl, cat.displayOrder]);
        }

        catRes = await client.query(`
          SELECT id, name, slug, description, image_url as "imageUrl",
                 is_active as "isActive", display_order as "displayOrder",
                 created_at as "createdAt", updated_at as "updatedAt"
          FROM categories ORDER BY display_order ASC
        `);
      }

      this.categories = catRes.rows.map((c) => ({
        ...c,
        isActive: Boolean(c.isActive),
      }));

      // 3. Products
      const prodRes = await client.query(`
        SELECT id, category_id as "categoryId", name, slug, sku, short_description as "shortDescription",
               description, price::float, compare_at_price::float as "compareAtPrice",
               stock_quantity as "stockQuantity", low_stock_threshold as "lowStockThreshold",
               status, is_featured as "isFeatured", brand, gender, specifications, tags, occasion,
               seo_title as "seoTitle", seo_description as "seoDescription",
               created_at as "createdAt", updated_at as "updatedAt"
        FROM products ORDER BY created_at DESC
      `);
      this.products = prodRes.rows.map((p) => ({
        ...p,
        isFeatured: Boolean(p.isFeatured),
        specifications: typeof p.specifications === 'string' ? JSON.parse(p.specifications) : (p.specifications || {}),
        tags: typeof p.tags === 'string' ? JSON.parse(p.tags) : (p.tags || []),
        occasion: typeof p.occasion === 'string' ? JSON.parse(p.occasion) : (p.occasion || []),
      }));

      // 4. Product Images
      const imgRes = await client.query(`
        SELECT id, product_id as "productId", image_url as "imageUrl", alt_text as "altText",
               display_order as "displayOrder", is_primary as "isPrimary", created_at as "createdAt"
        FROM product_images ORDER BY display_order ASC
      `);
      this.productImages = imgRes.rows.map((img) => ({
        ...img,
        isPrimary: Boolean(img.isPrimary),
      }));

      // 5. Orders
      const orderRes = await client.query(`
        SELECT id, order_number as "orderNumber", guest_access_token as "guestAccessToken",
               customer_id as "customerId", customer_name as "customerName", customer_email as "customerEmail",
               customer_phone as "customerPhone", delivery_address as "deliveryAddress",
               delivery_city as "deliveryCity", delivery_state as "deliveryState",
               delivery_instructions as "deliveryInstructions", subtotal::float,
               discount_amount::float as "discountAmount", shipping_amount::float as "shippingAmount",
               total_amount::float as "totalAmount", currency, payment_method as "paymentMethod",
               payment_status as "paymentStatus", order_status as "orderStatus",
               created_at as "createdAt", updated_at as "updatedAt"
        FROM orders ORDER BY created_at DESC
      `);
      this.orders = orderRes.rows;

      // 6. Order Items
      const itemsRes = await client.query(`
        SELECT id, order_id as "orderId", product_id as "productId",
               product_name_snapshot as "productNameSnapshot", sku_snapshot as "skuSnapshot",
               unit_price::float as "unitPrice", quantity, line_total::float as "lineTotal",
               selected_options_snapshot as "selectedOptionsSnapshot",
               product_image_snapshot as "productImageSnapshot", created_at as "createdAt"
        FROM order_items ORDER BY created_at ASC
      `);
      this.orderItems = itemsRes.rows;

      // 7. Payment Submissions
      const payRes = await client.query(`
        SELECT id, order_id as "orderId", receipt_storage_key as "receiptStorageKey",
               original_filename as "originalFilename", mime_type as "mimeType",
               file_size as "fileSize", submitted_amount::float as "submittedAmount",
               payment_reference as "paymentReference", status, rejection_reason as "rejectionReason",
               reviewed_by as "reviewedBy", reviewed_at as "reviewedAt",
               created_at as "createdAt", updated_at as "updatedAt"
        FROM payment_submissions ORDER BY created_at DESC
      `);
      this.paymentSubmissions = payRes.rows;

      // 8. Order Status History
      const histRes = await client.query(`
        SELECT id, order_id as "orderId", previous_status as "previousStatus",
               new_status as "newStatus", changed_by as "changedBy", note, created_at as "createdAt"
        FROM order_status_history ORDER BY created_at ASC
      `);
      this.orderStatusHistory = histRes.rows;

      // 9. Inventory Movements
      const invRes = await client.query(`
        SELECT id, product_id as "productId", quantity_change as "quantityChange",
               movement_type as "movementType", reason, reference_id as "referenceId",
               created_by as "createdBy", created_at as "createdAt"
        FROM inventory_movements ORDER BY created_at DESC
      `);
      this.inventoryMovements = invRes.rows;

      // 10. Store Settings
      const setRes = await client.query(`SELECT key, value FROM store_settings`);
      this.storeSettings.clear();
      for (const row of setRes.rows) {
        this.storeSettings.set(row.key, typeof row.value === 'string' ? JSON.parse(row.value) : row.value);
      }

      // 11. Discounts
      const discRes = await client.query(`
        SELECT id, code, discount_type as "discountType", discount_value::float as "discountValue",
               min_order_amount::float as "minOrderAmount", usage_limit as "usageLimit",
               usage_count as "usageCount", is_active as "isActive", expires_at as "expiresAt",
               created_at as "createdAt"
        FROM discounts ORDER BY created_at DESC
      `);
      this.discounts = discRes.rows.map((d) => ({
        ...d,
        isActive: Boolean(d.isActive),
      }));

      // 12. Audit Logs
      const audRes = await client.query(`
        SELECT id, actor_id as "actorId", actor_name as "actorName", action,
               resource_type as "resourceType", resource_id as "resourceId",
               metadata, created_at as "createdAt"
        FROM audit_logs ORDER BY created_at DESC LIMIT 100
      `);
      this.auditLogs = audRes.rows;

      // 13. Notifications
      const notifRes = await client.query(`
        SELECT id, recipient_role as "recipientRole", title, message, type,
               is_read as "isRead", order_id as "orderId", created_at as "createdAt"
        FROM notifications ORDER BY created_at DESC LIMIT 100
      `);
      this.notifications = notifRes.rows.map((n) => ({
        ...n,
        isRead: Boolean(n.isRead),
      }));

      console.log(`[Database] PostgreSQL sync complete: ${this.users.length} users, ${this.products.length} products, ${this.categories.length} categories, ${this.orders.length} orders.`);
    } finally {
      client.release();
    }
  }

  // --- WRITE-THROUGH POSTGRESQL MUTATIONS ---

  public async saveUser(user: any) {
    const userId = isUuid(user.id) ? user.id : crypto.randomUUID();
    user.id = userId;

    const idx = this.users.findIndex((u) => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
    if (idx >= 0) {
      this.users[idx] = { ...this.users[idx], ...user };
    } else {
      this.users.push(user);
    }

    if (pool) {
      try {
        await pool.query(`
          INSERT INTO users (id, full_name, email, phone, password_hash, role, is_active, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
          ON CONFLICT (email) DO UPDATE SET
            full_name = EXCLUDED.full_name,
            phone = EXCLUDED.phone,
            password_hash = EXCLUDED.password_hash,
            role = EXCLUDED.role,
            is_active = EXCLUDED.is_active,
            updated_at = NOW()
        `, [userId, user.fullName, user.email.toLowerCase(), user.phone || null, user.passwordHash, user.role, user.isActive]);
      } catch (err) {
        console.error('[Postgres saveUser Error]:', (err as Error).message);
        throw err;
      }
    }
  }

  public async deleteUser(id: string) {
    this.users = this.users.filter((u) => u.id !== id);
    if (pool) {
      try {
        await pool.query('DELETE FROM users WHERE id = $1', [id]);
      } catch (err) {
        console.error('[Postgres deleteUser Error]:', (err as Error).message);
        throw err;
      }
    }
  }

  public async saveCategory(category: any) {
    const catId = isUuid(category.id) ? category.id : crypto.randomUUID();
    category.id = catId;

    const idx = this.categories.findIndex((c) => c.id === category.id || c.slug === category.slug);
    if (idx >= 0) {
      this.categories[idx] = { ...this.categories[idx], ...category };
    } else {
      this.categories.push(category);
    }

    if (pool) {
      try {
        await pool.query(`
          INSERT INTO categories (id, name, slug, description, image_url, is_active, display_order, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
          ON CONFLICT (slug) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            image_url = EXCLUDED.image_url,
            is_active = EXCLUDED.is_active,
            display_order = EXCLUDED.display_order,
            updated_at = NOW()
        `, [catId, category.name, category.slug, category.description, category.imageUrl || null, category.isActive ?? true, category.displayOrder || 0]);
      } catch (err) {
        console.error('[Postgres saveCategory Error]:', (err as Error).message);
        throw err;
      }
    }
  }

  public async saveProduct(product: any, images: any[] = []) {
    const finalProductId = isUuid(product.id) ? product.id : crypto.randomUUID();
    product.id = finalProductId;

    // Resolve categoryId to a valid database UUID if possible
    let finalCategoryId: string | null = null;
    if (isUuid(product.categoryId)) {
      finalCategoryId = product.categoryId;
    } else if (product.categoryId) {
      const matched = this.categories.find(
        (c) => c.id === product.categoryId ||
               c.slug === product.categoryId ||
               c.slug === String(product.categoryId).replace('cat-', '')
      );
      if (matched && isUuid(matched.id)) {
        finalCategoryId = matched.id;
      }
    }

    const idx = this.products.findIndex((p) => p.id === product.id);
    if (idx >= 0) {
      this.products[idx] = { ...this.products[idx], ...product };
    } else {
      this.products.unshift(product);
    }

    if (images && images.length > 0) {
      this.productImages = this.productImages.filter((img) => img.productId !== finalProductId);
      images.forEach((img, i) => {
        const imgId = isUuid(img.id) ? img.id : crypto.randomUUID();
        this.productImages.push({
          id: imgId,
          productId: finalProductId,
          imageUrl: img.imageUrl,
          altText: img.altText || 'Product photograph',
          displayOrder: img.displayOrder || i,
          isPrimary: Boolean(img.isPrimary),
          createdAt: new Date(),
        });
      });
    }

    if (pool) {
      try {
        const client = await pool.connect();
        try {
          await client.query('BEGIN');
          await client.query(`
            INSERT INTO products (
              id, category_id, name, slug, sku, short_description, description,
              price, compare_at_price, stock_quantity, low_stock_threshold,
              status, is_featured, brand, gender, specifications, tags, occasion,
              seo_title, seo_description, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, NOW())
            ON CONFLICT (slug) DO UPDATE SET
              category_id = EXCLUDED.category_id,
              name = EXCLUDED.name,
              sku = EXCLUDED.sku,
              short_description = EXCLUDED.short_description,
              description = EXCLUDED.description,
              price = EXCLUDED.price,
              compare_at_price = EXCLUDED.compare_at_price,
              stock_quantity = EXCLUDED.stock_quantity,
              low_stock_threshold = EXCLUDED.low_stock_threshold,
              status = EXCLUDED.status,
              is_featured = EXCLUDED.is_featured,
              brand = EXCLUDED.brand,
              gender = EXCLUDED.gender,
              specifications = EXCLUDED.specifications,
              tags = EXCLUDED.tags,
              occasion = EXCLUDED.occasion,
              seo_title = EXCLUDED.seo_title,
              seo_description = EXCLUDED.seo_description,
              updated_at = NOW()
          `, [
            finalProductId, finalCategoryId, product.name, product.slug, product.sku,
            product.shortDescription, product.description, product.price, product.compareAtPrice || null,
            product.stockQuantity, product.lowStockThreshold, product.status || 'published',
            Boolean(product.isFeatured), product.brand || null, product.gender || null,
            JSON.stringify(product.specifications || {}), JSON.stringify(product.tags || []),
            JSON.stringify(product.occasion || []), product.seoTitle || null, product.seoDescription || null
          ]);

          if (images && images.length > 0) {
            await client.query('DELETE FROM product_images WHERE product_id = $1', [finalProductId]);
            for (let i = 0; i < images.length; i++) {
              const img = images[i];
              const imgId = isUuid(img.id) ? img.id : crypto.randomUUID();
              await client.query(`
                INSERT INTO product_images (id, product_id, image_url, alt_text, display_order, is_primary)
                VALUES ($1, $2, $3, $4, $5, $6)
              `, [imgId, finalProductId, img.imageUrl, img.altText || 'Product photograph', img.displayOrder || i, Boolean(img.isPrimary)]);
            }
          }
          await client.query('COMMIT');
        } catch (txErr) {
          await client.query('ROLLBACK');
          console.warn('[Postgres saveProduct Warning]:', (txErr as Error).message);
        } finally {
          client.release();
        }
      } catch (poolErr) {
        console.warn('[Postgres saveProduct connect error]:', (poolErr as Error).message);
      }
    }
  }

  // INSTANT PERMANENT PRODUCT DELETION
  public async deleteProduct(id: string): Promise<boolean> {
    // 1. Remove from in-memory cache
    this.products = this.products.filter((p) => p.id !== id);
    this.productImages = this.productImages.filter((img) => img.productId !== id);
    this.inventoryMovements = this.inventoryMovements.filter((m) => m.productId !== id);

    // 2. Remove permanently from Neon PostgreSQL
    if (pool) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query('DELETE FROM product_images WHERE product_id = $1', [id]);
        await client.query('DELETE FROM inventory_movements WHERE product_id = $1', [id]);
        await client.query('DELETE FROM order_items WHERE product_id = $1', [id]);
        const delRes = await client.query('DELETE FROM products WHERE id = $1', [id]);
        await client.query('COMMIT');
        console.log(`[Database] Permanently deleted product ${id} from PostgreSQL (${delRes.rowCount} rows).`);
        return true;
      } catch (err) {
        await client.query('ROLLBACK');
        console.warn('[Postgres deleteProduct error]:', (err as Error).message);
        throw err;
      } finally {
        client.release();
      }
    }
    return true;
  }

  public async saveOrder(order: any, items: any[] = []) {
    const finalOrderId = isUuid(order.id) ? order.id : crypto.randomUUID();
    order.id = finalOrderId;
    const finalCustomerId = isUuid(order.customerId) ? order.customerId : null;

    const idx = this.orders.findIndex((o) => o.id === order.id);
    if (idx >= 0) {
      this.orders[idx] = { ...this.orders[idx], ...order };
    } else {
      this.orders.unshift(order);
    }

    if (items && items.length > 0) {
      this.orderItems = this.orderItems.filter((it) => it.orderId !== finalOrderId);
      items.forEach((it) => {
        it.id = isUuid(it.id) ? it.id : crypto.randomUUID();
        it.orderId = finalOrderId;
        it.productId = isUuid(it.productId) ? it.productId : null;
        this.orderItems.push(it);
      });
    }

    if (pool) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query(`
          INSERT INTO orders (
            id, order_number, guest_access_token, customer_id, customer_name,
            customer_email, customer_phone, delivery_address, delivery_city,
            delivery_state, delivery_instructions, subtotal, discount_amount,
            shipping_amount, total_amount, currency, payment_method,
            payment_status, order_status, updated_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, NOW())
          ON CONFLICT (id) DO UPDATE SET
            payment_status = EXCLUDED.payment_status,
            order_status = EXCLUDED.order_status,
            updated_at = NOW()
        `, [
          finalOrderId, order.orderNumber, order.guestAccessToken, finalCustomerId,
          order.customerName, order.customerEmail, order.customerPhone, order.deliveryAddress,
          order.deliveryCity, order.deliveryState, order.deliveryInstructions || null,
          order.subtotal, order.discountAmount || 0, order.shippingAmount || 0,
          order.totalAmount, order.currency || 'NGN', order.paymentMethod,
          order.paymentStatus || 'unpaid', order.orderStatus || 'pending_payment'
        ]);

        if (items && items.length > 0) {
          for (const item of items) {
            const itemId = isUuid(item.id) ? item.id : crypto.randomUUID();
            const prodId = isUuid(item.productId) ? item.productId : null;
            await client.query(`
              INSERT INTO order_items (
                id, order_id, product_id, product_name_snapshot, sku_snapshot,
                unit_price, quantity, line_total, selected_options_snapshot,
                product_image_snapshot
              )
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
              ON CONFLICT (id) DO NOTHING
            `, [
              itemId,
              finalOrderId, prodId, item.productNameSnapshot, item.skuSnapshot,
              item.unitPrice, item.quantity, item.lineTotal,
              item.selectedOptionsSnapshot ? JSON.stringify(item.selectedOptionsSnapshot) : null,
              item.productImageSnapshot || null
            ]);
          }
        }
        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
        console.error('[Postgres saveOrder Error]:', (err as Error).message);
        throw err;
      } finally {
        client.release();
      }
    }
  }

  public async updateOrderStatus(orderId: string, orderStatus: string, paymentStatus?: string) {
    const order = this.orders.find((o) => o.id === orderId || o.orderNumber === orderId);
    const dbOrderId = order?.id || orderId;
    if (order) {
      order.orderStatus = orderStatus;
      if (paymentStatus) order.paymentStatus = paymentStatus;
      order.updatedAt = new Date();
    }

    if (pool && isUuid(dbOrderId)) {
      try {
        if (paymentStatus) {
          await pool.query('UPDATE orders SET order_status = $1, payment_status = $2, updated_at = NOW() WHERE id = $3', [orderStatus, paymentStatus, dbOrderId]);
        } else {
          await pool.query('UPDATE orders SET order_status = $1, updated_at = NOW() WHERE id = $2', [orderStatus, dbOrderId]);
        }
      } catch (err) {
        console.error('[Postgres updateOrderStatus Error]:', (err as Error).message);
        throw err;
      }
    }
  }

  public async savePaymentSubmission(sub: any) {
    const subId = isUuid(sub.id) ? sub.id : crypto.randomUUID();
    sub.id = subId;

    if (!isUuid(sub.orderId)) {
      const ord = this.orders.find((o) => o.orderNumber === sub.orderId || o.id === sub.orderId);
      if (ord && isUuid(ord.id)) {
        sub.orderId = ord.id;
      }
    }

    const idx = this.paymentSubmissions.findIndex((s) => s.id === sub.id);
    if (idx >= 0) {
      this.paymentSubmissions[idx] = { ...this.paymentSubmissions[idx], ...sub };
    } else {
      this.paymentSubmissions.unshift(sub);
    }

    if (pool && isUuid(sub.orderId)) {
      try {
        await pool.query(`
          INSERT INTO payment_submissions (
            id, order_id, receipt_storage_key, original_filename, mime_type,
            file_size, submitted_amount, payment_reference, status, rejection_reason,
            reviewed_by, reviewed_at, updated_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
          ON CONFLICT (id) DO UPDATE SET
            status = EXCLUDED.status,
            rejection_reason = EXCLUDED.rejection_reason,
            reviewed_by = EXCLUDED.reviewed_by,
            reviewed_at = EXCLUDED.reviewed_at,
            updated_at = NOW()
        `, [
          subId, sub.orderId, sub.receiptStorageKey, sub.originalFilename, sub.mimeType,
          sub.fileSize, sub.submittedAmount, sub.paymentReference || null, sub.status,
          sub.rejectionReason || null, sub.reviewedBy || null, sub.reviewedAt || null
        ]);
      } catch (err) {
        console.error('[Postgres savePaymentSubmission Error]:', (err as Error).message);
        throw err;
      }
    }
  }

  public async saveOrderStatusHistory(h: any) {
    const histId = isUuid(h.id) ? h.id : crypto.randomUUID();
    h.id = histId;

    if (!isUuid(h.orderId)) {
      const ord = this.orders.find((o) => o.orderNumber === h.orderId || o.id === h.orderId);
      if (ord && isUuid(ord.id)) {
        h.orderId = ord.id;
      }
    }

    this.orderStatusHistory.push(h);
    if (pool && isUuid(h.orderId)) {
      try {
        await pool.query(`
          INSERT INTO order_status_history (id, order_id, previous_status, new_status, changed_by, note)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [histId, h.orderId, h.previousStatus || null, h.newStatus, h.changedBy, h.note || null]);
      } catch (err) {
        console.error('[Postgres saveOrderStatusHistory Error]:', (err as Error).message);
      }
    }
  }

  public async saveInventoryMovement(m: any) {
    const movementId = isUuid(m.id) ? m.id : crypto.randomUUID();
    m.id = movementId;
    const prodId = isUuid(m.productId) ? m.productId : null;
    this.inventoryMovements.push(m);
    if (pool && prodId) {
      try {
        await pool.query(`
          INSERT INTO inventory_movements (id, product_id, quantity_change, movement_type, reason, reference_id, created_by)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [movementId, prodId, m.quantityChange, m.movementType, m.reason || null, m.referenceId || null, m.createdBy]);
      } catch (err) {
        console.error('[Postgres saveInventoryMovement Error]:', (err as Error).message);
      }
    }
  }

  public async saveStoreSetting(key: string, value: any) {
    this.storeSettings.set(key, value);
    if (pool) {
      try {
        await pool.query(`
          INSERT INTO store_settings (key, value, updated_at)
          VALUES ($1, $2, NOW())
          ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
        `, [key, JSON.stringify(value)]);
      } catch (err) {
        console.error('[Postgres saveStoreSetting Error]:', (err as Error).message);
        throw err;
      }
    }
  }

  public async saveDiscount(d: any) {
    const discId = isUuid(d.id) ? d.id : crypto.randomUUID();
    d.id = discId;
    const idx = this.discounts.findIndex((disc) => disc.id === d.id || disc.code === d.code);
    if (idx >= 0) {
      this.discounts[idx] = { ...this.discounts[idx], ...d };
    } else {
      this.discounts.push(d);
    }
    if (pool) {
      try {
        await pool.query(`
          INSERT INTO discounts (id, code, discount_type, discount_value, min_order_amount, usage_limit, usage_count, is_active)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (code) DO UPDATE SET
            discount_type = EXCLUDED.discount_type,
            discount_value = EXCLUDED.discount_value,
            min_order_amount = EXCLUDED.min_order_amount,
            usage_limit = EXCLUDED.usage_limit,
            usage_count = EXCLUDED.usage_count,
            is_active = EXCLUDED.is_active
        `, [discId, d.code, d.discountType, d.discountValue, d.minOrderAmount || null, d.usageLimit || null, d.usageCount || 0, d.isActive ?? true]);
      } catch (err) {
        console.error('[Postgres saveDiscount Error]:', (err as Error).message);
        throw err;
      }
    }
  }

  public async saveAuditLog(l: any) {
    const auditId = isUuid(l.id) ? l.id : crypto.randomUUID();
    l.id = auditId;
    this.auditLogs.unshift(l);
    if (pool) {
      try {
        await pool.query(`
          INSERT INTO audit_logs (id, actor_id, actor_name, action, resource_type, resource_id, metadata)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [auditId, l.actorId, l.actorName, l.action, l.resourceType, l.resourceId, l.metadata ? JSON.stringify(l.metadata) : null]);
      } catch (err) {
        console.warn('[Postgres saveAuditLog Warning]:', (err as Error).message);
      }
    }
  }

  public async saveNotification(n: any) {
    const notifId = isUuid(n.id) ? n.id : crypto.randomUUID();
    n.id = notifId;
    this.notifications.unshift(n);
    if (pool) {
      try {
        await pool.query(`
          INSERT INTO notifications (id, recipient_role, title, message, type, is_read, order_id)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [notifId, n.recipientRole || 'admin', n.title, n.message, n.type, Boolean(n.isRead), n.orderId || null]);
      } catch (err) {
        console.warn('[Postgres saveNotification Warning]:', (err as Error).message);
      }
    }
  }

  public async saveNewsletter(email: string) {
    this.newsletter.add(email.toLowerCase());
  }

  seed(clearOrders = false) {
    // Used during initial database bootstrap
  }
}

export const store = new DataStore();
