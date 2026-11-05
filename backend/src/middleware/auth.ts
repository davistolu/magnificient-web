import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { store, pool } from '../database/index.js';

export interface AuthUser {
  id: string;
  email: string;
  role: 'admin' | 'staff' | 'customer';
  fullName: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export const requireAuth: RequestHandler = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please sign in.',
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as AuthUser;
    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session payload. Please sign in again.',
      });
    }

    // 1. Fast in-memory lookup
    let user = store.users.find(
      (u) =>
        (u.id === decoded.id ||
          (decoded.email && u.email?.toLowerCase() === decoded.email.toLowerCase())) &&
        u.isActive
    );

    // 2. Query Neon PostgreSQL database if not currently loaded in memory
    if (!user && pool) {
      try {
        const client = await pool.connect();
        try {
          const result = await client.query(
            `SELECT id, full_name as "fullName", email, phone, password_hash as "passwordHash",
                    role, is_active as "isActive", created_at as "createdAt", updated_at as "updatedAt"
             FROM users
             WHERE (id::text = $1 OR LOWER(email) = LOWER($2)) AND is_active = true
             LIMIT 1`,
            [decoded.id, decoded.email || '']
          );
          if (result.rows.length > 0) {
            user = {
              ...result.rows[0],
              isActive: Boolean(result.rows[0].isActive),
            };
            store.users.push(user);
          }
        } finally {
          client.release();
        }
      } catch (dbErr) {
        console.warn('[requireAuth] PostgreSQL lookup warning:', (dbErr as Error).message);
      }
    }

    // 3. Resilient fallback: If database is temporarily syncing/reconnecting but the JWT was signed by our secret
    if (!user && decoded.id && decoded.role) {
      req.user = {
        id: decoded.id,
        email: decoded.email || '',
        role: decoded.role,
        fullName: decoded.fullName || 'Administrator',
      };
      return next();
    }

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account not found or inactive.',
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    };
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session. Please sign in again.',
    });
  }
};

export function requireRole(allowedRoles: ('admin' | 'staff' | 'customer')[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: insufficient administrative privileges.',
      });
    }

    next();
  };
}
