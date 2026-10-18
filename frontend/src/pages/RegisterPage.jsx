import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, ROLES } from '../context/AuthContext';
import { BridgeLogo } from '../components/common/BridgeLogo';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: ROLES.DONOR,
    walletAddress: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setError('Name, email, and password are required.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await register(formData);

      const target =
        formData.role === ROLES.ADMIN
          ? '/admin'
          : formData.role === ROLES.BENEFICIARY
          ? '/beneficiary'
          : '/donor';

      navigate(target, { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-ambient-bg">
      
      {/* Left Column: Form inside Glassmorphic Card */}
      <div
        style={{
          flex: '1 1 520px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 'clamp(32px, 5vw, 64px) 24px',
        }}
      >
        <div style={{ width: '100%', maxWidth: '460px' }}>
          
          <div className="bridge-glass-card" style={{ padding: 'clamp(28px, 4vw, 40px) clamp(24px, 4vw, 36px)' }}>
            
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'inline-block', marginBottom: '12px' }}>
                <BridgeLogo size="lg" to="/" />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
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
                  Join BRIDGE Network
                </span>
              </div>

              <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '6px', color: 'var(--text-dark)' }}>
                Create an Account
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
                Join the verified transparent donation governance ecosystem
              </p>
            </div>

            {error && (
              <div
                style={{
                  backgroundColor: 'var(--accent-rose-light)',
                  border: '1px solid var(--accent-rose-border)',
                  color: 'var(--accent-rose)',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem',
                  marginBottom: '20px',
                  lineHeight: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              
              {/* Name */}
              <div className="bridge-form-group">
                <label className="bridge-label">
                  Full Name / NGO Name <span style={{ color: 'var(--accent-rose)' }}>*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Ramesh Kumar or Hope Foundation"
                  value={formData.name}
                  onChange={handleChange}
                  className="bridge-input"
                />
              </div>

              {/* Email */}
              <div className="bridge-form-group">
                <label className="bridge-label">
                  Email Address <span style={{ color: 'var(--accent-rose)' }}>*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="bridge-input"
                />
              </div>

              {/* Password */}
              <div className="bridge-form-group">
                <label className="bridge-label">
                  Password <span style={{ color: 'var(--accent-rose)' }}>*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  className="bridge-input"
                />
              </div>

              {/* Role Selection */}
              <div className="bridge-form-group">
                <label className="bridge-label">
                  Select Your Account Role <span style={{ color: 'var(--accent-rose)' }}>*</span>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {[
                    { id: ROLES.DONOR, label: 'Donor', icon: '💖' },
                    { id: ROLES.BENEFICIARY, label: 'Beneficiary', icon: '🤝' },
                    { id: ROLES.ADMIN, label: 'Admin', icon: '⚡' },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, role: r.id }))}
                      style={{
                        padding: '10px 4px',
                        borderRadius: 'var(--radius-md)',
                        border: `1.5px solid ${formData.role === r.id ? 'var(--primary-green)' : 'var(--border-light)'}`,
                        backgroundColor: formData.role === r.id ? 'var(--primary-green-light)' : '#ffffff',
                        color: formData.role === r.id ? 'var(--primary-green)' : 'var(--text-muted)',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        transition: 'all 0.2s',
                        boxShadow: formData.role === r.id ? '0 2px 8px rgba(5, 150, 105, 0.15)' : 'none',
                      }}
                    >
                      <span style={{ marginRight: '4px' }}>{r.icon}</span>
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Wallet */}
              <div className="bridge-form-group">
                <label className="bridge-label">
                  Settlement Wallet Address <span style={{ color: 'var(--text-light)', fontWeight: 400 }}>(Optional)</span>
                </label>
                <input
                  type="text"
                  name="walletAddress"
                  placeholder="0x71C95911E9A5D330f4D621457224213B443d348a"
                  value={formData.walletAddress}
                  onChange={handleChange}
                  className="bridge-input"
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{ width: '100%', padding: '13px', fontSize: '1rem', marginTop: '6px' }}
              >
                {loading ? 'Creating Account...' : 'Register Now →'}
              </button>
            </form>

            <div style={{ marginTop: '22px', textAlign: 'center', fontSize: '0.9rem', borderTop: '1px solid var(--border-light)', paddingTop: '18px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Already have an account? </span>
              <Link to="/login" style={{ color: 'var(--primary-green)', fontWeight: 700, marginLeft: '4px' }}>
                Sign In →
              </Link>
            </div>

          </div>

          <div style={{ marginTop: '20px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
            <span>🔒 Secure Enclave</span>
            <span>•</span>
            <span>Verified Identity</span>
            <span>•</span>
            <span>Zero Platform Fees</span>
          </div>

        </div>
      </div>

      {/* Right Column: Hero Graphic Banner */}
      <div
        className="desktop-only"
        style={{
          flex: '1 1 540px',
          position: 'relative',
          backgroundImage: 'linear-gradient(145deg, rgba(15, 23, 42, 0.90) 0%, rgba(6, 78, 59, 0.86) 100%), url("https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&w=1400&q=85")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 'clamp(40px, 6vw, 80px)',
          color: '#ffffff',
          minHeight: '450px',
        }}
      >
        <div style={{ maxWidth: '480px' }}>
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
              🛡️ Decentralized Trust
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
            Philanthropy with{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #34d399 0%, #6ee7b7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Uncompromising Integrity
            </span>
          </h2>

          <p
            style={{
              fontSize: '1.05rem',
              color: 'rgba(255, 255, 255, 0.88)',
              lineHeight: 1.65,
              marginBottom: '28px',
            }}
          >
            BRIDGE ensures that 100% of your contributions can be verified on-chain, eliminating opacity in charitable distribution with intelligent governance.
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '14px 18px',
              borderRadius: 'var(--radius-lg)',
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
            }}
          >
            <span style={{ fontSize: '1.5rem' }}>✨</span>
            <span style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.9rem', fontWeight: 500 }}>
              Automated milestone payouts, cryptographic audits & transparent INR escrow.
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}
