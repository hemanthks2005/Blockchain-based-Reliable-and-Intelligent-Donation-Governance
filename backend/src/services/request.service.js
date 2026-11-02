import mongoose from 'mongoose';
import { FundRequest } from '../models/FundRequest.js';
import { logger } from '../utils/logger.js';

const inMemoryRequests = new Map();

function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

function seedDefaultRequests() {
  if (inMemoryRequests.size === 0) {
    const demoItems = [
      {
        _id: '67abc1234567890123456801',
        beneficiaryId: '67abc1234567890123456791',
        beneficiaryName: 'NGO Hope',
        title: 'Education for Every Child',
        description: 'Provide quality education, books, and learning resources to underprivileged children in rural areas.',
        purpose: 'Educational supplies and digital learning tablets',
        requestedAmount: 1000000,
        approvedAmount: 1000000,
        status: 'APPROVED',
        reviewedBy: '67abc1234567890123456783',
        reviewRemarks: 'Curriculum and budget breakdown verified',
        reviewedAt: new Date(),
        createdAt: new Date(Date.now() - 15 * 86400000),
        updatedAt: new Date(),
      },
      {
        _id: '67abc1234567890123456802',
        beneficiaryId: '67abc1234567890123456792',
        beneficiaryName: 'Care Foundation',
        title: 'Medical Support',
        description: 'Help critical patients get life-saving essential treatment, surgery assistance, and medicines.',
        purpose: 'Emergency surgery hospital bills and critical care supplies',
        requestedAmount: 800000,
        approvedAmount: 0,
        status: 'PENDING',
        reviewedBy: null,
        reviewRemarks: null,
        reviewedAt: null,
        createdAt: new Date(Date.now() - 5 * 86400000),
        updatedAt: new Date(),
      },
      {
        _id: '67abc1234567890123456803',
        beneficiaryId: '67abc1234567890123456791',
        beneficiaryName: 'Water4All',
        title: 'Clean Water Initiative',
        description: 'Bring clean, safe drinking water to remote villages and schools through solar water wells.',
        purpose: 'Deep tube wells installation and solar pumping filtration',
        requestedAmount: 600000,
        approvedAmount: 600000,
        status: 'APPROVED',
        reviewedBy: '67abc1234567890123456783',
        reviewRemarks: 'Field inspection completed',
        reviewedAt: new Date(),
        createdAt: new Date(Date.now() - 10 * 86400000),
        updatedAt: new Date(),
      },
      {
        _id: '67abc1234567890123456804',
        beneficiaryId: '67abc1234567890123456791',
        beneficiaryName: 'NGO Hope',
        title: 'School Infrastructure',
        description: 'Renovation and sanitation construction for rural primary schools in district 3.',
        purpose: 'Classroom roofs, desks, and clean restroom construction',
        requestedAmount: 1000000,
        approvedAmount: 0,
        status: 'PENDING',
        reviewedBy: null,
        reviewRemarks: null,
        reviewedAt: null,
        createdAt: new Date(Date.now() - 2 * 86400000),
        updatedAt: new Date(),
      },
      {
        _id: '67abc1234567890123456805',
        beneficiaryId: '67abc1234567890123456794',
        beneficiaryName: 'BrightFuture Rural Schools',
        title: 'Rural STEM & Digital Classroom Infrastructure',
        description: 'Provide solar-powered computer labs, STEM kits, and high-speed satellite internet to rural schools.',
        purpose: 'Computer hardware, solar panels, and digital teaching aids',
        requestedAmount: 1200000,
        approvedAmount: 1200000,
        status: 'APPROVED',
        reviewedBy: '67abc1234567890123456783',
        reviewRemarks: 'Vendor quotes and digital syllabus verified',
        reviewedAt: new Date(Date.now() - 4 * 86400000),
        createdAt: new Date(Date.now() - 8 * 86400000),
        updatedAt: new Date(),
      },
      {
        _id: '67abc1234567890123456806',
        beneficiaryId: '67abc1234567890123456792',
        beneficiaryName: 'Care Foundation',
        title: 'Emergency Pediatric Surgery & ICU Aid',
        description: 'Subsidize urgent cardiology and neurological surgeries for underprivileged children in government hospitals.',
        purpose: 'Surgeon fees, ICU bed subsidies, and post-op rehabilitation',
        requestedAmount: 500000,
        approvedAmount: 0,
        status: 'PENDING',
        reviewedBy: null,
        reviewRemarks: null,
        reviewedAt: null,
        createdAt: new Date(Date.now() - 1 * 86400000),
        updatedAt: new Date(),
      },
      {
        _id: '67abc1234567890123456807',
        beneficiaryId: '67abc1234567890123456795',
        beneficiaryName: 'Annapurna Food Relief',
        title: 'Daily Nutritious Meals for 500 Orphaned Children',
        description: 'Wholesome balanced hot meals, fortified milk, and weekly nutrition monitoring for shelter homes.',
        purpose: 'Kitchen groceries, grain silos, and meal transport logistics',
        requestedAmount: 450000,
        approvedAmount: 0,
        status: 'PENDING',
        reviewedBy: null,
        reviewRemarks: null,
        reviewedAt: null,
        createdAt: new Date(Date.now() - 1 * 86400000),
        updatedAt: new Date(),
      },
      {
        _id: '67abc1234567890123456808',
        beneficiaryId: '67abc1234567890123456791',
        beneficiaryName: 'NGO Hope',
        title: 'Bengaluru water scarcity',
        description: 'Provide emergency clean water supply, water tankers, rainwater harvesting filters, and purification to drought-affected communities across Bengaluru.',
        purpose: 'Emergency water supply, distribution logistics, and community filtration',
        requestedAmount: 300000,
        approvedAmount: 300000,
        status: 'APPROVED',
        reviewedBy: '67abc1234567890123456783',
        reviewRemarks: 'Emergency water scarcity relief approved by Governance',
        reviewedAt: new Date(),
        createdAt: new Date(Date.now() - 0.5 * 86400000),
        updatedAt: new Date(),
      },
    ];

    for (const r of demoItems) {
      inMemoryRequests.set(r._id, r);
    }
  }
}

