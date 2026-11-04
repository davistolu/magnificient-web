import { z } from 'zod';
import { ORDER_STATUS, PAYMENT_METHOD, PRODUCT_STATUS } from '../constants/index.js';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(8, 'Please enter a valid phone number').optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const checkoutItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().positive('Quantity must be at least 1'),
  selectedOptions: z.record(z.string()).optional(),
});

export const checkoutSchema = z.object({
  customerName: z.string().min(2, 'Full name is required'),
  customerEmail: z.string().email('Please enter a valid email address'),
  customerPhone: z.string().min(7, 'Please provide a reachable phone number'),
  deliveryAddress: z.string().min(5, 'Delivery street address is required'),
  deliveryCity: z.string().min(2, 'City or town is required'),
  deliveryState: z.string().min(2, 'State is required'),
  deliveryInstructions: z.string().max(500).optional(),
  shippingMethod: z.enum(['standard', 'express']).default('standard'),
  paymentMethod: z.enum([PAYMENT_METHOD.BANK_TRANSFER, PAYMENT_METHOD.WHATSAPP]),
  discountCode: z.string().optional(),
  items: z.array(checkoutItemSchema).min(1, 'Your cart cannot be empty'),
});

export const receiptSubmissionSchema = z.object({
  orderNumber: z.string().min(1, 'Order reference is required'),
  submittedAmount: z.coerce.number().positive().optional(),
  paymentReference: z.string().max(100).optional(),
});

export const paymentVerificationSchema = z.object({
  submissionId: z.string().min(1, 'Submission ID is required'),
  action: z.enum(['approve', 'reject']),
  rejectionReason: z.string().optional(),
  confirmedAmount: z.number().positive().optional(),
}).refine(
  (data) => data.action !== 'reject' || (data.rejectionReason && data.rejectionReason.trim().length > 3),
  {
    message: 'A rejection reason of at least 4 characters is mandatory when rejecting a payment receipt',
    path: ['rejectionReason'],
  }
);

export const orderStatusUpdateSchema = z.object({
  status: z.enum([
    ORDER_STATUS.PENDING_PAYMENT,
    ORDER_STATUS.PAYMENT_REVIEW,
    ORDER_STATUS.CONFIRMED,
    ORDER_STATUS.PROCESSING,
    ORDER_STATUS.READY_FOR_DISPATCH,
    ORDER_STATUS.SHIPPED,
    ORDER_STATUS.DELIVERED,
    ORDER_STATUS.CANCELLED,
  ]),
  note: z.string().max(500).optional(),
});

export const stockAdjustmentSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantityChange: z.number().int().refine((val) => val !== 0, 'Quantity change cannot be 0'),
  reason: z.string().min(3, 'A clear reason for stock adjustment is required'),
});

export const productCreateSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  slug: z.string().min(2, 'Slug is required').optional(),
  sku: z.string().optional(),
  categoryId: z.string().min(1, 'Category is required'),
  shortDescription: z.string().min(5, 'Short description is required'),
  description: z.string().min(10, 'Full description is required'),
  price: z.coerce.number().positive('Price must be greater than 0'),
  compareAtPrice: z.coerce.number().positive().optional().nullable(),
  stockQuantity: z.coerce.number().int().min(0, 'Stock cannot be negative'),
  lowStockThreshold: z.coerce.number().int().min(0).default(3),
  status: z.enum([PRODUCT_STATUS.DRAFT, PRODUCT_STATUS.PUBLISHED, PRODUCT_STATUS.ARCHIVED]).default(PRODUCT_STATUS.PUBLISHED),
  isFeatured: z.boolean().default(false),
  brand: z.string().optional(),
  specifications: z.record(z.any()).default({}),
  images: z.array(z.object({
    imageUrl: z.string().min(1, 'Image URL is required'),
    altText: z.string().default('Product photo'),
    displayOrder: z.number().default(0),
    isPrimary: z.boolean().default(false),
  })).min(1, 'At least one product image is required'),
});

export const newsletterSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});
