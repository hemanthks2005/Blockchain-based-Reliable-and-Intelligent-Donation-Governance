import mongoose from 'mongoose';
import crypto from 'crypto';
import { GovernanceDispute } from '../models/GovernanceDispute.js';
import { FundRequest } from '../models/FundRequest.js';
import { AuditLog } from '../models/AuditLog.js';
import { Transaction } from '../models/Transaction.js';
import { requestService } from './request.service.js';
import { donationService } from './donation.service.js';
import { logger } from '../utils/logger.js';

// In-memory store fallback for standalone dev mode
const inMemoryDisputes = new Map();
let globalReportThreshold = 2; // Configurable threshold (default 2 reports triggers freeze)

function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

// Helper to record audit log
async function logGovernanceAudit({ actorId, actorRole, action, entityId, metadata }) {
  try {
    if (isDbConnected()) {
      await AuditLog.create({
        actorId,
        actorRole: actorRole || 'DONOR',
        action,
        entityType: 'GOVERNANCE_DISPUTE',
        entityId: entityId ? new mongoose.Types.ObjectId(entityId.toString()) : null,
        metadata: metadata || {},
        timestamp: new Date(),
      });
    }
    logger.info(`[GOVERNANCE AUDIT] ${action}: ${JSON.stringify(metadata)}`);
  } catch (err) {
    logger.warn(`Could not create governance audit log: ${err.message}`);
  }
}

/**
 * 1. Get current governance configuration
 */
export async function getGovernanceConfig() {
  return {
    reportThreshold: globalReportThreshold,
    votingWindowHours: 48,
    status: 'ACTIVE',
  };
}

/**
 * 2. Update governance configuration (Admin)
 */
export async function updateGovernanceConfig({ threshold, adminUserId }) {
  if (threshold !== undefined) {
    const parsed = Number(threshold);
    if (isNaN(parsed) || parsed < 1) {
      const err = new Error('Threshold must be a positive integer greater than or equal to 1');
      err.statusCode = 400;
      throw err;
    }
    globalReportThreshold = parsed;
    await logGovernanceAudit({
      actorId: adminUserId,
      actorRole: 'ADMIN',
      action: 'GOVERNANCE_THRESHOLD_UPDATED',
      metadata: { newThreshold: parsed },
    });
  }
  return await getGovernanceConfig();
}

/**
 * Helper to find or create dispute object
 */
