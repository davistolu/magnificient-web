import { Router } from 'express';
import { processCheckout } from './checkout.controller.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();

router.post('/', asyncHandler(processCheckout));

export default router;
