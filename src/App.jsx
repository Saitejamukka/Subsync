import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Calendar as CalendarIcon, 
  BarChart3, 
  Sparkles, 
  Bell, 
  ChevronDown, 
  ChevronUp,
  Clock,
  Zap,
  Globe,
  Download,
  Database
} from 'lucide-react';

// Components
import SubscriptionCard from './components/SubscriptionCard';
import SubscriptionFormModal from './components/SubscriptionFormModal';
import RenewalCalendar from './components/RenewalCalendar';
import AnalyticsView from './components/AnalyticsView';
import InsightsRadar from './components/InsightsRadar';
import NotificationCenter from './components/NotificationCenter';
import EmailSimulatorModal from './components/EmailSimulatorModal';
import ExportImportModal from './components/ExportImportModal';

// Constants & Storage
import { CATEGORIES, CURRENCIES, SAMPLE_SUBSCRIPTIONS } from './constants';
import { 
  getInitialSubscriptions, 
  saveSubscriptions, 
  getInitialPrefs, 
  savePrefs, 
  calculateSpendMetrics,
  getDaysRemaining,
  formatCurrency
} from './utils/storage';

// API Services
import { 
  fetchSubscriptions, 
  createSubscription, 
  updateSubscription, 
  deleteSubscription, 
  markSubscriptionPaid 
} from './services/api';

