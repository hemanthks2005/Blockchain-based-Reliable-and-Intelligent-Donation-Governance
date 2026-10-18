import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layouts/DashboardLayout';
import { DonationTrackingModal } from '../components/common/DonationTrackingModal';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import * as govService from '../services/governance.service';
import adminService from '../services/admin.service';
import { useAuth } from '../context/AuthContext';
import { GovernanceDisputeCard } from '../components/common/GovernanceDisputeCard';

export function AdminDashboard() {
  const { currentUser, user, updateProfile } = useAuth();
  const activeUser = currentUser || user;
  const location = useLocation();
  const navigate = useNavigate();

  const currentNavTab = location.hash ? location.hash.replace('#', '') : 'dashboard';

  const [activeTab, setActiveTab] = useState('governance'); // 'governance' | 'donations' | 'blockchain' | 'audit' | 'reports'
  const [requests, setRequests] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [donations, setDonations] = useState([]);
  const [blockchainRecords, setBlockchainRecords] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  // Governance Dispute & Threshold State
  const [governanceConfig, setGovernanceConfig] = useState({ reportThreshold: 2 });
  const [thresholdInput, setThresholdInput] = useState(2);
  const [configSaving, setConfigSaving] = useState(false);
  const [configMessage, setConfigMessage] = useState('');
  const [disputes, setDisputes] = useState([]);
  const [finalizingCampaignId, setFinalizingCampaignId] = useState(null);
  const [expandedDisputeId, setExpandedDisputeId] = useState(null);
  const [viewingRequest, setViewingRequest] = useState(null);

  // Admin Profile State
  const [profileForm, setProfileForm] = useState({
    name: activeUser?.name || 'System Governance Admin',
    email: activeUser?.email || 'admin@bridge.org',
    phone: activeUser?.phone || '+91 99887 76655',
    walletAddress: activeUser?.walletAddress || '0xbDA5747bFD65F08deb54cb465eB87D40e51B197E',
    bio: activeUser?.bio || 'Root smart contract supervisor and multi-signature governance administrator for the BRIDGE protocol.',
    securityAlerts: true,
    twoFactorEnforced: true,
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [profileErrorMsg, setProfileErrorMsg] = useState('');

  useEffect(() => {
    if (activeUser) {
      setProfileForm((prev) => ({
        ...prev,
        name: activeUser.name || '',
        email: activeUser.email || '',
        phone: activeUser.phone || '',
        walletAddress: activeUser.walletAddress || '',
        bio: activeUser.bio || '',
      }));
    }
  }, [activeUser]);

  useEffect(() => {
    if (location.hash === '#donations') setActiveTab('donations');
    else if (location.hash === '#logs') setActiveTab('audit');
    else if (location.hash === '#blockchain') setActiveTab('blockchain');
    else if (location.hash === '#reports') setActiveTab('reports');
    else if (location.hash === '#verify' || location.hash === '#approve' || location.hash === '#release') setActiveTab('governance');
  }, [location.hash]);

  const [trackingDonation, setTrackingDonation] = useState(null);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [donationFilter, setDonationFilter] = useState('ALL');

  const [fundReleaseSuccess, setFundReleaseSuccess] = useState(false);
  const [isReleasing, setIsReleasing] = useState(false);

  // Sprint 7 Reports State
  const [reportType, setReportType] = useState('donations'); // 'donations' | 'beneficiaries' | 'transactions' | 'audit'
  const [exportSuccess, setExportSuccess] = useState(false);

  const handleExportReport = () => {
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 4000);
  };

  const handleConnectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts && accounts.length > 0) {
          setProfileForm((prev) => ({ ...prev, walletAddress: accounts[0] }));
          setProfileSuccessMsg(`Retrieved admin address from MetaMask: ${accounts[0]}`);
          setTimeout(() => setProfileSuccessMsg(''), 4000);
        }
      } catch (err) {
        setProfileErrorMsg(err.message || 'MetaMask connection rejected');
        setTimeout(() => setProfileErrorMsg(''), 4000);
      }
    } else {
      setProfileErrorMsg('MetaMask extension not detected. You can paste your admin 0x... address manually.');
      setTimeout(() => setProfileErrorMsg(''), 5000);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profileForm.name || !profileForm.name.trim()) {
      setProfileErrorMsg('Admin Name is required.');
      return;
    }
    if (!profileForm.email || !profileForm.email.trim()) {
      setProfileErrorMsg('Admin Email is required.');
      return;
    }

    setProfileSaving(true);
    setProfileSuccessMsg('');
    setProfileErrorMsg('');

    try {
      await updateProfile({
        name: profileForm.name.trim(),
        email: profileForm.email.trim(),
        phone: profileForm.phone ? profileForm.phone.trim() : '',
        walletAddress: profileForm.walletAddress ? profileForm.walletAddress.trim() : null,
        bio: profileForm.bio ? profileForm.bio.trim() : '',
      });

      setProfileSuccessMsg('Admin profile updated successfully! All changes are now active.');
      setTimeout(() => setProfileSuccessMsg(''), 5000);
    } catch (err) {
      setProfileErrorMsg(err.message || 'Failed to update admin profile. Please try again.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleResetProfile = () => {
    if (activeUser) {
      setProfileForm({
        name: activeUser.name || 'System Governance Admin',
        email: activeUser.email || 'admin@bridge.org',
        phone: activeUser.phone || '',
        walletAddress: activeUser.walletAddress || '0xbDA5747bFD65F08deb54cb465eB87D40e51B197E',
        bio: activeUser.bio || 'Root smart contract supervisor and multi-signature governance administrator for the BRIDGE protocol.',
        securityAlerts: true,
        twoFactorEnforced: true,
      });
      setProfileSuccessMsg('Admin profile form reset to saved values.');
      setTimeout(() => setProfileSuccessMsg(''), 3000);
    }
  };

  const adminInitials = (profileForm.name || activeUser?.name || 'Admin')
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();


  const loadData = async () => {
    try {
      setLoading(true);
      const [dashStats, reqs, bens, donList, bcRecs, logsList, govConfig, disputeList] = await Promise.all([
        adminService.getDashboard().catch(() => null),
        govService.fetchRequests().catch(() => []),
        govService.fetchAllBeneficiaries().catch(() => []),
        adminService.getDonations().catch(() => []),
        adminService.getBlockchainRecords({ limit: 10 }).catch(() => null),
        adminService.getAuditLogs({ limit: 15 }).catch(() => []),
        govService.fetchGovernanceConfig().catch(() => ({ reportThreshold: 2 })),
        govService.fetchAllDisputes().catch(() => []),
      ]);

      if (dashStats) setStats(dashStats);
      setRequests(reqs);
      setBeneficiaries(bens);
      setDonations(Array.isArray(donList) ? donList : donList?.donations || []);
      setBlockchainRecords(bcRecs);
      setAuditLogs(Array.isArray(logsList) ? logsList : logsList?.logs || []);
      if (govConfig) {
        setGovernanceConfig(govConfig);
        setThresholdInput(govConfig.reportThreshold || 2);
      }
      if (disputeList) {
        setDisputes(Array.isArray(disputeList) ? disputeList : []);
      }
    } catch (_err) {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApproveRequest = async (id, title) => {
    try {
      await govService.updateRequestStatus(id, 'APPROVED', 'Budget & purpose audited by Governance');
      setRequests((prev) =>
        prev.map((r) => ((r._id || r.id) === id ? { ...r, status: 'APPROVED' } : r))
      );
      setFeedback(`Approved request "${title}" successfully!`);
      setTimeout(() => setFeedback(null), 4000);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to approve request');
    }
  };

  const handleRejectRequest = async (id, title) => {
    try {
      await govService.updateRequestStatus(id, 'REJECTED', 'Documentation insufficient');
      setRequests((prev) =>
        prev.map((r) => ((r._id || r.id) === id ? { ...r, status: 'REJECTED' } : r))
      );
      setFeedback(`Rejected request "${title}".`);
      setTimeout(() => setFeedback(null), 4000);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to reject request');
    }
  };

  const handleVerifyBeneficiary = async (id, name, status) => {
    try {
      await govService.verifyBeneficiary(id, status, 'Audit complete');
      setBeneficiaries((prev) =>
        prev.map((b) => ((b._id || b.id) === id ? { ...b, verificationStatus: status } : b))
      );
      setFeedback(`Beneficiary "${name}" verification status updated to ${status}!`);
      setTimeout(() => setFeedback(null), 4000);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to update verification status');
    }
  };

  const handleUpdateThreshold = async (e) => {
    e.preventDefault();
    const val = parseInt(thresholdInput, 10);
    if (isNaN(val) || val < 1) {
      alert('Threshold must be at least 1 report.');
      return;
    }
    try {
      setConfigSaving(true);
      const updated = await govService.updateGovernanceConfig(val);
      setGovernanceConfig(updated);
      setConfigMessage(`✅ Report freeze threshold successfully updated to ${val} reports!`);
      setTimeout(() => setConfigMessage(''), 4500);
    } catch (err) {
      alert(err.message || 'Failed to update threshold');
    } finally {
      setConfigSaving(false);
    }
  };

  const handleAdminFinalizeDispute = async (campaignId, title) => {
    if (
      !window.confirm(
        `Finalize governance dispute for "${title || campaignId}"?\n\nThis will compute weighted donor votes. If rejected, automated refunds will be initiated to all contributing donors.`
      )
    ) {
      return;
    }
    try {
      setFinalizingCampaignId(campaignId);
      const res = await govService.finalizeGovernanceDispute(campaignId);
      setFeedback(res.message || 'Governance dispute finalized successfully.');
      setTimeout(() => setFeedback(null), 5000);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to finalize dispute');
    } finally {
      setFinalizingCampaignId(null);
    }
  };

  const handleExecuteRelease = () => {
    setIsReleasing(true);
    setTimeout(() => {
      setIsReleasing(false);
      setFundReleaseSuccess(true);
      setTimeout(() => setFundReleaseSuccess(false), 5000);
    }, 900);
  };

  const pendingRequestsCount = requests.filter((r) => r.status === 'PENDING').length;
  const pendingBeneficiariesCount = beneficiaries.filter(
    (b) => b.verificationStatus === 'PENDING_VERIFICATION' || b.verificationStatus === 'PENDING'
  ).length;

  const filteredDonations = donationFilter === 'ALL'
    ? donations
    : donations.filter((d) => d.status === donationFilter);

  return (
    <DashboardLayout activeTab={currentNavTab}>
      
      {currentNavTab === 'profile' ? (
        /* ============================================================== */
        /* FULL INTERACTIVE SYSTEM GOVERNANCE ADMIN PROFILE & SETTINGS   */
        /* ============================================================== */
        <div>
          {/* Breadcrumb & Section Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                <Link to="/admin" style={{ color: 'var(--primary-green)', fontWeight: 600 }}>Governance Overview</Link>
                <span>/</span>
                <span style={{ color: 'var(--text-dark)', fontWeight: 600 }}>Admin Profile & Security Settings</span>
              </div>
              <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-dark)', margin: 0 }}>
                System Governance Admin Profile
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', margin: '4px 0 0 0' }}>
                Manage root administrator credentials, Multi-Sig Ethereum wallet address, and governance security parameters.
              </p>
            </div>

            <Link
              to="/admin"
              className="btn-secondary"
              style={{ padding: '8px 16px', fontSize: '0.84rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              ← Back to Governance Overview
            </Link>
          </div>

          {/* Feedback Banners */}
          {profileSuccessMsg && (
            <div
              style={{
                padding: '14px 18px',
                backgroundColor: 'var(--primary-green-light)',
                border: '1px solid var(--primary-green-border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--primary-green-hover)',
                fontSize: '0.9rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '24px',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.25rem' }}>✓</span>
                <span>{profileSuccessMsg}</span>
              </div>
              <button
                onClick={() => setProfileSuccessMsg('')}
                style={{ fontSize: '1rem', color: 'var(--primary-green-hover)', cursor: 'pointer', padding: '2px 6px' }}
              >
                ✕
              </button>
            </div>
          )}

          {profileErrorMsg && (
            <div
              style={{
                padding: '14px 18px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 'var(--radius-md)',
                color: '#b91c1c',
                fontSize: '0.9rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '24px',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.25rem' }}>⚠️</span>
                <span>{profileErrorMsg}</span>
              </div>
              <button
                onClick={() => setProfileErrorMsg('')}
                style={{ fontSize: '1rem', color: '#b91c1c', cursor: 'pointer', padding: '2px 6px' }}
              >
                ✕
              </button>
            </div>
          )}

          {/* Two-Column Admin Profile Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '24px',
              alignItems: 'start',
            }}
          >
            {/* Column 1: Identity & Governance Authority Card */}
            <div className="bridge-card" style={{ padding: '28px' }}>
              {/* Avatar with Initials */}
              <div
                style={{
                  width: '88px',
                  height: '88px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.1rem',
                  fontWeight: 800,
                  color: '#ffffff',
                  boxShadow: '0 8px 16px rgba(124, 58, 237, 0.25)',
                  margin: '0 auto 16px auto',
                }}
              >
                {adminInitials}
              </div>

              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-dark)', textAlign: 'center', margin: '0 0 4px 0' }}>
                {profileForm.name || activeUser?.name || 'System Governance Admin'}
              </h2>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '16px' }}>
                {profileForm.email || activeUser?.email}
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
                <span className="badge-approved" style={{ fontSize: '0.74rem' }}>
                  🛡️ Root Governance Admin
                </span>
                <span
                  style={{
                    fontSize: '0.74rem',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    backgroundColor: 'var(--accent-purple-light)',
                    color: 'var(--accent-purple)',
                    fontWeight: 700,
                    border: '1px solid var(--accent-purple-border)',
                  }}
                >
                  Multi-Sig Signer
                </span>
              </div>

              {/* Protocol Summary Stats */}
              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.84rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Active Beneficiaries:</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-dark)' }}>
                    {stats?.beneficiaries ?? beneficiaries.length} Registered
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.84rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Pending Review Queue:</span>
                  <span style={{ fontWeight: 700, color: 'var(--danger-red)' }}>
                    {pendingRequestsCount + pendingBeneficiariesCount} Items Awaiting
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.84rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Total Processed Volume:</span>
                  <span style={{ fontWeight: 700, color: 'var(--primary-green)' }}>
                    ₹ {(stats?.totalAmountCollectedInr || 48000).toLocaleString('en-IN')}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.84rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Node Status:</span>
                  <span style={{ fontWeight: 700, color: 'var(--primary-green)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary-green)', display: 'inline-block' }} />
                    Hardhat RPC (Localhost)
                  </span>
                </div>
              </div>

              {/* Multi-Sig Admin Wallet Box */}
              <div
                style={{
                  marginTop: '20px',
                  padding: '14px',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-light)',
                }}
              >
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                  Root Multi-Sig Wallet Address
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-dark)', wordBreak: 'break-all' }}>
                  {profileForm.walletAddress || activeUser?.walletAddress || '0xbDA5747bFD65F08deb54cb465eB87D40e51B197E'}
                </div>
              </div>
            </div>

            {/* Column 2: Edit Admin Profile Form */}
            <div className="bridge-card" style={{ padding: '28px' }}>
              <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '16px', marginBottom: '22px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-dark)', margin: '0 0 6px 0' }}>
                  Edit Governance Administrator Profile
                </h2>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                  Modify root administration contact channels and governance smart contract wallet address. Click "Save Admin Profile" to persist changes.
                </p>
              </div>

              <form onSubmit={handleSaveProfile}>
                {/* Name & Email Row */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '18px',
                    marginBottom: '18px',
                  }}
                >
                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '6px' }}>
                      Administrator Name <span style={{ color: 'var(--danger-red)' }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      placeholder="e.g. System Governance Admin"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-light)',
                        fontSize: '0.9rem',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '6px' }}>
                      Official Admin Email <span style={{ color: 'var(--danger-red)' }}>*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      placeholder="e.g. admin@bridge.org"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-light)',
                        fontSize: '0.9rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                {/* Phone & Wallet Row */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '18px',
                    marginBottom: '18px',
                  }}
                >
                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '6px' }}>
                      Emergency Hotline / Phone
                    </label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      placeholder="e.g. +91 99887 76655"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-light)',
                        fontSize: '0.9rem',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-dark)' }}>
                        Multi-Sig / Admin Ethereum Address
                      </label>
                      <button
                        type="button"
                        onClick={handleConnectWallet}
                        style={{
                          fontSize: '0.74rem',
                          color: 'var(--accent-blue)',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '2px 8px',
                          backgroundColor: 'var(--accent-blue-light)',
                          borderRadius: '4px',
                          border: '1px solid var(--accent-blue-border)',
                          cursor: 'pointer',
                        }}
                      >
                        🦊 Autofill MetaMask
                      </button>
                    </div>
                    <input
                      type="text"
                      value={profileForm.walletAddress}
                      onChange={(e) => setProfileForm({ ...profileForm, walletAddress: e.target.value })}
                      placeholder="0xbDA5...197E"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-light)',
                        fontSize: '0.84rem',
                        fontFamily: 'var(--font-mono)',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                {/* Bio / Governance Jurisdiction */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '6px' }}>
                    Governance Mandate & Scope
                  </label>
                  <textarea
                    rows="3"
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    placeholder="Governance jurisdiction, supervisory responsibilities, and auditing mandates..."
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-light)',
                      fontSize: '0.9rem',
                      fontFamily: 'inherit',
                      outline: 'none',
                      resize: 'vertical',
                    }}
                  />
                </div>

                {/* Governance Security Settings */}
                <div
                  style={{
                    backgroundColor: 'var(--bg-subtle)',
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    marginBottom: '26px',
                  }}
                >
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '10px' }}>
                    Governance Security & Protocol Safeguards
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-main)', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={profileForm.securityAlerts}
                        onChange={(e) => setProfileForm({ ...profileForm, securityAlerts: e.target.checked })}
                        style={{ accentColor: 'var(--primary-green)', cursor: 'pointer' }}
                      />
                      <span>Receive emergency alerts when unverified campaign milestones request immediate release</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-main)', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={profileForm.twoFactorEnforced}
                        onChange={(e) => setProfileForm({ ...profileForm, twoFactorEnforced: e.target.checked })}
                        style={{ accentColor: 'var(--primary-green)', cursor: 'pointer' }}
                      />
                      <span>Enforce cryptographic signature confirmation before releasing escrow funds to beneficiaries</span>
                    </label>
                  </div>
                </div>

                {/* Form Buttons */}
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', flexWrap: 'wrap', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={handleResetProfile}
                    className="btn-secondary"
                    style={{ padding: '9px 18px', fontSize: '0.86rem', fontWeight: 600 }}
                  >
                    ↺ Reset
                  </button>

                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="btn-primary"
                    style={{
                      padding: '9px 24px',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      opacity: profileSaving ? 0.75 : 1,
                      cursor: profileSaving ? 'wait' : 'pointer',
                    }}
                  >
                    {profileSaving ? 'Saving Admin Profile...' : '💾 Save Admin Profile Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : (
        <>
      
      {/* Alert Banner */}
      {feedback && (
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
          ✓ {feedback}
        </div>
      )}

      {/* 4 Stat Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        {/* Registered Beneficiaries (Purple Tint) */}
        <div className="stat-card-purple">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontSize: '1.4rem' }}>👥</span>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-dark)' }}>
              {stats?.beneficiaries ?? beneficiaries.length}
            </span>
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Registered Beneficiaries
          </div>
        </div>

        {/* Total Campaigns/Requests (Blue Tint) */}
        <div className="stat-card-blue">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontSize: '1.4rem' }}>📁</span>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-dark)' }}>
              {requests.length}
            </span>
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Campaign Requests
          </div>
        </div>

        {/* Pending Approvals (Rose Tint) */}
        <div className="stat-card-rose">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontSize: '1.4rem' }}>⏳</span>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-dark)' }}>
              {pendingRequestsCount + pendingBeneficiariesCount}
            </span>
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Pending Queue Items
          </div>
        </div>

        {/* Total Donations (Green Tint) */}
        <div className="stat-card-green">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontSize: '1.4rem' }}>💵</span>
            <div>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-dark)' }}>
                ₹ {(stats?.totalAmountCollectedInr || 48000).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Total Verified Donations
          </div>
        </div>
      </div>

      {/* Admin Sub-Navigation Tabs (Sprint 6) */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid var(--border-light)',
          paddingBottom: '12px',
          marginBottom: '28px',
          overflowX: 'auto',
        }}
      >
        <button
          onClick={() => setActiveTab('governance')}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            backgroundColor: activeTab === 'governance' ? 'var(--primary-green)' : 'transparent',
            color: activeTab === 'governance' ? '#ffffff' : 'var(--text-muted)',
            fontWeight: 600,
            fontSize: '0.88rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>⚖️</span> Governance & Approvals
          {(pendingRequestsCount + pendingBeneficiariesCount) > 0 && (
            <span
              style={{
                backgroundColor: activeTab === 'governance' ? '#ffffff' : 'var(--danger-red)',
                color: activeTab === 'governance' ? 'var(--primary-green)' : '#ffffff',
                padding: '1px 6px',
                borderRadius: '10px',
                fontSize: '0.72rem',
                fontWeight: 700,
              }}
            >
              {pendingRequestsCount + pendingBeneficiariesCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('donations')}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            backgroundColor: activeTab === 'donations' ? 'var(--primary-green)' : 'transparent',
            color: activeTab === 'donations' ? '#ffffff' : 'var(--text-muted)',
            fontWeight: 600,
            fontSize: '0.88rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>💰</span> Donation Monitoring
          <span
            style={{
              backgroundColor: activeTab === 'donations' ? 'rgba(255,255,255,0.2)' : 'var(--bg-subtle)',
              padding: '1px 6px',
              borderRadius: '10px',
              fontSize: '0.72rem',
            }}
          >
            {donations.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('blockchain')}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            backgroundColor: activeTab === 'blockchain' ? 'var(--primary-green)' : 'transparent',
            color: activeTab === 'blockchain' ? '#ffffff' : 'var(--text-muted)',
            fontWeight: 600,
            fontSize: '0.88rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>⛓️</span> Blockchain Record Viewer
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            backgroundColor: activeTab === 'audit' ? 'var(--primary-green)' : 'transparent',
            color: activeTab === 'audit' ? '#ffffff' : 'var(--text-muted)',
            fontWeight: 600,
            fontSize: '0.88rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>📜</span> Audit Logs
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            backgroundColor: activeTab === 'reports' ? 'var(--primary-green)' : 'transparent',
            color: activeTab === 'reports' ? '#ffffff' : 'var(--text-muted)',
            fontWeight: 600,
            fontSize: '0.88rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>📈</span> Reports & Analytics
        </button>
      </div>

      {/* TAB 1: Governance & Approvals */}
      {activeTab === 'governance' && (
        <div>
          {/* SECTION 1: Beneficiary Verification Queue */}
          <div style={{ marginBottom: '36px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-dark)' }}>
                Beneficiary Organization Verifications
              </h2>
              <span className="badge-pending">{pendingBeneficiariesCount} Awaiting Review</span>
            </div>

            <div className="bridge-card" style={{ overflow: 'hidden' }}>
              <div className="table-responsive">
                <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-light)' }}>
                      <th style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--text-muted)' }}>Organization</th>
                      <th style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--text-muted)' }}>Contact Email</th>
                      <th style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--text-muted)' }}>Phone</th>
                      <th style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--text-muted)' }}>Status</th>
                      <th style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--text-muted)' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {beneficiaries.map((b, idx) => (
                      <tr
                        key={b._id || b.id || idx}
                        style={{
                          borderBottom: idx === beneficiaries.length - 1 ? 'none' : '1px solid var(--border-light)',
                          backgroundColor: '#ffffff',
                        }}
                      >
                        <td style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-dark)' }}>
                          {b.name || b.organizationName}
                        </td>
                        <td style={{ padding: '16px 20px', color: 'var(--text-muted)' }}>
                          {b.contactEmail || b.email}
                        </td>
                        <td style={{ padding: '16px 20px', color: 'var(--text-muted)' }}>
                          {b.contactPhone || 'N/A'}
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <span
                            className={
                              b.verificationStatus === 'VERIFIED'
                                ? 'badge-approved'
                                : b.verificationStatus === 'REJECTED'
                                ? 'stat-card-rose'
                                : 'badge-pending'
                            }
                            style={{ padding: '4px 10px', borderRadius: 'var(--radius-full)' }}
                          >
                            {b.verificationStatus}
                          </span>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          {(b.verificationStatus === 'PENDING_VERIFICATION' || b.verificationStatus === 'PENDING') ? (
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                onClick={() => handleVerifyBeneficiary(b._id || b.id, b.name || b.organizationName, 'VERIFIED')}
                                className="btn-primary"
                                style={{ padding: '6px 14px', fontSize: '0.8rem', borderRadius: 'var(--radius-sm)' }}
                              >
                                Verify
                              </button>
                              <button
                                onClick={() => handleVerifyBeneficiary(b._id || b.id, b.name || b.organizationName, 'REJECTED')}
                                className="btn-danger"
                                style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.82rem', color: 'var(--text-light)' }}>Audited</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* SECTION 2: Campaign Requests Review */}
          <div style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-dark)' }}>
                Recent Campaign Requests Review
              </h2>
              <span className="badge-pending">{pendingRequestsCount} Pending</span>
            </div>

            <div className="bridge-card" style={{ overflow: 'hidden' }}>
              <div className="table-responsive">
                <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-light)' }}>
                      <th style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--text-muted)' }}>Title</th>
                      <th style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--text-muted)' }}>Beneficiary</th>
                      <th style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--text-muted)' }}>Requested Amount</th>
                      <th style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--text-muted)' }}>Status</th>
                      <th style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--text-muted)' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((req, idx) => (
                      <tr
                        key={req._id || req.id || idx}
                        style={{
                          borderBottom: idx === requests.length - 1 ? 'none' : '1px solid var(--border-light)',
                          backgroundColor: '#ffffff',
                        }}
                      >
                        <td style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-dark)' }}>
                          {req.title}
                        </td>
                        <td style={{ padding: '16px 20px', color: 'var(--text-muted)' }}>
                          {req.beneficiaryName || req.beneficiaryId?.name || 'NGO Hope'}
                        </td>
                        <td style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-dark)' }}>
                          ₹ {(req.requestedAmount || 0).toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <span
                            className={
                              req.status === 'APPROVED'
                                ? 'badge-approved'
                                : req.status === 'REJECTED'
                                ? 'stat-card-rose'
                                : 'badge-pending'
                            }
                            style={{ padding: '4px 10px', borderRadius: 'var(--radius-full)' }}
                          >
                            {req.status}
                          </span>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          {req.status === 'PENDING' ? (
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                onClick={() => handleApproveRequest(req._id || req.id, req.title)}
                                className="btn-primary"
                                style={{ padding: '6px 14px', fontSize: '0.8rem', borderRadius: 'var(--radius-sm)' }}
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectRequest(req._id || req.id, req.title)}
                                className="btn-danger"
                                style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setViewingRequest(req)}
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
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* SECTION 3: Smart Contract Fund Release */}
          <div id="release">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '16px' }}>
              Release Funds to Beneficiary (Screen 10)
            </h2>

            {fundReleaseSuccess && (
              <div
                style={{
                  backgroundColor: 'var(--primary-green-light)',
                  border: '1px solid var(--primary-green-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px 20px',
                  color: 'var(--primary-green)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '20px',
                }}
              >
                <span>✓</span> Funds Released Successfully! Smart contract transfer confirmed on-chain.
              </div>
            )}

            <div className="bridge-card" style={{ padding: 'clamp(20px, 3vw, 28px)', maxWidth: '640px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '20px', fontSize: '0.9rem' }}>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>CAMPAIGN</div>
                  <div style={{ fontWeight: 700, color: 'var(--text-dark)' }}>Education for Every Child</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>BENEFICIARY WALLET</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--accent-blue)', wordBreak: 'break-all' }}>
                    0x70997970C51812dc3A010C7d01b50e0d17dc79C8
                  </div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>APPROVED AMOUNT</div>
                  <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--primary-green)' }}>₹ 50,000</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>ESCROW STATUS</div>
                  <span className="badge-approved">Ready for Release</span>
                </div>
              </div>

              <button
                onClick={handleExecuteRelease}
                disabled={isReleasing}
                className="btn-primary"
                style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}
              >
                {isReleasing ? 'Executing Release via Smart Contract...' : 'Release Funds to Beneficiary →'}
              </button>
            </div>
          </div>

          {/* SECTION 4: Suspicious Campaign Reports & Democratic Governance Supervision */}
          <div style={{ marginTop: '40px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-dark)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>⚖️</span> Suspicious Campaign Governance & Democratic Dispute Supervision
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', margin: '4px 0 0 0' }}>
                  Supervise community-flagged campaigns, configure automated freeze thresholds, review beneficiary evidence, and finalize donor-weighted votes.
                </p>
              </div>
              <span className="badge-pending" style={{ fontSize: '0.78rem' }}>
                {disputes.length} Registered Disputes
              </span>
            </div>

            {/* Configurable Threshold Widget */}
            <div
              className="bridge-card"
              style={{
                padding: '20px 24px',
                marginBottom: '24px',
                backgroundColor: 'rgba(5, 150, 105, 0.04)',
                border: '1px solid var(--primary-green-border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ maxWidth: '600px' }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '4px' }}>
                    ⚙️ Configurable Suspicious Report Freeze Threshold
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    When a campaign accumulates this number of independent suspicious reports from donors, its status automatically transitions to <strong>UNDER_REVIEW</strong>, all incoming donations and smart contract fund releases are immediately frozen, and evidence collection opens for the beneficiary.
                  </div>
                </div>

                <form onSubmit={handleUpdateThreshold} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-dark)' }}>
                      Threshold:
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={thresholdInput}
                      onChange={(e) => setThresholdInput(e.target.value)}
                      style={{
                        width: '70px',
                        padding: '6px 10px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-light)',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        textAlign: 'center',
                      }}
                    />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>reports</span>
                  </div>

                  <button
                    type="submit"
                    disabled={configSaving}
                    className="btn-primary"
                    style={{ padding: '7px 16px', fontSize: '0.82rem', whiteSpace: 'nowrap' }}
                  >
                    {configSaving ? 'Saving...' : 'Update Threshold'}
                  </button>
                </form>
              </div>

              {configMessage && (
                <div style={{ marginTop: '10px', fontSize: '0.82rem', color: 'var(--primary-green)', fontWeight: 600 }}>
                  {configMessage}
                </div>
              )}
            </div>

            {/* Disputes Oversight Table */}
            <div className="bridge-card" style={{ overflow: 'hidden' }}>
              <div className="table-responsive">
                <table style={{ width: '100%', minWidth: '750px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-light)' }}>
                      <th style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-muted)' }}>Initiative</th>
                      <th style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-muted)' }}>Beneficiary</th>
                      <th style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-muted)' }}>Reports & Trigger</th>
                      <th style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-muted)' }}>Governance Status</th>
                      <th style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-muted)' }}>Beneficiary Evidence</th>
                      <th style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-muted)' }}>Weighted Votes</th>
                      <th style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {disputes.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                          ✓ No campaigns currently under governance dispute. Platform initiatives are operating normally.
                        </td>
                      </tr>
                    ) : (
                      disputes.map((disp, idx) => {
                        const totalWeight = (disp.approveWeight || 0) + (disp.rejectWeight || 0);
                        const appPct = totalWeight > 0 ? Math.round(((disp.approveWeight || 0) / totalWeight) * 100) : 50;
                        const isExpanded = expandedDisputeId === disp.campaignId;

                        return (
                          <React.Fragment key={disp.campaignId || disp._id || idx}>
                            <tr
                              style={{
                                borderBottom: '1px solid var(--border-light)',
                                backgroundColor: disp.isFrozen ? '#fffcfc' : '#ffffff',
                              }}
                            >
                              <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-dark)' }}>
                                {disp.campaignTitle || 'Campaign Initiative'}
                              </td>
                              <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>
                                {disp.beneficiaryName || 'NGO Beneficiary'}
                              </td>
                              <td style={{ padding: '14px 16px' }}>
                                <span
                                  style={{
                                    backgroundColor: '#fee2e2',
                                    color: '#b91c1c',
                                    padding: '3px 8px',
                                    borderRadius: '12px',
                                    fontSize: '0.74rem',
                                    fontWeight: 700,
                                  }}
                                >
                                  🚨 {disp.reports?.length || 0} reports
                                </span>
                              </td>
                              <td style={{ padding: '14px 16px' }}>
                                <span
                                  className={
                                    disp.status === 'RESOLVED_APPROVED'
                                      ? 'badge-approved'
                                      : disp.status === 'RESOLVED_REJECTED'
                                      ? 'stat-card-rose'
                                      : 'badge-pending'
                                  }
                                  style={{ padding: '3px 8px', fontSize: '0.72rem', borderRadius: '12px' }}
                                >
                                  {disp.status}
                                </span>
                              </td>
                              <td style={{ padding: '14px 16px' }}>
                                {disp.evidenceSubmitted ? (
                                  <span style={{ color: 'var(--primary-green)', fontWeight: 600, fontSize: '0.78rem' }}>
                                    ✓ Submitted ({disp.evidence?.documents?.length || 0} docs, {disp.evidence?.images?.length || 0} pics)
                                  </span>
                                ) : (
                                  <span style={{ color: '#d97706', fontSize: '0.78rem', fontWeight: 500 }}>
                                    ⏳ Awaiting Upload
                                  </span>
                                )}
                              </td>
                              <td style={{ padding: '14px 16px', minWidth: '150px' }}>
                                <div style={{ fontSize: '0.74rem', display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                                  <span style={{ color: 'var(--primary-green)', fontWeight: 600 }}>
                                    Approve: ₹{(disp.approveWeight || 0).toLocaleString('en-IN')}
                                  </span>
                                  <span style={{ color: '#b91c1c', fontWeight: 600 }}>
                                    Reject: ₹{(disp.rejectWeight || 0).toLocaleString('en-IN')}
                                  </span>
                                </div>
                                <div style={{ height: '6px', borderRadius: '3px', backgroundColor: '#fee2e2', overflow: 'hidden' }}>
                                  <div
                                    style={{
                                      height: '100%',
                                      width: `${appPct}%`,
                                      backgroundColor: 'var(--primary-green)',
                                      transition: 'width 0.3s ease',
                                    }}
                                  />
                                </div>
                              </td>
                              <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                                <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                  <button
                                    onClick={() => setExpandedDisputeId(isExpanded ? null : disp.campaignId)}
                                    className="btn-secondary"
                                    style={{ padding: '4px 8px', fontSize: '0.74rem', borderRadius: '4px' }}
                                  >
                                    {isExpanded ? '▲ Hide' : '👁️ Inspect'}
                                  </button>

                                  {disp.status !== 'RESOLVED_APPROVED' && disp.status !== 'RESOLVED_REJECTED' && (
                                    <button
                                      onClick={() => handleAdminFinalizeDispute(disp.campaignId, disp.campaignTitle)}
                                      disabled={finalizingCampaignId === disp.campaignId}
                                      className="btn-primary"
                                      style={{ padding: '4px 10px', fontSize: '0.74rem', borderRadius: '4px', backgroundColor: '#4338ca' }}
                                    >
                                      {finalizingCampaignId === disp.campaignId ? 'Tallying...' : '⚡ Finalize'}
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>

                            {/* Collapsible Inspection Card */}
                            {isExpanded && (
                              <tr style={{ backgroundColor: '#f8fafc' }}>
                                <td colSpan="7" style={{ padding: '16px 20px' }}>
                                  <GovernanceDisputeCard
                                    campaignId={disp.campaignId}
                                    initialDispute={disp}
                                    onFinalized={() => {
                                      loadData();
                                    }}
                                  />
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Donation Monitoring (Sprint 6) */}
      {activeTab === 'donations' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-dark)', margin: 0 }}>
                Platform Donation Monitoring
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                Live supervision of philanthropic transactions across all donors and campaigns
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              {['ALL', 'CONFIRMED', 'CREATED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setDonationFilter(st)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    border: donationFilter === st ? '1px solid var(--primary-green)' : '1px solid var(--border-light)',
                    backgroundColor: donationFilter === st ? 'rgba(5, 150, 105, 0.1)' : 'transparent',
                    color: donationFilter === st ? 'var(--primary-green)' : 'var(--text-muted)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="bridge-card" style={{ overflow: 'hidden' }}>
            <div className="table-responsive">
              <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '14px 16px', fontWeight: 600 }}>Date</th>
                    <th style={{ padding: '14px 16px', fontWeight: 600 }}>Donor</th>
                    <th style={{ padding: '14px 16px', fontWeight: 600 }}>Initiative</th>
                    <th style={{ padding: '14px 16px', fontWeight: 600 }}>Beneficiary</th>
                    <th style={{ padding: '14px 16px', fontWeight: 600 }}>Amount</th>
                    <th style={{ padding: '14px 16px', fontWeight: 600 }}>Status</th>
                    <th style={{ padding: '14px 16px', fontWeight: 600 }}>Payment Ref / Tx</th>
                    <th style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 600 }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDonations.map((d, idx) => {
                    const hash = d.blockchainTxHash || d.txHash || d.razorpayPaymentId;
                    const shortHash = hash ? `${hash.substring(0, 8)}...${hash.substring(hash.length - 6)}` : 'Verified';
                    return (
                      <tr
                        key={d._id || d.donationId || idx}
                        style={{
                          borderBottom: idx === filteredDonations.length - 1 ? 'none' : '1px solid var(--border-light)',
                          backgroundColor: '#ffffff',
                        }}
                      >
                        <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                          {new Date(d.createdAt || Date.now()).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-dark)' }}>
                          {d.donorName || d.donorId?.name || 'Anonymous Donor'}
                        </td>
                        <td style={{ padding: '14px 16px', color: 'var(--text-dark)' }}>
                          {d.requestTitle || 'Education & Healthcare'}
                        </td>
                        <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>
                          {d.beneficiaryName || 'NGO Hope'}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ fontWeight: 700, color: 'var(--primary-green)', fontSize: '0.95rem' }}>
                            ₹{Number(d.amount || 0).toLocaleString('en-IN')}
                          </span>
                          {d.paymentMethod && (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', display: 'block' }}>
                              {d.paymentMethod}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span className="badge-approved" style={{ fontSize: '0.72rem' }}>
                            {d.status}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
                          <div>{shortHash}</div>
                          {d.blockNumber && (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                              Block #{d.blockNumber}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <button
                            onClick={() => {
                              setTrackingDonation(d);
                              setIsTrackingOpen(true);
                            }}
                            className="btn-secondary"
                            style={{ padding: '5px 12px', fontSize: '0.76rem', borderRadius: '4px' }}
                          >
                            🔍 Track
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Blockchain Record Viewer (Sprint 6) */}
      {activeTab === 'blockchain' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-dark)', margin: 0 }}>
                On-Chain Smart Contract Ledger
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                Immutable records queried directly from the `BridgeDonation.sol` EVM contract
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span className="badge-approved">
                {blockchainRecords?.network?.mode === 'live' ? 'GANACHE ACTIVE' : 'EVM EMULATION'}
              </span>
              <button onClick={loadData} className="btn-secondary" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
                ⟳ Refresh Ledger
              </button>
            </div>
          </div>

          {/* Network Header Banner */}
          <div
            style={{
              backgroundColor: 'rgba(5, 150, 105, 0.05)',
              border: '1px solid rgba(5, 150, 105, 0.2)',
              borderRadius: 'var(--radius-sm)',
              padding: '16px 20px',
              marginBottom: '20px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              fontSize: '0.85rem',
            }}
          >
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block' }}>Contract Address:</span>
              <code style={{ color: 'var(--primary-green)', fontWeight: 600 }}>
                {blockchainRecords?.network?.contractAddress || '0x5FbDB2315678afecb367f032d93F642f64180aa3'}
              </code>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block' }}>Network Chain ID:</span>
              <strong style={{ color: 'var(--text-dark)' }}>Chain #{blockchainRecords?.network?.chainId || 1337}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block' }}>Block Height:</span>
              <strong style={{ color: 'var(--primary-green)' }}>#{blockchainRecords?.network?.blockNumber || 10846}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block' }}>Total Smart Contract Donations:</span>
              <strong style={{ color: 'var(--text-dark)', fontSize: '1rem' }}>
                {blockchainRecords?.totalOnChainDonations ?? 0} Recorded
              </strong>
            </div>
          </div>

          {/* On-Chain Records Table */}
          <div className="bridge-card" style={{ overflow: 'hidden' }}>
            <div className="table-responsive">
              <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '14px 16px', fontWeight: 600 }}>Donation ID</th>
                    <th style={{ padding: '14px 16px', fontWeight: 600 }}>Donor Address</th>
                    <th style={{ padding: '14px 16px', fontWeight: 600 }}>Beneficiary Address</th>
                    <th style={{ padding: '14px 16px', fontWeight: 600 }}>Request ID</th>
                    <th style={{ padding: '14px 16px', fontWeight: 600 }}>Amount (INR)</th>
                    <th style={{ padding: '14px 16px', fontWeight: 600 }}>Timestamp</th>
                    <th style={{ padding: '14px 16px', fontWeight: 600 }}>On-Chain State</th>
                  </tr>
                </thead>
                <tbody>
                  {(blockchainRecords?.records || []).length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                        No on-chain records found.
                      </td>
                    </tr>
                  ) : (
                    blockchainRecords.records.map((rec, idx) => (
                      <tr
                        key={rec.donationId || idx}
                        style={{
                          borderBottom: idx === blockchainRecords.records.length - 1 ? 'none' : '1px solid var(--border-light)',
                          backgroundColor: '#ffffff',
                        }}
                      >
                        <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--primary-green)' }}>
                          #{rec.donationId}
                        </td>
                        <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                          {rec.donor ? `${rec.donor.substring(0, 8)}...${rec.donor.substring(34)}` : '0x90F8...c9C1'}
                        </td>
                        <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                          {rec.beneficiary ? `${rec.beneficiary.substring(0, 8)}...${rec.beneficiary.substring(34)}` : '0x7099...79C8'}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          Request #{rec.requestId}
                        </td>
                        <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-dark)' }}>
                          ₹{(Number(rec.amount) || (rec.amountEth ? Math.round(Number(rec.amountEth) * 160000) : 16000)).toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {rec.timestamp ? new Date(rec.timestamp * 1000).toLocaleString() : 'Recent'}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span className="badge-approved" style={{ fontSize: '0.72rem' }}>
                            VALIDATED
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Audit Logs (Sprint 6) */}
      {activeTab === 'audit' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-dark)', margin: 0 }}>
                Administrative Activity & Audit Trail
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                Immutable event stream recording all administrative decisions and lifecycle updates
              </p>
            </div>
            <button onClick={loadData} className="btn-secondary" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
              ⟳ Refresh Logs
            </button>
          </div>

          <div className="bridge-card" style={{ overflow: 'hidden' }}>
            <div className="table-responsive">
              <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '14px 16px', fontWeight: 600 }}>Timestamp</th>
                    <th style={{ padding: '14px 16px', fontWeight: 600 }}>Action</th>
                    <th style={{ padding: '14px 16px', fontWeight: 600 }}>Entity Type</th>
                    <th style={{ padding: '14px 16px', fontWeight: 600 }}>Administrator Role</th>
                    <th style={{ padding: '14px 16px', fontWeight: 600 }}>Audit Metadata</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log, idx) => (
                    <tr
                      key={log._id || idx}
                      style={{
                        borderBottom: idx === auditLogs.length - 1 ? 'none' : '1px solid var(--border-light)',
                        backgroundColor: '#ffffff',
                      }}
                    >
                      <td style={{ padding: '14px 16px', whiteSpace: 'nowrap', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {new Date(log.timestamp || Date.now()).toLocaleString()}
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-dark)' }}>
                        <span className="badge-approved" style={{ fontSize: '0.72rem' }}>
                          {log.action}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-dark)' }}>
                        {log.entityType}
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>
                        {log.actorRole || 'ADMIN'}
                      </td>
                      <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {typeof log.metadata === 'object' ? JSON.stringify(log.metadata) : log.metadata || '{}'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Governance & Audit Reports (Sprint 7) */}
      {activeTab === 'reports' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-dark)', margin: 0 }}>
                Governance & Audit Reports
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                Comprehensive cross-system intelligence and downloadable audit reports
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {exportSuccess && (
                <span className="badge-approved" style={{ fontSize: '0.78rem' }}>
                  ✓ Report Exported to CSV/JSON!
                </span>
              )}
              <button
                onClick={handleExportReport}
                className="btn-primary"
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                📥 Export Active Report
              </button>
            </div>
          </div>

          {/* Report Type Selector */}
          <div
            style={{
              display: 'flex',
              gap: '10px',
              marginBottom: '24px',
              flexWrap: 'wrap',
            }}
          >
            {[
              { id: 'donations', label: '🎁 Donation Report', count: donations.length },
              { id: 'beneficiaries', label: '🏛️ Beneficiary Report', count: beneficiaries.length },
              { id: 'transactions', label: '⛓️ Transaction Report', count: blockchainRecords?.totalOnChainDonations ?? donations.length },
              { id: 'audit', label: '📜 Audit Trail Report', count: auditLogs.length },
            ].map((r) => (
              <button
                key={r.id}
                onClick={() => setReportType(r.id)}
                style={{
                  padding: '10px 16px',
                  borderRadius: 'var(--radius-sm)',
                  border: reportType === r.id ? '1px solid var(--primary-green)' : '1px solid var(--border-light)',
                  backgroundColor: reportType === r.id ? 'rgba(5, 150, 105, 0.08)' : '#ffffff',
                  color: reportType === r.id ? 'var(--primary-green)' : 'var(--text-dark)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>{r.label}</span>
                <span
                  style={{
                    backgroundColor: reportType === r.id ? 'var(--primary-green)' : 'var(--bg-subtle)',
                    color: reportType === r.id ? '#ffffff' : 'var(--text-muted)',
                    padding: '1px 6px',
                    borderRadius: '10px',
                    fontSize: '0.72rem',
                  }}
                >
                  {r.count}
                </span>
              </button>
            ))}
          </div>

          {/* Report Data Display */}
          <div className="bridge-card" style={{ padding: '24px', marginBottom: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-dark)' }}>
                {reportType === 'donations' && 'Philanthropic Contributions & Allocations Ledger'}
                {reportType === 'beneficiaries' && 'Verified NGO & Beneficiary Directory'}
                {reportType === 'transactions' && 'Blockchain Smart Contract Mined Receipts'}
                {reportType === 'audit' && 'System Governance & Administrative Activity'}
              </h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Generated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>

            {/* Donation Report Table */}
            {reportType === 'donations' && (
              <div className="table-responsive">
                <table style={{ width: '100%', minWidth: '650px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '10px 12px', fontWeight: 600 }}>Date</th>
                      <th style={{ padding: '10px 12px', fontWeight: 600 }}>Donor</th>
                      <th style={{ padding: '10px 12px', fontWeight: 600 }}>Campaign</th>
                      <th style={{ padding: '10px 12px', fontWeight: 600 }}>Amount (INR)</th>
                      <th style={{ padding: '10px 12px', fontWeight: 600 }}>Payment Method</th>
                      <th style={{ padding: '10px 12px', fontWeight: 600 }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donations.map((d, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '10px 12px' }}>{new Date(d.createdAt || Date.now()).toLocaleDateString()}</td>
                        <td style={{ padding: '10px 12px', fontWeight: 600 }}>{d.donorName || 'Anonymous'}</td>
                        <td style={{ padding: '10px 12px' }}>{d.requestTitle || 'Community Fund'}</td>
                        <td style={{ padding: '10px 12px', fontWeight: 700 }}>₹{Number(d.amount || 0).toLocaleString('en-IN')}</td>
                        <td style={{ padding: '10px 12px', color: 'var(--accent-blue)', fontWeight: 600 }}>{d.paymentMethod || 'Razorpay / Gateway'}</td>
                        <td style={{ padding: '10px 12px' }}><span className="badge-approved" style={{ fontSize: '0.72rem' }}>{d.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Beneficiary Report Table */}
            {reportType === 'beneficiaries' && (
              <div className="table-responsive">
                <table style={{ width: '100%', minWidth: '650px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '10px 12px', fontWeight: 600 }}>Organization Name</th>
                      <th style={{ padding: '10px 12px', fontWeight: 600 }}>Contact Email</th>
                      <th style={{ padding: '10px 12px', fontWeight: 600 }}>Phone</th>
                      <th style={{ padding: '10px 12px', fontWeight: 600 }}>Verification Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {beneficiaries.map((b, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 600 }}>{b.name || b.organizationName}</td>
                        <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{b.contactEmail || b.email}</td>
                        <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{b.contactPhone || 'N/A'}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <span className={b.verificationStatus === 'VERIFIED' ? 'badge-approved' : 'badge-pending'} style={{ fontSize: '0.72rem' }}>
                            {b.verificationStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Transaction Report Table */}
            {reportType === 'transactions' && (
              <div className="table-responsive">
                <table style={{ width: '100%', minWidth: '650px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '10px 12px', fontWeight: 600 }}>Tx Hash / ID</th>
                      <th style={{ padding: '10px 12px', fontWeight: 600 }}>Mined Block</th>
                      <th style={{ padding: '10px 12px', fontWeight: 600 }}>Sender Address</th>
                      <th style={{ padding: '10px 12px', fontWeight: 600 }}>Amount</th>
                      <th style={{ padding: '10px 12px', fontWeight: 600 }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(blockchainRecords?.records || []).map((t, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--primary-green)' }}>
                          #{t.donationId} ({t.donor ? `${t.donor.substring(0, 8)}...` : '0x90F8...'})
                        </td>
                        <td style={{ padding: '10px 12px' }}>Block #{blockchainRecords?.network?.blockNumber || 10846}</td>
                        <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>{t.donor || '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1'}</td>
                        <td style={{ padding: '10px 12px', fontWeight: 700 }}>₹{(Number(t.amount) || (t.amountEth ? Math.round(Number(t.amountEth) * 160000) : 24000)).toLocaleString('en-IN')}</td>
                        <td style={{ padding: '10px 12px' }}><span className="badge-approved" style={{ fontSize: '0.72rem' }}>SUCCESS</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Audit Trail Report Table */}
            {reportType === 'audit' && (
              <div className="table-responsive">
                <table style={{ width: '100%', minWidth: '650px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '10px 12px', fontWeight: 600 }}>Timestamp</th>
                      <th style={{ padding: '10px 12px', fontWeight: 600 }}>Action</th>
                      <th style={{ padding: '10px 12px', fontWeight: 600 }}>Target Entity</th>
                      <th style={{ padding: '10px 12px', fontWeight: 600 }}>Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((l, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{new Date(l.timestamp || Date.now()).toLocaleString()}</td>
                        <td style={{ padding: '10px 12px', fontWeight: 600 }}>{l.action}</td>
                        <td style={{ padding: '10px 12px' }}>{l.entityType}</td>
                        <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{l.actorRole || 'ADMIN'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
        </>
      )}

      {/* Donation Lifecycle Tracking Modal */}
      <DonationTrackingModal
        isOpen={isTrackingOpen}
        onClose={() => setIsTrackingOpen(false)}
        donation={trackingDonation}
      />

      {/* In-Module Campaign Request Inspection Modal */}
      {viewingRequest && (
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
          onClick={() => setViewingRequest(null)}
        >
          <div
            className="bridge-card"
            style={{
              width: '100%',
              maxWidth: '620px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '24px',
              borderRadius: 'var(--radius-lg, 16px)',
              position: 'relative',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              backgroundColor: '#ffffff',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span
                  className={
                    viewingRequest.status === 'APPROVED'
                      ? 'badge-approved'
                      : viewingRequest.status === 'REJECTED'
                      ? 'stat-card-rose'
                      : 'badge-pending'
                  }
                  style={{ fontSize: '0.74rem', padding: '3px 10px', borderRadius: '12px' }}
                >
                  {viewingRequest.status}
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '8px 0 2px 0', color: 'var(--text-dark)' }}>
                  {viewingRequest.title}
                </h3>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Beneficiary: {viewingRequest.beneficiaryName || viewingRequest.beneficiaryId?.name || 'NGO Beneficiary'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setViewingRequest(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '20px' }}>
              <div style={{ padding: '12px', backgroundColor: 'var(--bg-subtle, #f8fafc)', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block' }}>REQUESTED AMOUNT</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-dark)' }}>
                  ₹ {Number(viewingRequest.requestedAmount || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div style={{ padding: '12px', backgroundColor: 'rgba(5, 150, 105, 0.05)', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--primary-green)', display: 'block' }}>APPROVED AMOUNT</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-green)' }}>
                  ₹ {Number(viewingRequest.approvedAmount || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <h4 style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '6px' }}>
                Purpose / Description
              </h4>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                {viewingRequest.description || viewingRequest.purpose || 'Verified community relief initiative registered under BRIDGE.'}
              </p>
            </div>

            <div style={{ padding: '12px', backgroundColor: 'var(--bg-subtle, #f8fafc)', borderRadius: '8px', fontSize: '0.8rem', marginBottom: '20px' }}>
              <div style={{ marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Wallet: </span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-blue)', wordBreak: 'break-all' }}>
                  {viewingRequest.beneficiaryAddress || viewingRequest.beneficiaryId?.walletAddress || '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'}
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Request ID: </span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{viewingRequest._id || viewingRequest.id}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setViewingRequest(null)}
                className="btn-secondary"
                style={{ padding: '8px 18px', fontSize: '0.85rem' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
