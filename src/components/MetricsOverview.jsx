import React from 'react';
import { 
  CreditCard, 
  Calendar, 
  TrendingUp, 
  PieChart 
} from 'lucide-react';
import { formatCurrency } from '../utils/storage';

export default function MetricsOverview({ metrics, currency }) {
  return (
    <div className="metrics-grid">
      {/* Monthly Spend */}
      <div className="metric-card">
        <div className="metric-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8B5CF6' }}>
          <CreditCard size={24} />
        </div>
        <div>
          <div className="metric-label">Monthly Spending</div>
          <div className="metric-value">{metrics.formattedMonthly}</div>
          <div className="metric-subtext">Normalized cost across active plans</div>
        </div>
      </div>

      {/* Projected Yearly */}
      <div className="metric-card">
        <div className="metric-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#06B6D4' }}>
          <Calendar size={24} />
        </div>
        <div>
          <div className="metric-label">Projected Yearly</div>
          <div className="metric-value">{metrics.formattedYearly}</div>
          <div className="metric-subtext">Estimated annual commitment</div>
        </div>
      </div>

      {/* Active Subscriptions */}
      <div className="metric-card">
        <div className="metric-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981' }}>
          <PieChart size={24} />
        </div>
        <div>
          <div className="metric-label">Active Subscriptions</div>
          <div className="metric-value">
            {metrics.activeCount} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/ {metrics.totalCount} total</span>
          </div>
          <div className="metric-subtext">Avg {metrics.formattedAvg} / service</div>
        </div>
      </div>

      {/* Highest Single Expense */}
      <div className="metric-card">
        <div className="metric-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B' }}>
          <TrendingUp size={24} />
        </div>
        <div>
          <div className="metric-label">Highest Expense</div>
          <div className="metric-value" style={{ fontSize: '1.25rem' }}>
            {metrics.highestSub.name}
          </div>
          <div className="metric-subtext">
            Costing {metrics.formattedHighest} / mo equivalent
          </div>
        </div>
      </div>
    </div>
  );
}
