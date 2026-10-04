import React from 'react';
import { BridgeLogo } from '../common/BridgeLogo';

export function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--border-light)',
        backgroundColor: '#ffffff',
        padding: '36px 0',
        marginTop: 'auto',
        fontSize: '0.88rem',
        color: 'var(--text-muted)',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <BridgeLogo size="sm" to="/" />
          <span style={{ color: 'var(--text-light)' }}>|</span>
          <span style={{ fontSize: '0.82rem' }}>
            Blockchain-based Reliable and Intelligent Donation Governance
          </span>
        </div>

        <div style={{ display: 'flex', gap: '20px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          <span>Transparent Giving</span>
          <span>•</span>
          <span>Verified Beneficiaries</span>
          <span>•</span>
          <span>EVM Smart Contracts</span>
          <span>•</span>
          <span>© 2026 BRIDGE Engine</span>
        </div>
      </div>
    </footer>
  );
}
