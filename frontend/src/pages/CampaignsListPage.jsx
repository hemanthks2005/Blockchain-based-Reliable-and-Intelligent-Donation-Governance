import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DonationModal } from '../components/common/DonationModal';
import { ReportCampaignModal } from '../components/common/ReportCampaignModal';
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

function formatCampaign(req) {
  const goalVal = Number(req.approvedAmount || req.requestedAmount || 500000);
  const raisedVal = Number(req.collectedAmount || (req.approvedAmount && req.status === 'COMPLETED' ? req.approvedAmount : 0));
  const percent = Math.min(100, Math.round((raisedVal / (goalVal || 1)) * 100));

  return {
    id: req._id || req.id,
    _id: req._id || req.id,
    title: req.title,
    beneficiary: req.beneficiaryName || req.beneficiaryId?.name || 'NGO Hope',
    desc: req.description || req.purpose || req.desc || 'Verified community relief initiative',
    image: req.image || getCampaignImage(req.title, req.description || req.purpose),
    raised: typeof req.raised === 'string' ? req.raised : `₹${raisedVal.toLocaleString('en-IN')}`,
    goal: typeof req.goal === 'string' ? req.goal : `₹${goalVal.toLocaleString('en-IN')}`,
    percent: typeof req.percent === 'number' ? req.percent : percent,
    beneficiaryAddress: req.beneficiaryAddress || req.beneficiaryId?.walletAddress || '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    status: req.status || 'APPROVED',
    isFrozen: Boolean(req.isFrozen || req.status === 'UNDER_REVIEW'),
    freezeReason: req.freezeReason || null,
  };
}

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
    desc: 'Help critical patients get life-saving essential treatment, surgery assistance, and medicines.',
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

export function CampaignsListPage() {
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportingCampaign, setReportingCampaign] = useState(null);
  const [campaigns, setCampaigns] = useState(DEFAULT_CAMPAIGNS);
  const [loading, setLoading] = useState(false);

  const loadCampaigns = async () => {
    setLoading(true);
    try {
      const items = await govService.fetchRequests();
      if (Array.isArray(items) && items.length > 0) {
        setCampaigns(items.map(formatCampaign));
      }
    } catch (err) {
      console.warn('Could not load dynamic campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  return (
    <div style={{ backgroundColor: 'var(--bg-app)', minHeight: 'calc(100vh - 70px)', padding: '40px 0 80px' }}>
      <div className="container">
        
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '8px' }}>
            Verified Donation Campaigns
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            All initiatives are verified by BRIDGE administrators and disbursements are tracked on the blockchain.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '28px' }}>
          {campaigns.map((camp) => (
            <div
              key={camp.id || camp._id}
              className="bridge-card"
              style={{
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 'var(--radius-md)',
                border: camp.isFrozen ? '2px solid rgba(239, 68, 68, 0.5)' : '1px solid var(--border-light)',
              }}
            >
              <div style={{ height: '180px', overflow: 'hidden', position: 'relative' }}>
                <img
                  src={camp.image}
                  alt={camp.title}
                  onError={(e) => { e.currentTarget.src = '/images/campaign_water.jpg'; }}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    backgroundColor: camp.isFrozen ? 'rgba(239, 68, 68, 0.95)' : '#ffffff',
                    color: camp.isFrozen ? '#ffffff' : 'var(--primary-green)',
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                  }}
                >
                  {camp.isFrozen ? '🔒 Under Review' : '✓ Verified'}
                </div>
              </div>

              <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  by {camp.beneficiary}
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>
                  <Link to={`/campaigns/${camp.id || camp._id}`} style={{ color: 'var(--text-dark)' }}>
                    {camp.title}
                  </Link>
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '18px', flex: 1 }}>
                  {camp.desc}
                </p>

                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                    <span style={{ color: 'var(--primary-green)' }}>{camp.raised}</span>
                    <span style={{ color: 'var(--text-muted)' }}>/ {camp.goal}</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${camp.percent}%` }} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {camp.isFrozen ? (
                    <button
                      disabled
                      style={{
                        flex: 1,
                        padding: '9px',
                        fontSize: '0.85rem',
                        backgroundColor: 'var(--bg-subtle)',
                        color: 'var(--danger-red)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'not-allowed',
                        fontWeight: 700,
                      }}
                    >
                      🔒 Frozen
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedCampaign(camp);
                        setIsModalOpen(true);
                      }}
                      className="btn-primary"
                      style={{ flex: 1, padding: '9px', fontSize: '0.9rem' }}
                    >
                      Donate Now
                    </button>
                  )}

                  <Link
                    to={`/campaigns/${camp.id || camp._id}`}
                    className="btn-secondary"
                    style={{ padding: '9px 14px', fontSize: '0.88rem' }}
                  >
                    Details
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setReportingCampaign(camp);
                      setIsReportOpen(true);
                    }}
                    style={{
                      background: 'none',
                      border: '1px solid var(--border-light)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '8px 10px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                    }}
                    title="Report Suspicious Campaign to Governance"
                  >
                    🚨
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      <DonationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        campaign={selectedCampaign}
      />

      <ReportCampaignModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        campaign={reportingCampaign}
        onReportSuccess={() => {
          loadCampaigns();
        }}
      />
    </div>
  );
}
