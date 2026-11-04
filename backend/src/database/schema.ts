import { pgTable, text, timestamp, boolean, integer, numeric, jsonb, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  fullName: text('full_name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull().default('customer'), // 'admin' | 'staff' | 'customer'
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Categories
export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description').notNull(),
  imageUrl: text('image_url'),
  isActive: boolean('is_active').notNull().default(true),
  displayOrder: integer('display_order').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Products
export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'set null' }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  sku: text('sku').notNull().unique(),
  shortDescription: text('short_description').notNull(),
  description: text('description').notNull(),
  price: numeric('price', { precision: 12, scale: 2 }).notNull(),
  compareAtPrice: numeric('compare_at_price', { precision: 12, scale: 2 }),
  stockQuantity: integer('stock_quantity').notNull().default(0),
  lowStockThreshold: integer('low_stock_threshold').notNull().default(3),
  status: text('status').notNull().default('published'), // 'draft' | 'published' | 'archived'
  isFeatured: boolean('is_featured').notNull().default(false),
  brand: text('brand'),
  gender: text('gender'),
  specifications: jsonb('specifications').default({}).notNull(),
  tags: jsonb('tags').default([]).notNull(),
  occasion: jsonb('occasion').default([]).notNull(),
  seoTitle: text('seo_title'),
  seoDescription: text('seo_description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Product Images
export const productImages = pgTable('product_images', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  imageUrl: text('image_url').notNull(),
  altText: text('alt_text').default('Product photograph').notNull(),
  displayOrder: integer('display_order').notNull().default(0),
  isPrimary: boolean('is_primary').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Orders
export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderNumber: text('order_number').notNull().unique(),
  guestAccessToken: text('guest_access_token').notNull(),
  customerId: uuid('customer_id').references(() => users.id, { onDelete: 'set null' }),
  customerName: text('customer_name').notNull(),
  customerEmail: text('customer_email').notNull(),
  customerPhone: text('customer_phone').notNull(),
  deliveryAddress: text('delivery_address').notNull(),
  deliveryCity: text('delivery_city').notNull(),
  deliveryState: text('delivery_state').notNull(),
  deliveryInstructions: text('delivery_instructions'),
  subtotal: numeric('subtotal', { precision: 12, scale: 2 }).notNull(),
  discountAmount: numeric('discount_amount', { precision: 12, scale: 2 }).default('0').notNull(),
  shippingAmount: numeric('shipping_amount', { precision: 12, scale: 2 }).default('0').notNull(),
  totalAmount: numeric('total_amount', { precision: 12, scale: 2 }).notNull(),
  currency: text('currency').default('NGN').notNull(),
  paymentMethod: text('payment_method').notNull(), // 'bank_transfer' | 'whatsapp'
  paymentStatus: text('payment_status').notNull().default('unpaid'), // 'unpaid' | 'pending_verification' | 'paid' | 'rejected'
  orderStatus: text('order_status').notNull().default('pending_payment'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Order Items (Preserving snapshots of products at purchase time)
export const orderItems = pgTable('order_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'set null' }),
  productNameSnapshot: text('product_name_snapshot').notNull(),
  skuSnapshot: text('sku_snapshot').notNull(),
  unitPrice: numeric('unit_price', { precision: 12, scale: 2 }).notNull(),
  quantity: integer('quantity').notNull(),
  lineTotal: numeric('line_total', { precision: 12, scale: 2 }).notNull(),
  selectedOptionsSnapshot: jsonb('selected_options_snapshot'),
  productImageSnapshot: text('product_image_snapshot'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Payment Submissions (Receipts)
export const paymentSubmissions = pgTable('payment_submissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  receiptStorageKey: text('receipt_storage_key').notNull(),
  originalFilename: text('original_filename').notNull(),
  mimeType: text('mime_type').notNull(),
  fileSize: integer('file_size').notNull(),
  submittedAmount: numeric('submitted_amount', { precision: 12, scale: 2 }),
  paymentReference: text('payment_reference'),
  status: text('status').notNull().default('pending'), // 'pending' | 'approved' | 'rejected'
  rejectionReason: text('rejection_reason'),
  reviewedBy: text('reviewed_by'),
  reviewedAt: timestamp('reviewed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Order Status History (Auditable state timeline)
export const orderStatusHistory = pgTable('order_status_history', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  previousStatus: text('previous_status'),
  newStatus: text('new_status').notNull(),
  changedBy: text('changed_by').notNull(),
  note: text('note'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Inventory Movements
export const inventoryMovements = pgTable('inventory_movements', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  quantityChange: integer('quantity_change').notNull(),
  movementType: text('movement_type').notNull(), // 'initial_stock' | 'restock' | 'sale' | 'manual_adjustment' | 'order_cancellation'
  reason: text('reason'),
  referenceId: text('reference_id'),
  createdBy: text('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Store Settings
export const storeSettings = pgTable('store_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  key: text('key').notNull().unique(),
  value: jsonb('value').notNull(),
  updatedBy: text('updated_by'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Discounts
export const discounts = pgTable('discounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: text('code').notNull().unique(),
  discountType: text('discount_type').notNull(), // 'percentage' | 'fixed'
  discountValue: numeric('discount_value', { precision: 12, scale: 2 }).notNull(),
  minOrderAmount: numeric('min_order_amount', { precision: 12, scale: 2 }),
  usageLimit: integer('usage_limit'),
  usageCount: integer('usage_count').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Audit Logs
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  actorId: text('actor_id').notNull(),
  actorName: text('actor_name').notNull(),
  action: text('action').notNull(),
  resourceType: text('resource_type').notNull(),
  resourceId: text('resource_id').notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// In-App Notifications
export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  recipientRole: text('recipient_role').default('admin'),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type').notNull(), // 'order' | 'payment' | 'inventory' | 'system'
  isRead: boolean('is_read').default(false).notNull(),
  orderId: text('order_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Newsletter Subscriptions
export const newsletterSubscriptions = pgTable('newsletter_subscriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Drizzle Relations
export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  images: many(productImages),
  orderItems: many(orderItems),
  inventoryMovements: many(inventoryMovements),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(users, {
    fields: [orders.customerId],
    references: [users.id],
  }),
  items: many(orderItems),
  paymentSubmissions: many(paymentSubmissions),
  statusHistory: many(orderStatusHistory),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const paymentSubmissionsRelations = relations(paymentSubmissions, ({ one }) => ({
  order: one(orders, {
    fields: [paymentSubmissions.orderId],
    references: [orders.id],
  }),
}));
