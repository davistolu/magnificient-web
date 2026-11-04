import { Router } from 'express';
import {
  getInventoryOverview,
  getInventoryMovements,
  adjustStock,
} from './inventory.controller.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();

router.get('/', requireAuth, requireRole(['admin', 'staff']), asyncHandler(getInventoryOverview));
router.get('/movements', requireAuth, requireRole(['admin', 'staff']), asyncHandler(getInventoryMovements));
router.post('/adjust', requireAuth, requireRole(['admin', 'staff']), asyncHandler(adjustStock));

export default router;
