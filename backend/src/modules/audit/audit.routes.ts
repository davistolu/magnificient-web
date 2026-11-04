import { Router, Request, Response } from 'express';
import { store } from '../../database/index.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, requireRole(['admin']), (req: Request, res: Response) => {
  const logs = [...store.auditLogs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return res.json({
    success: true,
    data: logs,
  });
});

export default router;
