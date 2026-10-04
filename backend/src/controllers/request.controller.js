import * as requestService from '../services/request.service.js';
import * as beneficiaryService from '../services/beneficiary.service.js';

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

    const newRequest = await requestService.createRequest(
      beneficiary._id || beneficiary.id,
      { title, description, purpose, requestedAmount }
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

    const list = await requestService.getRequests({
      role: req.user?.role || 'DONOR',
      beneficiaryId,
      status,
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
