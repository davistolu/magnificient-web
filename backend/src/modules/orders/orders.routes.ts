import { Router } from 'express';
import {
  trackOrder,
  listOrders,
  getOrderDetails,
  updateOrderStatus,
  getMyOrders,
  getMyOrderDetails,
} from './orders.controller.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();

router.get('/track', asyncHandler(trackOrder));

// Customer authenticated order access
router.get('/my-orders', requireAuth, asyncHandler(getMyOrders));
router.get('/my-orders/:orderNumber', requireAuth, asyncHandler(getMyOrderDetails));

// Admin endpoints
router.get('/', requireAuth, requireRole(['admin', 'staff']), asyncHandler(listOrders));
router.get('/:id', requireAuth, requireRole(['admin', 'staff']), asyncHandler(getOrderDetails));
router.patch('/:id/status', requireAuth, requireRole(['admin', 'staff']), asyncHandler(updateOrderStatus));

export default router;
