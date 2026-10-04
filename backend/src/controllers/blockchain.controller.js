import { blockchainService } from '../services/blockchain.service.js';

export const getStatus = async (req, res, next) => {
  try {
    const status = await blockchainService.getBlockchainStatus();
    res.status(200).json({
      status: 'success',
      data: status,
    });
  } catch (error) {
    next(error);
  }
};

export const getDonation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const donation = await blockchainService.getDonation(id);
    res.status(200).json({
      status: 'success',
      data: donation,
    });
  } catch (error) {
    next(error);
  }
};

export const getDonationCount = async (req, res, next) => {
  try {
    const count = await blockchainService.getDonationCount();
    res.status(200).json({
      status: 'success',
      data: { count },
    });
  } catch (error) {
    next(error);
  }
};

export const getTransaction = async (req, res, next) => {
  try {
    const { hash } = req.params;
    const tx = await blockchainService.getTransaction(hash);
    res.status(200).json({
      status: 'success',
      data: tx,
    });
  } catch (error) {
    next(error);
  }
};

export const executeTestTransaction = async (req, res, next) => {
  try {
    const {
      beneficiaryAddress = '0x2546BcD3c84621e976D8185a91A922aE77ECEc30',
      requestId = 101,
      amountEth = '0.05',
    } = req.body || {};

    const result = await blockchainService.createDonation(
      beneficiaryAddress,
      requestId,
      amountEth
    );

    res.status(200).json({
      status: 'success',
      message: 'Blockchain transaction executed successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
