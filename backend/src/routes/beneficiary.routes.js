import { Router } from 'express';
import {
  createProfile,
  getMe,
  getAll,
  getById,
  verify,
} from '../controllers/beneficiary.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

// Authenticated Beneficiary routes
router.post('/', authenticate, requireRole('BENEFICIARY', 'ADMIN'), createProfile);
router.get('/me', authenticate, requireRole('BENEFICIARY', 'ADMIN'), getMe);

// Admin-only routes
router.get('/', authenticate, requireRole('ADMIN'), getAll);
router.get('/:id', authenticate, getById);
router.patch('/:id/verify', authenticate, requireRole('ADMIN'), verify);

export default router;
