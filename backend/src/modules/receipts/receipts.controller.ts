import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';
import { config } from '../../config/index.js';
import { pool } from '../../database/index.js';
import { AppError } from '../../middleware/errorHandler.js';

export async function streamReceiptFile(req: Request, res: Response) {
  const { token } = req.params;

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as { filename: string; role?: string };
    const safeFilename = path.basename(decoded.filename);

    const ext = path.extname(safeFilename).toLowerCase();
    const contentTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.pdf': 'application/pdf',
    };
    const mimeType = contentTypes[ext] || 'application/octet-stream';

    // 1. Try PostgreSQL media_files table (persistent in serverless)
    if (pool) {
      try {
        const result = await pool.query(
          'SELECT mime_type, data FROM media_files WHERE filename = $1 OR id = $1 LIMIT 1',
          [safeFilename]
        );
        if (result.rows.length > 0) {
          const row = result.rows[0];
          res.setHeader('Content-Type', row.mime_type || mimeType);
          res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
          return res.send(row.data);
        }
      } catch (dbErr) {
        console.warn('[Receipt Stream] DB query note:', (dbErr as Error).message);
      }
    }

    // 2. Try local disk
    const filePath = path.join(config.storage.receiptsDir, safeFilename);
    if (fs.existsSync(filePath)) {
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      return fs.createReadStream(filePath).pipe(res);
    }

    throw new AppError('Requested receipt file was not found', 404);
  } catch (err: any) {
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({
        success: false,
        message: err.message,
      });
    }
    return res.status(403).json({
      success: false,
      message: 'Access denied: invalid or expired secure receipt token.',
    });
  }
}
