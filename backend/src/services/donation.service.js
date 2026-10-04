import mongoose from 'mongoose';
import crypto from 'crypto';
import { Donation } from '../models/Donation.js';
import { FundRequest } from '../models/FundRequest.js';
import { Transaction } from '../models/Transaction.js';
import { blockchainService } from './blockchain.service.js';
import { logger } from '../utils/logger.js';

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

    if (isDbConnected()) {
      try {
        const reqDoc = await FundRequest.findById(requestId).populate('beneficiaryId');
        if (reqDoc) {
          requestTitle = reqDoc.title;
          if (reqDoc.beneficiaryId) {
            beneficiaryId = reqDoc.beneficiaryId._id || reqDoc.beneficiaryId;
            beneficiaryName = reqDoc.beneficiaryId.organizationName || 'Verified Beneficiary';
            beneficiaryAddress = reqDoc.beneficiaryId.walletAddress || beneficiaryAddress;
          }
        }
      } catch (err) {
        logger.warn(`Could not populate request ${requestId} from DB: ${err.message}`);
      }
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
    } else {
      donation.updatedAt = new Date();
      inMemoryDonations.set(donationId, donation);

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
};
