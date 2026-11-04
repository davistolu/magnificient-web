import { Router } from 'express';
import { listCustomers, getCustomerDetails } from './customers.controller.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();

router.get('/', requireAuth, requireRole(['admin', 'staff']), asyncHandler(listCustomers));
router.get('/:emailOrId', requireAuth, requireRole(['admin', 'staff']), asyncHandler(getCustomerDetails));

export default router;
