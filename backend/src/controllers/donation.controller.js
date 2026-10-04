import { donationService } from '../services/donation.service.js';

export const createDonation = async (req, res, next) => {
  try {
    const { requestId, amount, amountEth, currency, notes } = req.body;
    const donorId = req.user?.id || req.body.donorId || '67abc1234567890123456781';
    const donorName = req.user?.name || 'Anonymous Donor';
    const donorEmail = req.user?.email || '';

    const donation = await donationService.createDonationIntent({
      donorId,
      donorName,
      donorEmail,
      requestId,
      amount,
      amountEth,
      currency,
      notes,
    });

    res.status(201).json({
      success: true,
      data: {
        _id: donation._id,
        donationId: donation._id,
        status: donation.status,
        amount: donation.amount,
        amountEth: donation.amountEth,
        requestId: donation.requestId,
        requestTitle: donation.requestTitle,
        timeline: donation.timeline,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const submitDonation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { walletAddress, donorPrivateKey } = req.body;

    const result = await donationService.submitDonationToBlockchain(id, {
      walletAddress: walletAddress || req.user?.walletAddress,
      donorPrivateKey,
      donorId: req.user?.id,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getDonation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const donation = await donationService.getDonationById(id);
    res.status(200).json({
      success: true,
      data: donation,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyDonations = async (req, res, next) => {
  try {
    const donorId = req.user?.id || req.query.donorId || '67abc1234567890123456781';
    const { page, limit, status } = req.query;

    const result = await donationService.getMyDonations(donorId, {
      page,
      limit,
      status,
    });

    res.status(200).json({
      success: true,
      data: result.donations,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllDonations = async (req, res, next) => {
  try {
    const { page, limit, status, requestId } = req.query;
    const result = await donationService.getAllDonations({
      page,
      limit,
      status,
      requestId,
    });

    res.status(200).json({
      success: true,
      data: result.donations,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const trackDonation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tracking = await donationService.trackDonation(id);
    res.status(200).json({
      success: true,
      data: tracking,
    });
  } catch (error) {
    next(error);
  }
};
