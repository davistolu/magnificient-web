import { OrderStatus, PaymentStatus, PaymentMethod, ProductStatus, UserRole, InventoryMovementType } from '../constants/index.js';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl?: string;
  isActive: boolean;
  displayOrder: number;
  productCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: string;
  productId: string;
  imageUrl: string;
  altText: string;
  displayOrder: number;
  isPrimary: boolean;
}

export interface ProductSpecification {
  key: string;
  label: string;
  value: string;
}

export interface Product {
  id: string;
  categoryId: string;
  category?: Category;
  name: string;
  slug: string;
  sku: string;
  shortDescription: string;
  description: string;
  price: number;
  compareAtPrice?: number | null;
  stockQuantity: number;
  lowStockThreshold: number;
  status: ProductStatus;
  isFeatured: boolean;
  brand?: string;
  images: ProductImage[];
  specifications: Record<string, string | number | boolean>;
  tags?: string[];
  occasion?: string[];
  gender?: 'unisex' | 'men' | 'women';
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  imageUrl: string;
  quantity: number;
  maxStock: number;
  selectedOptions?: Record<string, string>;
}

export interface CartSummary {
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  total: number;
  currency: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string | null;
  productNameSnapshot: string;
  skuSnapshot: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  selectedOptionsSnapshot?: Record<string, string>;
  productImageSnapshot?: string;
}

export interface PaymentSubmission {
  id: string;
  orderId: string;
  receiptStorageKey: string;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  submittedAmount?: number;
  paymentReference?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  signedUrl?: string; // transient short-lived url for review
}

export interface OrderStatusHistoryItem {
  id: string;
  orderId: string;
  previousStatus: OrderStatus | null;
  newStatus: OrderStatus;
  changedBy: string;
  note?: string;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  guestAccessToken: string;
  customerId?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryState: string;
  deliveryInstructions?: string;
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  totalAmount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  items?: OrderItem[];
  paymentSubmissions?: PaymentSubmission[];
  statusHistory?: OrderStatusHistoryItem[];
  createdAt: string;
  updatedAt: string;
}

export interface InventoryMovement {
  id: string;
  productId: string;
  productName?: string;
  quantityChange: number;
  movementType: InventoryMovementType;
  reason?: string;
  referenceId?: string;
  createdBy: string;
  createdAt: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  supportEmail: string;
  whatsappNumber: string;
  whatsappEnabled: boolean;
  currency: string;
  currencySymbol: string;
  announcement: {
    enabled: boolean;
    text: string;
    link: string;
  };
  bankDetails: {
    enabled: boolean;
    bankName: string;
    accountName: string;
    accountNumber: string;
    instructions: string;
    deadlineHours: number;
  };
  shipping: {
    standardFee: number;
    expressFee: number;
    freeShippingThreshold: number;
    estimatedDaysStandard: string;
    estimatedDaysExpress: string;
  };
  hero: {
    headline: string;
    subheading: string;
    primaryCtaText: string;
    primaryCtaLink: string;
    secondaryCtaText: string;
    secondaryCtaLink: string;
  };
}

export interface Discount {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  usageLimit?: number;
  usageCount: number;
  isActive: boolean;
  expiresAt?: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  resourceType: string;
  resourceId: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  recipientRole?: UserRole;
  title: string;
  message: string;
  type: 'order' | 'payment' | 'inventory' | 'system';
  isRead: boolean;
  orderId?: string;
  createdAt: string;
}
