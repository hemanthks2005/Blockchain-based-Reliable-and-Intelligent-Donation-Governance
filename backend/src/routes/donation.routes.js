import express from 'express';
import {
  createDonation,
  submitDonation,
  getDonation,
  getMyDonations,
  getAllDonations,
  trackDonation,
  createRazorpayOrder,
  verifyRazorpayPayment,
} from '../controllers/donation.controller.js';
import { authenticate, optionalAuth } from '../middleware/auth.middleware.js';
import { transactionLimiter } from '../middleware/rateLimiter.middleware.js';

const router = express.Router();

// Razorpay Payment Routes (Screen 7 & Screen 8)
router.post('/razorpay/order', optionalAuth, createRazorpayOrder);
router.post('/razorpay/verify', optionalAuth, verifyRazorpayPayment);

// 1. Create a donation intent (POST /donations)
router.post('/', optionalAuth, createDonation);

// 2. Submit transaction to Blockchain (POST /donations/:id/submit)
router.post('/:id/submit', transactionLimiter, optionalAuth, submitDonation);

// 3. Get donor's donation history (GET /donations/me)
router.get('/me', authenticate, getMyDonations);

// 4. Get all donations (GET /donations)
router.get('/', optionalAuth, getAllDonations);

// 5. Track donation lifecycle (GET /donations/:id/track)
router.get('/:id/track', trackDonation);

// 6. Get single donation (GET /donations/:id)
router.get('/:id', getDonation);

export default router;
