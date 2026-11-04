import { Router } from 'express';
import {
  listTeamMembers,
  createTeamMember,
  toggleTeamMemberStatus,
  deleteTeamMember,
} from './team.controller.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();

router.use(requireAuth, requireRole(['admin']));

router.get('/', asyncHandler(listTeamMembers));
router.post('/', asyncHandler(createTeamMember));
router.patch('/:id/status', asyncHandler(toggleTeamMemberStatus));
router.delete('/:id', asyncHandler(deleteTeamMember));

export default router;
