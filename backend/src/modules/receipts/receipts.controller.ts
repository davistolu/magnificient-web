import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';
import { config } from '../../config/index.js';
import { AppError } from '../../middleware/errorHandler.js';

export async function streamReceiptFile(req: Request, res: Response) {
  const { token } = req.params;

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as { filename: string; role?: string };
    const safeFilename = path.basename(decoded.filename);
    const filePath = path.join(config.storage.receiptsDir, safeFilename);

    if (!fs.existsSync(filePath)) {
      throw new AppError('Requested receipt file was not found', 404);
    }

    const ext = path.extname(safeFilename).toLowerCase();
    const contentTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.pdf': 'application/pdf',
    };

    res.setHeader('Content-Type', contentTypes[ext] || 'application/octet-stream');
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');

    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: 'Access denied: invalid or expired secure receipt token.',
    });
  }
}
