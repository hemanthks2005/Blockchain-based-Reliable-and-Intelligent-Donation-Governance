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
  if (!title || !description || !purpose || !requestedAmount) {
    const err = new Error('title, description, purpose, and requestedAmount are required');
    err.statusCode = 400;
    throw err;
  }

  if (isDbConnected()) {
    return await FundRequest.create({
      beneficiaryId,
      title,
      description,
      purpose,
      requestedAmount: Number(requestedAmount),
      status: 'PENDING',
    });
  } else {
    seedDefaultRequests();
    const newId = new mongoose.Types.ObjectId().toString();
    const newReq = {
      _id: newId,
      beneficiaryId: beneficiaryId.toString(),
      beneficiaryName: 'NGO Hope',
      title,
      description,
      purpose,
      requestedAmount: Number(requestedAmount),
      approvedAmount: 0,
      status: 'PENDING',
      reviewedBy: null,
      reviewRemarks: null,
      reviewedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    inMemoryRequests.set(newId, newReq);
    return newReq;
  }
}

export async function getRequests({ role, beneficiaryId, status } = {}) {
  if (isDbConnected()) {
    let filter = {};
    if (role === 'BENEFICIARY' && beneficiaryId) {
      filter.beneficiaryId = beneficiaryId;
    }
    if (status) {
      filter.status = status;
    } else if (role === 'DONOR') {
      // Donors see approved requests by default
      filter.status = 'APPROVED';
    }
    return await FundRequest.find(filter).populate('beneficiaryId', 'name contactEmail verificationStatus').sort({ createdAt: -1 });
  } else {
    seedDefaultRequests();
    let list = Array.from(inMemoryRequests.values());
    if (role === 'BENEFICIARY' && beneficiaryId) {
      list = list.filter((r) => r.beneficiaryId === beneficiaryId.toString());
    }
    if (status) {
      list = list.filter((r) => r.status === status);
    } else if (role === 'DONOR') {
      list = list.filter((r) => r.status === 'APPROVED');
    }
    return list;
  }
}

export async function getRequestById(id) {
  if (isDbConnected()) {
    return await FundRequest.findById(id).populate('beneficiaryId', 'name contactEmail verificationStatus');
  } else {
    seedDefaultRequests();
    return inMemoryRequests.get(id.toString()) || null;
  }
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
