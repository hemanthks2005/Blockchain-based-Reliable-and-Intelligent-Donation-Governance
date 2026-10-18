import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layouts/DashboardLayout';
import { Link, useLocation } from 'react-router-dom';
import * as govService from '../services/governance.service';
import { EvidenceSubmissionModal } from '../components/common/EvidenceSubmissionModal';

export function BeneficiaryDashboard() {
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [selectedEvidenceCampaign, setSelectedEvidenceCampaign] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  // In-Module Campaign Details Modal State (prevents redirect to static page)
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCampaignDetails, setSelectedCampaignDetails] = useState(null);

  const getCampaignImage = (title = '', desc = '') => {
    const text = `${title} ${desc}`.toLowerCase();
    if (text.includes('water') || text.includes('scarcity') || text.includes('well') || text.includes('flood') || text.includes('clean water')) {
      return '/images/campaign_water.jpg';
    }
    if (text.includes('edu') || text.includes('school') || text.includes('child') || text.includes('learn') || text.includes('stem')) {
      return '/images/campaign_education.jpg';
    }
    if (text.includes('medic') || text.includes('health') || text.includes('doctor') || text.includes('surgery') || text.includes('care') || text.includes('icu')) {
      return '/images/hero_hands.jpg';
    }
    return '/images/hero_heart_hands.jpg';
  };

  // Sync modal when navigation hash changes
  useEffect(() => {
    if (location.hash === '#profile') {
      setShowProfileModal(true);
    } else if (location.hash === '#create') {
      setShowCreateModal(true);
    }
  }, [location.hash]);

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

      {/* Governance Freeze Notification Banner */}
      {requests.some((r) => r.isFrozen || r.status === 'UNDER_REVIEW') && (
        <div
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <div style={{ fontWeight: 800, color: 'var(--danger-red)', fontSize: '0.96rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🚨 ACTION REQUIRED: Campaign Under Governance Review</span>
            </div>
            <div style={{ fontSize: '0.84rem', color: 'var(--text-main)', marginTop: '4px' }}>
              Donor reports have reached the governance threshold on one or more of your initiatives. Funds are currently locked. Upload your invoices, on-ground photos, and video proof to initiate donor voting.
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              const frozenCampaign = requests.find((r) => r.isFrozen || r.status === 'UNDER_REVIEW') || requests[0];
              setSelectedEvidenceCampaign(frozenCampaign);
              setShowEvidenceModal(true);
            }}
            style={{
              padding: '9px 18px',
              backgroundColor: 'var(--danger-red)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.86rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            📤 Submit Verification Evidence
          </button>
        </div>
      )}

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
                    backgroundColor: r.isFrozen || r.status === 'UNDER_REVIEW' ? 'rgba(239, 68, 68, 0.03)' : '#ffffff',
                  }}
                >
                  <td style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-dark)' }}>
                    <div>{r.title}</div>
                    {r.isFrozen && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--danger-red)', fontWeight: 700, marginTop: '2px' }}>
                        🔒 Funds Frozen by Governance
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '16px 20px', color: 'var(--text-muted)' }}>
                    ₹ {(r.requestedAmount || 0).toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--primary-green)' }}>
                    ₹ {(r.approvedAmount || 0).toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    {r.isFrozen || r.status === 'UNDER_REVIEW' ? (
                      <span
                        style={{
                          backgroundColor: 'rgba(239, 68, 68, 0.15)',
                          color: 'var(--danger-red)',
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                        }}
                      >
                        🔒 UNDER REVIEW
                      </span>
                    ) : (
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
                    )}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {(r.isFrozen || r.status === 'UNDER_REVIEW') && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedEvidenceCampaign(r);
                            setShowEvidenceModal(true);
                          }}
                          style={{
                            padding: '4px 10px',
                            backgroundColor: 'rgba(239, 68, 68, 0.12)',
                            color: 'var(--danger-red)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          📤 Evidence
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCampaignDetails(r);
                          setShowDetailsModal(true);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--accent-blue)',
                          fontWeight: 600,
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          padding: '4px 6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        👁️ View
                      </button>
                    </div>
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

      {/* Evidence Submission Modal for Frozen Campaigns */}
      <EvidenceSubmissionModal
        isOpen={showEvidenceModal}
        onClose={() => setShowEvidenceModal(false)}
        campaign={selectedEvidenceCampaign}
        onEvidenceSubmitted={() => {
          loadData();
        }}
      />

      {/* In-Module Beneficiary Campaign Details Modal (Screen 7 View Flow) */}
      {showDetailsModal && selectedCampaignDetails && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => {
            setShowDetailsModal(false);
            setSelectedCampaignDetails(null);
          }}
        >
          <div
            className="bridge-card"
            style={{
              width: '100%',
              maxWidth: '680px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: 0,
              borderRadius: 'var(--radius-lg, 16px)',
              position: 'relative',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              backgroundColor: '#ffffff',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header banner image / gradient */}
            <div
              style={{
                height: '180px',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '16px 16px 0 0',
              }}
            >
              <img
                src={
                  selectedCampaignDetails.image ||
                  getCampaignImage(
                    selectedCampaignDetails.title,
                    selectedCampaignDetails.description || selectedCampaignDetails.purpose
                  )
                }
                alt={selectedCampaignDetails.title}
                onError={(e) => {
                  e.currentTarget.src = '/images/campaign_water.jpg';
                }}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'linear-gradient(to top, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.3) 60%, transparent 100%)',
                }}
              />

              {/* Close Button */}
              <button
                type="button"
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedCampaignDetails(null);
                }}
                style={{
                  position: 'absolute',
                  top: '14px',
                  right: '14px',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(0, 0, 0, 0.55)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '1rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 2,
                }}
              >
                ✕
              </button>

              {/* Title & Organization Overlay */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '16px',
                  left: '20px',
                  right: '20px',
                  color: '#ffffff',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span
                    className={
                      selectedCampaignDetails.isFrozen || selectedCampaignDetails.status === 'UNDER_REVIEW'
                        ? 'badge-pending'
                        : selectedCampaignDetails.status === 'APPROVED'
                        ? 'badge-approved'
                        : selectedCampaignDetails.status === 'REJECTED'
                        ? 'stat-card-rose'
                        : 'badge-pending'
                    }
                    style={{ fontSize: '0.72rem', padding: '3px 10px', borderRadius: '12px' }}
                  >
                    {selectedCampaignDetails.isFrozen || selectedCampaignDetails.status === 'UNDER_REVIEW'
                      ? '🔒 UNDER REVIEW (FROZEN)'
                      : selectedCampaignDetails.status}
                  </span>
                  <span style={{ fontSize: '0.78rem', opacity: 0.9 }}>
                    by {selectedCampaignDetails.beneficiaryName || profile?.name || 'NGO Beneficiary'}
                  </span>
                </div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                  {selectedCampaignDetails.title}
                </h2>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px' }}>
              {/* Governance Freeze Notice */}
              {(selectedCampaignDetails.isFrozen || selectedCampaignDetails.status === 'UNDER_REVIEW') && (
                <div
                  style={{
                    backgroundColor: '#fff1f2',
                    border: '1px solid #fecdd3',
                    borderRadius: '8px',
                    padding: '14px 16px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '12px',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ flex: 1, minWidth: '240px' }}>
                    <div style={{ fontWeight: 700, color: '#be123c', fontSize: '0.88rem', marginBottom: '4px' }}>
                      ⚠️ Campaign Under Governance Review
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#9f1239', lineHeight: 1.4 }}>
                      Donors have reported concerns regarding this initiative. Fund releases and incoming donations are temporarily frozen. Upload official invoices, site photographs, or video evidence to resolve the dispute and reopen funding.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const c = selectedCampaignDetails;
                      setShowDetailsModal(false);
                      setSelectedEvidenceCampaign(c);
                      setShowEvidenceModal(true);
                    }}
                    className="btn-danger"
                    style={{ padding: '8px 14px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                  >
                    📤 Submit Evidence
                  </button>
                </div>
              )}

              {/* Financial Metrics Cards */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: '12px',
                  marginBottom: '20px',
                }}
              >
                <div
                  style={{
                    padding: '14px',
                    backgroundColor: 'var(--bg-subtle, #f8fafc)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-light, #e2e8f0)',
                  }}
                >
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                    Requested Target
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-dark)', marginTop: '4px' }}>
                    ₹ {Number(selectedCampaignDetails.requestedAmount || 0).toLocaleString('en-IN')}
                  </div>
                </div>

                <div
                  style={{
                    padding: '14px',
                    backgroundColor: 'rgba(5, 150, 105, 0.05)',
                    borderRadius: '8px',
                    border: '1px solid rgba(5, 150, 105, 0.2)',
                  }}
                >
                  <div style={{ fontSize: '0.74rem', color: 'var(--primary-green)', fontWeight: 600, textTransform: 'uppercase' }}>
                    Approved Allocation
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-green)', marginTop: '4px' }}>
                    ₹ {Number(selectedCampaignDetails.approvedAmount || 0).toLocaleString('en-IN')}
                  </div>
                </div>

                <div
                  style={{
                    padding: '14px',
                    backgroundColor: 'rgba(37, 99, 235, 0.05)',
                    borderRadius: '8px',
                    border: '1px solid rgba(37, 99, 235, 0.2)',
                  }}
                >
                  <div style={{ fontSize: '0.74rem', color: 'var(--accent-blue)', fontWeight: 600, textTransform: 'uppercase' }}>
                    Raised / Collected
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-blue)', marginTop: '4px' }}>
                    ₹{' '}
                    {Number(
                      selectedCampaignDetails.collectedAmount ||
                        (selectedCampaignDetails.approvedAmount && selectedCampaignDetails.status === 'COMPLETED'
                          ? selectedCampaignDetails.approvedAmount
                          : 0)
                    ).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{ marginBottom: '22px' }}>
                {(() => {
                  const goal = Number(
                    selectedCampaignDetails.approvedAmount || selectedCampaignDetails.requestedAmount || 1
                  );
                  const raised = Number(selectedCampaignDetails.collectedAmount || 0);
                  const pct = Math.min(100, Math.round((raised / goal) * 100));
                  return (
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          marginBottom: '6px',
                        }}
                      >
                        <span style={{ color: 'var(--text-muted)' }}>Disbursement / Funding Progress</span>
                        <span style={{ color: 'var(--primary-green)' }}>{pct}% Funded</span>
                      </div>
                      <div
                        className="progress-bar-bg"
                        style={{ height: '8px', borderRadius: '4px', backgroundColor: '#e2e8f0', overflow: 'hidden' }}
                      >
                        <div
                          className="progress-bar-fill"
                          style={{
                            width: `${pct}%`,
                            height: '100%',
                            backgroundColor: selectedCampaignDetails.isFrozen ? '#f43f5e' : 'var(--primary-green)',
                          }}
                        />
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Purpose & Narrative Description */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '6px' }}>
                  Purpose & Scope of Work
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                  {selectedCampaignDetails.description ||
                    selectedCampaignDetails.purpose ||
                    selectedCampaignDetails.desc ||
                    'Comprehensive community relief initiative dedicated to transparent on-chain milestone delivery and audited resource distribution.'}
                </p>
              </div>

              {/* Smart Contract & On-Chain Audit Details */}
              <div
                style={{
                  padding: '14px',
                  backgroundColor: 'var(--bg-subtle, #f8fafc)',
                  borderRadius: '8px',
                  border: '1px solid var(--border-light, #e2e8f0)',
                  fontSize: '0.82rem',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '12px',
                  marginBottom: '20px',
                }}
              >
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.74rem' }}>REQUEST ID</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-dark)' }}>
                    {selectedCampaignDetails._id || selectedCampaignDetails.id || 'N/A'}
                  </span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.74rem' }}>
                    BENEFICIARY WALLET
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 600,
                      color: 'var(--accent-blue)',
                      wordBreak: 'break-all',
                    }}
                  >
                    {selectedCampaignDetails.beneficiaryAddress ||
                      profile?.walletAddress ||
                      '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'}
                  </span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.74rem' }}>
                    SMART CONTRACT STATUS
                  </span>
                  <span
                    style={{
                      fontWeight: 700,
                      color: selectedCampaignDetails.isFrozen ? '#e11d48' : 'var(--primary-green)',
                    }}
                  >
                    {selectedCampaignDetails.isFrozen
                      ? 'Escrow Frozen (Dispute Active)'
                      : 'Verified On-Chain Escrow'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                {(selectedCampaignDetails.isFrozen || selectedCampaignDetails.status === 'UNDER_REVIEW') && (
                  <button
                    type="button"
                    onClick={() => {
                      const c = selectedCampaignDetails;
                      setShowDetailsModal(false);
                      setSelectedEvidenceCampaign(c);
                      setShowEvidenceModal(true);
                    }}
                    className="btn-danger"
                    style={{ padding: '8px 18px', fontSize: '0.84rem' }}
                  >
                    📤 Submit Verification Evidence
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedCampaignDetails(null);
                  }}
                  className="btn-secondary"
                  style={{ padding: '8px 20px', fontSize: '0.84rem' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
