import React from 'react';
import { Link } from 'react-router-dom';

export function LandingPage() {
  const stats = [
    { icon: '📁', value: '5+', label: 'Active Campaigns' },
    { icon: '👥', value: '200+', label: 'Trusted Donors' },
    { icon: '🛡️', value: '₹ 10,00,000+', label: 'Funds Raised' },
    { icon: '⏱️', value: '100%', label: 'Transparent' },
  ];

  const featuredCampaigns = [
    {
      id: '1',
      title: 'Education for Every Child',
      desc: 'Provide quality education, books, and learning resources to underprivileged children in rural areas.',
      image: '/images/campaign_education.jpg',
      raised: '₹8,50,000',
      goal: '₹10,00,000',
      percent: 85,
    },
    {
      id: '2',
      title: 'Medical Support',
      desc: 'Help critical patients get life-saving essential treatment, surgery assistance, and medicines.',
      image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80',
      raised: '₹5,20,000',
      goal: '₹8,00,000',
      percent: 65,
    },
    {
      id: '3',
      title: 'Clean Water Initiative',
      desc: 'Bring clean, safe drinking water to remote villages and schools through solar water wells.',
      image: '/images/campaign_clean_water.jpg',
      raised: '₹3,75,000',
      goal: '₹6,00,000',
      percent: 62,
    },
  ];

  return (
    <div style={{ backgroundColor: 'var(--bg-app)', minHeight: '100vh', paddingBottom: '80px' }}>
      
      {/* Hero Section (Screen 1) */}
      <section
        style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid var(--border-light)',
          padding: 'clamp(36px, 6vw, 68px) 0 clamp(40px, 6vw, 70px)',
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))',
              gap: 'clamp(32px, 5vw, 56px)',
              alignItems: 'center',
            }}
          >
            {/* Left Content */}
            <div>
              <h1
                style={{
                  fontSize: 'clamp(2.6rem, 5vw, 3.8rem)',
                  fontWeight: 800,
                  color: 'var(--text-dark)',
                  lineHeight: 1.1,
                  letterSpacing: '-0.03em',
                  marginBottom: '16px',
                }}
              >
                BRIDGE
              </h1>

              <h2
                style={{
                  fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)',
                  fontWeight: 700,
                  color: 'var(--text-main)',
                  lineHeight: 1.35,
                  marginBottom: '18px',
                }}
              >
                Blockchain-based Reliable and Intelligent Donation Governance
              </h2>

              <p
                style={{
                  fontSize: 'clamp(0.95rem, 1.8vw, 1.05rem)',
                  color: 'var(--text-muted)',
                  lineHeight: 1.6,
                  marginBottom: '32px',
                  maxWidth: '520px',
                }}
              >
                Transparent. Secure. Trusted. Making donations more accountable with blockchain technology.
              </p>

              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                <Link
                  to="/campaigns"
                  className="btn-primary"
                  style={{ padding: '13px 26px', fontSize: '0.98rem' }}
                >
                  Explore Campaigns
                </Link>
                <a
                  href="#about"
                  className="btn-secondary"
                  style={{ padding: '13px 26px', fontSize: '0.98rem' }}
                >
                  Learn More
                </a>
              </div>
            </div>

            {/* Right Image (Exact Hands holding red wooden heart from reference image) */}
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  borderRadius: 'var(--radius-xl)',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-lg)',
                  border: '4px solid #ffffff',
                  height: 'clamp(260px, 35vw, 390px)',
                }}
              >
                <img
                  src="/images/hero_heart_hands.jpg"
                  alt="Hands Holding Red Wooden Heart - BRIDGE Donation Governance"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                  onError={(e) => {
                    // Fallback to warm philanthropic photo
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1518398046578-8cca57782e17?auto=format&fit=crop&w=800&q=80';
                  }}
                />
              </div>
            </div>

          </div>

          {/* Floating Metric Stats Bar (Screen 1) - Fully Mobile Responsive */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
              gap: '16px',
              marginTop: 'clamp(36px, 5vw, 56px)',
            }}
          >
            {stats.map((s, idx) => (
              <div
                key={idx}
                className="bridge-card"
                style={{
                  padding: '18px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary-green-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem',
                    flexShrink: 0,
                  }}
                >
                  {s.icon}
                </div>
                <div>
                  <div style={{ fontSize: 'clamp(1.15rem, 2.5vw, 1.35rem)', fontWeight: 800, color: 'var(--text-dark)' }}>
                    {s.value}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {s.label}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Featured Campaigns Section */}
      <section style={{ padding: 'clamp(40px, 6vw, 64px) 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.75rem)', fontWeight: 700, marginBottom: '6px' }}>
                Featured Campaigns
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
                Explore verified initiatives and track real-time blockchain disbursements.
              </p>
            </div>
            <Link to="/campaigns" style={{ color: 'var(--primary-green)', fontWeight: 600, fontSize: '0.9rem' }}>
              View All →
            </Link>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
              gap: '24px',
            }}
          >
            {featuredCampaigns.map((camp) => (
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
                <div style={{ position: 'relative', height: '190px', overflow: 'hidden' }}>
                  <img
                    src={camp.image}
                    alt={camp.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&w=600&q=80';
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: 'var(--primary-green)',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    Verified Cause
                  </div>
                </div>

                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px' }}>
                    {camp.title}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '18px', flex: 1, lineHeight: 1.5 }}>
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

                  <Link
                    to={`/campaigns/${camp.id}`}
                    className="btn-primary"
                    style={{ width: '100%', padding: '10px', fontSize: '0.9rem' }}
                  >
                    Donate Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" style={{ backgroundColor: '#ffffff', borderTop: '1px solid var(--border-light)', padding: '60px 0' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '780px' }}>
          <span className="badge-approved" style={{ marginBottom: '14px' }}>
            Decentralized Governance
          </span>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2rem)', marginBottom: '16px' }}>
            Why BRIDGE is Different
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.98rem', lineHeight: 1.7, marginBottom: '32px' }}>
            Unlike traditional charity platforms where administrative overhead and tracking gaps obscure where your donation ends up, BRIDGE encodes every donation into immutable Ethereum smart contracts. Funds are only released to verified beneficiaries with supervisory approval and public cryptographic receipts.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn-primary" style={{ padding: '12px 24px' }}>
              Join as Donor or Beneficiary
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
