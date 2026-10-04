import { API_URL } from './api';

const BLOCKCHAIN_URL = `${API_URL}/blockchain`;

function getAuthHeader() {
  const token = localStorage.getItem('bridge_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const blockchainService = {
  /**
   * Get blockchain network & contract status
   */
  async getStatus() {
    const res = await fetch(`${BLOCKCHAIN_URL}/status`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Failed to fetch blockchain status');
    return data.data;
  },

  /**
   * Get on-chain donation count
   */
  async getDonationCount() {
    const res = await fetch(`${BLOCKCHAIN_URL}/donations/count`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Failed to fetch donation count');
    return data.data.count;
  },

  /**
   * Get specific donation from smart contract
   */
  async getDonation(id) {
    const res = await fetch(`${BLOCKCHAIN_URL}/donations/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Failed to fetch on-chain donation');
    return data.data;
  },

  /**
   * Get transaction details and receipt
   */
  async getTransaction(hash) {
    const res = await fetch(`${BLOCKCHAIN_URL}/transactions/${hash}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Failed to fetch transaction');
    return data.data;
  },

  /**
   * Execute test transaction
   */
  async executeTestTransaction(txData = {}) {
    const res = await fetch(`${BLOCKCHAIN_URL}/test-transaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(txData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Failed to execute test transaction');
    return data.data;
  },
};

export default blockchainService;
