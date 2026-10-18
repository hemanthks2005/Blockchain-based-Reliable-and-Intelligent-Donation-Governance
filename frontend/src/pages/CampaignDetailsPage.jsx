import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DonationModal } from '../components/common/DonationModal';
import { ReportCampaignModal } from '../components/common/ReportCampaignModal';
import { GovernanceDisputeCard } from '../components/common/GovernanceDisputeCard';
import * as govService from '../services/governance.service';

function getCampaignImage(title = '', desc = '') {
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
}

export function CampaignDetailsPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('about');
  const [isDonateOpen, setIsDonateOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const [campaign, setCampaign] = useState({
    id: id || '67abc1234567890123456801',
    _id: id || '67abc1234567890123456801',
    title: 'Education for Every Child',
    beneficiary: 'NGO Hope',
    verified: true,
    desc: 'Provide quality education, books, and learning resources to underprivileged children in rural areas.',
    image: '/images/campaign_education.jpg',
    raised: '₹8,50,000',
    goal: '₹10,00,000',
    percent: 85,
    donorsCount: 120,
    daysLeft: 45,
    status: 'APPROVED',
    isFrozen: false,
    freezeReason: null,
    reportCount: 0,
    beneficiaryAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    fullStory:
      'This campaign aims to provide education and essential learning materials to children from economically weaker sections. Your support can help build a brighter future with transparent on-chain tracking for every rupee donated.',
  });

  const loadCampaignDetails = async () => {
    if (!id) return;
    try {
      let data = null;
      try {
        data = await govService.fetchRequestById(id);
      } catch (_err) {
        const list = await govService.fetchRequests();
        if (Array.isArray(list)) {
          data = list.find((item) => (item._id || item.id) === id);
        }
      }

      if (data) {
        const goalVal = Number(data.approvedAmount || data.requestedAmount || 500000);
        const raisedVal = Number(data.collectedAmount || 0);
        const pct = Math.min(100, Math.round((raisedVal / (goalVal || 1)) * 100));

        setCampaign({
          id: data._id || data.id,
          _id: data._id || data.id,
          title: data.title,
          beneficiary: data.beneficiaryName || data.beneficiaryId?.name || 'NGO Hope',
          verified: true,
          status: data.status || 'APPROVED',
          isFrozen: Boolean(data.isFrozen || data.status === 'UNDER_REVIEW'),
          freezeReason: data.freezeReason || null,
          reportCount: Number(data.reportCount || 0),
          desc: data.description || data.purpose || 'Community relief and support initiative',
          image: data.image || getCampaignImage(data.title, data.description || data.purpose),
          raised: `₹${raisedVal.toLocaleString('en-IN')}`,
          goal: `₹${goalVal.toLocaleString('en-IN')}`,
          percent: pct,
          donorsCount: Math.max(1, Math.floor(raisedVal / 2500)) || 12,
          daysLeft: 30,
          beneficiaryAddress: data.beneficiaryAddress || data.beneficiaryId?.walletAddress || '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
          fullStory: data.description || data.purpose || 'Every donation is locked into an audited smart contract and released only upon governance milestones.',
        });
      }
    } catch (err) {
      console.warn('Could not load campaign detail:', err);
    }
  };

  useEffect(() => {
    loadCampaignDetails();
  }, [id]);

  return (
    <div style={{ backgroundColor: 'var(--bg-app)', minHeight: 'calc(100vh - 70px)', padding: 'clamp(20px, 4vw, 40px) 0 80px' }}>
      <div className="container">
        
        {/* Campaign Header / Hero (Screen 6) */}
        <div
          className="bridge-card"
          style={{
            padding: 'clamp(20px, 3.5vw, 32px)',
            marginBottom: '32px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))',
            gap: 'clamp(24px, 4vw, 40px)',
            alignItems: 'center',
          }}
        >
          {/* Left Column: Image */}
          <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', height: 'clamp(240px, 35vw, 360px)' }}>
            <img
              src={campaign.image}
              alt={campaign.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              onError={(e) => {
                e.currentTarget.src = '/images/campaign_water.jpg';
              }}
            />
          </div>

          {/* Right Column: Campaign Info */}
          <div>
            <h1 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2rem)', fontWeight: 800, marginBottom: '10px', color: 'var(--text-dark)' }}>
              {campaign.title}
            </h1>

            {/* Beneficiary Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>👤 by {campaign.beneficiary}</span>
              <span className="badge-approved">✓ Verified</span>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '24px' }}>
              {campaign.desc}
            </p>

            {/* Progress Bar & Amounts */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px' }}>
                <span>
                  <strong style={{ color: 'var(--text-dark)' }}>{campaign.raised}</strong>{' '}
                  <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>raised of {campaign.goal}</span>
                </span>
                <span style={{ color: 'var(--primary-green)' }}>{campaign.percent}%</span>
              </div>
              <div className="progress-bar-bg" style={{ height: '10px' }}>
                <div className="progress-bar-fill" style={{ width: `${campaign.percent}%` }} />
              </div>
            </div>

            {/* 3 Metric Pills */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
                textAlign: 'center',
                padding: '16px 0',
                borderTop: '1px solid var(--border-light)',
                borderBottom: '1px solid var(--border-light)',
                marginBottom: '24px',
              }}
            >
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-dark)' }}>
                  {campaign.donorsCount}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>Donors</div>
              </div>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-dark)' }}>
                  {campaign.daysLeft}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>Days Left</div>
              </div>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-dark)' }}>
                  {campaign.goal}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>Goal</div>
              </div>
            </div>

            {/* Governance Freeze Banner if under review */}
            {(campaign.isFrozen || campaign.status === 'UNDER_REVIEW') && (
              <div
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px 14px',
                  marginBottom: '18px',
                  fontSize: '0.84rem',
                  color: 'var(--danger-red)',
                  lineHeight: 1.45,
                }}
              >
                <strong>⚠️ Campaign Frozen Under Governance Review:</strong> Multiple donor reports have been lodged. Donations and release authorizations are currently suspended pending evidence evaluation and donor voting.
              </div>
            )}

            {/* Action Buttons: Donate vs Frozen & Report Button */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {(campaign.isFrozen || campaign.status === 'UNDER_REVIEW') ? (
                <button
                  disabled
                  style={{
                    flex: 1,
                    padding: '13px',
                    fontSize: '0.98rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-subtle)',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border-light)',
                    cursor: 'not-allowed',
                    fontWeight: 700,
                  }}
                >
                  🔒 Donations Frozen (Under Review)
                </button>
              ) : (
                <button
                  onClick={() => setIsDonateOpen(true)}
                  className="btn-primary"
                  style={{ flex: 1, padding: '13px', fontSize: '1rem', borderRadius: 'var(--radius-sm)' }}
                >
                  Donate Now
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsReportOpen(true)}
                className="btn-secondary"
                style={{
                  padding: '13px 18px',
                  fontSize: '0.88rem',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--danger-red)',
                  borderColor: 'rgba(239, 68, 68, 0.3)',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
                title="Flag this campaign for Governance review"
              >
                🚨 Report
              </button>
            </div>
          </div>
        </div>

        {/* Governance Dispute, Evidence, & Weighted Voting Card */}
        <GovernanceDisputeCard
          campaignId={campaign.id || campaign._id}
          onStatusChange={() => {
            loadCampaignDetails();
          }}
        />

        {/* Campaign Tabs (Screen 6) */}
        <div className="bridge-card" style={{ padding: 'clamp(20px, 3.5vw, 28px)' }}>
          <div
            style={{
              display: 'flex',
              gap: '20px',
              borderBottom: '1px solid var(--border-light)',
              paddingBottom: '12px',
              marginBottom: '20px',
              overflowX: 'auto',
              whiteSpace: 'nowrap',
            }}
          >
            {[
              { id: 'about', label: 'About' },
              { id: 'updates', label: 'Updates' },
              { id: 'donors', label: 'Donors' },
              { id: 'blockchain', label: 'Blockchain Records' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  fontSize: '0.95rem',
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  color: activeTab === tab.id ? 'var(--primary-green)' : 'var(--text-muted)',
                  borderBottom: activeTab === tab.id ? '2px solid var(--primary-green)' : '2px solid transparent',
                  paddingBottom: '12px',
                  marginBottom: '-13px',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'about' && (
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '12px' }}>
                About this Campaign
              </h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '0.95rem' }}>
                {campaign.fullStory}
              </p>
            </div>
          )}

          {activeTab === 'blockchain' && (
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '12px' }}>
                Smart Contract Transparency Records
              </h3>
              <div style={{ backgroundColor: 'var(--bg-app)', padding: '16px', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                <div style={{ wordBreak: 'break-all', marginBottom: '6px' }}><strong>Contract Address:</strong> 0xd9d7e0f8901234567890abcdef12345678908c12</div>
                <div style={{ marginBottom: '6px' }}><strong>Current Escrow Balance:</strong> 5.3125 ETH</div>
                <div><strong>Disbursement Status:</strong> Phase 1 Verified by Governance Admin</div>
              </div>
            </div>
          )}

          {activeTab === 'donors' && (
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '12px' }}>
                Recent Contributors
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                120 verified community donors have contributed to this campaign on Ethereum.
              </p>
            </div>
          )}

          {activeTab === 'updates' && (
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '12px' }}>
                Milestone Updates
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Books and learning tablet kits distributed to 240 primary school children in cluster 4.
              </p>
            </div>
          )}
        </div>

      </div>

      <DonationModal
        isOpen={isDonateOpen}
        onClose={() => setIsDonateOpen(false)}
        campaign={campaign}
      />

      <ReportCampaignModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        campaign={campaign}
        onReportSuccess={() => {
          loadCampaignDetails();
        }}
      />
    </div>
  );
}
