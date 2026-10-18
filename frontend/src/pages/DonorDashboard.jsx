import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layouts/DashboardLayout';
import { DonationModal } from '../components/common/DonationModal';
import { DonationTrackingModal } from '../components/common/DonationTrackingModal';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import donationService from '../services/donation.service';
import * as govService from '../services/governance.service';
import { useAuth } from '../context/AuthContext';
import { ReportCampaignModal } from '../components/common/ReportCampaignModal';
import { GovernanceDisputeCard } from '../components/common/GovernanceDisputeCard';

export function DonorDashboard() {
  const { currentUser, user, updateProfile } = useAuth();
  const activeUser = currentUser || user;
  const location = useLocation();
  const navigate = useNavigate();

  const currentTab = location.hash ? location.hash.replace('#', '') : 'dashboard';

  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [trackingDonation, setTrackingDonation] = useState(null);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [myDonations, setMyDonations] = useState([]);
  const [loadingDonations, setLoadingDonations] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Governance Dispute & Reporting State
  const [activeDisputes, setActiveDisputes] = useState([]);
  const [loadingDisputes, setLoadingDisputes] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportingCampaign, setReportingCampaign] = useState(null);

  // Profile Edit State
  const [profileForm, setProfileForm] = useState({
    name: activeUser?.name || '',
    email: activeUser?.email || '',
    phone: activeUser?.phone || '',
    walletAddress: activeUser?.walletAddress || '',
    bio: activeUser?.bio || '',
    publicName: true,
    emailReceipts: true,
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [profileErrorMsg, setProfileErrorMsg] = useState('');

  // Sync profile form when user changes
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

  // Handle smooth scroll when navigating to #donations or #transactions
  useEffect(() => {
    if (location.hash === '#donations' || location.hash === '#transactions') {
      const el = document.getElementById('donations-history-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location.hash]);

  const [stats, setStats] = useState({
    totalDonatedInr: '₹ 48,000',
    totalDonatedEth: '0.30 ETH',
    campaignsSupported: 2,
    transactions: 2,
  });

  // Helper to resolve relevant campaign imagery
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

  const formatCampaign = (req) => {
    const goalVal = Number(req.approvedAmount || req.requestedAmount || 500000);
    const raisedVal = Number(req.collectedAmount || (req.approvedAmount && req.status === 'COMPLETED' ? req.approvedAmount : 0));
    const percent = Math.min(100, Math.round((raisedVal / (goalVal || 1)) * 100));

    return {
      id: req._id || req.id,
      _id: req._id || req.id,
      title: req.title,
      desc: req.description || req.purpose || req.desc || 'Verified community relief initiative',
      beneficiary: req.beneficiaryName || req.beneficiaryId?.name || 'NGO Hope',
      image: req.image || getCampaignImage(req.title, req.description || req.purpose),
      raised: typeof req.raised === 'string' ? req.raised : `₹${raisedVal.toLocaleString('en-IN')}`,
      goal: typeof req.goal === 'string' ? req.goal : `₹${goalVal.toLocaleString('en-IN')}`,
      percent: typeof req.percent === 'number' ? req.percent : percent,
      beneficiaryAddress: req.beneficiaryAddress || req.beneficiaryId?.walletAddress || '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      status: req.status || 'APPROVED',
      isFrozen: Boolean(req.isFrozen || req.status === 'UNDER_REVIEW'),
      reportCount: req.reportCount || 0,
      freezeReason: req.freezeReason || '',
    };
  };

  const DEFAULT_CAMPAIGNS = [
    {
      id: '67abc1234567890123456801',
      _id: '67abc1234567890123456801',
      title: 'Education for Every Child',
      beneficiary: 'NGO Hope',
      desc: 'Provide quality education, books, and learning resources to underprivileged children in rural areas.',
      image: '/images/campaign_education.jpg',
      raised: '₹8,50,000',
      goal: '₹10,00,000',
      percent: 85,
      beneficiaryAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    },
    {
      id: '67abc1234567890123456802',
      _id: '67abc1234567890123456802',
      title: 'Medical Support',
      beneficiary: 'Care Foundation',
      desc: 'Help critical patients get life-saving essential surgery assistance, oxygen supply, and medicines.',
      image: '/images/hero_hands.jpg',
      raised: '₹5,20,000',
      goal: '₹8,00,000',
      percent: 65,
      beneficiaryAddress: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    },
    {
      id: '67abc1234567890123456803',
      _id: '67abc1234567890123456803',
      title: 'Clean Water Initiative',
      beneficiary: 'Water4All',
      desc: 'Bring clean, safe drinking water to remote villages and schools through solar water wells.',
      image: '/images/campaign_water.jpg',
      raised: '₹3,75,000',
      goal: '₹6,00,000',
      percent: 62,
      beneficiaryAddress: '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1',
    },
    {
      id: '67abc1234567890123456808',
      _id: '67abc1234567890123456808',
      title: 'Bengaluru water scarcity',
      beneficiary: 'NGO Hope',
      desc: 'Provide emergency clean water supply, water tankers, rainwater harvesting filters, and purification to drought-affected communities across Bengaluru.',
      image: '/images/campaign_water.jpg',
      raised: '₹0',
      goal: '₹3,00,000',
      percent: 0,
      beneficiaryAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    },
  ];

  const [campaigns, setCampaigns] = useState(DEFAULT_CAMPAIGNS);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);

  const loadCampaigns = async () => {
    setLoadingCampaigns(true);
    try {
      const items = await govService.fetchRequests();
      if (Array.isArray(items) && items.length > 0) {
        const relevant = items.filter(
          (r) => r.status === 'APPROVED' || r.status === 'UNDER_REVIEW' || r.isFrozen
        );
        if (relevant.length > 0) {
          setCampaigns(relevant.map(formatCampaign));
        }
      }
    } catch (err) {
      console.warn('Could not load dynamic approved campaigns:', err);
    } finally {
      setLoadingCampaigns(false);
    }
  };

  const loadDisputes = async () => {
    setLoadingDisputes(true);
    try {
      const list = await govService.fetchAllDisputes();
      setActiveDisputes(Array.isArray(list) ? list : []);
    } catch (err) {
      console.warn('Could not load governance disputes:', err);
    } finally {
      setLoadingDisputes(false);
    }
  };

  const loadDonations = async () => {
    setLoadingDonations(true);
    try {
      const items = await donationService.getMyDonations();
      const list = Array.isArray(items) ? items : items?.donations || [];
      setMyDonations(list);

      // Compute dynamic stats
      if (list.length > 0) {
        let totalInr = 0;
        let totalEth = 0;
        const uniqueCampaigns = new Set();

        list.forEach((d) => {
          totalInr += Number(d.amount || 0);
          totalEth += Number(d.amountEth || (d.amount ? d.amount / 160000 : 0));
          if (d.requestId) uniqueCampaigns.add(d.requestId.toString());
        });

        setStats({
          totalDonatedInr: `₹ ${totalInr.toLocaleString('en-IN')}`,
          totalDonatedEth: `${totalEth.toFixed(2)} ETH`,
          campaignsSupported: uniqueCampaigns.size || list.length,
          transactions: list.length,
        });
      }
    } catch (err) {
      console.warn('Could not load donor donations:', err);
    } finally {
      setLoadingDonations(false);
    }
  };

  useEffect(() => {
    loadDonations();
    loadCampaigns();
    loadDisputes();
  }, []);

  const handleOpenDonate = (campaign) => {
    setSelectedCampaign(campaign);
    setIsModalOpen(true);
  };

  const handleDonateSuccess = (tx) => {
    loadDonations();
    loadCampaigns();
    loadDisputes();
  };

  const handleOpenTrack = (donation) => {
    setTrackingDonation(donation);
    setIsTrackingOpen(true);
  };

  const handleConnectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts && accounts.length > 0) {
          setProfileForm((prev) => ({ ...prev, walletAddress: accounts[0] }));
          setProfileSuccessMsg(`Retrieved address from MetaMask: ${accounts[0]}`);
          setTimeout(() => setProfileSuccessMsg(''), 4000);
        }
      } catch (err) {
        setProfileErrorMsg(err.message || 'MetaMask connection rejected');
        setTimeout(() => setProfileErrorMsg(''), 4000);
      }
    } else {
      setProfileErrorMsg('MetaMask extension was not detected. You can paste your Ethereum 0x... address manually.');
      setTimeout(() => setProfileErrorMsg(''), 5000);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profileForm.name || !profileForm.name.trim()) {
      setProfileErrorMsg('Full Name is required.');
      return;
    }
    if (!profileForm.email || !profileForm.email.trim()) {
      setProfileErrorMsg('Email Address is required.');
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

      setProfileSuccessMsg('Profile updated successfully! All changes are now active.');
      setTimeout(() => setProfileSuccessMsg(''), 5000);
    } catch (err) {
      setProfileErrorMsg(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleResetProfile = () => {
    if (activeUser) {
      setProfileForm({
        name: activeUser.name || '',
        email: activeUser.email || '',
        phone: activeUser.phone || '',
        walletAddress: activeUser.walletAddress || '',
        bio: activeUser.bio || '',
        publicName: true,
        emailReceipts: true,
      });
      setProfileSuccessMsg('Profile form reset to saved values.');
      setTimeout(() => setProfileSuccessMsg(''), 3000);
    }
  };

  const filteredDonations = statusFilter === 'ALL'
    ? myDonations
    : myDonations.filter((d) => d.status === statusFilter);

  // Derive initials for avatar
  const donorInitials = (profileForm.name || activeUser?.name || 'Donor')
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <DashboardLayout activeTab={currentTab}>
      
      {currentTab === 'profile' ? (
        /* ============================================================== */
        /* FULL INTERACTIVE PROFILE & SETTINGS VIEW (Sprint 5 / Edit Profile) */
        /* ============================================================== */
        <div>
          {/* Breadcrumb & Section Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                <Link to="/donor" style={{ color: 'var(--primary-green)', fontWeight: 600 }}>Dashboard</Link>
                <span>/</span>
                <span style={{ color: 'var(--text-dark)', fontWeight: 600 }}>Donor Profile & Settings</span>
              </div>
              <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-dark)', margin: 0 }}>
                Donor Profile & Account Settings
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', margin: '4px 0 0 0' }}>
                View and edit your personal information, Web3 wallet address, and philanthropic preferences.
              </p>
            </div>

            <Link
              to="/donor"
              className="btn-secondary"
              style={{ padding: '8px 16px', fontSize: '0.84rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              ← Back to Dashboard Overview
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

          {/* Two-Column Profile Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '24px',
              alignItems: 'start',
            }}
          >
            {/* Column 1: Identity & Blockchain Verification Card */}
            <div className="bridge-card" style={{ padding: '28px' }}>
              {/* Avatar with Initials */}
              <div
                style={{
                  width: '88px',
                  height: '88px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.1rem',
                  fontWeight: 800,
                  color: '#ffffff',
                  boxShadow: '0 8px 16px rgba(5, 150, 105, 0.25)',
                  margin: '0 auto 16px auto',
                }}
              >
                {donorInitials}
              </div>

              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-dark)', textAlign: 'center', margin: '0 0 4px 0' }}>
                {profileForm.name || activeUser?.name || 'Hemanth Donor'}
              </h2>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '16px' }}>
                {profileForm.email || activeUser?.email}
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
                <span className="badge-approved" style={{ fontSize: '0.74rem' }}>
                  ✓ Verified Donor
                </span>
                <span
                  style={{
                    fontSize: '0.74rem',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    backgroundColor: 'var(--accent-blue-light)',
                    color: 'var(--accent-blue)',
                    fontWeight: 700,
                    border: '1px solid var(--accent-blue-border)',
                  }}
                >
                  On-Chain Account
                </span>
              </div>

              {/* Philanthropic Summary Stats */}
              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.84rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Total Impact:</span>
                  <span style={{ fontWeight: 700, color: 'var(--primary-green)' }}>
                    {stats.totalDonatedInr} ({stats.totalDonatedEth})
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.84rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Campaigns Supported:</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-dark)' }}>
                    {stats.campaignsSupported} initiatives
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.84rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Smart Contract Receipts:</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-dark)' }}>
                    {stats.transactions} verified blocks
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.84rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Network Status:</span>
                  <span style={{ fontWeight: 700, color: 'var(--primary-green)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary-green)', display: 'inline-block' }} />
                    Connected Node
                  </span>
                </div>
              </div>

              {/* Web3 Wallet Quick Card */}
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
                  Linked Wallet Address
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-dark)', wordBreak: 'break-all' }}>
                  {profileForm.walletAddress || activeUser?.walletAddress || 'No wallet address linked'}
                </div>
              </div>
            </div>

            {/* Column 2: Edit Profile Form */}
            <div className="bridge-card" style={{ padding: '28px' }}>
              <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '16px', marginBottom: '22px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-dark)', margin: '0 0 6px 0' }}>
                  Edit Profile Information
                </h2>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                  Modify your name, communication channels, and Ethereum wallet address below. Click "Save Profile Changes" to persist.
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
                      Full Name <span style={{ color: 'var(--danger-red)' }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      placeholder="e.g. Hemanth Donor"
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
                      Email Address <span style={{ color: 'var(--danger-red)' }}>*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      placeholder="e.g. donor@bridge.org"
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
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      placeholder="e.g. +91 98765 43210"
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
                        Ethereum Wallet Address
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
                      placeholder="0x71C9...348a"
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

                {/* Bio / Philanthropic Goal */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '6px' }}>
                    Philanthropic Mission / About Me
                  </label>
                  <textarea
                    rows="3"
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    placeholder="Tell initiatives and fellow donors what causes you support..."
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

                {/* Governance & Privacy Preferences */}
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
                    Transparency & Notification Preferences
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-main)', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={profileForm.publicName}
                        onChange={(e) => setProfileForm({ ...profileForm, publicName: e.target.checked })}
                        style={{ accentColor: 'var(--primary-green)', cursor: 'pointer' }}
                      />
                      <span>Show my name publicly on initiative donor rolls (uncheck to donate anonymously)</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-main)', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={profileForm.emailReceipts}
                        onChange={(e) => setProfileForm({ ...profileForm, emailReceipts: e.target.checked })}
                        style={{ accentColor: 'var(--primary-green)', cursor: 'pointer' }}
                      />
                      <span>Send on-chain cryptographic audit notifications when donations are disbursed</span>
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
                    {profileSaving ? 'Saving Profile...' : '💾 Save Profile Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : (
        /* ============================================================== */
        /* STANDARD DONOR OVERVIEW DASHBOARD (Cards, Initiatives, Donations) */
        /* ============================================================== */
        <>
          {/* 3 Pastel Stat Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '20px',
              marginBottom: '36px',
            }}
          >
            {/* Total Donated (Green Tint) */}
            <div className="stat-card-green">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <span style={{ fontSize: '1.5rem' }}>💵</span>
                <div>
                  <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-dark)' }}>
                    {stats.totalDonatedInr}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--primary-green)', fontWeight: 700 }}>
                    {stats.totalDonatedEth}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Total Philanthropic Impact
              </div>
            </div>

            {/* Campaigns Supported (Rose Tint) */}
            <div className="stat-card-rose">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <span style={{ fontSize: '1.5rem' }}>💖</span>
                <span style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-dark)' }}>
                  {stats.campaignsSupported}
                </span>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Campaigns Supported
              </div>
            </div>

            {/* Transactions (Cyan/Blue Tint) */}
            <div className="stat-card-cyan">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <span style={{ fontSize: '1.5rem' }}>⛓️</span>
                <span style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-dark)' }}>
                  {stats.transactions}
                </span>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                On-Chain Blockchain Receipts
              </div>
            </div>
          </div>

          {/* Active Governance Review & Weighted Donor Voting Section */}
          {activeDisputes.length > 0 && (
            <div style={{ marginBottom: '40px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-dark)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>⚖️</span> Active Governance Disputes & Donor Weighted Voting
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: '4px 0 0 0' }}>
                    Campaigns flagged by community donors. Cast your weighted vote based on your past donation stake to decide whether to resume releases or trigger refunds.
                  </p>
                </div>
                <span className="badge-pending" style={{ fontSize: '0.78rem' }}>
                  {activeDisputes.filter((d) => d.status !== 'RESOLVED_APPROVED' && d.status !== 'RESOLVED_REJECTED').length} Active Under Review
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
                {activeDisputes.map((dispute) => (
                  <GovernanceDisputeCard
                    key={dispute.campaignId || dispute._id}
                    campaignId={dispute.campaignId}
                    initialDispute={dispute}
                    onVoteCast={() => {
                      loadDisputes();
                      loadCampaigns();
                    }}
                    onFinalized={() => {
                      loadDisputes();
                      loadCampaigns();
                      loadDonations();
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Featured Campaigns Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-dark)' }}>
          Featured Verified Initiatives
        </h2>
        <Link to="/campaigns" style={{ color: 'var(--accent-blue)', fontSize: '0.85rem', fontWeight: 600 }}>
          View All Campaigns →
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        {campaigns.map((camp) => (
          <div
            key={camp.id || camp._id}
            className="bridge-card"
            style={{
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 'var(--radius-md)',
              border: camp.isFrozen ? '2px solid #fca5a5' : '1px solid var(--border-light)',
            }}
          >
            <div style={{ height: '160px', overflow: 'hidden', position: 'relative' }}>
              <img
                src={camp.image}
                alt={camp.title}
                onError={(e) => {
                  e.currentTarget.src = '/images/campaign_water.jpg';
                }}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  backgroundColor: camp.isFrozen ? 'rgba(239, 68, 68, 0.95)' : 'rgba(255, 255, 255, 0.92)',
                  color: camp.isFrozen ? '#ffffff' : 'var(--primary-green)',
                  backdropFilter: 'blur(4px)',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                }}
              >
                {camp.isFrozen ? '🔒 Under Review (Frozen)' : '✓ Verified'}
              </div>
            </div>

            <div style={{ padding: '18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '4px' }}>
                by {camp.beneficiary || 'NGO Hope'}
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px' }}>
                {camp.title}
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '14px', flex: 1, lineHeight: 1.5 }}>
                {camp.desc}
              </p>

              {camp.isFrozen && (
                <div
                  style={{
                    backgroundColor: '#fff1f2',
                    border: '1px solid #fecdd3',
                    borderRadius: '6px',
                    padding: '8px 10px',
                    fontSize: '0.78rem',
                    color: '#be123c',
                    marginBottom: '12px',
                    lineHeight: 1.4,
                  }}
                >
                  ⚠️ <strong>Under Governance Review:</strong> Flagged suspicious by donors ({camp.reportCount} reports). Donations & fund releases are temporarily frozen.
                </div>
              )}

              <div style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                  <span style={{ color: 'var(--primary-green)' }}>{camp.raised}</span>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>/ {camp.goal}</span>
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: `${camp.percent}%` }} />
                </div>
              </div>

              {camp.isFrozen ? (
                <button
                  disabled
                  className="btn-secondary"
                  style={{ width: '100%', padding: '9px', fontSize: '0.85rem', opacity: 0.65, cursor: 'not-allowed', backgroundColor: '#f1f5f9', color: '#64748b' }}
                >
                  🔒 Donations Frozen
                </button>
              ) : (
                <button
                  onClick={() => handleOpenDonate(camp)}
                  className="btn-primary"
                  style={{ width: '100%', padding: '9px', fontSize: '0.9rem' }}
                >
                  Donate Now
                </button>
              )}

              <button
                onClick={() => {
                  setReportingCampaign(camp);
                  setIsReportOpen(true);
                }}
                style={{
                  width: '100%',
                  marginTop: '8px',
                  padding: '7px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: '#b91c1c',
                  backgroundColor: 'rgba(239, 68, 68, 0.08)',
                  border: '1px dashed #fca5a5',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <span>🚨</span> Report Suspicious Campaign
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Real On-Chain Donation History Section (Sprint 5 Deliverable) */}
      <div id="donations-history-section" className="bridge-card" style={{ padding: '24px', marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-dark)', margin: 0 }}>
              My Philanthropic Contributions & On-Chain Audit History
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: '4px 0 0 0' }}>
              Every transaction is cryptographically registered on the local Ethereum smart contract
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {['ALL', 'CONFIRMED', 'CREATED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  border: statusFilter === st ? '1px solid var(--primary-green)' : '1px solid var(--border-light)',
                  backgroundColor: statusFilter === st ? 'rgba(5, 150, 105, 0.1)' : 'transparent',
                  color: statusFilter === st ? 'var(--primary-green)' : 'var(--text-muted)',
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

        {loadingDonations ? (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
            Loading on-chain donation history...
          </div>
        ) : filteredDonations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
            No donations recorded yet. Choose a campaign above to make your first verified donation!
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)', textAlign: 'left' }}>
                  <th style={{ padding: '12px 8px', fontWeight: 600 }}>Date</th>
                  <th style={{ padding: '12px 8px', fontWeight: 600 }}>Initiative</th>
                  <th style={{ padding: '12px 8px', fontWeight: 600 }}>Beneficiary</th>
                  <th style={{ padding: '12px 8px', fontWeight: 600 }}>Amount</th>
                  <th style={{ padding: '12px 8px', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '12px 8px', fontWeight: 600 }}>Tx Hash / Ref</th>
                  <th style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 600 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredDonations.map((d) => {
                  const hash = d.blockchainTxHash || d.txHash || d.razorpayPaymentId;
                  const shortHash = hash ? `${hash.substring(0, 8)}...${hash.substring(hash.length - 6)}` : 'Verified';
                  return (
                    <tr key={d._id || d.donationId} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '12px 8px', whiteSpace: 'nowrap' }}>
                        {new Date(d.createdAt || Date.now()).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td style={{ padding: '12px 8px', fontWeight: 600, color: 'var(--text-dark)' }}>
                        {d.requestTitle || 'Community Support'}
                      </td>
                      <td style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>
                        {d.beneficiaryName || 'NGO Hope'}
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <span style={{ fontWeight: 700, color: 'var(--primary-green)', fontSize: '0.95rem' }}>
                          ₹{Number(d.amount || 0).toLocaleString('en-IN')}
                        </span>
                        {d.paymentMethod && (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', display: 'block' }}>
                            {d.paymentMethod}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        {d.status === 'REFUNDED' ? (
                          <span
                            style={{
                              padding: '3px 8px',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              backgroundColor: '#fee2e2',
                              color: '#b91c1c',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            ↩️ REFUNDED
                          </span>
                        ) : (
                          <span className="badge-approved" style={{ fontSize: '0.72rem' }}>
                            {d.status}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '12px 8px', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
                        <div>{shortHash}</div>
                        {d.blockNumber && (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                            Block #{d.blockNumber}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                        <button
                          onClick={() => handleOpenTrack(d)}
                          className="btn-secondary"
                          style={{ padding: '5px 12px', fontSize: '0.76rem', borderRadius: '4px' }}
                        >
                          🔍 Track Lifecycle
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )}

      {/* Donation Creation Modal Flow */}
      <DonationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        campaign={selectedCampaign}
        onDonateSuccess={handleDonateSuccess}
      />

      {/* Donation Lifecycle Tracking Modal */}
      <DonationTrackingModal
        isOpen={isTrackingOpen}
        onClose={() => setIsTrackingOpen(false)}
        donation={trackingDonation}
      />

      {/* Campaign Reporting Modal */}
      <ReportCampaignModal
        isOpen={isReportOpen}
        onClose={() => {
          setIsReportOpen(false);
          setReportingCampaign(null);
        }}
        campaign={reportingCampaign}
        onReportSuccess={() => {
          loadCampaigns();
          loadDisputes();
        }}
      />

    </DashboardLayout>
  );
}
