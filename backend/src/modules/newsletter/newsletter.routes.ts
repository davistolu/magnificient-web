import { Router, Request, Response } from 'express';
import { newsletterSchema } from '../../shared/index.js';
import { store } from '../../database/index.js';

const router = Router();

router.post('/subscribe', (req: Request, res: Response) => {
  const validated = newsletterSchema.parse(req.body);
  const normalizedEmail = validated.email.toLowerCase().trim();

  store.newsletter.add(normalizedEmail);

  return res.json({
    success: true,
    message: 'Thank you for subscribing to Magnificent Private Journal.',
  });
});

export default router;
