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
