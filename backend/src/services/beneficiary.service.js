import mongoose from 'mongoose';
import { Beneficiary } from '../models/Beneficiary.js';
import { logger } from '../utils/logger.js';

// In-memory store fallback for standalone dev mode
const inMemoryBeneficiaries = new Map();

function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

// Seed default beneficiary
function seedDefaultBeneficiary() {
  if (inMemoryBeneficiaries.size === 0) {
    const demoBeneficiary = {
      _id: '67abc1234567890123456791',
      userId: '67abc1234567890123456782', // Beneficiary user ID
      name: 'NGO Hope',
      description: 'Education and health support organization for underprivileged youth',
      contactEmail: 'contact@ngohope.org',
      contactPhone: '+91 98765 43210',
      verificationStatus: 'VERIFIED',
      verificationRemarks: 'Initial organization registration documents verified',
      verifiedBy: '67abc1234567890123456783',
      verifiedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const pendingBeneficiary = {
      _id: '67abc1234567890123456792',
      userId: '67abc1234567890123456785',
      name: 'Care Foundation',
      description: 'Emergency medical aid and critical surgical care assistance',
      contactEmail: 'support@carefoundation.org',
      contactPhone: '+91 91234 56789',
      verificationStatus: 'PENDING_VERIFICATION',
      verificationRemarks: null,
      verifiedBy: null,
      verifiedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    inMemoryBeneficiaries.set(demoBeneficiary._id, demoBeneficiary);
    inMemoryBeneficiaries.set(pendingBeneficiary._id, pendingBeneficiary);
  }
}

seedDefaultBeneficiary();

export async function createOrUpdateProfile(userId, { name, description, contactEmail, contactPhone }) {
  if (isDbConnected()) {
    let profile = await Beneficiary.findOne({ userId });
    if (profile) {
      profile.name = name || profile.name;
      profile.description = description || profile.description;
      profile.contactEmail = contactEmail || profile.contactEmail;
      profile.contactPhone = contactPhone || profile.contactPhone;
      await profile.save();
      return profile;
    }

    profile = await Beneficiary.create({
      userId,
      name,
      description,
      contactEmail,
      contactPhone,
      verificationStatus: 'PENDING_VERIFICATION',
    });
    return profile;
  } else {
    seedDefaultBeneficiary();
    for (const [id, b] of inMemoryBeneficiaries.entries()) {
      if (b.userId === userId.toString()) {
        b.name = name || b.name;
        b.description = description || b.description;
        b.contactEmail = contactEmail || b.contactEmail;
        b.contactPhone = contactPhone || b.contactPhone;
        b.updatedAt = new Date();
        return b;
      }
    }

    const newId = new mongoose.Types.ObjectId().toString();
    const newProfile = {
      _id: newId,
      userId: userId.toString(),
      name,
      description,
      contactEmail,
      contactPhone,
      verificationStatus: 'PENDING_VERIFICATION',
      verificationRemarks: null,
      verifiedBy: null,
      verifiedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    inMemoryBeneficiaries.set(newId, newProfile);
    return newProfile;
  }
}

export async function getProfileByUserId(userId) {
  if (isDbConnected()) {
    return await Beneficiary.findOne({ userId });
  } else {
    seedDefaultBeneficiary();
    for (const b of inMemoryBeneficiaries.values()) {
      if (b.userId === userId.toString()) return b;
    }
    // Auto-create a default profile if beneficiary logs in
    const newId = new mongoose.Types.ObjectId().toString();
    const defaultProfile = {
      _id: newId,
      userId: userId.toString(),
      name: 'NGO Hope',
      description: 'Education and health support organization for underprivileged youth',
      contactEmail: 'beneficiary@bridge.org',
      contactPhone: '+91 98765 43210',
      verificationStatus: 'VERIFIED',
      verificationRemarks: 'Default verified beneficiary',
      verifiedBy: null,
      verifiedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    inMemoryBeneficiaries.set(newId, defaultProfile);
    return defaultProfile;
  }
}

export async function getAllBeneficiaries({ status, page = 1, limit = 20 } = {}) {
  if (isDbConnected()) {
    const filter = status ? { verificationStatus: status } : {};
    return await Beneficiary.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
  } else {
    seedDefaultBeneficiary();
    let list = Array.from(inMemoryBeneficiaries.values());
    if (status) {
      list = list.filter((b) => b.verificationStatus === status);
    }
    return list;
  }
}

export async function getBeneficiaryById(id) {
  if (isDbConnected()) {
    return await Beneficiary.findById(id);
  } else {
    seedDefaultBeneficiary();
    return inMemoryBeneficiaries.get(id.toString()) || null;
  }
}

export async function verifyBeneficiary(id, { status, remarks }, adminId) {
  const allowed = ['PENDING_VERIFICATION', 'VERIFIED', 'REJECTED', 'SUSPENDED'];
  if (!allowed.includes(status)) {
    const err = new Error(`Invalid status. Allowed: ${allowed.join(', ')}`);
    err.statusCode = 400;
    throw err;
  }

  if (isDbConnected()) {
    const beneficiary = await Beneficiary.findById(id);
    if (!beneficiary) {
      const err = new Error('Beneficiary not found');
      err.statusCode = 404;
      throw err;
    }
    beneficiary.verificationStatus = status;
    beneficiary.verificationRemarks = remarks || beneficiary.verificationRemarks;
    beneficiary.verifiedBy = adminId;
    beneficiary.verifiedAt = new Date();
    await beneficiary.save();
    return beneficiary;
  } else {
    seedDefaultBeneficiary();
    const beneficiary = inMemoryBeneficiaries.get(id.toString());
    if (!beneficiary) {
      const err = new Error('Beneficiary not found');
      err.statusCode = 404;
      throw err;
    }
    beneficiary.verificationStatus = status;
    beneficiary.verificationRemarks = remarks || beneficiary.verificationRemarks;
    beneficiary.verifiedBy = adminId;
    beneficiary.verifiedAt = new Date();
    beneficiary.updatedAt = new Date();
    return beneficiary;
  }
}

export const beneficiaryService = {
  createOrUpdateProfile,
  getProfileByUserId,
  getAllBeneficiaries,
  getBeneficiaryById,
  verifyBeneficiary,
};
