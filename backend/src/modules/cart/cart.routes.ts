import { Router } from 'express';
import { verifyCart } from './cart.controller.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();

router.post('/verify', asyncHandler(verifyCart));

export default router;
