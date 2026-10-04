import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from './Button';

export function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="pulse-dot pulse-dot-cyan" style={{ width: '24px', height: '24px', margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-secondary)' }}>Authenticating secure session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div className="glass-panel" style={{ maxWidth: '520px', margin: '0 auto', padding: '40px 32px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem',
            margin: '0 auto 20px',
            color: '#f43f5e'
          }}>
            ✕
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>Access Restricted</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '24px', lineHeight: 1.6 }}>
            Your current role (<strong style={{ color: '#fff' }}>{role}</strong>) does not have authorization to view this area.
            Required role: <strong style={{ color: 'var(--accent-cyan)' }}>{allowedRoles.join(' or ')}</strong>.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link to={role === 'ADMIN' ? '/admin' : role === 'BENEFICIARY' ? '/beneficiary' : '/donor'}>
              <Button variant="primary">Go to My Dashboard</Button>
            </Link>
            <Link to="/">
              <Button variant="secondary">Home</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
