import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { config } from '../config/index.js';
import { pool } from '../database/index.js';

export interface UploadResult {
  url: string;
  key: string;
  storage: 's3' | 'database' | 'local' | 'data-uri';
}

class StorageService {
  private mediaTableInitialized = false;

  private isConfigured(): boolean {
    return Boolean(
      config.s3.bucket &&
      config.s3.accessKeyId &&
      config.s3.secretAccessKey
    );
  }

  private async ensureMediaTable(): Promise<void> {
    if (this.mediaTableInitialized || !pool) return;
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS media_files (
          id TEXT PRIMARY KEY,
          filename TEXT NOT NULL UNIQUE,
          mime_type TEXT NOT NULL,
          size_bytes INTEGER NOT NULL,
          data BYTEA NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_media_files_filename ON media_files(filename);
      `);
      this.mediaTableInitialized = true;
    } catch (err) {
      console.warn('[Storage] Table init check:', (err as Error).message);
    }
  }

  /**
   * Generates AWS SigV4 authorization headers and performs HTTP PUT to S3-compatible storage.
   */
  private async putObject(
    key: string,
    buffer: Buffer,
    contentType: string,
    isPublic = false
  ): Promise<string> {
    const bucket = config.s3.bucket;
    const region = config.s3.region || 'auto';
    const accessKey = config.s3.accessKeyId;
    const secretKey = config.s3.secretAccessKey;

    let host: string;
    let url: string;

    if (config.s3.endpoint) {
      const endpointUrl = new URL(config.s3.endpoint);
      if (config.s3.forcePathStyle) {
        host = endpointUrl.host;
        url = `${endpointUrl.origin}/${bucket}/${key}`;
      } else {
        host = `${bucket}.${endpointUrl.host}`;
        url = `${endpointUrl.protocol}//${host}/${key}`;
      }
    } else {
      host = `${bucket}.s3.${region}.amazonaws.com`;
      url = `https://${host}/${key}`;
    }

    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
    const dateStamp = amzDate.substring(0, 8);

    const contentHash = crypto.createHash('sha256').update(buffer).digest('hex');

    const headers: Record<string, string> = {
      host,
      'x-amz-date': amzDate,
      'x-amz-content-sha256': contentHash,
      'content-type': contentType,
      'content-length': buffer.length.toString(),
    };

    if (isPublic) {
      headers['x-amz-acl'] = 'public-read';
      headers['cache-control'] = 'public, max-age=31536000, immutable';
    }

    const method = 'PUT';
    const canonicalUri = config.s3.endpoint && config.s3.forcePathStyle ? `/${bucket}/${key}` : `/${key}`;
    const canonicalQueryString = '';

    const sortedHeaderKeys = Object.keys(headers).sort();
    const canonicalHeaders = sortedHeaderKeys
      .map((k) => `${k.toLowerCase()}:${headers[k].trim()}\n`)
      .join('');
    const signedHeaders = sortedHeaderKeys.map((k) => k.toLowerCase()).join(';');

    const canonicalRequest = [
      method,
      canonicalUri,
      canonicalQueryString,
      canonicalHeaders,
      signedHeaders,
      contentHash,
    ].join('\n');

    const algorithm = 'AWS4-HMAC-SHA256';
    const credentialScope = `${dateStamp}/${region}/s3/aws4_request`;
    const stringToSign = [
      algorithm,
      amzDate,
      credentialScope,
      crypto.createHash('sha256').update(canonicalRequest).digest('hex'),
    ].join('\n');

    const kDate = crypto.createHmac('sha256', `AWS4${secretKey}`).update(dateStamp).digest();
    const kRegion = crypto.createHmac('sha256', kDate).update(region).digest();
    const kService = crypto.createHmac('sha256', kRegion).update('s3').digest();
    const kSigning = crypto.createHmac('sha256', kService).update('aws4_request').digest();
    const signature = crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex');