seedDefaultRequests();

export async function createRequest(beneficiaryId, { title, description, purpose, requestedAmount }) {
  if (!title || !requestedAmount) {
    const err = new Error('title and requestedAmount are required');
    err.statusCode = 400;
    throw err;
  }

  const finalPurpose = purpose || title;
  const finalDescription = description || finalPurpose;

  // Resolve beneficiary name
  let beneficiaryName = 'NGO Hope';
  if (isDbConnected()) {
    try {
      const { Beneficiary } = await import('../models/Beneficiary.js');
      const bDoc = await Beneficiary.findById(beneficiaryId);
      if (bDoc?.name) beneficiaryName = bDoc.name;
    } catch (_e) {}
  }

  seedDefaultRequests();
  const newId = new mongoose.Types.ObjectId().toString();
  let createdDoc = null;

  if (isDbConnected()) {
    try {
      createdDoc = await FundRequest.create({
        beneficiaryId,
        beneficiaryName,
        title,
        description: finalDescription,
        purpose: finalPurpose,
        requestedAmount: Number(requestedAmount),
        status: 'PENDING',
      });
      await createdDoc.populate('beneficiaryId', 'name contactEmail verificationStatus');
    } catch (err) {
      logger.warn(`Could not save FundRequest to DB: ${err.message}`);
    }
  }

  const inMemReq = {
    _id: createdDoc ? createdDoc._id.toString() : newId,
    id: createdDoc ? createdDoc._id.toString() : newId,
    beneficiaryId: beneficiaryId.toString(),
    beneficiaryName,
    title,
    description: finalDescription,
    purpose: finalPurpose,
    requestedAmount: Number(requestedAmount),
    approvedAmount: 0,
    collectedAmount: 0,
    status: 'PENDING',
    reviewedBy: null,
    reviewRemarks: null,
    reviewedAt: null,
    createdAt: createdDoc ? createdDoc.createdAt : new Date(),
    updatedAt: createdDoc ? createdDoc.updatedAt : new Date(),
  };
  inMemoryRequests.set(inMemReq._id, inMemReq);

  return createdDoc || inMemReq;
}

