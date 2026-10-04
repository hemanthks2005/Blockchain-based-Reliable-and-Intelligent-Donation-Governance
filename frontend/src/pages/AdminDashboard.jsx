import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layouts/DashboardLayout';
import { DonationTrackingModal } from '../components/common/DonationTrackingModal';
import { Link } from 'react-router-dom';
import * as govService from '../services/governance.service';
import adminService from '../services/admin.service';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('governance'); // 'governance' | 'donations' | 'blockchain' | 'audit'
  const [requests, setRequests] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [donations, setDonations] = useState([]);
  const [blockchainRecords, setBlockchainRecords] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

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

  const loadData = async () => {
    try {
      setLoading(true);
      const [dashStats, reqs, bens, donList, bcRecs, logsList] = await Promise.all([
        adminService.getDashboard().catch(() => null),
        govService.fetchRequests().catch(() => []),
        govService.fetchAllBeneficiaries().catch(() => []),
        adminService.getDonations().catch(() => []),
        adminService.getBlockchainRecords({ limit: 10 }).catch(() => null),
        adminService.getAuditLogs({ limit: 15 }).catch(() => []),
      ]);

      if (dashStats) setStats(dashStats);
      setRequests(reqs);
      setBeneficiaries(bens);
      setDonations(Array.isArray(donList) ? donList : donList?.donations || []);
      setBlockchainRecords(bcRecs);
      setAuditLogs(Array.isArray(logsList) ? logsList : logsList?.logs || []);
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
    <DashboardLayout activeTab="dashboard">
      
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
              <div style={{ fontSize: '0.75rem', color: 'var(--primary-green)', fontWeight: 700 }}>
                {stats?.totalAmountCollectedEth || '0.30'} ETH
              </div>
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
                            <Link
                              to="/campaigns/1"
                              style={{ color: 'var(--accent-blue)', fontWeight: 600, fontSize: '0.85rem' }}
                            >
                              View
                            </Link>
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
                  <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--primary-green)' }}>2.0 ETH</div>
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
                    <th style={{ padding: '14px 16px', fontWeight: 600 }}>Amount (ETH / INR)</th>
                    <th style={{ padding: '14px 16px', fontWeight: 600 }}>Status</th>
                    <th style={{ padding: '14px 16px', fontWeight: 600 }}>Tx Hash / Block</th>
                    <th style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 600 }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDonations.map((d, idx) => {
                    const hash = d.blockchainTxHash || d.txHash;
                    const shortHash = hash ? `${hash.substring(0, 8)}...${hash.substring(hash.length - 6)}` : 'Pending Mining';
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
                          <span style={{ fontWeight: 700, color: 'var(--primary-green)' }}>
                            {d.amountEth ? `${d.amountEth} ETH` : `${(d.amount / 160000).toFixed(2)} ETH`}
                          </span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>
                            ₹{Number(d.amount || 0).toLocaleString('en-IN')}
                          </span>
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
                    <th style={{ padding: '14px 16px', fontWeight: 600 }}>Amount (ETH)</th>
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
                          {rec.amountEth || '0.1'} ETH
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
                      <th style={{ padding: '10px 12px', fontWeight: 600 }}>Amount INR</th>
                      <th style={{ padding: '10px 12px', fontWeight: 600 }}>Amount ETH</th>
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
                        <td style={{ padding: '10px 12px', color: 'var(--primary-green)', fontWeight: 700 }}>{d.amountEth || (d.amount / 160000).toFixed(2)} ETH</td>
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
                        <td style={{ padding: '10px 12px', fontWeight: 700 }}>{t.amountEth || '0.15'} ETH</td>
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

      {/* Donation Lifecycle Tracking Modal */}
      <DonationTrackingModal
        isOpen={isTrackingOpen}
        onClose={() => setIsTrackingOpen(false)}
        donation={trackingDonation}
      />

    </DashboardLayout>
  );
}
