import { Router } from 'express';
import { getDashboardMetrics } from './analytics.controller.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';

const router = Router();

router.get('/metrics', requireAuth, requireRole(['admin', 'staff']), getDashboardMetrics);

export default router;
