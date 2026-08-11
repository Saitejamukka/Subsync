import { getInitialSubscriptions, saveSubscriptions } from '../utils/storage';

const API_BASE = '/api/subscriptions';

export const fetchSubscriptions = async () => {
  try {
    const res = await fetch(API_BASE);
    if (res.ok) {
      const data = await res.json();
      // Sync local storage copy
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
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subData)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Backend API error creating subscription. Using LocalStorage fallback.', e);
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
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subData)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Backend API error updating subscription. Using LocalStorage fallback.', e);
  }
  // Fallback
  const current = getInitialSubscriptions();
  const updated = current.map(s => s.id === id ? { ...subData, id } : s);
  saveSubscriptions(updated);
  return { ...subData, id };
};

export const deleteSubscription = async (id) => {
  try {
    const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    if (res.ok) {
      return true;
    }
  } catch (e) {
    console.warn('Backend API error deleting subscription. Using LocalStorage fallback.', e);
  }
  const current = getInitialSubscriptions();
  const updated = current.filter(s => s.id !== id);
  saveSubscriptions(updated);
  return true;
};

export const markSubscriptionPaid = async (id) => {
  try {
    const res = await fetch(`${API_BASE}/${id}/mark-paid`, { method: 'POST' });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Backend API error marking paid. Using LocalStorage fallback.', e);
  }
  return null;
};
