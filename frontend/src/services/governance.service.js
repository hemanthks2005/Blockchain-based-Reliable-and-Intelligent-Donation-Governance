import { API_URL } from './api';

const BENEFICIARY_URL = `${API_URL}/beneficiaries`;
const REQUEST_URL = `${API_URL}/requests`;

function getAuthHeader() {
  const token = localStorage.getItem('bridge_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Beneficiary Profile APIs
export async function fetchMyProfile() {
  const res = await fetch(`${BENEFICIARY_URL}/me`, {
    headers: { ...getAuthHeader() },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Failed to fetch profile');
  return data.data;
}

export async function updateMyProfile(profileData) {
  const res = await fetch(`${BENEFICIARY_URL}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(profileData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Failed to update profile');
  return data.data;
}

export async function fetchAllBeneficiaries(status) {
  const url = status ? `${BENEFICIARY_URL}?status=${status}` : BENEFICIARY_URL;
  const res = await fetch(url, {
    headers: { ...getAuthHeader() },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Failed to fetch beneficiaries');
  return data.data;
}

export async function verifyBeneficiary(id, status, remarks) {
  const res = await fetch(`${BENEFICIARY_URL}/${id}/verify`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({ status, remarks }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Failed to verify beneficiary');
  return data.data;
}

// Funding Request APIs
export async function fetchRequests(status) {
  const url = status ? `${REQUEST_URL}?status=${status}` : REQUEST_URL;
  const res = await fetch(url, {
    headers: { ...getAuthHeader() },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Failed to fetch requests');
  return data.data;
}

export async function fetchRequestById(id) {
  const res = await fetch(`${REQUEST_URL}/${id}`, {
    headers: { ...getAuthHeader() },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Failed to fetch request details');
  return data.data;
}

export async function createFundRequest(requestData) {
  const res = await fetch(`${REQUEST_URL}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(requestData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Failed to create request');
  return data.data;
}

export async function updateRequestStatus(id, status, remarks, approvedAmount) {
  const res = await fetch(`${REQUEST_URL}/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({ status, remarks, approvedAmount }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Failed to update request');
  return data.data;
}

// =========================================================================
// GOVERNANCE DISPUTE & VOTING APIS (Report, Evidence, Voting, Resolution)
// =========================================================================

const GOVERNANCE_URL = `${API_URL}/governance`;

export async function fetchGovernanceConfig() {
  const res = await fetch(`${GOVERNANCE_URL}/config`, {
    headers: { ...getAuthHeader() },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Failed to fetch governance config');
  return data.data;
}

export async function updateGovernanceConfig(threshold) {
  const res = await fetch(`${GOVERNANCE_URL}/config`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({ threshold }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Failed to update governance threshold');
  return data.data;
}

export async function reportCampaign(campaignId, reason, details) {
  const res = await fetch(`${GOVERNANCE_URL}/report`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({ campaignId, reason, details }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || data.message || 'Failed to submit campaign report');
  return data;
}

export async function fetchDisputeDetails(campaignId) {
  const res = await fetch(`${GOVERNANCE_URL}/campaigns/${campaignId}`, {
    headers: { ...getAuthHeader() },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Failed to fetch dispute details');
  return data.data;
}

export async function submitEvidence(campaignId, { explanation, documents = [], images = [], videos = [] }) {
  const res = await fetch(`${GOVERNANCE_URL}/evidence/${campaignId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({ explanation, documents, images, videos }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Failed to submit verification evidence');
  return data;
}

export async function castGovernanceVote(campaignId, vote) {
  const res = await fetch(`${GOVERNANCE_URL}/vote/${campaignId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({ vote }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Failed to cast governance vote');
  return data;
}

export async function finalizeGovernanceDispute(campaignId) {
  const res = await fetch(`${GOVERNANCE_URL}/finalize/${campaignId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Failed to finalize governance dispute');
  return data;
}

export async function fetchAllDisputes(status) {
  const url = status ? `${GOVERNANCE_URL}/disputes?status=${status}` : `${GOVERNANCE_URL}/disputes`;
  const res = await fetch(url, {
    headers: { ...getAuthHeader() },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Failed to fetch disputes');
  return data.data || [];
}