    const authorizationHeader = `${algorithm} Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
    headers['Authorization'] = authorizationHeader;

    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength) as unknown as BodyInit,
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`S3 Bucket upload failed [HTTP ${response.status}]: ${errText || response.statusText}`);
    }

    if (config.s3.publicUrl) {
      const publicBase = config.s3.publicUrl.replace(/\/+$/, '');
      return `${publicBase}/${key}`;
    }

    return url;
  }

  /**
   * Uploads product media (image or video).
   * Priority: S3/R2 -> Neon PostgreSQL media_files -> Data URI fallback.
   */
  async uploadProductMedia(
    bufferOrPath: Buffer | string,
    filename: string,
    mimetype: string
  ): Promise<UploadResult> {
    const buffer = Buffer.isBuffer(bufferOrPath)
      ? bufferOrPath
      : fs.readFileSync(bufferOrPath);

    // 1. Cloud Object Storage (S3 / R2 / Tigris)
    if (this.isConfigured()) {
      try {
        const key = `products/${filename}`;
        const publicUrl = await this.putObject(key, buffer, mimetype, true);
        if (typeof bufferOrPath === 'string') {
          try { fs.unlinkSync(bufferOrPath); } catch { /* ignore */ }
        }
        return {
          url: publicUrl,
          key,
          storage: 's3',
        };
      } catch (err) {
        console.warn('[Storage] Cloud storage upload failed, falling back to database:', (err as Error).message);
      }
    }

    // 2. Persistent PostgreSQL Media Storage (Neon Serverless)
    if (pool) {
      try {
        await this.ensureMediaTable();
        await pool.query(
          `INSERT INTO media_files (id, filename, mime_type, size_bytes, data, created_at)
           VALUES ($1, $2, $3, $4, $5, NOW())
           ON CONFLICT (id) DO UPDATE SET data = $5, mime_type = $3, size_bytes = $4`,
          [filename, filename, mimetype, buffer.length, buffer]
        );

        const baseUrl = (config.publicApiUrl || 'https://backend-seven-delta-62.vercel.app').replace(/\/+$/, '');
        const mediaUrl = `${baseUrl}/api/media/${filename}`;

        return {
          url: mediaUrl,
          key: filename,
          storage: 'database',
        };
      } catch (dbErr) {
        console.warn('[Storage] PostgreSQL media persistence error:', (dbErr as Error).message);
      }
    }

    // 3. Fallback: Self-contained Data URI (prevents broken images in any scenario)
    const dataUri = `data:${mimetype};base64,${buffer.toString('base64')}`;
    return {
      url: dataUri,
      key: filename,
      storage: 'data-uri',
    };
  }

  /**
   * Uploads payment receipt document to Neon/S3 bucket or PostgreSQL media table.
   */
  async uploadReceipt(
    bufferOrPath: Buffer | string,
    filename: string,
    mimetype: string
  ): Promise<UploadResult> {
    const buffer = Buffer.isBuffer(bufferOrPath)
      ? bufferOrPath
      : fs.readFileSync(bufferOrPath);

    // 1. Cloud Object Storage (S3 / R2 / Tigris)
    if (this.isConfigured()) {
      try {
        const key = `receipts/${filename}`;
        const url = await this.putObject(key, buffer, mimetype, false);
        if (typeof bufferOrPath === 'string') {
          try { fs.unlinkSync(bufferOrPath); } catch { /* ignore */ }
        }
        return {
          url,
          key,
          storage: 's3',
        };
      } catch (err) {
        console.warn('[Storage] Cloud storage receipt upload failed, falling back to database:', (err as Error).message);
      }
    }

    // 2. Persistent PostgreSQL Media Storage (Neon Serverless)
    if (pool) {
      try {
        await this.ensureMediaTable();
        await pool.query(
          `INSERT INTO media_files (id, filename, mime_type, size_bytes, data, created_at)
           VALUES ($1, $2, $3, $4, $5, NOW())
           ON CONFLICT (id) DO UPDATE SET data = $5, mime_type = $3, size_bytes = $4`,
          [filename, filename, mimetype, buffer.length, buffer]
        );

        return {
          url: `/api/receipts/stream/${filename}`,
          key: filename,
          storage: 'database',
        };
      } catch (dbErr) {
        console.warn('[Storage] PostgreSQL receipt persistence error:', (dbErr as Error).message);
      }
    }

    return {
      url: `/api/receipts/stream/${filename}`,
      key: filename,
      storage: 'database',
    };
  }
}

export const storageService = new StorageService();
