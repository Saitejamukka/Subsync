import { getInitialSubscriptions, saveSubscriptions } from '../utils/storage';

const API_BASE = '/api';
const TOKEN_KEY = 'subsync_jwt_token';

export const getAuthToken = () => localStorage.getItem(TOKEN_KEY);
export const setAuthToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const removeAuthToken = () => localStorage.removeItem(TOKEN_KEY);

const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

// 1. Auth Services
export const registerUser = async (name, email, password) => {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  const data = await res.json();
  if (data.token) {
    setAuthToken(data.token);
  }
  return data;
};

export const loginUser = async (email, password) => {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (data.token) {
    setAuthToken(data.token);
  }
  return data;
};

export const requestForgotPassword = async (email) => {
  const res = await fetch(`${API_BASE}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  return await res.json();
};

export const resetPasswordWithToken = async (email, token, newPassword) => {
  const res = await fetch(`${API_BASE}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, token, newPassword })
  });
  return await res.json();
};

export const fetchCurrentUser = async () => {
  const token = getAuthToken();
  if (!token) return null;
  try {
    const res = await fetch(`${API_BASE}/auth/me`, { headers: getAuthHeaders() });
    if (res.ok) {
      const data = await res.json();
      return data.user;
    }
  } catch (e) {
    console.warn('Failed to validate session token', e);
  }
  return null;
};

export const logoutUser = () => {
  removeAuthToken();
};

// 2. Subscriptions API Services
export const fetchSubscriptions = async () => {
  try {
    const res = await fetch(`${API_BASE}/subscriptions`, { headers: getAuthHeaders() });
    if (res.ok) {
      const data = await res.json();
      saveSubscriptions(data);
      return data;
    }
  } catch (e) {
    console.warn('Backend API unavailable. Falling back to LocalStorage.', e);
  }
  return getInitialSubscriptions();
};

export const createSubscription = async (subData) => {
  try {
    const res = await fetch(`${API_BASE}/subscriptions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(subData)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Backend API error creating subscription.', e);
  }
  // Fallback
  const newSub = { ...subData, id: `sub-${Date.now()}` };
  const current = getInitialSubscriptions();
  const updated = [newSub, ...current];
  saveSubscriptions(updated);
  return newSub;
};

export const updateSubscription = async (id, subData) => {
  try {
    const res = await fetch(`${API_BASE}/subscriptions/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(subData)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Backend API error updating subscription.', e);
  }
  // Fallback
  const current = getInitialSubscriptions();
  const updated = current.map(s => s.id === id ? { ...subData, id } : s);
  saveSubscriptions(updated);
  return { ...subData, id };
};

export const deleteSubscription = async (id) => {
  try {
    const res = await fetch(`${API_BASE}/subscriptions/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (res.ok) {
      return true;
    }
  } catch (e) {
    console.warn('Backend API error deleting subscription.', e);
  }
  const current = getInitialSubscriptions();
  const updated = current.filter(s => s.id !== id);
  saveSubscriptions(updated);
  return true;
};

export const markSubscriptionPaid = async (id) => {
  try {
    const res = await fetch(`${API_BASE}/subscriptions/${id}/mark-paid`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Backend API error marking paid.', e);
  }
  return null;
};
