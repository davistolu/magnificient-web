import { Router, Request, Response } from 'express';
import { store } from '../../database/index.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, requireRole(['admin', 'staff']), (req: Request, res: Response) => {
  const notifs = [...store.notifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return res.json({
    success: true,
    data: notifs,
  });
});

router.patch('/:id/read', requireAuth, requireRole(['admin', 'staff']), (req: Request, res: Response) => {
  const { id } = req.params;
  const notif = store.notifications.find((n) => n.id === id);
  if (notif) {
    notif.isRead = true;
  }
  return res.json({ success: true });
});

export default router;
