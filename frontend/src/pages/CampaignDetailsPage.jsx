import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DonationModal } from '../components/common/DonationModal';

export function CampaignDetailsPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('about');
  const [isDonateOpen, setIsDonateOpen] = useState(false);

  const campaign = {
    id: id || '1',
    title: 'Education for Every Child',
    beneficiary: 'NGO Hope',
    verified: true,
    desc: 'Provide quality education, books, and learning resources to underprivileged children in rural areas.',
    image: '/images/campaign_education.jpg',
    raised: '₹8,50,00,0',
    goal: '₹10,00,000',
    percent: 85,
    donorsCount: 120,
    daysLeft: 45,
    fullStory:
      'This campaign aims to provide education and essential learning materials to children from economically weaker sections. Your support can help build a brighter future with transparent on-chain tracking for every rupee donated.',
  };

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
                e.currentTarget.src = 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1000&q=80';
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
                  <strong style={{ color: 'var(--text-dark)' }}>₹8,50,000</strong>{' '}
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

            {/* Donate Now Button */}
            <button
              onClick={() => setIsDonateOpen(true)}
              className="btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '1.05rem', borderRadius: 'var(--radius-sm)' }}
            >
              Donate Now
            </button>
          </div>
        </div>

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
    </div>
  );
}
