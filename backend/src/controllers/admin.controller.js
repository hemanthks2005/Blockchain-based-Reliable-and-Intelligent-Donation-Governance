import { adminService } from '../services/admin.service.js';
import { donationService } from '../services/donation.service.js';
import { beneficiaryService } from '../services/beneficiary.service.js';
import { requestService } from '../services/request.service.js';

export const getDashboard = async (req, res, next) => {
  try {
    const stats = await adminService.getDashboardStats();
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

export const getAuditLogs = async (req, res, next) => {
  try {
    const { page, limit, action, entityType } = req.query;
    const result = await adminService.getAuditLogs({ page, limit, action, entityType });
    res.status(200).json({
      success: true,
      data: result.logs,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const getBlockchainRecords = async (req, res, next) => {
  try {
    const { limit } = req.query;
    const result = await adminService.getBlockchainRecords({ limit: parseInt(limit, 10) || 15 });
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getDonations = async (req, res, next) => {
  try {
    const { page, limit, status, requestId } = req.query;
    const result = await donationService.getAllDonations({ page, limit, status, requestId });
    res.status(200).json({
      success: true,
      data: result.donations,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const getDonationReport = async (req, res, next) => {
  try {
    const stats = await adminService.getDashboardStats();
    const donationsData = await donationService.getAllDonations({ limit: 100 });
    res.status(200).json({
      success: true,
      data: {
        totalDonations: stats.totalDonations,
        successfulDonations: stats.successfulDonations,
        totalAmountCollectedInr: stats.totalAmountCollectedInr,
        totalAmountCollectedEth: stats.totalAmountCollectedEth,
        recentDonations: donationsData.donations,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getBeneficiaryReport = async (req, res, next) => {
  try {
    const beneficiaries = await beneficiaryService.getAllBeneficiaries();
    const stats = await adminService.getDashboardStats();
    res.status(200).json({
      success: true,
      data: {
        totalBeneficiaries: stats.beneficiaries,
        pendingVerifications: stats.pendingBeneficiaryVerifications,
        beneficiaries,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getTransactionReport = async (req, res, next) => {
  try {
    const blockchainRecords = await adminService.getBlockchainRecords({ limit: 50 });
    res.status(200).json({
      success: true,
      data: {
        network: blockchainRecords.network,
        totalTransactions: blockchainRecords.totalOnChainDonations,
        transactions: blockchainRecords.records,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};
