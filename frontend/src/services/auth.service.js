import { API_URL } from './api';

const AUTH_URL = `${API_URL}/auth`;

/**
 * Register a new user
 * @param {object} payload { name, email, password, role, walletAddress }
 */
export async function register(payload) {
  const res = await fetch(`${AUTH_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || data.message || 'Registration failed');
  }
  return data;
}

/**
 * Log in with email & password
 * @param {object} credentials { email, password }
 */
export async function login(credentials) {
  const res = await fetch(`${AUTH_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || data.message || 'Login failed');
  }
  return data.data; // { accessToken, user }
}

/**
 * Fetch current authenticated user profile
 * @param {string} token 
 */
export async function fetchMe(token) {
  const res = await fetch(`${AUTH_URL}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || 'Failed to authenticate session');
  }
  return data.data.user;
}

/**
 * Logout from backend
 * @param {string} token 
 */
export async function logout(token) {
  try {
    if (!token) return;
    await fetch(`${AUTH_URL}/logout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (_e) {
    // Ignore network errors during logout
  }
}