export default function App() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [prefs, setPrefs] = useState(getInitialPrefs);
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState(null);
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);
  const [selectedSubForEmail, setSelectedSubForEmail] = useState(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Collapsible Analytics Section
  const [showAdvancedTools, setShowAdvancedTools] = useState(false);
  const [advancedTab, setAdvancedTab] = useState('analytics');

  // Initial Data Fetching from Express API / SQLite
  const loadData = async () => {
    const data = await fetchSubscriptions();
    setSubscriptions(data);
    setIsBackendConnected(true);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    savePrefs(prefs);
  }, [prefs]);

  // Spend metrics
  const spendMetrics = useMemo(() => {
    return calculateSpendMetrics(subscriptions, prefs.currency);
  }, [subscriptions, prefs.currency]);

  // Urgent Subscriptions (due within 7 days)
  const urgentSubs = useMemo(() => {
    return subscriptions
      .filter(s => s.status === 'active' && getDaysRemaining(s.nextBillingDate) <= 7)
      .sort((a, b) => new Date(a.nextBillingDate) - new Date(b.nextBillingDate));
  }, [subscriptions]);

  // Filtered Subscriptions list
  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter(sub => {
      const matchesSearch = sub.name.toLowerCase().includes(search.toLowerCase()) ||
        (sub.notes && sub.notes.toLowerCase().includes(search.toLowerCase()));
      const matchesCat = activeCategory === 'all' || sub.category === activeCategory;
      return matchesSearch && matchesCat;
    }).sort((a, b) => new Date(a.nextBillingDate) - new Date(b.nextBillingDate));
  }, [subscriptions, search, activeCategory]);

  // Handlers
  const handleCurrencyChange = (c) => setPrefs(prev => ({ ...prev, currency: c }));
  const handleOpenAdd = () => { setEditingSub(null); setIsAddModalOpen(true); };
  const handleEdit = (sub) => { setEditingSub(sub); setIsAddModalOpen(true); };

  const handleSaveSub = async (subData) => {
    if (editingSub) {
      await updateSubscription(editingSub.id, subData);
    } else {
      await createSubscription(subData);
    }
    loadData();
  };

  const handleDeleteSub = async (subId) => {
    if (confirm("Delete this subscription?")) {
      await deleteSubscription(subId);
      loadData();
    }
  };

  const handleToggleStatus = async (subId) => {
    const sub = subscriptions.find(s => s.id === subId);
    if (!sub) return;
    const nextStatus = sub.status === 'active' ? 'paused' : 'active';
    await updateSubscription(subId, { ...sub, status: nextStatus });
    loadData();
  };

  const handleMarkPaid = async (subId) => {
    const updated = await markSubscriptionPaid(subId);
    if (updated) {
      loadData();
    } else {
      // Fallback
      setSubscriptions(prev => prev.map(s => {
        if (s.id === subId) {
          const d = new Date(s.nextBillingDate + 'T00:00:00');
          if (s.billingCycle === 'yearly') d.setFullYear(d.getFullYear() + 1);
          else if (s.billingCycle === 'quarterly') d.setMonth(d.getMonth() + 3);
          else if (s.billingCycle === 'weekly') d.setDate(d.getDate() + 7);
          else d.setMonth(d.getMonth() + 1);
          return { ...s, nextBillingDate: d.toISOString().split('T')[0] };
        }
        return s;
      }));
    }
  };

  const handleSimulateEmail = (sub) => {
    setSelectedSubForEmail(sub);
    setIsEmailModalOpen(true);
  };

  return (
    <div className="app-container">
      {/* Navbar Header */}
      <header className="navbar">
        <div className="brand">
          <div className="brand-icon">
            <Zap size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span className="brand-title">SubSync</span>
              <span style={{ fontSize: '0.68rem', padding: '0.15rem 0.4rem', background: 'var(--green-badge-bg)', color: 'var(--green-dark)', borderRadius: '4px', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                <Database size={10} /> Express + SQLite
              </span>
            </div>
            <div className="brand-subtitle">Smart Subscription Tracker</div>
          </div>
        </div>

        <div className="nav-actions">
          {/* Currency Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Globe size={16} color="var(--green-dark)" />
            <select 
              className="form-group"
              style={{ padding: '0.45rem 0.65rem', border: '1px solid var(--border-light)', borderRadius: '8px', background: 'var(--green-light)', fontWeight: '700', color: 'var(--green-dark)' }}
              value={prefs.currency}
              onChange={(e) => handleCurrencyChange(e.target.value)}
            >
              {Object.keys(CURRENCIES).map(code => (
                <option key={code} value={code}>{CURRENCIES[code].symbol} {code}</option>
              ))}
            </select>
          </div>

          {/* Notifications Bell */}
          <button className="btn-icon-only" onClick={() => setIsNotifDrawerOpen(true)} title="Alerts">
            <Bell size={18} />
            {urgentSubs.length > 0 && <span className="badge-dot">{urgentSubs.length}</span>}
          </button>

          {/* Backup */}
          <button className="btn btn-secondary" onClick={() => setIsExportModalOpen(true)}>
            <Download size={16} />
            <span>Backup</span>
          </button>

          {/* Add Subscription Button */}
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={18} />
            <span>Add Subscription</span>
          </button>
        </div>
      </header>

      {/* Streamlined Hero Spend Summary Banner */}
      <section className="spend-hero">
        <div className="spend-hero-main">
          <span className="spend-hero-label">Total Monthly Spending</span>
          <div className="spend-hero-amount">{spendMetrics.formattedMonthly}</div>
          <span className="spend-hero-sub">
            Across {spendMetrics.activeCount} active subscriptions (Avg {spendMetrics.formattedAvg}/service)
          </span>
        </div>

        <div className="spend-hero-stats">
          <div className="hero-stat-box">
            <div className="hero-stat-label">Projected Yearly</div>
            <div className="hero-stat-value">{spendMetrics.formattedYearly}</div>
          </div>
          <div className="hero-stat-box">
            <div className="hero-stat-label">Top Expense</div>
            <div className="hero-stat-value">{spendMetrics.highestSub.name}</div>
          </div>
        </div>
      </section>

      {/* Upcoming Renewals Strip */}
      {urgentSubs.length > 0 && (
        <section className="upcoming-strip">
          <div className="upcoming-header">
            <div className="upcoming-title">
              <Clock size={18} color="var(--accent-amber)" />
              <span>Upcoming Renewals Next 7 Days ({urgentSubs.length})</span>
            </div>
            <button 
              className="btn btn-secondary" 
              style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
              onClick={() => {
                setShowAdvancedTools(true);
                setAdvancedTab('calendar');
              }}
            >
              View Calendar
            </button>
          </div>

          <div className="upcoming-grid">
            {urgentSubs.map(sub => {
              const days = getDaysRemaining(sub.nextBillingDate);
              return (
                <div key={sub.id} className="upcoming-card">
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '0.92rem' }}>{sub.name}</div>
                    <div style={{ fontSize: '0.78rem', color: days < 0 ? '#B91C1C' : '#B45309', fontWeight: '700' }}>
                      {days < 0 ? `Overdue (${Math.abs(days)}d)` : days === 0 ? 'Due Today!' : `Due in ${days} days`}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: '800', color: 'var(--green-dark)' }}>
                      {formatCurrency(sub.amount, prefs.currency)}
                    </div>
                    <button 
                      style={{ background: 'transparent', border: 'none', color: 'var(--green-primary)', fontWeight: '700', fontSize: '0.75rem', cursor: 'pointer' }}
                      onClick={() => handleMarkPaid(sub.id)}
                    >
                      Mark Paid
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Streamlined Controls & Category Pills */}
      <section className="controls-simple">
        {/* Search */}
        <div className="search-simple">
          <Search size={16} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="Search subscriptions by name or notes..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Category Pills */}
        <div className="category-pills">
          <button 
            className={`cat-pill ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            All Services ({subscriptions.length})
          </button>
          {CATEGORIES.map(cat => {
            const count = subscriptions.filter(s => s.category === cat.id).length;
            if (count === 0 && activeCategory !== cat.id) return null;
            return (
              <button 
                key={cat.id} 
                className={`cat-pill ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Subscription Cards Grid */}
      <section className="subscriptions-grid">
        {filteredSubscriptions.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlignment: 'center', padding: '3rem', background: 'var(--bg-card)', borderRadius: '16px', border: '1px dashed var(--border-light)', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '0.5rem', fontWeight: '800' }}>No Subscriptions Found</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Try clearing your search or add a new subscription.</p>
            <button className="btn btn-primary" onClick={handleOpenAdd}>
              <Plus size={16} />
              <span>Add Subscription</span>
            </button>
          </div>
        ) : (
          filteredSubscriptions.map(sub => (
            <SubscriptionCard 
              key={sub.id}
              subscription={sub}
              currency={prefs.currency}
              onEdit={handleEdit}
              onDelete={handleDeleteSub}
              onToggleStatus={handleToggleStatus}
              onMarkPaid={handleMarkPaid}
              onSimulateEmail={handleSimulateEmail}
            />
          ))
        )}
      </section>

      {/* Collapsible Analytics & Smart Insights Box */}
      <section className="collapsible-box">
        <div 
          className="collapsible-header"
          onClick={() => setShowAdvancedTools(!showAdvancedTools)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <BarChart3 size={20} color="var(--green-dark)" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--green-dark)' }}>
              Analytics, Calendar & Saving Radar
            </h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '700' }}>
            <span>{showAdvancedTools ? 'Hide' : 'Expand Details'}</span>
            {showAdvancedTools ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </div>

        {showAdvancedTools && (
          <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)' }}>
            {/* Sub-tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <button 
                className={`btn ${advancedTab === 'analytics' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setAdvancedTab('analytics')}
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}
              >
                <BarChart3 size={15} />
                <span>Spend Breakdown</span>
              </button>

              <button 
                className={`btn ${advancedTab === 'calendar' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setAdvancedTab('calendar')}
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}
              >
                <CalendarIcon size={15} />
                <span>Monthly Calendar</span>
              </button>

              <button 
                className={`btn ${advancedTab === 'insights' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setAdvancedTab('insights')}
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}
              >
                <Sparkles size={15} />
                <span>Saving Tips</span>
              </button>
            </div>

            {/* Content */}
            {advancedTab === 'analytics' && <AnalyticsView subscriptions={subscriptions} currency={prefs.currency} />}
            {advancedTab === 'calendar' && <RenewalCalendar subscriptions={subscriptions} currency={prefs.currency} onSimulateEmail={handleSimulateEmail} />}
            {advancedTab === 'insights' && <InsightsRadar subscriptions={subscriptions} currency={prefs.currency} />}
          </div>
        )}
      </section>

      {/* Modals & Drawers */}
      <SubscriptionFormModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveSub}
        editingSubscription={editingSub}
      />

      <NotificationCenter 
        isOpen={isNotifDrawerOpen}
        onClose={() => setIsNotifDrawerOpen(false)}
        subscriptions={subscriptions}
        currency={prefs.currency}
        onSimulateEmail={handleSimulateEmail}
        browserNotifEnabled={prefs.enableBrowserNotifications}
        onToggleBrowserNotif={() => setPrefs(p => ({ ...p, enableBrowserNotifications: !p.enableBrowserNotifications }))}
      />

      <EmailSimulatorModal 
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        subscription={selectedSubForEmail}
        currency={prefs.currency}
      />

      <ExportImportModal 
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        subscriptions={subscriptions}
        onImport={(imported) => {
          setSubscriptions(imported);
          saveSubscriptions(imported);
        }}
        onResetDemo={() => loadData()}
      />
    </div>
  );
}
