import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { config } from '../config/index.js';
import { AppError } from './errorHandler.js';

// Ensure receipts directory exists
if (!fs.existsSync(config.storage.receiptsDir)) {
  fs.mkdirSync(config.storage.receiptsDir, { recursive: true });
}

// Ensure products directory exists
if (!fs.existsSync(config.storage.productsDir)) {
  fs.mkdirSync(config.storage.productsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.storage.receiptsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const randomHex = crypto.randomBytes(16).toString('hex');
    cb(null, `rcpt_${Date.now()}_${randomHex}${ext}`);
  },
});

const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

export const receiptUpload = multer({
  storage,
  limits: {
    fileSize: config.storage.maxReceiptSizeMb * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(
        new AppError(
          'Invalid file format. Only JPEG, PNG, WebP images and PDF documents are accepted as payment receipts.',
          400
        )
      );
    }
    cb(null, true);
  },
});

const productStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.storage.productsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const randomHex = crypto.randomBytes(8).toString('hex');
    cb(null, `prod_${Date.now()}_${randomHex}${ext}`);
  },
});

const allowedProductMediaMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/ogg',
  'video/x-m4v',
];

export const productMediaUpload = multer({
  storage: productStorage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB for luxury videos and high-res imagery
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const validExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.mp4', '.webm', '.mov', '.ogg', '.m4v'];
    if (!allowedProductMediaMimeTypes.includes(file.mimetype) && !validExts.includes(ext)) {
      return cb(
        new AppError(
          'Invalid media format. Supported formats: JPEG, PNG, WebP, GIF images and MP4, WebM, MOV videos.',
          400
        )
      );
    }
    cb(null, true);
  },
});

export const productImageUpload = productMediaUpload;

// Inspect magic bytes for extra verification
export function verifyFileSignature(filePath: string): boolean {
  try {
    const buffer = Buffer.alloc(16);
    const fd = fs.openSync(filePath, 'r');
    const bytesRead = fs.readSync(fd, buffer, 0, 16, 0);
    fs.closeSync(fd);

    if (bytesRead < 4) return false;

    // JPEG: FF D8 FF
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return true;
    // PNG: 89 50 4E 47 0D 0A 1A 0A
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return true;
    // PDF: %PDF (25 50 44 46)
    if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) return true;
    // WebP: RIFF
    if (buffer.toString('ascii', 0, 4) === 'RIFF') return true;
    // GIF: GIF8
    if (buffer.toString('ascii', 0, 4) === 'GIF8') return true;
    // MP4 / MOV: 'ftyp', 'moov', 'mdat', 'wide' at offset 4
    if (bytesRead >= 8) {
      const brand = buffer.toString('ascii', 4, 8);
      if (brand === 'ftyp' || brand === 'moov' || brand === 'mdat' || brand === 'wide') return true;
    }
    // WebM / Matroska: 1A 45 DF A3
    if (buffer[0] === 0x1a && buffer[1] === 0x45 && buffer[2] === 0xdf && buffer[3] === 0xa3) return true;
    // Ogg: OggS
    if (buffer[0] === 0x4f && buffer[1] === 0x67 && buffer[2] === 0x67 && buffer[3] === 0x53) return true;

    return false;
  } catch {
    return false;
  }
}
