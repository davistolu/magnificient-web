import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const API_ROOT = fileURLToPath(new URL('../../', import.meta.url));

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  publicApiUrl: process.env.PUBLIC_API_URL || 'http://localhost:5000',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/magnifiscent',
  jwt: {
    secret: process.env.JWT_SECRET || 'magnifiscent-luxury-jwt-secret-key-32-chars-min',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  storage: {
    receiptsDir: process.env.RECEIPTS_DIR
      ? path.resolve(process.env.RECEIPTS_DIR)
      : path.join(API_ROOT, 'uploads', 'receipts'),
    productsDir: process.env.PRODUCTS_DIR
      ? path.resolve(process.env.PRODUCTS_DIR)
      : path.join(API_ROOT, 'uploads', 'products'),
    maxReceiptSizeMb: parseInt(process.env.MAX_RECEIPT_SIZE_MB || '10', 10),
  },
  s3: {
    bucket: process.env.S3_BUCKET_NAME || process.env.NEON_BUCKET_NAME || process.env.AWS_BUCKET_NAME || '',
    region: process.env.S3_REGION || process.env.NEON_REGION || process.env.AWS_REGION || 'auto',
    endpoint: process.env.S3_ENDPOINT || process.env.NEON_STORAGE_ENDPOINT || process.env.AWS_ENDPOINT || '',
    accessKeyId: process.env.S3_ACCESS_KEY_ID || process.env.NEON_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || process.env.NEON_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY || '',
    publicUrl: process.env.S3_PUBLIC_URL || process.env.MEDIA_PUBLIC_URL || '',
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
  },
  store: {
    name: process.env.STORE_NAME || 'MagnifiScent',
    currency: process.env.STORE_CURRENCY || 'NGN',
    supportEmail: process.env.SUPPORT_EMAIL || 'concierge@magnifiscent.luxury',
    whatsappNumber: process.env.WHATSAPP_NUMBER || '+2348000000000',
  },
};
