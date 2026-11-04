import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { config } from '../config/index.js';

export interface UploadResult {
  url: string;
  key: string;
  storage: 's3' | 'local';
}

class StorageService {
  private isConfigured(): boolean {
    return Boolean(
      config.s3.bucket &&
      config.s3.accessKeyId &&
      config.s3.secretAccessKey
    );
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

    // Determine host and URL
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

    // Headers
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

    // Canonical Request
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

    // String to Sign
    const algorithm = 'AWS4-HMAC-SHA256';
    const credentialScope = `${dateStamp}/${region}/s3/aws4_request`;
    const stringToSign = [
      algorithm,
      amzDate,
      credentialScope,
      crypto.createHash('sha256').update(canonicalRequest).digest('hex'),
    ].join('\n');

    // Signature calculation
    const kDate = crypto.createHmac('sha256', `AWS4${secretKey}`).update(dateStamp).digest();
    const kRegion = crypto.createHmac('sha256', kDate).update(region).digest();
    const kService = crypto.createHmac('sha256', kRegion).update('s3').digest();
    const kSigning = crypto.createHmac('sha256', kService).update('aws4_request').digest();
    const signature = crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex');

    const authorizationHeader = `${algorithm} Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
    headers['Authorization'] = authorizationHeader;

    // Execute upload via native fetch
    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength) as unknown as BodyInit,
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`S3 Bucket upload failed [HTTP ${response.status}]: ${errText || response.statusText}`);
    }

    // Determine final public URL
    if (config.s3.publicUrl) {
      const publicBase = config.s3.publicUrl.replace(/\/+$/, '');
      return `${publicBase}/${key}`;
    }

    return url;
  }

  /**
   * Uploads product media (image or video) to Neon/S3 bucket, or keeps on disk if not configured.
   */
  async uploadProductMedia(
    localFilePath: string,
    filename: string,
    mimetype: string
  ): Promise<UploadResult> {
    if (this.isConfigured()) {
      try {
        const buffer = fs.readFileSync(localFilePath);
        const key = `products/${filename}`;
        const publicUrl = await this.putObject(key, buffer, mimetype, true);

        // Remove local file to save disk space
        try {
          fs.unlinkSync(localFilePath);
        } catch {
          // ignore cleanup errors
        }

        return {
          url: publicUrl,
          key,
          storage: 's3',
        };
      } catch (err) {
        console.warn('Cloud storage upload error, falling back to local storage:', err);
      }
    }

    // Local disk fallback
    const relativeUrl = `/uploads/products/${filename}`;
    return {
      url: relativeUrl,
      key: filename,
      storage: 'local',
    };
  }

  /**
   * Uploads payment receipt document to Neon/S3 bucket or local receipts folder.
   */
  async uploadReceipt(
    localFilePath: string,
    filename: string,
    mimetype: string
  ): Promise<UploadResult> {
    if (this.isConfigured()) {
      try {
        const buffer = fs.readFileSync(localFilePath);
        const key = `receipts/${filename}`;
        const url = await this.putObject(key, buffer, mimetype, false);

        return {
          url,
          key,
          storage: 's3',
        };
      } catch (err) {
        console.warn('Cloud storage receipt upload error, keeping local file:', err);
      }
    }

    return {
      url: `/api/receipts/stream/${filename}`,
      key: filename,
      storage: 'local',
    };
  }
}

export const storageService = new StorageService();
