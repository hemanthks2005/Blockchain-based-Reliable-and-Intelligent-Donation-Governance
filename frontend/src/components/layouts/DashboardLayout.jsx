import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, ROLES } from '../../context/AuthContext';
import { BridgeLogo } from '../common/BridgeLogo';

export function DashboardLayout({ children, activeTab = 'dashboard' }) {
  const { currentUser, role, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const donorNav = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/donor' },
    { id: 'browse', label: 'Browse Campaigns', icon: '🔍', path: '/campaigns' },
    { id: 'donations', label: 'My Donations', icon: '💖', path: '/donor#donations' },
    { id: 'transactions', label: 'Transaction History', icon: '🔄', path: '/donor#transactions' },
    { id: 'profile', label: 'Profile', icon: '👤', path: '/donor#profile' },
  ];

  const beneficiaryNav = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/beneficiary' },
    { id: 'profile', label: 'My Profile', icon: '👤', path: '/beneficiary#profile' },
    { id: 'create', label: 'Create Campaign', icon: '➕', path: '/beneficiary#create' },
    { id: 'campaigns', label: 'My Campaigns', icon: '📁', path: '/beneficiary#campaigns' },
    { id: 'requests', label: 'Fund Requests', icon: '📄', path: '/beneficiary#requests' },
    { id: 'transactions', label: 'Transaction History', icon: '🔄', path: '/beneficiary#transactions' },
  ];

  const adminNav = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/admin' },
    { id: 'verify', label: 'Verify Beneficiaries', icon: '🛡️', path: '/admin#verify' },
    { id: 'approve', label: 'Approve Campaigns', icon: '📋', path: '/admin#approve' },
    { id: 'fund_release', label: 'Fund Release', icon: '💸', path: '/admin#release' },
    { id: 'donations', label: 'View Donations', icon: '👁️', path: '/admin#donations' },
    { id: 'users', label: 'Users', icon: '👥', path: '/admin#users' },
    { id: 'logs', label: 'Transaction Logs', icon: '📜', path: '/admin#logs' },
  ];

  const navItems = role === ROLES.ADMIN ? adminNav : role === ROLES.BENEFICIARY ? beneficiaryNav : donorNav;

  const sidebarContent = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Sidebar Logo Header */}
      <div style={{ padding: '22px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <BridgeLogo size="md" to="/" />
        <button
          className="mobile-only"
          onClick={() => setMobileSidebarOpen(false)}
          style={{ fontSize: '1.2rem', color: 'var(--text-muted)', padding: '4px' }}
        >
          ✕
        </button>
      </div>

      {/* Sidebar Navigation */}
      <nav style={{ padding: '20px 14px', flex: 1, overflowY: 'auto' }}>
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <Link
              key={item.id}
              to={item.path}
              onClick={() => setMobileSidebarOpen(false)}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}

        <button
          onClick={handleLogout}
          className="sidebar-link"
          style={{ width: '100%', marginTop: '16px', color: 'var(--danger-red)' }}
        >
          <span style={{ fontSize: '1.1rem' }}>🚪</span>
          <span>Logout</span>
        </button>
      </nav>

      {/* Bottom User summary */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-subtle)' }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-dark)' }}>
          {currentUser?.name || 'User'}
        </div>
        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
          {currentUser?.email}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-app)', position: 'relative' }}>
      
      {/* Desktop Left Sidebar (Screen 3, 4, 5) */}
      <aside
        className="desktop-only"
        style={{
          width: '260px',
          backgroundColor: '#ffffff',
          borderRight: '1px solid var(--border-light)',
          position: 'sticky',
          top: 0,
          height: '100vh',
          flexShrink: 0,
        }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Off-canvas Drawer Sidebar */}
      {mobileSidebarOpen && (
        <div
          className="mobile-only"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
          }}
        >
          {/* Backdrop */}
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.5)',
              backdropFilter: 'blur(2px)',
            }}
            onClick={() => setMobileSidebarOpen(false)}
          />

          {/* Drawer Body */}
          <aside
            style={{
              position: 'relative',
              width: '280px',
              maxWidth: '85vw',
              backgroundColor: '#ffffff',
              height: '100%',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 101,
            }}
          >
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        
        {/* Mobile Header Bar with Hamburger Button */}
        <header
          className="mobile-only"
          style={{
            height: '60px',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
            position: 'sticky',
            top: 0,
            zIndex: 40,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setMobileSidebarOpen(true)}
              style={{
                fontSize: '1.25rem',
                color: 'var(--text-dark)',
                padding: '6px 8px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-light)',
              }}
              aria-label="Open navigation sidebar"
            >
              ☰
            </button>
            <BridgeLogo size="sm" to="/" />
          </div>

          <span className="badge-approved" style={{ fontSize: '0.75rem' }}>
            {role}
          </span>
        </header>

        {/* Dashboard Body */}
        <main style={{ flex: 1, padding: 'clamp(16px, 3vw, 36px)', overflowY: 'auto' }}>
          
          {/* Top Welcome Card */}
          <div
            className="bridge-card"
            style={{
              padding: '16px 20px',
              marginBottom: '24px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.25rem' }}>👤</span>
              <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-dark)' }}>
                Welcome, {currentUser?.name || (role === ROLES.ADMIN ? 'Admin' : role === ROLES.BENEFICIARY ? 'NGO Hope' : 'John Doe')} ({role === ROLES.ADMIN ? 'Admin' : role === ROLES.BENEFICIARY ? 'Beneficiary' : 'Donor'})
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Link to="/" style={{ fontSize: '0.85rem', color: 'var(--primary-green)', fontWeight: 600 }}>
                ← Return Home
              </Link>
              <span className="badge-approved" style={{ fontSize: '0.7rem' }}>
                Live Network
              </span>
            </div>
          </div>

          {/* Children Dashboard Content */}
          {children}

        </main>
      </div>

    </div>
  );
}
