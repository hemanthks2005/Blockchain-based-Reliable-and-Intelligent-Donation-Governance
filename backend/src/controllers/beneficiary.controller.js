import * as beneficiaryService from '../services/beneficiary.service.js';

export async function createProfile(req, res, next) {
  try {
    const { name, description, contactEmail, contactPhone } = req.body;
    const profile = await beneficiaryService.createOrUpdateProfile(req.user.id, {
      name,
      description,
      contactEmail,
      contactPhone,
    });

    res.status(201).json({
      success: true,
      message: 'Beneficiary profile created successfully. Awaiting administrative verification.',
      data: profile,
    });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, error: { message: err.message } });
    }
    next(err);
  }
}

export async function getMe(req, res, next) {
  try {
    const profile = await beneficiaryService.getProfileByUserId(req.user.id);
    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (err) {
    next(err);
  }
}

export async function getAll(req, res, next) {
  try {
    const { status, page, limit } = req.query;
    const list = await beneficiaryService.getAllBeneficiaries({
      status,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
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
    const profile = await beneficiaryService.getBeneficiaryById(req.params.id);
    if (!profile) {
      return res.status(404).json({ success: false, error: { message: 'Beneficiary not found' } });
    }
    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (err) {
    next(err);
  }
}

export async function verify(req, res, next) {
  try {
    const { status, remarks } = req.body;
    const updated = await beneficiaryService.verifyBeneficiary(
      req.params.id,
      { status, remarks },
      req.user.id
    );

    res.status(200).json({
      success: true,
      message: `Beneficiary profile status updated to ${status}.`,
      data: updated,
    });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, error: { message: err.message } });
    }
    next(err);
  }
}
