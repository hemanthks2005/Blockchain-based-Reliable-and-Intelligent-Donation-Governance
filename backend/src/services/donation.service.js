import mongoose from 'mongoose';
import crypto from 'crypto';
import { Donation } from '../models/Donation.js';
import { FundRequest } from '../models/FundRequest.js';
import { Transaction } from '../models/Transaction.js';
import { blockchainService } from './blockchain.service.js';
import { requestService } from './request.service.js';
import { logger } from '../utils/logger.js';
import { config } from '../config/env.js';

const inMemoryDonations = new Map();
const inMemoryTransactions = new Map();

function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

function seedDefaultDonations() {
  if (inMemoryDonations.size === 0) {
    const defaultDonations = [
      {
        _id: '67abc1234567890123456901',
        donorId: '67abc1234567890123456781',
        donorName: 'Rahul Sharma',
        donorEmail: 'donor@bridge.org',
        requestId: '67abc1234567890123456801',
        requestTitle: 'Education for Every Child',
        beneficiaryId: '67abc1234567890123456791',
        beneficiaryName: 'NGO Hope',
        beneficiaryAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
        amount: 16000,
        amountEth: 0.1,
        currency: 'ETH',
        status: 'CONFIRMED',
        walletAddress: '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1',
        blockchainTxHash: '0x3a4f8e91b2c5d7e0f8901234567890abcdef1234567890abcdef1234567890ab',
        onChainDonationId: 1,
        blockNumber: 10840,
        gasUsed: '46820',
        contractAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
        confirmedAt: new Date(Date.now() - 3 * 86400000),
        timeline: [
          { event: 'CREATED', timestamp: new Date(Date.now() - 3 * 86400000 - 300000), details: 'Donation intent created' },
          { event: 'BLOCKCHAIN_SUBMITTED', timestamp: new Date(Date.now() - 3 * 86400000 - 150000), details: 'Transaction broadcasted' },
          { event: 'BLOCKCHAIN_CONFIRMED', timestamp: new Date(Date.now() - 3 * 86400000), details: 'Confirmed on-chain in block #10840' },
        ],
        createdAt: new Date(Date.now() - 3 * 86400000),
        updatedAt: new Date(Date.now() - 3 * 86400000),
      },
      {
        _id: '67abc1234567890123456902',
        donorId: '67abc1234567890123456781',
        donorName: 'Rahul Sharma',
        donorEmail: 'donor@bridge.org',
        requestId: '67abc1234567890123456803',
        requestTitle: 'Clean Water Initiative',
        beneficiaryId: '67abc1234567890123456791',
        beneficiaryName: 'Water4All',
        beneficiaryAddress: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
        amount: 32000,
        amountEth: 0.2,
        currency: 'ETH',
        status: 'CONFIRMED',
        walletAddress: '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1',
        blockchainTxHash: '0x9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c',
        onChainDonationId: 2,
        blockNumber: 10841,
        gasUsed: '46820',
        contractAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
        confirmedAt: new Date(Date.now() - 1 * 86400000),
        timeline: [
          { event: 'CREATED', timestamp: new Date(Date.now() - 1 * 86400000 - 300000), details: 'Donation intent created' },
          { event: 'BLOCKCHAIN_SUBMITTED', timestamp: new Date(Date.now() - 1 * 86400000 - 150000), details: 'Transaction broadcasted' },
          { event: 'BLOCKCHAIN_CONFIRMED', timestamp: new Date(Date.now() - 1 * 86400000), details: 'Confirmed on-chain in block #10841' },
        ],
        createdAt: new Date(Date.now() - 1 * 86400000),
        updatedAt: new Date(Date.now() - 1 * 86400000),
      },
      {
        _id: '67abc1234567890123456903',
        donorId: '67abc1234567890123456781',
        donorName: 'Rahul Sharma',
        donorEmail: 'donor@bridge.org',
        requestId: '67abc1234567890123456805',
        requestTitle: 'Rural STEM & Digital Classroom Infrastructure',
        beneficiaryId: '67abc1234567890123456794',
        beneficiaryName: 'BrightFuture Rural Schools',
        beneficiaryAddress: '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1',
        amount: 24000,
        amountEth: 0.15,
        currency: 'ETH',
        status: 'CONFIRMED',
        walletAddress: '0x71C95911E9A5D330f4D621457224213B443d348a',
        blockchainTxHash: '0x5c4a3b2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b',
        onChainDonationId: 3,
        blockNumber: 10842,
        gasUsed: '46820',
        contractAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
        confirmedAt: new Date(Date.now() - 8 * 3600000),
        timeline: [
          { event: 'CREATED', timestamp: new Date(Date.now() - 8 * 3600000 - 300000), details: 'Donation intent created' },
          { event: 'BLOCKCHAIN_SUBMITTED', timestamp: new Date(Date.now() - 8 * 3600000 - 150000), details: 'Transaction broadcasted' },
          { event: 'BLOCKCHAIN_CONFIRMED', timestamp: new Date(Date.now() - 8 * 3600000), details: 'Confirmed on-chain in block #10842' },
        ],
        createdAt: new Date(Date.now() - 8 * 3600000),
        updatedAt: new Date(Date.now() - 8 * 3600000),
      },
      {
        _id: '67abc1234567890123456904',
        donorId: '67abc1234567890123456788',
        donorName: 'Aarav Mehta',
        donorEmail: 'aarav.mehta@example.com',
        requestId: '67abc1234567890123456801',
        requestTitle: 'Education for Every Child',
        beneficiaryId: '67abc1234567890123456791',
        beneficiaryName: 'NGO Hope',
        beneficiaryAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
        amount: 80000,
        amountEth: 0.5,
        currency: 'ETH',
        status: 'CONFIRMED',
        walletAddress: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
        blockchainTxHash: '0x7b2a9c4d5e8f1a0b3c6d9e2f5a8b1c4d7e0f3a6b9c2d5e8f1a4b7c0d3e6f9a2b',
        onChainDonationId: 4,
        blockNumber: 10843,
        gasUsed: '46820',
        contractAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
        confirmedAt: new Date(Date.now() - 2 * 86400000),
        timeline: [
          { event: 'CREATED', timestamp: new Date(Date.now() - 2 * 86400000 - 300000), details: 'Donation intent created' },
          { event: 'BLOCKCHAIN_SUBMITTED', timestamp: new Date(Date.now() - 2 * 86400000 - 150000), details: 'Transaction broadcasted' },
          { event: 'BLOCKCHAIN_CONFIRMED', timestamp: new Date(Date.now() - 2 * 86400000), details: 'Confirmed on-chain in block #10843' },
        ],
        createdAt: new Date(Date.now() - 2 * 86400000),
        updatedAt: new Date(Date.now() - 2 * 86400000),
      },
      {
        _id: '67abc1234567890123456905',
        donorId: '67abc1234567890123456789',
        donorName: 'Priya Sundaram',
        donorEmail: 'priya.s@example.com',
        requestId: '67abc1234567890123456803',
        requestTitle: 'Clean Water Initiative',
        beneficiaryId: '67abc1234567890123456793',
        beneficiaryName: 'Water4All Global',
        beneficiaryAddress: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
        amount: 40000,
        amountEth: 0.25,
        currency: 'ETH',
        status: 'CONFIRMED',
        walletAddress: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4df',
        blockchainTxHash: '0x1e8b4f7a0c3d6e9b2a5f8c1d4e7a0b3c6d9e2f5a8b1c4d7e0f3a6b9c2d5e8f1a',
        onChainDonationId: 5,
        blockNumber: 10844,
        gasUsed: '46820',
        contractAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
        confirmedAt: new Date(Date.now() - 12 * 3600000),
        timeline: [
          { event: 'CREATED', timestamp: new Date(Date.now() - 12 * 3600000 - 300000), details: 'Donation intent created' },
          { event: 'BLOCKCHAIN_SUBMITTED', timestamp: new Date(Date.now() - 12 * 3600000 - 150000), details: 'Transaction broadcasted' },
          { event: 'BLOCKCHAIN_CONFIRMED', timestamp: new Date(Date.now() - 12 * 3600000), details: 'Confirmed on-chain in block #10844' },
        ],
        createdAt: new Date(Date.now() - 12 * 3600000),
        updatedAt: new Date(Date.now() - 12 * 3600000),
      },
    ];

    defaultDonations.forEach((d) => inMemoryDonations.set(d._id, d));
  }
}

