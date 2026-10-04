import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { DonationModal } from '../components/common/DonationModal';

export function CampaignsListPage() {
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const campaigns = [
    {
      id: '1',
      title: 'Education for Every Child',
      beneficiary: 'NGO Hope',
      desc: 'Provide quality education, books, and learning resources to underprivileged children in rural areas.',
      image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80',
      raised: '₹8,50,000',
      goal: '₹10,00,000',
      percent: 85,
    },
    {
      id: '2',
      title: 'Medical Support',
      beneficiary: 'Care Foundation',
      desc: 'Help critical patients get life-saving essential treatment, surgery assistance, and medicines.',
      image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80',
      raised: '₹5,20,000',
      goal: '₹8,00,000',
      percent: 65,
    },
    {
      id: '3',
      title: 'Clean Water Initiative',
      beneficiary: 'Water4All',
      desc: 'Bring clean, safe drinking water to remote villages and schools through solar water wells.',
      image: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f156f?auto=format&fit=crop&w=600&q=80',
      raised: '₹3,75,000',
      goal: '₹6,00,000',
      percent: 62,
    },
    {
      id: '4',
      title: 'Emergency Flood Relief',
      beneficiary: 'Disaster Relief Corp',
      desc: 'Emergency food, blankets, and clean drinking water kits for families affected by monsoon flooding.',
      image: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=600&q=80',
      raised: '₹4,10,000',
      goal: '₹5,00,000',
      percent: 82,
    },
  ];

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
              key={camp.id}
              className="bridge-card"
              style={{
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div style={{ height: '180px', overflow: 'hidden', position: 'relative' }}>
                <img
                  src={camp.image}
                  alt={camp.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    backgroundColor: '#ffffff',
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: 'var(--primary-green)',
                  }}
                >
                  ✓ Verified
                </div>
              </div>

              <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  by {camp.beneficiary}
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>
                  <Link to={`/campaigns/${camp.id}`} style={{ color: 'var(--text-dark)' }}>
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

                <div style={{ display: 'flex', gap: '8px' }}>
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
                  <Link
                    to={`/campaigns/${camp.id}`}
                    className="btn-secondary"
                    style={{ padding: '9px 16px', fontSize: '0.9rem' }}
                  >
                    Details
                  </Link>
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
    </div>
  );
}
