import { Router } from 'express';
import { getMediaFile } from './media.controller.js';

const router = Router();

// /api/media/:filename
router.get('/:filename', getMediaFile);
router.get('/products/:filename', getMediaFile);
router.get('/receipts/:filename', getMediaFile);

export default router;