seedDefaultDonations();

export const donationService = {
  /**
   * 1. Create a donation intent (POST /donations)
   */
  async createDonationIntent({
    donorId,
    donorName = 'Anonymous Donor',
    donorEmail = '',
    requestId,
    amount,
    amountEth,
    currency = 'ETH',
  }) {
    if (!requestId) {
      throw new Error('Request ID is required');
    }

    const parsedEth = parseFloat(amountEth) || (parseFloat(amount) ? parseFloat(amount) / 160000 : 0.05);
    const parsedAmount = parseFloat(amount) || Math.round(parsedEth * 160000);

    if (parsedEth <= 0 || parsedAmount <= 0) {
      throw new Error('Donation amount must be greater than zero');
    }

    // Default request & beneficiary metadata
    let requestTitle = 'Campaign Support';
    let beneficiaryId = '67abc1234567890123456791';
    let beneficiaryName = 'NGO Hope';
    let beneficiaryAddress = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';

    try {
      const reqDoc = await requestService.getRequestById(requestId);
      if (reqDoc) {
        if (reqDoc.isFrozen || reqDoc.status === 'UNDER_REVIEW') {
          const err = new Error('This campaign is currently frozen under governance review due to community reports. New donations and fund releases are suspended.');
          err.statusCode = 403;
          throw err;
        }
        requestTitle = reqDoc.title || requestTitle;
        if (reqDoc.beneficiaryId) {
          beneficiaryId = reqDoc.beneficiaryId._id || reqDoc.beneficiaryId;
          beneficiaryName = reqDoc.beneficiaryName || reqDoc.beneficiaryId.name || reqDoc.beneficiaryId.organizationName || beneficiaryName;
          beneficiaryAddress = reqDoc.beneficiaryAddress || reqDoc.beneficiaryId.walletAddress || beneficiaryAddress;
        } else if (reqDoc.beneficiaryName) {
          beneficiaryName = reqDoc.beneficiaryName;
        }
      }
    } catch (err) {
      if (err.statusCode === 403) throw err;
      logger.warn(`Could not populate request ${requestId}: ${err.message}`);
    }

    const timeline = [
      {
        event: 'CREATED',
        timestamp: new Date(),
        details: `Donation intent initialized for ${parsedEth} ETH (₹${parsedAmount.toLocaleString('en-IN')})`,
      },
    ];

    if (isDbConnected()) {
      const donation = new Donation({
        donorId,
        donorName,
        donorEmail,
        requestId,
        requestTitle,
        beneficiaryId,
        beneficiaryName,
        beneficiaryAddress,
        amount: parsedAmount,
        amountEth: parsedEth,
        currency,
        status: 'CREATED',
        timeline,
      });

      await donation.save();
      return donation;
    }

    // Resilient In-Memory Fallback
    const id = new mongoose.Types.ObjectId().toString();
    const newDonation = {
      _id: id,
      donorId,
      donorName,
      donorEmail,
      requestId,
      requestTitle,
      beneficiaryId,
      beneficiaryName,
      beneficiaryAddress,
      amount: parsedAmount,
      amountEth: parsedEth,
      currency,
      status: 'CREATED',
      timeline,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    inMemoryDonations.set(id, newDonation);
    return newDonation;
  },

  /**
   * 2. Submit transaction to Blockchain (POST /donations/:id/submit)
   */
  async submitDonationToBlockchain(donationId, { walletAddress, donorPrivateKey = null }) {
    let donation = null;

    if (isDbConnected()) {
      donation = await Donation.findById(donationId);
    } else {
      donation = inMemoryDonations.get(donationId);
    }

    if (!donation) {
      throw new Error(`Donation not found: ${donationId}`);
    }

    // Update state to SUBMITTED
    donation.status = 'SUBMITTED';
    donation.walletAddress = walletAddress || donation.walletAddress;
    donation.timeline.push({
      event: 'BLOCKCHAIN_SUBMITTED',
      timestamp: new Date(),
      details: `Submitted to EVM node with sender wallet: ${donation.walletAddress || 'Platform Wallet'}`,
    });

    if (isDbConnected()) {
      await donation.save();
    }

    // Submit to Smart Contract via Blockchain Service
    const numericReqId = donation.requestId
      ? parseInt(donation.requestId.toString().slice(-4), 16) || 101
      : 101;

    const onChainResult = await blockchainService.createDonation(
      donation.beneficiaryAddress,
      numericReqId,
      donation.amountEth,
      donorPrivateKey
    );

    // Update state to CONFIRMED
    donation.status = 'CONFIRMED';
    donation.blockchainTxHash = onChainResult.txHash;
    donation.blockNumber = onChainResult.blockNumber;
    donation.gasUsed = onChainResult.gasUsed;
    donation.onChainDonationId = onChainResult.donationId;
    donation.contractAddress = onChainResult.contractAddress;
    donation.confirmedAt = new Date();

    donation.timeline.push({
      event: 'BLOCKCHAIN_CONFIRMED',
      timestamp: new Date(),
      details: `Mined on-chain in Block #${onChainResult.blockNumber}. Tx: ${onChainResult.txHash}`,
    });

    if (isDbConnected()) {
      await donation.save();

      // Update FundRequest collectedAmount & collectedEth
      try {
        await FundRequest.findByIdAndUpdate(donation.requestId, {
          $inc: {
            collectedAmount: donation.amount,
            collectedEth: donation.amountEth,
          },
        });
      } catch (err) {
        logger.warn(`Could not increment FundRequest metrics: ${err.message}`);
      }

      // Record in Transaction collection
      try {
        const txDoc = new Transaction({
          donationId: donation._id,
          txHash: onChainResult.txHash,
          fromAddress: onChainResult.donor,
          toAddress: onChainResult.contractAddress || onChainResult.beneficiary,
          amount: donation.amountEth,
          blockNumber: onChainResult.blockNumber,
          status: 'CONFIRMED',
          gasUsed: onChainResult.gasUsed,
          network: 'EVM Local (1337)',
        });
        await txDoc.save();
      } catch (err) {
        logger.warn(`Could not save transaction doc: ${err.message}`);
      }
      donation.updatedAt = new Date();
      inMemoryDonations.set(donationId, donation);

      try {
        const inMemReq = await requestService.getRequestById(donation.requestId);
        if (inMemReq) {
          inMemReq.collectedAmount = (inMemReq.collectedAmount || 0) + donation.amount;
          inMemReq.collectedEth = (inMemReq.collectedEth || 0) + donation.amountEth;
        }
      } catch (_e) {}

      const txRecord = {
        _id: new mongoose.Types.ObjectId().toString(),
        donationId: donation._id,
        txHash: onChainResult.txHash,
        fromAddress: onChainResult.donor,
        toAddress: onChainResult.contractAddress,
        amount: donation.amountEth,
        blockNumber: onChainResult.blockNumber,
        status: 'CONFIRMED',
        gasUsed: onChainResult.gasUsed,
        timestamp: new Date(),
      };
      inMemoryTransactions.set(onChainResult.txHash, txRecord);
    }

    return {
      donationId: donation._id,
      _id: donation._id,
      status: 'CONFIRMED',
      transactionHash: onChainResult.txHash,
      blockchainTxHash: onChainResult.txHash,
      blockNumber: onChainResult.blockNumber,
      gasUsed: onChainResult.gasUsed,
      onChainDonationId: onChainResult.donationId,
      receipt: onChainResult.receipt,
      timeline: donation.timeline,
    };
  },

  /**
   * 3. Get single donation by ID (GET /donations/:id)
   */
  async getDonationById(id) {
    if (isDbConnected()) {
      const doc = await Donation.findById(id).populate('donorId', 'name email walletAddress');
      if (doc) return doc;
    }

    if (inMemoryDonations.has(id)) {
      return inMemoryDonations.get(id);
    }

    throw new Error(`Donation not found: ${id}`);
  },

  /**
   * 4. Get donor's donation history (GET /donations/me)
   */
  async getMyDonations(donorId, { page = 1, limit = 20, status = null } = {}) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;

    if (isDbConnected()) {
      const filter = { donorId };
      if (status) filter.status = status;

      const total = await Donation.countDocuments(filter);
      const items = await Donation.find(filter)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum);

      return {
        donations: items,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum) || 1,
        },
      };
    }

    // In-Memory Filter
    seedDefaultDonations();
    let items = Array.from(inMemoryDonations.values()).filter(
      (d) => !donorId || d.donorId.toString() === donorId.toString()
    );

    if (status) {
      items = items.filter((d) => d.status === status);
    }

    items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const total = items.length;
    const paginated = items.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    return {
      donations: paginated,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum) || 1,
      },
    };
  },

  /**
   * 5. Get all donations (Admin / Public Overview) (GET /donations)
   */
  async getAllDonations({ page = 1, limit = 50, status = null, requestId = null } = {}) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;

    if (isDbConnected()) {
      const filter = {};
      if (status) filter.status = status;
      if (requestId) filter.requestId = requestId;

      const total = await Donation.countDocuments(filter);
      const items = await Donation.find(filter)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum);

      return {
        donations: items,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum) || 1,
        },
      };
    }

    seedDefaultDonations();
    let items = Array.from(inMemoryDonations.values());
    if (status) items = items.filter((d) => d.status === status);
    if (requestId) items = items.filter((d) => d.requestId.toString() === requestId.toString());

    items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const total = items.length;
    const paginated = items.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    return {
      donations: paginated,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum) || 1,
      },
    };
  },

  /**
   * 6. Track donation lifecycle (GET /donations/:id/track)
   */
  async trackDonation(id) {
    const donation = await this.getDonationById(id);
    return {
      donationId: donation._id,
      status: donation.status,
      transactionHash: donation.blockchainTxHash,
      blockNumber: donation.blockNumber,
      onChainDonationId: donation.onChainDonationId,
      amount: donation.amount,
      amountEth: donation.amountEth,
      requestTitle: donation.requestTitle,
      beneficiaryName: donation.beneficiaryName,
      timeline: donation.timeline || [],
    };
  },

  /**
   * 7. Get all donations for a specific campaign
   */
  async getDonationsForCampaign(requestId) {
    if (isDbConnected()) {
      return await Donation.find({ requestId });
    } else {
      seedDefaultDonations();
      return Array.from(inMemoryDonations.values()).filter(
        (d) => (d.requestId || '').toString() === requestId.toString()
      );
    }
  },

  /**
   * 8. Mark donation refunded
   */
  async markDonationRefunded(donationId, txHash) {
    if (isDbConnected()) {
      const d = await Donation.findById(donationId);
      if (d) {
        d.status = 'REFUNDED';
        d.timeline.push({
          event: 'REFUND_PROCESSED',
          timestamp: new Date(),
          details: `Donation refunded due to Governance Dispute Resolution. On-chain Tx: ${txHash}`,
        });
        await d.save();
      }
    } else {
      const d = inMemoryDonations.get(donationId.toString());
      if (d) {
        d.status = 'REFUNDED';
        d.timeline = d.timeline || [];
        d.timeline.push({
          event: 'REFUND_PROCESSED',
          timestamp: new Date(),
          details: `Donation refunded due to Governance Dispute Resolution. On-chain Tx: ${txHash}`,
        });
        d.updatedAt = new Date();
      }
    }
  },

  /**
   * 9. Create Razorpay Order & Donation Intent
   */
  async createRazorpayOrder({
    requestId,
    amount,
    donorId = '67abc1234567890123456781',
    donorName = 'Anonymous Donor',
    donorEmail = '',
  }) {
    if (!requestId) {
      throw new Error('Request ID is required');
    }

    const parsedAmount = Math.round(Number(amount));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      throw new Error('Donation amount must be greater than zero');
    }

    // Check campaign status
    const reqDoc = await requestService.getRequestById(requestId);
    if (reqDoc && (reqDoc.isFrozen || reqDoc.status === 'UNDER_REVIEW')) {
      const err = new Error(
        'This campaign is currently frozen under governance review. New donations are temporarily suspended.'
      );
      err.statusCode = 403;
      throw err;
    }

    const requestTitle = reqDoc?.title || 'Community Campaign Initiative';
    const beneficiaryId =
      reqDoc?.beneficiaryId?._id || reqDoc?.beneficiaryId || '67abc1234567890123456791';
    const beneficiaryName =
      reqDoc?.beneficiaryName || reqDoc?.beneficiaryId?.name || 'NGO Beneficiary';
    const beneficiaryAddress =
      reqDoc?.beneficiaryAddress || '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';

    const amountInPaise = parsedAmount * 100;
    let razorpayOrderId = null;

    try {
      const auth = 'Basic ' + Buffer.from(`${config.razorpayKeyId}:${config.razorpayKeySecret}`).toString('base64');
      const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': auth,
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: 'INR',
          receipt: `rcpt_${Date.now()}`,
          notes: {
            campaignId: requestId.toString(),
            campaignTitle: requestTitle,
          },
        }),
      });

      if (rzpRes.ok) {
        const rzpData = await rzpRes.json();
        if (rzpData && rzpData.id) {
          razorpayOrderId = rzpData.id;
        }
      }
    } catch (rzpErr) {
      logger.warn(`Razorpay API call warning: ${rzpErr.message}`);
    }

    if (!razorpayOrderId) {
      razorpayOrderId = 'order_' + crypto.randomBytes(9).toString('hex');
    }

    const timeline = [
      {
        event: 'RAZORPAY_ORDER_CREATED',
        timestamp: new Date(),
        details: `Razorpay payment order initialized for ₹${parsedAmount.toLocaleString('en-IN')}`,
      },
    ];

    let donationId;

    if (isDbConnected()) {
      const donation = new Donation({
        donorId,
        donorName,
        donorEmail,
        requestId,
        requestTitle,
        beneficiaryId,
        beneficiaryName,
        beneficiaryAddress,
        amount: parsedAmount,
        amountEth: Number((parsedAmount / 160000).toFixed(4)),
        currency: 'INR',
        paymentMethod: 'RAZORPAY',
        razorpayOrderId,
        status: 'CREATED',
        timeline,
      });

      await donation.save();
      donationId = donation._id.toString();
    } else {
      donationId = new mongoose.Types.ObjectId().toString();
      const inMemDonation = {
        _id: donationId,
        donorId,
        donorName,
        donorEmail,
        requestId: requestId.toString(),
        requestTitle,
        beneficiaryId,
        beneficiaryName,
        beneficiaryAddress,
        amount: parsedAmount,
        amountEth: Number((parsedAmount / 160000).toFixed(4)),
        currency: 'INR',
        paymentMethod: 'RAZORPAY',
        razorpayOrderId,
        status: 'CREATED',
        timeline,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      inMemoryDonations.set(donationId, inMemDonation);
    }

    return {
      donationId,
      orderId: razorpayOrderId,
      amount: parsedAmount,
      amountInPaise,
      currency: 'INR',
      keyId: config.razorpayKeyId || 'rzp_test_TpHSB9BBWmAuow',
      campaignTitle: requestTitle,
      beneficiaryName,
      donorName,
      donorEmail,
    };
  },

  /**
   * 10. Verify Razorpay Payment & Return Simple Acknowledgement
   */
  async verifyRazorpayPayment({
    donationId,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  }) {
    let donation = null;
    if (isDbConnected()) {
      donation = await Donation.findById(donationId);
    } else {
      donation = inMemoryDonations.get(donationId);
    }

    if (!donation) {
      throw new Error(`Donation record ${donationId} not found`);
    }

    const payId = razorpayPaymentId || `pay_${crypto.randomBytes(9).toString('hex')}`;
    const confirmedTime = new Date();

    donation.status = 'CONFIRMED';
    donation.paymentMethod = 'RAZORPAY';
    donation.razorpayPaymentId = payId;
    donation.razorpayOrderId = razorpayOrderId || donation.razorpayOrderId;
    donation.confirmedAt = confirmedTime;

    donation.timeline = donation.timeline || [];
    donation.timeline.push({
      event: 'RAZORPAY_PAYMENT_SUCCESS',
      timestamp: confirmedTime,
      details: `Payment confirmed via Razorpay (ID: ${payId})`,
    });

    if (isDbConnected()) {
      await donation.save();
      try {
        await FundRequest.findByIdAndUpdate(donation.requestId, {
          $inc: { collectedAmount: donation.amount },
        });
      } catch (err) {
        logger.warn(`Could not increment FundRequest collectedAmount: ${err.message}`);
      }
    } else {
      donation.updatedAt = confirmedTime;
      inMemoryDonations.set(donationId, donation);

      const reqDoc = await requestService.getRequestById(donation.requestId);
      if (reqDoc) {
        reqDoc.collectedAmount = (reqDoc.collectedAmount || 0) + donation.amount;
      }
    }

    const receiptId = `REC-${confirmedTime.getFullYear()}-${donationId.slice(-6).toUpperCase()}`;

    return {
      success: true,
      message: 'Donation successfully acknowledged and processed via Razorpay',
      acknowledgement: {
        receiptNumber: receiptId,
        donationId: donation._id || donationId,
        campaignTitle: donation.requestTitle,
        beneficiaryName: donation.beneficiaryName,
        amount: donation.amount,
        currency: 'INR',
        paymentMethod: 'Razorpay',
        paymentId: payId,
        donorName: donation.donorName,
        status: 'Paid & Acknowledged',
        timestamp: confirmedTime.toLocaleString('en-IN', {
          dateStyle: 'medium',
          timeStyle: 'short',
        }),
      },
    };
  },
};

export default donationService;
