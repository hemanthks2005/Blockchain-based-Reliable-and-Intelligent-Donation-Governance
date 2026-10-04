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
    <div style={{ minHeight: 'calc(100vh - 70px)', display: 'flex', backgroundColor: '#ffffff' }}>
      
      {/* Left Column: Form */}
      <div
        style={{
          flex: '1 1 50%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '48px 32px',
        }}
      >
        <div style={{ width: '100%', maxWidth: '440px' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <BridgeLogo size="lg" to="/" />
          </div>

          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '6px', color: 'var(--text-dark)' }}>
              Create an Account
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
              Join the BRIDGE transparent donation ecosystem
            </p>
          </div>

          {error && (
            <div
              style={{
                backgroundColor: 'var(--accent-rose-light)',
                border: '1px solid var(--accent-rose-border)',
                color: 'var(--accent-rose)',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                marginBottom: '20px',
              }}
            >
              ⚠ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            
            {/* Name */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                Full Name / Organization Name *
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="John Doe or NGO Hope"
                value={formData.name}
                onChange={handleChange}
                className="bridge-input"
              />
            </div>

            {/* Email */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                Email Address *
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
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                Password (min 6 characters) *
              </label>
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••••••"
                value={formData.password}
                onChange={handleChange}
                className="bridge-input"
              />
            </div>

            {/* Role Selection */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
                Select Your Role *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {[
                  { id: ROLES.DONOR, label: 'Donor' },
                  { id: ROLES.BENEFICIARY, label: 'Beneficiary' },
                  { id: ROLES.ADMIN, label: 'Admin' },
                ].map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, role: r.id }))}
                    style={{
                      padding: '10px 4px',
                      borderRadius: 'var(--radius-sm)',
                      border: `1.5px solid ${formData.role === r.id ? 'var(--primary-green)' : 'var(--border-light)'}`,
                      backgroundColor: formData.role === r.id ? 'var(--primary-green-light)' : '#ffffff',
                      color: formData.role === r.id ? 'var(--primary-green)' : 'var(--text-muted)',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      transition: 'all 0.15s',
                    }}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Wallet */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                Ethereum Wallet Address <span style={{ color: 'var(--text-light)', fontWeight: 400 }}>(Optional)</span>
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
              style={{ width: '100%', padding: '12px', fontSize: '1rem', borderRadius: 'var(--radius-sm)' }}
            >
              {loading ? 'Creating Account...' : 'Register Now'}
            </button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.88rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Already have an account? </span>
            <Link to="/login" style={{ color: 'var(--primary-green)', fontWeight: 600 }}>
              Login
            </Link>
          </div>

        </div>
      </div>

      {/* Right Column: Hero Graphic Banner */}
      <div
        style={{
          flex: '1 1 50%',
          position: 'relative',
          backgroundImage: 'linear-gradient(rgba(15, 23, 42, 0.45), rgba(15, 23, 42, 0.75)), url("https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&w=1200&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px',
          color: '#ffffff',
        }}
      >
        <div style={{ maxWidth: '440px' }}>
          <h2
            style={{
              fontSize: '2.8rem',
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.2,
              marginBottom: '20px',
              letterSpacing: '-0.02em',
            }}
          >
            Decentralized <br />
            Philanthropy <br />
            with Integrity
          </h2>

          <p
            style={{
              fontSize: '1.1rem',
              color: 'rgba(255, 255, 255, 0.85)',
              lineHeight: 1.6,
            }}
          >
            Bridge ensures that 100% of your contributions can be verified on-chain, eliminating opacity in charity distribution.
          </p>
        </div>
      </div>

    </div>
  );
}
