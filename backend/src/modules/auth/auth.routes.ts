import { Router } from 'express';
import { login, register, me } from './auth.controller.js';
import { requireAuth } from '../../middleware/auth.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();

router.post('/login', asyncHandler(login));
router.post('/register', asyncHandler(register));
router.get('/me', requireAuth, asyncHandler(me));

export default router;
