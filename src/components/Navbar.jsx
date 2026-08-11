import React from 'react';
import { 
  Zap, 
  Plus, 
  Bell, 
  Download, 
  Globe 
} from 'lucide-react';
import { CURRENCIES } from '../constants';

export default function Navbar({
  currency,
  onCurrencyChange,
  unreadNotificationsCount,
  onOpenAddModal,
  onOpenNotifications,
  onOpenExportModal,
  formattedMonthly
}) {
  return (
    <header className="navbar">
      <div className="brand">
        <div className="brand-icon">
          <Zap size={24} />
        </div>
        <div>
          <div className="brand-title">SubSync</div>
          <div className="brand-subtitle">Smart Subscription & Expense Tracker</div>
        </div>
      </div>

      <div className="nav-actions">
        {/* Quick Spend Summary Pill */}
        <div 
          style={{
            background: 'rgba(139, 92, 246, 0.12)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            padding: '0.4rem 0.85rem',
            borderRadius: '20px',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: '600'
          }}
        >
          <span style={{ color: 'var(--text-secondary)' }}>Monthly:</span>
          <span style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '0.95rem' }}>
            {formattedMonthly}
          </span>
        </div>

        {/* Currency Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Globe size={16} style={{ color: 'var(--text-secondary)' }} />
          <select 
            className="select-input" 
            value={currency} 
            onChange={(e) => onCurrencyChange(e.target.value)}
            style={{ padding: '0.45rem 0.65rem' }}
          >
            {Object.keys(CURRENCIES).map(code => (
              <option key={code} value={code}>
                {CURRENCIES[code].symbol} {code}
              </option>
            ))}
          </select>
        </div>

        {/* Notification Bell */}
        <button 
          className="btn-icon-only" 
          onClick={onOpenNotifications}
          title="Notification Center & Alerts"
        >
          <Bell size={18} />
          {unreadNotificationsCount > 0 && (
            <span className="badge-dot">{unreadNotificationsCount}</span>
          )}
        </button>

        {/* Backup / Export */}
        <button 
          className="btn btn-secondary" 
          onClick={onOpenExportModal}
          title="Backup & Restore Data"
        >
          <Download size={16} />
          <span>Backup</span>
        </button>

        {/* Add Subscription Button */}
        <button className="btn btn-primary" onClick={onOpenAddModal}>
          <Plus size={18} />
          <span>Add Subscription</span>
        </button>
      </div>
    </header>
  );
}
