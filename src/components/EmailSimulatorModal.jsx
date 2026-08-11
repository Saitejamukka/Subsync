import React from 'react';
import { X, Mail, Zap, Calendar, AlertCircle } from 'lucide-react';
import { formatCurrency, getRenewalUrgency } from '../utils/storage';

export default function EmailSimulatorModal({ isOpen, onClose, subscription, currency }) {
  if (!isOpen || !subscription) return null;

  const urgency = getRenewalUrgency(subscription.nextBillingDate);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '620px', background: '#0F172A' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Mail size={20} color="#06B6D4" />
            <h2 className="modal-title">Email Notification Simulator</h2>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Email Header Bar */}
        <div style={{ background: '#1E293B', padding: '0.85rem 1rem', borderRadius: '8px 8px 0 0', border: '1px solid #334155', borderBottom: 'none', fontSize: '0.82rem' }}>
          <div style={{ color: '#94A3B8', marginBottom: '0.3rem' }}>
            <strong>From:</strong> SubSync Reminder Bot &lt;alerts@subsync.app&gt;
          </div>
          <div style={{ color: '#94A3B8', marginBottom: '0.3rem' }}>
            <strong>To:</strong> User &lt;you@example.com&gt;
          </div>
          <div style={{ color: '#F8FAFC', fontWeight: '700' }}>
            <strong>Subject:</strong> 🔔 Upcoming Renewal: {subscription.name} charge scheduled for {subscription.nextBillingDate}
          </div>
        </div>

        {/* Email Body Card */}
        <div style={{ background: '#FFFFFF', color: '#1E293B', padding: '1.75rem', borderRadius: '0 0 8px 8px', border: '1px solid #E2E8F0', fontFamily: 'Arial, sans-serif' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #F1F5F9', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#7C3AED', fontWeight: '800', fontSize: '1.2rem' }}>
              ⚡ SubSync
            </div>
            <span style={{ fontSize: '0.75rem', background: '#F1F5F9', padding: '0.25rem 0.5rem', borderRadius: '4px', color: '#64748B' }}>
              Automated Alert
            </span>
          </div>

          <h3 style={{ fontSize: '1.1rem', color: '#0F172A', marginBottom: '0.75rem' }}>
            Renewal Notice for {subscription.name}
          </h3>

          <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: '1.5', marginBottom: '1.25rem' }}>
            Hi there! This is a friendly reminder from SubSync. Your subscription for <strong>{subscription.name}</strong> is scheduled for auto-renewal in <strong>{urgency.label}</strong>.
          </p>

          {/* Details Table */}
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              <span style={{ color: '#64748B' }}>Service Name:</span>
              <strong style={{ color: '#0F172A' }}>{subscription.name}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              <span style={{ color: '#64748B' }}>Amount:</span>
              <strong style={{ color: '#0F172A' }}>{formatCurrency(subscription.amount, currency)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              <span style={{ color: '#64748B' }}>Billing Cycle:</span>
              <span style={{ textTransform: 'capitalize', color: '#0F172A' }}>{subscription.billingCycle}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span style={{ color: '#64748B' }}>Renewal Date:</span>
              <strong style={{ color: urgency.color }}>{subscription.nextBillingDate} ({urgency.label})</strong>
            </div>
          </div>

          <p style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: '1.4', marginBottom: '1.25rem' }}>
            If you wish to keep this subscription, no action is required. If you want to make changes or cancel before billing, please log into your account settings.
          </p>

          <div style={{ textAlign: 'center' }}>
            <button 
              style={{ background: '#7C3AED', color: '#FFF', border: 'none', padding: '0.65rem 1.5rem', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem' }}
              onClick={onClose}
            >
              Manage in SubSync
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
