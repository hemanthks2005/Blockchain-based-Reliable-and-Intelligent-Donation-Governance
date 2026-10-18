import { Router } from 'express';
import {
  reportCampaign,
  submitEvidence,
  getDisputeDetails,
  castVote,
  finalizeDispute,
  getAllDisputes,
  getConfig,
  updateConfig,
} from '../controllers/governance.controller.js';
import { authenticate, optionalAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

// Public / Authenticated Governance Config
router.get('/config', optionalAuth, getConfig);
router.patch('/config', authenticate, requireRole('ADMIN'), updateConfig);

// List all disputes
router.get('/disputes', optionalAuth, getAllDisputes);

// Get dispute details, evidence, and user voting eligibility for a campaign
router.get('/campaigns/:campaignId', optionalAuth, getDisputeDetails);

// Donor reports a suspicious campaign (authenticated donor / user)
router.post('/report', authenticate, reportCampaign);

// Beneficiary submits evidence (Beneficiary / Admin)
router.post('/evidence/:campaignId', authenticate, requireRole('BENEFICIARY', 'ADMIN'), submitEvidence);

// Eligible donor casts weighted vote (Approve / Reject)
router.post('/vote/:campaignId', authenticate, castVote);

// Finalize dispute voting and resume or initiate refunds (Admin)
router.post('/finalize/:campaignId', authenticate, requireRole('ADMIN'), finalizeDispute);

export default router;
