import express from 'express';
import {
  getDashboard,
  getAuditLogs,
  getBlockchainRecords,
  getDonations,
  getDonationReport,
  getBeneficiaryReport,
  getTransactionReport,
} from '../controllers/admin.controller.js';
import { verify as verifyBeneficiary } from '../controllers/beneficiary.controller.js';
import { updateStatus as updateRequestStatus } from '../controllers/request.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = express.Router();

// Enforce ADMIN role on all admin routes
router.use(authenticate, requireRole('ADMIN'));

router.get('/dashboard', getDashboard);
router.get('/audit-logs', getAuditLogs);
router.get('/blockchain-records', getBlockchainRecords);
router.get('/donations', getDonations);
router.get('/reports/donations', getDonationReport);
router.get('/reports/beneficiaries', getBeneficiaryReport);
router.get('/reports/transactions', getTransactionReport);

// Governance Actions
router.post('/beneficiaries/:id/verify', verifyBeneficiary);
router.patch('/beneficiaries/:id/verify', verifyBeneficiary);
router.post('/requests/:id/approve', (req, res, next) => {
  req.body.status = req.body.status || 'APPROVED';
  return updateRequestStatus(req, res, next);
});
router.patch('/requests/:id/status', updateRequestStatus);
router.post('/requests/:id/status', updateRequestStatus);

export default router;
