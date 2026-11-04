import { Router } from 'express';
import {
  getPaymentInstructions,
  submitReceipt,
  getVerificationQueue,
  verifyPayment,
} from './payments.controller.js';
import { receiptUpload } from '../../middleware/upload.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();

router.get('/instructions/:orderNumber?', asyncHandler(getPaymentInstructions));
router.post('/receipt', receiptUpload.single('receipt'), asyncHandler(submitReceipt));

// Admin endpoints
router.get('/verification-queue', requireAuth, requireRole(['admin', 'staff']), asyncHandler(getVerificationQueue));
router.post('/verify', requireAuth, requireRole(['admin', 'staff']), asyncHandler(verifyPayment));

export default router;
