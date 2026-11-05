import { Router } from 'express';
import { renderOpenGraphPreview } from './og.controller.js';

const router = Router();

// /api/og-preview?slug=... or ?category=... or ?path=...
router.get('/', renderOpenGraphPreview);

// /api/og/products/:slug
router.get('/products/:slug', renderOpenGraphPreview);

// /api/og/category/:category
router.get('/category/:category', renderOpenGraphPreview);

export default router;
