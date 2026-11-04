import { Router } from 'express';
import {
  getPublicSettings,
  getAdminSettings,
  updateAdminSettings,
} from './settings.controller.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();

router.get('/public', asyncHandler(getPublicSettings));

// Admin endpoints
router.get('/admin', requireAuth, requireRole(['admin']), asyncHandler(getAdminSettings));
router.put('/admin', requireAuth, requireRole(['admin']), asyncHandler(updateAdminSettings));

export default router;
