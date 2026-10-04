import express from 'express';
import {
  getStatus,
  getDonation,
  getDonationCount,
  getTransaction,
  executeTestTransaction,
} from '../controllers/blockchain.controller.js';

const router = express.Router();

router.get('/status', getStatus);
router.get('/donations/count', getDonationCount);
router.get('/donations/:id', getDonation);
router.get('/transactions/:hash', getTransaction);
router.post('/test-transaction', executeTestTransaction);

export default router;
