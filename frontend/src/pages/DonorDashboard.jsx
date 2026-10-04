import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layouts/DashboardLayout';
import { DonationModal } from '../components/common/DonationModal';
import { DonationTrackingModal } from '../components/common/DonationTrackingModal';
import { Link } from 'react-router-dom';
import donationService from '../services/donation.service';
import { useAuth } from '../context/AuthContext';

export function DonorDashboard() {
  const { user } = useAuth();
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [trackingDonation, setTrackingDonation] = useState(null);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [myDonations, setMyDonations] = useState([]);
  const [loadingDonations, setLoadingDonations] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [stats, setStats] = useState({
    totalDonatedInr: '₹ 48,000',
    totalDonatedEth: '0.30 ETH',
    campaignsSupported: 2,
    transactions: 2,
  });

  const campaigns = [
    {
      id: '67abc1234567890123456801',
      _id: '67abc1234567890123456801',
      title: 'Education for Every Child',
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
      desc: 'Bring clean, safe drinking water to remote villages and schools through solar water wells.',
      image: '/images/campaign_water.jpg',
      raised: '₹3,75,000',
      goal: '₹6,00,000',
      percent: 62,
      beneficiaryAddress: '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1',
    },
  ];

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
  }, []);

  const handleOpenDonate = (campaign) => {
    setSelectedCampaign(campaign);
    setIsModalOpen(true);
  };

  const handleDonateSuccess = (tx) => {
    loadDonations();
  };

  const handleOpenTrack = (donation) => {
    setTrackingDonation(donation);
    setIsTrackingOpen(true);
  };

  const filteredDonations = statusFilter === 'ALL'
    ? myDonations
    : myDonations.filter((d) => d.status === statusFilter);

  return (
    <DashboardLayout activeTab="dashboard">
      
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
            key={camp.id}
            className="bridge-card"
            style={{
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div style={{ height: '160px', overflow: 'hidden' }}>
              <img
                src={camp.image}
                alt={camp.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            <div style={{ padding: '18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px' }}>
                {camp.title}
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '14px', flex: 1 }}>
                {camp.desc}
              </p>

              <div style={{ marginBottom: '14px' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '6px' }}>
                  {camp.raised} <span style={{ color: 'var(--text-light)', fontWeight: 500 }}>/ {camp.goal}</span>
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: `${camp.percent}%` }} />
                </div>
              </div>

              <button
                onClick={() => handleOpenDonate(camp)}
                className="btn-primary"
                style={{ width: '100%', padding: '9px', fontSize: '0.9rem' }}
              >
                Donate Now
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Real On-Chain Donation History Section (Sprint 5 Deliverable) */}
      <div className="bridge-card" style={{ padding: '24px', marginBottom: '30px' }}>
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
                  <th style={{ padding: '12px 8px', fontWeight: 600 }}>Amount (ETH / INR)</th>
                  <th style={{ padding: '12px 8px', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '12px 8px', fontWeight: 600 }}>Tx Hash / Block</th>
                  <th style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 600 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredDonations.map((d) => {
                  const hash = d.blockchainTxHash || d.txHash;
                  const shortHash = hash ? `${hash.substring(0, 8)}...${hash.substring(hash.length - 6)}` : 'Pending Mining';
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
                        <span style={{ fontWeight: 700, color: 'var(--primary-green)' }}>
                          {d.amountEth ? `${d.amountEth} ETH` : `${(d.amount / 160000).toFixed(2)} ETH`}
                        </span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>
                          ₹{Number(d.amount || 0).toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <span className="badge-approved" style={{ fontSize: '0.72rem' }}>
                          {d.status}
                        </span>
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

    </DashboardLayout>
  );
}
