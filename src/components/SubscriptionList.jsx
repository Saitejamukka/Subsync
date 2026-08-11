import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Grid, 
  List as ListIcon, 
  Plus, 
  CheckCircle2, 
  PauseCircle, 
  Edit3, 
  Trash2, 
  Mail,
  ArrowUpDown
} from 'lucide-react';
import SubscriptionCard from './SubscriptionCard';
import { CATEGORIES, BILLING_CYCLES } from '../constants';
import { getRenewalUrgency, formatCurrency } from '../utils/storage';

export default function SubscriptionList({
  subscriptions,
  currency,
  onEdit,
  onDelete,
  onToggleStatus,
  onToggleAutoRenew,
  onMarkPaid,
  onSimulateEmail,
  onOpenAddModal
}) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [cycleFilter, setCycleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('renewal'); // 'renewal', 'price-desc', 'price-asc', 'name'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

  // Filter & Sort Logic
  const filteredSubscriptions = useMemo(() => {
    return subscriptions
      .filter(sub => {
        const matchesSearch = sub.name.toLowerCase().includes(search.toLowerCase()) ||
          (sub.notes && sub.notes.toLowerCase().includes(search.toLowerCase()));
        const matchesCategory = categoryFilter === 'all' || sub.category === categoryFilter;
        const matchesCycle = cycleFilter === 'all' || sub.billingCycle === cycleFilter;
        const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
        return matchesSearch && matchesCategory && matchesCycle && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'renewal') {
          return new Date(a.nextBillingDate) - new Date(b.nextBillingDate);
        }
        if (sortBy === 'price-desc') {
          return Number(b.amount) - Number(a.amount);
        }
        if (sortBy === 'price-asc') {
          return Number(a.amount) - Number(b.amount);
        }
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        return 0;
      });
  }, [subscriptions, search, categoryFilter, cycleFilter, statusFilter, sortBy]);

  return (
    <div>
      {/* Controls Bar */}
      <div className="controls-bar">
        {/* Search */}
        <div className="search-box">
          <Search size={16} color="var(--text-secondary)" />
          <input 
            type="text" 
            placeholder="Search subscriptions or notes..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filters & Sorting */}
        <div className="filter-group">
          {/* Category Filter */}
          <select 
            className="select-input" 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          {/* Billing Cycle Filter */}
          <select 
            className="select-input" 
            value={cycleFilter} 
            onChange={(e) => setCycleFilter(e.target.value)}
          >
            <option value="all">All Cycles</option>
            {BILLING_CYCLES.map(c => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select 
            className="select-input" 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Sort By */}
          <select 
            className="select-input" 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="renewal">Soonest Renewal</option>
            <option value="price-desc">Highest Price First</option>
            <option value="price-asc">Lowest Price First</option>
            <option value="name">Name (A-Z)</option>
          </select>

          {/* View Toggle */}
          <div className="view-toggle">
            <button 
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <Grid size={16} />
            </button>
            <button 
              className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <ListIcon size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Content Rendering */}
      {filteredSubscriptions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">💳</div>
          <h3 style={{ marginBottom: '0.5rem', fontWeight: '700' }}>No Subscriptions Found</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
            {subscriptions.length === 0 
              ? 'Start tracking your recurring payments by adding your first subscription.' 
              : 'No subscriptions match your current search or filter criteria.'}
          </p>
          <button className="btn btn-primary" onClick={onOpenAddModal}>
            <Plus size={16} />
            <span>Add Subscription</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="subscriptions-grid">
          {filteredSubscriptions.map(sub => (
            <SubscriptionCard 
              key={sub.id}
              subscription={sub}
              currency={currency}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleStatus={onToggleStatus}
              onToggleAutoRenew={onToggleAutoRenew}
              onMarkPaid={onMarkPaid}
              onSimulateEmail={onSimulateEmail}
            />
          ))}
        </div>
      ) : (
        <div className="table-container">
          <table className="sub-table">
            <thead>
              <tr>
                <th>Service Name</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Billing Cycle</th>
                <th>Next Billing Date</th>
                <th>Status</th>
                <th>Payment Method</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubscriptions.map(sub => {
                const urgency = getRenewalUrgency(sub.nextBillingDate);
                const categoryObj = CATEGORIES.find(c => c.id === sub.category) || CATEGORIES[CATEGORIES.length - 1];
                return (
                  <tr key={sub.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div 
                          className="service-logo" 
                          style={{ width: '32px', height: '32px', fontSize: '0.8rem', background: sub.color || categoryObj.color }}
                        >
                          {sub.name.substring(0, 2).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: '700' }}>{sub.name}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ color: categoryObj.color, fontWeight: '600', fontSize: '0.85rem' }}>
                        {categoryObj.name}
                      </span>
                    </td>
                    <td style={{ fontWeight: '800' }}>
                      {formatCurrency(sub.amount, currency)}
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>{sub.billingCycle}</td>
                    <td>
                      <span style={{ color: urgency.color, fontWeight: '700' }}>
                        {sub.nextBillingDate} ({urgency.label})
                      </span>
                    </td>
                    <td>
                      <span className={`status-pill status-${sub.status}`}>
                        {sub.status}
                      </span>
                    </td>
                    <td>{sub.paymentMethod || 'Credit Card'}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.35rem' }}>
                        <button className="btn-icon-only" onClick={() => onSimulateEmail(sub)} title="Preview Email Alert">
                          <Mail size={14} color="#06B6D4" />
                        </button>
                        <button className="btn-icon-only" onClick={() => onEdit(sub)} title="Edit">
                          <Edit3 size={14} color="var(--text-secondary)" />
                        </button>
                        <button className="btn-icon-only" onClick={() => onDelete(sub.id)} title="Delete">
                          <Trash2 size={14} color="#EF4444" />
                        </button>
                        {sub.status === 'active' && (
                          <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => onMarkPaid(sub.id)}>
                            <CheckCircle2 size={12} color="#10B981" />
                            <span>Paid</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
