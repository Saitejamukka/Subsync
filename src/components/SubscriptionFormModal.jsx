import React, { useState, useEffect } from 'react';
import { X, Sparkles, Plus, Check } from 'lucide-react';
import { CATEGORIES, BILLING_CYCLES, PAYMENT_METHODS, SERVICE_PRESETS } from '../constants';

export default function SubscriptionFormModal({
  isOpen,
  onClose,
  onSave,
  editingSubscription
}) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'entertainment',
    amount: '',
    currency: 'USD',
    billingCycle: 'monthly',
    nextBillingDate: new Date().toISOString().split('T')[0],
    autoRenew: true,
    status: 'active',
    paymentMethod: 'Credit Card (Visa)',
    reminderDays: 3,
    notes: '',
    color: '#8B5CF6'
  });

  const [formError, setFormError] = useState('');

  useEffect(() => {
    setFormError('');
    if (editingSubscription) {
      setFormData({
        ...editingSubscription
      });
    } else {
      // Reset form
      setFormData({
        name: '',
        category: 'entertainment',
        amount: '',
        currency: 'USD',
        billingCycle: 'monthly',
        nextBillingDate: new Date().toISOString().split('T')[0],
        autoRenew: true,
        status: 'active',
        paymentMethod: 'Credit Card (Visa)',
        reminderDays: 3,
        notes: '',
        color: '#8B5CF6'
      });
    }
  }, [editingSubscription, isOpen]);

  if (!isOpen) return null;

  const handleApplyPreset = (preset) => {
    setFormError('');
    const categoryObj = CATEGORIES.find(c => c.id === preset.category) || CATEGORIES[0];
    setFormData(prev => ({
      ...prev,
      name: preset.name,
      category: preset.category,
      amount: preset.amount,
      billingCycle: preset.cycle,
      color: preset.color || categoryObj.color
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name || !formData.name.trim()) {
      setFormError('Please enter a valid subscription name.');
      return;
    }

    const numAmount = parseFloat(formData.amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setFormError('Please enter a valid subscription amount greater than 0.');
      return;
    }

    if (!formData.nextBillingDate) {
      setFormError('Please select a next billing date.');
      return;
    }

    onSave({
      ...formData,
      name: formData.name.trim(),
      amount: numAmount
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={20} color="var(--primary)" />
            <h2 className="modal-title">
              {editingSubscription ? 'Edit Subscription' : 'Add New Subscription'}
            </h2>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {formError && (
          <div 
            style={{ 
              background: 'var(--accent-red-bg)', 
              color: '#B91C1C', 
              padding: '0.65rem 1rem', 
              borderRadius: 'var(--radius-md)', 
              fontSize: '0.85rem',
              fontWeight: '600',
              marginBottom: '1rem',
              border: '1px solid rgba(239, 68, 68, 0.3)'
            }}
          >
            {formError}
          </div>
        )}

        {/* Popular Presets Bar (only on new) */}
        {!editingSubscription && (
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: '600' }}>
              ⚡ QUICK PRESETS
            </div>
            <div className="presets-scroll">
              {SERVICE_PRESETS.map((preset, idx) => (
                <button 
                  key={idx} 
                  type="button" 
                  className="preset-pill"
                  onClick={() => handleApplyPreset(preset)}
                >
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: preset.color }}></span>
                  <span>{preset.name} (${preset.amount})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-grid">
          {/* Service Name */}
          <div className="form-group full-width">
            <label>Service Name *</label>
            <input 
              type="text" 
              placeholder="e.g. Netflix, Spotify, ChatGPT" 
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          {/* Amount */}
          <div className="form-group">
            <label>Billing Amount ($) *</label>
            <input 
              type="number" 
              step="0.01" 
              min="0" 
              placeholder="14.99" 
              required
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            />
          </div>

          {/* Billing Cycle */}
          <div className="form-group">
            <label>Billing Cycle *</label>
            <select 
              value={formData.billingCycle} 
              onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })}
            >
              {BILLING_CYCLES.map(cycle => (
                <option key={cycle.id} value={cycle.id}>{cycle.label}</option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div className="form-group">
            <label>Category *</label>
            <select 
              value={formData.category} 
              onChange={(e) => {
                const catObj = CATEGORIES.find(c => c.id === e.target.value);
                setFormData({ 
                  ...formData, 
                  category: e.target.value,
                  color: catObj ? catObj.color : formData.color
                });
              }}
            >
              {CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Next Billing Date */}
          <div className="form-group">
            <label>Next Renewal Date *</label>
            <input 
              type="date" 
              required
              value={formData.nextBillingDate}
              onChange={(e) => setFormData({ ...formData, nextBillingDate: e.target.value })}
            />
          </div>

          {/* Payment Method */}
          <div className="form-group">
            <label>Payment Method</label>
            <select 
              value={formData.paymentMethod} 
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
            >
              {PAYMENT_METHODS.map(method => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
          </div>

          {/* Reminder Notice Lead Time */}
          <div className="form-group">
            <label>Reminder Alert</label>
            <select 
              value={formData.reminderDays} 
              onChange={(e) => setFormData({ ...formData, reminderDays: parseInt(e.target.value) })}
            >
              <option value={1}>1 Day Before</option>
              <option value={3}>3 Days Before</option>
              <option value={5}>5 Days Before</option>
              <option value={7}>1 Week Before</option>
            </select>
          </div>

          {/* Status */}
          <div className="form-group">
            <label>Subscription Status</label>
            <select 
              value={formData.status} 
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Auto-renew Toggle */}
          <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
            <input 
              type="checkbox" 
              id="autoRenewCheck"
              checked={formData.autoRenew}
              onChange={(e) => setFormData({ ...formData, autoRenew: e.target.checked })}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label htmlFor="autoRenewCheck" style={{ cursor: 'pointer', margin: 0 }}>
              Auto-renew is Enabled
            </label>
          </div>

          {/* Brand Accent Color */}
          <div className="form-group">
            <label>Brand Theme Color</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input 
                type="color" 
                value={formData.color} 
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                style={{ width: '40px', height: '36px', padding: 0, border: 'none', cursor: 'pointer', borderRadius: '6px' }}
              />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formData.color}</span>
            </div>
          </div>

          {/* Custom Notes */}
          <div className="form-group full-width">
            <label>Notes / Memo</label>
            <textarea 
              rows={2}
              placeholder="Add shared family details, account emails, or cancellation instructions..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          {/* Modal Actions */}
          <div className="form-group full-width" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Check size={16} />
              <span>{editingSubscription ? 'Update Subscription' : 'Save Subscription'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
