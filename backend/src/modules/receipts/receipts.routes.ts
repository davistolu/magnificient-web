import { Router } from 'express';
import { streamReceiptFile } from './receipts.controller.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();

router.get('/file/:token', asyncHandler(streamReceiptFile));

export default router;
