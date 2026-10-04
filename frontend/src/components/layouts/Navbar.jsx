import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, ROLES } from '../../context/AuthContext';
import { BridgeLogo } from '../common/BridgeLogo';

export function Navbar() {
  const { currentUser, role, isAuthenticated, logout, switchRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '70px',
        }}
      >
        {/* Logo */}
        <BridgeLogo size="md" to="/" />

        {/* Desktop Center Navigation Links */}
        <nav className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          <Link
            to="/"
            style={{
              fontSize: '0.95rem',
              fontWeight: isActive('/') ? 600 : 500,
              color: isActive('/') ? 'var(--primary-green)' : 'var(--text-muted)',
              transition: 'color 0.15s',
            }}
          >
            Home
          </Link>
          <Link
            to="/campaigns"
            style={{
              fontSize: '0.95rem',
              fontWeight: isActive('/campaigns') ? 600 : 500,
              color: isActive('/campaigns') ? 'var(--primary-green)' : 'var(--text-muted)',
              transition: 'color 0.15s',
            }}
          >
            Campaigns
          </Link>
          <a
            href="/#about"
            style={{
              fontSize: '0.95rem',
              fontWeight: 500,
              color: 'var(--text-muted)',
            }}
          >
            About
          </a>
          <a
            href="/#contact"
            style={{
              fontSize: '0.95rem',
              fontWeight: 500,
              color: 'var(--text-muted)',
            }}
          >
            Contact
          </a>
          <Link
            to="/diagnostics"
            style={{
              fontSize: '0.85rem',
              fontWeight: 500,
              color: 'var(--text-light)',
            }}
          >
            Diagnostics
          </Link>
        </nav>

        {/* Desktop Right Auth Area */}
        <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Link
                to={role === ROLES.ADMIN ? '/admin' : role === ROLES.BENEFICIARY ? '/beneficiary' : '/donor'}
                className="btn-primary"
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                Dashboard →
              </Link>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <span>👤</span>
                <span style={{ fontWeight: 600, color: 'var(--text-dark)' }}>
                  {currentUser?.name || currentUser?.email?.split('@')[0]}
                </span>
                <span className="badge-approved" style={{ fontSize: '0.7rem' }}>
                  {role}
                </span>
              </div>

              {/* Dev Quick Role Switcher */}
              <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-subtle)', padding: '2px 4px', borderRadius: '6px' }}>
                {[ROLES.DONOR, ROLES.BENEFICIARY, ROLES.ADMIN].map((r) => (
                  <button
                    key={r}
                    onClick={() => switchRole(r)}
                    title={`Switch role to ${r}`}
                    style={{
                      padding: '2px 6px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      borderRadius: '4px',
                      background: role === r ? 'var(--primary-green)' : 'transparent',
                      color: role === r ? '#fff' : 'var(--text-muted)',
                    }}
                  >
                    {r[0]}
                  </button>
                ))}
              </div>

              <button
                onClick={handleLogout}
                style={{
                  padding: '7px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-light)',
                  color: 'var(--danger-red)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  backgroundColor: '#ffffff',
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Link
                to="/login"
                className="btn-secondary"
                style={{ padding: '8px 18px', fontSize: '0.9rem' }}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="btn-primary"
                style={{ padding: '8px 18px', fontSize: '0.9rem' }}
              >
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          className="mobile-only"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            padding: '8px 12px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-light)',
            color: 'var(--text-dark)',
            fontSize: '1.25rem',
            lineHeight: 1,
          }}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          className="mobile-only"
          style={{
            backgroundColor: '#ffffff',
            borderTop: '1px solid var(--border-light)',
            padding: '20px 20px 28px',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <Link
            to="/"
            onClick={closeMenu}
            style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: isActive('/') ? 'var(--primary-green)' : 'var(--text-dark)',
              padding: '6px 0',
            }}
          >
            Home
          </Link>
          <Link
            to="/campaigns"
            onClick={closeMenu}
            style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: isActive('/campaigns') ? 'var(--primary-green)' : 'var(--text-dark)',
              padding: '6px 0',
            }}
          >
            Campaigns
          </Link>
          <a
            href="/#about"
            onClick={closeMenu}
            style={{
              fontSize: '1rem',
              fontWeight: 500,
              color: 'var(--text-muted)',
              padding: '6px 0',
            }}
          >
            About
          </a>
          <a
            href="/#contact"
            onClick={closeMenu}
            style={{
              fontSize: '1rem',
              fontWeight: 500,
              color: 'var(--text-muted)',
              padding: '6px 0',
            }}
          >
            Contact
          </a>
          <Link
            to="/diagnostics"
            onClick={closeMenu}
            style={{
              fontSize: '0.95rem',
              fontWeight: 500,
              color: 'var(--text-muted)',
              padding: '6px 0',
            }}
          >
            System Diagnostics
          </Link>

          <div style={{ height: '1px', backgroundColor: 'var(--border-light)', margin: '8px 0' }} />

          {isAuthenticated ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>👤</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-dark)' }}>
                    {currentUser?.name}
                  </span>
                </div>
                <span className="badge-approved">{role}</span>
              </div>

              <Link
                to={role === ROLES.ADMIN ? '/admin' : role === ROLES.BENEFICIARY ? '/beneficiary' : '/donor'}
                onClick={closeMenu}
                className="btn-primary"
                style={{ width: '100%', textAlign: 'center', padding: '10px' }}
              >
                Go to Dashboard →
              </Link>

              <button
                onClick={handleLogout}
                className="btn-secondary"
                style={{ width: '100%', textAlign: 'center', padding: '10px', color: 'var(--danger-red)' }}
              >
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '10px' }}>
              <Link
                to="/login"
                onClick={closeMenu}
                className="btn-secondary"
                style={{ flex: 1, textAlign: 'center', padding: '10px' }}
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={closeMenu}
                className="btn-primary"
                style={{ flex: 1, textAlign: 'center', padding: '10px' }}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
