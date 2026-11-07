import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const API_ROOT = fileURLToPath(new URL('../../', import.meta.url));
dotenv.config({ path: path.join(API_ROOT, '.env') });
dotenv.config();

function resolvePublicApiUrl(): string {
  const envUrl = process.env.PUBLIC_API_URL || process.env.VITE_API_URL || process.env.BACKEND_URL;
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl.replace(/\/api\/?$/, '').replace(/\/+$/, '');
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`.replace(/\/+$/, '');
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`.replace(/\/+$/, '');
  }
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
    return 'https://backend-seven-delta-62.vercel.app';
  }
  return `http://localhost:${process.env.PORT || '5000'}`;
}

function resolveFrontendUrl(): string {
  const envUrl = process.env.FRONTEND_URL || process.env.STORE_URL || process.env.VITE_STORE_URL;
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl.replace(/\/+$/, '');
  }
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
    return 'https://magnifiscent.site';
  }
  return 'http://localhost:5173';
}

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  frontendUrl: resolveFrontendUrl(),
  publicApiUrl: resolvePublicApiUrl(),
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
    supportEmail: process.env.SUPPORT_EMAIL || 'concierge@magnifiscent.site',
    whatsappNumber: process.env.WHATSAPP_NUMBER || '+2348000000000',
  },
};
