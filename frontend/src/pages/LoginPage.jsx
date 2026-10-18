import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, ROLES } from '../context/AuthContext';
import { BridgeLogo } from '../components/common/BridgeLogo';
import { API_URL } from '../services/api';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, switchRole } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(location.state?.error || null);
  const [isNetworkError, setIsNetworkError] = useState(false);

  const from = location.state?.from?.pathname;

  // Prevent browser from auto-filling or auto-saving credentials
  useEffect(() => {
    setEmail('');
    setPassword('');
    const timer = setTimeout(() => {
      setEmail('');
      setPassword('');
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  const navigateAfterLogin = (role) => {
    let targetPath = from;
    if (!targetPath || targetPath === '/login' || targetPath === '/register') {
      if (role === ROLES.ADMIN) targetPath = '/admin';
      else if (role === ROLES.BENEFICIARY) targetPath = '/beneficiary';
      else targetPath = '/donor';
    }
    navigate(targetPath, { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setIsNetworkError(false);
      const res = await login(email, password);
      navigateAfterLogin(res.user?.role);
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('Failed to fetch') || err.name === 'TypeError') {
        setIsNetworkError(true);
        setError('Cannot connect to the backend server (Failed to fetch).');
      } else {
        setIsNetworkError(false);
        setError(msg || 'Invalid credentials. Please check your email and password.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoBypass = (preferredRole) => {
    let targetRole = preferredRole;
    if (!targetRole) {
      if (email.toLowerCase().includes('admin')) targetRole = ROLES.ADMIN;
      else if (email.toLowerCase().includes('beneficiary')) targetRole = ROLES.BENEFICIARY;
      else targetRole = ROLES.DONOR;
    }
    switchRole(targetRole);
    navigateAfterLogin(targetRole);
  };

  const getTargetDemoRole = () => {
    if (email.toLowerCase().includes('admin')) return 'Admin';
    if (email.toLowerCase().includes('beneficiary')) return 'Beneficiary';
    return 'Donor';
  };

  return (
    <div className="auth-ambient-bg">
      
      {/* Left Column: Login Card & Form */}
      <div
        style={{
          flex: '1 1 500px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 'clamp(32px, 5vw, 64px) 24px',
          position: 'relative',
        }}
      >
        <div style={{ width: '100%', maxWidth: '440px' }}>
          
          {/* Floating Glassmorphic Authentication Card */}
          <div className="bridge-glass-card" style={{ padding: 'clamp(28px, 4vw, 42px) clamp(24px, 4vw, 36px)' }}>
            
            {/* Top Brand Header */}
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div style={{ display: 'inline-block', marginBottom: '14px' }}>
                <BridgeLogo size="lg" to="/" />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 12px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--primary-green-light)',
                    border: '1px solid var(--primary-green-border)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--primary-green)',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  <span className="pulse-dot-green" />
                  Verified Portal
                </span>
              </div>

              <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-dark)' }}>
                Welcome Back
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', margin: 0 }}>
                Sign in to manage transparent donation governance
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <div
                style={{
                  backgroundColor: 'var(--accent-rose-light)',
                  border: '1px solid var(--accent-rose-border)',
                  color: 'var(--accent-rose)',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem',
                  marginBottom: '22px',
                  lineHeight: 1.5,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <span>{error}</span>
                </div>
                {isNetworkError && (
                  <div style={{ marginTop: '4px', paddingTop: '8px', borderTop: '1px dashed var(--accent-rose-border)' }}>
                    <p style={{ margin: '0 0 8px 0', fontSize: '0.78rem', color: '#475569' }}>
                      Backend at <code>{API_URL}</code> unreachable.
                    </p>
                    <button
                      type="button"
                      onClick={() => handleDemoBypass()}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: 'var(--primary-gradient)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        fontWeight: 600,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                      }}
                    >
                      🚀 Enter Offline Preview as {getTargetDemoRole()}
                    </button>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} autoComplete="off" data-lpignore="true">
              {/* Decoy hidden inputs to prevent aggressive browser autofill */}
              <input type="text" name="decoy_username" tabIndex={-1} aria-hidden="true" autoComplete="username" style={{ position: 'absolute', opacity: 0, height: 0, width: 0, pointerEvents: 'none' }} />
              <input type="password" name="decoy_password" tabIndex={-1} aria-hidden="true" autoComplete="current-password" style={{ position: 'absolute', opacity: 0, height: 0, width: 0, pointerEvents: 'none' }} />
              
              {/* Email Field with Label and Icon */}
              <div className="bridge-form-group">
                <label htmlFor="bridge_auth_email_field" className="bridge-label">
                  Email Address <span style={{ color: 'var(--accent-rose)' }}>*</span>
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <span
                    style={{
                      position: 'absolute',
                      left: '14px',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      pointerEvents: 'none',
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="16" x="2" y="4" rx="2"/>
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                    </svg>
                  </span>
                  <input
                    type="email"
                    name="bridge_auth_email_field"
                    id="bridge_auth_email_field"
                    autoComplete="off"
                    data-lpignore="true"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bridge-input"
                    style={{ paddingLeft: '44px' }}
                  />
                </div>
              </div>

              {/* Password Field with Label, Padlock & Eye Toggle */}
              <div className="bridge-form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '7px' }}>
                  <label htmlFor="bridge_auth_pass_field" className="bridge-label" style={{ margin: 0 }}>
                    Password <span style={{ color: 'var(--accent-rose)' }}>*</span>
                  </label>
                  <a
                    href="#forgot"
                    onClick={(e) => {
                      e.preventDefault();
                      alert('Please contact system administrator to reset credentials or register with a new account.');
                    }}
                    style={{ fontSize: '0.8rem', color: 'var(--primary-teal)', fontWeight: 600 }}
                  >
                    Forgot password?
                  </a>
                </div>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <span
                    style={{
                      position: 'absolute',
                      left: '14px',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      pointerEvents: 'none',
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="bridge_auth_pass_field"
                    id="bridge_auth_pass_field"
                    autoComplete="new-password"
                    data-lpignore="true"
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bridge-input"
                    style={{ paddingLeft: '44px', paddingRight: '42px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '4px',
                      borderRadius: '4px',
                      transition: 'color 0.15s',
                    }}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
                        <line x1="2" y1="2" x2="22" y2="22"/>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Login Button with Gradient & Micro-interaction */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '13px',
                  fontSize: '1rem',
                  borderRadius: 'var(--radius-md)',
                  marginTop: '10px',
                }}
              >
                {loading ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <svg style={{ animation: 'spin 1s linear infinite', width: '18px', height: '18px' }} viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25"/>
                      <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Authenticating...
                  </span>
                ) : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    Sign In to Portal
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14"/>
                      <path d="m12 5 7 7-7 7"/>
                    </svg>
                  </span>
                )}
              </button>
            </form>

            {/* Links below form */}
            <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.9rem', borderTop: '1px solid var(--border-light)', paddingTop: '20px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Don't have an account yet? </span>
              <Link to="/register" style={{ color: 'var(--primary-green)', fontWeight: 700, marginLeft: '4px' }}>
                Create account →
              </Link>
            </div>

          </div>

          {/* Security & Verification Footer */}
          <div style={{ marginTop: '20px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
            <span>🔒 End-to-End Encrypted</span>
            <span>•</span>
            <span>Smart Contract Governed</span>
            <span>•</span>
            <span>Zero-Knowledge Verification</span>
          </div>

        </div>
      </div>

      {/* Right Column: High-End Hero Showcase Banner (Desktop / Tablet) */}
      <div
        className="desktop-only"
        style={{
          flex: '1 1 540px',
          position: 'relative',
          backgroundImage: 'linear-gradient(145deg, rgba(15, 23, 42, 0.90) 0%, rgba(6, 78, 59, 0.86) 100%), url("https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1400&q=85")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 'clamp(40px, 6vw, 80px)',
          color: '#ffffff',
          minHeight: '450px',
          overflow: 'hidden',
        }}
      >
        {/* Subtle Ambient Lighting Overlay */}
        <div
          style={{
            position: 'absolute',
            top: '-15%',
            right: '-10%',
            width: '450px',
            height: '450px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.22) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ maxWidth: '480px', position: 'relative', zIndex: 1 }}>
          
          <div style={{ marginBottom: '16px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#a7f3d0',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              ✨ Next-Gen Philanthropy
            </span>
          </div>

          <h2
            style={{
              fontSize: 'clamp(2.3rem, 4vw, 3.1rem)',
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.15,
              marginBottom: '20px',
              letterSpacing: '-0.03em',
            }}
          >
            Together for a{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #34d399 0%, #6ee7b7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Better Tomorrow
            </span>
          </h2>

          <p
            style={{
              fontSize: '1.05rem',
              color: 'rgba(255, 255, 255, 0.88)',
              lineHeight: 1.65,
              marginBottom: '36px',
            }}
          >
            Empowering donors and beneficiaries with 100% transparent, milestone-verified blockchain donation governance.
          </p>

          {/* Frosted Trust Feature Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '14px',
                padding: '16px 20px',
                borderRadius: 'var(--radius-lg)',
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
              }}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'rgba(16, 185, 129, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.1rem',
                  flexShrink: 0,
                }}
              >
                🛡️
              </div>
              <div>
                <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 700, margin: '0 0 3px 0' }}>
                  Milestone-Governed Escrow
                </h4>
                <p style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: '0.82rem', margin: 0, lineHeight: 1.45 }}>
                  Funds are released in tranches only upon verified photo & expense milestone approval.
                </p>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '14px',
                padding: '16px 20px',
                borderRadius: 'var(--radius-lg)',
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
              }}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'rgba(56, 189, 248, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.1rem',
                  flexShrink: 0,
                }}
              >
                ⚡
              </div>
              <div>
                <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 700, margin: '0 0 3px 0' }}>
                  Real-Time Transparent Ledger
                </h4>
                <p style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: '0.82rem', margin: 0, lineHeight: 1.45 }}>
                  Every rupee tracked with cryptographic certainty, automated receipts, and public auditing.
                </p>
              </div>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
}
