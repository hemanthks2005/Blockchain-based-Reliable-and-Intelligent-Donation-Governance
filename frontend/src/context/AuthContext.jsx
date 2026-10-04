import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authService from '../services/auth.service';

const AuthContext = createContext(null);

export const ROLES = {
  DONOR: 'DONOR',
  BENEFICIARY: 'BENEFICIARY',
  ADMIN: 'ADMIN',
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('bridge_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('bridge_token') || null);
  const [loading, setLoading] = useState(true);

  // Validate token on initial mount
  useEffect(() => {
    let isMounted = true;
    async function verifyAuth() {
      const storedToken = localStorage.getItem('bridge_token');
      if (storedToken) {
        try {
          const user = await authService.fetchMe(storedToken);
          if (isMounted) {
            setCurrentUser(user);
            setToken(storedToken);
          }
        } catch (_err) {
          // Token expired or server unreachable: fallback to cached user or clear
          if (isMounted) {
            const savedUser = localStorage.getItem('bridge_user');
            if (savedUser) {
              setCurrentUser(JSON.parse(savedUser));
            } else {
              setCurrentUser(null);
              setToken(null);
              localStorage.removeItem('bridge_token');
              localStorage.removeItem('bridge_user');
            }
          }
        }
      }
      if (isMounted) setLoading(false);
    }

    verifyAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync state to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('bridge_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('bridge_user');
    }
  }, [currentUser]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('bridge_token', token);
    } else {
      localStorage.removeItem('bridge_token');
    }
  }, [token]);

  // Login handler
  const login = useCallback(async (email, password) => {
    const result = await authService.login({ email, password });
    setCurrentUser(result.user);
    setToken(result.accessToken);
    return result;
  }, []);

  // Register handler
  const register = useCallback(async (payload) => {
    const result = await authService.register(payload);
    if (result.data?.accessToken) {
      setCurrentUser({
        id: result.data.userId,
        name: result.data.name,
        email: result.data.email,
        role: result.data.role,
        walletAddress: result.data.walletAddress,
      });
      setToken(result.data.accessToken);
    }
    return result;
  }, []);

  // Logout handler
  const logout = useCallback(async () => {
    if (token) {
      await authService.logout(token);
    }
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem('bridge_token');
    localStorage.removeItem('bridge_user');
  }, [token]);

  // Quick-switch role helper for fast prototype walkthrough
  const switchRole = useCallback((newRole) => {
    if (!ROLES[newRole]) return;
    const presets = {
      DONOR: {
        id: '67abc1234567890123456781',
        name: 'Hemanth Donor',
        email: 'donor@bridge.org',
        role: ROLES.DONOR,
        walletAddress: '0x71C95911E9A5D330f4D621457224213B443d348a',
        status: 'ACTIVE',
      },
      BENEFICIARY: {
        id: '67abc1234567890123456782',
        name: 'ABC Foundation',
        email: 'beneficiary@bridge.org',
        role: ROLES.BENEFICIARY,
        walletAddress: '0x2546BcD3c84621e976D8185a91A922aE77ECEc30',
        status: 'ACTIVE',
      },
      ADMIN: {
        id: '67abc1234567890123456783',
        name: 'System Governance Admin',
        email: 'admin@bridge.org',
        role: ROLES.ADMIN,
        walletAddress: '0xbDA5747bFD65F08deb54cb465eB87D40e51B197E',
        status: 'ACTIVE',
      },
    };

    const targetUser = presets[newRole];
    setCurrentUser(targetUser);
    setToken(`demo_token_${newRole.toLowerCase()}`);
  }, []);

  const value = {
    currentUser,
    token,
    role: currentUser?.role || null,
    isAuthenticated: Boolean(currentUser && token),
    loading,
    login,
    register,
    logout,
    switchRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
