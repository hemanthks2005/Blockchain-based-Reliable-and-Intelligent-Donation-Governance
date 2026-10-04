import React from 'react';

export function DonationTrackingModal({ isOpen, onClose, donation }) {
  if (!isOpen || !donation) return null;

  const milestones = [
    { key: 'CREATED', label: '1. Intent Created', desc: 'Donor initialized donation' },
    { key: 'BLOCKCHAIN_SUBMITTED', label: '2. Mempool Broadcast', desc: 'Sent to EVM RPC node' },
    { key: 'BLOCKCHAIN_CONFIRMED', label: '3. On-Chain Confirmed', desc: 'Mined into immutable block' },
    { key: 'ALLOCATED', label: '4. Funds Allocated', desc: 'Audited & transferred to beneficiary' },
  ];

  const currentStatus = donation.status || 'CONFIRMED';
  const statusOrder = ['CREATED', 'SUBMITTED', 'PENDING_CONFIRMATION', 'CONFIRMED', 'ALLOCATED', 'COMPLETED'];
  const currentIndex = statusOrder.indexOf(currentStatus);

  const getStepState = (milestoneKey) => {
    if (milestoneKey === 'CREATED') return 'done';
    if (milestoneKey === 'BLOCKCHAIN_SUBMITTED') {
      return currentIndex >= 1 ? 'done' : 'pending';
    }
    if (milestoneKey === 'BLOCKCHAIN_CONFIRMED') {
      return currentIndex >= 3 ? 'done' : 'pending';
    }
    if (milestoneKey === 'ALLOCATED') {
      return currentIndex >= 4 ? 'done' : 'pending';
    }
    return 'pending';
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        className="bridge-card"
        style={{
          width: '100%',
          maxWidth: '650px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '30px',
          position: 'relative',
          animation: 'fadeIn 0.2s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-dark)' }}>
                Donation Lifecycle Tracker
              </h2>
              <span className="badge-approved" style={{ fontSize: '0.75rem' }}>
                {donation.status}
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
              Cryptographic lifecycle audit trail from creation to on-chain confirmation
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.4rem',
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            ×
          </button>
        </div>

        {/* Campaign & Amount Summary Banner */}
        <div
          style={{
            backgroundColor: 'rgba(5, 150, 105, 0.05)',
            border: '1px solid rgba(5, 150, 105, 0.2)',
            borderRadius: 'var(--radius-sm)',
            padding: '16px',
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Supported Initiative
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-dark)' }}>
              {donation.requestTitle || 'Education & Healthcare Fund'}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Beneficiary: <strong style={{ color: 'var(--text-dark)' }}>{donation.beneficiaryName || 'NGO Hope'}</strong>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary-green)' }}>
              {donation.amountEth ? `${donation.amountEth} ETH` : `${donation.amount} INR`}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              ₹{donation.amount ? Number(donation.amount).toLocaleString('en-IN') : '0'} INR
            </div>
          </div>
        </div>

        {/* Milestone Stepper */}
        <div style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-dark)' }}>
            Verification Milestones
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
            {milestones.map((m) => {
              const state = getStepState(m.key);
              const isDone = state === 'done';
              return (
                <div
                  key={m.key}
                  style={{
                    backgroundColor: isDone ? 'rgba(5, 150, 105, 0.08)' : 'var(--bg-app)',
                    border: `1px solid ${isDone ? 'var(--primary-green)' : 'var(--border-light)'}`,
                    borderRadius: 'var(--radius-sm)',
                    padding: '12px 10px',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: isDone ? 'var(--primary-green)' : '#94a3b8',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 8px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                    }}
                  >
                    {isDone ? '✓' : '•'}
                  </div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: isDone ? 'var(--primary-green)' : 'var(--text-dark)' }}>
                    {m.label}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {m.desc}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Blockchain Receipt Details */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-dark)' }}>
            Cryptographic Receipt Metadata
          </h3>
          <div
            style={{
              backgroundColor: 'var(--bg-app)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-sm)',
              padding: '16px',
              fontSize: '0.85rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-light)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Transaction Hash:</span>
              <code style={{ color: 'var(--primary-green)', fontWeight: 600, maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {donation.blockchainTxHash || donation.txHash || '0x3a4f8e...7890ab'}
              </code>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-light)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Block Height:</span>
              <strong style={{ color: 'var(--text-dark)' }}>#{donation.blockNumber || 10840}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-light)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Smart Contract:</span>
              <code style={{ color: 'var(--text-dark)' }}>
                {donation.contractAddress || '0x5FbDB2315678afecb367f032d93F642f64180aa3'}
              </code>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-light)' }}>
              <span style={{ color: 'var(--text-muted)' }}>On-Chain Donation ID:</span>
              <strong style={{ color: 'var(--text-dark)' }}>#{donation.onChainDonationId || 1}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
              <span style={{ color: 'var(--text-muted)' }}>Gas Consumed:</span>
              <span style={{ color: 'var(--text-dark)' }}>{donation.gasUsed || '46,820'} gas</span>
            </div>
          </div>
        </div>

        {/* Audit Timeline */}
        {donation.timeline && donation.timeline.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-dark)' }}>
              Event Log & Audit Trail
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {donation.timeline.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '8px 12px',
                    backgroundColor: 'var(--bg-app)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.82rem',
                  }}
                >
                  <span style={{ color: 'var(--primary-green)', fontWeight: 700 }}>•</span>
                  <div style={{ flex: 1 }}>
                    <strong style={{ color: 'var(--text-dark)' }}>{item.event}</strong>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.76rem' }}>{item.details}</div>
                  </div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', whiteSpace: 'nowrap' }}>
                    {item.timestamp ? new Date(item.timestamp).toLocaleTimeString() : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
          <button onClick={onClose} className="btn-secondary" style={{ padding: '8px 20px', fontSize: '0.88rem' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
