import * as requestService from '../services/request.service.js';
import * as beneficiaryService from '../services/beneficiary.service.js';
import { blockchainService } from '../services/blockchain.service.js';
import { Donation } from '../models/Donation.js';
import mongoose from 'mongoose';

export async function create(req, res, next) {
  try {
    const { title, description, purpose, requestedAmount } = req.body;
    
    // Find or create beneficiary profile for this user
    let beneficiary = await beneficiaryService.getProfileByUserId(req.user.id);
    if (!beneficiary) {
      beneficiary = await beneficiaryService.createOrUpdateProfile(req.user.id, {
        name: req.user.name || 'Beneficiary Organization',
        description: 'Beneficiary profile auto-initialized',
        contactEmail: req.user.email,
        contactPhone: '',
      });
    }

    const finalPurpose = purpose || title;
    const finalDescription = description || finalPurpose;

    const newRequest = await requestService.createRequest(
      beneficiary._id || beneficiary.id,
      { title, description: finalDescription, purpose: finalPurpose, requestedAmount }
    );

    res.status(201).json({
      success: true,
      message: 'Funding request submitted successfully. Awaiting administrative review.',
      data: newRequest,
    });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, error: { message: err.message } });
    }
    next(err);
  }
}

export async function getAll(req, res, next) {
  try {
    const { status } = req.query;
    let beneficiaryId = null;

    if (req.user?.role === 'BENEFICIARY') {
      const b = await beneficiaryService.getProfileByUserId(req.user.id);
      if (b) beneficiaryId = b._id || b.id;
    }

    const role = req.user?.role || (req.headers.authorization && req.headers.authorization.includes('admin') ? 'ADMIN' : 'DONOR');

    const list = await requestService.getRequests({
      role,
      beneficiaryId,
      status: status || (role === 'ADMIN' ? 'ALL' : undefined),
    });

    res.status(200).json({
      success: true,
      data: list,
    });
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const reqDoc = await requestService.getRequestById(req.params.id);
    if (!reqDoc) {
      return res.status(404).json({ success: false, error: { message: 'Fund request not found' } });
    }
    res.status(200).json({
      success: true,
      data: reqDoc,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateStatus(req, res, next) {
  try {
    const { status, remarks, approvedAmount } = req.body;
    const updated = await requestService.updateRequestStatus(
      req.params.id,
      { status, remarks, approvedAmount },
      req.user.id
    );

    res.status(200).json({
      success: true,
      message: `Fund request status updated to ${status}.`,
      data: updated,
    });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, error: { message: err.message } });
    }
    next(err);
  }
}

export async function releaseFunds(req, res, next) {
  try {
    const request = await requestService.getRequestById(req.params.id);
    if (!request) return res.status(404).json({ success: false, error: { message: 'Fund request not found' } });
    if (request.status !== 'APPROVED') return res.status(409).json({ success: false, error: { message: 'Only approved campaigns can receive a fund release' } });
    if (request.isFrozen || request.status === 'UNDER_REVIEW') return res.status(403).json({ success: false, error: { message: 'Campaign is frozen under governance review' } });

    const requestId = Number.parseInt(String(req.params.id).slice(-4), 16) || 101;
    let walletAddress = request.beneficiaryAddress || request.beneficiaryId?.walletAddress;
    let totalEth = Number(request.collectedEth || 0);
    if (mongoose.connection.readyState === 1) {
      const beneficiary = await beneficiaryService.getBeneficiaryById(request.beneficiaryId?._id || request.beneficiaryId);
      walletAddress = walletAddress || beneficiary?.walletAddress;
      if (beneficiary?.userId) {
        const { User } = await import('../models/User.js');
        const user = await User.findById(beneficiary.userId).select('walletAddress');
        walletAddress = walletAddress || user?.walletAddress;
      }
      const donations = await Donation.find({ requestId: req.params.id, status: { $in: ['CONFIRMED', 'ALLOCATED'] } }).select('amountEth beneficiaryAddress');
      totalEth = donations.reduce((sum, donation) => sum + Number(donation.amountEth || 0), 0);
      walletAddress = walletAddress || donations.find((donation) => donation.beneficiaryAddress)?.beneficiaryAddress;
    }
    if (!walletAddress) return res.status(400).json({ success: false, error: { message: 'Set a beneficiary wallet address before releasing funds' } });
    if (totalEth <= 0) return res.status(409).json({ success: false, error: { message: 'No confirmed escrow donations are available for this campaign' } });

    const result = await blockchainService.releaseFunds(requestId, walletAddress);
    if (result.status !== 'SUCCESS') throw new Error('Blockchain did not confirm the fund transfer');
    const releaseRecord = { ...result, amountEth: totalEth };
    await requestService.markRequestReleased(req.params.id, releaseRecord);
    res.status(200).json({ success: true, message: 'Funds released successfully', data: { ...releaseRecord, requestId: req.params.id, campaignChainId: requestId, beneficiaryAddress: walletAddress } });
  } catch (err) {
    if (err.statusCode) return res.status(err.statusCode).json({ success: false, error: { message: err.message } });
    next(err);
  }
}
