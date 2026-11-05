export const ORDER_STATUS = {
  PENDING_PAYMENT: 'pending_payment',
  PAYMENT_REVIEW: 'payment_review',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  READY_FOR_DISPATCH: 'ready_for_dispatch',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export const PAYMENT_STATUS = {
  UNPAID: 'unpaid',
  PENDING_VERIFICATION: 'pending_verification',
  PARTIALLY_PAID: 'partially_paid',
  PAID: 'paid',
  REJECTED: 'rejected',
  REFUNDED: 'refunded',
} as const;

export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

export const PAYMENT_METHOD = {
  BANK_TRANSFER: 'bank_transfer',
  WHATSAPP: 'whatsapp',
} as const;

export type PaymentMethod = (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD];

export const PRODUCT_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
} as const;

export type ProductStatus = (typeof PRODUCT_STATUS)[keyof typeof PRODUCT_STATUS];

export const USER_ROLE = {
  ADMIN: 'admin',
  STAFF: 'staff',
  CUSTOMER: 'customer',
} as const;

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

export const INVENTORY_MOVEMENT_TYPE = {
  INITIAL_STOCK: 'initial_stock',
  RESTOCK: 'restock',
  SALE: 'sale',
  MANUAL_ADJUSTMENT: 'manual_adjustment',
  ORDER_CANCELLATION: 'order_cancellation',
} as const;

export type InventoryMovementType = (typeof INVENTORY_MOVEMENT_TYPE)[keyof typeof INVENTORY_MOVEMENT_TYPE];

export const CATEGORY_SLUGS = {
  WATCHES: 'watches',
  JEWELLERY: 'jewellery',
  PERFUMES: 'perfumes',
  GIFT_SETS: 'gift-sets',
} as const;

export const GIFT_OCCASIONS = [
  { id: 'anniversary', label: 'Anniversary' },
  { id: 'birthday', label: 'Birthday' },
  { id: 'wedding', label: 'Weddings & Engagements' },
  { id: 'valentines', label: "Valentine's Day" },
  { id: 'celebration', label: 'Milestones & Celebrations' },
  { id: 'self_treat', label: 'Personal Indulgence' },
  { id: 'corporate', label: 'Corporate & Executive Gifts' },
] as const;

export const DEFAULT_STORE_SETTINGS = {
  store_name: 'MagnifiScent',
  tagline: 'Made to Be Remembered',
  support_email: 'concierge@magnifiscent.site',
  whatsapp_number: '+2348000000000',
  whatsapp_enabled: true,
  currency: 'NGN',
  currency_symbol: '₦',
  announcement: {
    enabled: true,
    text: 'Complimentary white-glove presentation box included with every curated order.',
    link: '/gift-sets',
  },
  bank_details: {
    enabled: true,
    bank_name: 'Zenith Bank PLC',
    account_name: 'MagnifiScent Luxury Retail Ltd',
    account_number: '1012345678',
    instructions: 'Please transfer the exact order amount using your Order Reference as the payment narration. Once transferred, submit your payment receipt for instant priority review.',
    deadline_hours: 24,
  },
  shipping: {
    standard_fee: 3500,
    express_fee: 7000,
    free_shipping_threshold: 150000,
    estimated_days_standard: '2-4 business days across Nigeria',
    estimated_days_express: 'Next day delivery (Lagos & Abuja)',
  },
  hero: {
    headline: 'Made to Be Remembered.',
    subheading: 'Discover horology, fine jewellery, artisanal perfumes, and bespoke gift edits crafted to elevate every meaningful chapter.',
    primary_cta_text: 'Explore Catalog',
    primary_cta_link: '/shop',
    secondary_cta_text: 'Curated Gifts',
    secondary_cta_link: '/gift-sets',
  },
};
