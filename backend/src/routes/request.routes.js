import { Router } from 'express';
import {
  create,
  getAll,
  getById,
  updateStatus,
} from '../controllers/request.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

// Create funding request (Beneficiary / Admin)
router.post('/', authenticate, requireRole('BENEFICIARY', 'ADMIN'), create);

// Get requests (Role dependent)
router.get('/', authenticate, getAll);

// Get request by ID
router.get('/:id', authenticate, getById);

// Update status (Admin only)
router.patch('/:id/status', authenticate, requireRole('ADMIN'), updateStatus);

export default router;
