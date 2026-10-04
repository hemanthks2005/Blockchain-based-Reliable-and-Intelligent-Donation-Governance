import { API_URL } from './api';

const DONATIONS_URL = `${API_URL}/donations`;

function getAuthHeader() {
  const token = localStorage.getItem('bridge_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const donationService = {
  /**
   * 1. Create a donation intent (POST /donations)
   */
  async createDonation(payload) {
    const res = await fetch(`${DONATIONS_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || data.message || 'Failed to create donation intent');
    return data.data;
  },

  /**
   * 2. Submit transaction to Blockchain (POST /donations/:id/submit)
   */
  async submitDonation(donationId, payload = {}) {
    const res = await fetch(`${DONATIONS_URL}/${donationId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || data.message || 'Failed to submit donation to blockchain');
    return data.data;
  },

  /**
   * 3. Get donor's donation history (GET /donations/me)
   */
  async getMyDonations(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${DONATIONS_URL}/me?${query}` : `${DONATIONS_URL}/me`;
    const res = await fetch(url, {
      headers: {
        ...getAuthHeader(),
      },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Failed to fetch donor donations');
    return data.data || [];
  },

  /**
   * 4. Get all donations (GET /donations)
   */
  async getAllDonations(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${DONATIONS_URL}?${query}` : `${DONATIONS_URL}`;
    const res = await fetch(url, {
      headers: {
        ...getAuthHeader(),
      },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Failed to fetch donations');
    return data.data || [];
  },

  /**
   * 5. Track donation lifecycle (GET /donations/:id/track)
   */
  async trackDonation(id) {
    const res = await fetch(`${DONATIONS_URL}/${id}/track`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Failed to fetch donation tracking');
    return data.data;
  },

  /**
   * 6. Get single donation (GET /donations/:id)
   */
  async getDonation(id) {
    const res = await fetch(`${DONATIONS_URL}/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Failed to fetch donation details');
    return data.data;
  },
};

export default donationService;