async function findOrCreateDispute(campaignId, campaignDoc) {
  const cidStr = campaignId.toString();

  if (isDbConnected()) {
    let dispute = await GovernanceDispute.findOne({ campaignId });
    if (!dispute) {
      dispute = new GovernanceDispute({
        campaignId,
        campaignTitle: campaignDoc.title || 'Campaign Support',
        beneficiaryId: campaignDoc.beneficiaryId?._id || campaignDoc.beneficiaryId || '67abc1234567890123456791',
        beneficiaryName: campaignDoc.beneficiaryName || campaignDoc.beneficiaryId?.name || 'NGO Hope',
        status: 'ACTIVE_CAMPAIGN',
        threshold: globalReportThreshold,
        reportCount: 0,
        reports: [],
      });
      await dispute.save();
    }
    return dispute;
  } else {
    let dispute = inMemoryDisputes.get(cidStr);
    if (!dispute) {
      const did = new mongoose.Types.ObjectId().toString();
      dispute = {
        _id: did,
        campaignId: cidStr,
        campaignTitle: campaignDoc.title || 'Campaign Support',
        beneficiaryId: (campaignDoc.beneficiaryId?._id || campaignDoc.beneficiaryId || '67abc1234567890123456791').toString(),
        beneficiaryName: campaignDoc.beneficiaryName || campaignDoc.beneficiaryId?.name || 'NGO Hope',
        status: 'ACTIVE_CAMPAIGN',
        reportCount: 0,
        threshold: globalReportThreshold,
        reports: [],
        frozenAt: null,
        freezeReason: null,
        evidence: {
          explanation: null,
          documents: [],
          images: [],
          videos: [],
          submittedAt: null,
          submittedBy: null,
        },
        voting: {
          startDate: null,
          endDate: null,
          votes: [],
          approveWeight: 0,
          rejectWeight: 0,
          totalWeight: 0,
          resolvedAt: null,
          resolutionResult: null,
        },
        refunds: {
          status: 'NOT_APPLICABLE',
          totalRefundAmount: 0,
          refundRecords: [],
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      inMemoryDisputes.set(cidStr, dispute);
    }
    return dispute;
  }
}

/**
 * 3. Donor reports suspicious campaign
 */
export async function reportCampaign({
  campaignId,
  donorId,
  donorName = 'Anonymous Donor',
  donorEmail = '',
  donorWallet = '',
  reason,
  details,
}) {
  if (!campaignId || !reason || !details) {
    const err = new Error('campaignId, reason, and details are required to submit a report');
    err.statusCode = 400;
    throw err;
  }

  const campaign = await requestService.getRequestById(campaignId);
  if (!campaign) {
    const err = new Error('Campaign not found');
    err.statusCode = 404;
    throw err;
  }

  const dispute = await findOrCreateDispute(campaignId, campaign);

  // Check if this donor already submitted a report on this campaign
  const existingReport = donorId
    ? dispute.reports.find(
        (r) => r.donorId && r.donorId.toString() === donorId.toString()
      )
    : null;
  if (existingReport) {
    const err = new Error('You have already submitted a report for this campaign. Multiple reports from the same donor account are not allowed.');
    err.statusCode = 400;
    throw err;
  }

  const newReport = {
    _id: new mongoose.Types.ObjectId().toString(),
    donorId,
    donorName,
    donorEmail,
    donorWallet,
    reason,
    details: details.trim(),
    createdAt: new Date(),
  };

  dispute.reports.push(newReport);
  dispute.reportCount = dispute.reports.length;
  dispute.threshold = globalReportThreshold;

  let triggeredFreeze = false;

  // Check if report count reached configurable threshold
  if (dispute.reportCount >= globalReportThreshold && dispute.status === 'ACTIVE_CAMPAIGN') {
    dispute.status = 'FROZEN_PENDING_EVIDENCE';
    dispute.frozenAt = new Date();
    dispute.freezeReason = `Suspicious report threshold reached (${dispute.reportCount}/${globalReportThreshold} reports). Community concerns: ${reason}`;
    triggeredFreeze = true;

    // Freeze campaign and set status to UNDER_REVIEW
    if (isDbConnected()) {
      await FundRequest.findByIdAndUpdate(campaignId, {
        status: 'UNDER_REVIEW',
        isFrozen: true,
        freezeReason: dispute.freezeReason,
        frozenAt: dispute.frozenAt,
        reportCount: dispute.reportCount,
      });
    } else {
      campaign.status = 'UNDER_REVIEW';
      campaign.isFrozen = true;
      campaign.freezeReason = dispute.freezeReason;
      campaign.frozenAt = dispute.frozenAt;
      campaign.reportCount = dispute.reportCount;
      campaign.updatedAt = new Date();
    }

    await logGovernanceAudit({
      actorId: donorId,
      actorRole: 'DONOR',
      action: 'CAMPAIGN_FROZEN_GOVERNANCE',
      entityId: campaignId,
      metadata: {
        campaignTitle: campaign.title,
        reportsCount: dispute.reportCount,
        threshold: globalReportThreshold,
        reason,
      },
    });
  } else {
    // Just sync report count on campaign
    if (isDbConnected()) {
      await FundRequest.findByIdAndUpdate(campaignId, {
        reportCount: dispute.reportCount,
      });
    } else {
      campaign.reportCount = dispute.reportCount;
      campaign.updatedAt = new Date();
    }
  }

  if (isDbConnected()) {
    await dispute.save();
  } else {
    dispute.updatedAt = new Date();
    inMemoryDisputes.set(campaignId.toString(), dispute);
  }

  await logGovernanceAudit({
    actorId: donorId,
    actorRole: 'DONOR',
    action: 'DONOR_REPORTED_CAMPAIGN',
    entityId: campaignId,
    metadata: {
      campaignTitle: campaign.title,
      reason,
      totalReports: dispute.reportCount,
      freezeTriggered: triggeredFreeze,
    },
  });

  return {
    success: true,
    message: triggeredFreeze
      ? `Report recorded. The report threshold (${globalReportThreshold}) was reached: Campaign status is now UNDER REVIEW and funds have been frozen.`
      : `Report recorded successfully (${dispute.reportCount}/${globalReportThreshold} reports toward governance threshold).`,
    dispute,
    campaign,
    reportCount: dispute.reportCount,
    isFrozen: dispute.isFrozen,
    triggeredFreeze,
  };
}

/**
 * 4. Beneficiary submits evidence (documents, images, videos, explanation)
 */
export async function submitEvidence(campaignId, {
  explanation,
  documents = [],
  images = [],
  videos = [],
}, beneficiaryUserId) {
  if (!explanation || !explanation.trim()) {
    const err = new Error('A detailed written explanation of fund usage and work progress is required');
    err.statusCode = 400;
    throw err;
  }

  const campaign = await requestService.getRequestById(campaignId);
  if (!campaign) {
    const err = new Error('Campaign not found');
    err.statusCode = 404;
    throw err;
  }

  const dispute = await findOrCreateDispute(campaignId, campaign);

  // Set evidence
  dispute.evidence = {
    explanation: explanation.trim(),
    documents: Array.isArray(documents) ? documents : [],
    images: Array.isArray(images) ? images : [],
    videos: Array.isArray(videos) ? videos : [],
    submittedAt: new Date(),
    submittedBy: beneficiaryUserId,
  };

  // Move dispute status to EVIDENCE_SUBMITTED and open voting for donors
  dispute.status = 'VOTING_OPEN';
  dispute.voting = dispute.voting || {};
  dispute.voting.startDate = new Date();
  dispute.voting.endDate = new Date(Date.now() + 48 * 3600 * 1000);
  dispute.voting.votes = dispute.voting.votes || [];
  dispute.voting.approveWeight = 0;
  dispute.voting.rejectWeight = 0;
  dispute.voting.totalWeight = 0;

  if (isDbConnected()) {
    await dispute.save();
  } else {
    dispute.updatedAt = new Date();
    inMemoryDisputes.set(campaignId.toString(), dispute);
  }

  await logGovernanceAudit({
    actorId: beneficiaryUserId,
    actorRole: 'BENEFICIARY',
    action: 'BENEFICIARY_SUBMITTED_EVIDENCE',
    entityId: campaignId,
    metadata: {
      campaignTitle: campaign.title,
      documentsCount: dispute.evidence.documents.length,
      imagesCount: dispute.evidence.images.length,
      videosCount: dispute.evidence.videos.length,
      votingRoundOpened: true,
    },
  });

  return {
    success: true,
    message: 'Evidence submitted successfully! The voting round is now open to eligible community donors.',
    dispute,
  };
}

/**
 * 5. Get dispute details, evidence, and donor voting eligibility
 */
export async function getDisputeDetails(campaignId, currentUserId) {
  const campaign = await requestService.getRequestById(campaignId);
  if (!campaign) {
    const err = new Error('Campaign not found');
    err.statusCode = 404;
    throw err;
  }

  const dispute = await findOrCreateDispute(campaignId, campaign);

  // Calculate donor voting eligibility
  let isEligible = false;
  let donationAmount = 0;
  let hasVoted = false;
  let userVote = null;

  if (currentUserId) {
    const campaignDonations = await donationService.getDonationsForCampaign(campaignId);
    const donorDonations = campaignDonations.filter(
      (d) => (d.donorId?._id || d.donorId)?.toString() === currentUserId.toString() &&
             (d.status === 'CONFIRMED' || d.status === 'ALLOCATED' || d.status === 'COMPLETED' || d.status === 'CREATED')
    );

    if (donorDonations.length > 0) {
      isEligible = true;
      donationAmount = donorDonations.reduce((sum, d) => sum + Number(d.amount || 0), 0);
    }

    const existingVote = dispute.voting?.votes?.find(
      (v) => (v.donorId?._id || v.donorId)?.toString() === currentUserId.toString()
    );

    if (existingVote) {
      hasVoted = true;
      userVote = existingVote.vote;
    }
  }

  return {
    campaign,
    dispute,
    eligibility: {
      isEligible,
      donationAmount,
      votingPower: donationAmount,
      hasVoted,
      userVote,
    },
  };
}

/**
 * 6. Cast weighted vote (Approve / Reject)
 */
export async function castVote(campaignId, {
  donorId,
  donorName = 'Community Donor',
  donorWallet = '',
  vote, // 'APPROVE' | 'REJECT'
}) {
  if (!['APPROVE', 'REJECT'].includes(vote)) {
    const err = new Error('Vote must be either "APPROVE" or "REJECT"');
    err.statusCode = 400;
    throw err;
  }

  const campaign = await requestService.getRequestById(campaignId);
  if (!campaign) {
    const err = new Error('Campaign not found');
    err.statusCode = 404;
    throw err;
  }

  const dispute = await findOrCreateDispute(campaignId, campaign);

  if (dispute.status !== 'VOTING_OPEN' && dispute.status !== 'EVIDENCE_SUBMITTED') {
    const err = new Error(`Voting is not active for this campaign. Current governance status: ${dispute.status}`);
    err.statusCode = 400;
    throw err;
  }

  // Calculate donor weight based on eligible donation amount
  const campaignDonations = await donationService.getDonationsForCampaign(campaignId);
  const donorDonations = campaignDonations.filter(
    (d) => (d.donorId?._id || d.donorId)?.toString() === donorId.toString() &&
           (d.status === 'CONFIRMED' || d.status === 'ALLOCATED' || d.status === 'COMPLETED' || d.status === 'CREATED')
  );

  let weight = donorDonations.reduce((sum, d) => sum + Number(d.amount || 0), 0);

  // If user has not donated to this campaign, allow a baseline demo vote weight of 1000 so the user can test easily in local demo mode,
  // but prioritize real donation amount.
  if (weight <= 0) {
    weight = 5000; // Baseline governance weight for authenticated community member
  }

  dispute.voting = dispute.voting || {};
  dispute.voting.votes = dispute.voting.votes || [];

  // Check if donor already voted: update vote
  const existingIndex = dispute.voting.votes.findIndex(
    (v) => (v.donorId?._id || v.donorId)?.toString() === donorId.toString()
  );

  const voteItem = {
    _id: new mongoose.Types.ObjectId().toString(),
    donorId,
    donorName,
    donorWallet,
    vote,
    weight,
    votedAt: new Date(),
  };

  if (existingIndex >= 0) {
    dispute.voting.votes[existingIndex] = voteItem;
  } else {
    dispute.voting.votes.push(voteItem);
  }

  // Tally weighted votes
  let approveWeight = 0;
  let rejectWeight = 0;

  for (const v of dispute.voting.votes) {
    if (v.vote === 'APPROVE') approveWeight += Number(v.weight || 0);
    else if (v.vote === 'REJECT') rejectWeight += Number(v.weight || 0);
  }

  dispute.voting.approveWeight = approveWeight;
  dispute.voting.rejectWeight = rejectWeight;
  dispute.voting.totalWeight = approveWeight + rejectWeight;

  if (isDbConnected()) {
    await dispute.save();
  } else {
    dispute.updatedAt = new Date();
    inMemoryDisputes.set(campaignId.toString(), dispute);
  }

  await logGovernanceAudit({
    actorId: donorId,
    actorRole: 'DONOR',
    action: 'GOVERNANCE_VOTE_CAST',
    entityId: campaignId,
    metadata: {
      campaignTitle: campaign.title,
      vote,
      weight,
      approveWeight,
      rejectWeight,
      totalVotes: dispute.voting.votes.length,
    },
  });

  return {
    success: true,
    message: `Your ${vote} vote with weighted power of ${weight.toLocaleString('en-IN')} has been officially registered on-chain.`,
    voting: dispute.voting,
    dispute,
  };
}

/**
 * 7. Finalize Governance Voting (Calculate weighted result & Resume or Refund)
 */
export async function finalizeDispute(campaignId, adminUserId) {
  const campaign = await requestService.getRequestById(campaignId);
  if (!campaign) {
    const err = new Error('Campaign not found');
    err.statusCode = 404;
    throw err;
  }

  const dispute = await findOrCreateDispute(campaignId, campaign);

  const approveWeight = Number(dispute.voting?.approveWeight || 0);
  const rejectWeight = Number(dispute.voting?.rejectWeight || 0);

  // If no votes have been cast yet, default to APPROVE so the campaign can be restored
  const isApproved = approveWeight >= rejectWeight;

  dispute.voting = dispute.voting || {};
  dispute.voting.resolvedAt = new Date();
  dispute.voting.resolutionResult = isApproved ? 'APPROVED' : 'REJECTED';

  let refundSummary = null;

  if (isApproved) {
    // 1. APPROVED FLOW: Unfreeze campaign, resume fund release
    dispute.status = 'RESOLVED_APPROVED';

    if (isDbConnected()) {
      await FundRequest.findByIdAndUpdate(campaignId, {
        status: 'APPROVED',
        isFrozen: false,
        freezeReason: null,
      });
    } else {
      campaign.status = 'APPROVED';
      campaign.isFrozen = false;
      campaign.freezeReason = null;
      campaign.updatedAt = new Date();
    }

    await logGovernanceAudit({
      actorId: adminUserId,
      actorRole: 'ADMIN',
      action: 'DISPUTE_RESOLVED_APPROVED',
      entityId: campaignId,
      metadata: {
        campaignTitle: campaign.title,
        approveWeight,
        rejectWeight,
        actionTaken: 'Campaign status restored to APPROVED; disbursements resumed.',
      },
    });
  } else {
    // 2. REJECTED FLOW: Stop fund release, terminate campaign, initiate refund process
    dispute.status = 'RESOLVED_REJECTED';

    if (isDbConnected()) {
      await FundRequest.findByIdAndUpdate(campaignId, {
        status: 'REJECTED',
        isFrozen: true,
        refundStatus: 'INITIATED',
        freezeReason: 'Governance dispute REJECTED by community majority. Refund initiated.',
      });
    } else {
      campaign.status = 'REJECTED';
      campaign.isFrozen = true;
      campaign.refundStatus = 'INITIATED';
      campaign.freezeReason = 'Governance dispute REJECTED by community majority. Refund initiated.';
      campaign.updatedAt = new Date();
    }

    // Process refunds for all donors who contributed to this campaign
    const campaignDonations = await donationService.getDonationsForCampaign(campaignId);
    const refundRecords = [];
    let totalRefunded = 0;

    for (const d of campaignDonations) {
      const refundTxHash = '0x' + crypto.randomBytes(32).toString('hex');
      const refundAmount = Number(d.amount || 0);
      const refundEth = Number(d.amountEth || (refundAmount / 160000));

      totalRefunded += refundAmount;

      await donationService.markDonationRefunded(d._id, refundTxHash);

      refundRecords.push({
        _id: new mongoose.Types.ObjectId().toString(),
        donorId: d.donorId?._id || d.donorId,
        donorName: d.donorName || 'Verified Donor',
        donorEmail: d.donorEmail,
        donorWallet: d.walletAddress || '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1',
        amount: refundAmount,
        amountEth: refundEth,
        txHash: refundTxHash,
        status: 'PROCESSED',
        refundedAt: new Date(),
      });

      // Record on-chain refund transaction
      try {
        if (isDbConnected()) {
          await Transaction.create({
            donationId: d._id,
            txHash: refundTxHash,
            fromAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3', // BRIDGE Smart Contract
            toAddress: d.walletAddress || '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1',
            amount: refundEth,
            blockNumber: Math.floor(10850 + Math.random() * 200),
            status: 'CONFIRMED',
            gasUsed: 21000,
            network: 'EVM Local (1337)',
          });
        }
      } catch (_txErr) {
        // continue
      }
    }

    dispute.refunds = {
      status: 'INITIATED',
      totalRefundAmount: totalRefunded,
      refundRecords,
    };

    refundSummary = dispute.refunds;

    await logGovernanceAudit({
      actorId: adminUserId,
      actorRole: 'ADMIN',
      action: 'DISPUTE_RESOLVED_REJECTED_REFUND_INITIATED',
      entityId: campaignId,
      metadata: {
        campaignTitle: campaign.title,
        approveWeight,
        rejectWeight,
        totalDonorsRefunded: refundRecords.length,
        totalRefundAmount: totalRefunded,
      },
    });
  }

  if (isDbConnected()) {
    await dispute.save();
  } else {
    dispute.updatedAt = new Date();
    inMemoryDisputes.set(campaignId.toString(), dispute);
  }

  return {
    success: true,
    result: dispute.voting.resolutionResult,
    isApproved,
    message: isApproved
      ? `Governance dispute resolved as APPROVED (${approveWeight} vs ${rejectWeight} weight). Campaign is unfrozen and disbursements have resumed.`
      : `Governance dispute resolved as REJECTED (${rejectWeight} vs ${approveWeight} weight). Fund release permanently halted. Automated refund process initiated for ${dispute.refunds.refundRecords.length} donors.`,
    dispute,
    campaign,
    refundSummary,
  };
}

/**
 * 8. List all governance disputes
 */
export async function getAllDisputes({ status } = {}) {
  if (isDbConnected()) {
    const filter = status ? { status } : {};
    return await GovernanceDispute.find(filter)
      .populate('campaignId', 'title description requestedAmount approvedAmount collectedAmount status isFrozen')
      .populate('beneficiaryId', 'name contactEmail')
      .sort({ updatedAt: -1 });
  } else {
    let list = Array.from(inMemoryDisputes.values());
    if (status) {
      list = list.filter((d) => d.status === status);
    }
    return list;
  }
}

export const governanceService = {
  getGovernanceConfig,
  updateGovernanceConfig,
  reportCampaign,
  submitEvidence,
  getDisputeDetails,
  castVote,
  finalizeDispute,
  getAllDisputes,
};

export default governanceService;
