import { API_URL } from './api';

const ADMIN_URL = `${API_URL}/admin`;

function getAuthHeader() {
  const token = localStorage.getItem('bridge_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const adminService = {
  /**
   * 1. Get complete Admin Dashboard metrics (GET /admin/dashboard)
   */
  async getDashboard() {
    const res = await fetch(`${ADMIN_URL}/dashboard`, {
      headers: { ...getAuthHeader() },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Failed to fetch admin dashboard metrics');
    return data.data;
  },

  /**
   * 2. Get administrative audit logs (GET /admin/audit-logs)
   */
  async getAuditLogs(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${ADMIN_URL}/audit-logs?${query}` : `${ADMIN_URL}/audit-logs`;
    const res = await fetch(url, {
      headers: { ...getAuthHeader() },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Failed to fetch audit logs');
    return data.data || [];
  },

  /**
   * 3. Get direct on-chain smart contract records (GET /admin/blockchain-records)
   */
  async getBlockchainRecords(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${ADMIN_URL}/blockchain-records?${query}` : `${ADMIN_URL}/blockchain-records`;
    const res = await fetch(url, {
      headers: { ...getAuthHeader() },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Failed to fetch blockchain records');
    return data.data;
  },

  /**
   * 4. Get all donations for monitoring (GET /admin/donations)
   */
  async getDonations(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${ADMIN_URL}/donations?${query}` : `${ADMIN_URL}/donations`;
    const res = await fetch(url, {
      headers: { ...getAuthHeader() },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Failed to fetch donations for admin');
    return data.data || [];
  },

  /**
   * 5. Get reports
   */
  async getDonationReport() {
    const res = await fetch(`${ADMIN_URL}/reports/donations`, {
      headers: { ...getAuthHeader() },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Failed to generate donation report');
    return data.data;
  },

  async getBeneficiaryReport() {
    const res = await fetch(`${ADMIN_URL}/reports/beneficiaries`, {
      headers: { ...getAuthHeader() },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Failed to generate beneficiary report');
    return data.data;
  },

  async getTransactionReport() {
    const res = await fetch(`${ADMIN_URL}/reports/transactions`, {
      headers: { ...getAuthHeader() },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Failed to generate transaction report');
    return data.data;
  },
};

export default adminService;
