import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, ROLES } from '../context/AuthContext';
import { BridgeLogo } from '../components/common/BridgeLogo';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(location.state?.error || null);

  const from = location.state?.from?.pathname;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await login(email, password);

      let targetPath = from;
      if (!targetPath || targetPath === '/login' || targetPath === '/register') {
        const userRole = res.user?.role;
        if (userRole === ROLES.ADMIN) targetPath = '/admin';
        else if (userRole === ROLES.BENEFICIARY) targetPath = '/beneficiary';
        else targetPath = '/donor';
      }

      navigate(targetPath, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('StrongPassword123');
    setError(null);
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 70px)', display: 'flex', backgroundColor: '#ffffff', flexWrap: 'wrap' }}>
      
      {/* Left Column: Login Form (Screen 2) */}
      <div
        style={{
          flex: '1 1 450px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 'clamp(28px, 5vw, 48px) 20px',
        }}
      >
        <div style={{ width: '100%', maxWidth: '390px' }}>
          
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <BridgeLogo size="lg" to="/" />
          </div>

          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '6px', color: 'var(--text-dark)' }}>
              Welcome Back
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
              Login to continue
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
            
            {/* Email Address with User Icon */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: '14px',
                    color: 'var(--text-light)',
                    fontSize: '1rem',
                  }}
                >
                  👤
                </span>
                <input
                  type="email"
                  required
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bridge-input"
                  style={{ paddingLeft: '42px' }}
                />
              </div>
            </div>

            {/* Password with Lock Icon & Eye Toggle */}
            <div style={{ marginBottom: '22px' }}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: '14px',
                    color: 'var(--text-light)',
                    fontSize: '1rem',
                  }}
                >
                  🔒
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bridge-input"
                  style={{ paddingLeft: '42px', paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '14px',
                    color: 'var(--text-light)',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '1rem', borderRadius: 'var(--radius-sm)' }}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* Links below form */}
          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.88rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Don't have an account? </span>
            <Link to="/register" style={{ color: 'var(--primary-green)', fontWeight: 600 }}>
              Register
            </Link>
          </div>

          <div style={{ marginTop: '8px', textAlign: 'center', fontSize: '0.82rem' }}>
            <a
              href="#forgot"
              onClick={(e) => {
                e.preventDefault();
                alert('For prototype demo, use password: StrongPassword123 or click the quick demo buttons below.');
              }}
              style={{ color: 'var(--accent-blue)', fontWeight: 500 }}
            >
              Forgot Password?
            </a>
          </div>

          {/* Quick Demo Fill Buttons */}
          <div style={{ marginTop: '28px', paddingTop: '18px', borderTop: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-light)', textAlign: 'center', marginBottom: '10px' }}>
              ONE-CLICK DEMO ACCOUNTS
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              <button
                type="button"
                onClick={() => fillDemoAccount('donor@bridge.org')}
                style={{
                  padding: '7px 4px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--primary-green-light)',
                  border: '1px solid var(--primary-green-border)',
                  color: 'var(--primary-green)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                Donor
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('beneficiary@bridge.org')}
                style={{
                  padding: '7px 4px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--accent-purple-light)',
                  border: '1px solid var(--accent-purple-border)',
                  color: 'var(--accent-purple)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                Beneficiary
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('admin@bridge.org')}
                style={{
                  padding: '7px 4px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--accent-amber-light)',
                  border: '1px solid var(--accent-amber-border)',
                  color: 'var(--accent-amber)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                Admin
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Right Column: Hero Graphic Banner (Desktop / Tablet) */}
      <div
        className="desktop-only"
        style={{
          flex: '1 1 500px',
          position: 'relative',
          backgroundImage: 'linear-gradient(rgba(15, 23, 42, 0.45), rgba(15, 23, 42, 0.75)), url("https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 'clamp(32px, 5vw, 60px)',
          color: '#ffffff',
          minHeight: '400px',
        }}
      >
        <div style={{ maxWidth: '440px' }}>
          <h2
            style={{
              fontSize: 'clamp(2.2rem, 4vw, 2.8rem)',
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.2,
              marginBottom: '20px',
              letterSpacing: '-0.02em',
            }}
          >
            Together <br />
            for a Better <br />
            Tomorrow
          </h2>

          <p
            style={{
              fontSize: '1.05rem',
              color: 'rgba(255, 255, 255, 0.88)',
              lineHeight: 1.6,
            }}
          >
            Your support can change lives. Donate with trust and transparency on BRIDGE.
          </p>
        </div>
      </div>

    </div>
  );
}
