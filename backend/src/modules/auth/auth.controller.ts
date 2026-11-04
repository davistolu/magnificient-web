import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { loginSchema, registerSchema } from '../../shared/index.js';
import { store, pool } from '../../database/index.js';
import { config } from '../../config/index.js';
import { AppError } from '../../middleware/errorHandler.js';

export async function login(req: Request, res: Response) {
  const validated = loginSchema.parse(req.body);

  const emailLower = validated.email.trim().toLowerCase();
  const aliasEmail = emailLower.includes('magnifiscent')
    ? emailLower.replace('magnifiscent', 'magnificent')
    : emailLower.replace('magnificent', 'magnifiscent');

  let user: any = null;

  // 1. Check PostgreSQL pool if available
  if (pool) {
    try {
      const client = await pool.connect();
      try {
        const result = await client.query(
          `SELECT id, full_name as "fullName", email, phone, password_hash as "passwordHash", role, is_active as "isActive"
           FROM users
           WHERE LOWER(email) = $1 OR LOWER(email) = $2
           ORDER BY (LOWER(email) = $1) DESC LIMIT 1`,
          [emailLower, aliasEmail]
        );
        if (result.rows.length > 0) {
          user = result.rows[0];
        }
      } finally {
        client.release();
      }
    } catch (dbErr) {
      console.warn('[Auth] Postgres query failed, falling back to local store:', (dbErr as Error).message);
    }
  }

  // 2. Fallback to local store
  if (!user) {
    user = store.users.find(
      (u) => u.email.toLowerCase() === emailLower || u.email.toLowerCase() === aliasEmail
    );
  }

  if (!user || !user.isActive) {
    throw new AppError('Invalid email or password credentials', 401);
  }

  // 3. Password validation with alias fallback & self-healing
  let isPasswordValid = await bcrypt.compare(validated.password, user.passwordHash);

  if (!isPasswordValid && (user.role === 'admin' || user.role === 'concierge')) {
    const altPassword = validated.password.includes('MagnifiScent')
      ? validated.password.replace('MagnifiScent', 'Magnificent')
      : validated.password.replace('Magnificent', 'MagnifiScent');

    if (altPassword !== validated.password) {
      isPasswordValid = await bcrypt.compare(altPassword, user.passwordHash);
      if (isPasswordValid) {
        // Upgrade stored password hash to the new brand password
        const salt = await bcrypt.genSalt(10);
        const newHash = await bcrypt.hash(validated.password, salt);
        user.passwordHash = newHash;
        store.saveUser(user);
        if (pool) {
          pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, user.id]).catch(() => {});
        }
      }
    }
  }

  if (!isPasswordValid) {
    throw new AppError('Invalid email or password credentials', 401);
  }

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn as any }
  );

  return res.json({
    success: true,
    message: 'Welcome to MagnifiScent Concierge',
    token,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  });
}

export async function register(req: Request, res: Response) {
  const validated = registerSchema.parse(req.body);

  const existing = store.users.find((u) => u.email.toLowerCase() === validated.email.toLowerCase());
  if (existing) {
    throw new AppError('An account with this email address already exists.', 400);
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(validated.password, salt);

  const newUser = {
    id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    fullName: validated.fullName,
    email: validated.email.toLowerCase(),
    phone: validated.phone || null,
    passwordHash,
    role: 'customer' as const,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  store.saveUser(newUser);

  const token = jwt.sign(
    {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      fullName: newUser.fullName,
    },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn as any }
  );

  return res.status(201).json({
    success: true,
    message: 'Account created successfully',
    token,
    user: {
      id: newUser.id,
      fullName: newUser.fullName,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
    },
  });
}

export async function me(req: Request, res: Response) {
  if (!req.user) {
    throw new AppError('Unauthorized', 401);
  }

  const user = store.users.find((u) => u.id === req.user?.id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  return res.json({
    success: true,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  });
}
