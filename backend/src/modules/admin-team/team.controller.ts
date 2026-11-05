import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { z } from 'zod';
import { store, pool } from '../../database/index.js';
import { AppError } from '../../middleware/errorHandler.js';

const createTeamMemberSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email address is required'),
  phone: z.string().optional().nullable(),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  role: z.enum(['admin', 'staff', 'concierge']).default('staff'),
});

export async function listTeamMembers(req: Request, res: Response) {
  // Query all team members
  const team = store.users
    .filter((u) => u.role === 'admin' || u.role === 'staff' || u.role === 'concierge')
    .map((u) => ({
      id: u.id,
      fullName: u.fullName,
      email: u.email,
      phone: u.phone,
      role: u.role,
      isActive: Boolean(u.isActive),
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    }));

  return res.json({
    success: true,
    data: team,
  });
}

export async function createTeamMember(req: Request, res: Response) {
  const validated = createTeamMemberSchema.parse(req.body);
  const emailLower = validated.email.trim().toLowerCase();

  const existing = store.users.find((u) => u.email.toLowerCase() === emailLower);
  if (existing) {
    throw new AppError('An account with this email address already exists.', 400);
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(validated.password, salt);
  const newId = crypto.randomUUID();

  const newMember = {
    id: newId,
    fullName: validated.fullName.trim(),
    email: emailLower,
    phone: validated.phone?.trim() || null,
    passwordHash,
    role: validated.role,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await store.saveUser(newMember);

  await store.saveAuditLog({
    id: crypto.randomUUID(),
    actorId: req.user?.id || 'admin',
    actorName: req.user?.fullName || 'Admin',
    action: 'team_member_created',
    resourceType: 'user',
    resourceId: newId,
    metadata: { email: emailLower, role: validated.role },
    createdAt: new Date(),
  });

  return res.status(201).json({
    success: true,
    message: `Team member ${validated.fullName} created successfully`,
    data: {
      id: newMember.id,
      fullName: newMember.fullName,
      email: newMember.email,
      phone: newMember.phone,
      role: newMember.role,
      isActive: newMember.isActive,
      createdAt: newMember.createdAt,
    },
  });
}

export async function toggleTeamMemberStatus(req: Request, res: Response) {
  const { id } = req.params;
  const { isActive } = req.body;

  if (req.user?.id === id && isActive === false) {
    throw new AppError('You cannot deactivate your own administrative account.', 400);
  }

  const member = store.users.find((u) => u.id === id);
  if (!member) {
    throw new AppError('Team member not found', 404);
  }

  member.isActive = Boolean(isActive);
  member.updatedAt = new Date();
  await store.saveUser(member);

  return res.json({
    success: true,
    message: `Team member ${member.fullName} is now ${member.isActive ? 'active' : 'deactivated'}`,
    data: {
      id: member.id,
      isActive: member.isActive,
    },
  });
}

export async function deleteTeamMember(req: Request, res: Response) {
  const { id } = req.params;

  if (req.user?.id === id) {
    throw new AppError('You cannot delete your own administrative account.', 400);
  }

  const member = store.users.find((u) => u.id === id);
  if (!member) {
    throw new AppError('Team member not found', 404);
  }

  await store.deleteUser(id);

  await store.saveAuditLog({
    id: crypto.randomUUID(),
    actorId: req.user?.id || 'admin',
    actorName: req.user?.fullName || 'Admin',
    action: 'team_member_deleted',
    resourceType: 'user',
    resourceId: id,
    metadata: { email: member.email, fullName: member.fullName },
    createdAt: new Date(),
  });

  return res.json({
    success: true,
    message: `Team member "${member.fullName}" removed successfully`,
  });
}
