import * as governanceService from '../services/governance.service.js';

export async function reportCampaign(req, res, next) {
  try {
    const { campaignId, reason, details } = req.body;
    const donorId = req.user?.id || req.user?._id;
    const donorName = req.user?.name || 'Anonymous Donor';
    const donorEmail = req.user?.email || '';
    const donorWallet = req.user?.walletAddress || '';

    const result = await governanceService.reportCampaign({
      campaignId,
      donorId,
      donorName,
      donorEmail,
      donorWallet,
      reason,
      details,
    });

    res.status(201).json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, error: { message: err.message } });
    }
    next(err);
  }
}

export async function submitEvidence(req, res, next) {
  try {
    const { campaignId } = req.params;
    const { explanation, documents, images, videos } = req.body;
    const beneficiaryUserId = req.user?.id || req.user?._id;

    const result = await governanceService.submitEvidence(
      campaignId,
      { explanation, documents, images, videos },
      beneficiaryUserId
    );

    res.status(200).json({
      success: true,
      message: result.message,
      data: result.dispute,
    });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, error: { message: err.message } });
    }
    next(err);
  }
}

export async function getDisputeDetails(req, res, next) {
  try {
    const { campaignId } = req.params;
    const currentUserId = req.user?.id || req.user?._id || null;

    const result = await governanceService.getDisputeDetails(campaignId, currentUserId);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, error: { message: err.message } });
    }
    next(err);
  }
}

export async function castVote(req, res, next) {
  try {
    const { campaignId } = req.params;
    const { vote } = req.body;
    const donorId = req.user?.id || req.user?._id;
    const donorName = req.user?.name || 'Community Donor';
    const donorWallet = req.user?.walletAddress || '';

    const result = await governanceService.castVote(campaignId, {
      donorId,
      donorName,
      donorWallet,
      vote,
    });

    res.status(200).json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, error: { message: err.message } });
    }
    next(err);
  }
}

export async function finalizeDispute(req, res, next) {
  try {
    const { campaignId } = req.params;
    const adminUserId = req.user?.id || req.user?._id;

    const result = await governanceService.finalizeDispute(campaignId, adminUserId);

    res.status(200).json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, error: { message: err.message } });
    }
    next(err);
  }
}

export async function getAllDisputes(req, res, next) {
  try {
    const { status } = req.query;
    const list = await governanceService.getAllDisputes({ status });

    res.status(200).json({
      success: true,
      data: list,
    });
  } catch (err) {
    next(err);
  }
}

export async function getConfig(req, res, next) {
  try {
    const config = await governanceService.getGovernanceConfig();
    res.status(200).json({
      success: true,
      data: config,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateConfig(req, res, next) {
  try {
    const { threshold } = req.body;
    const adminUserId = req.user?.id || req.user?._id;
    const updated = await governanceService.updateGovernanceConfig({ threshold, adminUserId });

    res.status(200).json({
      success: true,
      message: `Governance threshold updated to ${threshold} reports successfully.`,
      data: updated,
    });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, error: { message: err.message } });
    }
    next(err);
  }
}
