import React from 'react';
import { 
  Calendar, 
  RefreshCw, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  PauseCircle, 
  PlayCircle,
  Mail
} from 'lucide-react';
import { CATEGORIES } from '../constants';
import { getRenewalUrgency, formatCurrency } from '../utils/storage';

export default function SubscriptionCard({
  subscription,
  currency,
  onEdit,
  onDelete,
  onToggleStatus,
  onMarkPaid,
  onSimulateEmail
}) {
  const urgency = getRenewalUrgency(subscription.nextBillingDate);
  const categoryObj = CATEGORIES.find(c => c.id === subscription.category) || CATEGORIES[CATEGORIES.length - 1];
  const brandColor = subscription.color || categoryObj.color || '#10B981';

  let badgeBg = 'var(--green-badge-bg)';
  let badgeTextColor = 'var(--green-badge-text)';
  if (urgency.level === 'overdue') {
    badgeBg = 'var(--accent-red-bg)';
    badgeTextColor = '#B91C1C';
  } else if (urgency.level === 'today' || urgency.level === 'urgent') {
    badgeBg = 'var(--accent-amber-bg)';
    badgeTextColor = '#B45309';
  }

  return (
    <div className="sub-card" style={{ opacity: subscription.status === 'cancelled' ? 0.6 : 1 }}>
      {/* Top Header */}
      <div className="sub-card-header">
        <div className="sub-card-title-group">
          <div className="service-logo" style={{ background: brandColor }}>
            {subscription.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="sub-name">{subscription.name}</div>
            <div className="sub-category" style={{ color: categoryObj.color }}>
              {categoryObj.name}
            </div>
          </div>
        </div>

        <div className="sub-amount-tag">
          <div className="sub-price">
            {formatCurrency(subscription.amount, currency)}
          </div>
          <div className="sub-cycle">/{subscription.billingCycle}</div>
        </div>
      </div>

      {/* Urgency & Status Badges */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="urgency-badge" style={{ background: badgeBg, color: badgeTextColor }}>
          <Calendar size={13} />
          <span>{urgency.label}</span>
        </div>

        <span className={`status-pill status-${subscription.status}`}>
          {subscription.status}
        </span>
      </div>

      {/* Notes if present */}
      {subscription.notes && (
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic', background: 'var(--bg-main)', padding: '0.45rem 0.65rem', borderRadius: '6px' }}>
          "{subscription.notes}"
        </p>
      )}

      {/* Footer Actions */}
      <div className="sub-card-footer">
        <div className="card-actions">
          {/* Pause / Resume */}
          <button 
            className="btn-icon-only" 
            onClick={() => onToggleStatus(subscription.id)} 
            title={subscription.status === 'active' ? 'Pause subscription' : 'Activate subscription'}
          >
            {subscription.status === 'active' ? <PauseCircle size={16} color="#D97706" /> : <PlayCircle size={16} color="#10B981" />}
          </button>

          {/* Email Preview */}
          <button 
            className="btn-icon-only" 
            onClick={() => onSimulateEmail(subscription)}
            title="Preview email reminder"
          >
            <Mail size={16} color="#0284C7" />
          </button>

          {/* Edit */}
          <button 
            className="btn-icon-only" 
            onClick={() => onEdit(subscription)}
            title="Edit subscription"
          >
            <Edit3 size={16} color="var(--text-secondary)" />
          </button>

          {/* Delete */}
          <button 
            className="btn-icon-only" 
            onClick={() => onDelete(subscription.id)}
            title="Delete subscription"
          >
            <Trash2 size={16} color="#EF4444" />
          </button>
        </div>

        {/* Mark Paid Quick Button */}
        {subscription.status === 'active' && (
          <button 
            className="btn btn-secondary" 
            style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
            onClick={() => onMarkPaid(subscription.id)}
            title="Advance next billing date"
          >
            <CheckCircle2 size={14} color="var(--green-dark)" />
            <span>Mark Paid</span>
          </button>
        )}
      </div>
    </div>
  );
}
