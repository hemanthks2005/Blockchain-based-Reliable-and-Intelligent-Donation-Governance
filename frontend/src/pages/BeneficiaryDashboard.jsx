import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layouts/DashboardLayout';
import { Link } from 'react-router-dom';
import * as govService from '../services/governance.service';

export function BeneficiaryDashboard() {
  const [profile, setProfile] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  const [newRequest, setNewRequest] = useState({
    title: '',
    purpose: '',
    description: '',
    requestedAmount: '',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [profData, reqsData] = await Promise.all([
        govService.fetchMyProfile().catch(() => ({
          name: 'NGO Hope',
          contactEmail: 'contact@ngohope.org',
          verificationStatus: 'VERIFIED',
          description: 'Education and health support organization for underprivileged youth',
        })),
        govService.fetchRequests().catch(() => []),
      ]);

      setProfile(profData);
      setRequests(reqsData.length > 0 ? reqsData : [
        { _id: '1', title: 'Education for Every Child', requestedAmount: 1000000, approvedAmount: 850000, status: 'APPROVED' },
        { _id: '2', title: 'Medical Support', requestedAmount: 800000, approvedAmount: 0, status: 'PENDING' },
        { _id: '3', title: 'Clean Water Initiative', requestedAmount: 600000, approvedAmount: 375000, status: 'APPROVED' },
      ]);
    } catch (_err) {
      // Graceful fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    if (!newRequest.title || !newRequest.requestedAmount) return;

    try {
      const created = await govService.createFundRequest(newRequest);
      setRequests((prev) => [created, ...prev]);
      setShowCreateModal(false);
      setNewRequest({ title: '', purpose: '', description: '', requestedAmount: '' });
      setFeedbackMsg('Funding request created successfully and queued for Admin review!');
      setTimeout(() => setFeedbackMsg(null), 5000);
    } catch (err) {
      alert(err.message || 'Failed to create request');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const updated = await govService.updateMyProfile(profile);
      setProfile(updated);
      setShowProfileModal(false);
      setFeedbackMsg('Profile updated! Awaiting admin document verification.');
      setTimeout(() => setFeedbackMsg(null), 5000);
    } catch (err) {
      alert(err.message || 'Failed to update profile');
    }
  };

  const approvedCount = requests.filter((r) => r.status === 'APPROVED').length;
  const pendingCount = requests.filter((r) => r.status === 'PENDING' || r.status === 'UNDER_REVIEW').length;
  const totalReceived = requests
    .filter((r) => r.status === 'APPROVED')
    .reduce((acc, r) => acc + (r.approvedAmount || 0), 0);

  return (
    <DashboardLayout activeTab="dashboard">
      
      {/* Feedback Banner */}
      {feedbackMsg && (
        <div
          style={{
            backgroundColor: 'var(--primary-green-light)',
            border: '1px solid var(--primary-green-border)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 18px',
            color: 'var(--primary-green)',
            fontWeight: 600,
            fontSize: '0.88rem',
            marginBottom: '20px',
          }}
        >
          ✓ {feedbackMsg}
        </div>
      )}

      {/* 3 Stat Cards (Screen 4) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
          gap: '16px',
          marginBottom: '32px',
        }}
      >
        {/* Total Campaigns/Requests (Blue Tint) */}
        <div className="stat-card-blue">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontSize: '1.4rem' }}>📁</span>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-dark)' }}>
              {requests.length}
            </span>
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Active Requests
          </div>
        </div>

        {/* Funds Approved/Received (Green Tint) */}
        <div className="stat-card-green">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontSize: '1.4rem' }}>💵</span>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-dark)' }}>
              ₹ {totalReceived.toLocaleString('en-IN')}
            </span>
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Approved Allocations
          </div>
        </div>

        {/* Pending Requests (Amber Tint) */}
        <div className="stat-card-amber">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontSize: '1.4rem' }}>🛡️</span>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-dark)' }}>
              {pendingCount}
            </span>
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Pending Admin Review
          </div>
        </div>
      </div>

      {/* Organization Status & Profile Strip */}
      <div
        className="bridge-card"
        style={{
          padding: '18px 24px',
          marginBottom: '28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
              {profile?.name || 'NGO Hope'}
            </h3>
            <span
              className={profile?.verificationStatus === 'VERIFIED' ? 'badge-approved' : 'badge-pending'}
            >
              {profile?.verificationStatus === 'VERIFIED' ? '✓ VERIFIED BENEFICIARY' : 'PENDING VERIFICATION'}
            </span>
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            {profile?.description || 'Education and healthcare support organization'} • {profile?.contactEmail}
          </div>
        </div>

        <button
          onClick={() => setShowProfileModal(true)}
          className="btn-secondary"
          style={{ padding: '8px 16px', fontSize: '0.85rem' }}
        >
          Edit Profile
        </button>
      </div>

      {/* My Campaigns / Requests Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-dark)' }}>
          My Funding Requests
        </h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary"
          style={{ padding: '8px 18px', fontSize: '0.88rem' }}
        >
          + Create Request
        </button>
      </div>

      {/* Campaigns Table with table-responsive wrapper */}
      <div className="bridge-card" style={{ overflow: 'hidden' }}>
        <div className="table-responsive">
          <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-light)' }}>
                <th style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--text-muted)' }}>Title</th>
                <th style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--text-muted)' }}>Requested Goal</th>
                <th style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--text-muted)' }}>Approved / Raised</th>
                <th style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--text-muted)' }}>Review Status</th>
                <th style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--text-muted)' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r, idx) => (
                <tr
                  key={r._id || r.id || idx}
                  style={{
                    borderBottom: idx === requests.length - 1 ? 'none' : '1px solid var(--border-light)',
                    backgroundColor: '#ffffff',
                  }}
                >
                  <td style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-dark)' }}>
                    {r.title}
                  </td>
                  <td style={{ padding: '16px 20px', color: 'var(--text-muted)' }}>
                    ₹ {(r.requestedAmount || 0).toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--primary-green)' }}>
                    ₹ {(r.approvedAmount || 0).toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span
                      className={
                        r.status === 'APPROVED'
                          ? 'badge-approved'
                          : r.status === 'REJECTED'
                          ? 'stat-card-rose'
                          : 'badge-pending'
                      }
                      style={{ padding: '4px 10px', borderRadius: 'var(--radius-full)' }}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <Link
                      to="/campaigns/1"
                      style={{
                        color: 'var(--accent-blue)',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                      }}
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Request Modal */}
      {showCreateModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="bridge-card"
            style={{ width: '100%', maxWidth: '500px', padding: 'clamp(20px, 4vw, 32px)', position: 'relative' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '8px' }}>
              Create New Funding Request
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Submit an initiative with a verifiable purpose for administrative review.
            </p>

            <form onSubmit={handleCreateRequest}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Request Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Solar Classroom Lighting & Sanitation"
                  value={newRequest.title}
                  onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
                  className="bridge-input"
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Requested Amount (₹ INR) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="500000"
                  value={newRequest.requestedAmount}
                  onChange={(e) => setNewRequest({ ...newRequest, requestedAmount: e.target.value })}
                  className="bridge-input"
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Specific Purpose *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Purchase of 20 solar battery banks and wiring"
                  value={newRequest.purpose}
                  onChange={(e) => setNewRequest({ ...newRequest, purpose: e.target.value })}
                  className="bridge-input"
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Detailed Description & Timeline
                </label>
                <textarea
                  rows="3"
                  placeholder="Provide details on target beneficiaries and expected impact..."
                  value={newRequest.description}
                  onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                  className="bridge-input"
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary"
                  style={{ padding: '8px 16px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: '8px 18px' }}
                >
                  Submit for Admin Review →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showProfileModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => setShowProfileModal(false)}
        >
          <div
            className="bridge-card"
            style={{ width: '100%', maxWidth: '480px', padding: 'clamp(20px, 4vw, 32px)', position: 'relative' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '16px' }}>
              Beneficiary Profile
            </h2>
            <form onSubmit={handleUpdateProfile}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Organization Name *
                </label>
                <input
                  type="text"
                  required
                  value={profile?.name || ''}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="bridge-input"
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Contact Email *
                </label>
                <input
                  type="email"
                  required
                  value={profile?.contactEmail || ''}
                  onChange={(e) => setProfile({ ...profile, contactEmail: e.target.value })}
                  className="bridge-input"
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Contact Phone
                </label>
                <input
                  type="text"
                  value={profile?.contactPhone || ''}
                  onChange={(e) => setProfile({ ...profile, contactPhone: e.target.value })}
                  className="bridge-input"
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                  Mission & Scope
                </label>
                <textarea
                  rows="3"
                  value={profile?.description || ''}
                  onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                  className="bridge-input"
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="btn-secondary"
                  style={{ padding: '8px 16px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: '8px 18px' }}
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
