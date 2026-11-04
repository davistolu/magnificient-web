import { Router } from 'express';
import { listCategories, getCategory, createCategory } from './categories.controller.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(listCategories));
router.get('/:slug', asyncHandler(getCategory));
router.post('/', requireAuth, requireRole(['admin']), asyncHandler(createCategory));

export default router;
