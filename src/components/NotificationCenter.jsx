import React from 'react';
import { 
  X, 
  Bell, 
  Check, 
  AlertTriangle, 
  Mail, 
  ShieldCheck, 
  Clock 
} from 'lucide-react';
import { getDaysRemaining, formatCurrency } from '../utils/storage';

export default function NotificationCenter({
  isOpen,
  onClose,
  subscriptions,
  currency,
  onSimulateEmail,
  browserNotifEnabled,
  onToggleBrowserNotif
}) {
  if (!isOpen) return null;

  // Filter subscriptions that are due within 7 days or overdue
  const alertSubs = subscriptions.filter(s => {
    if (s.status !== 'active') return false;
    const days = getDaysRemaining(s.nextBillingDate);
    return days <= 7;
  });

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bell size={20} color="var(--primary)" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: '800' }}>Reminders & Alerts</h2>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Browser Push Permission Toggle */}
        <div 
          style={{ 
            background: 'rgba(139, 92, 246, 0.1)',
            border: '1px solid rgba(139, 92, 246, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            marginBottom: '1.5rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <span style={{ fontWeight: '700', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={16} color="var(--accent-emerald)" />
              Browser Notifications
            </span>
            <input 
              type="checkbox" 
              checked={browserNotifEnabled}
              onChange={onToggleBrowserNotif}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Get native desktop alerts before auto-renewals charge your credit card.
          </p>
        </div>

        {/* Alert List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Upcoming Renewal Alerts ({alertSubs.length})
          </h3>

          {alertSubs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              <Check size={36} color="#10B981" style={{ marginBottom: '0.5rem' }} />
              <p style={{ fontWeight: '600' }}>No Urgent Renewals</p>
              <p style={{ fontSize: '0.8rem', marginTop: '0.2rem' }}>All active subscriptions are clear for the next 7 days.</p>
            </div>
          ) : (
            alertSubs.map(sub => {
              const days = getDaysRemaining(sub.nextBillingDate);
              const isOverdue = days < 0;
              const isToday = days === 0;

              return (
                <div 
                  key={sub.id}
                  style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.85rem 1rem',
                    borderLeft: `4px solid ${isOverdue ? '#EF4444' : isToday ? '#F59E0B' : '#06B6D4'}`
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>{sub.name}</span>
                    <span style={{ fontWeight: '800', color: 'var(--text-main)' }}>
                      {formatCurrency(sub.amount, currency)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span style={{ color: isOverdue ? '#EF4444' : isToday ? '#F59E0B' : 'var(--text-secondary)', fontWeight: '700' }}>
                      {isOverdue ? `Overdue by ${Math.abs(days)} days!` : isToday ? 'Renews Today!' : `Due in ${days} days`}
                    </span>

                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                      onClick={() => {
                        onSimulateEmail(sub);
                        onClose();
                      }}
                    >
                      <Mail size={12} color="#06B6D4" />
                      <span>Preview Alert</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