export async function getRequests({ role, beneficiaryId, status } = {}) {
  let dbItems = null;

  if (isDbConnected()) {
    try {
      let filter = {};
      if (role === 'BENEFICIARY' && beneficiaryId) {
        filter.beneficiaryId = beneficiaryId;
      }
      if (status && status !== 'ALL') {
        filter.status = status;
      } else if (role === 'DONOR' && !status) {
        // Donors see approved requests by default
        filter.status = 'APPROVED';
      }
      dbItems = await FundRequest.find(filter)
        .populate('beneficiaryId', 'name contactEmail verificationStatus')
        .sort({ createdAt: -1 })
        .lean();

      if (Array.isArray(dbItems) && dbItems.length > 0) {
        for (const item of dbItems) {
          if (!item.beneficiaryName && item.beneficiaryId?.name) {
            item.beneficiaryName = item.beneficiaryId.name;
          }
        }
        return dbItems;
      }
    } catch (err) {
      logger.warn(`Error loading FundRequests from DB: ${err.message}`);
    }
  }

  // Resilient In-Memory Fallback
  seedDefaultRequests();
  let list = Array.from(inMemoryRequests.values());
  if (role === 'BENEFICIARY' && beneficiaryId) {
    list = list.filter((r) => r.beneficiaryId === beneficiaryId.toString());
  }
  if (status && status !== 'ALL') {
    list = list.filter((r) => r.status === status);
  } else if (role === 'DONOR' && !status) {
    list = list.filter((r) => r.status === 'APPROVED');
  }
  list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return list;
}

export async function getRequestById(id) {
  if (isDbConnected()) {
    try {
      const doc = await FundRequest.findById(id).populate('beneficiaryId', 'name contactEmail verificationStatus');
      if (doc) return doc;
    } catch (_e) {}
  }

  seedDefaultRequests();
  return inMemoryRequests.get(id.toString()) || null;
}

export async function updateRequestStatus(id, { status, remarks, approvedAmount }, adminId) {
  const allowed = ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'COMPLETED'];
  if (!allowed.includes(status)) {
    const err = new Error(`Invalid status. Allowed: ${allowed.join(', ')}`);
    err.statusCode = 400;
    throw err;
  }

  if (isDbConnected()) {
    const reqDoc = await FundRequest.findById(id);
    if (!reqDoc) {
      const err = new Error('Fund request not found');
      err.statusCode = 404;
      throw err;
    }
    reqDoc.status = status;
    reqDoc.reviewRemarks = remarks || reqDoc.reviewRemarks;
    if (approvedAmount !== undefined) reqDoc.approvedAmount = Number(approvedAmount);
    else if (status === 'APPROVED' && !reqDoc.approvedAmount) reqDoc.approvedAmount = reqDoc.requestedAmount;
    reqDoc.reviewedBy = adminId;
    reqDoc.reviewedAt = new Date();
    await reqDoc.save();
    return reqDoc;
  } else {
    seedDefaultRequests();
    const reqDoc = inMemoryRequests.get(id.toString());
    if (!reqDoc) {
      const err = new Error('Fund request not found');
      err.statusCode = 404;
      throw err;
    }
    reqDoc.status = status;
    reqDoc.reviewRemarks = remarks || reqDoc.reviewRemarks;
    if (approvedAmount !== undefined) reqDoc.approvedAmount = Number(approvedAmount);
    else if (status === 'APPROVED' && !reqDoc.approvedAmount) reqDoc.approvedAmount = reqDoc.requestedAmount;
    reqDoc.reviewedBy = adminId;
    reqDoc.reviewedAt = new Date();
    reqDoc.updatedAt = new Date();
    return reqDoc;
  }
}

export const requestService = {
  createRequest,
  getRequests,
  getRequestById,
  updateRequestStatus,
};
