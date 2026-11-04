import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { loginSchema, registerSchema } from '../../shared/index.js';
import { store } from '../../database/index.js';
import { config } from '../../config/index.js';
import { AppError } from '../../middleware/errorHandler.js';

export async function login(req: Request, res: Response) {
  const validated = loginSchema.parse(req.body);

  const user = store.users.find((u) => u.email.toLowerCase() === validated.email.toLowerCase());
  if (!user || !user.isActive) {
    throw new AppError('Invalid email or password credentials', 401);
  }

  const isPasswordValid = await bcrypt.compare(validated.password, user.passwordHash);
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
    message: 'Welcome to Magnificent Concierge',
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
