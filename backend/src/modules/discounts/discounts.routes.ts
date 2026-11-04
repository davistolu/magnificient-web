import { Router } from 'express';
import {
  validateDiscount,
  listDiscounts,
  createDiscount,
  toggleDiscountStatus,
} from './discounts.controller.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();

router.post('/validate', asyncHandler(validateDiscount));

// Admin endpoints
router.get('/', requireAuth, requireRole(['admin']), asyncHandler(listDiscounts));
router.post('/', requireAuth, requireRole(['admin']), asyncHandler(createDiscount));
router.patch('/:id/toggle', requireAuth, requireRole(['admin']), asyncHandler(toggleDiscountStatus));

export default router;
