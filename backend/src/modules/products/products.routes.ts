import { Router } from 'express';
import {
  listProducts,
  getProduct,
  getFeaturedProducts,
  createProduct,
  updateProduct,
  archiveProduct,
  deleteProduct,
  uploadProductImage,
} from './products.controller.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { productImageUpload } from '../../middleware/upload.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(listProducts));
router.get('/featured', asyncHandler(getFeaturedProducts));
router.get('/:slugOrId', asyncHandler(getProduct));

// Admin product endpoints
router.post(
  '/upload-image',
  requireAuth,
  requireRole(['admin']),
  productImageUpload.single('image'),
  asyncHandler(uploadProductImage)
);
router.post('/', requireAuth, requireRole(['admin']), asyncHandler(createProduct));
router.put('/:id', requireAuth, requireRole(['admin']), asyncHandler(updateProduct));
router.post('/:id/archive', requireAuth, requireRole(['admin']), asyncHandler(archiveProduct));
router.delete('/:id', requireAuth, requireRole(['admin']), asyncHandler(deleteProduct));

export default router;
