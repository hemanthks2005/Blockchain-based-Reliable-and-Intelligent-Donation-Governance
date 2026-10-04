import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import beneficiaryRoutes from './beneficiary.routes.js';
import requestRoutes from './request.routes.js';
import blockchainRoutes from './blockchain.routes.js';
import donationRoutes from './donation.routes.js';
import adminRoutes from './admin.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/beneficiaries', beneficiaryRoutes);
router.use('/requests', requestRoutes);
router.use('/blockchain', blockchainRoutes);
router.use('/donations', donationRoutes);
router.use('/admin', adminRoutes);

// Meta index route
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to BRIDGE API (Blockchain-based Reliable and Intelligent Donation Governance Engine)',
    version: '1.0.0',
    documentation: '/docs',
    endpoints: {
      health: '/api/v1/health',
      auth: '/api/v1/auth',
      beneficiaries: '/api/v1/beneficiaries',
      requests: '/api/v1/requests',
      donations: '/api/v1/donations',
      transactions: '/api/v1/transactions',
      admin: '/api/v1/admin',
    },
  });
});

export default router;
