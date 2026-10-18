import { Router } from 'express';
import {
  create,
  getAll,
  getById,
  updateStatus,
} from '../controllers/request.controller.js';
import { authenticate, optionalAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

// Create funding request (Beneficiary / Admin)
router.post('/', authenticate, requireRole('BENEFICIARY', 'ADMIN'), create);

// Get requests (Role dependent - public / donor / beneficiary / admin)
router.get('/', optionalAuth, getAll);

// Get request by ID
router.get('/:id', optionalAuth, getById);

// Update status (Admin only)
router.patch('/:id/status', authenticate, requireRole('ADMIN'), updateStatus);

export default router;
