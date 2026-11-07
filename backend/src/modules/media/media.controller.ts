import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { pool } from '../../database/index.js';
import { config } from '../../config/index.js';

export async function getMediaFile(req: Request, res: Response) {
  const filename = req.params.filename || req.params.id || '';
  const safeFilename = path.basename(filename);

  if (!safeFilename) {
    return res.status(400).json({ success: false, message: 'Invalid media asset filename' });
  }

  // 1. Fetch from PostgreSQL media_files table (persistent in serverless)
  if (pool) {
    try {
      const result = await pool.query(
        'SELECT mime_type, data FROM media_files WHERE filename = $1 OR id = $1 LIMIT 1',
        [safeFilename]
      );
      if (result.rows.length > 0) {
        const { mime_type, data } = result.rows[0];
        res.setHeader('Content-Type', mime_type || 'application/octet-stream');
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        res.setHeader('ETag', `"${safeFilename}"`);
        return res.send(data);
      }
    } catch (err) {
      console.warn('[Media Controller] DB query note:', (err as Error).message);
    }
  }

  // 2. Fetch from local disk (for dev environments)
  const candidatePaths = [
    path.join(config.storage.productsDir, safeFilename),
    path.join(config.storage.receiptsDir, safeFilename),
    path.resolve('./uploads/products', safeFilename),
    path.resolve('./uploads/receipts', safeFilename),
  ];

  for (const candidate of candidatePaths) {
    try {
      if (fs.existsSync(candidate)) {
        const ext = path.extname(safeFilename).toLowerCase();
        const contentTypes: Record<string, string> = {
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.png': 'image/png',
          '.webp': 'image/webp',
          '.gif': 'image/gif',
          '.mp4': 'video/mp4',
          '.webm': 'video/webm',
          '.mov': 'video/quicktime',
          '.pdf': 'application/pdf',
        };
        res.setHeader('Content-Type', contentTypes[ext] || 'application/octet-stream');
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        return fs.createReadStream(candidate).pipe(res);
      }
    } catch {
      // ignore
    }
  }

  return res.status(404).json({
    success: false,
    message: `Media file "${safeFilename}" not found`,
  });
}
